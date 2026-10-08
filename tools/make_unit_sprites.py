"""Prepare compact transparent battlefield sprites from the painted source figures.

Run with a Python environment that has Pillow and NumPy. The resulting WebP
files are committed game assets; build.py does not need these dependencies.
"""
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1] / "assets" / "realistic"
SOURCES = ROOT / "unit-sources"
OUTPUT = ROOT / "units"
COATS = {
    "prussia": (34, 58, 110),
    "britain": (179, 38, 30),
    "france": (143, 185, 226),
    "austria": (226, 225, 219),
    "russia": (47, 94, 44),
    "sweden": (42, 90, 168),
    "free-city": (107, 74, 46),
}
FACING = {
    "prussia": (201, 165, 92), "britain": (43, 76, 155),
    "france": (179, 38, 30), "austria": (179, 38, 30),
    "russia": (179, 38, 30), "sweden": (226, 181, 58),
    "free-city": (232, 224, 204),
}
SIZES = {"infantry": (216, 320), "infantry-march": (216, 320),
         "infantry-fire": (320, 320), "infantry-reload": (216, 320),
         "infantry-charge": (320, 320), "infantry-flee": (250, 320),
         "cavalry": (360, 316), "cavalry-gallop": (360, 316),
         "cavalry-gallop2": (380, 316), "cavalry-melee": (380, 316),
         "artillery": (360, 260), "howitzer-limbered": (400, 260),
         "fallen-infantry": (400, 210), "gun-crew": (216, 320),
         "officer": (216, 320),
         "general": (400, 340), "aide": (360, 330)}
SPECIAL_SIZES = {"militia": (216, 320), "militia-march": (216, 320),
                 "militia-fire": (300, 320), "militia-reload": (216, 320),
                 "militia-charge": (300, 320), "militia-flee": (250, 320),
                 "hussar": (360, 330), "hussar-gallop": (360, 330),
                 "hussar-gallop2": (380, 330), "hussar-melee": (380, 330),
                 "fallen-horse": (420, 280), "fallen-hussar": (420, 280),
                 "howitzer-deployed": (420, 300)}
SIZES.update({f"infantry-walk{i}": (216, 320) for i in range(1, 5)})
SPECIAL_SIZES.update({f"militia-walk{i}": (216, 320) for i in range(1, 5)})


def trimmed(name):
    image = Image.open(SOURCES / f"{name}.png").convert("RGBA")
    alpha = image.getchannel("A")
    box = alpha.point(lambda value: 255 if value > 12 else 0).getbbox()
    if not box:
        raise ValueError(f"{name}: no visible artwork")
    pad = max(5, round(max(image.size) * .018))
    box = (max(0, box[0] - pad), max(0, box[1] - pad),
           min(image.width, box[2] + pad), min(image.height, box[3] + pad))
    image = image.crop(box)
    image.thumbnail((SIZES | SPECIAL_SIZES)[name], Image.Resampling.LANCZOS)
    return image


def colored(image, coat):
    pixels = np.asarray(image, dtype=np.float32).copy()
    rgb = pixels[:, :, :3]
    red, green, blue = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    dominance = np.clip(np.minimum((blue - red * 1.03) / 14,
                                   (blue - green * 1.01) / 12), 0, 1)
    saturation = (np.max(rgb, axis=2) - np.min(rgb, axis=2)) / np.maximum(np.max(rgb, axis=2), 1)
    mask = dominance * np.clip((saturation - .07) * 8, 0, 1)
    mask *= (pixels[:, :, 3] > 10)
    luminance = .21 * red + .72 * green + .07 * blue
    shade = np.clip(.55 + luminance / 95, .45, 1.6)
    target = np.asarray(coat, dtype=np.float32)[None, None, :] * shade[:, :, None]
    rgb[:] = rgb * (1 - mask[:, :, None]) + target * mask[:, :, None]
    return Image.fromarray(np.uint8(np.clip(pixels, 0, 255)), "RGBA")


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for kind in SIZES:
        source = trimmed(kind)
        for nation, coat in COATS.items():
            image = source if nation == "prussia" else colored(source, coat)
            path = OUTPUT / f"{nation}-{kind}.webp"
            image.save(path, "WEBP", quality=84, method=6)
            print(path.relative_to(ROOT.parent.parent), image.size, path.stat().st_size)
    infantry = trimmed("infantry")
    for nation, facing in FACING.items():
        image = colored(infantry, facing)
        path = OUTPUT / f"{nation}-drummer.webp"
        image.save(path, "WEBP", quality=84, method=6)
        print(path.relative_to(ROOT.parent.parent), image.size, path.stat().st_size)
    for kind in SPECIAL_SIZES:
        image = trimmed(kind)
        path = OUTPUT / f"{kind}.webp"
        image.save(path, "WEBP", quality=84, method=6)
        print(path.relative_to(ROOT.parent.parent), image.size, path.stat().st_size)


if __name__ == "__main__":
    main()
