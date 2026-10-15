# Graphics, animation and strategy sweep — 15 October 2026

The sweep covered the source rules, embedded artwork, battle renderer, campaign economy/movement/diplomacy, automated checks, and live desktop/phone-sized browser views. Confirmed defects were fixed and the offline game rebuilt. The follow-up implementation closes the actionable graphics, animation, terrain, facing and overlay findings. Human balance and physical-device acceptance remain validation activities, not claimed results.

## Fixed: gameplay and strategy

| Severity | Change | Why it matters |
|---|---|---|
| P1 | Enforce the howitzer's 240-pace range for each shell, on both sides. | Deployed howitzers previously fired beyond the displayed range. |
| P1 | Respect Hold position while a howitzer is limbered. | A held battery could advance when its target was between 90% and 100% of range. It now deploys in place when appropriate. |
| P1 | Include every soldier in the three rolling firing cohorts. | Large formations assigned some soldiers to a fourth cohort that never fired. Visual rank spacing is preserved. |
| P1 | Calculate cavalry flank damage from its current position. | Completing a flank waypoint previously granted a permanent ×2.4 melee multiplier, including subsequent frontal attacks. Current flank/rear effects are ×1.5/×2. |
| P1 | Block melee across an intact wall until a nearby breach opens. | Close formation anchors previously allowed bayonets through fortifications. Muskets can still fire over walls. |
| P1 | Stop abandoned guns contributing melee attacks. | A gun without living crew could still retaliate despite being unable to fire. |
| P1 | Recalculate a merged army's movement from its composition and distance already marched. | Cavalry could carry remaining movement into a mixed army; merging into a river province also bypassed the river stop. |
| P1 | Calculate wage desertion across the crown before distributing losses. | Splitting 48 infantry into eight six-unit armies previously rounded every 8% loss to zero. Both arrangements now lose four units; tiny unpaid forces also lose at least one unit. |
| P1 | Discard diplomatic offers when their prerequisite relationship no longer exists. | Old non-aggression offers could end a later war; duplicate peace offers could inflate treaty history. Invalid offers no longer apply or block ending the season. |
| P2 | Explain artillery requirements before a siege. | Players can see that their selected force cannot breach walls before committing. |
| P2 | Correct infantry and flank descriptions. | The game implements braced bayonet lines, not squares; side and rear attacks have different multipliers. |

## Fixed: graphics, animation and controls

- [x] **[P1] Load terrain before advancing the battle clock.** Terrain images now receive decoding priority, while the opening screen still defers battle art and decoding remains limited to four images at once. Both successful and failed image loads release the startup gate. Fast-start combat could previously remain on a flat fallback ground texture because its clock had already passed the redraw window.
- [x] **[P2] Show fleeing poses during an army-wide retreat.** Retreat orders previously moved otherwise steady infantry using ordinary action art. Retreating formations also report Routing correctly.
- [x] **[P2] Animate legs while infantry flee or reload on the move.** These painted poses previously slid across the field.
- [x] **[P2] Add visible carbine/pistol firing and reloading for mounted troops.** Procedural weapon, hand and flash actions follow the shot clock and freeze during pause; this uses existing paintings rather than new sprite sheets.
- [x] **[P2] Reduce group-selection clutter.** Full floating status cards appear for a single formation; groups keep numbered outlines and their shared panel summary. Shared targets get one marker instead of stacked duplicates.
- [x] **[P2] Isolate battle controls from the background campaign.** The battle is a labelled dialog, the campaign is inert while it is open, and focus returns on exit. The browser accessibility tree confirmed the background was excluded.
- [x] **[P2] Keep keyboard pause consistent with retreat controls.** Space can no longer freeze a rout while the Resume button is disabled.

## Follow-up completed

