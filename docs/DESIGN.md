# Musket & Crown — Design Document

A personal, offline, mobile-first strategy game set in Europe from 1740.
Inspirations: *The Ancient Art of War* (live battles, unit triangle), *Fantasy Empires* (conquest),
*Stronghold* (economy, popularity), *Civil War 1862* (the fallen stay on the field).

Every number here is the value in the code today. Edit this file freely to propose changes.

---

## 1. Pillars

1. **One more season.** Short turns, and a real decision every season.
2. **Battles you watch and steer.** Every fight involving you plays out live, with masses of figures.
3. **Rivals that remember and evolve.**
4. **Pocket-sized.** One file, works offline, fits a phone held in one hand.

Out of scope, by decision: sieges lasting several seasons, and naval or colonial layers.

---

## 2. Nations (you choose which one to play)

| Nation | Map colour | Uniform | Ruler (portrait) | Generals |
|---|---|---|---|---|
| Prussia | Dark blue | Prussian blue, buff facings | Frederick II, King in Prussia | Schwerin, Zieten, Seydlitz, Keith, Leopold of Dessau |
| Britain | Red | Red coat, blue facings | George II, King of Great Britain | Cumberland, Ligonier, Wolfe, Granby, Stair |
| France | Light blue | Light blue, red facings | Louis XV, King of France | Saxe, Belle-Isle, Broglie, Soubise, Chevert |
| Austria | Grey | White-grey, red facings | Maria Theresa, Queen of Hungary and Bohemia | Daun, Browne, Laudon, Lacy, Khevenhüller |
| Russia | Green | Green, red facings | Elizabeth, Empress of All the Russias | Saltykov, Apraksin, Fermor, Rumyantsev, Münnich |
| Sweden | Gold with blue borders | Blue, yellow facings | Frederick I, King of Sweden | Lewenhaupt, Buddenbrock, Ehrensvärd, Lantingshausen, Hamilton |
| Free cities | Brown | City guard, brown | none | none |

- **Austria's name**: "Austria-Hungary" as a name dates from 1867. In 1740 this was the Habsburg Monarchy, so the game calls it
  **Austria** and gives its ruler her real titles, including Queen of Hungary.
- **Portraits** use painted images of the six monarchs. The frame colour follows your relations with them; the original code-drawn SVG portraits remain as an export and fallback.

---

## 3. The campaign map

- **A new map every campaign**: about 100 irregular provinces on a 14×16 board. Where each nation starts is shuffled too.
- **Province size** (small / middling / large) sets how much it pays.
- **Terrain**:
  - plains: 1.2 gold × size;
  - forest: 0.8 × size, +20% defence;
  - hills: 1.0 × size, +30% defence;
  - lakes: impassable.
- **Two rivers**:
  - entering a river province ends the army's move;
  - defenders there get +25%;
  - the province earns +1 gold, and a farm on it +2.
- **12 villages**: +3 gold, room for 4 people, faster growth. You can **grow a village into a town** for 60 gold: +7 gold, room for 8, it raises militia and infantry, and it has a garrison of 2 militia.
- **6 free cities**: Danzig, Hamburg, Nuremberg, Lübeck, Bremen, Augsburg. See §7.
- **Movement**: one province per season; cavalry-only armies move two. You can split an army in half as it marches.
- **War first**: you must **declare war** before marching into any crown's land or a free city.
- **Map zoom** button for small screens. Province names appear on the map when it's large enough (zoomed in on a phone, always on a wide screen).
- **Army markers** use shaded, raised national plinths and miniature painted infantry, cavalry or gun figures, with a cast shadow and a readable troop count.

---

## 4. Economy: money and people

One resource, **gold**, plus **people** (needed to recruit) and **popularity**.

| Building | Cost | Where | Pays per season |
|---|---|---|---|
| Farm | 20 | plains | 3 + size, +2 by a river, half in winter |
| Sawmill | 20 | forest | 2 + size |
| Iron mine | 30 | hills | 3 + size |
| Market | 45 | plains, hills | 3 + size, and boosts trade roads |
| Houses | 20 | plains, forest | room for 6 people; raise civilian militia |
| Church | 50 | plains, hills | +3 popularity |
| Barracks | 55 | any land | line infantry; level 2 unlocks dragoons |
| Cannon foundry | 80 | plains, hills | field guns; level 2 unlocks howitzers |
| Wooden fort | 35 | any land | palisade + 1 gun, defence ×1.3 |
| Stone star fort | 90 | any land | bastions + 2 guns, defence ×1.6 |
| Capital | none | none | +8 gold, room for 12, walls + 3 militia + 1 gun |

- **Taxes**: gold per person (0 / .3 / .55 / .85) and popularity per season (+4 / +2 / 0 / −5).
- **Pay**: every unit costs pay each season (see §5).
- **Empty treasury**: −6 popularity. Hussars leave first, then 8% of soldiers desert.
- **Population growth**:
  - popularity 60+: +2 people per season;
  - popularity 40+: +1;
  - villages and towns add +1 more;
  - below 25 the population shrinks.
