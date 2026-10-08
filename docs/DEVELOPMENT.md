# Development & testing

## Requirements

- Python 3 (build)
- Node.js (checks and simulators)
- Google Chrome (browser part of the smoke test; skipped if absent)
- Pillow + NumPy only if you regenerate sprites with `tools/make_*_sprites.py`

## Workflow

1. Edit sources in `game/` (or art in `assets/realistic/*-sources/`).
2. `python3 build.py`
3. `tools/smoke.sh` — must end with **Smoke test passed**.
4. Commit sources **and** the rebuilt `offline/` together.

## Smoke test

`tools/smoke.sh` runs, in order:

1. **build** — `build.py`
2. **parse** — `node --check` on the sources and the assembled page script
3. **node checks** — every `tools/*_check.js`
4. **campaigns** — `node tools/sim.js check 4 normal`, requires zero errors
5. **browser battles** — headless Chrome on each review route; fails on any script error. Screenshots land in `tools/smoke-out/` (git-ignored)

## Individual checks

| Script | Covers |
|---|---|
| `battle_completion_check.js` | Long battles finish without blocking the event loop |
| `battle_controls_check.js` | Orders, deployment, held position, range/reload/masking gates |
| `battle_feel_check.js` | Bayonet and ready poses render |
| `battle_visual_check.js` | Formation spacing, casualty scatter bounds |
| `bayonet_check.js` | Bayonet cost, gating, melee bonus, cavalry defence |
| `engagement_check.js` | Help, doctrine movement, recovery, battle reports, selection |
| `gun_crew_check.js` | Per-crew casualties and firing stop |
| `hill_projection_check.js` | Hill elevation and click projection |
| `range_check.js` | Weapon ranges per unit type |
| `sound_check.js` | Drum synthesis, volumes, ducking, scheduler lifecycle |
| `startup_check.js` | One opening image, deferred loads, 2MP canvas cap |

## Simulators

```bash
node tools/sim.js check 10 normal   # headless campaigns; report errors/outcomes (needs a prior build)
node tools/sim.js train ...         # evolve rival brains → game/brains.json
node tools/battletune.js 60         # balance matrix; rerun after changing battle mechanics
```

The balance reference table is in [DESIGN.md](DESIGN.md).

## Asset export

```bash
python3 build.py
python3 tools/export_server.py      # then open http://localhost:8766/index.html#export
```

See [assets/README.md](../assets/README.md).

## Not covered by automation

Physical-phone frame rate, touch feel, and listening on real speakers. Check these by hand on a device after visual or audio changes.
