# Social Virtual Lens Prototype

A 3D driving simulator that overlays social/intent signals from nearby vehicles (yield gaps,
decision prompts) on the windshield view.

## Run

```sh
npm install
npm run dev
```

- Simulator: http://127.0.0.1:5173/
- Sync relay: ws://127.0.0.1:5173/social-lens-sync

`npm run dev` runs a one-time `vite build` before serving (no hot-reload). Re-run it after editing
`index.html` or `src/` to see changes.
