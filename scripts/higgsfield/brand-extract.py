"""Pull the real wordmark and floral glyph out of the brand deck as alpha PNGs.

Both live in the deck as flat cream artwork on a flat sage panel, which makes a
clean key: sample the panel colour, take each pixel's distance from it, and use
that as alpha. No font file is needed and no redraw happens — the shapes are the
deck's own, which is the point. The deck forbids altering the wordmark's
proportions, so everything downstream only ever scales it uniformly.
"""
import os

import fitz
import numpy as np
from PIL import Image

PDF = ("/root/.claude/uploads/1171b414-e279-55a3-bd3a-591f6de1e021/"
       "8f7ff162-Naira_Flore___Brand_Deck.pdf")
OUT = ("/tmp/claude-0/-home-user-naira-scroll-3790bf3e/"
       "1171b414-e279-55a3-bd3a-591f6de1e021/scratchpad/brand")
DPI = 600

# page (1-based), crop as fractions of the page (l, t, r, b), output name
CROPS = [
    (6, (0.062, 0.33, 0.258, 0.74), "wordmark"),   # the DO panel: cream on sage
    (7, (0.545, 0.075, 0.955, 0.915), "flower"),   # stand-alone mark, inside the frame rule
]


def key_out(im, tol=26):
    """Alpha from distance to the flat panel colour sampled at the corners."""
    a = np.asarray(im.convert("RGB")).astype(np.int16)
    h, w, _ = a.shape
    corners = np.concatenate([a[:8, :8].reshape(-1, 3), a[:8, -8:].reshape(-1, 3),
                              a[-8:, :8].reshape(-1, 3), a[-8:, -8:].reshape(-1, 3)])
    bg = np.median(corners, axis=0)
    dist = np.sqrt(((a - bg) ** 2).sum(axis=2))
    alpha = np.clip((dist - tol) / 40.0, 0, 1)
    # Guard against a crop that clipped the panel edge and sampled page cream
    # instead of the sage ground: the mark always covers a minority of its
    # panel, so coverage above half means the key came out inverted.
    if alpha.mean() > 0.5:
        alpha = 1.0 - alpha
    # the art is cream on sage, so recolour to pure white and carry alpha;
    # anything downstream tints it to the exact brand cream it needs.
    rgba = np.zeros((h, w, 4), np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = (alpha * 255).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def trim(im, pad=0):
    bbox = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    return im.crop((max(l - pad, 0), max(t - pad, 0),
                    min(r + pad, im.width), min(b + pad, im.height)))


def main():
    os.makedirs(OUT, exist_ok=True)
    doc = fitz.open(PDF)
    for pno, (fl, ft, fr, fb), name in CROPS:
        page = doc[pno - 1]
        pix = page.get_pixmap(dpi=DPI)
        im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        box = (int(fl * pix.width), int(ft * pix.height),
               int(fr * pix.width), int(fb * pix.height))
        art = trim(key_out(im.crop(box)))
        art.save(os.path.join(OUT, "%s-cream.png" % name))
        print("%-10s %s" % (name, art.size))

    # the deck's own palette, sampled off the rendered pages
    pix = doc[7].get_pixmap(dpi=150)
    p8 = np.asarray(Image.frombytes("RGB", (pix.width, pix.height), pix.samples))
    print("cream sample", p8[20, 20], "(deck states #FFF8F5)")


if __name__ == "__main__":
    main()
