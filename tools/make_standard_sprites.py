"""Make compact national colour-bearer sprites from transparent paintings."""
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1] / "assets" / "realistic"
NATIONS = ("prussia", "britain", "france", "austria", "russia", "sweden", "free-city")


def main():
    output = ROOT / "standards"
    output.mkdir(parents=True, exist_ok=True)
    for nation in NATIONS:
        image = Image.open(ROOT / "standard-sources" / f"{nation}.png").convert("RGBA")
        visible = image.getchannel("A").point(lambda a: 255 if a > 18 else 0)
        box = visible.getbbox()
        if box is None:
            raise ValueError(f"No visible colour bearer for {nation}")
        image = image.crop(box)
        image.thumbnail((300, 380), Image.Resampling.LANCZOS)
        path = output / f"{nation}.webp"
        image.save(path, "WEBP", quality=84, method=6)
        print(nation, image.size, path.stat().st_size)


if __name__ == "__main__":
    main()
