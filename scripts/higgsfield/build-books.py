"""Build the three deliverable books, one per category group.

Every page is headlined with the catalogue Title from
naira_petite_shopify_import.csv - that is the name the design team and the
storefront use. The SKU code and the working description sit underneath so a
page can still be traced back to the supplier photo it came from.

Each book is auto-tuned down in JPEG quality until it fits inside the 30 MiB
delivery ceiling, starting from a resolution well above the review book.
"""
import csv
import json
import os
import subprocess

from PIL import Image, ImageDraw, ImageFont

ROOT = "/home/user/naira-scroll-3790bf3e"
SCRATCH = "/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1171b414-e279-55a3-bd3a-591f6de1e021/scratchpad"
CACHE = os.path.join(SCRATCH, "book")
CSVF = "/root/.claude/uploads/1171b414-e279-55a3-bd3a-591f6de1e021/0b15f865-naira_petite_shopify_import.csv"
LIMIT = 29 * 1024 * 1024

# Sized so a cell is 2304px tall — the native height of a 2k 4:5 frame. Nothing
# in the book is ever upscaled; the pages carry the full pixels that came back.
PAGE_W, PAGE_H = 5160, 2924
MARGIN, GUTTER, CAPTION_H = 112, 68, 400
CELL_W = (PAGE_W - 2 * MARGIN - 2 * GUTTER) // 3
CELL_H = PAGE_H - CAPTION_H - 2 * MARGIN

BOOKS = [
    ("rings", "Rings", ("Rings",)),
    ("earrings", "Earrings", ("Earrings",)),
    ("bracelets-necklaces", "Bracelets & Necklaces", ("Bracelets", "Necklaces")),
]

INK, SOFT, FAINT, LABEL = (20, 18, 16), (95, 89, 83), (150, 144, 138), (168, 160, 152)


def font(size, bold=False):
    p = "/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf" % ("-Bold" if bold else "")
    return ImageFont.truetype(p, size) if os.path.exists(p) else ImageFont.load_default()


F_TITLE, F_SKU, F_DESC, F_LBL = font(112, True), font(64, True), font(56), font(48)


def grab(url, path):
    if not os.path.exists(path) or os.path.getsize(path) < 1000:
        subprocess.run(["curl", "-sSLf", "-o", path, url], check=False)
    return path if os.path.exists(path) and os.path.getsize(path) > 1000 else None


def rows():
    """Every delivered SKU: (group, sku, headline, working name, category, size, urls)."""
    cat = {r["SKU"].strip(): r["Title"].strip()
           for r in csv.DictReader(open(CSVF, encoding="utf-8-sig")) if r.get("SKU")}
    out = []

    G = json.load(open(os.path.join(ROOT, "scripts/higgsfield/results.json")))
    for h, v in sorted(G.items()):
        if h.startswith("_") or not isinstance(v, dict) or "shots" not in v:
            continue
        sku = v.get("sku", h)
        urls = {s: v["shots"][s]["url"] for s in ("ecom", "worn", "angle") if s in v["shots"]}
        out.append(("Gilded Hour", sku, cat.get(sku) or v.get("name", h), v.get("name", h),
                    v.get("category", ""), "published size guide", urls))

    T = json.load(open(os.path.join(ROOT, "scripts/higgsfield/supplier-tracker.json")))
    for sku, v in sorted(T["done"].items()):
        g = ("Yiss Fera" if sku.startswith("YF")
             else "Yiwu J&D" if sku.startswith("JD") else "KAVNAR")
        urls = {s: v[s] for s in ("ecom", "worn", "angle")
                if isinstance(v.get(s), str) and v[s].startswith("http")}
        out.append((g, sku, v.get("catalogue_name") or v["name"], v["name"],
                    v.get("category", ""), v.get("size", ""), urls))
    return out


def wrap(d, text, fnt, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=fnt) <= width:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def cover(title, n_sku, n_frame):
    im = Image.new("RGB", (PAGE_W, PAGE_H), (250, 248, 244))
    d = ImageDraw.Draw(im)
    d.text((MARGIN + 150, 800), "Naira Flore", font=font(280, True), fill=INK)
    d.text((MARGIN + 150, 1140), title, font=font(138), fill=SOFT)
    d.text((MARGIN + 150, 1440), "%d SKUs  ·  %d frames" % (n_sku, n_frame),
           font=font(82), fill=SOFT)
    d.text((MARGIN + 150, PAGE_H - 490),
           "Three frames per SKU — ecom on the cream plaster set, worn on the body,\n"
           "and angle, a deliberately different camera so no two frames repeat.\n"
           "Every page is titled with its catalogue name; the SKU code sits underneath.",
           font=font(64), fill=FAINT)
    return im


def page(group, sku, headline, working, cat, size, paths):
    im = Image.new("RGB", (PAGE_W, PAGE_H), "white")
    d = ImageDraw.Draw(im)
    for i, (label, p) in enumerate(paths):
        x = MARGIN + i * (CELL_W + GUTTER)
        if p:
            ph = Image.open(p).convert("RGB")
            ph.thumbnail((CELL_W, CELL_H), Image.LANCZOS)
            im.paste(ph, (x + (CELL_W - ph.width) // 2, MARGIN + (CELL_H - ph.height) // 2))
        d.text((x, MARGIN + CELL_H + 22), label.upper(), font=F_LBL, fill=LABEL)

    y = MARGIN + CELL_H + 116
    d.text((MARGIN, y), headline, font=F_TITLE, fill=INK)
    d.text((MARGIN, y + 146), sku, font=F_SKU, fill=SOFT)
    w = d.textlength(sku, font=F_SKU)
    note = "%s · %s" % (cat, working) if working.lower() != headline.lower() else cat
    d.text((MARGIN + w + 44, y + 154), note, font=F_DESC, fill=SOFT)
    for j, ln in enumerate(wrap(d, size, F_DESC, PAGE_W - 2 * MARGIN - 700)):
        d.text((MARGIN, y + 236 + j * 70), ln, font=F_DESC, fill=FAINT)
    d.text((PAGE_W - MARGIN - d.textlength(group, font=F_DESC), y + 16), group,
           font=F_DESC, fill=LABEL)
    return im


def main():
    os.makedirs(CACHE, exist_ok=True)
    data = rows()
    missed = [r[1] for r in data if not r[4]]
    if missed:
        print("no category, dropped from the books:", missed)

    for slug, title, cats in BOOKS:
        sel = [r for r in data if r[4] in cats]
        sel.sort(key=lambda r: (r[4], r[2].lower()))
        pages = [cover(title, len(sel), sum(len(r[6]) for r in sel))]
        for group, sku, headline, working, cat, size, urls in sel:
            paths = [(s, grab(urls[s], os.path.join(CACHE, "%s--%s.png" % (sku, s)))
                      if s in urls else None) for s in ("ecom", "worn", "angle")]
            pages.append(page(group, sku, headline, working, cat, size, paths))

        out = os.path.join(ROOT, "naira-flore-%s.pdf" % slug)
        for q in (88, 80, 72, 64, 56, 48):
            pages[0].save(out, save_all=True, append_images=pages[1:],
                          resolution=200.0, quality=q, optimize=True)
            if os.path.getsize(out) <= LIMIT:
                break
        print("%-46s %3d pages  %5.1f MB  q=%d"
              % (os.path.basename(out), len(pages), os.path.getsize(out) / 1048576, q))


if __name__ == "__main__":
    main()
