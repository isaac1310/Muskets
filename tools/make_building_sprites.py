"""Make compact transparent WebP house sprites from the painted PNG sources."""
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1] / "assets" / "realistic"
SOURCE = ROOT / "building-sources"
OUTPUT = ROOT / "buildings"


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for name in ("timber-cottage", "stone-townhouse", "timber-cottage-destroyed", "stone-townhouse-destroyed"):
        image = Image.open(SOURCE / f"{name}.png").convert("RGBA")
        visible = image.getchannel("A").point(lambda alpha: 255 if alpha > 12 else 0)
        box = visible.getbbox()
        if box is None:
            raise ValueError(f"No visible pixels in {name}")
        pad = 14
        image = image.crop((max(0, box[0] - pad), max(0, box[1] - pad),
                            min(image.width, box[2] + pad), min(image.height, box[3] + pad)))
        image.thumbnail((420, 420), Image.Resampling.LANCZOS)
        path = OUTPUT / f"{name}.webp"
        image.save(path, "WEBP", quality=86, method=6)
        print(path, image.size, path.stat().st_size)


if __name__ == "__main__":
    main()
