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

## Follow-up: howitzers and combat effects (15 October 2026)

- Howitzer help now gives the level 2 foundry upgrade cost/time and the recruitment cost/time, and links directly to a qualifying foundry when available. The full route from empty land was checked: 80 gold/3 seasons to build, 52 gold/2 seasons to upgrade, 32 gold/1 person/4 seasons to recruit. Start recruitment with at least 3 people available. Total construction and training: 164 gold and 9 seasons, excluding upkeep.
- Infantry standard bearers previously used a static painted flag and skipped the animated cloth renderer. They now use animated cloth, with stronger flutter while moving and a stable per-figure phase.
- Cannon hits now emit bounded, tumbling fragments: earth at ground/troop impacts, wood from carriages/houses/palisades, stone at stone walls, and metal when guns break. Surviving gun hits also produce splinters. Roundshot casualties receive a directional falling animation.
- Ordinary falls now emit blood trails as well as blast falls. Blood has stronger contrast, is drawn after smoke, and leaves a pool that spreads briefly on landing.
- Infantry/militia charges have longer strides, rotating legs, body lift and stronger lean; mounted charges articulate all four legs. All new effects use simulation time and stop while paused.

Validation: all 15 automated checks passed, four short campaigns completed with zero errors, and the standalone/offline builds were regenerated. The final recruitment-help revision passed its focused campaign check. New checks cover ordinary falling blood, pool growth, particle materials/caps/expiration/pause, surviving gun impacts, loaded-asset flag rendering, changing cloth phases, and foot/mounted charging articulation. Live browser inspection of the rebuilt game showed charges, moving flags, blood and airborne debris; captured page warning/error logs were empty. The browser automation tool itself reported unrelated telemetry network failures. The preview server was restarted after detecting an older offline cached page.

- [Live charge, flags, blood and impact fragments](screenshots/effects-charge-live.jpg)
- [Battle overview after combat](screenshots/effects-battle-complete.jpg)

## Follow-up: visible dragoon recruitment (15 October 2026)

Dragoons now have a persistent recruitment card in Realm and Orders, including before barracks exist. The card appears above army details and routes players to suitable land or barracks. It offers building, upgrading, or recruiting according to the province state, with construction progress and explicit gold, population, and occupation blockers. The level 1 barracks button says **Unlock dragoons**; level 2 offers **Recruit dragoons**. Duplicate recruitment and upgrade controls were removed.

Validation: campaign expansion, campaign options, and engagement checks passed; the expansion check exercises the complete build, upgrade, recruit, and training-completion flow through action handlers. The offline build was regenerated. Desktop browser inspection confirmed the card is visible in Realm and above army details in Orders, with no captured page warnings/errors.

- [Visible dragoon recruitment](screenshots/dragoon-recruitment-visible.jpg)

## Follow-up: personnel targets and faction uniforms (15 October 2026)

- Selected formations now offer **Target drummer**, **Target general**, **Target sergeant**, and **Normal targeting**. Buttons show living target counts; the order prefers the explicitly chosen enemy formation, otherwise the nearest matching person. A named battlefield marker and status identify the actual figure. Changing combat/movement orders clears the focus, and a fallen target returns the formation to normal targeting.
- Focused musket fire has 25% lower hit probability, with a 35% priority roll on successful hits before ordinary victim selection. Actual figure range, firing arc and friendly masking gate priority hits; artillery keeps its scatter and area damage. Melee cannot prioritize a figure outside its close reach. Commander retinues now have finite melee rates when directly attacked.
- Infantry and militia receive a sergeant with a polearm and gold sash. Losing one adds an 8-point morale shock and reduces reload progress by 15%. Existing drummer and commander casualty consequences remain in effect.
- Painted figures now have faction-specific lapels, waistcoats, cuffs, belts and hat details. Prussia uses red cuffs and ivory waistcoats; Britain navy lapels and white crossbelts; France crimson lapels and silver trim; Austria dark crossbelts; Russia red waistcoats; Sweden yellow waistcoats/cuffs. Free-city troops retain brown/cream details. These code-drawn details accompany the existing national coat assets; firing/charging silhouettes retain their painted national variants. Uniform palettes are cached rather than allocated per figure. The battle panel includes a uniform and role identification guide.

Validation: the 16 existing/new simulation and campaign checks passed, followed by the new personnel UI check and focused reruns after final UI/palette changes. Tests cover actual role-order handlers, order cancellation, range/masking, misses, casualty cleanup, commander melee, sergeant reload/morale consequences, seven distinct uniform styles and balanced drawing transforms. Rebuilt the offline game. Live browser checks exercised drummer, general and sergeant orders, confirmed selected target status, and inspected Prussian/French and Prussian/Russian battles. Page warning/error logs were empty.

