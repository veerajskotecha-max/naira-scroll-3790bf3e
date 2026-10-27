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

## 25 October — PVD coating in every steel piece's Details

The owner asked for this in the product page's Details dropdown: PVD 18K gold
coating on the gold pieces, PVD coating on the white pieces, a very short
note on how PVD differs from regular plating, and anti-tarnish.

- **Shopify: 94 listings changed (84 live, 10 drafts), nothing else.**
  These are every listing with a Plating line and a stainless steel
  Material line. Each was checked afterwards against the intended text,
  character for character.
  - **Plating line:**
    - Gold pieces: "PVD 18K gold coating, anti-tarnish".
    - White pieces: "PVD rhodium coating, anti-tarnish".
    - Pieces sold in both metals: "PVD 18K gold or PVD rhodium coating
      (choose above), anti-tarnish".
    - Duo Link and Roman Numeral Trio name each of their metals.
    - Rose Verdant Band: "PVD rose gold coating".
    - Heartbead Bracelet: "Polished steel strand with a PVD 18K gold coated
      clasp and charm". Its strand is bare polished steel, so it is not
      called coated.
  - **New line, after Material:** "PVD vs plating: Regular plating is a
    soft layer that wears off over time. PVD is bonded to the metal in a
    vacuum, so it is far harder, stands up to sweat and keeps its colour
    much longer."
  - **Blurbs and other lines:** where they named the method, they now say
    "PVD … coated". For example, "rhodium plated over surgical stainless
    steel" became "PVD rhodium coated over surgical stainless steel".
  - **Tooling and backups:**
    - Script: `shopify/pvd/make_pvd_copy.py`.
    - Before: `docs/backups/descriptions-before-pvd-2026-10-25.jsonl`.
    - After: `docs/backups/descriptions-after-pvd-2026-10-25.jsonl`.
  - **Method:** the Shopify connector refuses bulk mutations, so the
    updates went out as ten batches of `productUpdate`.
- **Held for the owner: 54 listings (33 live, 21 drafts).**
  - Which ones:
    - 41 have only a "Finish: … gold tone" line.
    - 13 have a Plating line but name no base metal.
  - Why: their care says "keep it dry" where the steel pieces say
    "waterproof", and Verdant Drop is copper alloy with 925 posts. They may
    not be PVD on steel.
  - The live ones:
    - **Earrings:** Verdant Drop Earrings, Bold Dome Huggies, Quatrefoil
      Éclat Studs, Verdant Cushion Studs, Baguette Halo Drops, Torsade
      Huggies, Petite Square Huggies, Pearl Circlet Studs, Petite Bow
      Studs, Rivière Hoops — Silver, Prism Cluster Studs, Aqua Heart Drops,
      Pearl Nugget Hoops, Emerald Halo C-Hoops, Emerald Deco Hoops, Clover
      Drop Earrings, Twin Heart Studs, Molten Wave Ear Cuff.
    - **Bracelets and bangles:** Torsade Pearl Cuff, Molten Panel Bracelet,
      Garnet Cable Cuff, Tile Stone Bangle, Clover Chain Bracelet, Petite
      Blossom Bracelet.
    - **Necklaces:** Birthstone Heart Necklace, Clover Drop Pendant
      Necklace, Twin Heart Necklace, Bow Pear Drop Necklace, Pearl Heart
      Layered Necklace.
    - **Rings:** Lilac Papillon Ring, Asscher Solitaire Ring, Lumière Oval
      Solitaire Ring, Pavé Zigzag Ring.
- **Site (main fe06bb1, live after Publish → Update):**
  - **Finish label:** the trust strip and the Care answer name PVD when the
    listing does, e.g. "It is PVD 18K gold coated on surgical stainless
    steel, waterproof and made not to tarnish …".
  - **The 21 pieces bundled in `jewellery.ts`:** once live data loads, their
    Details now come from Shopify, like the other 96. Their bundled copy had
    gone stale; Cushion Halo still said "US 7, fixed size, not adjustable".
    The bundled text is also refreshed from Shopify for first paint.
  - **Summary line:** it claims steel and waterproofing only when the
    listing does. Verdant Drop's Care answer had said "18k gold coated on
    surgical stainless steel, waterproof". It now says "rhodium coated,
    made to resist tarnish".
  - **Snapshot:** regenerated with 117 live pieces. Sixteen newer pieces
    now draw without the loading skeleton.
  - **Checks:**
    - 424 tests pass, types are clean, and the build passes.
    - On a phone: Rivière Eternal, Cushion Halo, Kiss Knot, Heartbead,
      Verdant Drop and Clover Drop read correctly. No sideways scroll, no
      page errors.

