# Musket & Crown — Feature Checklist

- `[x]` done and tested
- `[~]` done, needs your review or tuning
- `[ ]` not started, or up for discussion

Details for each item are in `DESIGN.md`.

## Campaign map
- [x] Irregular provinces of different sizes (no squares)
- [x] Larger provinces pay more rent and yield more
- [x] Plains, forest, hills, lakes
- [x] River, which slows movement, helps defenders and makes farms richer
- [x] Neutral villages (gold + population)
- [x] Neutral free cities (Danzig, Hamburg, Nuremberg)
- [x] Movement in any direction to neighbouring provinces; cavalry moves 2
- [x] Split an army while marching
- [x] Battle scars on the map
- [x] No turn limit; win by conquest
- [x] Larger map (about 100 provinces) and a new random layout every campaign, including where each nation starts
- [x] Two rivers
- [x] 12 villages that can grow into towns
- [x] 6 free cities (Danzig, Hamburg, Nuremberg, Lübeck, Bremen, Augsburg)
- [x] All six free cities appeared in each of 50 generated-map checks
- [x] You must declare war before entering anyone's land, free cities included
- [x] Province names on the map (visually checked at phone zoom and desktop width)
- [x] Raised, shaded army markers with painted troop miniatures and cast shadows

## Economy
- [x] Money only (gold), plus people and popularity
- [x] Each terrain and each building pays a different amount; bigger provinces pay more
- [x] 10 buildings: farm, sawmill, mine, market, houses, church, barracks, foundry, wooden fort, stone star fort
- [x] Village-to-town upgrade
- [x] Taxes and popularity (Stronghold-style)
- [x] Unpaid wages, desertion, revolt
- [x] Winter halves farm income

## Armies
- [x] Militia, line infantry, dragoons, field guns
- [x] Howitzers: travel on a wagon, must deploy to fire, shells wreck walls
- [x] Russian hussar mercenaries (occasional, gold only, leave if unpaid)
- [x] Unit triangle: infantry > horse > guns > infantry
- [x] Named, appointed generals who gain experience and can die in battle
- [x] Officers in their own uniform in every unit (lose them and efficiency and morale drop)

## Live battles
- [x] Real-time battle for every fight involving you
- [x] Up to about 650 figures a side; 18 per infantry unit; up to 8 battalions in named regiments
- [x] Detailed uniforms per nation (facings, crossbelts, tricornes); militia in civilian brown
- [x] Four painted walking frames for national infantry and militia; cyclic gallop poses for cavalry and hussars; horse-drawn limbered howitzer and animated surviving gun crews
- [x] Detailed officers, drummers (reversed colours) and a visible general with two aides
- [x] Colour-bearers, drummers, officers, mounted general
- [x] Morale: wavering, breaking, rallying, rout
- [~] Layered volley and cannon smoke, drift, bounce dust, canister and howitzer shells; check density and frame rate on a phone
- [x] Bayonet charges in close combat
- [x] Cavalry charges; artillery storming
- [x] Stone star fort, wooden fort, city walls, breached by cannon and shells
- [x] Craters, scorch marks, blood; the fallen stay on the field
- [x] Moving cannon wheel rotation, carriage bounce and walking crew; distance-driven wheels and balanced canvas transforms checked
- [x] Blood on fallen bodies and ground, casualty sprays and airborne shell-hit trails; pause, landing, expiry and particle caps checked
- [x] Painted fallen infantry, larger shell holes, masonry chips, pointed wooden stakes and stone courses
- [x] Destroyed cannon wreck with broken barrel and wheels; large shells show an exploded wall opening and rubble
- [x] In-battle View fort control for stone forts, wooden forts and city walls; full-defence previews checked
- [x] Painted oak and pine trees, timber and stone houses, road wear, river banks, reeds and ford; houses show shell damage
- [x] Painted firing, reloading, bayonet and fleeing regulars and militia; cavalry and hussar melee poses; national colour-bearers, officers, mounted generals and aides; deployed howitzers, gun crews, fallen horses and hussars
- [x] Painted shell impacts, cannon flashes, masonry rubble and destroyed houses; richer wall courses, earthworks, hill shading and battle markers
- [x] Dedicated painted stone and timber wall surfaces, moving river ripples and wakes, staged blasts and flying fragments
- [x] Measured default pace, tactical pause with orders, and half-speed option
- [~] Physical-device performance and subjective listening review remain
- [x] Raised projected hills with ground, figures and click positions aligned
- [x] Hill front slope occludes figures behind its crest
- [x] Standalone game viewport metadata and 390-pixel battle layout checked
- [x] Independently targetable gun crew; surviving crew affect firing speed and an empty gun cannot fire
- [x] Larger battle figures and drummer with an audible moving cadence
- [x] Low-angle camera that follows and zooms in
- [x] Orders for groups, single units or a multi-unit selection (tap several units, or Select all foot / horse / guns)
- [x] Period line tactics: battalions advance on the battalion opposite, dress their lines, fire rolling volleys by rank, second line in reserve
- [x] Foot: Advance, Hold the line, Dig in, Charge, Flank. Horse: Charge, Shoot, Flank, Wait. Guns: Bombard, Counter-battery, Target the walls. All retreat
- [x] Flank and rear attacks hit 1.5× and 2×, with extra morale shock
- [x] Fatigue from marching and fighting; recovers at rest
- [x] Your army starts every battle standing in place, waiting for orders (10-second simulation check)
- [x] Battle zoom and pan: pinch, mouse wheel, + / − buttons, Follow
- [x] Practice battle from the homepage
- [x] Battle balance: three even fights measured across 120 runs each (54%, 43%, 62% attacker wins); the largest sampled 360 more times at 58%. A flank wins 68% in the same mixed setup, versus 43% for a plain attack.