- **Revolt**: below 15 popularity, the province farthest from your capital revolts.

---

## 5. Armies

| Unit | Cost | Pay | Raised at | Strength | Good against |
|---|---|---|---|---|---|
| Militia | 3 gold + 1 person + 2 popularity | .15 | houses, capital, town, village, city | 1.8 | nothing (cheap filler) |
| Line infantry | 10 + 1 | .3 | capital, barracks, town | 3 | horse, militia |
| Dragoons | 20 + 1 | .5 | level 2 barracks | 4 | guns, howitzers |
| Russian hussars | 30 | 1 | hired (mercenaries) | 4.5 | guns, howitzers |
| Field guns | 26 + 1 | .5 | foundry | 4 | infantry |
| Howitzers | 32 + 1 | .6 | level 2 foundry | 3.5 | walls, massed troops |

**Generals**:
- **Appointing**: any army standing in your land can be given a named general for 60 gold. Each nation has five.
- **Experience**: a general gains experience with every victory, up to level 5.
- **In battle**:
  - he rallies units within 150 + 10 per level;
  - units near him fight 4% better per level.
- **Death**: he can be killed. His army then loses 25 morale in battle, and he is gone for good.
- **Without a general**: an army is led by a **colonel**, who has a smaller, weaker aura.

---

## 6. Live battles

### The field
- **Camera**: low-angle view. The enemy's side recedes; figures stand upright and shrink with distance.
- **Following**: the camera follows the fighting and zooms in as the lines close.
- **Pace**: infantry base speed is 3.2 paces per simulation second, modified by formation and fatigue; cavalry base charge speed is 12. Guns are dragged forward at 4, howitzers at 6.
- **Terrain**:
  - open ground: no bonus for either side;
  - forest: either side takes 20% fewer hits while its formation anchor occupies a marked grove;
  - hills: either side takes 15% fewer hits while occupying the raised ellipse;
  - river: a band across the field; troops wade at 45% speed.
- **Walls**:

  | Fortification | Cover (share of hits taken) | Wall strength |
  |---|---|---|
  | Stone star fort | 0.6 | 100 |
  | Wooden fort | 0.8 | 60 |
  | City walls | 0.85 | 100 |

  - A roundshot hit costs a wall 2.5; a howitzer shell costs 30 and can damage nearby wall guns.
  - Breaches show on the wall, and cover shrinks as the wall falls.
- **Damage**: shaded cannon and shell craters have raised rims, debris and cracks. Destroyed guns leave a broken barrel, separated wheels and splintered carriage. Shells open wall gaps with painted masonry rubble. Painted fallen infantry, horses and hussars stay where they fell. Partial hits on guns remove visible crew figures and leave crew casualties. Casualties show a brief blood spray, a wound during the fall, and lasting blood beneath and on the body. Shell-thrown figures shed droplets along their flight and on landing. Droplets follow gravity, freeze during pause, and are capped at 320 (120 in reduced-detail mode).
- **Ground art**: painted oak and pine cutouts stand above cast shadows along the field and forest edges. The road has worn wheel ruts and small stones. The river has contrasting banks, ripples, reeds and a shallow crossing. Hills have slope shading and contours; their gameplay elevation is still abstract. Timber cottages and stone townhouses replace the simple roof blocks inside forts and walled cities; nearby shell strikes swap in ruined building paintings.
- **Smoke**: individual shots and whole volleys leave layered, drifting smoke that lingers for 6–10 seconds; guns leave heavy banks that last 9–13 seconds. The renderer reduces smoke detail when measured frame time falls below 30 fps.
- **Painted motion**: infantry and militia alternate standing and marching poses; dragoons and hussars alternate standing and galloping poses. Regular infantry also have separate firing, reloading, bayonet and fleeing paintings. Horse-drawn howitzer wagons appear while limbered, with a deployed howitzer painting when ready. Officers, Prussian colour-bearers, mounted generals and aides have distinct painted figures. Flags wave, drummers carry a larger, more visible hip drum, and moving figures bob subtly. Full walk and gallop cycles remain a later art pass.
- **Defences**: wooden stakes have pointed tips, grain, a brace and ditch; star forts show stone courses and crenellations; city walls have masonry joints and battlements. Rampart guns and stores add detail. A **View fort** battle control frames the complete defence, while **Follow** returns to the armies.
- **Moving artillery**: field-gun and howitzer wheels rotate with distance travelled, the carriage bounces and tilts slightly, and surviving crew take alternating steps. Wheels stop when the gun stops; crew reload gestures appear only while stationary.

### Who is on the field
- **Scale**: up to about 650 figures a side (scaled down for very large armies).
- **Infantry**: 18 figures per unit, about 35 real men per figure.
  - Up to 8 battalions in two lines, paired into regiments ("2nd Regiment, I Bn").
  - Each battalion has an **officer**, a **colour-bearer**, and a **drummer**. Painted infantry figures carry a sash, standard, or drum to distinguish these roles.
  - Lose the officer: −12 morale, and the unit fights at 86% instead of 110%.
  - Lose the colours: −15 morale. Lose the drummer: −5.
