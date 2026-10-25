"""Build one audit sheet per SKU: every Drive source photo on the top row,
the three delivered frames on the bottom row, at a size where defects show.

The first pass only ever compared against one photo per SKU. Photos 2 and 3
carry the side profile, the back and the clasp - exactly where a wrong bezel
count or an invented finding hides.
"""
import json
import os
import glob

from PIL import Image, ImageDraw, ImageFont

SCRATCH = ("/tmp/claude-0/-home-user-naira-scroll-3790bf3e/"
           "1171b414-e279-55a3-bd3a-591f6de1e021/scratchpad")
ROOT = "/home/user/naira-scroll-3790bf3e"
CACHE = os.path.join(SCRATCH, "book")
OUT = os.path.join(SCRATCH, "audit/sheets")

CELL = 430
LABEL_H = 34


def font(sz, bold=False):
    p = "/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf" % ("-Bold" if bold else "")
    return ImageFont.truetype(p, sz)


F_B, F_R = font(24, True), font(20)


# Yiss Fera filenames don't follow the SKU_n.jpg convention the other two
# suppliers use, so the odd ones are named here rather than pattern-matched.
ALIAS = {
    "YF3925": ["src/bracelet_1_YF3925.jpg", "kav/bracelet 1 YF3925.jpg"],
    "YF5144-bracelet": ["src/YF5144-BRACELET-1.jpg"],
    "YF5144-necklace": ["src/YF5144-1.png"],
    "YF6671-style1": ["src/YF6671-1-STYLE_1.jpg"],
    "YF6671-style2": ["src/YF6671-STYLE_2-1.jpg"],
    "YF7085": ["src/YF7085-SET_BOTH-1.jpg"],
    "YF7085-NEC": ["src/YF7085-SET_BOTH-1.jpg"],
    "YF5214": ["src/YF5214-1_BOTH_RINGS.jpg"],
    "YF5244": ["src/YF5244-_SET_OF_2.jpg"],
    "YF3952": ["src/YF3952.jpg"],
}


def sources(sku):
    """Every supplier photo for this SKU, from any of the local mirrors."""
    seen, out = [], []
    for rel in ALIAS.get(sku, []):
        p = os.path.join(SCRATCH, rel)
        if os.path.exists(p):
            seen.append(os.path.basename(p))
            out.append(p)
    seen = set(seen)
    for pat in (os.path.join(SCRATCH, "audit/src", sku, "*"),
                os.path.join(SCRATCH, "jd", sku + "_*"),
                os.path.join(SCRATCH, "kav", sku + "_*"),
                os.path.join(SCRATCH, "src", sku + "-*"),
                os.path.join(SCRATCH, "src", sku + ".*")):
        for p in sorted(glob.glob(pat)):
            b = os.path.basename(p)
            if b not in seen:
                seen.add(b)
                out.append(p)
    return out


def build(sku, name, size, srcs, frames):
    cols = max(len(srcs), 3)
    W, H = cols * CELL, 2 * (CELL + LABEL_H) + 46
    im = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(im)
    d.text((10, 8), "%s   %s" % (sku, name), font=F_B, fill=(0, 0, 0))
    d.text((10, 34), size[:150], font=F_R, fill=(110, 110, 110))

    for row, (tag, items) in enumerate((("SOURCE", srcs), ("SHOT", frames))):
        y = 62 + row * (CELL + LABEL_H)
        for i, item in enumerate(items):
            lb, p = (tag + " %d" % (i + 1), item) if row == 0 else item
            x = i * CELL
            if p and os.path.exists(p):
                ph = Image.open(p).convert("RGB")
                ph.thumbnail((CELL - 12, CELL - 12), Image.LANCZOS)
                im.paste(ph, (x + (CELL - ph.width) // 2, y + (CELL - ph.height) // 2))
            d.text((x + 8, y + CELL + 4), lb.upper(), font=F_R, fill=(90, 90, 90))
    return im


def main():
    os.makedirs(OUT, exist_ok=True)
    T = json.load(open(os.path.join(ROOT, "scripts/higgsfield/supplier-tracker.json")))
    made, nosrc = [], []
    for sku, v in sorted(T["done"].items()):
        srcs = sources(sku) or sources(sku[:-4] if sku.endswith("-NEC") else sku)
        if not srcs:
            nosrc.append(sku)
            continue
        frames = [(s, os.path.join(CACHE, "%s--%s.png" % (sku, s)))
                  for s in ("ecom", "worn", "angle")]
        im = build(sku, v.get("catalogue_name") or v["name"], v.get("size", ""), srcs, frames)
        p = os.path.join(OUT, "%s.jpg" % sku)
        im.save(p, quality=86)
        made.append(sku)
    print("sheets:", len(made), "| no local source:", nosrc)


if __name__ == "__main__":
    main()
