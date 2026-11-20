# Listing frames — one per SKU, one size per category

22 September 2026. All **55 ACTIVE** jewellery SKUs. Nothing on Shopify, nothing committed
beyond this record. The frames themselves live in the standing proof sheet, not in this repo.

## What this pass was for

The frames read inconsistently in the grid: rings ran from 0.398 to 0.916 of their tile and
earrings from 0.407 to 0.846, so the same category appeared at twice the size from one tile to
the next. Four necklaces also showed the wrong piece.

## The two corrections, and what they are not

Both act on the whole frame. Neither cuts the piece out, moves any part of it relative to
another, or retouches it.

1. **Ground.** A per-channel piecewise-linear curve through `(0,0)`, `(measured background →
   #FBF3EC)` and `(255,255)`. Monotonic, so blacks stay black and speculars stay white while the
   background lands exactly on the page ivory. Where a frame carried a slow gradient, a plane is
   fitted to the background and subtracted **from the background only**, faded out as the piece
   is approached.
2. **Size.** The whole frame is resampled by a single factor so the piece's greatest extent hits
   the category target, then re-centred on its own bounding box. Padding replicates the edge, so
   the flat ground extends seamlessly. Uniform scale — never a stretch.

`scripts/higgsfield/` does not carry the code; it lives in the working scratchpad as
`measure.py` (the shared ruler), `normalise.py` (the two corrections) and `book.py` (the PDF).

## One ruler, used twice

Measuring the target and checking the result with two different estimators produced a 0.06
disagreement on necklaces that was entirely the instruments, not the frames. The fix was a single
routine used by both: fit a plane to the ground, threshold the residual, and keep only connected
components big enough to be jewellery so a speck of background noise cannot stretch the box.

## The targets

Each sits within a few points of that category's own median, so most frames barely moved, and the
order across categories follows real millimetres rather than taste.

| Category | Real size, laid flat | Was (min–max) | Target | Measured now | n | Published source |
|---|---|---|---|---|---|---|
| Necklace | 45cm chain in a loop = 143mm | 0.717 – 0.909 | **0.80** | 0.788 – 0.801 | 13 | `seoLandings.extra.ts:562` |
| Jewellery Set | longest member, ~143mm | 0.787 – 0.787 | **0.78** | 0.783 – 0.783 | 1 | as necklace |
| Bracelet | 20cm in a loop = 64mm | 0.585 – 0.879 | **0.66** | 0.659 – 0.660 | 12 | `seoContent.ts:150` |
| Earrings | a pair; hoops 20–25mm each | 0.407 – 0.846 | **0.60** | 0.600 – 0.602 | 15 | `seoLandings.extra.ts:331` |
| Ring | US 7 = 17.2mm inner Ø | 0.381 – 0.915 | **0.54** | 0.539 – 0.541 | 13 | `seoContent.ts:64` |

Every ground now passes flat (spread ≤6/255) and on-colour (within 6/255 of #FBF3EC).

## The four frames that needed real enlargement

Enlargement costs a little crispness, so these are flagged on their own pages in the book:

- **Pearl Drop Studs** — 1.47×
- **Halo Curve Ring** — 1.42×
- **Textured Gold Hoops** — 1.40×
- **Chevron Whisper Ring** — 1.35×

## The nine SKUs re-shot this pass

| # | SKU | What was wrong |
|---|---|---|
| 1 | Baroque Pearl Lariat | both pearls missing; plinth and cast shadow |
| 3 | Charm Box Chain | a claw-set solitaire where the piece carries a pavé barrel and a plain gold roller threaded on the chain |
| 5 | Dewdrop Bezel Necklace | no fold-over bail above the bezel; chain read as beads, not a box chain |
| 6 | Heartline Paperclip Necklace | heart stations oversized and crowded |
| 7 | Lumière Oval Necklace | macro reference bleed — about 25 large ovals where the live piece has roughly 150 small ones |
| 8 | Marquise Layering Set | the two chains nearly the same length; stones claw-set instead of bezel-set |
| 27 | Blush Cluster Ring | a uniform pavé dome where the live piece is one claw-set centre stone in a twelve-stone halo |
| 31 | Halo Curve Ring | both stone colours wrong — the live ring has an opaque brown tiger's-eye and a pale champagne, on an open bypass band |
| — | (plus verified re-checks on the rest) | |

## The ninth failure mode — asking the model to make something bigger

Three frames that were merely too small came back **duplicated** when re-briefed larger: Pearl Drop
Studs returned four earrings, Textured Gold Hoops four hoops, Chevron Whisper Ring two rings. The
model reads "fill more of the frame" as "put more things in it".

**Do not fight the model for size.** Size is a placement decision: set it geometrically in post,
where it is exact and free. The three frames were reverted to their earlier, correct versions by
calling `jobs_wait` on the old job ids to recover their CDN urls.

## The tenth failure mode — a shape that does not fit the frame

The Baroque Pearl Lariat is a chain loop plus a long drop. Four separate re-shoots — hanging,
flat-lay, with an explicit margin block, and with the frame described as a nine-square grid — all
cropped the chain at the top edge. A piece that already runs off an edge **cannot be scaled down**:
the cut moves inside the picture and the chain stops in mid-air.

The normaliser now detects this and exempts such a frame from rescaling rather than breaking it.
That one SKU is flagged for a decision instead of being quietly fudged.

## Still open

- **Ground colour.** These frames are built for `#FBF3EC` — `--nf-ivory`, the colour the jewellery
  page paints behind each tile (`src/index.css:311`). The shop-all grid paints no tile colour at
  all and measures `#FAFAFA`, 16/255 cooler. Keep the warm ivory, or re-ground the set?
- **Baroque Pearl Lariat.** Accept the crop, as the product page's own hero image does, or treat
  that SKU differently?
- **A separate site bug, untouched:** `fetchShopifyProducts(50)` in `src/pages/ShopAll.tsx:215`
  caps the query, so the shop-all grid renders only 32 of the 55 jewellery SKUs — all 13 rings are
  absent from that page.
