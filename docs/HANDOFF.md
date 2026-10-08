# Musket & Crown — developer handoff

**Current project:** repository root (`isaac1310/Muskets`)  
**Updated:** 1 October 2026  
**Purpose:** Carry the finished game changes into a new artifact without losing the artwork, battle behavior, sound, or offline build.

## Read this first

The browser tab showing `game/shell.html` is showing the **source shell**, not the assembled game. Open `game/musket-crown.html` to run the single-file game, or `offline/index.html` for the installable offline build. `build.py` generates both. Edit the source files below, then run `python3 build.py`; do not edit the generated HTML directly.

| Source | Responsibility |
|---|---|
| `game/shell.html` | Page markup, layout, settings controls, battle zoom buttons, **View fort** button |
| `game/script.js` | Campaign, map and battle rendering, camera, visual effects, practice battles |
| `game/battle.js` | Battle simulation, movement, combat, fort walls and balance |
| `game/sound.part.js` | Procedural music and effects through Web Audio |
| `assets/realistic/` | Painted portraits, backgrounds and editable transparent unit art |
| `tools/make_unit_sprites.py` | Generates national WebP unit variants from transparent PNG sources |
| `build.py` | Embeds the art and source code; writes `game/musket-crown.html`, `offline/index.html` and a new offline cache key |

`docs/DESIGN.md`, `docs/CHECKLIST.md` and `assets/README.md` contain the feature details and asset inventory. Preserve the player's requested **separate Music and Battle sounds sliders**.

## Artwork completed

- Corrected the title painting's British flag to the 1740 Union flag, without the red St Patrick saltire. The Prussian eagle colour was kept.
- Added six painted monarch portraits in `assets/realistic/portraits/`, a painted title scene, and a textured battlefield ground.
- Reworked national figures to read clearly by coat colour at small size. `assets/realistic/unit-sources/` holds editable transparent PNG poses. `assets/realistic/units/` holds compact WebP sprites, including seven national variants for regular infantry, marching infantry, cavalry, galloping cavalry, artillery, limbered howitzers, drummers, and fallen infantry. Militia and hussars also have standing and moving poses. Keep **hussar mercenaries** and **militia** in the new artifact.
- Battalions have officers, colour bearers and larger drummers with hip drums and reversed colours. Generals ride with two aides. Flags wave in period national designs; cavalry standards are smaller.
- The map's army markers now have raised shaded national bases, cast shadows, troop counts, composition bars and painted miniature infantry, horse or gun figures. This is a **3D-style canvas treatment**, not rotatable 3D geometry. Preserve province names, building symbols and map zoom around the markers.
- Battlefield figures are larger; march and gallop poses alternate with motion bobbing. A national fallen-infantry painting is stamped on the ground after a casualty. Horse and gun remains are drawn by the game.
- Terrain has a textured ground, road, trees, hills, river, soft shadows and distance haze. Smoke uses layered soft stamps and drifts while fading. Craters have scorched centres, raised rims, cracks and debris.
- The battle scene now embeds transparent oak and pine paintings (`assets/realistic/trees/`) and timber and stone house paintings (`assets/realistic/buildings/`). `drawGround` places upright trees with cast shadows, worn road tracks, riverbanks, ripples, reeds and a ford. `drawSiegeSite` places painted houses inside forts and a planned street grid inside cities. Shells near houses char the roof and scatter debris. The original full-resolution paintings are in the matching `*-sources/` folders.
- Stone star forts show shaded ramparts, masonry, crenellations, embrasures, defensive guns, stores and roofed buildings. Wooden forts have a ditch, pointed stakes, timber grain, guns and stores. City walls have towers, battlements, masonry courses, streets, buildings and guns. Hits chip the wall; heavy shells can leave a dark opening with rubble.
- Destroyed artillery leaves a broken barrel, loose wheels, splintered carriage and scorch mark. These effects are painted into the persistent battlefield ground canvas.

## Battle view and behavior

- The **View fort** button appears only when a battle has a stone fort, wooden fort or city walls. It frames the complete defense, including the top rampart. **Follow** returns to the normal army camera. The view supports the three fort types and has been visually checked.
- Battle controls support Stand / Wait at the start, single and multi-selection, group orders, tap-to-target/move, pinch, drag, wheel, + / − and Follow. A drag should not select a unit. `tools/battle_controls_check.js` confirmed that unbroken player units hold position for 10 simulated seconds at battle start.
- Battle balance was tuned in `game/battle.js`: cavalry flanking is useful, howitzers targeting walls are the strongest siege option, and regular infantry beats equal-cost militia. The measured table in `DESIGN.md` is the reference; do not change combat values while integrating art unless a new balance run is planned.
- Six free cities were found in each of 50 generated-map checks. Cadet, Colonel and Field Marshal had 93%, 62% and 43% survival in 100-campaign samples. The offline service-worker cache was also fixed and checked by loading its cached page after stopping the local server.