- **Militia**: 9 figures per unit, civilian brown coats with a sash in the nation's colour. Their volley effectiveness is 38% of regulars, their fighting weight is half, and they lose morale 1.5× as fast.
- **Horse**: dragoons (8 figures per unit) and hussars (7) in squadrons on the flanks, each with an officer and a standard.
- **Field guns**: one gun per unit, with 6 crew. Roundshot at long range; canister up close, capped at about 5 casualties a blast.
- **Howitzers**: they travel **limbered on a wagon** and must **unlimber for 5 seconds** before firing.
  - Moving again takes 3 seconds to limber up.
  - Shells arc high, burst in a radius of 17 and **ignore wall cover**.
- **General**: a larger painted mounted figure with a gold sash. Two mounted aides ride beside him. He rides just behind the centre of the foot, and the camera keeps him in view.

### Line tactics
- Each battalion picks the enemy battalion opposite it and advances straight at it, drifting sideways only a little.
- **Dressing the line**: a battalion that gets ahead of its neighbours in the same line slows down; one that falls behind speeds up.
- It halts within its own musket range, closes further as the battle continues, and fires **rolling volleys by rank**: front rank, second, third, then the front rank again.
- The **second line is a reserve**: a battalion can't fire through friendly troops standing in front of it.
- After 90 seconds, or at 45 paces, the line closes with the bayonet.
- **Computer-controlled defenders** hold until 12 seconds in, then advance to meet the attack, if they have horse or guns and no walls. When you defend, the orders are yours.

### Targets, movement and your orders
- **At the start** your whole army stands in place and waits for orders (Stand / Wait). Standing troops still fire at enemies in range and fight back if attacked. The computer's side acts on its own.
- **Camera**: pinch or mouse wheel to zoom (×1 to ×4), drag to pan, the + and − buttons, and Follow to return to the automatic camera.
- **Commanding**:
  - Tap your units to select one or several (tap again to drop one), or use the Select row: All foot, All horse, All guns, Everyone.
  - Orders apply to everything selected. A selected group moved with Move to… or by dragging keeps its relative positions.
  - Tap an enemy to send the selection against it. Choose Move to… and tap a destination, or drag a unit to move; units hold the spot when they arrive. An ordinary tap on empty ground or outside the command controls clears selection and cancels a pending Move to… choice without changing existing orders.
  - With nothing selected, the Foot, Horse and Guns rows command whole groups.
- **Orders**:

  | Group | Orders |
  |---|---|
  | Foot | Stand (default), Fire when ready (hold position and fire at clear targets in range after forming and reloading), Advance, Hold the line, Dig in (8 seconds of digging, then 35% fewer hits), Charge (bayonets), Flank (march around the side, then attack) |
  | Horse | Wait (default), Charge, Shoot (dragoons carbines at 80 paces, hussars pistols at 45), Flank (ride around wide, then charge), Wait |
  | Guns | Bombard, Counter-battery (aim at enemy guns), Target the walls |
  | All | Retreat |

- **Automatic behaviour**:
  - Units pick targets by the preference table in the code: horse goes for guns, guns for infantry, infantry for horse.
  - Infantry fixes bayonets under 60 paces.
  - Infantry storms enemy guns within 95 paces.
  - Infantry halts and fires 30% faster when horse charges it.
- **Flanks**: attacks from the side hit 1.5× and from the rear 2×, with the same multiplier on morale shock.
- **Fatigue** (0–100):
  - Marching adds 1.2 per second, a bayonet charge 4, galloping 6, melee 10, and each volley +2.
  - Resting removes 3 per second.
  - Every point costs 0.4% of fighting efficiency and 0.3% of speed.

### Morale and the end
- **Casualties**: each costs about 120 ÷ unit size in morale.
- **Wavering**: below 30 a unit fights at 60%.
- **Breaking**: below 8 it runs. It rallies above 45, helped by its flag, its drum and its general.
- **Rout**: an army whose steady strength drops below 35% routs.
- **Time limit**: after 600 simulation seconds, the army retaining the larger fraction of its original steady strength holds the field; ties favour defenders.

### Historical balance (before the 15 October fixes)

These older samples describe an earlier rule set and are retained as history. Use [the current sweep](GRAPHICS_GAMEPLAY_SWEEP.md) for present diagnostics. The militia “equal gold” label below reflected an older price.

60 battles per matchup, October 2026. Even matchups were also run for 120 battles each; those longer results appear in parentheses. The largest even matchup was sampled 360 more times and gave 58%.

