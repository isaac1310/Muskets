# Architecture

Musket & Crown is a single HTML page with everything — code, art, audio — inlined. No framework, no server, no runtime dependencies. Fonts come from Google Fonts when online and fall back to system serif offline.

## Build pipeline

```
game/shell.html ──────────────┐
game/script.js                │
  ├─ /*__BATTLE__*/  ← battle.js         build.py
  ├─ /*__SOUND__*/   ← sound.part.js   ─────────────►  game/musket-crown.html   (single file, git-ignored)
  ├─ /*__REALISTIC_ART__*/ ← assets/realistic/** as base64 data URIs
  └─ /*__DEFAULT_POP__*/   ← brains.json                 offline/index.html      (PWA, committed, deployed)
                                                          offline/sw.js           (cache key = md5 of page)
```

`build.py` rewrites the service worker's cache name (`musket-crown-<hash>`) on every build, so an installed copy picks up a new version on the next online visit.

## Runtime modules

| Module | Responsibility | Key entry points |
|---|---|---|
| `script.js` — campaign | Map generation (~100 provinces, rivers, villages, free cities), seasons, economy, diplomacy, rival AI | `newGame`, `endTurn`, `aiTurn` |
| `script.js` — rendering | Map canvas, army markers, battle canvas, camera, effects, ground damage | `draw`, `drawBattle`, `drawGround`, `drawSiegeSite`, `drawPaintedFig` |
| `battle.js` | Deterministic battle simulation; no DOM, so Node tools `eval` it directly | `makeBattle`, `stepBattle`, `runToEnd` |
| `sound.part.js` | Web Audio synthesis: music, drums, volleys, cannon; separate Music and Battle buses | `SND.music`, `SND.marchDrum` |
| `brains.json` | Rival "genomes" (aggression, spending, fortifying, expansion, trade) evolved by `tools/sim.js train` | `DEFAULT_POP` |

Instant (unwatched) battles use the same `makeBattle` model as watched ones, run in bounded async batches so the UI never blocks.

## State and storage

Saves and preferences live in `localStorage` via `load`/`store` (wrapped in try/catch). Nothing leaves the device.

## Offline / PWA

`offline/sw.js` caches `index.html`, the manifest and icons. Navigations are network-first (newest build when online), falling back to the cache when offline. Other same-origin GETs are cache-first.

## Test hooks

- `/*__TEST__*/` in `script.js` is replaced by Node tools to expose internals (`globalThis.__t`).
- URL hashes open deterministic scenes for screenshots: `#practice`, `#practice-fire`, `#practice-close`, `#review-fort`, `#review-forest`, `#review-river`, `#review-hills`, `#review-map`, and `#export` (asset export, local only).
