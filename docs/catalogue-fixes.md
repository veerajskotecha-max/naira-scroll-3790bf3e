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

## 5. Baroque Shell Bracelet is showing a different bracelet

`/pearl-legacy-bracelet` — "Baroque Shell Bracelet", SKU YF3925. Five images,
two of which are not this product.

The real piece, per the packshot and the on-model shot, is baroque freshwater
pearls with small round gold spacer beads and a **T-bar toggle clasp**.

| Image | File | Verdict |
| --- | --- | --- |
| 1 | `YF3925_1_main.png` | Correct — toggle clasp, spacer beads |
| 2 | `YF3925_2_worn.png` | Correct — same piece, on model |
| 3 | `YF3925_3_alt.png` | **Wrong product.** Bolt-ring clasp and double-interlocking-ring gold links. Not this bracelet |
| 4 | `YF3925_4_alt.png` | **Wrong.** Has a dangling pearl charm on a long cable chain that this product does not have |
| 5 | `YF3925_5_alt.png` | Correct — toggle clasp, spacer beads |

Delete images 3 and 4 in Shopify admin. That leaves three accurate photos
(main, worn, alt), which is enough for the PDP gallery — it renders up to four
on desktop and all of them in the mobile carousel.

This cannot be fixed from the codebase: product media lives in Shopify and the
site holds a read-only Storefront token.

### Why an automated sweep will not find the rest of these

All five files carry the same `YF3925` prefix, so the supplier's own shoot
mixed two different bracelets under one SKU code. A filename or metadata check
cannot detect that — only looking at the images can.

A prefix scan across all 70 products found exactly one listing drawing on more
than one SKU prefix, and it is a different issue:

- `molten-bloom-hoops` mixes `hf` and `JDE0110042` prefixed files. The `hf`
  prefix indicates a Higgsfield-generated asset already in the catalogue.

So: 1 listing confirmed mixed by filename, 1 confirmed mixed by eye. The
remaining 68 have consistent prefixes but have **not** been visually verified,
and this defect class would not show up if present.

## 22 Oct 2026: 23 listings lead with their card photo in Shopify

The site's cards show a chosen product shot for every piece (`src/data/cardCovers.ts`
on main). For 23 listings that photo was not the listing's first photo in Shopify,
so Shopify and the Meta catalogue showed a different one. Each of those
photos was moved to the front in Shopify. Nothing else moved, except on the five
listings named below.

- **17 listings** now lead with the product shot in Shopify, so the Meta catalogue
  picks it up.
- **6 listings** keep their square catalogue crop first (it exists for the Meta
  feed and is hidden on the site). The product shot comes right after it:
  Marquise Layering Set, Baroque Pearl Lariat, Petite Pearl Chain, Ribbon Bow
  Earrings, Solitaire Whisper Studs, Triple Dawn Cuff.
- **Product pages on the site open on the same photo as before.** A product page
  opens on a listing's second photo (`wornFirst`).
  - On five listings the photo the page opened on was moved to second place in
    Shopify, so the page keeps opening on it: Charm Box Chain, Petite Pearl
    Chain, Prism Rivière Bracelet, Verdant Cushion Studs, Prism Cluster Studs
    (Silver).
  - On those five and on Bold Nocturne Chain, the product shot is now the page's
    second photo. The rest of each page's order is unchanged.
  - For 15 listings the product shot was already the page's opening photo. Those
    15 got a product-page pick (`COVER_PICKS` in `useLiveJewellery.ts`, commit
    3ff60be on main) so the page keeps opening on it.
  - That commit is published: the picks were in the live site's code by about
    five minutes after the reorder. In that gap, those 15 pages opened on the
    listing's previous first photo.

- **Dewdrop Pendant Necklace** went live after the card photos were chosen.
  Its first photo was the whole necklace laid flat, with the pendant a dot on a
  phone card. The pendant close-up was moved to the front in Shopify, and main
  got its card photo and product-page pick (commit cf88a2f). Its product page
  opened on the close-up before; once cf88a2f is published it does again (until
  then it opens on the laid-flat photo).
- The other 79 listings already led with their card photo. After the change,
  all 102 listings with a chosen card photo lead with it in Shopify, plus
  Dewdrop. On a phone check of all 103 live product pages, each opened on the
  same photo as before.

