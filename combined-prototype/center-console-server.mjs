import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "console");
const port = Number(process.env.CENTER_PORT || process.env.PORT || 5176);
const host = process.env.HOST || "0.0.0.0";

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

async function handleRequest(request, response) {
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
      filePath = join(filePath, "index.html");
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
    response.end(`Center console server error: ${error.message}`);
  }
}

function getLanAddresses() {
  return Object.values(networkInterfaces())
    .flat()
    .filter((address) => address && address.family === "IPv4" && !address.internal)
    .map((address) => address.address);
}

const server = createServer(handleRequest);
server.listen(port, host, () => {
  console.log(`Center console running at http://localhost:${port}/`);
  for (const address of getLanAddresses()) {
    console.log(`iPad URL: http://${address}:${port}/`);
  }
});

if (host === "0.0.0.0") {
  const ipv6LoopbackServer = createServer(handleRequest);
  ipv6LoopbackServer.on("error", (error) => {
    if (error.code !== "EADDRINUSE" && error.code !== "EAFNOSUPPORT") {
      console.warn(`IPv6 localhost listener unavailable: ${error.message}`);
    }
  });
  ipv6LoopbackServer.listen(port, "::1");
}