- [Personnel targeting in the live battle](screenshots/personnel-targeting.jpg)

## Follow-up: larger battlefield and opening distance (15 October 2026)

The field is now 400 × 900 paces, extending its depth from 620. The attacking deployment moves back by up to 280 paces, so a standard open-field infantry matchup starts with 450 paces between its lines instead of 170. Deep infantry reserves shift together to preserve row spacing; very deep mounted formations use the available rear space. Gun crews and interpolated positions move with their formations. Forest cover near the attacking deployment and road/tree distribution extend into the added ground. Forts, river crossings and weapon ranges retain their dimensions.

The Follow camera can now zoom out to the full field instead of enforcing a close crop. Browser inspection confirmed both armies and the approach zone are visible.

Validation: all 18 checks passed across the suite and focused final reruns. The new space check covers standard/dense armies and all fort types, figure bounds, reserve rows, gun crews, initial interpolation, no opening casualties while both sides hold, and infantry successfully reaching firing range (about 132 simulation seconds in the test). Offline output rebuilt; whitespace checks passed.

- [Larger battlefield and separated starting armies](screenshots/larger-battlefield.jpg)

## Follow-up: declare war from territory (15 October 2026)

Foreign province details now show **Declare war on [owner]** directly below the territory name. Independent cities declare against the city; protected cities declare against their protector. Your own provinces/protected cities and unclaimed land do not offer a war action. Existing wars show the current status and marching instructions. The controls reuse the existing confirmation, treaty penalties, ally reactions and saved diplomatic state. Province navigation resets the panel to its top, and map/help text directs players to the new controls.

Validation: campaign options, expansion and engagement checks passed. Added tests exercise actual declaration handlers for neutral/peace/alliance/truce relations, independent/protected cities, preserved army positions/moves, target-specific confirmation, cancellation on navigation and removal of the action after war begins. Offline game rebuilt. Live browser inspection confirmed the button appears beneath a foreign territory name; page warning/error logs were empty. No war was declared in the live preview.

- [Declare war from territory details](screenshots/territory-declare-war.jpg)


## Follow-up: garrison walls and stronger siege artillery (15 October 2026)

Defenders now have a **Garrison walls** command under Fortress defence. It assigns selected infantry/militia, or all eligible foot troops when none are selected, to separate intact wall sections facing the attackers. Troops march into position and form outward-facing ranks; outside defenders enter through friendly access without creating a breach attackers can use. The field marks each assigned **WALL POST**. New movement, combat, formation, facing or personnel orders release the post, as does a breach in that section. Cavalry and artillery retain their orders. Practice setup now offers **Attack / Defend** and labels the defender's fortification explicitly.

Field-gun damage per direct wall hit is now 6 against timber, 3.6 against stone forts and 4.5 against city walls: respectively 3, 9 and 7 hits to breach a fresh section. Howitzers deal 10, requiring 2 timber or 3 masonry hits. Bombardment concentrates on intact section midpoints and switches after a breach. Cannonballs now land exactly at their intended flight endpoint instead of overshooting between simulation steps. Wall scatter was narrowed; damage to troops and weapon ranges are unchanged.

Validation: all 19 automated checks passed. New simulation checks cover gradual deployment, separate posts, outward fire, friendly entry, attacker blocking, breach/order cancellation, exact cannon impacts and breach hit counts for all three wall types. UI checks exercise the real wall-order handler, eligibility and cancellation. A further focused check confirms howitzer breach counts. Rebuilt the offline game and verified the Defend setup and wall deployment in the browser with no captured page warnings/errors.

- [Garrison wall positions in the live game](screenshots/wall-garrison.jpg)

## Follow-up: choose a wall breach point (15 October 2026)

Attacking players can now select **Target wall point…** and click an intact wall section. The picker numbers intact sections, ignores empty ground and existing breaches, and assigns selected artillery (or all eligible guns when nothing is selected). Field guns and howitzers share the chosen section and display a **BREACH HERE** marker with live section strength. Batteries stop siege fire when that section falls and retain a **BREACHED** marker until given a new target/order. Normal movement, combat and personnel orders clear the explicit wall target. Field guns now approach the actual wall target instead of measuring approach distance against an enemy regiment; howitzers also deploy using the selected section's range.

Validation: all 19 automated checks passed, including extended wall/UI checks for artillery eligibility, missed clicks, point-specific aim and movement, breach cease-fire, retargeting and cancellation. Live browser testing assigned both batteries to city-wall section 5, observed its strength fall to 34%, then confirmed the visible breach and **Section 5 breached — guns hold fire** status. Captured warning/error logs were empty. Rebuilt offline output after updating the in-game help; syntax and whitespace checks passed.

- [Selected wall section breached](screenshots/chosen-wall-breach.jpg)
