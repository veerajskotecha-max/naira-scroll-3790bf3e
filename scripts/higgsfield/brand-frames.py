"""Lay the real wordmark and floral glyph onto the ad frames.

Where needed, not everywhere. Ad creative gets the mark; the 189 e-commerce
SKU frames deliberately do not, because those go to Shopify and to Meta's
dynamic catalogue units, which inject the product name and price themselves —
the ad-format research is explicit that a baked-in logo collides with them.

Deck rules honoured literally:
  · on photography, CREAM only — the mark is never recoloured to sage or ink
  · clear-space equal to the height of the "A" on every side
  · never stretched, condensed, tilted, rotated or set on a curve — only ever
    scaled uniformly

Placement is measured rather than guessed: the frame is scored for quietness
(local detail) and for how well cream will read against it, and the mark goes
in the calmest, most legible slot that is not sitting on the product.
"""
import os

import numpy as np
from PIL import Image, ImageFilter

SCRATCH = ("/tmp/claude-0/-home-user-naira-scroll-3790bf3e/"
           "1171b414-e279-55a3-bd3a-591f6de1e021/scratchpad")
BRAND = os.path.join(SCRATCH, "brand")
ROOT = "/home/user/naira-scroll-3790bf3e"
SRC = os.path.join(ROOT, "naira-flore-campaign")
OUT = os.path.join(ROOT, "naira-flore-campaign-branded")

CREAM = (255, 248, 245)          # deck: #FFF8F5
WORDMARK_W = 0.30                # of frame width
SEAL_W = 0.055                   # flower seal, of frame width


def load(name):
    return Image.open(os.path.join(BRAND, name)).convert("RGBA")


def tint(mark, rgb):
    r, g, b, a = mark.split()
    solid = Image.new("RGB", mark.size, rgb)
    solid.putalpha(a)
    return solid


def scale_w(mark, px):
    return mark.resize((px, max(1, round(px * mark.height / mark.width))), Image.LANCZOS)


def score_map(im, cell):
    """Per-cell quietness and cream-legibility, both 0..1 and higher is better."""
    g = np.asarray(im.convert("L"), dtype=np.float32)
    h, w = g.shape
    ny, nx = h // cell, w // cell
    g = g[:ny * cell, :nx * cell].reshape(ny, cell, nx, cell)
    detail = g.std(axis=(1, 3))
    lum = g.mean(axis=(1, 3))
    quiet = 1.0 - detail / (detail.max() + 1e-6)
    # cream is near-white, so it reads best on a mid-to-dark ground
    legible = np.clip((235.0 - lum) / 120.0, 0.0, 1.0)
    return quiet, legible


def best_slot(im, mw, mh, pad):
    """Pick the top-left corner for a mark of size mw x mh."""
    cell = max(16, im.width // 60)
    quiet, legible = score_map(im, cell)
    ny, nx = quiet.shape
    cw, ch = max(1, mw // cell), max(1, mh // cell)
    pc = max(1, pad // cell)

    best, best_xy = -1.0, (pad, im.height - mh - pad)
    for gy in range(pc, ny - ch - pc + 1):
        for gx in range(pc, nx - cw - pc + 1):
            q = quiet[gy:gy + ch, gx:gx + cw]
            l = legible[gy:gy + ch, gx:gx + cw]
            # the mark must sit on uniformly calm ground, so the worst cell in
            # the block matters more than the average
            s = 0.55 * q.min() + 0.25 * q.mean() + 0.20 * l.mean()
            # gentle bias to the edges of the frame; a logo mid-frame reads as
            # a watermark, not a signature
            edge = min(gy, ny - ch - gy, gx, nx - cw - gx) / max(ny, nx)
            s -= edge * 0.35
            if s > best:
                best, best_xy = s, (gx * cell, gy * cell)
    return best_xy, best


def shadow(mark, blur, opacity):
    sh = Image.new("RGBA", (mark.width + blur * 4, mark.height + blur * 4), (0, 0, 0, 0))
    black = tint(mark, (0, 0, 0))
    sh.paste(black, (blur * 2, blur * 2), black)
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    r, g, b, a = sh.split()
    return Image.merge("RGBA", (r, g, b, a.point(lambda v: int(v * opacity))))


def brand(path, out_path, wordmark, flower, seal=False):
    im = Image.open(path).convert("RGB")
    W, H = im.size
    mark = scale_w(wordmark, round(W * WORDMARK_W))
    # clear-space equal to the cap height of the "A" — the wordmark's own height
    pad = mark.height
    (x, y), _ = best_slot(im, mark.width, mark.height, pad)

    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sh = shadow(mark, blur=max(4, mark.height // 12), opacity=0.30)
    layer.alpha_composite(sh, (x - sh.width // 2 + mark.width // 2,
                               y - sh.height // 2 + mark.height // 2))
    layer.alpha_composite(tint(mark, CREAM), (x, y))

    if seal:
        f = scale_w(flower, round(W * SEAL_W))
        fx, fy = W - f.width - pad, H - f.height - pad
        # keep the seal out of the wordmark's clear-space
        if not (abs(fx - x) < mark.width + pad and abs(fy - y) < mark.height + pad):
            fsh = shadow(f, blur=max(3, f.height // 14), opacity=0.24)
            layer.alpha_composite(fsh, (fx - fsh.width // 2 + f.width // 2,
                                        fy - fsh.height // 2 + f.height // 2))
            layer.alpha_composite(tint(f, CREAM), (fx, fy))

    out = Image.alpha_composite(im.convert("RGBA"), layer).convert("RGB")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    out.save(out_path, quality=95)
    return (x, y), mark.size


def main():
    wordmark, flower = load("wordmark-cream.png"), load("flower-cream.png")
    n = 0
    for group in sorted(os.listdir(SRC)):
        gdir = os.path.join(SRC, group)
        if not os.path.isdir(gdir):
            continue
        for i, f in enumerate(sorted(os.listdir(gdir))):
            if not f.endswith(".png"):
                continue
            pos, size = brand(os.path.join(gdir, f),
                              os.path.join(OUT, group, f),
                              wordmark, flower, seal=(i % 5 == 0))
            n += 1
        print("%-22s branded" % group)
    print("total frames branded:", n)


if __name__ == "__main__":
    main()
