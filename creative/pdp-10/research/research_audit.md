# Live PDP audit: /jewellery/prism-riviere-bracelet (origin/main @ bd412960, live site 13 Nov 2026)

**How I measured.** Code was read with `git show origin/main:` and nothing was checked out or changed. Live runs used Playwright `chromium.launch()` with no options (Chromium 153), and a context of 360x640, `isMobile`, `deviceScaleFactor` 1, `hasTouch`. There were five runs:
- **Run A:** the default user agent. `navigator.webdriver` stays true, and the page then skips the delivery date and the reel fetch.
- **Run B:** an Instagram Android user agent with `webdriver` hidden. This is the representative run.
- **Run C:** run B at DPR 3.
- **Run D:** run B with throttling, but analytics blocked through request interception. It is superseded by E because I am not sure the throttle applied to intercepted requests.
- **Run E:** run B with CDP throttling (150 ms RTT, 1.6 Mbps, CPU 4x) and analytics blocked through CDP URL blocking instead.

Meta pixel and CAPI, Clarity and shopper-performance requests were aborted in every run, so no events reached Meta or Clarity. One leak: Lovable's own `/__l5e/trackevents` beacon was not blocked in runs A and B (about 3 beacons each).

All runs went from a US data centre (Cloudflare edge IAD). No field data (CrUX) was used.

Artifacts are in `/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/pdp10/audit/`:
- Screenshots: `B-first-screen-3s.png`, `fomo-normal.png`, `B-scroll700.png`, `B-fullpage.png`, `C-first-screen-3s.png`
- Data: `A.json` to `E.json`, `sections-prism-closed.json`
- Scripts: `/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/pdp10/scripts/`

## Headline findings
- **The live PDP is `JewelDetailNext.tsx`, not `JewelDetail.tsx`.** CLAUDE.md's first-screen budget (rating, price, ladder, delivery + COD line all inside 640px) describes `JewelDetail.tsx`. `JewelDetailNext` does not import `PdpBuyFacts`. At 360x640 the ladder (697–753), the in-page Add to cart (761–811) and any delivery or COD line are not on the first screen. COD and delivery appear only inside the closed "Delivery & returns" fold.
- **Every proof signal except the offer is invented or authored:**
  - The rating is 4.9 from 50 or 51 reviews on every jewellery PDP.
  - "N pieces sold in the last 48 hours" is a hash of the handle (always 3–7).
  - FomoPopup uses a random name, city, minutes and product, and on a phone it covers the title.
  - The press strip has no links.
  - "SITEWIDE SALE LIVE TODAY!" runs every day.
- **The page text contradicts the linked returns policy.** It says "If it does not suit you, return it within 7 days". The policy allows returns only for manufacturing defects, excludes worn items, and refunds case by case.
- **There is a band of scroll with no usable buy button.** Between scrollY ≈670 and 811 the in-page buttons sit under the 111px fixed header while the sticky bar stays hidden.
- **Nothing on the page changes by ad.** UTMs and fbclid are captured for attribution only.

## 1. What renders /jewellery/:handle, in phone render order
Route: `src/App.tsx:139` `/jewellery/:handle` → `PieceRoute` (L74–77) → `JewelDetailNext` (lazy, `src/pageCode.ts:17`) → `src/pages/JewelDetailNext.tsx`. `JewelDetail.tsx` is kept but not routed.

The host serves a pre-rendered HTML file: 41.7 KB gzip, 185.6 KB raw, with the full page and a `#nf-piece` JSON block that the first render reads (L153–163). Live data then replaces it from the Shopify Storefront API (`nc5eti-gp.myshopify.com/api/2025-07/graphql.json`, 82 KB, via `useLiveJewellery`).

Document y positions below are from run B with folds closed. Document height is 3451px.

