# Video ads — three variations, one built

## The research spine

Jewellery video that performs follows a fixed shape, and all three variations
are built on it: **macro hook 0–3s** (slow push into the stone), **turn or reveal
3–7s** (settings, clasp, underside — the craft proof), **specular sweep 7–10s**
(light travelling across metal, which is what separates "photographed" from
"rendered"), done by 15s. Vertical 1080×1920. It has to work sound-off, because
most of it is watched muted.

## The three variations

| | Name | Length | Sound | Job |
|---|---|---|---|---|
| 1 | **THE TURN** | 12s | silent | Cold-traffic performance. Floating ring → 180° turn → raking light sweep → endcard. Cheapest, highest CTR, no story. |
| 2 | **SIX SURFACES** | 15s | silent + kinetic type | The craft gap. Six 2.5s shots — clay, khadi, water, petal, pomegranate, jaali. Type carries it, so no voice localisation for a multi-language market. |
| 3 | **THE LONG QUIET** | 29s | **voiceover** | Brand film. Six moving frames, one voice, no music. Cuts down to 15s and 6s off the same master. |

Variation 3 is built.

## THE LONG QUIET — how it was made

**Animate the stills; never re-generate the product.** Every shot starts from a
frame that already scored 9.0 or better and was checked against its supplier
photo. Seedance 2.0 takes it as `start_image` and the prompt's whole job is to
forbid change: *"the ring and the terracotta slab do not move, change shape,
change colour or change position — this is a real photograph coming to life, not
a redraw."* The only motion allowed is one physical event per shot — light
creeping, a rack of focus, a single ripple, an earring settling on its stem.
Product drift, which has been the running battle all session, cannot happen if
the product is never redrawn.

**Pad to 9:16, don't crop.** A centre-crop from 4:5 to 9:16 cuts ~28% off each
side, and these frames carry their scale referents — the cardamom pod, the
peppercorn, the dried rose — out near the edges. Losing those loses the point of
the shot. `video-pad-916.py` keeps the frame whole and extends the ground colour
above and below, sampled from the plate's own edge rows. The bands double as the
copy shelves.

**Structure.** Earth → cloth → spice → flower → water → light. Six 4s shots hard
cut, then a 5s endcard. Voiceover across the whole thing, the last line landing
on the wordmark.

> Before it is worn, it is held.
> Pressed into clay that remembers its shape.
> Rested on cloth that gives beneath it.
> Measured against a cardamom pod. A petal. A still afternoon.
> Nothing here was hurried.
> Naira Flore. Softly, slowly, worn.

## Two things worth knowing

**No music.** The Higgsfield audio surface has no general-purpose music or SFX
model — the ones that exist are scoped to the game pipeline and must not be used
for standalone audio. So the track is voice and silence. For a film called The
Long Quiet that is arguably right, but if a bed is wanted it has to be licensed
and laid over the master.

**The voice is a stand-in.** The preset voice library has no Indian-accented
English voice. "Maya" is warm and unhurried and does the job, but for a brand
whose whole story is an Indian atelier, a real Indian voice — recorded, or cloned
into `seed_audio` from a sample via `audio_references` — would be a straight
upgrade. The script is written to be re-read in one take.

**One API note.** `generate_video_batch` can answer with a preset recommendation
instead of submitting a job. It is not an error and no credits are spent; resend
the same request with `declined_preset_id` set to the offered preset.

## Reuse

- `video-pad-916.py` — 4:5 stills to 9:16 plates
- `video-cut-long-quiet.py` — endcard, concat, VO lay-down, and the 15s and 6s pulls

---

# Branding the frames

The brand deck (14pp, supplied 6 August 2026) is the source. Two assets were
lifted straight out of it rather than redrawn — no font file needed, and the
shapes stay the deck's own:

- `assets/brand/wordmark-cream.png` — NAIRA, high-contrast Velista serif, the
  pressed-flower glyph nested between the A and the R
- `assets/brand/flower-cream.png` — the stand-alone floral mark

Both are keyed off the deck's flat sage panels to white-with-alpha, so they can
be tinted to any one of the five approved voices at use time.

## Rules followed, literally

| Deck rule | How it is enforced |
|---|---|
| On photography, **cream only** | The mark is tinted to `#FFF8F5` and never to sage, blush or ink on any photographic frame |
| Clear-space = height of the "A" | Padding is set to the wordmark's own cap height on every side |
| Never stretch or condense | Only ever scaled uniformly from the extracted artwork |
| Never tilt, rotate or set on a curve | No rotation anywhere in the pipeline |
| Never recolour outside the palette | Only the deck's cream is used on frames; the endcard uses the primary cream-on-sage lockup |

## Where the mark goes — and where it does not

**Branded: the 50 ad frames.** All four reference-led campaigns plus SOFTLY,
SLOWLY, WORN. Placement is measured, not guessed: each frame is scored cell by
cell for quietness (local detail) and for how well cream will read against it,
with the worst cell in a candidate block weighted above the average so the mark
never straddles a busy edge, plus a bias toward the frame's edges — a logo in
the middle reads as a watermark, not a signature. A soft low-opacity shadow lets
cream hold on the pale frames without breaking the colour rule. The floral seal
goes on every fifth frame only; the deck calls it "the only ornament we allow
ourselves" and it stops being that if it is on everything.

**Not branded: the 189 e-commerce SKU frames.** Those go to Shopify and to
Meta's dynamic catalogue units, which inject the product name and price
themselves — the ad-format research is explicit that a baked-in logo collides
with the auto-rendered card. Adding it there would be actively wrong, so the
`naira-flore-shots/` originals stay clean.

**The film endcard** is now the primary lockup — cream wordmark on sage —
replacing the typed stand-in.