- Found while checking: the site fetched at most 12 photos per listing, which cut
  the gift box and size guide off Baguette Tennis Bracelet and Birthstone Heart
  Necklace (14 photos each). Fixed on main (commit d80ebeb, 20 photos); live after
  publishing.

Backup of the order before and after, by media id:
`docs/backups/media-order-2026-10-22.json`. To undo, run `productReorderMedia`
with the "before" order.

## 22 Oct 2026 (evening): last size guides with known sizes, and a full check

- **Size guides added** to Woven Gold Hoops (hoop 25 mm across), Pearl Drop
  Studs (30 mm drop, pearl to sphere) and Emerald Halo C-Hoops (22 mm tall).
  Each is drawn on the listing's own photo with a 10 mm scale bar, is the
  last photo, and also appears after the Details list in the description,
  like the other listings. Cards and the render spec are in
  `shopify/sizing/cards-2026-10-22/`. The descriptions before and after are
  in `shopify/sizing/backup/descriptions-size-image-2026-10-22.json`.
- **88 of 103 live listings now end with a size guide.** The other 15 state
  no size anywhere and need measuring: Heartline Paperclip, Pearl Legacy,
  Lumière Oval necklace and bracelet, Baroque Pearl Lariat, Heartbead, Tile
  Stone Bangle, Triple Dawn Cuff, Verdant Cushion Studs, Baguette Halo Drops,
  Petite Square Huggies, Pearl Circlet Studs, Petite Bow Studs, Prism Cluster
  Studs and Lilac Papillon Ring.
- **Checked, nothing to fix:**
  - No size guide is out of place.
  - The six photo pairs that look alike are colour versions, not duplicates.
  - All 103 descriptions are free of typos, garbled text, duplicated detail
    lines and gold/silver mix-ups.
  - Verdant Circlet (16.8 mm) and Verdant Drop (20 × 8 mm) were already
    corrected, and Golden Duet's card matches its US 6, 7 and 8.
- **Not touched:** drafts (Pearl Halo Studs and the rest), and the gold
  Verdant Cushion photos, which wait for the owner's word.
- **Verdant Cushion Studs:** the three gold shots (hero, close-up, on the ear) are back
  on the listing, as the owner chose. They sit after the five silver photos and
  before the gift box. The same Shopify files were reattached, not uploaded again.
- **Petite Square Huggies:** the copy now mentions the four tiny white pearls on
  each hoop, two on each side. They show in the supplier photo (KAVNAR E15284B1)
  and in our photos, but the copy left them out. The before and after are in
  `shopify/sizing/backup/descriptions-size-image-2026-10-22.json`.
- **Triple Dawn Cuff:** the copy says "three graduated bands joined as one cuff",
  but every photo shows one wide hammered band. There is no supplier record, so
  this waits for the owner.
- **New shots:** 29 were planned for the 27 listings with only 2–3 photos. Two
  were made and checked (Verdant Circlet on the ear, Pearl Drop Studs beside a
  cardamom pod) and wait for approval. The Higgsfield credits ran out before the
  rest: about 50 other Nano Banana Pro images were made on the account in the
  half hour before. The spec and prompts are in the session scratchpad
  (`shots/spec.py`).
  - The owner approved the Pearl Drop Studs pod shot. It is live as
    `pearl-drop-studs-scale.jpg`, after the close-up and before the gift box
    and size guide. The Verdant Circlet ear shot was skipped.
  - Triple Dawn Cuff stays as it is until the owner has checked the piece.

## 23 October — ring sizes and stock

The owner: Cushion Halo Ring and Star Point Band should show US 5, 6, 7 and 8
as available on the site and in Shopify. Cushion Halo adjusts to fit US 5–8,
so all 60 stay one adjustable ring. Star Point gets 2 pieces in each size. The
before state of both is in `docs/backups/ring-sizes-2026-10-23.json`.

- **Star Point Band (Shopify):** a Size option (5, 6, 7, 8) added to both
  metals, 2 pieces in each, 16 in all (it was Gold 10, Silver 9). The old Gold
  and Silver variants became US 6 and kept their IDs and SKUs (YF5214,
  YF5214-S); the new ones are YF5214-G-5/7/8 and YF5214-S-5/7/8 at ₹799
  (MRP ₹1,500). The copy now says "in US sizes 5 to 8" and lists
  "Sizes: US 5, 6, 7 and 8" instead of "confirmed at order".
  - Shopify ties the size order to the variant order, so with sizes listed
    5, 6, 7, 8 its first variant is US 5. The site now opens a sized ring on
    US 6 when US 6 can be bought (main 137eabd), as rings sold one way do.
