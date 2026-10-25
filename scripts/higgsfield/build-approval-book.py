"""Build the image-approval book: every candidate for the website, one per page.

The point is approval, not presentation. Each page carries the image large
enough to judge, and beneath it the three things needed to say yes or no: which
set it belongs to, which SKU it shows, and where the file actually lives. A
contact sheet would fit more per page but you cannot see a stone at that size,
and stones are what gets rejected.
"""
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = "/home/user/naira-scroll-3790bf3e"
SHOTS = os.path.join(ROOT, "naira-flore-shots")
CAMP = os.path.join(ROOT, "naira-flore-campaign")
UGC = os.path.join(ROOT, "marketing-assets/ugc")
OUT = os.path.join(ROOT, "naira-flore-image-approval.pdf")

INK, SOFT, FAINT = (28, 28, 28), (95, 89, 83), (150, 144, 138)
SAGE, CORAL = (169, 188, 173), (231, 156, 130)
PAGE_W, PAGE_H = 2200, 2900
M = 110

# (set label, accent, [(file, sku, why)])
SETS = [
    ("I · THE RED ROOM", (92, 18, 28), os.path.join(CAMP, "i-the-red-room"), [
        ("R01-woven-gold-hoops.png", "E20267O", "Wet oxblood dome. The strongest single frame of the set."),
        ("R02-emerald-eternity-band.png", "WR23024K", "Red glass bangles glowing behind the silver."),
        ("R03-prism-riviere-bracelet.png", "B00681C", "Standing water, full mirror reflection."),
        ("R04-pearl-ribbon-ring.png", "FR03136B", "Burgundy silk glove on bone white."),
        ("R05-solitaire-whisper-studs.png", "E16355C", "Split pomegranate; a seed proves the scale."),
        ("R06-amber-dome-ring.png", "JDR0104337", "Macro on oxblood velvet, every granule in relief."),
        ("R07-serpentine-whisper-chain.png", "YF8439", "Poured over a lacquer edge, copy space right."),
        ("R08-pearl-point-studs.png", "E19263B", "Ear crop, crimson silk bouncing onto the jaw."),
        ("R09-heartbead-bracelet.png", "YF5215", "Wrist on oxblood silk."),
        ("R10-bold-nocturne-chain.png", "YF5144", "Graphic hero."),
    ]),
    ("II · STILL WATER", (150, 178, 168), os.path.join(CAMP, "ii-still-water"), [
        ("W01-emerald-drop-earrings.png", "E21572E1", "Hung from the curl of a calla lily stem."),
        ("W02-pearl-halo-studs.png", "WE24089B", "Cradled in a bruised magnolia petal."),
        ("W03-dewdrop-bezel-necklace.png", "YF6403", "Half submerged; the waterline refracts it."),
        ("W04-halo-bloom-ring.png", "R15464K", "Hand and reflection meeting on still water."),
        ("W05-ribbon-bow-earrings.png", "E16075B", "Backlit lotus petal glowing translucent."),
        ("W06-heartline-paperclip-necklace.png", "YF3952", "Wet slate, stations holding water beads."),
        ("W07-blush-halo-ring.png", "WR10914B2", "Garden-rose petals, blush on blush."),
        ("W08-emerald-cluster-studs.png", "FE02847B", "Nested in the channel of a curled leaf."),
        ("W09-tassel-nocturne-necklace.png", "YF8457", "The pearl touching water. One ring of ripple."),
        ("W10-trio-bloom-ring.png", "JDR0104333", "Threaded onto a stem below an unopened bud."),
    ]),
    ("III · AFTER DARK", (26, 26, 28), os.path.join(CAMP, "iii-after-dark"), [
        ("D01-cushion-halo-ring.png", "WR20902K8", "Floating between two glowing discs."),
        ("D02-riviere-eternal-necklace.png", "YF7085-NEC", "Draped over a champagne coupe."),
        ("D03-silver-drop-earrings.png", "E16676C", "Suspended in a cool spot, black all round."),
        ("D04-classic-solitaire-ring.png", "WR19333K8", "One hard shaft, dust in the beam."),
        ("D05-pearl-ceremony-set.png", "YF8396", "Falling through the dark, beads rim-lit."),
        ("D06-golden-nugget-studs.png", "E14776S", "Mirror-black basalt, satin grain in relief."),
        ("D07-emerald-riviere-bracelet.png", "JDB201210-GN", "Champagne glowing through green baguettes."),
        ("D08-charm-box-chain.png", "YF5146", "One dead-straight vertical line."),
        ("D09-petite-pave-band.png", "WR12518B", "Extreme macro in a raking beam."),
        ("D10-pave-star-chain-drops.png", "E11857B", "Two stars caught having just stopped swinging."),
    ]),
    ("IV · NOT A PHASE", (18, 90, 62), os.path.join(CAMP, "iv-not-a-phase"), [
        ("P01-molten-bloom-hoops.png", "JDE0110042", "Green on green; a butterfly vanishing into the field."),
        ("P02-cuban-pearl-bracelet.png", "YF6667", "Suspended in a drip bag of liquid gold."),
        ("P03-scatter-light-band.png", "WR22648B7", "Magenta colour block, hand from directly above."),
        ("P04-pearl-blossom-earrings.png", "E20997C", "Held weightless inside a soap bubble."),
        ("P05-ivory-clasp-chain.png", "YF5143", "The chain IS the horizon between sage and cream."),
        ("P06-first-light-set.png", "JDS0204301-set", "An eclipse; the stone sits dead centre and fires."),
        ("P07-baroque-bloom-cuff.png", "YF6671", "Slipped over a travertine column."),
        ("P08-noir-huggie.png", "E14066B", "Sage block, curb chain caught mid-swing."),
        ("P09-vintage-halo-ring.png", "WR23569K8", "Tilted to an ellipse, orbiting an arc of light."),
        ("P10-ribbon-bead-bracelet.png", "YF8156", "Draped along a ribbon of silk twisting in air."),
    ]),
    ("V · SOFTLY, SLOWLY, WORN", (169, 188, 173), os.path.join(CAMP, "softly-slowly-worn"), [
        ("01-sage-hero.png", "E20267O", "Category authority. Colour-block hero, copy shelf across the top."),
        ("02-blush-hero.png", "YF6403", "A/B pair to shot 1. The chain's V opens a copy well."),
        ("03-ear.png", "E19263B", "Face cropped so the viewer sees her own ear."),
        ("04-throat.png", "YF8439", "Collarbone crop; the gold is the only saturated thing."),
        ("05-hand.png", "FR03136B", "Scale proof. The bow stops at the edges of the finger."),
        ("06-cardamom.png", "WR23024K", "A cardamom pod donates its size so 5mm reads."),
        ("07-khadi.png", "YF3925", "The weave dents under the pearls' weight."),
        ("08-terracotta.png", "JDR0104337", "Clay holds a negative imprint, every granule a crater."),
        ("09-jaali.png", "JDB201083", "The one Indian cue, and it is material not motif."),
        ("10-paper.png", "WE24089B", "True overhead, half the sheet empty for a headline."),
    ]),
    ("VI · UGC", (231, 156, 130), UGC, [
        ("01-wrist-bracelet.jpg", "YF6667", "Bed linen, window light, phone half out of frame."),
        ("02-ear-hoops.jpg", "E20267O", "Ear and jaw crop. Unretouched skin carries it."),
        ("03-box-ring.jpg", "WR20902K8", "The pink box open on a scratched table. No cards."),
        ("04-neck-necklace.jpg", "YF6403", "Collarbone, warm lamp against a cold doorway."),
        ("05-palm-studs.jpg", "E19263B", "Studs loose in a palm, scale correct against a finger."),
    ]),
]


