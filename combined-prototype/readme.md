# Combined Prototype

Merges `center-console` and `social-virtual-lens`: keeps `center-console`'s console↔windshield
sync architecture (WebSocket relay, quick-action button console), but the windshield now runs
`social-virtual-lens`'s 5-scenario "Road Moment" system (yielding, emergency, compression,
right-of-way, hazard) with its scenario panel and decision panel, instead of center-console's
single Bohlman-Rd route scenario.

## Run the simulator (and combined preview)

```sh
npm install
npm run dev
```

- Simulator: http://127.0.0.1:5177/
- Console (combined preview): http://127.0.0.1:5177/console
- Sync relay: ws://127.0.0.1:5177/social-lens-sync

Cycle scenarios with the on-screen "Road Moment" list, or number keys 1-5.

## Run the console alone (e.g. on an iPad)

```sh
npm run console
```

Serves just the console UI on port 5178 (override with `CENTER_PORT`). Point it at a running
simulator with `?simHost=` / `?simPort=` / `?simWs=` query params if the simulator isn't on the
same host or default port.

## Known gaps (foundation, not final)

- The console's map/route rendering (`renderSimulatorState`, `maybeShowIncomingRequest` in
  `console/index.html`) is still hard-coded to center-console's old Bohlman-Rd route scenario, so
  route title/turn-request UI on the console won't reflect the new Road Moment scenarios yet.
- The console's quick-action buttons (Thanks/Sorry/Emergency/etc.) are still visual-only — no
  message is sent back to the simulator (same as in `center-console` today).
- `main.js`'s per-scenario status text (e.g. exact "Holding"/"Slowing"/"Merging" timing for the
  yielding scenario) was ported at the state/wiring level but not diffed line-by-line against
  `social-virtual-lens`'s more refined text-timing logic — worth a pass if it looks off.
- Dead CSS remains from center-console's old dashboard "Lane Assist" indicator (`.assist-status`,
  `.lane-mini`), safe to remove whenever convenient.
