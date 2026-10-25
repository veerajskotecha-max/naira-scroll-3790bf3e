"""Pad the 4:5 campaign stills out to 9:16 for vertical video.

A centre-crop from 4:5 to 9:16 would cut ~28% off each side, and these frames
carry their scale referents — the cardamom pod, the peppercorn, the dried rose —
out near the edges. Losing those loses the whole point of the shot. So the frame
is kept whole and the tall format is made by extending the ground colour above
and below, sampled from the plate's own top and bottom rows. The bands double as
the copy shelves for the type.
"""
import os

from PIL import Image, ImageFilter

SRC = "/home/user/naira-scroll-3790bf3e/naira-flore-campaign"
OUT = ("/tmp/claude-0/-home-user-naira-scroll-3790bf3e/"
       "1171b414-e279-55a3-bd3a-591f6de1e021/scratchpad/vid/plates")

W, H = 1080, 1920

SHOTS = [
    ("s1", "softly-slowly-worn/08-terracotta.png"),
    ("s2", "softly-slowly-worn/07-khadi.png"),
    ("s3", "softly-slowly-worn/06-cardamom.png"),
    ("s4", "ii-still-water/W01-emerald-drop-earrings.png"),
    ("s5", "ii-still-water/W04-halo-bloom-ring.png"),
    ("s6", "softly-slowly-worn/09-jaali.png"),
]


def band(strip, height):
    """Grow a 1px edge strip into a soft band of the same colour."""
    return strip.resize((W, max(height, 1)), Image.BICUBIC).filter(
        ImageFilter.GaussianBlur(24))


def main():
    os.makedirs(OUT, exist_ok=True)
    for tag, rel in SHOTS:
        im = Image.open(os.path.join(SRC, rel)).convert("RGB")
        im = im.resize((W, round(W * im.height / im.width)), Image.LANCZOS)
        top = (H - im.height) // 2
        canvas = Image.new("RGB", (W, H))
        canvas.paste(band(im.crop((0, 0, W, 1)), top), (0, 0))
        canvas.paste(band(im.crop((0, im.height - 1, W, im.height)), H - top - im.height),
                     (0, top + im.height))
        canvas.paste(im, (0, top))
        p = os.path.join(OUT, "%s.png" % tag)
        canvas.save(p)
        print(tag, canvas.size, os.path.basename(rel))


if __name__ == "__main__":
    main()
