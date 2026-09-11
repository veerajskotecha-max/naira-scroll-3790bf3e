# Naira Petite — working notes

## The jewellery proof sheet is the standing verification document

There is ONE proof sheet for jewellery product imagery. Do not create a new one.

- **Live artifact:** https://claude.ai/code/artifact/444d3189-88e4-47ca-abbc-6c47a5f6aaea
- **Title:** "Naira Jewellery Proof Sheet"

**Every time we verify product images, use this document and update it in place.**
Republish to the same URL rather than publishing a new artifact — pass that URL as
`url` to the Artifact tool from any conversation that did not itself publish it.
Read it first (`action: "read"`) and build the update on what comes back.

### What it must always contain

- **All jewellery SKUs on Shopify.** As of 9 Sep 2026 that is **71** (90 products
  total, minus 19 with an empty `productType`, which are clothing). Jewellery is
  identified by a non-empty `productType`: Ring, Necklace, Bracelet, Earrings,
  Jewellery Set. Re-derive this count each time; do not assume 71 still holds.
- **Every live product image** for each SKU, in its real Shopify media order,
  labelled by position, with its alt-text status.
- For any SKU we have shot: the supplier reference and the new frames beside it,
  with the measurement each frame was checked against.

### The rule that governs what goes in

A generated frame is only allowed in the sheet if it depicts the **same physical
piece** as the images already on that product page. The live product page is the
authority — above the supplier photograph and above the listing copy. Where a Drive
supplier photo disagrees with the live page, re-shoot from the live page. Where the
listing copy disagrees with every photograph, follow the photographs and flag the
copy.

### Standing constraints

- Jewellery only. Never touch clothing images.
- Nothing is uploaded to Shopify and nothing is committed until the user approves
  the sheet.
- Never publish a theme, never write to theme `143850864802` ("Naira official", LIVE),
  never change DNS, never touch Settings → Payments or the Razorpay app, never delete
  a theme or theme file.
- Do not commit campaign assets (images, video, generated frames) to this repo.

### It governs Higgsfield campaign work too

**Any Higgsfield work for Naira products starts from this document.** Campaigns,
ad creative, social frames, product imagery — all of it. Open the proof sheet
first, take the product references from it, and update it when the work is done.
It is the single source of truth for what each piece actually looks like.

For every campaign frame:

- **Reference the verified live product images** from the sheet — that SKU's own
  delivered e-com still is a cleaner reference than a supplier packshot, because
  the product is already isolated there. Use three to four references per frame:
  the live page images first, the supplier photograph second.
- **Check every frame against the published sizing** in `scripts/higgsfield/sizing.md`.
  If scale or placement is off, re-shoot the frame — do not ship it. State the
  measurement as a *geometric test the model can check against the body*, not an
  adjective: "the two loops reach the edges of the finger and stop there", never
  "petite".
- **Model is Nano Banana Pro** (`nano_banana_pro`, which reports as
  `nano_banana_2`), 4:5, 2K, one product per frame.
- These frames go on Instagram as the brand and get used as paid ads, so leave
  deliberate copy space in every composition for type and layers to be added later.

### Campaigns the brand likes — the house directions

Five campaigns have been shot and scored (see
`scripts/higgsfield/campaign-softly-slowly-worn.md` for the August reference set
and `scripts/higgsfield/campaign-five-2026-09.md` for the September thirty). The
directions to keep working in:

| Direction | What it is | Score |
|---|---|---|
| **Colourful** — after *NOT A PHASE* | Saturated colour blocks, one impossible idea per frame, copy space built in | 9.15 |
| **Red** — after *THE RED ROOM* | Oxblood lacquer, water beads, red glass bangles, burgundy silk. Festive through material, never iconography | 8.90 |
| **Lilac and bone** | Pale lilac and bone-white, the quiet end of the house palette | 8.92 |
| **Soft physics** — *SOFT PHYSICS* | The pale palette carrying one broken law of physics per frame. Calm and strange at once | 9.17 |
| **How it's worn** — *HOW IT'S WORN* | Worn frames whose only idea is scale, each one built to pass a measurement anyone can check by looking | 9.17 |