| # | Section | File:line | Shows | Data source |
|---|---|---|---|---|
| 0 | Fixed header, 0–111 | `Header.tsx`, `AnnouncementBar.tsx:27` | Marquee "BUY 2 GET 10% OFF · BUY 3 GET 20% OFF · BUY 4 GET 30% OFF ✦ SITEWIDE SALE LIVE TODAY! ✦ FREE INSURED SHIPPING ✦ MADE IN LIMITED BATCHES", then the navbar | Offer line from `promo.ts:73-77`; the other three lines are static strings |
| 1 | Phone gallery, y 107–467 | JDN L942–947, `MobileGallery` L748–809 | Back button, swipe photos (Prism: 7 photos + reel = "1 / 8"), wishlist heart, "▶ Video" badge, reel as the last slide | `piece.gallery` from Shopify, pre-render or snapshot; reel from Supabase `reels` via `useReels` after 1.2 s (L463–470) |
| 2 | Category + rating, y 487 | L957–971 | "BRACELETS ★ 4.9 51 reviews", which jumps to the reviews | `reviewWall.reviewSummary` (`src/data/reviewWall.ts:436-445`) |
| 3 | H1, y 519 | L973 | Product name | Shopify title |
| 4 | Price, y 553 | L978–989 | "₹2,399 ₹3,999 40% OFF incl. 3% GST" | Variant price and compareAtPrice (Shopify); `GST_LABEL` constant (`src/lib/gst.ts`) |
| 5 | Badges, y 586 | L992–1009 | Anti-tarnish · Skin-friendly · PVD rhodium coated · Zircone Stone | The first two are hard-coded; plating from `coatingOf` (`lib/jewelleryPresentation.ts:10-26`); stone from listing text (L7–8) |
| 6 | Sold line, y 653 | L1011–1022 | "5 PIECES SOLD IN THE LAST 48 HOURS" | `recentSoldCount(handle)` (`src/lib/dailySold.ts`) |
| 7 | Offer ladder, y 697 | L1027 → `components/jewellery/PdpOfferLadder.tsx` | "Applied in your bag · no code", then Buy 2 10% ₹2,159 each, Buy 3 20% ₹1,919 each, Buy 4 30% ₹1,679 each | `QUANTITY_OFFERS` (`promo.ts:73-77`), `pieceAtRung`, cart state |
| 8 | Variant options / ring size | L1032–1098 / L1102–1151 | Metal, stone or size pickers (none on Prism) | Shopify options; ring sizes for unsized rings are hard-coded (L123–127) |
| 9 | Actions, y 761 | L1163–1196 | Buy Now (with UPI marks) and Add to cart; "Gift-ready: every piece arrives in the Naira gift box" | `useCart` (`buyNow` goes to the Fastrr checkout) |
| 10 | Details fold, y 873 (closed) | L1203–1247 | Blurb, spec rows, size-guide image, styling tip | Shopify description, parsed |
| 11 | Care fold, y 924 | L1249–1263 | Care text plus two generated Q&As (L679–690) | Listing care plus template |
| 12 | Delivery & returns fold, y 975 | L1265–1294 | "Order today and it arrives by 18–20 Nov. Free insured shipping…", "Cash on delivery available. 7-day returns", pincode check, WhatsApp link | `deliveryRangeFromNow` (`lib/serviceability.ts:157`, today + 3–5 working days); pincode rules are local, with no courier API |
| 13 | Complete the set, y 1066 | L1301–1315 | 3 pieces with one-tap Add; "2 PIECES · 10% OFF" | `completeTheLook` (`lib/pairings`), `QUANTITY_OFFERS[0]` |
| 14 | Customer reviews, y 1364 | L1320–1322 → `components/CustomerReviews.tsx` | "4.9" with 5 stars always filled (L252), featured review, photo strip, filters, Write a Review | Bundled arrays plus Supabase `customer_reviews` where approved (returned `[]` for Prism) |
| 15 | "As featured in", y 1903 | L1324 → `components/jewellery/PressMarquee.tsx` | 5 logos in a marquee | Bundled image files |
| 16 | Reel shop, y 2064 | L1326–1328 → `components/reels/ReelShopNext.tsx` | "Seen on Naira · Shop the reel" with products and Add buttons | Supabase `reels` and `reel_products`; video through the `reel-media` signed URL |
| 17 | More bracelets, y 2859 | L1330–1343 | 8 cards | `moreLikeThis` over the live catalogue |
| 18 | Footer (compact slim), y 3191 | L1355 → `Footer.tsx:148-200` | Links and tagline. The slim variant drops the assurance grid, payment marks and the 3D box; its comment (L110–113) says those facts sit "beside Add to cart", but they do not | Static |
| Overlay | FomoPopup | L1345–1352 → `components/FomoPopup.tsx` | "Name, City · N min ago / bought the X" | Random (see §2) |
| Overlay | Sticky buy bar, z-40 | L1358–1390 | Wishlist, Buy Now, Add to cart | Shown whenever the in-page Add to cart is not fully on screen and the price and rungs are clear (L490–530) |
| Overlay | Lightbox | L1392 | | |

