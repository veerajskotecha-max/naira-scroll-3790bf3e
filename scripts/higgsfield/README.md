# Gilded Hour — Higgsfield shot pipeline

Generates the product imagery for all 22 Gilded Hour SKUs by compositing each
real packshot into a fixed set of staging plates, with the product's geometry
and colour locked so nothing about the piece itself is invented.

Model is **Nano Banana Pro** (`nano_banana_pro`) throughout, 4:5, 2K.

## The shape of it

Every generation is **reference prompting with two images**:

| | | |
|---|---|---|
| **IMAGE 1** | the SKU's real packshot | frozen — length, breadth, size, colour, stone count |
| **IMAGE 2** | a staging plate | copied — surface, light direction, shadow, camera |

The prompt exists to keep that split unambiguous. The lock block in
`prompt.ts` is byte-identical on every frame of every SKU.

## Three frames per SKU

| Shot | Plate | What it is |
|---|---|---|
| `ecom` | `ecom` | Cream plaster block. **Compulsory on every SKU.** |
| `worn` | by category | Rings → hand · Bracelets → wrist · Earrings → ear · Necklaces → neck |
| `angle` | `ecom` | Same set, deliberately different camera so no two frames repeat |

`angle` is specified per category as an explicit departure — overhead for
bracelets, low profile for rings, side-profile macro for earrings, pendant
macro for necklaces.

## Files

| File | What it holds |
|---|---|
| `skus.json` | 22 SKUs with public packshot URLs, built from `src/data/jewellery.ts` |
| `media.json` | Higgsfield `media_id` per SKU — IMAGE 1 in every call |
| `plates.json` | The five staging plates, with the `job_id` passed as IMAGE 2 |
| `prompt.ts` | The lock, the per-category staging, the prompt builder |
| `jobs.json` | 66 expanded frames — generated, not hand-edited |
| `results.json` | The delivered frames: 22 SKUs × 3, with their CDN URLs |
| `download.ts` | Pulls every frame in `results.json` down to a local folder |
| `angles.json` | One 12-angle contact grid per SKU, with its CDN URL |
| `split_angles.py` | Cuts each grid into twelve individual stills |
| `sizing.md` | The published size standard and the audit against it |

## Twelve angles for the price of one generation

The e-com set has a second mode. Asking Nano Banana Pro for a **3×4 grid of
twelve camera angles in a single 1:1 / 4K image** returns all twelve in one
generation — 4 credits, native 4096×4096, so each tile lands near
**1349×1011** and stands on its own as a PDP still.

That is 4 credits for twelve usable angles, against 24 credits if each were
generated separately at 2K. The product stays locked across all twelve
because they are rendered together in one pass; only the camera moves.

```sh
python3 scripts/higgsfield/split_angles.py --all        # 22 grids -> 264 stills
python3 scripts/higgsfield/split_angles.py grid.png out # one grid
```

Requires Pillow (`pip install pillow`). Output lands in `gilded-hour-angles/`
(gitignored), one folder per SKU, named `<handle>--angle-01.png` … `-12`.

At 2K the same grid costs 2 credits but each tile is only ~680×512 — fine as
a proof sheet, too small for a product page. 4K is the tier worth paying for.

## Known catalogue issue — the four earring SKUs

The packshots for the earrings are **rotated by one** against their names in
`src/data/jewellery.ts`:

| SKU | Name in the catalogue | What its packshot actually shows |
|---|---|---|
| NF-GH-E12-BHX | The Braided Hoop | a pearl stud in a braided gold rope surround |
| NF-GH-E13-PSX | The Pearl Stud | a pavé halo stud in white rhodium |
| NF-GH-E14-HSX | The Halo Stud | a pavé bow stud in gold |
| NF-GH-E15-BSX | The Bow Stud | a pair of braided gold hoops |

Each name's true product is sitting one slot away. The frames were rendered
**faithful to each SKU's own photograph**, not to its name — so every product
page stays internally consistent today, and the frames remain correct once the
image-to-name mapping is fixed. `results.json` flags the four with
`source_mismatch`.

Three of the four packshots are also on-model ear shots rather than clean
product-only photos, so the `ecom` frames for those SKUs are derived from a
worn photo. A proper packshot would tighten them further.

## Running it

```sh
bunx tsx scripts/higgsfield/build-manifest.ts   # src/data/jewellery.ts → skus.json
bunx tsx scripts/higgsfield/build-jobs.ts       # skus + plates → jobs.json (66 frames)
```

Then submit `jobs.json` in groups of 12 via Higgsfield `generate_image_batch`,
passing medias in this order:

```js
medias: [
  { role: "image", value: media[job.handle] },   // IMAGE 1 — the product
  { role: "image", value: job.plate_job_id },    // IMAGE 2 — the plate
]
```

Poll with `jobs_wait` in groups of 12; display a finished set with a single
`show_generation_by_ids` call.

## Changing the look

- **New background** — generate a fresh empty plate, add it to `plates.json`,
  re-run `build-jobs.ts`. Nothing else changes.
- **New SKU** — it lands in `src/data/jewellery.ts`, then re-run
  `build-manifest.ts`, import its packshot with `media_import_url`, add the
  `media_id` to `media.json`, re-run `build-jobs.ts`.
- **Plates must stay empty.** The body plates are generated bare — no
  jewellery on the hand, wrist, lobe or neck. A plate with jewellery already
  in it bleeds that jewellery into every SKU that composites onto it.

## Candidate backgrounds

`backgrounds.json` holds 12 alternative empty set plates (velvet bolster, sage
felt, silk, travertine, marble, terracotta, handmade paper and others) already
generated at 4:5 / 2K. Swap any of them in as the `ecom` plate to reshoot the
whole catalogue in a different world.