### 25 October, later — the owner: "Yes, all are PVD"

- **53 more listings changed (33 live, 20 drafts).** The script ran with
  `--held` (`shopify/pvd/make_pvd_copy.py`).
  - **Pieces with a Finish line:** a Plating line was added after it.
    - "Polished gold tone" and "Gold tone" became PVD 18K gold.
    - "Bright silver tone" and "Rhodium silver tone" became PVD rhodium.
    - The Garnet Cable Cuff is two-tone.
  - **Verdant Drop:** PVD rhodium, placed after its copper alloy Body line.
    Its care text still says to keep it dry.
  - **Four older drafts** ("The making."): the line now reads "PVD 18K gold
    coated 316L stainless steel, anti-tarnish".
  - **Two one-line stubs** that name yellow gold got a Details block.
  - **Every one of them** got the "PVD vs plating" line.
- **Not changed:** Deco Ribbon Hoops (draft). Its one-line stub names no
  metal.
- **Result:** 147 of 148 listings carry the PVD lines. A final export
  matched all 147 character for character. After-state:
  `docs/backups/descriptions-after-pvd-2026-10-25.jsonl`.
- **Status:** Clover Station Bracelet went from draft to live at 18:44 UTC
  (`publishedAt`). That was not from these updates: they set only the
  description, and the other 29 drafts stayed drafts.
- **Site (main 5286bc3):** the snapshot was regenerated with 118 live
  pieces. Every piece's summary line now reads PVD.
- **"Cell":** the owner meant selling points. The PVD line already covers
  them: far harder, stands up to sweat, keeps its colour much longer.

## 25 October — homepage: big NAIRA logo behind New Arrivals removed

- The owner asked for the large sage NAIRA logo to come out of the New
  Arrivals background. It showed through between the product names on
  phones.
- Removed in `HeroScrollyWrapper` (main 812fb37). The floral pattern stays.
  `naira-logo.webp` is kept because the checkout redirect page still uses
  it.
- Checked on a phone and at 1440px: no sideways scroll, no page errors.
  The only logo left on the homepage is the small one in the footer.
- Live after Publish → Update in Lovable.

## 25 October — bag: sale line touching the offer bar

- **The problem.** At the top of the bag, the line "✦ Sitewide sale live
  today · up to 20% off" sat 8px above the offer bar. The bar's 24px rung
  boxes stand 10.5px above it, so they ran 1.7px into the letters. This
  happened on every phone measured: 280, 320, 360, 375, 390, 412 and 430px
  wide, plus a 390×664 in-app browser.
- **The fix** (main 31de012; live after Publish → Update):
  - The line keeps 20px clear: 10.3px to the rung tops, matching the 9.5px
    below.
  - The band loses 4px of top padding, so it grows by only 8px.
  - On a 280px fold cover screen the line wraps onto two balanced lines.
- **Checked:** with one piece and with three, there is no other overlap and
  nothing spills sideways at any of those widths. The check
  (`shopify/harness/bag-phones.mjs`) ignores what the scrolling list hides
  under the footer.
- **Screenshots:** `docs/images/bag-2026-10-25/`.
- **Asked the owner, not changed:** the "Buy 2 get 10% off" and "Buy 3 get
  20% off" labels sit under the left and right halves of the bar, not under
  their own boxes. So "Buy 3" sits under the 2-piece box.

## 25 October — buy 2 = 15% off, buy 3 = 25% off (was 10% and 20%)

