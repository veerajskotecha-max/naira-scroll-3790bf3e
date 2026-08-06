"""Build the campaign book for SOFTLY, SLOWLY, WORN — Volume One.

One page per shot: the frame, its ad job, the product it sells, and the score
it earned. A cover carries the campaign line and the strategic reason the
campaign exists at all.
"""
import os
import shutil

from PIL import Image, ImageDraw, ImageFont

SCRATCH = ("/tmp/claude-0/-home-user-naira-scroll-3790bf3e/"
           "1171b414-e279-55a3-bd3a-591f6de1e021/scratchpad")
AD = os.path.join(SCRATCH, "ad")
OUT = "/home/user/naira-scroll-3790bf3e/naira-flore-campaign-softly-slowly-worn.pdf"
SELECTS = "/home/user/naira-scroll-3790bf3e/naira-flore-campaign/softly-slowly-worn"

INK, SOFT, FAINT = (28, 28, 28), (95, 89, 83), (150, 144, 138)
SAGE, CORAL = (169, 188, 173), (231, 156, 130)

# shot no -> (version, title, product, ad job, score, v1 score or None)
SHOTS = {
    1: ("v2", "Sage Hero", "E20267O · Woven Gold Hoops",
        "Category authority. Colour-block hero, copy shelf across the top half, no price.",
        8.5, 6.0),
    2: ("v2", "Blush Hero", "YF6403 · Dewdrop Bezel Necklace",
        "Category authority, A/B pair to Shot 1. The chain's V opens a natural copy well.",
        9.5, 5.0),
    3: ("v2", "Ear", "E19263B · Pearl Point Studs",
        "Projection. Face cropped so the viewer sees her own ear, not a model's.",
        9.0, 7.0),
    4: ("v1", "Throat", "YF8439 · Serpentine Whisper Chain",
        "Projection. Collarbone crop; the gold is the only saturated thing in frame.",
        8.5, None),
    5: ("v2", "Hand", "FR03136B · Pearl Ribbon Ring",
        "Projection and scale proof. The bow stops at the edges of the finger.",
        8.5, 6.5),
    6: ("v1", "Cardamom", "WR23024K · Emerald Eternity Band",
        "Craft proof. A cardamom pod donates its size so the stone reads at 5mm.",
        9.0, None),
    7: ("v1", "Khadi", "YF3925 · Pearl Legacy Bracelet",
        "Provenance. The weave dents under the pearls' weight — weight you can see.",
        9.0, None),
    8: ("v1", "Terracotta", "JDR0104337 · Amber Dome Ring",
        "Provenance. Clay holds a negative imprint, every granule its own crater.",
        9.0, None),
    9: ("v1", "Jaali", "JDB201083 · Fine Chain Circle Station",
        "Brand recall. The one Indian cue in the campaign, and it is material, not motif.",
        9.5, None),
    10: ("v2", "Paper", "WE24089B · Pearl Halo Studs",
         "Layout frame. True overhead, half the sheet empty for a headline.",
         9.5, 8.5),
}

PAGE_W, PAGE_H = 2200, 2900
M = 110


def font(sz, bold=False, italic=False):
    # DejaVuSans ships Bold and Oblique as separate files; Oblique is absent
    # in some images, so fall back to the roman rather than dying on it.
    base = "/usr/share/fonts/truetype/dejavu/DejaVuSans"
    for suffix in (["-Bold"] if bold else (["-Oblique", ""] if italic else [""])):
        try:
            return ImageFont.truetype(base + suffix + ".ttf", sz)
        except OSError:
            continue
    return ImageFont.truetype(base + ".ttf", sz)


def wrap(d, text, f, w):
    out, cur = [], ""
    for word in text.split():
        t = (cur + " " + word).strip()
        if d.textlength(t, font=f) <= w:
            cur = t
        else:
            out.append(cur)
            cur = word
    if cur:
        out.append(cur)
    return out