- **Cushion Halo Ring (Shopify):** stock unchanged (60, one variant). The copy
  said "a fixed size of about 17mm inside, between US 6 and 7"; it now says
  "It adjusts to fit US 5 to 8" and "Size: Adjustable, fits US 5 to 8". The
  photos show a closed band, so nothing says open back.
  - The size guide (17 mm, about US 6½) was replaced in place by one with
    US 5–8 marked, "Adjustable · fits US 5 to 8"
    (`shopify/sizing/cards-2026-10-23/`). Same file and gallery position; the
    description links the new version (`?v=1792788054`) because the plain
    link stayed cached on the old image.
- **Site (main 137eabd):** Cushion Halo is adjustable with its own fit: US 5,
  6, 7 and 8, all "ships now", with "Adjustable — fits US 5 to 8 comfortably."
  The size guide says "This ring adjusts to fit US 5–8." Checked at phone
  width against live Shopify: both pages right, Halo Curve and Vintage Halo
  unchanged. Needs Publish → Update in Lovable.
- **Waiting on the owner:** the other rings' sizes and stock (see the
  question of 23 October).

## 24 October — every ring's sizes and stock, after the owner's answers

Asked on 23 October; the owner answered:

- **Adjustable rings fit US 5 to 8** (Rose Verdant, Granule Dome, Verdant
  Eternity, Halo Curve, Pavé Dome, Petite Pavé, Droplet Open, Cushion Halo).
  - The site offers US 5, 6, 7 and 8 on each, all "ships now", under
    "Open-back design — adjustable to fit US 5 to 8 comfortably." (main 2ef18f8).
  - Each description says it adjusts to fit US 5 to 8, replacing "US 6 to 8",
    "about US 7", "US 7" and "about US 6½".
- **Cushion Halo has a small gap between the band ends.** Its three product
  photos were edited (Nano Banana Pro, 2 credits each; two first tries had too
  wide a gap and were redone) to show a hairline split at the back.
  - Each was swapped in place, so filenames and gallery order are unchanged.
  - Its copy now says "a small opening at the back of the band".
- **Rings with no sizes in Shopify:** the owner said to keep the ones whose
  photos show an open band as adjustable. None of the six does (Chevron
  Whisper, Pearl Ribbon, Blush Cluster, Vintage Halo, Whisper Pavé, Lilac
  Papillon), so they are unchanged: US 6 in stock, US 5 and 7 as pre-orders.
- **Sold-out sizes stocked, 2 each:** Golden Duet US 7 and US 8, Roman Numeral
  Trio US 8.
- **US 5 added, 2 each, in every colour,** to Baguette Eternity (Ruby, Emerald,
  Amethyst), Tubogas Dome, Linked Pair, Crystal Baguette, Chain Drop Dome,
  Watch Link and Mesh Band.
  - SKUs follow the siblings (YF3143-RU-5, YF3608-G-5, YF2604-5 and so on),
    with the same price and each colour's own photo.
  - Sizes are listed 5, 6, 7, 8, and the site opens these pages on US 6.
  - Descriptions say "Sizes: US 5, 6, 7 and 8".
- **Size guides:** 14 re-rendered (`shopify/sizing/cards-2026-10-24/`) and
  swapped in place:
  - the adjustable rings show US 5–8 marked and "Open back · fits US 5 to 8";
  - five sized rings' captions say "US 5, 6, 7, 8";
  - Linked Pair's card had the old name "Linked Trio Ring".
  - Descriptions link the new versions (`?v=1792809375/6`) so the CDN does not
    serve the old images.
- Before-state of all 15 descriptions:
  `shopify/sizing/backup/descriptions-ring-sizes-2026-10-24.json`.
- Checked at phone width against live Shopify: Cushion Halo, Halo Curve,
  Star Point, Tubogas, Golden Duet, Roman Numeral and Vintage Halo all show
  the right sizes and lines.

### 24 October, later — which rings really adjust

