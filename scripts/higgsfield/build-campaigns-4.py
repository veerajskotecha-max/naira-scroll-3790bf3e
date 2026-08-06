"""Build the four reference-led campaign books.

One book per campaign: a cover naming the campaign and the reference it came
from, then one page per shot carrying its ad job and its score.
"""
import os
import shutil

from PIL import Image, ImageDraw, ImageFont

SCRATCH = ("/tmp/claude-0/-home-user-naira-scroll-3790bf3e/"
           "1171b414-e279-55a3-bd3a-591f6de1e021/scratchpad")
CAMP = os.path.join(SCRATCH, "camp")
ROOT = "/home/user/naira-scroll-3790bf3e"
SELECTS = os.path.join(ROOT, "naira-flore-campaign")

INK, SOFT, FAINT = (28, 28, 28), (95, 89, 83), (150, 144, 138)

BOOKS = [
    ("i-the-red-room", "THE RED ROOM", (92, 18, 28), (240, 226, 222),
     "Oxblood lacquer, water beads, red glass bangles, burgundy silk. Festive "
     "without a single diya — material cues only, never iconographic ones.",
     [("R01", "Woven Gold Hoops", "Hero. Wet oxblood dome, copy shelf above.", 9.5),
      ("R02", "Emerald Eternity Band", "Red glass bangles glowing behind the silver.", 9.0),
      ("R03", "Prism Rivière Bracelet", "Standing water, full mirror reflection.", 9.5),
      ("R04", "Pearl Ribbon Ring", "Burgundy silk glove on bone white. High fashion.", 8.5),
      ("R05", "Solitaire Whisper Studs", "Split pomegranate; a seed proves the scale.", 9.5),
      ("R06", "Amber Dome Ring", "Macro on oxblood velvet, every granule in relief.", 9.0),
      ("R07", "Serpentine Whisper Chain", "Poured over a lacquer edge, copy space right.", 9.0),
      ("R08", "Pearl Point Studs", "Ear crop, crimson silk bouncing onto the jaw.", 8.5),
      ("R09", "Heartbead Bracelet", "Wrist on oxblood silk, toggle and heart charm.", 8.5),
      ("R10", "Bold Nocturne Chain", "Hero. Kept a plinth against the brief — see notes.", 8.0)]),
    ("ii-still-water", "STILL WATER", (150, 178, 168), (244, 238, 230),
     "Botanical cradle and water. Calla lily, petals, a meniscus, a mirror "
     "reflection. The quietest of the four and the closest to the house palette.",
     [("W01", "Emerald Drop Earrings", "Hung from the curl of a calla lily stem.", 9.5),
      ("W02", "Pearl Halo Studs", "Cradled in a bruised magnolia petal.", 9.0),
      ("W03", "Dewdrop Bezel Necklace", "Half submerged; the waterline refracts it.", 8.5),
      ("W04", "Halo Bloom Ring", "Hand on still water, hand and reflection meeting.", 9.5),
      ("W05", "Ribbon Bow Earrings", "Backlit lotus petal glowing translucent.", 9.0),
      ("W06", "Heartline Paperclip Necklace", "Wet slate, stations holding water beads.", 9.0),
      ("W07", "Blush Halo Ring", "Garden-rose petals, blush on blush.", 8.5),
      ("W08", "Emerald Cluster Studs", "Nested in the channel of a curled leaf.", 9.0),
      ("W09", "Tassel Nocturne Necklace", "The pearl touching water. One ring of ripple.", 9.5),
      ("W10", "Trio Bloom Ring", "Threaded onto a stem below an unopened bud.", 9.0)]),
    ("iii-after-dark", "AFTER DARK", (26, 26, 28), (232, 224, 210),
     "Black ground, one pool of light, product floating with nothing beneath it. "
     "Champagne and glass. Built for gifting season and for stopping a thumb.",
     [("D01", "Cushion Halo Ring", "Floating between two glowing discs.", 9.5),
      ("D02", "Rivière Eternal Necklace", "Draped over a champagne coupe, falling past the stem.", 9.5),
      ("D03", "Silver Drop Earrings", "Suspended in a cool spot, black all round.", 9.0),
      ("D04", "Classic Solitaire Ring", "One hard shaft, dust in the beam, long shadow.", 9.0),
      ("D05", "Pearl Ceremony Set", "Falling through the dark, beads rim-lit.", 9.0),
      ("D06", "Golden Nugget Studs", "Mirror-black basalt; brushed satin grain in relief.", 9.5),
      ("D07", "Emerald Rivière Bracelet", "Champagne glowing through the green baguettes.", 8.5),
      ("D08", "Charm Box Chain", "One dead-straight vertical line. Severe and graphic.", 9.0),
      ("D09", "Petite Pavé Band", "Extreme macro in a raking beam.", 8.5),
      ("D10", "Pave Star Chain Drops", "Two stars hanging, caught having just stopped swinging.", 9.0)]),
    ("iv-not-a-phase", "NOT A PHASE", (18, 90, 62), (238, 232, 222),
     "Surreal conceptual posters. Saturated colour blocks, one impossible idea "
     "per frame, and copy space built into every composition.",
     [("P01", "Molten Bloom Hoops", "Green on green; a butterfly that vanishes into the field.", 9.5),
      ("P02", "Cuban Pearl Bracelet", "Suspended in a drip bag of liquid gold.", 9.5),
      ("P03", "Scatter Light Band", "Magenta colour block, hand from directly above.", 8.5),
      ("P04", "Pearl Blossom Earrings", "Held weightless inside a soap bubble.", 9.0),
      ("P05", "Ivory Clasp Chain", "The chain IS the horizon between sage and cream.", 9.5),
      ("P06", "First Light Set", "An eclipse; the stone sits dead centre and fires.", 9.5),
      ("P07", "Baroque Bloom Cuff", "Slipped over a travertine column. Architectural.", 9.0),
      ("P08", "Noir Huggie", "Sage block, curb chain caught mid-swing.", 9.0),
      ("P09", "Vintage Halo Ring", "Tilted to an ellipse, orbiting an arc of light.", 9.0),
      ("P10", "Ribbon Bead Bracelet", "Draped along a ribbon of silk twisting in air.", 9.0)]),
]