- **Shopify (live now):**
  - `BUY2` is 15% on 2 or more items; `BUY3` is 25% on 3 or more.
  - Only the percentage and title changed. The `discount-scope-all`
    scope, the minimum quantities, the combining rules and ACTIVE status
    are as before.
  - Before and after, with ids: `docs/backups/buy-more-codes-2026-10-25.json`.
- **Fastrr (live now, no code change needed):** the bag hands Fastrr the code
  `BUY2` or `BUY3`, and Fastrr takes the rate from Shopify. Checked on the
  real checkout (no phone number entered, no order placed, ad trackers
  blocked):
  - 2 pieces (₹3,598): ₹3,058.30, "BUY2 Saved ₹539.7" — 15%.
  - 3 pieces (₹4,897): ₹3,672.75, "BUY3 Saved ₹1224.25" — 25%.
- **Site (main b6bf686; live after Publish → Update in Lovable):**
  - The rates in `promo.ts` changed. The bag's ladder, savings line,
    add-on "Adds ₹… · saves ₹…", and the product page's "Buy 2, save …"
    all follow from them.
  - Two lines were hard-coded and now read the rates too:
    - the bag's "Sitewide sale live today · up to 25% off";
    - the product page's "Complete the look · 2 pieces · 15% off".
  - The new bag matches Fastrr to the rupee: ₹3,058 and ₹3,673.
  - Tests (426 passing), comments and CLAUDE.md are on the new rates.
- **Until it is published:** the live bag still says 10%/20% (₹3,238 and
  ₹3,918 for those bags) while Fastrr charges 15%/25%. Shoppers pay less
  than the bag shows, never more.
- **Other codes, unchanged:**
  - `NAIRA10` (10%) is now below both rungs. A 2-piece bag gets BUY2 instead.
  - `FRIENDSANDFAMILY` (20%) beats the 2-piece rung but not the 3-piece one.
- **Layout:** checked on 8 phone sizes from 280 to 430px with 1, 2 and
  3 pieces: same spacing as before, no overlaps, nothing off the edge.
- **Screenshots:** `docs/images/offer-2026-10-25/`; `bag-vs-fastrr.png` sets
  the bag beside the checkout.
- **Checks:**
  - `shopify/harness/fastrr-live-discount.mjs <site> <out> <pieces>` opens
    the real checkout and records its discount.
  - `shopify/harness/pdp-offer-label.mjs` reads the product page's offer
    text.

## 25 October — why the bag fix never went live: Lovable had split from main

- **What the owner saw:** a screenshot of the bag with the 2-piece box
  touching "UP TO 20% OFF", after asking for the fix twice.
- **The cause:** after 18:53 (812fb37) Lovable stopped taking commits from
  GitHub `main`.
  - Its own edits that evening went to `lovable-sync-1792961346` and
    `lovable-sync-1792962545` instead of `main`. They were a sitemap
    refresh at 20:48 and, at 21:08, its own bag fix: `mt-4` on the track.
  - Lovable's docs call this "Lovable and GitHub have diverged".
  - Publish deploys Lovable's copy. So the live site never received the bag
    spacing fix (31de012, 20:19) or buy 2 = 15% / buy 3 = 25% (b6bf686).
- **The screenshot was older still:** text-to-bar is 12px in it, the layout
  from before Lovable's 21:08 edit. It was most likely an old tab.
- **What is live (checked 23:15):**
  - Lovable's 21:08 build: 6.3px clear and no collision, but it still says
    20% / 10%.
  - The 18:53 homepage-logo change and the morning's About Us removal are
    live too.
- **The fix (main 18e4993):** merged `lovable-sync-1792962545` into `main`
  with a merge commit, as Lovable's docs say; Lovable then pulls `main`.
  - Taken from Lovable: the sitemap with the newly live product pages, and
    its regenerated `supabase/functions/mcp/index.ts`.
  - Left out: Lovable's `mt-4`, because with main's fix it would double the
    gap.
  - Tests (426) and the build pass.
  - CLAUDE.md on main (833febc) now says how to spot and fix this.
- **For the owner:**
  - In Lovable, Project settings → Git should no longer say "diverged".
    Click Re-check if it does.
  - If it offers "A repository push replaced your Lovable work", choose
    "Keep repository version": that work is already merged.
  - Then Publish → Update and reopen the site in a fresh tab.
