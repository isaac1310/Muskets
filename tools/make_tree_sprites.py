"""Make compact transparent WebP battle trees from the painted PNG sources."""
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1] / "assets" / "realistic"


def main():
    output = ROOT / "trees"
    output.mkdir(parents=True, exist_ok=True)
    for name in ("oak", "pine"):
        image = Image.open(ROOT / "tree-sources" / f"{name}.png").convert("RGBA")
        alpha = image.getchannel("A").point(lambda value: 255 if value > 18 else 0)
        bounds = alpha.getbbox()
        if bounds is None:
            raise ValueError(f"No visible pixels in {name}")
        image = image.crop(bounds)
        image.thumbnail((320, 420), Image.Resampling.LANCZOS)
        path = output / f"{name}.webp"
        image.save(path, "WEBP", quality=84, method=6)
        print(path, image.size, path.stat().st_size)


if __name__ == "__main__":
    main()
