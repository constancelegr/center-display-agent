import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocket, WebSocketServer } from "ws";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "dist");
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "0.0.0.0";
const syncPath = "/social-lens-sync";
const syncClients = new Set();
const syncRelay = new WebSocketServer({ noServer: true });
const cachedSimulatorStateMaxAge = 3000;
const activeSimulatorSourceMaxAge = 2500;
let lastSimulatorStateMessage = null;
let lastSimulatorStateReceivedAt = 0;
let activeSimulatorSource = null;
let hasSeenTaggedSimulatorSource = false;
let nextSyncSocketId = 0;

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"]
]);

const handleRequest = async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host}`);
    const decodedPath = decodeURIComponent(requestUrl.pathname);
    const safePath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
    let filePath = resolve(join(root, safePath));

    if (!filePath.startsWith(root)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const fileStat = await stat(filePath).catch(() => null);
    if (fileStat?.isDirectory()) {
      const directoryIndex = join(filePath, "index.html");
      const directoryIndexStat = await stat(directoryIndex).catch(() => null);
      filePath = directoryIndexStat?.isFile() ? directoryIndex : join(root, "index.html");
    } else if (!fileStat) {
      filePath = join(root, "index.html");
    }

    const body = await readFile(filePath);
    const type = mimeTypes.get(extname(filePath)) || "application/octet-stream";
    response.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": type.includes("html") ? "no-store" : "public, max-age=31536000, immutable"
    });
    response.end(body);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`Server error: ${error.message}`);
  }
};

function getSimulatorSource(parsedMessage, socket) {
  const source = parsedMessage?.source && typeof parsedMessage.source === "object" ? parsedMessage.source : {};
  const startedAt = Number(source.startedAt);
  return {
    id: typeof source.id === "string" && source.id ? source.id : `legacy-${socket.syncClientId}`,
    startedAt: Number.isFinite(startedAt) && startedAt > 0 ? startedAt : 0,
    socket
  };
}

function setActiveSimulatorSource(source, receivedAt) {
  activeSimulatorSource = {
    id: source.id,
    startedAt: source.startedAt,
    socket: source.socket,
    lastReceivedAt: receivedAt
  };
}

function shouldAcceptSimulatorState(parsedMessage, socket) {
  const receivedAt = Date.now();
  const source = getSimulatorSource(parsedMessage, socket);
  if (source.startedAt) {
    hasSeenTaggedSimulatorSource = true;
  } else if (hasSeenTaggedSimulatorSource) {
    return false;
  }

  const activeIsFresh =
    activeSimulatorSource?.socket?.readyState === WebSocket.OPEN &&
    receivedAt - activeSimulatorSource.lastReceivedAt <= activeSimulatorSourceMaxAge;

  if (!activeIsFresh) {
    setActiveSimulatorSource(source, receivedAt);
    return true;
  }

  if (source.id === activeSimulatorSource.id) {
    setActiveSimulatorSource(source, receivedAt);
    return true;
  }

  if (source.startedAt && (!activeSimulatorSource.startedAt || source.startedAt > activeSimulatorSource.startedAt)) {
    setActiveSimulatorSource(source, receivedAt);
    return true;
  }

  return false;
}

syncRelay.on("connection", (socket) => {
  socket.syncClientId = ++nextSyncSocketId;
  syncClients.add(socket);
  if (lastSimulatorStateMessage && Date.now() - lastSimulatorStateReceivedAt < cachedSimulatorStateMaxAge) {
    socket.send(lastSimulatorStateMessage);
  }

  socket.on("message", (data) => {
    const message = data.toString();
    let parsedMessage = null;
    try {
      parsedMessage = JSON.parse(message);
    } catch {
      parsedMessage = null;
    }
    if (parsedMessage?.type === "SIMULATOR_STATE") {
      if (parsedMessage.protocolVersion !== 9) return;
      if (!shouldAcceptSimulatorState(parsedMessage, socket)) return;
      lastSimulatorStateMessage = message;
      lastSimulatorStateReceivedAt = Date.now();
    }

    for (const client of syncClients) {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  const handleSocketEnd = () => {
    syncClients.delete(socket);
    if (activeSimulatorSource?.socket === socket) activeSimulatorSource = null;
  };

  socket.on("close", handleSocketEnd);
  socket.on("error", handleSocketEnd);
});

function attachSyncRelay(httpServer) {
  httpServer.on("upgrade", (request, socket, head) => {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host}`);
    if (requestUrl.pathname !== syncPath) {
      socket.destroy();
      return;
    }

    syncRelay.handleUpgrade(request, socket, head, (websocket) => {
      syncRelay.emit("connection", websocket, request);
    });
  });
}

const server = createServer(handleRequest);
attachSyncRelay(server);
server.listen(port, host, () => {
  console.log(`Social Lens simulator running at http://localhost:${port}/`);
  console.log(`Social Lens sync relay available at ws://localhost:${port}${syncPath}`);
});

if (host === "0.0.0.0") {
  const ipv6LoopbackServer = createServer(handleRequest);
  attachSyncRelay(ipv6LoopbackServer);
  ipv6LoopbackServer.on("error", (error) => {
    if (error.code !== "EADDRINUSE" && error.code !== "EAFNOSUPPORT") {
      console.warn(`IPv6 localhost listener unavailable: ${error.message}`);
    }
  });
  ipv6LoopbackServer.listen(port, "::1");
}
