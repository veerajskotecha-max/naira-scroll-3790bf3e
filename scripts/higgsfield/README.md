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
