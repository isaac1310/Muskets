# Musket & Crown — art assets

The game uses painted images for its monarch portraits, title screen, battle ground, and live battlefield figures. Those source images are in `realistic/` and are embedded by `build.py` so the single-file and installed versions work offline.

The older `portraits/` SVG and PNG set, unit sprites, and map art are exports of the game's drawing code. They remain useful for editing and review. The game retains drawn battle figures as a loading fallback. Map symbols, city walls, wooden palisades, and star forts are drawn by the game.

To re-export after changing the game:

```
python3 build.py
python3 tools/export_server.py
```

Then, in another terminal, open `http://localhost:8766/index.html#export` in Chrome, or headless:

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --window-size=1080,1920 --virtual-time-budget=60000 --dump-dom "http://localhost:8766/index.html#export"
```

## What's here

| Folder | Contents |
|---|---|
| `realistic/portraits/` | Six painted monarch portraits used in the game |
| `realistic/home-battle.jpg` | Painted title screen background |
| `realistic/battle-ground.jpg` | Painted field texture used behind live battles |
| `realistic/tree-sources/`, `realistic/trees/` | Original transparent oak and pine paintings and compact WebP trees embedded into the battlefield |
| `realistic/building-sources/`, `realistic/buildings/` | Painted timber cottages and stone townhouses in intact and shell-damaged states; `tools/make_building_sprites.py` rebuilds the WebP sprites |
| `realistic/effect-sources/`, `realistic/effects/` | Painted cannon flash, impact dust and wall rubble; `tools/make_effect_sprites.py` rebuilds them |
| `realistic/unit-sources/` | Editable transparent paintings for standing, movement, firing, reloading, bayonet, fleeing, roles, artillery, casualties, militia and hussars |
| `realistic/units/` | Compact WebP sprites embedded in the game, including national variants of regulars, officers, generals, aides and gun crew, plus a deployed howitzer and fallen horses and hussars. Run `tools/make_unit_sprites.py` after editing a source. |
| `realistic/standard-sources/`, `realistic/standards/` | Seven painted national colour-bearers and compact WebP sprites. Run `tools/make_standard_sprites.py` after editing a source. |
| `realistic/unit-design-preview.png` | Original painted unit design concept |
| `portraits/` | The six rulers, 512×640, as SVG (editable vector) and PNG, each with a neutral, friendly and hostile expression |
| `units/<nation>/` | 19 sprites per nation: infantry (standing, two marching frames, firing, bayonet), officer, colour-bearer, drummer, militia (standing, marching), dragoon (standing, charge, standard), hussar (standing, charge), field gun, howitzer (limbered and deployed), general |
| `units/<nation>-sprite-sheet.png` | The same 19 sprites in one row |
| `units/free-city-guard.png` | Free-city militia and guard |
| `map/campaign-map.png` | A full campaign map at 1260×1440 (a new one is generated every campaign) |
| `map/icons/` and `map/icons-sheet.png` | Map icons: capital, free city, town, village, farm, sawmill, mine, market, houses, church, barracks, foundry, wooden fort, stone star fort |
| `art/homepage.png` | The dusk battle painting from the homepage, 1080×1920 |
| `art/battle-scene.png` | A live battle in progress (Prussia storming a walled city) |
| `nations.json` | Every nation's map colour, border colour, uniform coat and facings, ruler and generals |

### Final battle additions (4 October 2026)

- `realistic/unit-sources/infantry-walk-sheet.png` and `militia-walk-sheet.png`: four-frame painted source sheets, with individual `*-walk1.png` through `*-walk4.png` crops. `tools/make_unit_sprites.py` produces 28 national infantry frames and four militia frames.
- `realistic/wall-sources/stone.png` and `timber.png`: painted material crops. Their 384×384 WebP versions in `realistic/walls/` are embedded by `build.py` and clipped onto fort faces.
- The live renderer cycles walking and horse frames, animates surviving gun crews, and adds water wakes and staged blast fragments.