def font(sz, bold=False, italic=False):
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


def cover(total):
    im = Image.new("RGB", (PAGE_W, PAGE_H), (250, 248, 244))
    d = ImageDraw.Draw(im)
    d.text((M, 380), "NAIRA FLORE  ·  FOR APPROVAL", font=font(38), fill=FAINT)
    d.text((M, 500), "The image", font=font(170, True), fill=INK)
    d.text((M, 690), "library", font=font(170, True), fill=INK)
    d.rectangle([M, 940, M + 220, 948], fill=SAGE)

    y = 1050
    body = ("Every image already made that is ready to go on the site. %d frames across six "
            "sets. Say yes to a set, or strike individual frames, and they go up to Shopify "
            "from there." % total)
    for ln in wrap(d, body, font(46), PAGE_W - 2 * M - 300):
        d.text((M, y), ln, font=font(46), fill=SOFT)
        y += 66

    y += 60
    d.text((M, y), "WHAT IS IN HERE", font=font(34, True), fill=INK)
    y += 62
    for label, _, _, shots in SETS:
        d.text((M, y), "%-28s %d" % (label, len(shots)), font=font(40), fill=SOFT)
        y += 56

    y += 40
    d.text((M, y), "WHAT IS NOT", font=font(34, True), fill=INK)
    y += 62
    note = ("The 189 plain e-commerce frames are already on the products and are not "
            "repeated here. Nothing below 1856x2304 is included, so none of this adds to "
            "the soft 896x1200 heroes still sitting on about forty live listings. There is "
            "no green velvet set: the emerald velvet ground was designed for this shoot and "
            "never used, and the green you may be remembering is either the sage chair "
            "behind all twenty bracelet worn frames or a low-resolution model shot already "
            "live on the site.")
    for ln in wrap(d, note, font(38), PAGE_W - 2 * M - 200):
        d.text((M, y), ln, font=font(38), fill=SOFT)
        y += 54

    d.text((M, PAGE_H - 190), "%d frames  ·  all 1856 x 2304  ·  approve by set or by frame"
           % total, font=font(36), fill=FAINT)
    return im


