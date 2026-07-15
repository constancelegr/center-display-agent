# Center Display Agent Prototypes

This repo hosts multiple independent prototypes, one per folder. Each folder is self-contained
with its own `package.json`/dependencies and its own `readme.md` with setup instructions.

- [`center-console/`](center-console/readme.md) — driving simulator + CarPlay-style center
  console display, synced over WebSocket.
- [`social-virtual-lens/`](social-virtual-lens/readme.md) — driving simulator overlaying social
  intent signals from nearby vehicles.
- [`combined-prototype/`](combined-prototype/readme.md) — merges the two above: center-console's
  console↔windshield sync, with social-virtual-lens's Road Moment scenarios driving the windshield.
- [`center-display-agent/`](center-display-agent/readme.md) — not yet built
