---
name: naira-sku-listing
description: Turn a supplier SKU into a complete Naira Petite Shopify listing — four images per SKU (one packshot, three worn frames on the one locked house plate), each verified against the supplier reference and the published size guide, assembled into an approval artifact, and only then created as a Shopify DRAFT with name and price. Use whenever the ask is to shoot, list, onboard, or draft new SKUs from a supplier book (KAVNAR, Yiss Fera, Yiwu JD, Alibaba, 1688, Made-in-China), or to re-shoot the image ladder on an existing listing. Not for campaign or ad imagery — that is `/imagegenerationnaira`.
---

# Naira SKU listing

The standing procedure for taking a SKU from a supplier book to a Shopify draft.

It is a **listing** pipeline, not a campaign one. Campaign frames sell a mood and
carry copy space; listing frames sell the object and answer two questions a buyer
asks before they add to cart: *what is it actually made of* and *how big is it on
me*. Everything below serves those two questions.

Start from the standing jewellery proof sheet
(https://claude.ai/code/artifact/444d3189-88e4-47ca-abbc-6c47a5f6aaea) and update
it when the work is done. Read `CLAUDE.md` first; its constraints govern.

---

## The deliverable

**Four images per SKU, in this order.**

| # | Frame | Ground | What it has to do |
|---|---|---|---|
| 1 | **Packshot** | Cream plaster block, the house `ecom` plate | Show the whole piece, straight on, nothing else in frame |
| 2 | **Worn — establishing** | The house model plate | Show it on the body at the category's standard crop |
| 3 | **Worn — closer** | The same plate, same wardrobe, same light | Show the construction at arm's length |
| 4 | **Worn — angle** | The same plate again | Show the piece from the side or three-quarter |

Frames 2, 3 and 4 are **one shoot**. Same model, same hair, same makeup, same
garment, same background, same light, across every SKU in the run and across every
run. A customer scrolling the collection page should see one shoot, not twenty.

---

## The house plate — locked

This is not re-invented per SKU. It already exists in the live catalogue and every
new frame matches it.

> A young Indian woman, late twenties, warm mid-brown skin with golden undertones.
> Long dark brown hair, loose natural waves, falling behind the shoulders. Bare
> shoulders. She wears a **marigold-saffron silk camisole** with narrow spaghetti
> straps and a soft draped V neckline. Makeup is bare and warm: skin left with its
> own texture, a soft nude-rose lip, no visible eye makeup. Nails short, bare,
> pale nude, no polish colour. Ground is a **warm cream seamless** with a gentle
> gradient falloff — never sand, tan, beige or golden. Soft large key from
> camera-left, a single soft shadow, no hard edges.

**Reference frames already on the site** — pass these as IMAGE 2 / IMAGE 3 so the
model, garment and light carry over exactly:

| Category | Crop | Live reference |
|---|---|---|
| Earrings | Three-quarter profile, hair tucked behind the ear, cropped just above the lip | `verdant-circlet-studs-1.jpg`, `pearl-halo-studs-1.jpg`, `pave-initial-chain-drops-1.jpg` |
| Necklaces | Front, throat and collarbones, cropped just above the lip | `dewdrop-bezel-necklace-2.jpg`, `heartline-paperclip-necklace-2.jpg` |
| Rings | Hand raised to the throat or resting on the chest | `star-point-band-1.jpg`, `halo-bloom-ring-1.jpg`, `chevron-whisper-ring-2.jpg` |
| Bracelets / bangles | Forearm across the body, wrist forward | `lumiere-oval-bracelet-1.jpg`, `bold-nocturne-bracelet-3.jpg`, `heartbead-bracelet-4.jpg` |

Pull them from `https://cdn.shopify.com/s/files/1/0680/9606/5698/files/<name>`.

The packshot plate is `plates.json → ecom` (job `8cf120d5-…`), unchanged.

---

## The reference chain

Per frame, three to four references, **in this order**:

1. **IMAGE 1 — the supplier packshot.** The flattest, most straight-on view of the
   piece. This is the authority on construction. Never lead with a macro (see
   failure modes).
2. **IMAGE 2 — the plate.** The cream block for frame 1; the matching live worn
   frame for frames 2–4.
3. **IMAGE 3 — a second supplier angle**, for surface and depth, when one exists.
4. **IMAGE 4 — the supplier's own worn shot**, when one exists, purely to fix how
   large the piece sits on the body.

Confirm the `medias` array is present in every `generate_image_batch` request. A
request with no `medias` still submits, still charges, and comes back as generic
stock.

---

## Prompt anatomy

Every listing prompt has five parts, in this order.

**1. SHOT.** Camera, crop, orientation. One sentence.

**2. THE PRODUCT.** Which reference is the authority for what. Name them by number.

**3. CONSTRUCTION LOCK.** A positive description of how the piece is actually
built, naming the part that will morph and stating what it must stay.

> "The dome is covered in hundreds of tiny raised ROUND METAL BEADS — little
> polished balls packed in dense rows, catching light as metal highlights. It is a
> beaded, caviar-like metal texture. It is NOT a smooth field of flat faceted cut
> stones, and it is NOT a pavé setting."

**4. SCALE TEST.** A geometric test the model can check against the body, with a
number. Never an adjective.

> "The hoop is 18mm across and an earlobe is 18mm tall, so the hoop reaches from
> the top of the lobe to the bottom of the lobe and stops there."

**5. ABSENCE LIST.** What must not appear. The negative list does more work than
the positive sentence. On any flat-ground frame this must be exhaustive: *no
plinth, no pedestal, no cube, no ledge, no table, no floor, no wall, no horizon,
no gradient, no cast shadow because there is no surface for a shadow to fall on.*

Supplier packshots often carry a printed wordmark above the product. State
positively that **only the jewellery is photographed** and that no lettering,
watermark or logo appears anywhere in frame.

---

## Sizing — where it comes from

The published guide on nairaflore.com is the authority, because it is what the
customer reads before buying. It lives in `src/data/seoContent.ts`,
`src/data/seoLandings.extra.ts` and `src/pages/Jewellery.tsx`; the numbers are
transcribed in `scripts/higgsfield/sizing.md`.

| Category | Standard |
|---|---|
| Ring bands | ≤6mm wide |
| Ring and stud stones | 4–6mm |
| Hoops | 20–25mm everyday, 30mm large |
| Bracelets | fits a 15–18cm wrist; strands run 20–20.5cm |
| Bangles | 6cm inner diameter |
| Necklaces | 40cm throat · 45cm collarbone · 50cm below |

**The body ruler** — a finger is ~16mm across, an earlobe ~18mm tall, a wrist
~55mm across, a collarbone sits at a known depth. On a plinth a piece has no
reference object, so drift is invisible and harmless. On the body the skin *is*
the ruler. That is why sizing only ever breaks on worn frames, and why the fix is
always a real measurement in the prompt.

**Supplier dimensions.** Check the supplier book first
(`scripts/higgsfield/supplier-tracker.json → sizing_from_supplier_spec_sheets`).
Alibaba serves a captcha to both curl and headless Chromium through this
environment's proxy and Made-in-China 404s on SKU search, so live listing pages
generally cannot be re-opened from here — say so rather than inventing a number.
Where no supplier dimension exists, fall back to the published standard and record
which one was used.

---

## Generating

Model **Nano Banana Pro** (`nano_banana_pro`, reports as `nano_banana_2`), 4:5,
2K, one product per frame. Batch with `generate_image_batch`, then `jobs_wait`
(≤12 jobs, ≤15s per call), then one `show_generation_by_ids`.

**Shoot a pilot first.** Three SKUs, four frames each. Verify the plate holds and
the recipe reads before committing the rest of the run.

---

## Verifying

Every frame, before it reaches the artifact:

1. **Fidelity.** Open the frame and the supplier packshot side by side at full
   resolution. Does it depict the same physical piece — same stone count, same
   cuts, same settings, same metal tone, same construction?
2. **Sizing.** Scale the frame and the reference so one shared feature is the same
   number of pixels in both, put them side by side, and read the ratio. A miss
   invisible at montage size is obvious once the ruler matches.
3. **Continuity.** Does the model, garment, hair, makeup, light and ground match
   the plate and the rest of the run?
4. **Lettering.** Crop any mark or packaging at full resolution and read it
   character by character.

A frame that fails is re-shot with the target stated **as a ratio with a number**.
Never tell the model "smaller" or "bigger" — every correction that used an
adjective has overshot at least once.

---

## The approval gate

Assemble every frame into an artifact, grouped by SKU, each set beside its
supplier reference, each frame labelled with the measurement it was checked
against. Ship the artifact with a `db` capability so approvals persist and can be
read back with `ArtifactData`.

**Nothing reaches Shopify until the user approves the sets.** Then, and only then:

1. `productCreate` with `status: DRAFT` — never ACTIVE.
2. Title in house style, `productType` set (Ring, Necklace, Bracelet, Earrings,
   Jewellery Set — never empty; an empty `productType` is how clothing is
   identified), vendor Naira Petite, supplier code as the variant SKU.
3. Price.
4. Media in ladder order: packshot, then the three worn frames.
5. Written alt text on every image — never the product title alone.
6. Report the draft URLs. Do not publish.

---

## Failure modes that repeat

- **Plinth bleed.** A frame briefed as flat colour fights the plaster block living
  in its reference. "Flat colour, no surface" is not enough — use the exhaustive
  absence list plus a positive statement of what the object is doing instead.
- **Macro reference bleed.** A macro exaggerates whatever is nearest the lens. Lead
  with the flattest view; put the macro second.
- **Overcorrecting a re-shoot.** State the target as a ratio with a number and
  re-measure after every pass.
- **A reference that is not what its slot says.** Open every reference before
  uploading it. Name files by what they show.
- **Inverted relief.** When a physical effect fails twice, restate it as geometry:
  what is above what, what steps down, what the eye passes as it crosses the frame.
- **An unrenderable conceit.** Powder, paper, wax, cloth, water and glass render
  reliably; opaque liquids and refraction offsets do not. Swap the medium rather
  than buying a third pass.
- **Trusting a thumbnail over a macro.** Zoom to full resolution *before*
  contradicting a listing, not after.
- **Supplier template reuse.** Suppliers shoot every SKU against the same model
  background. Perceptual hashing will match the background, not the piece — always
  settle identity by diffing the jewellery region alone.