- **Measured at iPhone widths** (393, 402, 430 and 440px):
  - live now: 6.3px clear;
  - after publishing: 10.3px clear.
  - Close-ups are in `docs/images/offer-2026-10-25/bag-band-three-builds.png`;
    the check is `shopify/harness/bag-band-iphones.mjs`.
- **Older sync branches** (`lovable-sync`, 21 Oct; `lovable-sync-1792906336`,
  05:31 today, a first About Us attempt) were superseded and left alone.

## 25 October — GPay / PhonePe / Paytm badge on the buy buttons

- **Asked:** the badge Shiprocket's own "Buy It Now" shows: three
  overlapping white discs with dark rims holding Google's four-colour G,
  PhonePe's purple disc and Paytm's navy and sky wordmark. The owner wanted
  it on our Buy Now, in the apps' own colours, the same on every phone. The
  old bag (`CartDrawer.tsx`) had a version of it.
- **Built (main 9e8a44a; live after Publish → Update):**
  - New `src/components/checkout/UpiBadges.tsx`.
  - It is on the product page's Buy Now (main button and the phone sticky
    bar) and on the bag's Checkout.
  - It hides while a button reads "Opening checkout…".
  - Catalogue links (`/products/<handle>`) redirect to that product page,
    so ads land on the badge too.
- **Drawn as shapes, not text:**
  - The G is from `assets/google-pay-mark.svg`; PhonePe and Paytm are the
    Simple Icons marks in brand colours, Paytm's split into "pay" and "tm".
  - The old bag spelt PhonePe's "पे" in the phone's own Devanagari font.
- **Two theme traps, both covered by `UpiBadges.test.tsx`:**
  - The theme sets every radius, `full` included, to 0px, so the discs use
    `rounded-[50%]`. The old bag's "round" badges were drawn square.
  - The shared Button forces every svg inside it to 16px
    (`[&_svg]:size-4`), so the marks are sized inline.
- **Checked on ten phone sizes** (280, 320, 360, 375, 390, 390×664 in-app,
  393, 412, 430 and 440px):
  - The badge fits inside every button and is centred on the label to
    within 0.6px.
  - On a 280px fold cover screen the sticky bar's Buy Now is 97px wide, so
    the badge sits under the label there.
  - Screenshots: `docs/images/upi-badge-2026-10-25/`; the check is
    `shopify/harness/upi-badge-phones.mjs`.

## 26 October — every adjustable ring fits US 5 to 9

- **Asked:** some adjustable rings showed only pre-order on the site; every
  adjustable ring fits US 5 to 9; stock to show properly on the site and in
  Shopify.
- **Why three showed pre-order:** the site decided "adjustable" from a list of
  handles kept in the code. Asscher Solitaire, Lumière Oval Solitaire and Pavé
  Zigzag were tagged Adjustable in Shopify but missing from it, so their pages
  sold US 6 with US 5 and 7 as pre-orders.
- **Site (main 4426bfd; live after Publish → Update):**
  - Shopify's "Adjustable" tag now decides, so a new adjustable listing needs
    no code change. The list stays only so first paint agrees.
  - Every adjustable ring offers US 5, 6, 7, 8 and 9, all ready to ship.
  - The rings collection, its FAQ and the search copy say US 5 to 9.
- **Shopify, all 14 adjustable rings:**
  - Tagged Adjustable; copy says the open back adjusts to fit US 5 to 9.
  - Size guides re-rendered with US 5–9 marked
    (`shopify/sizing/cards-2026-10-26/render8.mjs`). The four Aditya rings
    had none in their gallery; theirs went in as the last photo.
  - Stock unchanged, one stock per ring; the size picked rides on the order
    line: Cushion Halo 60, Verdant Eternity 60, Halo Curve 45, Droplet Open
    20 (10 Gold, 10 Silver), Golden Duet 9, Granule Dome 4, Pavé Dome 4,
    Petite Pavé 4, Pavé Zigzag 4, Blush Cluster 3, Asscher Solitaire 3,
    Lumière Oval Solitaire 3, Rose Verdant 1, and Cushion Solitaire 5 (draft).
  - Cushion Halo was US 5 to 7; it is now 5 to 9 like the rest.
  - Checked by export: all 14 exact. Before-state:
    `docs/backups/adjustable-rings-before-us5to9-2026-10-26.jsonl`.
