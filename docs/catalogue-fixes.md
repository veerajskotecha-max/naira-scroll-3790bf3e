# Catalogue fixes — Shopify admin

Generated from the live Storefront API. These cannot be fixed from the
codebase: they are product records, and the site holds a read-only
Storefront token.

## 1. Renamed products still on their old handle

15 products where the title no longer matches the URL handle. The SEO
title tracks the *old* name too. The site builds its own titles from
`title` and never queries Shopify `seo`, so this is not currently visible
to shoppers — but the URLs are wrong and will read as mismatched in Search
Console and in any Shopify-native surface.

Changing a handle breaks the existing URL. Set up a redirect from the old
handle at the same time (Shopify admin > Navigation > URL Redirects).

| Title | Current handle | Shopify SEO title |
| --- | --- | --- |
| Gulaal mirage | `/11000` | — |
| Toggle Link Chain | `/ivory-clasp-chain` | Ivory Clasp Chain — Necklace | Naira Petite |
| Baguette Arc Hoops | `/clover-bloom-studs` | Clover Bloom Studs — Earrings | Naira Petite |
| Filigree Bloom Studs | `/clover-fringe-earrings` | Clover Fringe Earrings — Earrings | Naira Petite |
| Pearl Drop Studs | `/heart-whisper-studs` | Heart Whisper Studs — Earrings | Naira Petite |
| Brushed Gold Huggies | `/golden-nugget-studs` | Golden Nugget Studs — Earrings | Naira Petite |
| Pearl Link Bracelet | `/cuban-pearl-bracelet` | Cuban Pearl Bracelet — Bracelet | Naira Petite |
| Baroque Shell Bracelet | `/pearl-legacy-bracelet` | Pearl Legacy Bracelet — Bracelet | Naira Petite |
| Verdant Rivière Bracelet | `/emerald-riviere-bracelet` | Emerald Rivière Bracelet — Bracelet | Naira Petite |
| Blush Cluster Ring | `/blush-halo-ring` | Blush Halo Ring — Ring | Naira Petite |
| Rose Verdant Band | `/rose-emerald-band` | Rose Emerald Band — Ring | Naira Petite |
| Granule Dome Ring | `/amber-dome-ring` | Amber Dome Ring — Ring | Naira Petite |
| Verdant Eternity Band | `/emerald-eternity-band` | Emerald Eternity Band — Ring | Naira Petite |
| Verdant Circlet Studs | `/emerald-cluster-studs` | Emerald Cluster Studs — Ring | Naira Petite |
| Teardrop Lariat | `/pearl-ceremony-set` | Pearl Ceremony Set — Jewellery Set | Naira Petite |

Note: rows where the handle differs only by accent folding (Rivière →
riviere, Éclat → eclat, Pavé → pave) are correct and need no change.

Also worth checking: **Verdant Circlet Studs** has SEO category `Ring`,
but studs are earrings.

## 2. Missing productType and tags

18 of 70 products have an empty `productType` and no tags. All are
apparel; every jewellery SKU is typed correctly.

This does **not** break the footer or category links — those resolve from
`src/data/seoContent.ts` and filter local `src/data/jewellery.ts`, not
Shopify productType. It does mean these products are untyped for search,
collections and any future Shopify-driven filtering.

- `blush-of-dawn` — Blush of Dawn
- `ethereal-lilac` — Ethereal Lilac
- `royal-enigma` — Royal Enigma
- `amber-bloom-set` — Amber Bloom Set
- `amber-radiance` — Amber Radiance
- `golden-blossom` — Golden Blossom
- `midnight-bloom` — Midnight Bloom
- `ivory-whisper-co-ord-set` — Ivory Whisper Co-ord Set
- `sunset-reverie` — Sunset Reverie
- `lilac-whisper` — Lilac Whisper
- `crimson-legacy-set` — Crimson Legacy Set
- `heritage-mosaic` — Heritage Mosaic
- `noir-mela` — Noir Mela
- `tangerine-bloom` — Tangerine Bloom
- `11000` — Gulaal mirage
- `midnight-eclat` — Midnight Éclat
- `nocturne-veil` — Nocturne Veil
- `celeste-bloom` — Celeste Bloom

## 3. Inventory scope not granted

The Storefront token cannot read `quantityAvailable`:

> Access denied for quantityAvailable field. Required access:
> `unauthenticated_read_product_inventory` access scope.

Any genuine low-stock display needs that scope enabled on the Storefront
API access token (Shopify admin > Apps > Develop apps > Storefront API
access scopes). Until then the only honest signal available is the
boolean `availableForSale`, which the site already has.

## 4. Catalogue coverage gap

Shopify has 52 jewellery SKUs; `src/data/jewellery.ts` has 22. Category
pages render the local 22, so roughly 30 live SKUs are absent from
/jewellery/collections/*.