- **Cushion Halo fits US 5 to 7.** The owner: the new 60 are adjustable,
  US 5 to 7, not 5 to 8. Its page offers 5, 6 and 7 (main f1eaf4f). Its copy
  says "adjusts to fit US 5 to 7", and its size guide marks US 5 to 7. Other
  open-back rings keep US 5 to 8.
- **Every ring checked against the supplier's photos** (KAVNAR sample and
  catalogue shots, the Drive folder), not only our own:
  - **Blush Cluster is open.** KAVNAR's sample (WR10914B2) has a clear gap
    between the cluster and the small stone, though our copy said "fixed size,
    between US 6 and 7". It is now adjustable on the site (US 5–8) and in its
    copy, and its size guide shows an open band.
  - **Closed bands, still sized:** Vintage Halo, Whisper Pavé, Pearl Ribbon and
    Chevron Whisper (supplier photos), and the ten rings sold in sizes, except
    Golden Duet.
  - **Golden Duet is an open toi-et-moi ring**, but it is sold in US 6, 7 and 8
    with stock in each. Making it adjustable would merge those sizes into one,
    so it waits for the owner.
  - **Lilac Papillon** has no supplier photo, and ours look closed. It waits for
    the owner.

### 25 October — the owner's answers on the last three rings

- **Golden Duet is one adjustable ring.**
  - Its US 7 and US 8 variants were deleted and the "Ring size" option removed.
  - The US 6 variant stays, keeping its ID and SKU (JDR0104342), with all 9
    pieces as one stock. That is 5 + 2 + 2; the 9 are physically base sizes
    6, 7 and 8. The size a shopper picks still rides on the order line, so
    packing can send the closest one.
  - Site: adjustable, US 5–8 (main 6b96954). The copy says "The open back
    adjusts to fit US 5 to 8", and the size guide shows an open band with
    US 5–8 marked.
  - Before-state: `docs/backups/golden-duet-variants-2026-10-24.json`.
- **Lilac Papillon:** closed, unchanged (owner).
- **Open-back rings:** stay at US 5–8 (owner). Only Cushion Halo is US 5–7.

## 25 October — About Us removed; the site leads with jewellery and custom outfits

The owner asked for the site to be about two things only, demi-fine jewellery
and custom-made outfits, with no apparel menu (main 0979370).

- **Header:** HOME · JEWELLERY · CUSTOM OUTFITS · GIFTING. SHOP is renamed
  JEWELLERY, and ABOUT and the duplicate CUSTOMISE are gone. The link gap is
  14px at 1024px, which leaves 24px between GIFTING and the wordmark (it was
  7px).
- **Mega-menu:** jewellery only. The "Customised" apparel column is gone.
- **Phone menu:**
  - Order: HOME, JEWELLERY, CUSTOM OUTFITS, THE EDITS, OCCASION, GIFTING,
    TRACK ORDER, CONTACT. Custom Outfits sits straight after the open
    Jewellery list, so it is visible without scrolling.
  - The Custom Apparel accordion and About are gone.
- **Footer:** the Shop column links Custom Outfits.
- **About page deleted,** along with its seven sections and three images
  nothing else used. `/about` and `/pages/about` redirect home and keep the
  query string, so old links and UTM tags still land.
- **Homepage:**
  - The story section ("From our Nashik studio") was rewritten. It introduces
    made-to-measure outfits and Naira Petite, and links to the jewellery and to
    custom outfits.
  - The Craftsmanship button now reads CUSTOM OUTFITS and links to `/customize`.
  - **This copy is new, so the owner should read it before publishing.**
- **Title, meta, llms.txt, sitemap:**
  - The title is "Naira Flore | Demi-Fine Jewellery & Custom Outfits".
  - `/about` is out of the sitemap.
  - llms.txt describes both offerings. It does not claim clothing is no longer
    sold, because those product pages are still live.
- **Untouched:**
  - Clothing product pages (`/product/:id`) still work for ads but are in no
    menu.
  - `/customize` itself is unchanged.
- **Checked:**
  - 423 tests pass. Types and lint are clean, and the production build passes.
  - In a browser at 390px, 1024px, 1120px, 1280px and 1440px: no sideways
    scroll and no page errors, and `/about?utm_source=test` lands on
    `/?utm_source=test`.
  - The only test that went away was the automatic per-page header check for
    the deleted About page.
- **Live after Publish → Update in Lovable.**