## Sound and music

Everything in `game/sound.part.js` is synthesized locally so the game remains offline-capable. There are distinct home, campaign and battle fife phrases, four-chord progressions, bass pulse, snare and bass drums, strings and brass. Mode changes fade the music bus. Moving battalions with a living drummer trigger a restrained marching cadence. Effects include layered cannon reports, rolling musket fire, shells, clashes, hooves, neighs, bugle, commands, ambience and subtle wounded voices. Separate buses, throttles and a compressor limit crowded battles.

**Audio parses and a 20-second stereo render has zero clipped samples (peak 0.524). Subjective listening on physical devices remains unverified.** Keep both Music and Battle sounds sliders and their saved settings.

## Where to find the implementation

| Feature | Main location |
|---|---|
| National sprite embedding | `build.py`; `tools/make_unit_sprites.py` |
| Battle terrain, trees, houses and forts | `drawGround`, `drawSiegeSite`, `paintHouseDamage` in `game/script.js`; `art["trees"]` and `art["buildings"]` in `build.py` |
| Craters, destroyed cannon, wall breaches, fallen figures | `paintCrater`, `paintDestroyedGun`, `paintWallBreach`, `fxOf`, `body` in `game/script.js` |
| Painted figures, flags, drummer | `drawBattleFlag`, `drawPaintedFig`, `drawBattle` in `game/script.js` |
| View fort camera and control | `camFort`, battle button handler in `game/script.js`; `#bzfort` in `game/shell.html` |
| 3D-style army map markers | `draw` in `game/script.js`, in the `S.armies` loop |
| Music and marching drum | `SND.music`, `SND.marchDrum` in `game/sound.part.js` |
| Wall HP, gun damage, flank and militia rules | `game/battle.js` |

## Integration steps for the new artifact

1. Treat the source files and painted assets above as the current version. Transfer the behavior and assets into the new artifact's structure; do not copy only the generated HTML or only the screenshots.
2. Include national WebP variants, the fallen-infantry sprite, portraits, title scene and ground texture. If a source PNG changes, regenerate sprites with `tools/make_unit_sprites.py` before building. That script needs Pillow and NumPy; `build.py` itself does not.
3. Keep the simulated fort wall coordinates aligned with the rendered defenses. `game/battle.js` uses `nearWall` and `wallPoint`; `game/script.js` draws and damages the matching fort shapes. If the new artwork moves a wall, update both sides.
4. Preserve the save format, campaign state, rival brains, free cities, difficulty, battle controls, music settings and offline service worker. The new presentation should still work at phone width.
5. Rebuild with `python3 build.py`. The built script, single-file game and offline copy should all be checked before replacing the existing artifact.

## Checks already run, and checks to repeat after integration

- `python3 build.py` succeeds; latest build is about 5 MB and includes the artwork inline.
- Source and assembled JavaScript parse with `node --check`.
- `node tools/sim.js check 10 normal` completed with **0 errors**. This short run is a smoke test, not a new balance estimate.
- `node tools/battle_controls_check.js` passed the 10-second Stand / Wait check.
- `DESIGN.md` records the last full balance sweep: 60 battles per matchup, 120-battle even-match samples and an additional 360-battle large even sample. Re-run `node tools/battletune.js 60` if battle mechanics change.
- Desktop browser screenshots were inspected for the map, close battle, stone star fort, wooden fort and city walls. See the preview files below. Touch gestures and actual frame rate on a mid-range phone still need device verification.
- Physical-device listening and human-player balance remain unverified. Four-frame infantry/militia walking and animated surviving gun crews are now integrated; more elaborate running and loading poses are optional future art.

## Visual previews

