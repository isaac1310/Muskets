# Development & testing

## Requirements

- Python 3 (build)
- Node.js (checks and simulators)
- Google Chrome (browser part of the smoke test; absence fails unless explicitly skipped)
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
5. **browser battles** — headless Chrome on each review route; checks server startup, browser exit, a newly produced screenshot, and script errors. Screenshots land in `tools/smoke-out/` (git-ignored)

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
node tools/battletune.js 16         # paired seeds 1740–1755; optional matchup substring
SEED=2000 node tools/battletune.js 60 # independent seed set
node tools/battle_perf.js           # simulation-only median/p95 timing; not renderer FPS
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

## Separate browser verification

Use `SKIP_BROWSER=1 tools/smoke.sh` only when verifying the game through another browser workflow. This reports **Core smoke checks passed; browser checks explicitly skipped**, not a complete browser pass. `TURNS=12` can bound the campaign portion for a short integration run; omit it for the normal up-to-120-season run.

`tools/sweep_check.js` covers artillery range/hold, firing cohorts, flank geometry, melee at walls, abandoned guns, road/river merges, stale envoys, unpaid-wage splitting and siege advice. Animation/startup checks cover moving action poses, mounted weapons, pause and terrain decoding before combat. See [the October 15 sweep](GRAPHICS_GAMEPLAY_SWEEP.md) for completed findings, balance evidence and validation limits.

The sweep regression also covers symmetric terrain access, in-bounds compact-fort deployment at the practice limit, turn/rear-fire gating, sideways firing obstruction, overlay priority, arrival interpolation, multiple completion effects and reduced motion.