## Diplomacy
- [x] Six nations: Prussia (dark blue), Britain (red), France (light blue), Austria (grey), Russia (green), Sweden (gold and blue)
- [x] Choose which nation you play
- [x] Non-aggression pact, cease-fire (4 seasons), peace, alliance, war
- [x] Trade pacts with caravan roads drawn on the map (raidable)
- [x] Gifts and tribute
- [x] AI envoys with offers and demands
- [x] Allies called into wars
- [x] Betrayal penalties remembered across campaigns
- [x] Free cities: goodwill, protection, declaring war, storming
- [x] Ruler portraits in period style (white wigs); expression follows relations

## Rival AI brain
- [x] Doctrines (Militarist, Merchant, Fortifier, Diplomat) chosen by past success
- [x] Five-gene brain that evolves across campaigns
- [x] Pre-trained by 200 self-play campaigns
- [x] Remembers your unit mix, early aggression and treaty-keeping
- [x] Council tab shows what the rivals learned, their genes and the generation

## Difficulty
- [x] Cadet / Colonel / Field Marshal
- [x] Tuned by simulation (100 campaigns per level: survival 93% / 62% / 43%)
- [~] Needs tuning against a human player: that's you

## Sound
- [x] Synthesised home, campaign and battle themes with phrase variation, warmer filtering and slower battle music
- [x] Adaptive battle march with deeper drums, shared marching/rally rhythm, firing-driven strings/brass, and independent gunfire ducking
- [x] Audio checks cover drum loss, pause/end, separate volumes, intensity decay and scheduler lifecycle; 22-second browser-rendered mix peaked at 0.588 with zero clipped samples
- [x] Cannon, volley, explosion, whistle, sabre, bugle, hooves, neigh, commands and ambience; loud effects briefly lower music; 20-second rendered mix has no clipping
- [x] On/off in the Menu
- [x] Separate Music and Battle sounds volume sliders, kept at the player's request

## Art files
- [x] Re-exported to `assets/`: ruler portraits, national unit sheets including alternating walk/gallop frames, map icons, full map and homepage painting

## Platform
- [x] Homepage: Continue, New campaign, Practice battle, Settings, How to play, over a painted dusk battle scene
- [x] Settings: which battles to watch, battle speed, sound, erase rival memory
- [x] Map zoom
- [x] Works on a phone, one-handed
- [x] Offline install cache fixed: the cached game loaded in Chrome after the local server was stopped
- [~] Battle smoke reduces detail automatically when rolling frame time exceeds 1/29 second; actual mid-range phone frame rate remains to be measured
- [x] Saves automatically after every move
- [ ] Hosting (GitHub Pages or Vercel) so the offline install can be added to your phone

## Out of scope (decided)
- Sieges lasting several seasons
- Naval and colonial layers

