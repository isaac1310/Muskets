"""Assemble the game from its parts.
   game/shell.html  page markup and styles
   game/script.js   campaign, AI, rendering, sound
   game/battle.js   live battle simulation (no DOM)
   game/sound.part.js  synthesised music and effects
   game/brains.json pre-trained rival brains (optional)
Writes game/musket-crown.html (single page) and offline/index.html (installable, works offline)."""
import pathlib, json, base64
root = pathlib.Path(__file__).parent
g = root / "game"
script = (g / "script.js").read_text().replace("/*__BATTLE__*/", (g / "battle.js").read_text()).replace("/*__SOUND__*/", (g / "sound.part.js").read_text())
art_dir = root / "assets" / "realistic"
portrait_names = ["prussia-frederick-ii", "britain-george-ii", "france-louis-xv", "austria-maria-theresa", "russia-elizabeth", "sweden-frederick-i"]
def image_data(path):
    mime = "image/webp" if path.suffix == ".webp" else "image/jpeg"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode("ascii")
unit_nations = ["prussia", "britain", "france", "austria", "russia", "sweden", "free-city"]
art = {"portraits": [image_data(art_dir / "portraits" / (name + ".jpg")) for name in portrait_names],
       "home": image_data(art_dir / "home-battle.jpg"),
       "ground": image_data(art_dir / "battle-ground.jpg"),
       "units": {kind: [image_data(art_dir / "units" / f"{nation}-{kind}.webp") for nation in unit_nations]
                 for kind in ("infantry", "infantry-march", "infantry-fire", "infantry-reload", "infantry-charge", "infantry-flee", "cavalry", "cavalry-gallop", "cavalry-gallop2", "cavalry-melee", "artillery", "howitzer-limbered", "drummer", "fallen-infantry", "gun-crew", "officer", "general", "aide")}}
art["units"]["colour-bearer"] = [image_data(art_dir / "standards" / f"{nation}.webp") for nation in unit_nations]
for frame in range(1, 5):
    art["units"][f"infantry-walk{frame}"] = [image_data(art_dir / "units" / f"{nation}-infantry-walk{frame}.webp") for nation in unit_nations]
    art["units"][f"militia-walk{frame}"] = image_data(art_dir / "units" / f"militia-walk{frame}.webp")
art["units"].update({kind: image_data(art_dir / "units" / f"{kind}.webp") for kind in ("militia", "militia-march", "militia-fire", "militia-reload", "militia-charge", "militia-flee", "hussar", "hussar-gallop", "hussar-gallop2", "hussar-melee", "fallen-horse", "fallen-hussar", "howitzer-deployed")})
art["effects"] = {name: image_data(art_dir / "effects" / f"{name}.webp") for name in ("cannon-flash", "impact-dust", "breach-rubble")}
art["buildings"] = {name: image_data(art_dir / "buildings" / f"{name}.webp") for name in ("timber-cottage", "stone-townhouse", "timber-cottage-destroyed", "stone-townhouse-destroyed")}
art["trees"] = {name: image_data(art_dir / "trees" / f"{name}.webp") for name in ("oak", "pine")}
art["walls"] = {name: image_data(art_dir / "walls" / f"{name}.webp") for name in ("stone", "timber")}
import hashlib, datetime
version = (root / "VERSION").read_text().strip()
stamp = hashlib.md5((script + version).encode()).hexdigest()[:7]
script = script.replace("/*__VERSION__*/'dev'", json.dumps(f"{version} · {stamp} · {datetime.date.today().isoformat()}"))
script = script.replace("/*__REALISTIC_ART__*/null", json.dumps(art, separators=(",", ":")))
pop = g / "brains.json"
if pop.exists():
    script = script.replace("/*__DEFAULT_POP__*/const DEFAULT_POP=[];", "const DEFAULT_POP=" + pop.read_text().strip() + ";")
page = (g / "shell.html").read_text() + "<script>\n" + script + "\n</script>\n"
(g / "musket-crown.html").write_text(page)
title_end = page.index("</style>") + len("</style>")
head = """<!doctype html>
<html lang="en"><head>
<meta name="theme-color" content="#141b18">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-192.png">
<style>*{box-sizing:border-box}body{margin:0}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);height:100%;box-sizing:border-box}[hidden]{display:none!important}</style>
"""
tail = "\n<script>if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{})</script>\n</body></html>"
(root / "offline" / "index.html").write_text(head + page[:title_end] + "\n</head><body>\n" + page[title_end:] + tail)
sw = root / "offline" / "sw.js"
s = sw.read_text()
import re, hashlib
s = re.sub(r"const C='musket-crown-[^']*'", "const C='musket-crown-" + hashlib.md5(page.encode()).hexdigest()[:8] + "'", s)
sw.write_text(s)
print("built", len(page), "bytes")
