---
name: imagegenerationnaira
description: Make Naira Petite jewellery imagery on Higgsfield — full advertising campaigns (plan, cast, brief, generate, verify against live product pages and the published size guide, re-shoot, assemble a book and update the standing proof sheet) and one-off production work (PDP frames, re-shoots, background swaps, ad creative, batches). Use whenever the user asks for a Naira campaign, shoot, lookbook, ad creative, PDP ladder, hero frames, worn/model shots, a re-shoot, or mentions Higgsfield, Nano Banana, Naira Petite or nairaflore alongside images. Covers the reference chain, the fidelity and scale locks, the verification method, the four repeating failure modes, and the Higgsfield call mechanics.
---

# Naira image generation

Two modes. Read the mode table, then the shared rules, then the pipeline for your mode.

| Mode | When | Output |
|---|---|---|
| **CAMPAIGN** | "make a campaign", "new shoot", "ad creative", a named direction, "six frames" | A scored, verified set of frames + a PDF book + the proof sheet updated in place |
| **PRODUCTION** | "re-shoot this SKU", "fill the gaps", "PDP frames", "swap the background", a folder of SKUs | Frames appended to the proof sheet, nothing published |

Both modes obey the same reference chain, locks and verification. Only the planning layer differs.

---

## Before anything: the three source-of-truth documents

Open these first, every time. Do not work from memory.

1. **The standing proof sheet** — `https://claude.ai/code/artifact/444d3189-88e4-47ca-abbc-6c47a5f6aaea`
   Every jewellery SKU on Shopify with every live product image. Read it (`action: "read"`), work from it, republish to the **same URL** when done. Never create a second proof sheet.
2. **`scripts/higgsfield/sizing.md`** — the published size standard every frame is measured against. It is the site's own customer-facing numbers, not an invention.
3. **`scripts/higgsfield/campaign-*.md`** — what has already been shot, what scored, and what was re-shot and why.

Plus the root `CLAUDE.md` for standing constraints.

## The reference chain, in order of authority

**Live product page → supplier photograph → listing copy.**

- A generated frame is only valid if it shows the **same physical piece** as that product page.
- Where a Drive supplier photo disagrees with the live page, re-shoot from the live page.
- Where the listing copy disagrees with every photograph, follow the photographs and flag the copy — **but zoom to full resolution before you decide the copy is wrong.** See failure mode 3.
- Lead with the **flattest** view. Straight-on packshot as IMAGE 1, macro second. Never the reverse. See failure mode 2.
- Two references minimum, three or four preferred.

## Model and format

`nano_banana_pro` (reports back as `nano_banana_2`), `quality: "2k"`, `aspect_ratio: "4:5"`, **one product per frame**.
Roughly 2 credits per generation. Check `balance` before a large batch.

## Copy space is not optional

Every frame reserves about **two fifths** of its area as clean, empty, even ground — a flat wall, an unused third, a plain field. Type and layers go on top later. No burned-in copy, no prices, no logos. Frames must crop to 1:1 and 9:16 without losing the piece.

---

## Prompt anatomy

Seven blocks, in this order. The two middle blocks do most of the work.

```
SHOT            one line: format, what kind of picture, one product only
THE PRODUCT     IMAGE 1 and IMAGE 2 are the same real piece; reproduce it
CONSTRUCTION    the fidelity lock — name what will morph, positively and negatively
SCALE TEST      a checkable geometric edge, never an adjective
SCENE           the idea, built concretely
LIGHT           direction, quality, and the specular kicker
COMPOSITION     where the piece sits and where the empty field is
NEGATIVES       an exhaustive absence list
```

### The fidelity clause names what will morph

Not "a braided hoop" but: *"the body of the hoop is a BRAID — it must stay a visible braid of separate twisted strands crossing over and under one another, with real shadow in the grooves between them; never a smooth plain tube, never a rope-embossed surface."*

Say what it is, then say what it must never become.

### The scale test has a checkable edge

Never "petite", "delicate", "not too large". Always a ratio the model can measure against something else in the frame.

| Bad | Good |
|---|---|
| a petite bow | the bow is 16mm and a finger is 16mm across, so the two loops reach the edges of the finger and stop there |
| a large charm | the heart is as wide as two beads side by side; the toggle ring is as wide as two beads side by side; the bar is as long as four beads in a row |
| a small stud | the flower is 12mm and an earlobe is 18mm tall, so the whole stud sits inside the lobe with bare skin all round it |

**On worn frames the body is the ruler** and errors show instantly: a finger is ~16mm across, an earlobe ~18mm tall, a wrist ~55mm, the front of the neck ~110mm, a turned-back shirt cuff ~55mm deep. Use them.

### Light: the second source is what stops gold going plastic

One large soft window source frontal-left, low and warm — **plus one small hard specular kicker from the right**. Without that second hard source the model renders gold as matte plastic. It is the single sentence that separates photographed from generated.

---

## Pre-flight — the four things to check before spending credits

Every one of these has cost a wasted batch.

1. **`medias` is actually in the request.** A prompt that says "IMAGE 1 is the authority…" with no
   `medias` array submits happily, charges, and returns generic stock. Check every request object.
2. **Each reference is the image you think it is.** Open them. A file named `…-worn.png` turned out
   to be a second packshot, and a "worn" slot was once filled with a macro on green velvet — in both
   cases the scale drifted because the frame had no body reference at all. Name reference files by
   what they show and look at them before uploading.
3. **The flattest view is IMAGE 1.** Packshot first, worn still second, macro last. On a worn frame,
   the SKU's own live on-model photograph is the size authority and belongs at IMAGE 2.
4. **Write the prompts to a file before sending.** They are long, they get iterated three or four
   times, and a re-shoot is a diff against the last version — not a rewrite from memory.