PAGE_W, PAGE_H = 2200, 2900
M = 110


def font(sz, bold=False):
    base = "/usr/share/fonts/truetype/dejavu/DejaVuSans"
    return ImageFont.truetype(base + ("-Bold" if bold else "") + ".ttf", sz)


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


def cover(title, accent, ground, blurb, shots, roman):
    im = Image.new("RGB", (PAGE_W, PAGE_H), ground)
    d = ImageDraw.Draw(im)
    ink = INK if sum(ground) > 400 else (245, 240, 234)
    soft = SOFT if sum(ground) > 400 else (200, 192, 184)
    d.rectangle([0, 0, PAGE_W, 26], fill=accent)
    d.text((M, 400), "NAIRA FLORE  ·  CAMPAIGN " + roman, font=font(38), fill=soft)
    y = 500
    for w in title.split():
        d.text((M, y), w, font=font(165, True), fill=ink)
        y += 185
    d.rectangle([M, y + 40, M + 260, y + 50], fill=accent)
    y += 140
    for ln in wrap(d, blurb, font(46), PAGE_W - 2 * M - 240):
        d.text((M, y), ln, font=font(46), fill=soft)
        y += 66
    avg = sum(s[3] for s in shots) / len(shots)
    d.text((M, PAGE_H - 260), "%d shots  ·  4:5  ·  average %.2f / 10" % (len(shots), avg),
           font=font(44, True), fill=ink)
    d.text((M, PAGE_H - 180), "no burned-in copy  ·  no price  ·  copy space in every frame",
           font=font(36), fill=soft)
    return im


def page(code, name, job, score, accent):
    im = Image.new("RGB", (PAGE_W, PAGE_H), "white")
    d = ImageDraw.Draw(im)
    ph = Image.open(os.path.join(CAMP, code + ".png")).convert("RGB")
    ph.thumbnail((PAGE_W - 2 * M, 1980), Image.LANCZOS)
    im.paste(ph, ((PAGE_W - ph.width) // 2, M))

    y = M + 1980 + 90
    d.text((M, y), code, font=font(112, True), fill=accent)
    d.text((M + 290, y + 16), name.upper(), font=font(62, True), fill=INK)
    yy = y + 110
    for ln in wrap(d, job, font(40), PAGE_W - 2 * M - 430):
        d.text((M + 290, yy), ln, font=font(40), fill=FAINT)
        yy += 56
    tag = ("%.1f" % score) + " /10"
    f = font(74, True)
    d.text((PAGE_W - M - d.textlength(tag, font=f), y + 26), tag, font=f, fill=INK)
    return im


def main():
    total, n = 0.0, 0
    for slug, title, accent, ground, blurb, shots in BOOKS:
        roman = slug.split("-")[0].upper()
        out_dir = os.path.join(SELECTS, slug)
        os.makedirs(out_dir, exist_ok=True)
        pages = [cover(title, accent, ground, blurb, shots, roman)]
        for code, name, job, score in shots:
            shutil.copyfile(os.path.join(CAMP, code + ".png"),
                            os.path.join(out_dir, "%s-%s.png"
                                         % (code, name.lower().replace(" ", "-"))))
            pages.append(page(code, name, job, score, accent))
            total += score
            n += 1
        out = os.path.join(ROOT, "naira-flore-campaign-%s.pdf" % slug)
        for q in (88, 80, 72, 64):
            pages[0].save(out, save_all=True, append_images=pages[1:],
                          resolution=200.0, quality=q, optimize=True)
            if os.path.getsize(out) <= 29 * 1024 * 1024:
                break
        print("%-46s %2d pages  %5.1f MB  avg %.2f"
              % (os.path.basename(out), len(pages), os.path.getsize(out) / 1048576,
                 sum(s[3] for s in shots) / len(shots)))
    print("40-shot average: %.2f" % (total / n))


if __name__ == "__main__":
    main()