| Matchup | Attacker wins |
|---|---|
| 8 infantry vs 4 dragoons | 100% |
| 4 dragoons vs 3 guns | 80% |
| 3 guns vs 6 infantry | 100% |
| 6 infantry vs 6 infantry | 53% (54% in 120) |
| 8 infantry vs 6 | 100% |
| 6 infantry + 2 dragoons each, plain | 48% (43% in a final 120) |
| 10 infantry + 2 dragoons + 2 guns each, plain | 63% (62% in 120; 58% in a further 360) |
| 6 infantry vs 12 militia at equal gold cost | 95% |
| 6 infantry + 2 dragoons each, attacking horse flanks | 65% (68% in 120) |
| Equal infantry, attacker led by a level-4 general | 88% |
| 8 infantry + 2 field guns vs a stone fort | 55% |
| 8 infantry + 2 howitzers, target walls, vs a stone fort | 100% |
| 8 infantry + 2 guns vs a wooden fort | 100% |
| 8 infantry + 1 dragoon + 1 gun vs a free city | 100% |

---

## 7. Diplomacy

| Treaty | Effect |
|---|---|
| Non-aggression pact | Armies can't enter each other's land |
| **Cease-fire** | Stops a war for 4 seasons. If no peace is signed by then, the war resumes |
| Peace | Ends a war |
| Alliance | Allies may join each other's wars |
| Trade pact | Opens a caravan road between capitals. It pays 3 + markets (up to 3) + road length ÷ 2 (up to 3) gold each season. An enemy army on the road stops it |

- **Other actions**: gift 25 gold, demand tribute, declare war.
- **Rules**:
  - One envoy per court per season.
  - Breaking any treaty (cease-fire included) is a betrayal: −50 with the victim, −10 with everyone else, and it's remembered.

**Free cities**:
- **Goodwill** (0–100): a gift gives +15. At 40 you can take a city under **protection**.
  - It pays you 3 gold per season.
  - Others can't attack it without being at war with you.
- **War**: declare war on a city to storm it.
  - Its garrison: 3 battalions, 3 militia and a gun behind city walls.
  - Plunder: 40 gold. Other cities lose 20 goodwill toward you.

---

## 8. Rival AI: the brain

1. **Doctrine**: Militarist, Merchant, Fortifier or Diplomat. Doctrines that did well before get picked more often.
2. **Genome**: five instincts (aggression, war spending, fortifying, expansion, commerce).
3. **Evolution**: the best 12 brains survive each campaign and breed mutated offspring.
   The pool ships pre-trained by 120 self-play campaigns on this map and economy.
4. **Memory of you**: your favourite troops (they counter them), how early you strike (they fortify),
   and treaty trust (they refuse your pacts or strike first).

**Also**:
- The AI declares war on free cities before storming them.
- It courts cities with gifts.
- It appoints generals, grows villages into towns and builds howitzers when its enemies have forts.

**Difficulty** (measured with an AI in your seat, after 120 seasons):

| | Cadet | Colonel | Field Marshal |
|---|---|---|---|
| Rival income | ×0.75 | ×1 | ×1.25 |
| Earliest rival war | season 16 | season 6 | season 3 |
| Brain | raw | evolving | champion |
| Your survival (100 simulations each) | 93% | 62% | 43% |
| Your average land rank (of 6) | 2.66 | 3.42 | 4.27 |

---

## 9. Homepage, settings and sound

- **Art files**: painted monarchs, title scene, battlefield ground, and transparent unit figures sit in `assets/realistic/`; older figure exports, map icons and previews sit elsewhere in `assets/` (see `assets/README.md`).
- **Homepage**: over a painted dusk battle scene with a dark area for the menu.
  - Continue.
  - New campaign: choose your nation and a difficulty.
  - Practice battle.
  - Settings.
  - How to play.
- **Settings**: watch every battle / only your attacks / resolve instantly; battle speed ×1 / ×2 / ×4; sound on or off; separate music and battle sound levels; hear an effects sample; erase rival memory.
- **Sound**: all synthesised, so it works offline.
  - Music: distinct original home, campaign and battle fife phrases, four-chord progressions, bass pulse, strings, brass harmony and marching drums. The battle score uses a D-minor march at about 115 beats/minute. Recent shots, volleys and explosions build string motion and brass accents; intensity eases over five seconds without firing. Fife phrases leave space during heavy combat. Mode changes fade the music bus between phrases.
  - Battle drums: a deeper membrane tone falls from 138 to 62 Hz, supported by a wooden body tone and restrained snare noise. Moving drummers and rally rolls share the score's beat clock; music snares step back while live drummers play. Rally rolls add a short pickup. Live drums remain on the Battle sounds volume control, so muting Music does not mute troops. Pause and battle completion stop field drums and leave quiet harmony; drummer loss removes the live cadence.
  - Mixing: volleys, cannons and explosions briefly lower the music through a separate gain stage, preserving the Music slider setting. Combat timing is unchanged. Audio uses the audio clock, so changing battle speed does not detune or speed up the score.
  - Effects: layered cannon crack, low rumble and echo with distance adjustment; rolling musket volleys; shell whistle and burst; sabre clash, horse hooves and neigh, commands, bugle, moving battalion drummer, subtle wounded voice and distant ambience. The compressor, separate volume controls and event throttles keep crowded battles in range.

