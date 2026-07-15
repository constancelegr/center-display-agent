# Center Console Prototype

A 3D driving simulator paired with a CarPlay-style center console display, kept in sync over a WebSocket relay.

## Run the simulator (and combined preview)

```sh
npm install
npm run dev
```

- Simulator: http://127.0.0.1:5175/
- Console (combined preview): http://127.0.0.1:5175/console
- Sync relay: ws://127.0.0.1:5175/social-lens-sync

## Run the console alone (e.g. on an iPad)

```sh
npm run console
```

Serves just the console UI on port 5176 (override with `CENTER_PORT`). Point it at a running
simulator with `?simHost=` / `?simPort=` / `?simWs=` query params if the simulator isn't on the
same host or default port.