Global layers are also mounted from `App.tsx`: FilmGrain, ScrollBloom, the lazy CartDrawerNext, WishlistDrawer and PixelEvents.

## 2. Honesty audit of proof and urgency signals
| Signal | Verdict | Evidence |
|---|---|---|
| **★ 4.9 · 51 reviews** (PDP) and the review wall | **Invented / authored.** Not from orders or a review app | See the breakdown below this table |
| **"5 pieces sold in the last 48 hours"** | **Invented** | `src/lib/dailySold.ts` returns `(hash(handle) % 5) + 3`, so the figure is always 3–7 and never changes. Reproduced exactly on 7 live PDPs: Prism 5, Woven Gold Hoops 6, Cushion Halo Ring 3, Heartbead 3, Brushed Gold Huggies 5, Toggle Link Chain 3, Aquarelle 6. The repo's own comment calls it a "restrained 48-hour demand cue" |
| **FomoPopup** ("someone just bought") | **Invented** | `FomoPopup.tsx`: random name from 260 review-bank names plus generated first/last combinations (L101–109), random city from 24 (L13–38), random 1–24 min (L139), random product from a shuffled pool (L98–99). First shown 5 s after mount (live: 7.4 s after landing), visible 2.3 s, repeats about every 62 s (L55–57). Observed: "Varsha, Hyderabad · 2 min ago bought the Petite Pear Solitaire Necklace". At 360x640 with the sticky bar showing it sits at y 510–556, x 12–248, over the H1 (`fomo-normal.png`). The thumbnail uses the unresized Shopify original (L141, L181) |
| **"As featured in"** | **Unverified** | `PressMarquee.tsx`: The Times of India, Maharashtra Times, Lokmat, Times Now, Fashionista. Logo images only, with no link, date or article. No article URL exists anywhere on origin/main |
| **Stock messages** | **Mixed** | No "only N left" string exists anywhere. Variant buyable and pre-order states come from Shopify `availableForSale` (real). For rings Shopify does not sell in sizes, "US 6 is in stock and ships now" and "US 5/7 … pre-order, delivered in 45 days" are hard-coded (L123–127, L1141–1148), not inventory |
| **Timers** | None on the PDP | The delivery date is computed (today + 3–5 working days, `serviceability.ts:157-158`), not courier or pincode based, and is visible only in the closed fold |
| **"SITEWIDE SALE LIVE TODAY!"** | **Invented urgency** | Static string shown every day (`AnnouncementBar.tsx:27`; also in the bag, `CartDrawerNext.tsx:177`) |
| **"MADE IN LIMITED BATCHES"**, "Mumbai atelier" | **Unverified** | Static copy; no data in the repo supports it |
| **"40% off" / ₹3,999** | **Derived** | From Shopify `compareAtPrice`. Whether ₹3,999 was ever a selling price is unverified |
| **Buy 2/3/4 ladder** | **Real** | `promo.ts:73-77` (BUY2 10%, BUY3 20%, BUY4 30%); the per-piece prices are computed correctly |

**Review data, in detail:**
- **How the count is built.** `reviewSummary` (`reviewWall.ts:436-445`) counts four sources:
  - all 7 `realReviews`, the same 7 on every product and mostly about other pieces (blush cluster ring twice, heartbead bracelet, solitaire pendant…);
  - 4 or 5 entries from `productReviews.ts`, picked by a hash of the product name (L284–299; Prism gets bank entries 71–75);
  - 9 `jewelleryReviews`;
  - 30 `jewelleryOneLiners`.
- **Totals.** That gives 7 + 5 + 9 + 30 = 51 at 4.92. Every jewellery PDP shows 50 or 51 at 4.9; I checked 7 live pages.
- **The product bank.** It holds 260 entries but only 100 distinct texts; 104 entries are an earlier text plus "Highly recommend ." or "Very satisfied!!". 249 of 260 are flagged `verified: true`, and none is under 4★.
- **"Verified Buyer" is a hard-coded flag.** Approved shopper submissions are also mapped to `verified: true` with no order check (`CustomerReviews.tsx:107`).
- **Live submitted reviews.** The Supabase `customer_reviews` query for Prism returned `[]`.
- **Judge.me** exists only on the apparel `ProductDetail` and only when an environment variable is set; its own comment calls the bundled set "curated testimonials".
- **`realReviews`** are commented as "Genuine customer reviews with their own photographs" (`reviewWall.ts:140`). I did not verify them against orders.

Risk note from background knowledge, not checked in this session: India's CCPA dark-patterns guidelines (2023) list false urgency and false popularity.