---

## 10. Tech

- **Build**: `python3 build.py` assembles
  - `game/shell.html` (markup and styles),
  - `game/script.js` (campaign, AI, drawing),
  - `game/battle.js` (battle simulation),
  - `game/sound.part.js`, and
  - `game/brains.json`

  into `game/musket-crown.html` and `offline/index.html`.
- **Campaign tests**: `node tools/sim.js check 40 normal` (set `TURNS=` to change the season limit).
- **Brain training**: `node tools/sim.js train 120 normal`.
- **Battle balance**: `node tools/battletune.js 60`.
- **Straight to a battle**: open the game with `#practice` at the end of the address to jump into a practice battle.

---

## 11. Decisions log

- Defender's edge in even fights on open ground: **removed** (now about 50/50). Terrain, rivers, forts and digging in still favour the defender.
- Province names on the map: **yes**.
- Generals with traits: **no**.

## 12. Open questions

- Recorded instrumental music remains a possible future direction; the current score is entirely synthesised for offline play.

## Battle update (1 October) — measured with `node tools/battletune.js 30`

| Matchup | Attacker wins |
|---|---|
| 6 infantry vs 6 infantry | 70% (30 battles; earlier runs 40–57%) |
| 6 infantry + 2 dragoons each, plain | 53% |
| Same, attacking horse flanks | 80% |
| 10 infantry + 2 dragoons + 2 guns each | 57% |
| 3 guns vs 6 infantry | 100% |
| 6 infantry vs 12 militia (equal cost) | 100% |
| 8 infantry + 2 guns vs stone star fort | 30% |
| 8 infantry + 2 howitzers vs stone star fort | 100% |
| 8 infantry + 2 guns vs wooden fort | 100% |
| 8 infantry + 1 dragoon + 1 gun vs free city | 13% (bring guns or howitzers) |

Gun ranges: field guns 200, canister 85, howitzers 240 (field 400 × 620). Walls are sections: roundshot does 1.2 to stone, 1.8 to city walls and 3 to timber; a shell does 12; each section has 30 (timber 18). Troops cross only through a breach.

Difficulty after retraining (40 campaigns each, AI in your seat, 120 seasons): Cadet 90% survival, Colonel 73%, Field Marshal 43%.


## Measured battle pace — 4 October 2026

Normal live play advances 0.75 simulation seconds per real second. Infantry moves at 3.2 and cavalry at 12; infantry/field-gun/howitzer reloads are 6.4/9.5/9 seconds. Melee lethality is 0.28. This gives formations and firing cycles more time to read. Pause allows tactical orders; half speed offers additional planning time. Sound and transient effects stop advancing with the paused battle.

Small unseeded 12-trial matchup samples yielded roughly 1½–2⅓ real minutes for matched infantry and combined armies at normal speed; sieges take longer. This is a pacing observation, not a guaranteed match duration or comprehensive balance claim. Music runs more slowly, varies by phrase and briefly recedes during major gun reports.


## Tactical readability and reliability — 5 October 2026

This section supersedes older battle numbers above: howitzer reload 11.5 seconds, wall damage 8, wall-gun collateral radius 25.5. Militia in defensive forest/fort positions or dug in takes 20% less hit probability. Infantry battalion rows use 52-unit separation; cavalry is limited to eight columns.

Instant resolution and watched battles share the live simulation; manual player commands remain a meaningful difference. Completion always resolves the 600-second deadline and retreat. Abandoned guns no longer count as combat strength. Rally nearby restores 18 morale within 150 units of a living commander, once per 60 simulation seconds. Guided practice introduces selection, advancing, pausing and flanking. Further human balance and phone-speaker evaluation remain unverified.


## Contextual help, battle explanations and recovery — 8 October 2026

This section supersedes older capital-loss and opening-flow descriptions.