- **For the owner:**
  - Drafts Duet of Dawn, Trio Bloom and Pearl Crossover may be open rings.
    Confirm before they go live.
  - Closed rings with one stock show US 6 in stock and US 5 and 7 as
    pre-orders. The size guides for Chevron Whisper and Pearl Ribbon said
    US 7 (17.3 mm inside), and Whisper Pavé's 17 mm (about US 6½).
- **The owner, 26 Oct: those three are US 6; other sizes on pre-order.**
  - New size guides at 16.5 mm with US 6 marked: "US 6 · 16.5 mm inside ·
    US 5 and 7 on pre-order" (`render10.mjs`). Each replaced the old file
    in place, so it stays the last photo. Vintage Halo, already US 6, got
    the same card.
  - Descriptions: "Made in US size 6, about 16.5mm inside", and the Details
    line "Size: US 6, inner diameter approximately 16.5mm. US 5 and 7 on
    pre-order" on all four.
  - All eight changes went out in one call and read back as written.
    Before-state: `docs/backups/closed-rings-before-us6-2026-10-26.json`.
  - Site (main 7fa32e5): the bundled copy of Chevron Whisper and Pearl
    Ribbon and the snapshot match. The page already sold US 6 in stock with
    US 5 and 7 on pre-order.

## 26 October — size guides for the listings that had none

- **Found:** 30 live listings had no size guide in their photos.
- **Done, nine listings, each with its guide as the last photo:**
  - **Prism Rivière Bracelet:** 18 cm, fits wrists 15 to 19 cm (the owner).
    - The card in Files said 15.5–16.5 cm and was never attached. It was
      replaced in place and attached.
    - Details gained "Fit: Wrists of 15 to 19cm". Its Details image link now
      carries the new version.
  - **Bougainvillea Vine Bracelet, Clover Drop Earrings, Twin Heart Studs,
    Molten Wave Ear Cuff:** right cards already in Files and in the Details,
    never added as a photo. Now attached.
  - **New cards** for Rivière Hoops — Silver, Clover Drop Pendant Necklace,
    Bow Pear Drop Necklace and Twin Heart Necklace:
    - the listing's own photo with its listed sizes marked and a 10 mm bar;
    - every figure as in the listing's Details;
    - attached last, and added to the Details.
    - Files: `shopify/sizing/cards-2026-10-26/` (`bspec.py`,
      `specs-b.json`, `render-b.mjs`).
  - Checked by export: each has exactly one size guide, and it is last; the
    five edited descriptions match exactly.
  - Before-state: `docs/backups/size-charts-before-2026-10-26.json`.
- **Pieces published later today (11:40 to 12:41 UTC):**
  - Sorbet Rivière Bracelet (17 cm, fits about 14.5–15.5 cm) and Prism Pear
    Drop Hoops (21 mm long, 8.5 mm huggie): right cards already in Files and
    in the Details; now attached as the last photo.
  - Prism Pear Drop Necklace: new card, pendant 12 mm long, stones 3.5 mm
    (`specs-ppd.json`, `render-ppd.mjs`); attached last and added to the
    Details.
  - Cushion Solitaire Ring already had its guide.
- **Checked by export at 13:40:** 102 of the 124 live jewellery listings end
  on their size guide; none is out of place and none has two.
- **Not attached: Molten Panel Bangle.** Its card in Files shows a 17 cm
  flexible bracelet. The listing now says it is a rigid bangle and gives no
  length.