## Battle update (1 October)
- [x] Drag one of your units to a spot to move it (drag empty ground to pan)
- [x] Gun ranges button: shows roundshot and canister range rings for every battery; selected guns always show theirs
- [x] Opening view shows the whole field; Follow zooms in close
- [x] Fallen soldiers drawn at full size from the painted fallen-infantry art in each nation's uniform; fallen horses from the cavalry art
- [x] Explosion sound for shell bursts, wall breaches and exploding guns
- [x] Slower movement (foot 3.2, cavalry 12), 0.75 simulation pace at normal speed, longer reloads and reduced melee lethality; battalions halt to deploy from column into line and walk out to their places before firing
- [x] Battle commander for the computer's side: bombards walls before storming, holds horse until the lines are engaged then flanks, retreats when beaten
- [x] Rival campaign brains retrained (150 campaigns)
- [x] Practice battle setup: unit counts for both sides, enemy nation, terrain, river, fortification, general levels
- [x] Forest battles: groves spread across the field

## October 5 review follow-through
- [x] Skip-to-result resolves long battles beyond the previous 300-second cap
- [x] Shared watched/instant combat model; abandoned-gun strength and loss accounting
- [x] Desktop orders sidebar and larger phone buttons; unit-first command view
- [x] Selected unit morale/status and reload readout; trees fade over selected troops
- [x] Formation spacing and cavalry columns refined
- [x] Nearby rally, morale warning and deployment/breach sound cues
- [x] Recent turning points included in battle results
- [x] Guided introductory skirmish
- [~] Militia cover and howitzer trade-offs tuned; larger human balance review remains
- [~] Physical phone performance and subjective speaker listening remain unverified


## Engagement changes — 8 October 2026

- [x] Contextual, dismissible movement/recruitment/diplomacy help; freeform campaign opening retained
- [x] Season-one Continue and legacy v4 saves
- [x] Selectable opening doctrines with troop/treasury tradeoffs
- [x] One three-season capital-recovery chance per crown; visible deadline and saved refuge
- [x] Persistent army/general service records, including archived armies and fallen generals
- [x] Factual diplomatic history and cross-campaign betrayal recollections
- [x] Battle end reasons and observed turning points in watched/instant battles
- [x] Unit explanations for blocked fire, fatigue, morale, crews, deployment and terrain
- [x] Formation outlines, target/destination markers and fixed Pause/Resume bar
- [x] All seven automated check files passed; four short and four up-to-120-season campaigns ran without errors
- [x] Browser interaction checks at 390×844 and 1280×900; no captured browser errors
- [ ] Human playtests for new opening/recovery balance and battle-report comprehension
- [ ] Physical-phone performance and touch evaluation

Preview evidence: `review-engagement-phone.png`. No ambition system, scripted campaign opening, or general traits were added.

## Battle feel — 8 October 2026

- [x] Wider foot/horse spacing, staff separation and bounded friendly spacing corrections
- [x] Distance-based strides, continuous melee motion and interpolated soldier rendering
- [x] Stronger passive drummer support and a local Drum rally with a halt/fire tradeoff
- [x] Rally cooldown, unsafe/lost states, visible pulses and distinct drum rhythm
- [x] Upright-to-fallen animation, shell knockback/airborne arc and landing dust
- [x] Casualty depth ordering and pause-safe transient lifetimes
- [x] New regression checks for rally mechanics, movement and casualty animation
- [ ] Physical-phone frame rate, speaker quality and human battle-feel playtests

- [x] Hit recoil and wound flash; articulated bayonet charge strides and body lean
- [x] Form line / March column commands, visible deployment slots/progress, drumming while forming, and fire readiness gates
- [x] Fire when ready holds position and respects range, reload and friendly masking
- [x] Empty-ground/outside deselection; explicit Move to… placement and drag movement retained; desktop and touch controls checked

- [x] Fix bayonets preparation command, countdown/animation and persistent ready stance
- [x] Fixed-bayonet melee bonus and frontal cavalry defence for steady lines; movement, flank, morale, interruption and queued-charge checks

- [x] Distinct firing ranges: line infantry 130, militia 105, dragoons 80; movement, targeting, advice and selection readouts use the same range values
- [x] Firing-range boundaries and approach distances checked for both sides