*AFTER DARK* (black ground) is deliberately not on this list.

### The two rules that carry the frames

1. **A fidelity clause naming what will morph.** "The braided rope must stay a
   visible braid of separate twisted strands, never a smooth plain tube."
2. **A scale test with a checkable edge.** "The bow is 16mm and a finger is 16mm
   across, so the two loops reach the edges of the finger and stop there."

### The failure mode that repeats — plinth bleed

Every frame briefed as a flat colour field fights the plaster block living in the
e-com still used as its reference. "Flat colour, no surface" is not enough. What
works is an exhaustive absence list plus a positive statement of what the object is
doing instead: *no plinth, no pedestal, no cube, no ledge, no table, no floor, no
wall, no horizon, no gradient, no cast shadow because there is no surface for a
shadow to fall on — the necklace is hanging in the air, not lying down.*

### The third failure mode — trusting a thumbnail over a macro

At contact-sheet size the Heartline Paperclip Necklace looked like plain oval
links and round bezels, so I briefed against its own name — and was wrong twice
before zooming in. The live macro shows the name is literal: paperclip links and
heart-cut stones in pavé halos. **Zoom to full resolution before contradicting a
listing, not after.** The rule that listing copy loses to the photographs still
holds; it just has to lose to the photograph actually examined.

### The second failure mode — macro reference bleed

A macro close-up of a piece exaggerates the parts nearest the lens. Feed one in as
the lead reference and the model learns those wrong internal proportions: on the
Heartbead Bracelet it copied the macro's fat foreground beads, and the 15mm heart
charm came back reading smaller than two beads across when the flat packshot shows
it is exactly two beads wide.

Two habits fix it:

1. **Lead with the flattest view.** Put the straight-on packshot in as IMAGE 1 and
   the macro second, never the other way round.
2. **Check the ratio, don't eyeball it.** Scale the frame and the live photo so one
   shared feature (a bead, a link, a stone) is the same number of pixels in both,
   then put them side by side. A miss that is invisible at montage size is obvious
   once the ruler matches.

State the result as a ratio the model can test: *the heart is as wide as two beads
side by side; the toggle ring is as wide as two beads side by side; the bar is as
long as four beads in a row.*

### The fourth failure mode — overcorrecting a re-shoot

Every correction has overshot at least once. The Heartbead heart went 1.57 beads
→ 3.04 → 2. The Rose Verdant Band went 0.80 of a finger → 0.44 → 0.57. Telling the
model "smaller" or "bigger" moves it past the target. **State the target as a ratio
with a number**, and re-measure after every pass.

### The fifth failure mode — a reference that is not what its slot says

Two second-pass frames drifted because the slot meant for the SKU's own *worn*
photograph held something else: a second packshot in one case, a macro on green
velvet in the other. Neither frame had a body reference at all, so the scale had
nothing to lock to. **Open every reference before uploading it**, and name the
files by what they show.

Related, and cheap to check: a `generate_image_batch` request with no `medias`
array still submits, still charges, and comes back as generic stock. Confirm the
array is present in every request before sending.

### Where the pipeline lives

`scripts/higgsfield/` holds the shot pipeline: `prompt.ts` (the fidelity lock and
per-category staging), `plates.json` (the five staging plates, reused as IMAGE 2 so
the whole catalogue reads as one shoot), and `sizing.md` (the published size standard
every worn frame is measured against).

### The skill that runs all of this

`/imagegenerationnaira` (`.claude/skills/imagegenerationnaira/`) is the working
procedure for both modes — CAMPAIGN (plan, cast, brief, generate, verify,
re-shoot, book, proof sheet) and PRODUCTION (one-off frames, gap-filling,
re-shoots). It carries the reference chain, the prompt anatomy, the scale-test
rules, the verification method, the failure modes above, and the exact Higgsfield
call shapes. Invoke it before starting any Naira imagery work.