---

## The four repeating failure modes

**1 · Plinth bleed.** Any frame briefed as a flat colour field fights the plaster block living in the e-com still used as its reference. "Flat colour, no surface" is not enough. What works is an exhaustive absence list *plus* a positive statement of what the object is doing instead:

> There is no plaster block, no plinth, no pedestal, no cube, no step, no ledge, no shelf, no table, no floor, no wall, no horizon line, no gradient and no cast shadow, because there is no surface for a shadow to fall on. … The necklace is pulled out dead straight and held taut in mid-air.

**2 · Macro reference bleed.** A macro exaggerates whatever is nearest the lens and the model copies those proportions. The Heartbead Bracelet inherited a macro's fat foreground beads and its 15mm heart charm came back smaller than the toggle ring. Lead with the flattest view, and check the ratio numerically.

**3 · Trusting a thumbnail over a macro.** At contact-sheet size the Heartline Paperclip Necklace looked like plain oval links and round bezels, so it was briefed *against* its own name — wrong twice before zooming in. The live macro showed the name was literal: paperclip links, heart-cut stones in pavé halos. Zoom to full resolution **before** contradicting a listing.

**4 · A word in the brief overriding the reference.** The Star Point Band carries a four-lobed clover. Two passes drew a five-pointed star because the brief said "star" — the word beat the photograph sitting right next to it. Name shapes geometrically: quatrefoil, four-lobed clover, elongated oval with rounded ends.

A fifth, related: **a pale or coloured set bleeds into the product.** Gold desaturates to silver on bone plaster; a clear stone goes amethyst on lilac paper. Fix by stating the product's own colour as a positive fact *and* explicitly denying the set's: *"the lilac belongs to the paper and the flowers alone; not one bit of it enters the stone."*

---

## Verification — the part that is not optional

Scoring a contact sheet is not verification. Full details in `references/verification.md`. The short form:

1. Build a per-frame sheet: the frame beside **all** of that SKU's live page images, not just the two it was shot from.
2. Read it at full resolution. Montage size hides ratio errors.
3. **Normalise and measure.** Scale the frame and the live photo so one shared feature — a bead, a link, a stone, a bezel — is the same pixel width in both, then put them side by side. A miss invisible at thumbnail size is obvious once the ruler matches.
4. Check the category measurement against `sizing.md`.
5. Score out of 10. Anything under 9.0 gets a stated reason.
6. Re-shoot anything with a **fidelity** miss (wrong shape, wrong metal, wrong count, wrong stone) or a **sizing** miss. Concept misses are a judgement call — see below.

**When the frame is right and the caption is wrong, fix the caption.** A Serpentine Whisper pendant is 10mm and a cherry is 22mm; the brief called them twins. The honest move was renaming the shot, not inflating the stone. Never distort a product to rescue a line.

---

## CAMPAIGN pipeline

1. **Pick the direction.** See `references/house-directions.md` for what the brand has liked and scored. Do not use black grounds — the brand bible names black in the anti-brief.
2. **Cast six SKUs.** Re-derive the jewellery list from Shopify (non-empty `productType`). Exclude anything already used in another campaign unless re-shooting it deliberately. Build a visual pick sheet of the unused SKUs and choose on looks, not names. Prefer `ACTIVE` over `DRAFT` and 4+ live images; flag any `DRAFT` you use — a beautiful frame of an unbuyable SKU is worth nothing as an ad.
3. **Spread the categories.** Six frames should not be four rings.
4. **Write one idea per frame** that can be checked: an impossible event, a material doing something, a broken physical law, a measurement proved against the body. One idea, not two.
5. **Pull references.** Two per SKU, flattest first, capped at 1600px.
6. **Upload.** See `references/higgsfield-calls.md` — `media_upload` results usually exceed the token limit and spill to a file; `scripts/doupload.py` handles that.
7. **Generate** as one `generate_image_batch` (max 12).
8. **Verify** every frame as above.
9. **Re-shoot** failures. Expect a third to need it. Three or four passes on one frame is normal when the miss is a single detail.
10. **Assemble**: `final.json` carrying camp / title / handle / job id / version / score / note per frame, a PDF book, and the proof sheet updated **in place**.
11. **Record** the campaign as `scripts/higgsfield/campaign-*.md` — scores, what was re-shot, and any new transferable finding.

## PRODUCTION pipeline

Same reference chain, locks and verification; skip the direction and casting steps.

1. Read the proof sheet; find the SKUs with fewer than four live images, or take the list given.
2. Pull the live images. Where a supplier photo exists, cross-check it — supplier photos have been the wrong product before.
3. Reuse the staging plates in `scripts/higgsfield/plates.json` as IMAGE 2 so the whole catalogue reads as one shoot.
4. Generate, verify, re-shoot.
5. Append to the proof sheet. **Nothing goes to Shopify without explicit approval.**

---

## Standing constraints

- **Jewellery only.** Never touch clothing images.
- **Nothing is uploaded to Shopify and nothing is committed until the user approves.**
- **Do not commit campaign assets** — images, video, generated frames — to the repo. Documentation and scripts only.
- Never publish a theme, never write to theme `143850864802` ("Naira official", LIVE), never change DNS, never touch Settings → Payments or the Razorpay app, never delete a theme or theme file.

## Reference files

- `references/verification.md` — the measuring method, step by step, with the normalisation script
- `references/house-directions.md` — the campaigns shot so far, their palettes and scores
- `references/higgsfield-calls.md` — exact call shapes, the spill-file workaround, batching and polling
- `scripts/doupload.py` — PUTs the bytes for a spilled `media_upload` and records the media ids
- `scripts/normalise.py` — scales two images to a shared feature width for ratio checking
