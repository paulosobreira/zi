# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Two processes must run simultaneously:

```bash
# Backend — WebSocket server, port 3001
node --watch src/server/index.js

# Frontend — static file server, port 3000
python3 -m http.server 3000 --directory public
```

No build step, no bundler, no test runner, no linter configured. PixiJS 7 is vendored at `public/js/pixi.mjs` — never import from CDN (corporate network blocks cdn.jsdelivr.net).

## Architecture

Zeus Interestelar is an async multiplayer space exploration game. The server owns all game state; the client only sends intentions and renders.

### Backend (`src/server/`)

Node.js + `ws` package. Runs a **tick engine** at 1s real-time intervals:
1. `simulatedTime += 1000` (1000× real time — makes slow orbits visible)
2. Recalculate all orbital positions with elliptic formula
3. Advance active movements along their bezier curve
4. Broadcast `STATE_UPDATE` to all clients

In-memory state only (POC): `sim.sessions`, `sim.players`, `sim.fleets`, `sim.movements`, `sim.bodies`. No disk persistence — server restart wipes everything.

### Frontend (`public/`)

Native ES modules, no bundler. Module responsibilities:

| Module | Responsibility |
|--------|---------------|
| `main.js` | WebSocket lifecycle, login flow, ticker, wires all modules |
| `renderer.js` | PIXI layers: orbitLayer → bodyLayer → ringLayer → fleetLayer |
| `camera.js` | Pan, zoom-to-cursor, centerOn, fitSystem |
| `input.js` | Mouse events, hit-detection, pan drag |
| `contextMenu.js` | HTML overlay context menu |
| `particles.js` | Belt particles (3 zoom modes) + Saturn rings (14 bands / 2240 particles) |
| `nameplates.js` | Planet labels in screen space (outside camera container) |

`nameplateLayer` must live on `app.stage`, **not** inside the camera container — position is converted world→screen manually every frame. Putting it inside the camera container causes labels to shrink on zoom-out.

### Orbital Physics

Elliptic position — used server-side per tick and client-side per frame:
```
θ = (2π × simulatedTime / (orbitalPeriodDays × 86400) + orbitalPhase) mod 2π
r = semiMajorAxis × (1 - e²) / (1 + e × cos(θ))
```
Bodies with `orbitalPeriod = 0` (Sun, belts) must early-return `{x: centerX, y: centerY}` to avoid division-by-zero NaN.

The client extrapolates `simulatedTime` locally at 60fps (`lastSimulatedTime + (performance.now() - lastWallTime)`) to produce smooth animation between 1s STATE_UPDATEs. Fleet orbit and travel bezier positions are recalculated client-side every frame with this value.

### WebSocket Protocol

All messages are JSON. Client→server: `{ type: "COMMAND", action, payload }`. Server→client: `{ type, payload }`.

Connection flow: client sends `HELLO` → server responds `WELCOME` then immediately pushes `SYSTEM_DATA` + `FLEET_DATA` (no polling needed). Server broadcasts `STATE_UPDATE` every tick. Client sends `MOVE_FLEET` to request movement; server responds `MOVE_STARTED`.

For belt destinations, `MOVE_FLEET` must include `arrivalPosition: {x, y}` (world coords of the click). Server projects it onto the belt's mid-radius.

### PixiJS 7 API Notes

Using **v7**, not v8. Correct API: `beginFill(color) / endFill()`, `drawCircle(x, y, r)`, `drawEllipse(x, y, radiusX, radiusY)`.

`drawEllipse` center offset: the Sun (focus) is at `centerX`; the ellipse center is at `centerX - a*eccentricity`. Getting the sign wrong puts planets off their drawn orbits.

Canvas reference: `app.view || app.canvas || document.querySelector('#game canvas')` — use triple fallback.

Context menu: use `justShown` flag + `setTimeout(..., 0)` to prevent the same click event that opens the menu from immediately closing it via document-level listener. `hide()` sets `currentAction = null` — always save the reference to a local variable before calling `hide()`, otherwise the callback is lost: `const saved = currentAction; hide(); if (saved) saved(action, body)`.

For callbacks exposed from factory functions (e.g. `createRenderer()`), use getter/setter — not shorthand property — to maintain closure binding.