- **Waiting on the owner's measurements (22):**
  - **Necklaces** (chain length, plus extender if any): Heartline Paperclip,
    Pearl Legacy, Baroque Pearl Lariat, Lumière Oval, Pearl Heart Layered
    (both strands).
  - **Bracelets** (length, or inside width for a cuff or bangle): Clover
    Chain, Clover Station, Heartbead, Lumière Oval, Marquise Coil Cuff,
    Molten Panel Bangle, Open Heart Layered, Tile Stone Bangle, Triple Dawn
    Cuff, Watch Link Bangle.
  - **Earrings** (height and width): Baguette Halo Drops, Pearl Circlet
    Studs, Petite Bow Studs, Petite Square Huggies, Prism Cluster Studs,
    Verdant Cushion Studs.
  - **Ring:** Lilac Papillon (inside diameter or US size). The supplier sheet
    has no size for it.

## 26 October — links to new listings opened on the homepage first

- **Asked:** a newly listed piece's link used to show the homepage before
  the piece. Make sure it is fixed for every product and for future
  listings.
- **Today:** all 119 live jewellery listings have their own pre-built page
  on nairaflore.com (checked one by one). So no current link shows the
  homepage first; the gap is a piece listed between two Publishes.
- **Why it happened:** a Publish pre-builds a page for each piece live at
  that moment. A later piece has no page, so the host sends `index.html`,
  which is the pre-built homepage. The app replaces it only once its code
  has loaded and started.
- **Fix (main 1ab4651; live after Publish → Update):**
  - `index.html` now opens with a small script and style
    (`src/lib/fallbackGuard.ts`, added by `scripts/prerender.ts`). On any
    address but the homepage it hides the homepage and draws the product
    page's outline until the app's first render (`App.tsx` takes it off).
    It removes itself after 10 s whatever happens.
  - When the build does not know a piece, the product page asks Shopify for
    that one piece instead of waiting for the whole catalogue. A handle
    Shopify does not have goes straight to the shop.
  - A `/products/<handle>` link (catalogue ads) fetches the product page's
    code at once, so the hop to `/jewellery/<handle>` does not wait for it.
  - Nothing to do per listing. A Publish still pre-builds a new piece's
    page, which stays the fastest way in.
- **Measured:** a local build of each version, served the way the live host
  serves it, with Watch Link standing in for a new listing. iPhone 13 on 4G
  with a 4× slower CPU; median of 3 cold loads each.

  | Link | Before | After |
  |---|---|---|
  | `/jewellery/<new piece>` | homepage 1.1–2.0 s; piece at 3.01 s | outline from first paint (0.7 s); piece at 3.05 s |
  | `/products/<new piece>` (catalogue ad) | homepage 1.1–1.8 s; piece at 3.50 s | outline; piece at 2.76 s |
  | `/jewellery/<no such piece>` | homepage 1.2–2.1 s; shop at 4.40 s | outline; shop at 3.53 s |
  | A pre-built piece, and the homepage | unchanged | unchanged |

  - On the slow phone the direct link takes about as long as before: the
    wait is the app's start-up and one Shopify round trip. What changed is
    that the homepage no longer shows.
  - On a fast connection with no throttling the direct link drew the piece
    at 0.87 s instead of 1.70 s, and the catalogue-ad link at 1.00 s
    instead of 1.63 s. There the whole catalogue had been the wait.
  - Frames: `docs/images/new-listing-2026-10-26/before-after-phone4g.jpg`.
    Tools: `shopify/harness/new-listing-serve.mjs`,
    `new-listing-timing.mjs` and `new-listing-sheet.py`.
- **Checks:** 452 unit tests pass (20 new for the guard), the type check is
  clean, and the build pre-renders every route. The one lint error and one
  warning in `JewelDetailNext.tsx` were there before.
- **Seen live, 13:00:** five pieces published between 11:40 and 12:41
  (Cushion Solitaire Ring, Open Heart Layered Bracelet, Prism Pear Drop
  Hoops and Necklace, Sorbet Rivière Bracelet) got the homepage from
  nairaflore.com. The live site was then at 9e8a44a, without this fix.
- **First-paint data (main 5ca6a90):** snapshot, handle list, sitemap and
  `llms.txt` regenerated from Shopify: 124 live pieces. Seven came in (the
  five above, Bougainvillea Vine Bracelet and Watch Link Bangle). Petite
  Blossom Bracelet, now a draft, went out. The adjustable rings' first
  paint carries the Adjustable tag and the US 5 to 9 copy.