- `screenshots/review-home.png` — painted title scene.
- `screenshots/review-map-phone.png`, `screenshots/review-map-desktop.png`, `screenshots/review-map-3d.png` — province names and the updated map army markers.
- `screenshots/review-battle-mid.png`, `screenshots/review-battle-fire-final.png`, `screenshots/review-battle-close-latest.png`, `screenshots/review-battle-enlarged.png` — battlefield, firing, movement and larger figures.
- `screenshots/review-fort-detail.png`, `screenshots/review-wooden-fort.png`, `screenshots/review-city-walls.png` — the three **View fort** close-ups.
- `screenshots/review-forest-new.png`, `screenshots/review-river-new.png`, `screenshots/review-fort-new.png` — scene sweep references with the new trees, river treatment and fort buildings.
- `screenshots/review-fort-final-sweep.png`, `screenshots/practice-fire-final-sweep.png`, `screenshots/practice-close-final-sweep.png` — final art-pass checks for houses, action poses, casualties and effects.
- `screenshots/review-offline.png` — cached offline build.

The preview images are evidence and references. The live art comes from `game/script.js` and `assets/realistic/`.

## Subsequent battle art pass (October 2026)

- `assets/realistic/unit-sources/` includes regular and militia action poses, cavalry and hussar alternate gallop and melee poses, officers, general, aide, gun crew, deployed howitzer and fallen figures. `tools/make_unit_sprites.py` creates national WebP variants. Seven painted standards are in `assets/realistic/standard-sources/` and `standards/`; rebuild them with `tools/make_standard_sprites.py`.
- `drawPaintedFig` selects firing, reloading, bayonet, fleeing, gallop and melee poses from battle state. Deployed howitzers use their own painting. Each gun now deploys three separate crew targets in `game/battle.js`; casualties disappear from the gun and a depleted crew slows or stops firing. Preserve the `addGun`, `targets`, `kill` and gun reload changes together when integrating.
- `assets/realistic/building-sources/` and `buildings/` have matching ruined timber and stone buildings. Shell hits switch the building painting. `assets/realistic/effect-sources/` and `effects/` add painted impact dust, cannon flash and wall rubble. Rebuild these assets with `tools/make_building_sprites.py` and `tools/make_effect_sprites.py`.
- Wall faces now have staggered masonry joints or timber grain. Hills have shaded slopes; dig-in earthworks have a mound, stakes and turf. Projectile trails, selection rings, banners and wall strength display have clearer detail.
- A further hill pass gives the ground a raised projection with matching figure positions. `P` and `UP` now share a localized hill-height function; `projectHillGround` caches the warped ground and refreshes after craters, casualties and wall damage. The `#review-hills` URL opens a deterministic hill preview. Infantry and militia now use four newly painted walking frames, replacing the interim mirrored-leg animation. Source sheets and individual frames are saved under `assets/realistic/unit-sources/`.
- The hill crest moved under the forward formations; a sorted front-slope layer now covers figures behind it. The standalone `game/musket-crown.html` gained the viewport metadata already present in the offline build; a real 390-pixel mobile emulation showed a 390-pixel document, 360-pixel canvas and 358-pixel control area with no horizontal overflow. Keep the metadata in `game/shell.html` when integrating.
- The latest assembled game is about 9.6 MB. Source JavaScript parses; Stand / Wait, gun-crew and hill projection checks pass; a 10-campaign normal smoke run recorded zero simulation errors. Desktop and mobile viewport screenshots were inspected. Distinct movement paintings are integrated. Physical-device frame-rate and subjective audio checks remain unverified.

## Final implementation pass — 4 October 2026

- Default live simulation pace is 0.75, with speed choices 0.5×, 1×, 2× and 4×. A one-time `battlePaceVersion: 2` preference migration sets speed to 1 while preserving audio sliders. Foot speed is 3.2, cavalry 12; reloads are 6.4 infantry, 9.5 field gun and 9 howitzer, with melee lethality 0.28.
- Pause / orders (or Space when focus is outside controls) freezes battle time and effects while allowing orders. Retreat resumes time. Canvas fitting follows the actual field height with a ResizeObserver, preserving ground damage and keeping controls visible.
- Four painted walk frames for each national infantry and militia, cyclic horse poses, moving gun crews, painted stone/timber surfaces, river motion and crossing wakes, longer staged explosions and airborne debris are integrated. All assets are embedded in both built game files.
- Music has phrase variation, a softer filtered mix and slower battle tempo. Cannon, explosions and volleys briefly duck music. Music and Battle sounds remain independent.
- Verification: source syntax; battle controls, gun crew and hill projection checks; 10 normal campaign simulations with zero errors; browser pause/order/resume check; no browser exceptions; desktop and 390×844 layout previews. An offline 20-second stereo audio render measured peak 0.524, RMS 0.044, zero clipping. `docs/audio/battle-sound-preview.wav` is the rendered sample.
- Small unseeded 12-trial matchup samples put matched infantry and mixed-army fights around 1½–2⅓ minutes at normal live speed, with longer sieges. These are pacing checks, not definitive balance results. Physical-phone performance and subjective listening were not measured.
- Latest previews: `screenshots/review-final-battle.png`, `screenshots/review-final-fort.png`, `screenshots/review-final-phone.png`. Rebuild with `python3 build.py` after source changes.