## 3. Claims on the page (exact strings)
**Strings on the page:**
- **Badges** (`JewelDetailNext.tsx:993-998`):
  - "Anti-tarnish" and "Skin-friendly" are shown on every piece, unconditionally.
  - The plating badge comes from `coatingOf`, e.g. "PVD rhodium coated", "PVD 18K gold coated", "18K gold coated", "Gold & rhodium coated", "Coated finish".
  - "Zircone Stone" appears when the listing says zircone, zirconia, cubic zirconia or cz (`jewelleryPresentation.ts:7-8`).
- **Care answers** (L679–690):
  - "It is {finish}[ on surgical stainless steel][, waterproof and made not to tarnish | , made to resist tarnish], and the finish is covered by our 3-year plating assurance — cared for well, it keeps its colour for a lifetime."
  - "Every Naira piece is made to be skin-safe for everyday wear[, on a surgical stainless steel base]. If it does not suit you, return it within 7 days."
- **Delivery fold** (L1273–1277): "Free insured shipping across India, dispatched from our Mumbai atelier." and "Cash on delivery available. 7-day returns — read the policy."
- **Gift line** (L1189): "Gift-ready: every piece arrives in the Naira gift box".
- **Title and og:title** (L716): "{name} · Demi-Gold Jewellery".
- **JSON-LD `material`** (L701) is `piece.materials`, built by `useLiveJewellery.ts` `materialsOf` (L171–180), which always inserts "brilliant-cut zircone".

**Copy rewrites before display:**
- `jewelleryPresentation.ts:40-43` turns "gold-tone plated" into "gold coated", "rhodium-plated silver-tone" into "rhodium coated", and "silver-tone plated" into "silver coated".
- `useLiveJewellery.ts:119-160` turns "silver" and "sterling silver" into "rhodium coated", except copy that mentions 925.

**Mismatches I verified on the live site:**
- **"Demi-Gold" on non-gold pieces.** Prism Rivière is PVD rhodium on stainless steel and Verdant Drop Earrings are rhodium; both pages are titled "… · Demi-Gold Jewellery".
- **Stones claimed on stoneless pieces.** JSON-LD material says "brilliant-cut zircone" on Brushed Gold Huggies and Toggle Link Chain, whose listings mention no zircon or CZ.
- **"Skin-friendly" on copper alloy.** Verdant Drop Earrings' listing says "Body: Copper alloy", yet the page shows "Skin-friendly" and "Every Naira piece is made to be skin-safe". The page gives no nickel-free evidence. Prism carries a "Hypoallergenic" Shopify tag, which is unverified.
- **The returns promise conflicts with the policy.** "return it within 7 days" if it does not suit you, but `/exchange-return-policy` (`ExchangeReturnPolicy.tsx:18-50`) allows returns only for manufacturing defects (its examples are apparel: embroidery, stitching, fabric), excludes worn items, offers repair, replacement or store credit, and refunds case by case.
- **The assurance has no terms.** "3-year plating assurance" and "for a lifetime" are defined nowhere on the policy, FAQ or terms pages.
- **The COD fee is not on the PDP.** The page says "Free insured shipping" and "Cash on delivery available". Fastrr adds 5% to COD orders and books it as shipping (`src/lib/payment.ts:1-18`). That fee appears only in the bag, which was the owner's choice.

## 4. First screen at 360x640 (Prism, scroll 0, run B; runs A and C identical in layout)
| Element | y (CSS px) | On the first screen? |
|---|---|---|
| Fixed header | 0–111 (announcement 0–34, navbar 34–111) | yes |
| Hero image | 107–467 (**bottom 467**) | yes |
| Category + rating | 487–511 (tap target 477–521) | yes |
| **Title (H1)** | **519–543** | yes |
| **Price row** | **553–572** | yes |
| Badges | 586–643 | under the sticky bar |
| Sold line | 653–685 | no |
| **Offer ladder** | **697–753** | **no** |
| **Add to cart / Buy Now (in page)** | **761–811** (Add to cart on the right, x 184; Buy Now on the left) | **no** |
| Gift line | 823–840 | no |
| **Delivery / COD line** | **none outside the closed fold** (fold summary at y 975) | **no** |

