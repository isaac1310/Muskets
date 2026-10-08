"""Make compact transparent battlefield effect sprites from painted PNG sources."""
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1] / "assets" / "realistic"


def main():
    output = ROOT / "effects"
    output.mkdir(parents=True, exist_ok=True)
    for name in ("cannon-flash", "impact-dust", "breach-rubble"):
        image = Image.open(ROOT / "effect-sources" / f"{name}.png").convert("RGBA")
        visible = image.getchannel("A").point(lambda a: 255 if a > 18 else 0)
        box = visible.getbbox()
        if box is None:
            raise ValueError(f"No visible pixels in {name}")
        image = image.crop(box)
        image.thumbnail((420, 360), Image.Resampling.LANCZOS)
        path = output / f"{name}.webp"
        image.save(path, "WEBP", quality=84, method=6)
        print(path, image.size, path.stat().st_size)


if __name__ == "__main__":
    main()