- The campaign remains freeform: no ambition system or scripted opening was added. Dismissible help appears for army movement, recruiting sites, and foreign lands/Diplomacy. Settings can disable or re-enable it. How to play remains available, but no longer interrupts every new campaign.
- Continue includes season-one campaigns and preserves their actions. The automatic home-screen preview is not treated as a started campaign. Older v4 saves remain supported.
- Choose an opening doctrine with any crown: Combined arms (4 infantry, 1 dragoon, 1 militia; 120 gold), Cavalry column (3 dragoons; 125 gold), or Gun train (4 infantry, 1 militia, 2 field guns; 88 gold). Cadet still adds 60 gold. These trade starting troops against treasury at ordinary recruitment costs. There are no permanent nation stat buffs or general traits. Adding foot/guns to a cavalry army reduces its remaining movement allowance.
- Each crown gets one capital-recovery opportunity if a safe owned province remains. The captured capital becomes an occupied town and the conqueror takes half the treasury. A temporary court in remaining territory grants +8 income, 12 population capacity, and capital recruitment. The crown keeps its other land and armies and has three full subsequent seasons to retake its original capital. The loss season does not decrement the timer. Recapture restores the capital; expiry, loss of the final province, or a second capital loss eliminates the crown. The rule applies to rivals as well as the player. The temporary court can relocate if its province falls. Recovery is saved and its remaining deadline is always visible.
- Armies receive persistent names and service records; splits begin a new detachment record. General records track battles, victories, successful defences, retreats survived and death/return to court. The Chronicle retains records and recent battle explanations. Legacy victories are not invented; existing general experience stays intact.
- Diplomacy records actual declarations, betrayals, peace and trade agreements. Betrayals by the player are also remembered across campaigns and shown in Council. Rival learning details remain available under a disclosure.
- Battle feedback explains blocked firing lines, formation deployment, fatigue, morale, crew losses, wall obstruction and river movement. Reports distinguish the actual end trigger from observed turning points, including officer/colour/general losses and damaging flank attacks. Instant and watched battles collect the same evidence. No counterfactual victory claims are generated.
- Pause/Resume and Rally stay outside the scrolling command panel. More orders reveals advanced commands. Selected formations are outlined above smoke, with marked destinations and targets. A new order replaces the old target/destination. Status refreshes preserve command buttons instead of rebuilding them while a player is trying to tap.

Validation: `node tools/engagement_check.js` covers season-one resume, context help, mounted movement after recruitment, recovery expiry/recapture/relocation/save-load, persistent histories, recorded battle evidence, legacy saves and order replacement. Existing battle/startup/projection checks and short campaign simulations are also run. Human enjoyment, long-campaign balance and physical-phone performance still need playtesting.

## Battle movement, musicians and casualties — 8 October 2026

- Foot spacing is now 9.4–10.4 across a line, 9.4 in a column and 12 between ranks. Horse uses 15 across and 18 between ranks. Open-field deployment normally uses at most three battalions per row. Oversized formations use deeper ranks within their assigned lane; row distances account for their depth (minimum 56). Original firing cohorts are retained, so deeper visual ranks do not silently lose musket fire. Officers, colours and drummers stand clear of the ranks. Foot and mounted sprites use smaller, consistent scales. Bounded friendly personal-space corrections reduce merging during formation changes; close combat and very large armies can still partly obscure figures.
- Individual stride phases advance with distance travelled. Soldiers ease into their positions; melee uses continuous small movement instead of fresh random jitter every tick. Rendering interpolates the fixed simulation positions, while pause displays a stable current position. Combat orders, fixed-step timing and battle pace remain shared by watched and instant resolution.
- Living drummers recover 0.8 morale/second for their own formation (previously 0.5). **Drum rally**, on selected foot formations, adds 2 morale/second for 8 simulation seconds, capped at 100 morale, and has a 45-second cooldown. The formation halts and ceases fire, then resumes its prior orders. It cannot start while routing, broken, in melee or within 28 units of an enemy. An enemy closing within that distance interrupts the rally. Losing the drummer stops the effect and passive drum recovery, with a visible explanation and −5 morale shock. AI formations can use the same action below 55 morale. The existing commander's instant Rally nearby is separate.
- Rallying drummers have a faster stick animation, a distinct drum roll, expanding gold pulses and an on-field label. The contextual button shows active/cooldown/lost states. Multi-selection advice is deduplicated and critical combat advice precedes passive drummer help.
- Human and mounted casualties retain their upright figure during an 0.85-second fall, blending into a persistent fallen sprite on landing. Shell casualties and crew killed with an exploding gun use a 1.15-second outward trajectory and airborne arc, followed by landing dust. Effects are depth-sorted with troops and terrain, stop advancing during pause, and are bounded in number. Missing corpse art has a simple fallback. Visual scatter and animation do not postpone damage or morale loss.

Validation: all eight automated checks, including `tools/battle_feel_check.js` for recovery amount, cooldown, action cost, unsafe activation, drummer loss, gradual separation, moving sprite rendering, source propagation and casualty lifecycle. Browser practice checks cover 390×844 and desktop layouts, live movement, combat casualties and drummer controls. A 2,454-figure, 120-tick simulation sample averaged about 8ms per tick on the development machine; this excludes rendering and is not a phone performance claim. Physical-device performance, speaker quality and human assessment of battle feel remain unverified.

## Battle reactions and formation commands — 8 October 2026

- Hits record their direction and trigger a short body recoil and wound flash, including the opening of a fatal fall. Foot charges articulate the legs beneath the bayonet pose, with stronger stride, body lean and bounce; mounted charges also lean and bounce with the gallop.
- Form line and March column preserve the current order and destination while figures walk into their assigned places. With Hold position, the battalion anchor stays still; Advance continues after forming. Selected formations show destination slots and forming progress. Live drummers play during deployment. Fire waits at least 2.6 simulation seconds and until 90% of surviving figures are within four field units of their assigned places. Close combat interrupts the deployment state.
- Fire when ready explicitly selects line formation, clears movement orders and holds position. It chooses an unobstructed enemy in musket range when available, respects reload time and friendly masking, and never advances or automatically storms a nearby gun.
- Empty-ground and outside taps clear selection. Move to… explicitly arms destination placement; dragging formations still works. Buttons, tactical pause, zoom and the command panel do not cancel selection.