- **For the owner:** Lovable → Publish → Update. That pre-builds pages for
  the new pieces and puts the fix live for every piece listed after it.

## 26 October — Twin Heart photos, and matching pieces that point to each other

- **Twin Heart Studs:** the owner chose the earlier on-model photo, where the
  larger heart reads clearly (25 Oct 12:12). It is back in second place. The
  later one (14:34) is off the listing but still in Files.
- **Twin Heart Necklace:** the owner said the pendant should look bigger on
  the model.
  - On the listed photo, measured against the lips and the neck, it was about
    8 to 9 mm, as the listing's 8.5 mm says.
  - The chain links in the other photos point to a larger piece, but those
    photos look AI-made, so the true size is the owner's to confirm.
  - The pendant alone was enlarged 1.5 times (about 13 mm) in the same photo,
    scaled about the point where the two chain strands meet, so the chain
    still runs into both hearts. No AI; Higgsfield had 1.32 credits, less than
    one 2-credit image.
  - The on-model photo had come off the listing at 18:41, before this change
    (the studs, changed by the same batch, read 18:49). It is back in second
    place.
  - Files: `shopify/photos/twin-heart-2026-10-26/`.
  - Open: the listing and size guide still say 8.5 mm. If the real pendant is
    larger, both need the owner's measurement.
- **Matching links (main 3322567):** pieces made as a pair or a family only
  shared a motif, so other pieces took first place on their pages.
  - Twin Heart Studs offered the Birthstone Heart Necklace, and the necklace
    offered the hoops. Now each offers the other first.
  - Clover Drop Pendant Necklace led with Molten Bloom Hoops. All four clover
    pages now show "Complete the set" with clovers.
  - Watch Link Bangle and Watch Link Ring now point to each other first.
  - The four Carré bracelets, published this evening, listed the Heartbead
    Bracelet before their own other colours. Now the other colours come
    first, and Carré counts as a tennis bracelet.
  - Bougainvillea Vine Bracelet joins the flower motif.
  - Four tests cover this (456 then, 458 after the merge below).
  - No built-in piece points to a listing that is not live.
- **First-paint data (main 78edc0a):** 128 live pieces, with the Twin Heart
  photos as above.
- **Lovable pushed straight to main this evening** ("Added exchange note to
  cart", 8 commits). It was merged with a merge commit, with no conflicts;
  all 458 tests pass. Main is at 304df25.
- **Twin Heart Studs, redone (19:47):** the owner said the stud in the
  restored photo was still small.
  - Measured in it: her fingernail is about 55 px wide (about 11 mm) and the
    stud 40 px.
  - Two Higgsfield tries asked for 1.5 times came out about 2.5 fingernails
    wide, with the small heart in front. A redraw of a hand-sized version
    still grew the stud, to 93 and 109 px.
  - So the first redraw's stud, right in design (heart-cut stones in gold
    claws, the big heart in front), was shrunk to 62 px, about one
    fingernail, and set on the listed photo. 8 credits.
  - The on-model photo had again come off the listing (18:57), so it was
    re-attached in second place.
  - Site first paint follows (main b259346).
  - Files: `shopify/photos/twin-heart-2026-10-26/`.