def cover():
    im = Image.new("RGB", (PAGE_W, PAGE_H), (250, 248, 244))
    d = ImageDraw.Draw(im)
    d.text((M, 380), "VOLUME ONE  ·  MMXXVI  ·  Nº 01", font=font(38), fill=FAINT)
    d.text((M, 500), "SOFTLY,", font=font(190, True), fill=INK)
    d.text((M, 700), "SLOWLY,", font=font(190, True), fill=INK)
    d.text((M, 900), "worn.", font=font(190, italic=True), fill=CORAL)
    d.rectangle([M, 1180, M + 220, 1188], fill=SAGE)

    body = ("A ten-shot advertising campaign for Naira Flore. One idea: the long quiet of "
            "an Indian afternoon — the same table, the same day, the light moving across it.")
    y = 1280
    for ln in wrap(d, body, font(46), PAGE_W - 2 * M - 300):
        d.text((M, y), ln, font=font(46), fill=SOFT)
        y += 66

    y += 70
    d.text((M, y), "WHY THIS CAMPAIGN", font=font(34, True), fill=INK)
    y += 62
    why = ("Of ~400 live demi-fine jewellery ads sampled from the Meta Ad Library, 22% are "
           "discount and price-flash tiles. Craft and provenance imagery is under 2% globally "
           "and close to zero in India. That gap is the one thing Naira's slow-made story can "
           "occupy and competitors structurally cannot copy. Five of these ten frames are built "
           "on it: clay that remembers the ring, khadi that dents under the pearls, a cardamom "
           "pod lending its size to a stone.")
    for ln in wrap(d, why, font(40), PAGE_W - 2 * M - 200):
        d.text((M, y), ln, font=font(40), fill=SOFT)
        y += 58

    y += 60
    d.text((M, y), "HOW IT WAS SHOT", font=font(34, True), fill=INK)
    y += 62
    how = ("Nano Banana Pro, 4:5, 2K. One product per frame, referenced against its own "
           "verified e-com still. Every shot rated against the brief and re-shot until it "
           "cleared the bar: five passed first time, five were re-shot. Average 9.0 of 10.")
    for ln in wrap(d, how, font(40), PAGE_W - 2 * M - 200):
        d.text((M, y), ln, font=font(40), fill=SOFT)
        y += 58

    d.text((M, PAGE_H - 190), "10 shots  ·  4:5  ·  no burned-in copy  ·  no price",
           font=font(36), fill=FAINT)
    return im


def page(n, path, title, product, job, score, was):
    im = Image.new("RGB", (PAGE_W, PAGE_H), "white")
    d = ImageDraw.Draw(im)
    ph = Image.open(path).convert("RGB")
    box_w, box_h = PAGE_W - 2 * M, 1980
    ph.thumbnail((box_w, box_h), Image.LANCZOS)
    im.paste(ph, ((PAGE_W - ph.width) // 2, M))

    y = M + box_h + 90
    d.text((M, y), "%02d" % n, font=font(130, True), fill=SAGE)
    d.text((M + 200, y + 22), title.upper(), font=font(70, True), fill=INK)
    d.text((M + 200, y + 116), product, font=font(42), fill=SOFT)

    yy = y + 200
    for ln in wrap(d, job, font(40), PAGE_W - 2 * M - 340):
        d.text((M + 200, yy), ln, font=font(40), fill=FAINT)
        yy += 56

    tag = "%.1f" % score if score % 1 else "%d" % score
    f = font(74, True)
    w = d.textlength(tag + " /10", font=f)
    d.text((PAGE_W - M - w, y + 30), tag + " /10", font=f, fill=INK)
    if was:
        s = "re-shot from %.1f" % was
        f2 = font(34)
        d.text((PAGE_W - M - d.textlength(s, font=f2), y + 130), s, font=f2, fill=CORAL)
    return im


def main():
    os.makedirs(SELECTS, exist_ok=True)
    pages = [cover()]
    for n in sorted(SHOTS):
        ver, title, product, job, score, was = SHOTS[n]
        src = os.path.join(AD, "%s-%02d.png" % (ver, n))
        shutil.copyfile(src, os.path.join(
            SELECTS, "%02d-%s.png" % (n, title.lower().replace(" ", "-"))))
        pages.append(page(n, src, title, product, job, score, was))

    for q in (88, 80, 72, 64):
        pages[0].save(OUT, save_all=True, append_images=pages[1:],
                      resolution=200.0, quality=q, optimize=True)
        if os.path.getsize(OUT) <= 29 * 1024 * 1024:
            break
    print("%s  %d pages  %.1f MB  q=%d"
          % (OUT, len(pages), os.path.getsize(OUT) / 1048576, q))
    print("selects ->", SELECTS, len(os.listdir(SELECTS)), "files")
    print("average score %.2f" % (sum(v[4] for v in SHOTS.values()) / len(SHOTS)))


if __name__ == "__main__":
    main()