Validation: simulation checks for gradual formation changes, completed deployment, firing/range/reload/masking gates and directional hits; renderer checks for hit flinch and articulated charging; audio checks for formation drumming; interaction checks for empty-ground/outside deselection and explicit movement. Browser checks cover desktop and 390×844 touch layouts, column-to-line commands, pause, charging and selection cancellation.

## Fixed bayonets — 8 October 2026

- Select infantry or militia and use **Fix bayonets**. The battalion forms a line and holds position for three simulation seconds without firing. A countdown, hand/blade animation and ready stance show progress. Bayonets remain fixed through later movement, formation and fire orders; a queued Charge starts after preparation finishes.
- Fixed bayonets multiply infantry melee hit probability by 1.25. A settled line with morale at least 30, no movement destination, and Stand / Hold / Fire when ready / Dig in orders takes 40% fewer frontal cavalry melee hits. This protection is lost while moving, forming, wavering, routing or attacked from a flank/rear. It is a line defence, not an infantry square.
- Preparation cannot begin during melee, routing, Drum rally, within 28 field units of an enemy, or after battle completion. An enemy closing inside 28 or a rout interrupts incomplete preparation. AI infantry use the same preparation before charges or when cavalry is approaching.
- Checks cover preparation duration and cost, unsafe activation, duplicates, interruption, queued charges, persistent melee bonus, frontal-only protection and loss of brace eligibility. Infantry/militia rendering and the live command/countdown/ready transition are checked.

## Small-arms firing ranges — 8 October 2026

| Troops | Previous range | Current range |
|---|---:|---:|
| Line infantry | 115 | 130 |
| Militia | 115 | 105 |
| Dragoons | 75 | 80 |

These are game paces, chosen to distinguish battlefield roles. One per-type range function controls actual firing, distance-based accuracy, approach/holding distances, column-to-line deployment, Fire when ready targeting and out-of-range advice. Selected troops show their range. Hussar pistols stay at 45, field guns at 200 and howitzers at 240. Reload times and base damage are unchanged.

Validation: exact/inside/outside firing boundaries for both sides; approach into each unit's firing range; infantry outranging militia; Fire when ready choosing an available in-range target; range advice and unchanged artillery/hussar values. Existing orders, bayonets, campaign integration, startup and battle completion checks pass.


## Campaign development, intelligence and battle control — 8 October 2026