- **Photos coming off listings this evening (not from this session):**
  - Twin Heart Necklace on-model photo at 18:41, Twin Heart Studs on-model at
    18:57 and again at 19:50, three minutes after it was attached, and Cushion
    Solitaire Ring's plaster-block photo at 18:27.
  - Cushion Solitaire's first two photos were also replaced around 12:44.
  - Another Claude session was active then ("Naira feed curation and content
    strategy").
  - The studs' on-model photo was re-attached in second place at 20:02 at the
    owner's request. Cushion Solitaire's is left off until the owner says.

## 27 Oct 2026: links, colours, catalogue ads, product page weight

- **Shop All showed three pieces twice in gold.** Droplet Open Cuff, Tubogas
  Dome Ring and Star Point Band.
  - Cause: Shopify gives a variant with no photo of its own the listing's
    first photo, so their silver cards wore the gold one. Star Point had its
    own photo on US 6 only, so Silver US 5, 7 and 8 fell back to gold too.
  - Shopify (one approval): each colour's variants now carry that colour's
    photo.
    - Droplet: Gold on `_1_main`, Silver on `_3_silver`.
    - Star Point: Gold 5, 7, 8 on the gold plaster shot, Silver 5, 7, 8 on
      the silver one.
    - Tubogas: Gold 5–8 on the on-hand photo, which the catalogue ads
      already showed, so gold ads are unchanged. Silver 5–8 on the silver
      plaster photo.
  - Tubogas silver photo (`46458295517346`) re-attached third, before the
    gift box and size guide. It and the gold plaster photo were taken off the
    listing at 06:58 this morning, when the ring went live (not this session).
    The gold plaster photo is still off.
  - Before: no variant media on Droplet or Tubogas; Star Point only on Gold 6
    and Silver 6.
  - Live data now gives 160 cards with no photo twice. The site reads Shopify
    live, so this was fixed on nairaflore.com at once.
  - Site (main 37a664b): a colour's photo is one only its own variants carry,
    else a gallery file named for it, else the shared photo for the first
    colour only. A colour with none gets no card of its own. A snapshot test
    fails if any colour of any piece has no photo of its own.
- **Recommendation links:** every Complete the look and More like this link
  on all 135 pieces checked against live data.
  - None link to a piece that is not live, to the page itself, or to the same
    piece twice. Every piece has both rows.
  - No category of a set's pieces is missing from its row.
  - Fixed: a suggestion card showing a silver piece opened its page on gold.
    It now opens on the colour it shows.
- **Catalogue ad links:** the Meta catalogue sends each colour and size to
  `nairaflore.com/products/<handle>?utm_…&variant=<id>`, and the site ignored
  `variant`, so a silver ad opened on gold.
  - The page now opens on the ad's colour, its photo first. The size stays at
    the page's default (US 6), since the ad does not show a size.
  - Checked on the build: every one of the 135 pieces has its own page at
    both `/products/` and `/jewellery/` (270/270 addresses). All 8 ad cases
    open right.
  - Eight pieces that went live after the last publish (Tubogas, Midnight
    Rivière, Aquarelle, Emerald Carré, Lumière Solitaire Bracelet, Solitaire
    Drop Huggies, Lotus Pear Drop Studs, Watch Link Strap) currently get the
    homepage file until the next publish. Shoppers still land on the product
    (26 Oct fix), but a link preview shows the homepage. The build makes a
    page for every live piece, so Publish fixes it.
- **Product page weight (phone, 4G, 4x slower CPU):** phones downloaded
  photos two to four of the desktop-only grid, about 300 KB on Prism Rivière.
  - Chromium fetched them despite `loading="lazy"`.
  - They now come from a `<picture>` source only a desktop-width screen
    picks. Desktop and tablet still show all four (checked).
  - Photos before scrolling on Prism: 674 KB → 400 KB. Whole page in the
    first 8 s: about 1.47 MB → 1.1–1.2 MB.
  - Tubogas silver ad: largest paint 2.1–2.4 s → 0.8 s.
  - No layout shift.
- **Measured, not changed (owner to decide):**
  - The bag opens only after two Shopify cart calls: 1.5–3 s from the tap
    here through the container's proxy, likely about 1–1.5 s on a real phone.
    Opening it at the tap would make it instant.
  - The 3D flower in the header logo loads three.js (130 KB) about 6 s
    after landing, on every page. It adds about 0.3 s of main-thread work
    on a mid-range phone and a little scroll jank.
  - Checkout tap: answers in about 0.1 s, hands off to Shiprocket in
    0.4–0.95 s.
- **Meta catalogue diagnostics:**
  - 38 items out of stock.
  - 97 with fewer than two images.
  - 6 events without a product ID.
  - None of these are about links.
- **Another session or the owner was editing the store this morning:**
  Midnight Rivière went live at 08:16, and the Clover pieces, Aquarelle and
  Watch Link Strap were edited 08:11–08:15.
- Scripts: `shopify/harness/links-2026-10-27/`.
