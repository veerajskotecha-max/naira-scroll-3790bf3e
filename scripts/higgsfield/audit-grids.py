"""Compact audit grids: five SKUs per sheet, one row each.

Each row is first source photo, last source photo (usually the clean packshot),
then the three delivered frames. Enough resolution to catch a missing stone, a
floating object, a wrong metal or two pieces fused into one; anything that
looks off gets a full-size sheet from audit-sheets.py afterwards.
"""
import importlib.util
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

SCRATCH = ("/tmp/claude-0/-home-user-naira-scroll-3790bf3e/"
           "1171b414-e279-55a3-bd3a-591f6de1e021/scratchpad")

# audit-sheets.py has a hyphen in its name, so it is loaded by path rather
# than imported; this reuses its source resolution and Yiss Fera aliases.
_spec = importlib.util.spec_from_file_location(
    "audit_sheets", os.path.join(os.path.dirname(os.path.abspath(__file__)), "audit-sheets.py"))
sheets = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(sheets)

ROOT = "/home/user/naira-scroll-3790bf3e"
CACHE = os.path.join(SCRATCH, "book")
OUT = os.path.join(SCRATCH, "audit/grids")

CELL, HEAD, PER = 340, 30, 5


def font(sz, bold=False):
    p = "/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf" % ("-Bold" if bold else "")
    return ImageFont.truetype(p, sz)


F_B, F_S = font(19, True), font(15)


def row(im, d, y, sku, name, cells):
    d.text((6, y + 4), "%s  %s" % (sku, name[:52]), font=F_B, fill=(0, 0, 0))
    for i, (lb, p) in enumerate(cells):
        x = i * CELL
        if p and os.path.exists(p):
            ph = Image.open(p).convert("RGB")
            ph.thumbnail((CELL - 8, CELL - 8), Image.LANCZOS)
            im.paste(ph, (x + (CELL - ph.width) // 2, y + HEAD + (CELL - ph.height) // 2))
        d.text((x + 6, y + HEAD + CELL - 18), lb.upper(), font=F_S, fill=(120, 120, 120))


def main():
    os.makedirs(OUT, exist_ok=True)
    want = set(sys.argv[1].split(",")) if len(sys.argv) > 1 else None
    T = json.load(open(os.path.join(ROOT, "scripts/higgsfield/supplier-tracker.json")))
    items = [(s, v) for s, v in sorted(T["done"].items())
             if want is None or v.get("category") in want]

    for n in range(0, len(items), PER):
        chunk = items[n:n + PER]
        H = len(chunk) * (CELL + HEAD)
        im = Image.new("RGB", (5 * CELL, H), "white")
        d = ImageDraw.Draw(im)
        for j, (sku, v) in enumerate(chunk):
            srcs = sheets.sources(sku) or sheets.sources(
                sku[:-4] if sku.endswith("-NEC") else sku)
            cells = [("src 1", srcs[0] if srcs else None),
                     ("src %d" % len(srcs), srcs[-1] if len(srcs) > 1 else None)]
            cells += [(s, os.path.join(CACHE, "%s--%s.png" % (sku, s)))
                      for s in ("ecom", "worn", "angle")]
            row(im, d, j * (CELL + HEAD), sku, v.get("catalogue_name") or v["name"], cells)
        tag = (sys.argv[1].split(",")[0] if want else "all").lower()
        p = os.path.join(OUT, "%s-%02d.jpg" % (tag, n // PER + 1))
        im.save(p, quality=85)
        print(p, im.size, [s for s, _ in chunk])


if __name__ == "__main__":
    main()