- Recruitment is paid up front (gold and one person; militia also costs 2 popularity). Militia take 1 season; line infantry 2; dragoons and field guns 3; howitzers 4. Training runs in parallel, joins the army at the recruiting province, and begins upkeep on arrival. Hired hussars remain immediate. Enemy occupation delays arrival; capture destroys training immediately, even if recaptured. Rival recruitment follows the same timing.
- Construction takes 1 season for farms, sawmills, houses and wooden forts; 2 for mines, markets, churches and barracks; 3 for foundries and stone forts. One project per province. Existing buildings remain active during upgrades. Capture or revolt loses unfinished work without a refund; occupied sites wait to complete. Progress bars in Orders and Realm expose elapsed/total seasons and percentage, with accessible progress semantics.
- Level 2 barracks unlock dragoons, never artillery. Basic foundries cast field guns; level 2 unlocks howitzers. Level 2 upgrades take 2 seasons and cost 65% of the base cost rounded up (36 gold for barracks, 52 for foundries). Economic upgrades add 50% building income; housing capacity and church popularity double. Villages become towns for 60 gold over 2 seasons; wooden forts become stone forts for 65 gold over 3 seasons. Stone forts have no further upgrade. Existing v4 buildings default to level 1 and existing armies remain intact.
- Orders and Realm explain cannon recruitment and offer a direct shortcut to a foundry, its construction site, or suitable empty owned land. A field gun costs 26 gold and one person, with 3 seasons of training.
- Built roads coexist with buildings, cost 20 gold, and take 1 season. A move between adjacent completed road provinces costs 0.5 movement points, giving foot/gun armies up to 2 and mounted armies up to 4 such moves each season. Combat costs 1 and ends movement; rivers still end movement. Only completed roads affect travel. Roads are visible on the map. Caravan trade paths remain a separate system and do not require road construction.
- Before a player attack, Cancel attack preserves troops at their starting province and ends movement, including when a detachment was selected. When attacked, a field army can withdraw to an empty friendly adjacent province other than the attacker's origin. It loses no troops but surrenders the province and garrison. No retreat is offered without a safe destination. Battle settings do not bypass this decision; headless simulations continue automatically.
- Enemy map counters and diplomacy no longer disclose exact strengths. A spy mission against a selected foreign army costs 20 gold, with 75% success and one attempt per army per season. Capture provides no new report, loses the payment and reduces bilateral relations by 15. Successful intelligence is a saved snapshot of composition, strength, province and season; it never silently updates with reinforcements and is marked outdated after 2 seasons. Diplomacy provides army scouting shortcuts. AI's existing strategic evaluation retains full information.
- Envoys improve a crown's relations or a free city's goodwill by up to 10 for 10 gold, once per target per season, while peaceful. Independent cities accept trade at 20 goodwill if a land path connects them to the capital. Open city routes earn 2–6 gold/season; hostile armies block them, war with a protector suspends them, and direct city war or conquest ends the pact. City gifts and protection remain separate actions.
- Incoming peace offers support Accept peace, Reject, or gold demands (up to 25, 50 or 100, limited by the rival's treasury). Acceptance depends on treasury and relative strength: min(treasury, floor(35% treasury + 2 × positive player strength advantage)). Refusal preserves the original offer. Acceptance transfers the payment exactly once and signs peace. Stable sender/type matching prevents stale clicks answering a different envoy. Empty reports now close after the last refusal; every report includes a return-to-orders button.
- Battle orders and formation choices are independent. Form line / March column / Automatic do not clear an Advance order or explicit destination. Hold position plus a formation choice forms in place. Fire when ready explicitly requests a line and halts. Fix bayonets still clears movement and pauses fire for preparation. The panel separates troop selection, formation, orders, and support actions; active choices and short command explanations are visible, with Pause always outside the scrolling panel.
- Painted action changes blend over 0.24 seconds, fast walk/gallop frames over 0.085 seconds, and howitzer deployment over 0.45 seconds. Movement/charge lean, gun crew work, gun movement and drummer tempo ease between states using simulation time. Support figures and mounted commanders articulate their strides. Pausing freezes transitions. These are canvas sprite/procedural transitions, not a new graphics engine.

Validation: campaign options/expansion, peace/levy/animation, engagement, battle controls, bayonets, battle feel, visual spacing, gun crew, firing range and startup checks; a 12-season headless campaign completed without errors. Browser checks covered militia costs, two recruitment durations, foundry construction and cannon recruitment during upgrades, progress bars, independent formation/Advance selection, phone controls, spy capture and peace rejection/refused/accepted reparations. Long-campaign balance and physical-phone animation performance still need playtesting.


Strategy-map selection can be cancelled by tapping the selected army's province again, choosing Deselect army, or pressing Escape with the map active. Deselecting clears movement highlights and half-army mode without spending moves. Diplomacy now includes a collapsible military-power ranking and comparison bars: player power is exact; rival power rounds to 10, equal estimates share a rank, and each entry lists controlled provinces. This compares field armies; spy reports remain the source of exact rival army composition.

## Rule corrections — 15 October 2026

Howitzers obey their 240-pace range on either side and deploy without moving under Hold position. All foot soldiers participate in three firing cohorts even when their visual formation has more ranks. Cavalry melee uses current flank geometry (×1.5 side, ×2 rear); completing a flank waypoint grants no permanent damage multiplier. Intact walls block melee until a nearby breach opens, while musket fire remains possible. Abandoned guns cannot retaliate.

Merged armies obey their resulting movement allowance and accumulated march distance, and entering a river ends movement even when merging. Wage desertion is rounded across the crown before allocating losses to armies, with at least one unit lost for a nonempty unpaid force; splitting detachments cannot eliminate desertion. Diplomatic offers become invalid when their relationship prerequisites change.

See [the sweep report](GRAPHICS_GAMEPLAY_SWEEP.md) for animation changes, completed terrain/facing implementation, repeatable balance measurements and validation limits.


## Graphics and strategy follow-up — 15 October 2026

Small forts use a shared figure-representation scale (at most 180 nominal defender figures before staff/gun rounding), measured courtyard/exterior placement, and adaptive figure/spacing reduction for extreme custom armies. Supporting troops outside the walls receive no wall cover. Courtyard building art yields to troop placement. Capital cities retain their larger deployment area.

Forest cover regions are shared by rendering and simulation; hill cover matches the raised ellipse (centre 200,205, radii 190,82). Cover is positional for both sides. Infantry have a front vector, rotated line/column offsets and a front firing arc (dot product ≥0.25). Face toward halts and reforms infantry; the existing formation completion and firing gates apply. Automatic commands turn as needed, while explicit facing remains held until replaced. Bayonet defence and flank/rear multipliers use that vector. Friendly fire masking measures the actual target ray.

Campaign presentation interpolates friendly arrivals without delaying state changes. Completion feedback waits behind reports and season processing, honours reduced motion and clears on a new campaign. All overlays have focus isolation, keyboard containment and focus restoration.

See the sweep report for the current paired-seed balance results and cost comparisons. These supersede older unseeded diagnostic tables; human playtesting remains necessary.