- [x] **Capacity-aware small-fort deployment.** Both armies use the same reduced representation scale in a small siege. Garrison formations take measured courtyard slots; supporting infantry, cavalry and batteries take separate exterior lanes. Very dense custom armies reduce figure size and spacing together until every formation fits on the field. No invisible off-field reserves are created. Buildings that would overlap the initial deployment are omitted. Full practice-limit armies are checked for in-bounds figures and distinct selectable anchors.
- [x] **Positional terrain protection.** Both armies receive ×0.8 incoming hit probability in the marked forest groves and ×0.85 on the raised hill. The renderer and simulation use the same grove regions. Moving away removes the benefit. Wall protection applies only inside the fort, including to attackers who enter it; supporting troops outside do not inherit it.
- [x] **Facing with an actual turn cost.** Select infantry, choose **Face toward…**, and tap the field. The line halts, rotates its rank positions and waits for the soldiers to form before firing. The front arrow shows the direction used for side/rear damage and frontal bayonet defence. Infantry fire through a roughly 151° front arc; automatic orders turn toward targets outside it. A manual facing holds until a movement or combat order releases it. Friendly firing obstruction now uses the actual line between firer and target, including sideways shots.
- [x] **Campaign feedback.** Friendly army markers travel to their destination over 650 ms and show an arrival highlight; mergers show “Joined forces”. Finished projects highlight their province. Effects queued during season processing or a report wait until the map is visible. Reduced-motion preference uses stationary feedback. Game state and clicks use the committed destination throughout.
- [x] **Consistent overlay focus.** Home, Settings, campaign dialogs, battles and battle results isolate background controls. Tab wraps within the active overlay; closing Settings returns focus to its menu button. Rebuilding a command/settings panel preserves the active control where possible.
- [x] **Action readability.** Moving fire/reload/flee poses, mounted weapon actions and route animations from the first pass remain simulation-clock based. Direction is conveyed by formation rotation and the front arrow; existing upright painted figures remain in use. New decorative sprite sheets are not required for the implemented actions.
- [x] **Repeatable balance and cost comparison.** The balance tool now uses paired seeds, labels manual cavalry strategies explicitly, tests multiple army sizes/terrain, and reports 95% Wilson intervals. Recruitment comparisons include people, training, upkeep and popularity below. No unit price/stat change was made from a single matchup.

### Recruitment tradeoffs

| Force | Gold to recruit | People | Popularity | Training time | Upkeep/season | Gold after 8 full upkeep seasons |
|---|---:|---:|---:|---:|---:|---:|
| 3 infantry | 30 | 3 | 0 | 2 seasons | 0.9 | 37.2 |
| 10 militia | 30 | 10 | 20 | 1 season | 1.5 | 42 |
| 6 infantry | 60 | 6 | 0 | 2 seasons | 1.8 | 74.4 |
| 12 militia | 36 | 12 | 24 | 1 season | 1.8 | 50.4 |
| 20 militia | 60 | 20 | 40 | 1 season | 3.0 | 84 |

Training is parallel; the table excludes building costs, population replacement, casualties and delayed recruitment when resources are insufficient. Equal gold is a different constraint from equal population or equal upkeep. The seeded samples show that formation size and deployment can change the outcome: militia do not dominate every comparison.

### External acceptance still required

- **Physical phone:** sustained rendering frame rate, touch precision, thermal behaviour and speaker quality require an actual device. Desktop viewport checks and the simulation timings below cannot establish those.
- **Human balance:** the seeded AI/command samples are diagnostics. They do not establish enjoyment, a balanced multiplayer metagame, or the quality of skilled human manoeuvres.

## Seeded balance results

[Raw balance and timing output](BALANCE_SWEEP_RESULTS.txt).

**280 completed diagnostic battles:** sixteen field matchups × 16 runs completed with seeds 1740–1755. Both sides use AI except the two cavalry-command cases, where the attacking order is held under player control. The longer exploratory matrix was stopped before its remaining cases; only completed matchups are reported. Final siege follow-ups use eight runs per matchup and seeds 1740–1747.

| Matchup | Attacker wins | Rate | 95% Wilson interval | Mean battle time |
|---|---:|---:|---:|---:|
| 3 inf vs 10 militia (same gold) | 15/16 | 94% | 72–99% | 96s |
| 12 inf vs 40 militia (same gold) | 0/16 | 0% | 0–19% | 108s |
| 6 inf vs 12 militia (same upkeep) | 16/16 | 100% | 81–100% | 91s |
| 3 inf vs 3 inf, forest | 8/16 | 50% | 28–72% | 94s |
| 6 inf vs 6 inf, hills | 0/16 | 0% | 0–19% | 96s |
| 12 inf vs 12 inf, plain | 2/16 | 13% | 3–36% | 122s |
| 8 inf vs 4 cav (inf should win) | 16/16 | 100% | 81–100% | 40s |
| 4 cav vs 3 art (horse should win) | 16/16 | 100% | 81–100% | 45s |
| 3 art vs 6 inf (guns should win) | 15/16 | 94% | 72–99% | 114s |
| 6 inf vs 6 inf | 0/16 | 0% | 0–19% | 103s |
| 8 inf vs 6 inf (numbers) | 6/16 | 38% | 18–61% | 110s |
| 10 inf vs 6 inf | 15/16 | 94% | 72–99% | 103s |
| 6 inf vs 6 militia | 16/16 | 100% | 81–100% | 64s |
| 6 inf vs 20 militia (same cost) | 1/16 | 6% | 1–28% | 108s |
| 6i2c vs 6i2c, attacker flanks with horse | 5/16 | 31% | 14–56% | 98s |
| 6i2c vs 6i2c, plain | 9/16 | 56% | 33–77% | 98s |