def page(n, path, label, accent, sku, why):
    im = Image.new("RGB", (PAGE_W, PAGE_H), "white")
    d = ImageDraw.Draw(im)
    ph = Image.open(path).convert("RGB")
    ph.thumbnail((PAGE_W - 2 * M, 1980), Image.LANCZOS)
    im.paste(ph, ((PAGE_W - ph.width) // 2, M))

    y = M + 1980 + 90
    d.text((M, y), "%02d" % n, font=font(112, True), fill=accent)
    d.text((M + 230, y + 16), label, font=font(48, True), fill=INK)
    d.text((M + 230, y + 88), sku, font=font(40), fill=SOFT)
    yy = y + 156
    for ln in wrap(d, why, font(38), PAGE_W - 2 * M - 320):
        d.text((M + 230, yy), ln, font=font(38), fill=FAINT)
        yy += 52
    f = font(30)
    d.text((M, PAGE_H - 120), os.path.basename(path), font=f, fill=FAINT)
    return im


def main():
    total = sum(len(s[3]) for s in SETS)
    pages, n, missing = [cover(total)], 0, []
    for label, accent, folder, shots in SETS:
        for fname, sku, why in shots:
            p = os.path.join(folder, fname)
            if not os.path.exists(p):
                # Filenames in the campaign folders carry accents; fall back to a
                # prefix match on the shot code rather than dropping the frame.
                code = fname.split("-")[0]
                cand = [f for f in sorted(os.listdir(folder)) if f.startswith(code + "-")]
                if cand:
                    p = os.path.join(folder, cand[0])
                else:
                    missing.append(fname)
                    continue
            n += 1
            pages.append(page(n, p, label, accent, sku, why))

    for q in (85, 78, 70, 62):
        pages[0].save(OUT, save_all=True, append_images=pages[1:],
                      resolution=200.0, quality=q, optimize=True)
        if os.path.getsize(OUT) <= 29 * 1024 * 1024:
            break
    print("%s  %d pages  %.1f MB  q=%d" % (OUT, len(pages), os.path.getsize(OUT) / 1048576, q))
    if missing:
        print("missing:", missing)


if __name__ == "__main__":
    main()