- **The sticky bar shows from first paint** at y 575–640 (65px: wishlist, Buy Now with UPI marks, Add to cart). It covers the badge row and clears the price by 3px.
- **FomoPopup** appears at about 7.4 s at y 510–556 and covers the title.
- **Buy-button dead zone:** from scrollY ≈670 to 811 no buy button is usable (probe at 700, 750 and 800, see `B-scroll700.png`). The in-page buttons are under the 111px header, and the bar's check (L493–501) treats a button whose bottom is ≥0 as visible.
- **Hero crop:** the image is 3:4 portrait (896x1200 original) shown in a 1:1 frame with object-cover, so about 25% of its height is cropped.

## 5. Performance (Prism, live)
| Metric | Unthrottled, DPR 1 (runs A/B) | Unthrottled, DPR 3 (run C) | Lab-throttled, DPR 1 (run E) |
|---|---|---|---|
| TTFB | 575–607 ms | 718 ms | 271 ms* |
| FCP (H1 text) | 1.09–1.13 s | 1.20 s | 1.22 s |
| **LCP** (hero image) | **1.10–1.14 s** | **1.22 s** | **2.07 s** |
| CLS | 0 | 0 | 0 |
| DOMContentLoaded / load | 1.8 / 2.7 s | 1.7 / 2.7 s | 2.9 / 4.4 s |
| Requests at t≈3 s (after full scroll) | 87 (91), incl. 5 CORS preflights | 87 (91) | 76 (87) |
| Transferred at load | **1.00 MB** | **1.30 MB** | 0.92 MB |
| JS | **352 KB in 30 files** | 352 KB | 354 KB |
| Images | **379 KB in 38** | **672 KB in 38** | 289 KB in 27 |
| Fonts / CSS / HTML / fetch | 112 / 30 / 42 / 89 KB (82 KB is the Shopify catalogue) | same | same |

\*CDP emulation applied unevenly to the document request, so treat run E as indicative.

- **Largest JS:** `index` 99 KB, `supabase` 59 KB, `vendor` 59 KB, `JewelDetailNext` 24 KB, `CustomerReviews` 16 KB, `query` 15 KB, Lovable `events.js` 12 KB.
- **Third-party scripts I blocked**, which real visitors load after idle or their first interaction (`index.html` L157–176):
  - `fbevents.js` 98.7 KB plus the pixel config 139.4 KB;
  - `clarity.js` 25.4 KB plus the tag 0.7 KB;
  - together about **264 KB more**, measured with curl download only.
- **Hero size:**
  - The image is `prism-riviere-bracelet-1.jpg`, an 896x1200 original, displayed at **360x360 CSS**.
  - At DPR 1 the browser fetches `width=480`, which comes back as **480x643** WebP, 53 KB.
  - At DPR 3 it fetches `width=1200`, but Shopify returns at most **896x1200** WebP, 138 KB. That is under the 1080 device pixels needed, and the 1200w and 1400w srcset candidates can never be met.
  - The hero `<img>` is in the pre-rendered HTML with `fetchpriority="high"` (no `<link rel=preload>`).
- **Below-the-fold images:** 37 of the 38 images load at scroll 0, about 326 KB at DPR 1. They include reel covers (about 20–25 KB each), review photos, press logos, and pairing and "More" thumbnails.
- **Reel video:** the reel MP4 (signed Supabase URL) starts when the reel section nears view. It completed at **3.44 MB** in one run; in the other runs it was still streaming when the run ended.

## 6. Ad landing parameters
- **fbclid** is written straight to the `_fbc` cookie in `index.html` L118–135. Verified: `fb.1.<ts>.AUDITTEST123`.
- **utm_\*** values from the first landing are kept in sessionStorage as `naira_landing_utm` (`src/lib/landingUtm.ts`; verified).
  - They are handed to checkout through `CartContext.tsx:544` `withSessionUtm` and `fastrr.ts:229` `sessionUtmParams`.
  - They also become Clarity tags (`lib/clarity.ts:113-146`).
- **`/products/<handle>?…`** rewrites to `/jewellery/<handle>` with the query kept. Verified with `?utm_content=dpa&fbclid=…&variant=…`.
- **`?variant=<id>` and `?colour=`** pick which variant and photo the page opens on (JDN L393–416). This is the only parameter that changes content.
- **Nothing on the PDP changes by ad.** I compared the plain URL, the same URL with `?utm_campaign=…&utm_content=prism_reel_v2&fbclid=…`, and the catalogue `/products/` link. The H1, the hero and the full visible text were identical across all three.
  - There is no message match: no ad-specific hero frame, headline, offer callout, proof or section order.
  - The gallery's reel slide is whichever reel the piece appears in, not the ad's creative.