| 8i2a vs stone fort 3i+2guns | 8/8 | 100% | 68–100% | 391s |
| 8i2h vs stone fort 3i+2guns, target walls | 8/8 | 100% | 68–100% | 107s |
| 8i2a vs wooden fort 3i+1gun | 8/8 | 100% | 68–100% | 320s |

All three final siege cases won 8/8; the sample is too small to claim a guaranteed win. Howitzers resolved the stone-fort attack in 107 simulation seconds on average, versus 391 with field guns. Fortifications therefore impose a substantial time cost even in these attacker-favoured force matchups.

The default frontal advance is strongly disadvantaged against an already formed defending line: six versus six infantry won 0/16, while ten versus six won 15/16. Cover access is now symmetric, but starting positions and orders remain asymmetric. Players should disrupt the line with manoeuvre, guns or superior strength rather than assume equal numbers mean even odds.

The blanket cavalry flank order won 5/16 versus 9/16 for at-will cavalry with the same seeds. The uncertainty intervals overlap. This does not establish that flanking is worse; route, target and timing matter, and the geometric bonus is no longer permanent. Human command testing is needed before changing the cavalry statistics.

## Verification

- Rebuilt the standalone/offline game; JavaScript parsing and whitespace checks passed.
- All **15** `tools/*_check.js` checks passed on the final source, including extended terrain, facing, dense-fort, focus and campaign-animation regressions.
- Core smoke passed with **four campaigns through season 30, zero errors**. Browser automation in that script was explicitly skipped and verified separately in the in-app browser.
- Desktop **1280×900** and phone-sized **390×844** browser checks covered the fort, forest, selection, facing orders, live rotation/combat, pause and menus. No captured browser warnings/errors appeared.
- Settings excluded the home/campaign from the accessibility tree; Tab wrapped from Done to the first control, and closing returned focus to Settings. Battle controls preserved keyboard focus during panel rebuilds.
- In a live campaign, a completed road highlighted only after its season report closed. A friendly army marker was observed between its origin and destination while the destination already showed arrival feedback.
- The smoke script still requires real server/browser success; a browser skip is explicitly labelled and cannot be reported as browser validation.

### Simulation timing

`node tools/battle_perf.js` sampled 600 steps per scenario during simulation seconds 60–80, at a 30 Hz simulation step. Measurements are from this host while diagnostic work was active. They exclude canvas rendering, sound and input; they are **not phone FPS measurements**.

| Scenario | Initial figures + crew | Median step | 95th percentile | Maximum sampled step |
|---|---:|---:|---:|---:|
| practice | 638 | 1.703 ms | 4.67 ms | 10.674 ms |
| large | 1157 | 3.079 ms | 7.367 ms | 16.219 ms |
| fort | 384 | 0.891 ms | 2.485 ms | 4.064 ms |

## Screenshots

- [Completed fort deployment](screenshots/sweep-fort-complete.jpg)
- [Completed positional terrain and front arrows on phone](screenshots/sweep-terrain-phone-complete.jpg)

Earlier sweep evidence:

- [Phone combat and group selection](screenshots/sweep-battle-phone.jpg)
- [Painted terrain, combat and casualties](screenshots/sweep-combat-desktop.jpg)
- [Stone fort and crowded garrison](screenshots/sweep-fort-desktop.jpg)
- [River and forest](screenshots/sweep-river-desktop.jpg)

**Implementation complete; external acceptance remains.** The actionable findings are implemented and covered by automated and browser checks. Physical-phone and human playtesting are explicitly unverified.
