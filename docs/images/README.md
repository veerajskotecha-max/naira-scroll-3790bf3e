# Image uniformity audit — 15 September 2026

`image-inventory.csv` — every image on every live product: dimensions, ratio,
whether it is the hero, whether it is under 800px.

## The shape is already uniform. The resolution is not.

**Shape.** All 54 jewellery grid tiles are 1:1 — the first image of every
jewellery product is square, so the listing grid does not jump. Each surface
also pins its own frame in CSS, so within a surface every tile is identical:

| Surface | Frame |
|---|---|
| `JewelCard` — the jewellery grid | `aspect-square` |
| `JewelDetail` mobile hero | `MOBILE_FRAME = "1/1"` |
| `JewelDetail` desktop gallery | `3/4` |
| `JewelleryCategories`, `RecentlyViewed` | `4/5` |
| `ProductCard`, `ProductGallery` (apparel) | `3/4` |

`MOBILE_FRAME = "1/1"` is deliberate and test-protected: a square hero keeps
the name and price above the fold on an iPhone 13, and 15 of 16 hero images
are already square. `JewelDetail.test.ts` fails if it changes. It was not
changed.

**Switching to `object-contain` was tried and is worse.** Rendered against a
real five-image gallery spanning 1:1, 3:4 and 4:5: every non-square image
gains pillarbox bars and the product shrinks. `object-cover` in a fixed
frame is the right call and is what the site already does.

**Resolution is the real inconsistency.** Hero images range from 640×640 to
2048×2048 — an eight-fold range in pixel area. Five heroes are 640×640 and
sit in the same scrolling grid as 2048×2048 ones, so they read visibly
softer.

| Longest edge | Images |
|---|---|
| under 800px | 18 |
| 800–1199 | 67 |
| 1200–1599 | 18 |
| 1600+ | 140 |

18 images across 13 products are under 800px. Five of them are heroes, which
is where it shows most:

Baguette Éclat Bracelet · Baroque Bloom Cuff · Blush Station Bracelet ·
Heartbead Bracelet · Pearl Point Studs — all 640×640 heroes.

**The Drive originals are not a better source.** `YF3952.jpg` in the YISS
FERA folder is 1000×1000 while Shopify already holds 1649×1649 for that
product — the live images were generated at higher resolution than the
supplier photos. Re-exporting from Drive would make things worse, not
better. The 18 low-resolution files have to be regenerated through the
image pipeline at the house size.

**House size.** The most common hero is 1649×1649 (17 products), then
1500×1500 (11) and 2048×2048 (7). 1600×1600 for heroes, and 1600×2000 for
the 4:5 catalogue/ad exports, covers every display size the site requests
(`JewelCard` asks for 500/800/1100w).