## Review recommendations implemented — 5 October 2026

- `runToEnd` now runs through the 600-second deadline plus rout, verifies completion and returns the battle. The matchup tool rejects unfinished trials. Added `tools/battle_completion_check.js`.
- Uncrewed guns are visibly dimmed, cannot contribute fighting strength and count as losses (including garrison guns). Partially staffed guns retain strength but reload more slowly.
- Instant campaign resolution now uses `makeBattle`, the same combat model and casualty conversion as watched battles. Interactive instant resolution yields between simulation chunks. Player orders can still change a watched outcome. This intentionally replaces the older formula and may change campaign balance.
- Desktop orders move to a sidebar, freeing vertical room for larger figures. Phone controls begin with unit selection; Army orders exposes all group commands. Buttons are larger. Infantry ranks of battalions are separated more, cavalry formations have at most eight columns, and cavalry starts behind infantry. Trees fade when covering selected formations.
- Selected units show status and morale above their formation; the panel shows fatigue and nominal reload countdown. Abandoned batteries are identified explicitly.
- Rally nearby gives formations within 150 units of a living commander +18 morale, with a 60-simulation-second cooldown. Low-morale, deployment, abandonment, breach and rout events feed feedback; battle results list recent unique turning points.
- Guided skirmish in Practice battle starts paused and walks through infantry Advance, Resume and cavalry Flank. It leaves campaign armies untouched. It is an introductory skirmish, not a complete siege tutorial.
- Defending militia receives 20% extra protection in forests/fortifications or when dug in. Howitzer reload is now 11.5 seconds, wall damage 8 per shell, and special wall-gun blast damage is restricted to 1.5 times the shell radius instead of 75 units. Small siege trials are diagnostic, not proof of final balance.
- Distinct restrained sound cues accompany morale warnings, deployment and breaches. Both volume sliders remain. Physical phone speaker listening cannot be verified from this workspace.

## Crash report follow-up — 5 October 2026

The user's in-app tab reported “This page crashed”. Its local-file diagnostics were inaccessible under browser security policy, so the exact renderer-crash cause is unconfirmed. Fixed a concrete freeze path: Skip to result previously executed the entire remaining battle synchronously with effect callbacks. It now resolves in bounded batches, yields to the event loop, temporarily disables effects and prevents concurrent orders. Instant campaign resolution shares this bounded asynchronous runner. Canvas pixel density is capped at 2 to limit backing-store memory. Rebuilt both artifacts. The long-battle regression passes through 600 simulated seconds with 151 event-loop yields; existing crew, controls and hill checks pass. No claim of an in-app browser reproduction or verified crash recovery.

### Opening-screen clarification
The user confirmed the crash occurred on opening. Startup previously assigned every battlefield image source immediately and each unit-image load redrew the hidden campaign map. Battlefield sources now stay queued until leaving Home, with four concurrent loads and coalesced map redraws. Home canvas is capped at two million pixels even on large/high-density displays. `tools/startup_check.js` checks a full assembled-script boot with mocked images at 3840×2160/DPR3: one opening image load, deferred battlefield queue, four decode slots, no duplicate startup, capped canvas. The exact native renderer-crash cause remains unverified because local-file browser diagnostics were blocked.

## Spacing and atmosphere pass
- Infantry spacing is now 6.8–8.2 horizontally and 8.4 between ranks; marching columns use 5.8×8 spacing, cavalry 10.5×12.
- The painted drummer uses separate animated leg sections while marching, plus stronger alternating stick movement. This is procedural animation of the existing painting.
- Musket smoke persists 16–24 simulation seconds, volley clouds 19, cannon clouds 22–30; drift is slow and low. Particle count stays bounded at 800 (300 in reduced detail).
- Explosions last 1.3–1.7 seconds and combine the painted impact with an expanding pressure ring, staggered rising soot lobes, early flash and ballistic fragments.
- Action and rout announcements are now text in the battle header, outside the battlefield canvas.
- Fallen figures choose a nearby less crowded position with varied rotation; displacement stays local and stored casualties remain capped.
- Syntax, startup, battle controls, gun crew and deadline tests pass. Added `tools/battle_visual_check.js` for formation spacing and casualty bounds. In-browser appearance remains unverified following the earlier local-file browser security restriction.
