# Verification

A frame is not finished when it looks right. It is finished when a number says it is right.

Contact-sheet size hides ratio errors. Every miss that has shipped past a first review was
invisible at montage size and obvious at full resolution. **Zoom before you judge.**

---

## The method: pixel-ratio normalisation

The frame and the live photograph are at different scales, different crops, different angles. You
cannot compare them by eye. Pick one feature that appears in both, scale both images so that
feature is the same number of pixels wide, and then the two are directly comparable.

1. **Pick the shared feature.** Something with hard edges that is the same real object in both: one
   bead, one chain link, one stone, the width of a finger, the height of an ear from the top rim to
   the bottom of the lobe.
2. **Measure it in pixels in both images.** Crop tight and overlay a ruler — see
   `scripts/normalise.py`.
3. **Scale so the feature matches**, then put the two side by side.
4. **State the result as a ratio, not an adjective.** "The heart is 1.57 beads wide in the frame and
   2.3 beads wide on the live page" is a verdict. "It looks a bit small" is not.

Angle is the trap. A foreshortened ear or a tilted hoop compresses one axis and inflates every
ratio measured against it. When the two images are at different angles, prefer a feature **internal
to the product** — stone count around a hoop, bead count along a bar, links between two beads —
because an internal ratio is immune to how the piece is turned. Use the body as the ruler only when
both images show it from roughly the same angle.

## What to check on every frame

| Check | Question |
|---|---|
| **Same piece** | Is this the object on the live product page, or a plausible cousin? |
| **Construction** | The named feature that morphs — the braid, the paperclip link, the heart cut, the four-claw basket, the open shank. Is it intact at full resolution? |
| **Count** | Number of stones, links, rails, beads, charms. Count them. |
| **Metal** | Yellow / rose / silver. No drift, no mixing. |
| **Stone colour** | Especially against a coloured set — a lilac ground turned a clear stone amethyst once. |
| **Scale** | The measured ratio against the live page and against `sizing.md`. |
| **Placement** | Where on the body. A 45cm chain sits at the collarbone, not the chest. |
| **Copy space** | Is two-fifths of the frame still clear for type? |
| **Artifacts** | Borders, torn-paper edges, printed-photo frames, text, watermarks, a second piece drifting into shot. |

## Build a verification sheet per frame

One image per frame: the generated frame large on the left, every live image for that SKU as a
labelled strip on the right, title bar naming SKU, code, category and status. Read it as an image
and write the verdict beneath. Keep the sheets — they are the evidence the work was checked.

## The verdict

Re-shoot on any **fidelity** miss (wrong shape, wrong metal, wrong count, wrong stone) or any
**sizing** miss beyond roughly 15% of the live ratio. Do not ship a frame with a note saying it is
slightly off; the note does not travel with the ad.

Expect about a third of any batch to need a second pass. Three or four passes on one frame is
normal when the miss is a single detail — each pass fixes one thing without breaking the others.
Watch for the overshoot: a correction of "too small" has come back "too big" more than once, so
state the target as a ratio with a value, not a direction.

## Scoring

Score each finished frame /10 on: idea, fidelity to the piece, sizing, light, and usable copy
space. Record the score and a one-line note in `final.json`. A campaign average under 8.5 is not
ready to show.
