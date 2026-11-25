# Code map: product page (PDP) and bag, for the "cleaner PDP + cart" job

Source read: `/tmp/pdp-base` = origin/main `e161ace0`. Measured on the dev server `http://127.0.0.1:5310` on 20 Nov 2026 at 360x640 (Instagram in-app), 390x844 and 1440x900, DPR 1. Nothing was added, bought or checked out; the bag was seeded in `localStorage["naira-shopify-cart"]` and Shopify's `query Cart` was answered locally (0 mutations sent). Supabase was blocked, so the reel shop and live-submitted reviews are described from code, not seen.
Screenshots and raw numbers: `/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/codemap/` (`pdp-*-fold.png`, `pdp-*-full.png`, `bag-*.png`, `title-faces.png`, `measure-pdp.json`, `measure-bag.json`).

Short names: PDP = `src/pages/JewelDetailNext.tsx` (1,404 lines). BAG = `src/components/CartDrawerNext.tsx` (623 lines). Line numbers are for those two files unless a path is given.

## 0. Ten things to know first

1. The title is `<h1 class="mt-2 font-cormorant text-[22px] font-semibold leading-[1.1] text-nf-ink md:text-[26px] lg:text-[30px]">` (PDP 973). `font-cormorant` is **Velista** (`tailwind.config.ts:20`), and Velista draws lowercase letters as capitals: measured `text-transform: none`, yet the page shows "WOVEN GOLD HOOPS". Mixed case needs another face, not a CSS switch.
2. The gold spaced-caps eyebrow in the owner's screenshot already exists: PDP 958, Jost 9.5px / 400 / 0.24em caps / `#80612A`. It shares its row with the rating (right). In the screenshot both lines look centred; today both are left-aligned.
3. Four faces are on the PDP today: Velista (`font-cormorant`), Jost (`font-nf-label`), Cormorant Garamond (`font-nf-editorial`), and the **system sans** for every text with no font class (Tailwind's default `ui-sans-serif, system-ui`): 39 of 85 text runs in the info column. The bag is all Jost except "Your bag" (Cormorant Garamond).
4. A product name in clean mixed-case sans already ships in the bag: BAG 507 (Jost 500, 13.5px) and BAG 114 (Jost 400, 12.5px). See section 4.
5. `src/pages/JewelDetailNext.test.ts` reads the PDP **source text**. Order of blocks, several exact strings, the count of `<details className="group` (3) and of `clipText(` (3) are pinned. See section 6 before moving anything.
6. "N pieces sold in the last 48 hours" is **invented**: a hash of the product handle, 3 to 7, the same number for that product on every visit. See 1.6.
7. FomoPopup ("Name, City · 5 min ago / bought the X") is **invented**: random name, random city, random minutes, a random piece. See 1.17.
8. Reviews: 4.9 with 50 or 51 on every one of the 11 pieces measured. The list is bundled in the code; 4 or 5 of them are dealt to each product by a hash of its name. See 1.13.
9. The live bag does **not** render `cart/CartExtras`, `cart/LadderBand`, `cart/OfferProgress`, any `giftbox/*` or `checkout/CheckoutBenefit`. It renders only what is inside `CartDrawerNext.tsx` plus `cart/BagTrust` (which uses `cart/PayMarks`) and `checkout/UpiBadges`. There is no gift box, promo field or upsell row in the bag with pieces in it.
10. No `trackPixel` call sits in the PDP file or the bag file; they are in hooks and contexts (never-edit). A restyle keeps tracking intact as long as the handlers and their arguments are untouched. See section 5.

## 1. PDP top to bottom (`src/pages/JewelDetailNext.tsx`)

### 1.0 File layout

| Lines | What |
|---|---|
| 1-46 | imports |
| 73-76 | lazy chunks: `CustomerReviews`, `ReelShopNext`, `GalleryReel`, `FomoPopup` |
| 80-84 | `MOBILE_FRAME = "1/1"`, `BLANK_PIXEL`, `PRICE_VALID_UNTIL`, `inr` |
| 89-98 | `platingBadge` (identity), `Ingot` icon (inline svg) |
| 101-121 | `tidy`, `CARE_BREAK`, `specsOf` (listing lines to label/value; splits the care text out of the last spec) |
| 123-130 | `ringSizes` (5 pre-order, 6 available, 7 pre-order), `ringSizesFor` |
| 132-151 | `JewelDetailSkeleton` (noindex, title "Loading piece") |
| 154-163 | `readEmbeddedPiece` (reads `<script id="nf-piece">`) |
| 166-170 | shared class strings: `label`, `fold`, `foldMark` |
| 174-190 | `SWATCHES` (14 raw hex, pictures of metals and stones, deliberate) |
| 204-274 | `PairingCard` (used by Complete the look and More like this) |
| 276-577 | component: data, state, effects (palette 339-343, back 350-360, variant link 393-428, sticky-bar effect 490-530, gallery images 532-567) |
| 579-690 | derived values and handlers (`soldOut` 583, `soldCount` 586, `shown` 592-600, `isPreorder` 609, `cartItem` 632-644, `handleAddToCart` 649, `handleBuyNow` 655, `handlePreOrder` 667, `handleWishlist` 671, care answers 678-690) |
| 692-717 | canonical, JSON-LD object, title, og image |
| 748-809 | `MobileGallery` |
| 811-876 | `DesktopGallery` |
| 878-1401 | JSX (table below) |

### 1.1 Blocks in page order (y = page pixels on Woven Gold Hoops)

| # | Block | Lines | Key classes / facts | y at 360x640 | y at 390x844 | y at 1440x900 |
|---|---|---|---|---|---|---|
| a | Announcement bar (global, `AnnouncementBar.tsx`) | in `Header.tsx` | bg `#AEBDB6` inline, white `font-sans` 500, 0.18em caps; 10px on the PDP (`.nf-next` rule in index.css) | 0-34 | 0-34 | 0-40 |
| b | Navbar (global) | `Navbar.tsx` | bg `#F4F1ED` inline (not the ivory token); 77 / 86 / 96px high | 34-111 | 34-111 | 40-136 |
| c | Desktop breadcrumb + Back | 924-939 | `hidden md:flex`, 11px, ink/70 | none | none | shown |
| d | Phone gallery | 942-947, 748-809 | `pt-[107px] md:hidden`; square; snap scroll; back button 44px at left, heart 44px at right, counter "1 / 7" bottom-left, "▶ Video" bottom-right when a reel exists | 107-467 | 107-497 | hidden |
| e | Desktop gallery | 953, 811-876 | `hidden md:block lg:sticky lg:top-[140px] lg:h-[calc(100vh-156px)]`; 2x2 grid of the first 4 photos, 4px gap, "+N photos" tag, heart top-right | hidden | hidden | left half |
| f | Info column | 955 | `px-4 pt-5 md:pt-6 lg:px-10 lg:pt-2 xl:px-12`; 328 / 358 / 580px wide | | | |
| g | Eyebrow + rating | 957-971 | eyebrow = `label` class; rating link `min-h-[44px]`, "★ 4.9 50 reviews", 11.5px system sans | 492-506 | 522-536 | 177-192 |
| h | Title `<h1>` | 973-975 | Velista 22px/600 (30px/600 from lg), line-height 1.1 | 519-543 | 549-573 | 205-238 |
| i | Price row `#product-price` | 978-989 | price Velista 19px/600 (22px md); MRP 12px ink/65 struck; "40% OFF" Jost 10.5px/500 caps gold-text; "incl. 3% GST" 10.5px ink/65 | 553-572 | 583-602 | 248-270 |
| j | Badges `ul[aria-label="Made to last"]` | 992-1009 | see 1.5 | 586-643 (2 rows) | 616-642 (1 row) | 284-310 |
| k | Sold line | 1011-1022 | see 1.6 | 653-685 | 652-684 | 320-352 |
| l | Offer ladder | 1027 | see 1.7; 56px high | 697-753 | 696-752 | 364-420 |
| m | Variant pickers | 1032-1098 | see 1.8 | per product | | |
| n | Fixed ring-size list | 1102-1151 | see 1.8 | per product | | |
| o | Stock note under pickers | 1153-1159 | 11.5px ink/75 | | | |
| p | Size guide modal | 1160 | `RingSizeGuideModal` | | | |
| q | Buttons `#product-actions` | 1163-1196 | see 1.9 | 761-811 | 760-810 | 428-478 |
| r | Gift line | 1187-1190 | see 1.10 | 823-840 | 822-839 | 490-507 |
| s | Fold-downs | 1202-1295 | see 1.11; three rows of 50px | 873-1025 | 872-1024 | 540-692 |
| t | Complete the look | 1301-1315 | see 1.12 | 1066 | 1065 | 733 |
| u | Reviews | 1320-1322 | see 1.13 | | | |
| v | Press | 1324 | see 1.14 | | | |
| w | Reel shop | 1326-1328 | see 1.15; phone only | | | none |
| x | More like this | 1330-1343 | see 1.16 | 2636 | 2674 | 1853 |
| y | FomoPopup | 1345-1352 | see 1.17 | | | |
| z | Footer | 1355 | `<Footer compact slim />`, the only page using `slim` | | | |
| - | Sticky buy bar | 1358-1390 | see 1.18; phone only | on | off | none |
| - | Lightbox | 1392-1399 | `ui/image-lightbox` (shared), z-70 | | | |

First screen, measured: at **360x640** the shopper sees photo, eyebrow + rating, title, price, then the 65px sticky bar (top edge 575, 3px under the price). Badges, sold line, ladder and the in-page buttons are below the fold. At **390x844** everything down to the gift line fits (ends 839, 5px spare) and the sticky bar is hidden. Page height: 3,188 / 3,239 / 2,938px.

### 1.2 Gallery details

| Fact | Where |
|---|---|
| Both galleries are always in the DOM; CSS shows one (`md:hidden` / `hidden md:block`) | 942-953 |
| Photos: `piece.gallery` or `[piece.image]`; a picked variant's photo moves to the front (`leadImage`) and the phone gallery scrolls back to it | 532-545 |
| Phone slide: `<button>` with `aspectRatio: "1/1"`, `cursor-zoom-in`, opens the lightbox | 756-778 |
| Reel slide (last) only when `reelForPiece` finds one; list asked for 1.2 s after load, never under `navigator.webdriver` | 463-470, 780-790 |
| Counter follows the swipe by rAF on scroll | 549-567 |
| Hero image attributes (LCP): see section 5.7 | 765-776, 833-844 |

### 1.3 Eyebrow and rating

`<p className={label}>{piece.category}</p>`; `label = "font-nf-label text-[9.5px] uppercase tracking-nf-24 text-nf-gold-text"` (166). The same `label` string is reused for the picker labels (1040, 1105). Rating (959-970) only renders with a count; click scrolls to `#customer-reviews` without a history step (`toReviews`, 443-446). `rating` comes from `reviewSummary(pieceName, "jewellery")` in `src/data/reviewWall.ts:436`, or from the embedded piece before that chunk loads.

### 1.4 Price row

`shown` = the chosen variant's price and MRP, else the piece's (592-600). MRP and "% off" only when `saving > 0` (602, 980-987). `discountPercent` from `components/jewellery/JewelPriceTag.tsx` (shared with listing cards). `GST_LABEL` = "3% GST" (`src/lib/gst.ts`).

### 1.5 The badges (992-1009)

Not a component: an inline array mapped to `<li>`.

| Badge | Icon | Words come from | Varies by product? |
|---|---|---|---|
| "Anti-tarnish" | lucide `Sparkles` 11px | string literal, 994 | No, every piece |
| "Skin-friendly" | lucide `Leaf` 11px | string literal, 995 | No, every piece |
| plating, e.g. "PVD 18K gold coated" | `Ingot` (inline svg, 92-98) | `coatingOf(piece)`, `src/lib/jewelleryPresentation.ts:10-27`: the listing's "Plating:" line, else the description, else `piece.materials` | Yes. Seen: "PVD 18K gold coated", "PVD rhodium coated", "PVD gold & rhodium coated". Code can also give "18K gold coated", "Gold coated", "Rhodium coated", "Silver coated", "Gold & rhodium coated", "PVD 18K gold & steel", "PVD coated", "Coated finish" |
| "Zircone Stone" | lucide `Gem` 11px | `hasZirconeStone(piece)`, same file :7-8 (listing text mentions zircone / zirconia / CZ) | Yes, only on stone pieces (5 of the 11 measured) |

Chip classes (1001): `inline-flex items-center gap-1 border border-nf-gold/30 bg-nf-ivory-deep/70 py-[3px] pl-[3px] pr-2 text-[10px] leading-none text-nf-ink/80 min-[375px]:text-[10.5px]`; icon tile (1003): `h-[18px] w-[18px] bg-nf-blush/35 text-nf-gold-text`. Measured: 26px high, system sans 10.5px, gap 5px. Row height 26px with three short badges at 390; **57px (two rows)** at 360 on both pieces measured (three badges already wrap there), and at 390 with four badges or the long "gold & rhodium" label (8 of the 10 pieces measured at 390).

### 1.6 "N pieces sold in the last 48 hours" (1011-1022)

`const soldCount = recentSoldCount(piece.handle);` (586). The whole source, `src/lib/dailySold.ts`:

```ts
/** Stable per-piece figure for the PDP's restrained 48-hour demand cue. */
export const recentSoldCount = (productKey: string) => {
  let hash = 0;
  for (const character of productKey) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return (hash % 5) + 3;
};
```

**Invented, not real.** It reads no orders. It is a number from 3 to 7 fixed by the handle's letters (Woven Gold Hoops is always 6, Prism Rivière always 5). It is drawn on every piece, sold-out pieces included (Molten Bloom Hoops, sold out, says 4). `CLAUDE.md` already lists the same trick in `JewelTrustStrip.tsx` as known debt.
Look: full-width band 32px, `border-y border-nf-gold/30 bg-nf-ivory-deep/70`, a 10px gold four-point star, the count in Velista italic 15px gold-text, the words Jost 10.5px / 300 / 0.08em caps, and a trailing 1x8px gold tick (1021). `JewelDetailNext.test.ts` pins the string "pieces sold in the last 48 hours" as an anchor (line 80 of the test).

### 1.7 Offer ladder (`src/components/jewellery/PdpOfferLadder.tsx`, 166 lines; PDP only)

Rendered once: `{!soldOut && <PdpOfferLadder price={shown.price} preorder={sizePreorder || variantSoldOut} />}` (1027, pinned verbatim by a test).
`QUANTITY_OFFERS` (`src/lib/promo.ts:73-77`): `BUY2` 2 pieces 10%, `BUY3` 3 pieces 20%, `BUY4` 4 pieces 30%. Three rungs. Several comments in promo.ts, PDP 1297-1300 and CLAUDE.md still say "two rungs"; the code and the page say three.

| State | What shows |
|---|---|
| Empty bag | legend on the top rule "APPLIED IN YOUR BAG · NO CODE"; three columns "BUY 2 10% off / ₹944 each" etc. (`pieceAtRung`); no status line, nothing to tap |
| Bag has pieces | same, plus a status line from `pdpOfferStatus` (e.g. "Add to bag for 20% off everything: it adds ₹580, not ₹999.") and a "View bag" button (44px target) |
| Rung reached | that column's rate in gold-text and a 2px gold-deep rule in its foot (`data-rung-rule`); rungs passed step back to ink/65 |
| Pre-order choice (`preorder`) | legend "NOT ON PRE-ORDERS", no prices, one line "In-stock pieces only" |
| Piece sold out | not rendered |
| `price <= 0` | renders nothing |

Type: legend and "Buy N" Jost 11px/500 0.08em caps gold-text; rate **Cormorant Garamond** 23px/500 (`font-nf-editorial`); "off" Jost 11.5px (hidden under 350px); price system sans 13.5px/500; "each" Jost 11.5px ink/65. Box `border border-nf-gold-deep/45`, columns split by `border-nf-gold-deep/25`. Height held at 56px by fixed row heights (tests pin `min-[310px]:h-[22px]`, `h-4`, `pb-[3px]`, `pb-[4px]`, `grid-cols-3`, nothing under 11px, no literal % or ₹ in the file). Data hooks used by the page and tests: `data-offer-ladder`, `data-state`, `data-rung`, `data-reached`, `data-current`, `data-rung-rule`, and the `ul` (the sticky bar keeps off `[data-offer-ladder] ul`).

### 1.8 Pickers and every state

Default ring size is US 6 (380-382). Picker button classes (1080-1084, 1125-1129): `min-h-[44px] min-w-[68px] border px-4 text-[12px] font-medium`; chosen = `border-[var(--nf-cta)] bg-[var(--nf-cta)] text-nf-ivory` (deep sage `hsl(162 18% 38%)`, also the outline of the pairing and reel "Add" buttons; the brand sage `#99B4AF` itself appears nowhere on the page); idle = `border-nf-ink/25`. A 12px colour square sits before metal and stone names (`swatchOf`).

| State | Condition (line) | What the page shows | Seen live on |
|---|---|---|---|
| No choice | no Shopify options, not a ring | no picker | Woven Gold Hoops, Prism Rivière Bracelet |
| Metal or stone | `choices(piece)` (1032-1098), up to 6 values | label row (eyebrow style + chosen value in plain text) and a radio group with swatches | Triple Coil Wrap Bangle (Gold, Silver), Baguette Huggies (4 stones) |
| More than 6 values | `option.values.length > 6` (1054-1066) | a native `<select>` 44px, values not buyable read "X · pre-order" | no live example found (birthstone-heart-necklace now redirects to /jewellery) |
| Ring sold in sizes | `sizeName` and `isRing` (1034-1053) | label "SIZE · US" + "Size guide" link; radios; unbuyable sizes carry "PRE-ORDER" in 9px caps; note "US 6 is in stock and ships now." (1153-1159) | Star Point Band, Tubogas Dome Ring, Baguette Eternity Band |
| Ring not sold in sizes, fixed | `isRing && !sizeName`, not adjustable (1102-1151) | list 5 (Pre-order), 6, 7 (Pre-order); note "US 6 is in stock and ships now." or "US 5 is a pre-order, delivered in 45 days." | none of the rings measured |
| Adjustable ring | `isAdjustableRing(piece)` (`src/data/ringFit.ts`; handle list or Shopify tag "Adjustable") | list 5 to 9, all available; note "US 6 ships now. Open-back design — adjustable to fit US 5 to 9 comfortably." The size rides on the bag line as a note (`noteSize`, 615) | Droplet Open Ring (metal + list), Golden Duet Ring |
| Size pre-order | `sizePreorder` (607) | ladder shows "Not on pre-orders"; one full-width "Reserve now" | fixed-list rings only |
| Variant sold out | `variantSoldOut` (601) | chosen chip says "PRE-ORDER"; note "Gold is sold out for now. Reserve it and we will confirm the date on WhatsApp."; ladder "Not on pre-orders"; one "Reserve now" | Silk Mesh Cuff (opened on Gold), Baguette Huggies (opened on Ruby) |
| Piece sold out | `soldOut = piece.availableForSale === false` (583, pinned) | no ladder; one "Reserve now"; gift line becomes "Hand-finished for you and shipped within 2 weeks, gift-boxed"; JSON-LD `OutOfStock` | Molten Bloom Hoops |
| Sets | no state of its own | only the pairing heading changes to "Complete the set" (`isSetRow`, 1305) | Prism Rivière, Tubogas, Baguette pieces |

Size guide: "Size guide" button (1045-1051, 1106-1112) opens `components/jewellery/RingSizeGuideModal.tsx` (Radix dialog, bottom sheet on phone, 560px centred from md, z-60/61, title Velista 21px "Ring Size Chart"), which wraps `RingSizeGuide.tsx` (table of US 5-9, two how-to lists). The same `RingSizeGuide` is repeated inside the Details fold for rings (1228). Phone back closes it (`useBackToClose("nfSizeGuide")`, pinned).

### 1.9 Buttons (1163-1196)

`<div id="product-actions" className="mt-2 grid grid-cols-2 gap-2">`. The sticky-bar effect watches `#product-actions > button`.

| Button | Lines | Classes that matter | Handler | Notes |
|---|---|---|---|---|
| Add to cart (right, ink fill) | 1164-1170 | `h-[50px] bg-nf-ink text-nf-ivory font-nf-label text-[11.5px] font-medium uppercase tracking-nf-8`, `col-start-2 row-start-1` | `handleAddToCart`: `setDrawerOpen(true)` then `addItem(cartItem())` | reads "Reserve now" and spans both columns when `isPreorder` |
| Buy Now (left, outline) | 1171-1175 | `variant="outline"`, `h-[50px] border-nf-ink bg-transparent text-nf-ink`, same type | `handleBuyNow`: `buyNow(cartItem())` | label "Buy Now" + `<UpiBadges size={16} />`; "Opening checkout…" while busy; hidden when `isPreorder` |
| Reserve now | same button as Add | | `handlePreOrder`: `window.open(preorderHref, "_blank")` (WhatsApp) | never enters the bag or checkout |
| Reserve on WhatsApp link | 1177-1186 | | | dead code behind `{false && …}`, kept on purpose |

Pay marks on the PDP: only the three UPI discs (GPay, PhonePe, Paytm) inside Buy Now (`components/checkout/UpiBadges.tsx`). No Visa, Mastercard or COD marks on the PDP; "Cash on delivery available" is a sentence in the Delivery fold. Measured: both buttons 50px high, 160 / 175 / 286px wide, Jost 11.5px/500, 0.08em caps.

### 1.10 Gift line (1187-1190)

Inside `#product-actions`, `col-span-2 mt-1 … text-[11.5px] text-nf-ink/80`, lucide `Gift` 14px gold-deep. Text: "Gift-ready: every piece arrives in the Naira gift box", or `${SOLD_OUT_LEAD}, gift-boxed` when sold out. No link, no box drawing.

### 1.11 Fold-downs (1202-1295)

Three native `<details className="group border-b border-nf-gold/15">` with `<summary className={fold}>`: 50px rows, Jost 10px / 400 / 0.16em caps ink, a lucide `Plus` 14px that turns 45° when open. All closed on load; all content stays in the HTML. A test pins exactly three `<details className="group`.

| Fold | Panel id | Contents, in order | Source |
|---|---|---|---|
| Details (1203-1247) | `pdp-panel-details` | blurb paragraph (13px, ink/85); spec list `<dl>` (label Jost 9.5px 0.1em caps gold-text, value 12px); a "Stone" row when not already listed; `piece.materials` line only when there are no specs; `RingSizeGuide` for rings; size-guide photo (`piece.sizeGuide`); styling tip (Cormorant Garamond italic 15px, gold left rule) | Shopify listing through `presentJewellery` and `specsOf`; `stoneOf` |
| Care (1249-1263) | `pdp-panel-care` | `piece.care ?? listedCare ??` a default sentence; then "Will it tarnish?" and "Sensitive skin?" answers | answers built at 678-690 from finish, steel, waterproof flags; they state a "3-year plating assurance" and "return it within 7 days" |
| Delivery & returns (1265-1294) | `pdp-panel-delivery` | lead time or "Order today and it arrives by {range}." + "Free insured shipping across India, dispatched from our Mumbai atelier."; "Cash on delivery available. 7-day returns — read the policy" (link `/exchange-return-policy`); `PincodeChecker`; "Questions? Chat with us on WhatsApp" link | `preorderLead`, `deliveryRangeFromNow()` (`src/lib/serviceability.ts`), `PREORDER_NOTE` under webdriver |

Pincode checker: `components/product/PincodeChecker.tsx` (154 lines, **shared** with the apparel page's `product/ProductDetails.tsx`). Local lookup only (`getServiceability`), no network. Remembers the pincode in `localStorage["naira-pincode"]`. Results: "Delivery to 400001 in 3 working days · by {date}" (or "once it ships" when `preorder`), COD available / blocked line, "can't confirm" note, "Enter a valid 6-digit pincode." Its colours are **inline `hsl()` greys, black, green, amber and red, not brand tokens** (lines 66-143 of that file), its input is 16px, and its "Delivery" label and "Check" button use `tracking-[0.14em]`.

### 1.12 Complete the look (1301-1315)

`completeTheLook(piece, jewellery, 3)` (`src/lib/pairings.ts`). Heading Velista 18px ("Complete the set" when two of three share the set). Right label reads `QUANTITY_OFFERS[0]`: "2 PIECES · 10% OFF". Three `PairingCard compact`: square photo, name (Velista 13px, 2-line clamp inside a 44px link, pinned by a test), price (12px ink/75, with "· Gold" when a variant is added), and a 44px outline button in deep sage: "Add" (one tap: opens the bag and adds) or "Choose size" / "Choose month" (a link to that page).

### 1.13 Reviews (`components/CustomerReviews.tsx`, 420 lines; shared with `pages/ProductDetail.tsx`)

`<CustomerReviews productName={piece.name} variant="jewellery" />`, lazy. Section id `customer-reviews`. Shows "Kind words / Customer Reviews" (Velista 27px/600), the average, one featured review, a photo strip, a "show all" toggle, filter chips, cards, "Write a review" (`WriteReviewModal`, inserts into Supabase `customer_reviews`). It uses the stock shadcn palette classes (`text-foreground`, `border-border`, `text-primary`), recoloured on the PDP by `html.nf-next`.

**Real or seeded: mostly seeded.** The list is built in the browser from bundled data:

```ts
const seed = [
  // Real photographed customer reviews always lead.
  ...orderedRealReviews(productName),
  ...ownReviews,
  ...(isJewellery ? [...jewelleryReviews, ...jewelleryOneLiners] : [...reviewsData, ...apparelOneLiners]),
];
```

```ts
/* Per-product review bank: 4-5 short, photo-free verified-buyer notes for
   every product, numbered site-wide. Deterministic per product key … */
export const getProductReviews = (key?: string): ProductReview[] => {
  const slot = hash(key.toLowerCase().trim()) % SLOTS;   // SLOTS = 52, PER_SLOT = 5
  …
  return bank.slice(start, start + count);
};
```

| Group | File | Count | What the code says about it |
|---|---|---|---|
| `realReviews` | `src/data/reviewWall.ts:142` | 7 | "Genuine customer reviews with their own photographs" |
| `getProductReviews(name)` | `src/data/productReviews.ts` | 4 or 5 of a 260-entry bank | dealt to a product by a hash of its name, not by who bought it |
| `jewelleryReviews` | `reviewWall.ts:248` | 9 | curated text |
| `jewelleryOneLiners` | `reviewWall.ts:361` | 30 | one-line notes |
| Supabase `customer_reviews`, `approved = true`, this product | fetched live | 0 or more | the only per-product live data; put first when present |

So every jewellery page shows the same 46 reviews plus 4 or 5 from the bank: 7 + (4 or 5) + 9 + 30 = **50 or 51**, average **4.9**, as measured on all 11 pieces. Nearly all are flagged "Verified Buyer" in the bundled data. The header number (`reviewSummary`) counts the bundled set only.

### 1.14 Press marquee (`components/jewellery/PressMarquee.tsx`, 44 lines; PDP and the unrouted old page only)

"As featured in" over five static logo images that scroll: The Times of India, Maharashtra Times, Lokmat, Times Now, Fashionista. No links, dates or articles anywhere in the code, so **the code cannot show whether the coverage is real**; ask the owner before giving it more weight. Its heading uses `tracking-nf-15`, which is not defined in `tailwind.config.ts` (no CSS is generated for it). On the PDP an index.css rule multiplies the logos onto the ivory ground.

### 1.15 Reel shop (`components/reels/ReelShopNext.tsx`, 494 lines; PDP only)

`md:hidden`: phones only. "SEEN ON NAIRA / Shop the reel" (Velista 26px), a rail of reels with the pieces in each ("IN THIS REEL", names Velista 15px, Add / Reserve buttons). Data from Supabase through `useReels`. Must stay after `<PressMarquee />` (test).

### 1.16 More like this (1330-1343)

`moreLikeThis(piece, jewellery, 8)`. Heading "More earrings" (Velista 19px). Phone: a horizontal rail of `PairingCard` (no button), 42vw wide. Desktop: 4-column grid.

### 1.17 FomoPopup (`components/FomoPopup.tsx`, 258 lines; PDP and the unrouted old page only)

What: a small card, "{first name}, {city} · {n} min ago" over "bought the {piece}", with the piece's photo and a 32px close.
When: first after 5 s (`FIRST_DELAY`), on screen 2.3 s (`VISIBLE_FOR`), next 60 s after it hides (`GAP`); closing it snoozes 60 s. Hidden while the bag, the lightbox or the size guide is open. Phone position: `top-[166px] left-3`, or just above the sticky bar when the bar is showing (`bottom-[calc(var(--pdp-sticky-bar-h)+…+12px)]`); from md: bottom-left. 236px wide (`quiet`), z-39 on phone, z-90 from md.
**Invented, not real:**

```ts
setItem({
  name: pick(namesRef.current),               // the bundled reviewers' names plus first-name/surname pairs generated in the file
  city: pick(CITIES),                         // 24 city names in the file
  minutes: 1 + Math.floor(Math.random() * 24),
  title: piece.name,                          // a random piece from a shuffled pool of 10-20, not this page's piece
  …
});
```

No order data is read. The file's own comment calls it "Social-proof (someone just bought this) notifications".

### 1.18 Sticky bottom bar (1358-1390, effect 490-530)

Phone only (`md:hidden`), `fixed inset-x-0 bottom-0 z-40`, ivory/95 with blur, top hairline gold/15. Contents: wishlist heart 48x48 (outline), Buy Now (outline, UPI discs 15px), Add to cart (ink fill), both 48px high, Jost 11px. With a pre-order: heart + "Reserve now". Measured 65px high. Shown when `#product-actions > button` is not fully on screen **and** the price is clear of the bar **and** the ladder's `ul` is not under it (test pins these lines verbatim). Hidden by inline `transform: translateY(110%)` + `visibility: hidden`. `--pdp-sticky-bar-h: 72px` (`index.css:177`) is what FomoPopup, the toasts (`ui/sonner.tsx`) and `ReelPeek` use to sit above it; the bar itself measures 65px.

### 1.19 Announcement bar (`components/AnnouncementBar.tsx`, 67 lines; global, in `Header.tsx`)

A link to `/jewellery` holding a marquee of four lines, twice: "BUY 2 GET 10% OFF · BUY 3 GET 20% OFF · BUY 4 GET 30% OFF" (built from `QUANTITY_OFFERS`), "SITEWIDE SALE LIVE TODAY!" (a fixed string), "FREE INSURED SHIPPING", "MADE IN LIMITED BATCHES". 34 / 36 / 40px high. Colours are inline: bg `#AEBDB6`, text `#FFFFFF` (brand sage token is `#99B4AF`). Out of scope (every page), and `AnnouncementBar.test.tsx` requires it to keep running on the PDP.

## 2. The bag (`src/components/CartDrawerNext.tsx`)

### 2.0 File layout

| Lines | What |
|---|---|
| 54-65 | `formatPrice`, `formatUnitPrice` (pinned by a source test), `pct` |
| 69-75 | `lineOptions` ("Metal: Silver · Size: US 6") |
| 79 | `BEST_SELLERS = ["prism-riviere-bracelet", "woven-gold-hoops"]` |
| 86-132 | `PieceCard` (empty-bag cards) |
| 137-154 | `BagReturns` (exported, tested) |
| 164-208 | `SimpleLadder` (exported, tested) |
| 210-417 | component logic: cart 211-227, back/swipe 234-236, promo 241-253, Clarity open/close 256-265, pending line 271-278, scroll to the arriving line 279-291, totals 292-302, add 314-324, remove + undo 329-358, checkout 364-402 |
| 419-620 | JSX |

Computed but **not rendered**: `mrpOf` / `mrpTotal` / `youSave` (306-312) and `whatsappHref` (360-362).

### 2.1 What it renders, top to bottom

| Part | Lines | Detail | Measured |
|---|---|---|---|
| Sheet | 420-425 | Radix dialog via `ui/sheet` (shared), right side. `SheetContent` classes: `nf-palette … h-[100dvh] font-nf-label w-full … border-l border-nf-ink/20 bg-[var(--nf-surface)] p-0 text-nf-ink sm:max-w-[420px]`. Overlay `bg-black/80` | full screen on phones; 420px at the right from 640px; overlay rgba(0,0,0,0.8) |
| Header | 426-445 | phone: 44px chevron-left "Back to shopping"; from sm: the sheet's own corner X instead. Title "Your bag" Cormorant Garamond 20px/500 + count "1 PIECE" / "3 PIECES" Jost 9.5px/500 0.16em caps ink/70. Bottom hairline ink/20 | 55px (51px desktop) |
| Offer track `SimpleLadder` | 447, 164-208 | only with lines. "✦ SITEWIDE SALE LIVE TODAY · UP TO 30% OFF" (Jost 10px/500 0.08em caps ink/60, pinned at 10px); 3px track ink/25 with ink fill; a 16px mark per rung (`rounded-full`, drawn **square** because every radius is 0); labels "Buy 2 / 10% off", "Buy 3 / 20% off", "Buy 4 / 30% off" | 107px. Fill 8.33% (1), 16.67% (2), 50% (3), 100% (4+) |
| Undo notice | 448, 410-417 | "{name} removed" + "Undo" (deep sage, underlined), ivory-deep band, 6 s | not triggered (would need a remove) |
| Add error | 449-453 | `role="alert"` band with `addError` from CartContext ("X couldn't be added. It may have just sold out.", "Only 2 of X left, all in your bag.", "Your cart timed out. Please add the piece again.") | from code |
| Empty state | 455-477 | "Your bag is empty" (Cormorant Garamond 20px/500); "MOST LOVED" eyebrow; up to two `PieceCard` (photo 36x45, "Name · ₹price" Jost 12.5px, outline "ADD" 44px); link "EXPLORE JEWELLERY" (deep sage, underlined). No ladder, no foot | cards 59px high |
| Lines | 480-571 | `<ul>` in a scrolling `[data-bag-list]`. Each `<li data-line>`: photo 64x80 (72x90 from sm) linking to the piece; name (link, `data-line-name`, Jost 500 13.5px, 14.5px from sm, 2-line clamp); line total right (`data-line-total`, 14px/500); options line (12px ink/60) when present; price row (`data-line-price`): plain price, or struck price + new price (or "₹734 each" when quantity > 1) + "20% off" in gold-text 11px; stepper (− n +, bordered ink/40, 32px, 40px from sm; "−" at 1 removes); remove X (44px target; the word "Remove" from sm) | line 118px (138px with an options line); 142 / 162px desktop |
| Foot `[data-bag-foot]` | 575-615 | top hairline ink/20. "Total" 15px/500 and amount 17px/500 (`data-total`); then one gold-text 12.5px/500 line: `data-you-save` "You save ₹919 · 20% for 3 pieces" (or "… with your code"), or `data-next-rung` "A second piece takes 10% off your bag"; then "Incl. 3% GST. Free insured shipping · arrives 25–27 Nov." (12.5px ink/65) | 259px in every state |
| Trust `BagTrust` | 602, `cart/BagTrust.tsx` | star line between two hairlines: 4.5 gold stars + "Rated 4.5/5 · Trusted by 5,000+ clients" (11.5px ink/70); then "VISA  Mastercard  Cards · (banknote) Cash on delivery" (12px ink/75). Figures are owner-supplied constants in `src/lib/trust.ts` (`SHOP_RATING = 4.5`, `CLIENTS_SERVED = 5000`), not computed. Nothing pressable (test) | 44px |
| Checkout button | 603-613 | `data-checkout`, `h-[52px] w-full bg-nf-ink text-[15px] font-medium tracking-[0.02em] text-nf-ivory`; label "Checkout" + `<UpiBadges size={18} />`; spinner and "Opening checkout…" while busy | 52px, square corners (radius 0px; the 10px `--nf-checkout-radius` token belongs to the old `CartDrawer.tsx`) |
| Returns line `BagReturns` | 614, 137-154 | link to `/exchange-return-policy`, lucide `Undo2` + "Easy 7-day exchange & returns", 11.5px ink/60 | its 44px target ends 2px below a 640px screen |

Space at **360x640**: header 55 + track 107 + foot 259 leaves **219px** for the list, under two lines (118px each); the list scrolls to the newest line on open, so a three-piece bag opens showing the last line and three quarters of the one above. At 390x844 the list has 423px.

Not in the bag: gift box, promo-code field, upsell / "wears well with" row, COD fee line, Visa/Mastercard tiles, WhatsApp link. The file's header comment (35-52) still describes a gift-box line and an add-on row; neither is drawn.

### 2.2 Totals and savings (292-302)

`lineCount` and `lineSubtotal` include the piece still on its way in. `discount = resolveCartDiscount({ totalItems: lineCount, promoCode })` (one code only); `goodsTotal = discountedSubtotal(lineSubtotal, discount)`; `linePrices = discountedCartLines(lines, discount)` (`src/lib/cartPricing.ts`); `orderTotal = goodsTotal + SHIPPING_CHARGE` (0). Measured: 1 piece ₹1,049, "A second piece takes 10% off your bag"; 2 pieces ₹3,103, "You save ₹345 · 10% for 2 pieces"; 3 pieces ₹3,678, "You save ₹919 · 20% for 3 pieces"; 4 pieces (one line of two) ₹3,777, "You save ₹1,619 · 30% for 4 pieces", line shows "₹1,049 ₹734 each 30% off".

### 2.3 Checkout button: what it calls (364-402)

1. guard against a second tap (`checkoutStarted` ref); `setOpening(true)`; `clarityEvent("bag_checkout_tapped")`; `await releaseEntry()` (drops the bag's history entry).
2. if signed in: insert a `member_orders` row in Supabase (`status: "checkout_started"`); errors swallowed.
3. `checkout()` from CartContext (`src/contexts/CartContext.tsx:565`) → `openCheckout` (:435): `trackPixel("InitiateCheckout", …)`, Clarity tags, tracking attributes on the cart, the one discount code put on the Shopify cart, UTM added, then **Fastrr** (`startFastrrCheckout`, `src/lib/fastrr.ts:213`) and, if that fails, `window.location.assign(target)` to Shopify's checkout.
4. button unlocks after 8 s.

### 2.4 States

| State | Trigger | What changes |
|---|---|---|
| Empty | no lines | 2.1 "Empty state"; best-seller cards only if the piece is in the live catalogue, buyable and has a variant id |
| One piece | | nothing struck; gold line names the next rung |
| Several / tiers | 2, 3, 4+ pieces | each line: struck price, new price, "% off"; gold "You save" line; track fills; reached marks turn solid ink |
| Typed code | `localStorage["naira-promo-code"]` (no field in this bag to type one) | "You save … with your code" |
| Line with choices | variant or ring size | options line "Metal: Gold · Size: US 6"; line 20px taller |
| Pre-order line | never: reserved pieces go to WhatsApp and do not enter the bag | none |
| Adding (pending) | Add tapped anywhere; `pending` from CartContext | the piece is listed and counted at once with `data-adding` and "Adding to your bag…" (spinner, gold-text 12.5px); the list scrolls to it; Checkout disabled with a spinner |
| Loading / syncing | `isLoading \|\| isSyncing` (`busy`) | steppers and remove disabled (`isLoading`); Checkout disabled, `disabled:opacity-80` |
| Undo | a line removed | band under the track for 6 s; Undo re-adds through `addItem` (fires AddToCart again; `bagUndoPrice.test.tsx`) |
| Error | `addError` | alert band under the track; cleared when the bag closes |
| Opening checkout | Checkout tapped | "Opening checkout…" + spinner, discs hidden |

### 2.5 How it opens and moves

Mounted once for every page: `App.tsx:89-95` lazy-loads it (`<Bag />`, Suspense fallback null). Opens when `isDrawerOpen` is true: Navbar bag button (`Navbar.tsx:174`, `aria-label="Open cart"`), PDP Add to cart (651), PairingCard Add (215), ladder "View bag" (`PdpOfferLadder.tsx:153`), listing cards, reel cards. On open: `syncCart()` (Shopify `query Cart`, deletes server lines the bag does not show), `primeFastrr()` (loads the Fastrr script), `clarityEvent("bag_opened")`.
Motion (all from `ui/sheet.tsx` + tailwindcss-animate): slides in from the right 400ms `ease-drawer`, out 250ms; overlay fades. Track fill `transition-[width] duration-500`; marks `transition-colors duration-300`; buttons `press-scale` (scale 0.97 on press); spinners `animate-spin`. Reduced motion stills the track.
Closing: chevron (phone), corner X (from sm), overlay tap, Escape, the phone's back (`useBackToClose("nfBag")`), a rightward swipe over 72px (`useSwipeDismiss`). Links inside go through `followOut` so the bag closes first and back returns.

## 3. Who uses what

"Unrouted" = imported only by `pages/JewelDetail.tsx` or `components/CartDrawer.tsx`, which `App.tsx` does not mount (kept for a one-line switch back).

| Component / module | PDP | Bag | Other live pages | Verdict |
|---|---|---|---|---|
| `pages/JewelDetailNext.tsx` (with `PairingCard`, both galleries, sticky bar) | yes | | | PDP only |
| `jewellery/PdpOfferLadder.tsx` | yes | | | PDP only |
| `reels/ReelShopNext.tsx`, `reels/GalleryReel.tsx` | yes | | | PDP only |
| `jewellery/RingSizeGuide.tsx`, `RingSizeGuideModal.tsx` | yes | | unrouted old page | PDP only in practice |
| `jewellery/PressMarquee.tsx` | yes | | unrouted old page | PDP only in practice |
| `FomoPopup.tsx` (`quiet` variant is the PDP's) | yes | | unrouted old page | PDP only in practice |
| `lib/dailySold.ts` | yes | | unrouted `JewelTrustStrip` | PDP only in practice |
| `Footer.tsx` with `compact slim` | yes | | every page uses Footer; `slim` only here | shared file, PDP-only variant exists |
| `product/PincodeChecker.tsx` | yes | | apparel `product/ProductDetails.tsx` | **shared: needs a variant** |
| `CustomerReviews.tsx` (+ `WriteReviewModal`) | yes | | `pages/ProductDetail.tsx` | **shared: needs a variant** (or keep the `.nf-next` recolour) |
| `ui/image-lightbox.tsx` | yes | | `product/ProductGallery.tsx` | **shared** |
| `ui/atelier-skeleton.tsx`, `ui/button.tsx`, `JsonLd.tsx`, `jewellery/JewelPriceTag.tsx` (`discountPercent`) | yes | | many | shared, leave |
| `checkout/UpiBadges.tsx` | yes (Buy Now x2) | yes (Checkout) | | **shared by PDP and bag only** |
| `components/CartDrawerNext.tsx` (with `PieceCard`, `SimpleLadder`, `BagReturns`) | | yes | mounted on every page | bag only |
| `cart/BagTrust.tsx`, `cart/PayMarks.tsx` | | yes | | bag only |
| `ui/sheet.tsx` | | yes | `WishlistDrawer`, `pages/ShopAll.tsx`, `reels/ReelPeek`, `ui/sidebar` | shared, leave |
| `cart/CartExtras.tsx` (`CartPromoField`) | | no | unrouted old bag | not live |
| `cart/OfferProgress.tsx` | | no | unrouted old bag (+ its own test) | not live |
| `cart/LadderBand.tsx` | | no | nothing imports it | dead |
| `giftbox/BagGiftRow.tsx`, `BagGiftBox.tsx`, `NairaBoxCSS.tsx`, `pose.ts` | | no | only `BagGiftRow.test.tsx` | not live (ready to use; fires `clarityEvent("bag_gift_opened")`) |
| `checkout/CheckoutBenefit.tsx` | no | no | `StickyAddToCart`, `product/ProductDetails` (apparel) | not on PDP or bag |
| `Header.tsx`, `AnnouncementBar.tsx`, `Navbar.tsx` | above the PDP | | global | out of scope |

## 4. Type and colour

### 4.1 Stacks and where they are defined

| Tailwind class | Stack | Defined | Loaded how |
|---|---|---|---|
| `font-cormorant` | `Velista, "Cormorant Garamond", Georgia, serif` | `tailwind.config.ts:20` | Velista self-hosted, `@font-face` in `src/index.css:6-13`, weight range 400-600, `swap`; preloaded in `index.html:17`. Capitals only in practice |
| `font-nf-display` | `var(--nf-font-display)` = the same Velista stack | `index.css:412` | not used on the PDP or in the bag |
| `font-nf-editorial` | `'Cormorant Garamond', Georgia, serif` | `index.css:413` | Google Fonts, 400 and 500, roman and italic |
| `font-nf-label` | `'Jost', 'Inter', sans-serif` | `index.css:414` | Google Fonts, **300, 400 and 500 only** (no 600) |
| (no class) | Tailwind default `ui-sans-serif, system-ui, sans-serif` | preflight | the phone's own sans |

The Google Fonts stylesheet (`index.html:26`) ships as `media="print"` and is switched on by `main.tsx:61` after the page's code arrives (and put back to print in every pre-built page). So Jost and Cormorant Garamond text paints in a fallback first on a product page; Velista does not, it is preloaded. A title moved to Jost will swap faces shortly after first paint unless `index.html` changes, and `index.html` is on the never-edit list.

Tracking tokens (`tracking-nf-N` = N hundredths of an em): 4, 8, 10, 16, 18, 20, 24, 25, 28, 30, 32, 34, 40, 50 (`tailwind.config.ts:26-43`, values `index.css:418-431`). Colour classes: `nf-ivory #FBF3EC`, `nf-ivory-deep #F4EBE2`, `nf-ink #1A1614`, `nf-gold #C99A4C`, `nf-gold-deep #B0843A`, `nf-gold-shadow #9A7634`, `nf-gold-text #80612A` (AA on ivory), `nf-sage #99B4AF`, `nf-blush #FFBDA8`, `nf-cream` (`tailwind.config.ts:48-59`, `index.css:388-407`), each with `/opacity`. Semantic: `--nf-surface` (ivory), `--nf-cta: hsl(162 18% 38%)` deep sage (`index.css:468`). Every radius is 0 (`tailwind.config.ts:110-119`), `rounded-full` included; `UpiBadges` uses `rounded-[50%]` to stay round. `html.nf-next` (set by the PDP while mounted, 339-343) and `.nf-palette` (on the bag) swap the stock shadcn palette for Naira's (`index.css:111-128`).

### 4.2 PDP, as rendered (Woven Gold Hoops, 390x844, info column including fold contents; 85 text runs)

| | Values (count) |
|---|---|
| Face | system sans 39 · Jost 35 · Velista 7 · Cormorant Garamond 4 |
| Size, 13 distinct | 13px 14 · 12px 13 · 9.5px 13 · 11.5px 10 · 11px 9 · 10.5px 8 · 10px 7 · 13.5px 3 · 23px 3 · 15px 2 · 22px 1 (title) · 19px 1 (price) · 18px 1 |
| Weight | 400 60 · 500 20 · 600 4 · 300 1 |
| Tracking | none 49 · 0.08em caps 12 · 0.16em caps 11 · 0.10em caps 8 · 0.04em 2 · 0.14em caps 2 (pincode, arbitrary) · 0.24em caps 1 (eyebrow) |
| Colour | gold-text `#80612A` 23 · ink 21 · ink/85 10 · ink/90 8 · ink/65 6 · ink/75 5 · ink/80 4 · deep sage `rgb(79,114,104)` 4 · gold-deep 1 · ivory on ink 1 · `rgb(64,64,64)` 1 and white 1 (pincode checker, off palette) |

Whole `<main>` (reviews, press, reels, more): Velista rises to 39 runs (card names 13px x23, headings 18-27px, review names 14px/600) and the shadcn grey `rgb(107,98,91)` adds 28. Desktop differs only in the title (30px) and price (22px).
Velista on the page, so "the title" is not the only place the ornate capitals show: h1 (973), price (979), sold count (1016), pairing names (245), "Complete the look" (1304), "More …" (1332), reviews heading and names (`CustomerReviews.tsx`), "Shop the reel" and reel piece names (`ReelShopNext.tsx`), FomoPopup line (`FomoPopup.tsx:187`), size guide headings (`RingSizeGuide.tsx:17`, modal :32).

Class tokens in the source (PDP file + `PdpOfferLadder.tsx`): `font-nf-label` 24, `font-cormorant` 6, `font-nf-editorial` 2 · sizes `text-[11.5px]` 11, `[11px]` 9, `[12px]` 8, `[10px]` 6, `[13px]` 5, `[9.5px]` 4, `[10.5px]` 4 (+2 at `min-[375px]`), `[9px]` 2, `[19px]` 2, `[15px]` 2, one each of 12.5, 18, 22, 23, `md:22`, `md:26`, `lg:30` · weights `font-medium` 11, `font-semibold` 3, `font-normal` 3, `font-light` 1 · tracking `nf-8` 11, `nf-16` 8, `nf-4` 2, `nf-10` 2, `nf-24` 1 · text colours `nf-ink` 30, `nf-gold-text` 10, `nf-ink/75` 6, `nf-ink/65` 6, `nf-ivory` 6, `nf-ink/70` 5, `nf-ink/85` 4, `nf-ink/80` 3, `nf-gold-deep` 3, `nf-ink/90` 2, `[var(--nf-cta)]` 2, `nf-ink/60` 1, `nf-gold` 1 · borders `nf-gold/15` 9, `nf-ink/25` 5, `[var(--nf-cta)]` 4, `nf-gold/30` 2, `nf-ink/50` 2, six others once · control heights `min-h-[44px]` 8, `h-[48px]` 3, `h-[50px]` 2, `h-[44px]` 2, `min-h-[50px]` 1. `nf-sage` (the brand sage) is used 0 times; raw hex only in `SWATCHES`.

### 4.3 Bag, as rendered (three pieces, 390x844; 58 text runs)

| | Values (count) |
|---|---|
| Face | Jost 57 · Cormorant Garamond 1 ("Your bag") · Velista 0 |
| Size, 13 distinct | 11px 12 · 12.5px 10 · 12px 7 · 10.5px 6 · 13.5px 6 · 10px 4 · 14px 3 · 13px 3 · 15px 2 · 11.5px 2 · 9.5px 1 · 17px 1 · 20px 1 |
| Weight | 400 31 · 500 27 |
| Tracking | none 46 · 0.03em 6 (`tracking-wide`) · 0.08em caps 4 · 0.16em caps 1 · 0.02em 1 (Checkout, arbitrary) |
| Colour | ink 23 · gold-text 11 · ink/60 6 · ink/65 5 · ink/70 4 · ink/50 3 · ink/80 2 · ink/75 2 · ink/30 1 · ivory on ink 1. Deep sage only on "Undo" and "Explore jewellery" |

Class tokens (bag file + `BagTrust.tsx`): `font-nf-label` 6, `font-nf-editorial` 2 · `text-[12.5px]` 6, `[12px]` 5, `[11px]` 3, two each of 9.5, 10.5, 11.5, 13, 13.5, 15, 20, one each of 10, 14, 17, `sm:14.5` · `font-medium` 17 · `tracking-nf-16` 4, `nf-8` 1, `tracking-wide` 1, `tracking-[0.02em]` 1 · text `nf-ink` 18, `nf-gold-text` 6, `nf-ink/70` 4, `nf-ink/60` 4, others 1-2 · bg `[var(--nf-surface)]` 6, `nf-ivory-deep` 4, `nf-ink` 4 · borders `nf-ink/20` 3, `nf-ink/40` 2, `nf-ink` 2, `nf-gold/15` 2, `nf-ink/10` 1, `nf-gold/20` 1.

### 4.4 Where a product name is already in a clean mixed-case sans

| Where | Component, line | Classes on the name | Rendered |
|---|---|---|---|
| Bag line name | `CartDrawerNext.tsx:503-510` (`data-line-name`) | `line-clamp-2 text-[13.5px] font-medium leading-snug text-nf-ink sm:text-[14.5px]`; the face comes from `font-nf-label` on `SheetContent` (line 424) | Jost 500, 13.5px (14.5px desktop), ink, no tracking |
| Empty-bag card name | `CartDrawerNext.tsx:114-119` (`PieceCard`) | `truncate text-[12.5px] leading-[1.3] text-nf-ink` (same inherited face) | Jost 400, 12.5px |

Looked at beside the owner's screenshot (`codemap/title-faces.png` sets "Woven Gold Hoops" in each loaded face): the screenshot's title is a light geometric sans in mixed case; of the faces the site already loads, **Jost 300 or 400 at about 24px** is the nearest (Jost 500 is visibly heavier, Cormorant Garamond is a serif, Velista is the capitals in use today). The other product names checked (listing cards `JewelCard.tsx:254-259`, pairing cards, wishlist drawer, reel cards, FomoPopup) are all Velista.

## 5. What must not change

### 5.1 Meta pixel events reachable from the PDP and the bag

None is called in the two files themselves. `trackPixel(event, params, options?)` is `src/lib/pixel.ts:205` (browser `fbq` + a server copy to the `meta-capi` function, both only on the real domain). `productParams` (:248) returns `{ content_ids: [numeric variant id], content_name, content_type: "product", content_category, contents: [{ id, quantity, item_price }], value, currency }`.

| Event | Fired at | Reached by | Parameters |
|---|---|---|---|
| `ViewContent` | `src/hooks/useViewContent.ts:54`, called at PDP 476: `useViewContent(piece, colourParam, Boolean(piece && linkPlaced(piece, searchParams)), isLive \|\| !catalogueLoading)` | page view, once per handle; waits up to 3,000 ms when the link's colour or variant cannot be placed yet | `viewContentParams(piece, colourParam)` (`src/lib/viewContent.ts:17`): `productParams({ id: handle, variantId: opening variant ?? piece.variantId, name, price: opening price, category })`, options `{ pageUrl }` |
| `AddToCart` | `src/contexts/CartContext.tsx:252` (`addItem`) | PDP Add to cart and Buy Now (through `buyNow`), PairingCard "Add", bag empty-state "Add", bag "Undo" | `productParams({ id, variantId, name, price, currencyCode, quantity: added })`, only for what Shopify really added |
| `AddToCart` | `CartContext.tsx:346` (`updateQuantity`) | bag "+" | same, `quantity` = pieces added; never on "−" |
| `InitiateCheckout` | `CartContext.tsx:454` (`openCheckout`) | bag Checkout, PDP Buy Now | `{ currency, value: discounted total + shipping, num_items, content_ids: [...], contents: [{ id, quantity, item_price }], content_type: "product" }` |
| `AddToWishlist` | `src/contexts/WishlistContext.tsx:65, 79` | PDP heart (gallery, sticky bar) | `productParams({ id, variantId, name, price: amount })`. The PDP call is pinned: `toggleItem({ …, variantId: variant?.id ?? piece.variantId, amount: shown.price })` (673) |
| `Contact` | `src/components/PixelEvents.tsx:74`, a document click listener on any `<a>` whose href has `wa.me`, `tel:` or `mailto:` | PDP "Questions? Chat with us on WhatsApp" (1285-1292) | `{ source: location.pathname }`. Keep it an `<a href>`. "Reserve now" uses `window.open` and sends no Contact |
| `PageView` | `index.html` snippet (landing) and `PixelEvents.tsx:52` (route change) | every page | none |
| `AddPaymentInfo` | not sent by the live bag | | `checkoutTapEvents.test.tsx` fails if it reappears |

Keep unchanged: `cartItem()` (632-644), `handleAddToCart`, `handleBuyNow` (three lines pinned), `handlePreOrder`, `handleWishlist`, the `useViewContent(...)` call, and in the bag `addPiece`, `remove`, `undo`, `handleCheckout`.

### 5.2 Clarity

| What | Where |
|---|---|
| Events (`clarityEvent`, `src/lib/clarity.ts:95`) | `bag_opened` (BAG 258), `bag_closed` (259, only with pieces), `bag_empty_added` (464 → 320, after a successful add), `bag_checkout_tapped` (368). `bag_gift_opened` lives in the unused `BagGiftRow` |
| Tags (`setClarityTag`) | `reached_checkout = yes`, `checkout_value` (`CartContext.tsx:471-472`); session tags `meta_vid`, `fbclid`, `utm_*`, `signed_in` (`clarity.ts:143-149`, from `PixelEvents`) |
| Masks | **none in the code**: no `data-clarity-mask` / `data-clarity-unmask` anywhere in `src` or `index.html`. Masking is whatever the Clarity project's own setting is |
| Loading | snippet in `index.html` (199-208), only when `window.__nairaProd` |

### 5.3 UTM and click ids

`src/lib/landingUtm.ts` captures the first `utm_*` of the session when the module loads (line 86), in `sessionStorage["naira_landing_utm"]` and memory. Handed on by `withSessionUtm` (`CartContext.tsx:544`), `sessionUtmParams` (`fastrr.ts:229`) and `trackingCartAttributes` (`shopify.ts:598`). On the PDP: `?colour=` and `?variant=` are read at 393-396 (pinned), and `pick()` copies the existing query before writing `colour` (424-426), so `utm_*` and `fbclid` stay in the address bar. Do not replace `useSearchParams` handling or build links that drop the query.

### 5.4 Helmet (880-901)

`<title>` (`fitTitle("{name} · Demi-Gold Jewellery")`, prefixed "Preview · " under `/preview/`), `description` (`{name}, clipText(blurb, 130)`), `canonical` (`https://nairaflore.com/jewellery/{handle}`, also on the preview route), `robots` (`index, follow, max-image-preview:large`, or `noindex, nofollow` in preview), `og:type/title/description/image/image:secure_url/image:type/image:width/image:height/image:alt/url/site_name`, `twitter:card/title/description/image`. Tests pin the robots line and canonical line verbatim and exactly three `clipText(` in the file.

### 5.5 JSON-LD

`<JsonLd data={structuredData} />` (902; object at 693-715): Product with name, description, brand, category, image, material, url, `sku` only when present (pinned), Offer (INR, `piece.price`, `priceValidUntil`, `InStock` / `OutOfStock` from `soldOut`, NewCondition, seller, url). Breadcrumb list (903-913). No FAQPage (pinned). `WebSite` comes from `index.html`. Measured: `WebSite, Product:InStock:1049, BreadcrumbList`.

### 5.6 The pre-built page

| Step | Where | What a restyle must keep |
|---|---|---|
| Build | `package.json`: `build = vite build && npm run prerender`; `scripts/prerender.ts` (518 lines) serves `dist/`, opens every route in headless Chromium at **1280x900, reduced motion**, and writes the DOM to `<route>/index.html` | the page must render fully at 1280px with `navigator.webdriver` true |
| Accept checks | prerender.ts 252-360 | an `<h1>` exists; no `meta robots noindex`; canonical path equals the route; at least 20 words. Fail = the route gets the bare shell |
| `clean()` | prerender.ts 116-146 | inline `opacity: 0` and `visibility: hidden` are **stripped** from every style attribute, so do not rely on them to hide anything in the first paint (the sticky bar also uses `transform`, which survives) |
| Under webdriver the PDP itself | 455, 465, 739-764 | no dated delivery promise (falls back to `PREORDER_NOTE`), no reel request, phone gallery renders only photo 1 |
| Embedded piece | 915-919: `<script type="application/json" id="nf-piece">{ piece, rating }</script>`; read back by `readEmbeddedPiece` (154-163) for the first client render | keep the id, the shape and its place in this component (test) |
| Start-up | `src/main.tsx:46-62`: waits for this route's code (`preloadRouteFor`, `src/pageCode.ts`, `src/lib/routeCode.ts` map `/jewellery/:handle` to the name `JewelDetailNext`), then `createRoot(root).render(<App />)`. **Not hydration**: React replaces the pre-built DOM | the first client render must look the same as the pre-built HTML or the page visibly jumps |
| Slow code | `src/lib/prebuiltPage.ts`: after 8 s the app starts anyway; the nodes after `#root > header` are kept and shown as the routes' Suspense fallback | the page must stay a sibling after the header |
| Twins | every captured product page is copied to `/products/<handle>` (ad links); `/preview/jewellery/<handle>` gets the empty shell | nothing to do |
| Names | `Navbar.tsx:41` checks `routeKeyFor(...) === "JewelDetailNext"`; `routeCode.test.ts`, `legacy-routes.test.ts` pin the name | do not rename or move `src/pages/JewelDetailNext.tsx` |

New files imported by the PDP ride in its chunk automatically; nothing in the build needs to know about them.

### 5.7 LCP image

| Rule | Line |
|---|---|
| Phone photo 1: `loading="eager" fetchPriority="high" decoding="sync"`, `src` at width 900, `srcSet` = `HERO_WIDTHS` [480, 600, 720, 800, 900, 1000, 1200, 1400], `sizes="(max-width: 1024px) 100vw, 50vw"`, `width={900} height={1200}`, `object-cover` in a square frame | 765-776, 737-738 |
| Desktop photo 1: the **same** `srcSet` and `sizes`, so the browser downloads one file whichever gallery shows | 833-844 |
| Desktop photos 2-4: `<picture>` with a `(min-width: 768px)` source and a 1x1 blank `src`, so phones never fetch them | 850-861 |
| Phone photos 2+: `loading="lazy"`, `[480, 720, 900, 1200]`, `sizes="100vw"`; not rendered under webdriver | 764-777 |
| `MOBILE_FRAME = "1/1"` | 80 (pinned) |
| No `<link rel="preload">` for the photo is emitted by the page; prerender drops the homepage's unused image preload | `src/lib/unusedPreloads.ts` |

Measured: the browser chose the 480px file at 360 and 390 wide, the 720px file at 1440 (DPR 1). Changing the frame's width share (for example a narrower photo column on desktop) means changing `HERO_SIZES` in both galleries together.

### 5.8 Other behaviour to carry over

`html.nf-next` on mount, off on unmount (339-343, pinned). `goBack` (350-360, pinned). `useBackToClose("nfZoom")` and `("nfSizeGuide")` (439-440, pinned). One `<main>`; the footer and sticky bar stay outside it (`landmarks.test.ts`). Radio groups with `role="radiogroup"`, `aria-checked={active}`, `onRadioGroupKeyDown`, `rovingTabIndex`. Touch targets 44px. Header offsets `pt-[107px] md:pt-[126px] lg:pt-[136px]` (`Header.test.ts` requires each page offset to be within 8px of the 111 / 122 / 136px header). Layering: sticky bar z-40, FomoPopup z-39 (z-90 from md), header and bag z-50, size guide z-60/61, lightbox z-70.

## 6. Tests that pin the PDP and the bag

Runner: `npm test` (`vitest run`). "Source" = the test reads the `.tsx` as text.

| Test file | Kind | What it asserts | A restyle breaks it if… |
|---|---|---|---|
| `src/pages/JewelDetailNext.test.ts` (236 lines) | source | order: `id="product-price"` < `aria-label="Ring size, US"` < `id="product-actions"` < `id="pdp-panel-details"`; `aria-label="Made to last"` after the price and before the actions, with `"Anti-tarnish"`, `"Skin-friendly"`, `platingBadge(finish)` within 900 characters; `<PdpOfferLadder` after the badges and after the string `pieces sold in the last 48 hours`, before `choices(piece).map` and the actions, once, with the exact JSX of line 1027; exactly 3 `<details className="group`; no `role="tablist"`, no `id="product-facts"`, no `<Select`; `role="radiogroup"` and `aria-checked={active}`; `<PressMarquee />` before `<ReelShopNext`; `id="complete-the-look"` before `<CustomerReviews`; rating block has `rating.rating` and `rating.count` and `href="#customer-reviews"` followed by `onClick={toReviews}`; sticky-bar effect lines verbatim; robots and canonical lines verbatim; `id="nf-piece"`, `"@type": "BreadcrumbList"`, no FAQPage; no `aria-label="Decrease quantity"`; variant-link lines verbatim; `handleBuyNow` lines; `nf-next` add/remove; `goBack`; back-to-close lines; `soldOut` line; `leadTime` line and the delivery sentence template; `<PincodeChecker preorder={isPreorder} />`; no "45 days" or "within 2 weeks" literal; sku spread; `clipText(` x3; `PairingCard` name: `<Link to={to} className="…min-h-[44px]…">` wrapping `<span className="…line-clamp-2…">{piece.name}</span>` with no padding or height on the span | any block is **moved into another file** (the anchors must stay in this file's text), reordered, the sold line is removed (its string is an anchor), the folds become Radix accordions or tabs, a fourth `<details className="group` appears, the badges array is renamed, or the pairing name markup changes shape. Editing class names elsewhere is safe |
| `src/pages/soldOutPageFirstPaint.test.tsx` | render | sold-out page: h1 by role with the name; `#product-actions button` texts equal `["Reserve now"]`; `#product-price` text matches price then MRP; `#product-actions` contains the lead-time gift sentence; JSON-LD OutOfStock; WhatsApp URL text; no add, no buy; one `ViewContent` | the h1 stops being an `<h1>` containing the name, the ids move, another `<button>` is put inside `#product-actions`, or the gift line leaves `#product-actions` |
| `src/pages/landmarks.test.ts` | source | exactly one `<main>` and `</main>` in the PDP, closed before `<Footer` | a second `<main>` or the footer moves inside |
| `src/components/jewellery/PdpOfferLadder.test.tsx` (227 lines) | render + source | rung text exactly `Buy 2` + `10% off` + `₹899 each` run together (for a ₹999 piece), and so on; legend "Applied in your bag · no code"; no links or buttons when the bag is empty; `data-state`; status sentences verbatim; "View bag" has `min-h-[44px]`; pre-order copy; `ul` has `grid-cols-3`; no `text-[Npx]` under 11; `min-[310px]:h-[22px]`, at least two `h-4`; rule inside the `li` with `bottom-0`, `pb-[3px]` on the rung, `pb-[4px]` on the box; every `transition` has a `motion-reduce` twin; no literal percentages or rupees in the file; the PDP file contains `document.querySelector("[data-offer-ladder] ul")` | the ladder's wording, structure, data attributes or these exact classes change. A new look for the offer means rewriting this test |
| `src/lib/radioGroup.test.tsx`, `RingSizeGuide.test.tsx`, `RingSizeGuideModal.test.tsx`, `ui/image-lightbox.test.tsx`, `product/PincodeChecker.test.tsx`, `CustomerReviews.test.tsx` | render | keyboard, focus and copy of those shared parts (for example "400001 in 3 working days · by …") | their copy or roles change |
| `src/contexts/wishlistEvent.test.tsx` | source | the PDP's `toggleItem({ … variantId: variant?.id ?? piece.variantId, amount: shown.price })` | the heart handler is rewritten |
| `src/hooks/useViewContent*.test.tsx`, `src/lib/viewContent.test.ts` | render | ViewContent timing and ids | not by styling |
| `src/components/CartDrawerNext.test.tsx` | render + source | `SimpleLadder`: `[data-ladder]` whose first child contains "Sitewide sale live today" and "up to 30% off", that `<p>` has `text-[10px]`; `[data-rung-label]` texts `["Buy 2 10% off", "Buy 3 20% off", "Buy 4 30% off"]` in a `grid-cols-3` parent; `[data-rung-mark]` lefts 16.67 / 50.00 / 83.33; fill widths; reached marks contain the class `bg-nf-ink`; `aria-valuenow`. `BagReturns`: text "Easy 7-day exchange & returns", href. Source: the `formatUnitPrice` line verbatim, no `maximumFractionDigits: 2` | the track is redesigned or removed, its line changes size or words, the reached mark stops using `bg-nf-ink`, or `SimpleLadder` / `BagReturns` stop being exports of this file |
| `src/components/bagBuy4.test.tsx` | render | `[data-total]`, `[data-you-save]` exact text ("You save ₹2,099 · 30% for 4 pieces"), `[data-line-price]` text ends "30% off" and equals `₹1,499₹1,049 each30% off`, `[data-line-total]`, `[data-line]`, `[data-rung-mark]`, `[data-ladder] [role="progressbar"] > span` width, `[data-ladder] > p` | those data attributes, their text order or the saving sentence change |
| `src/components/bagTrust.test.tsx` | render | `[data-bag-foot] [data-bag-trust]` exists and its **next sibling is `[data-checkout]`**; exactly one `[data-upi-badges]`, inside `[data-checkout]` | anything is put between the trust block and the button, or UPI discs appear elsewhere in the bag |
| `src/components/cart/BagTrust.test.tsx` | render | text "Rated 4.5/5 · Trusted by 5,000+ clients"; five `[data-star-fill]` = 1,1,1,1,0.5; stars `aria-hidden`; first child `[data-rating-line]`; `[data-pay-line]` with `[data-mark="visa"]`, `[data-mark="mastercard"]`, "Cards", "Cash on delivery"; no `button` or `a`; no `border-nf-ink` in its HTML | the trust block is reworded, reordered, boxed in ink or made pressable |
| `src/components/checkout/UpiBadges.test.tsx` | render | seven fills in order; three discs with `rounded-[50%]`; disc and mark sizes at size 20 | the shared discs are redrawn |
| `src/components/bagUndoPrice.test.tsx`, `checkoutTapEvents.test.tsx` | render | a button named "Undo"; `[data-checkout]` clicked once calls `checkout` once; no AddPaymentInfo | the Undo button or `data-checkout` goes |
| `src/lib/trust.test.ts`, `src/lib/promoQuantity.test.ts`, `cart/OfferProgress.test.tsx` | unit | the figures 4.5 and 5,000; promo maths; old ladder | not by styling |
| `src/components/Header.test.ts` | source | every page's `pt-[..] md:pt-[..] lg:pt-[..]` triple is within 8px of the header (111 / 122 / 136) | a new top offset in the PDP file is smaller |
| `src/test/tailwind-classes.test.ts` | source, whole `src` | no `duration-[…]`, `delay-[…]` or `ease-[…]` | a new file uses an arbitrary duration, delay or ease |
| `src/test/older-phones.test.ts` | source, whole `src` | no `.at(` | new code calls `.at()` |
| `src/lib/routeCode.test.ts`, `src/test/legacy-routes.test.ts`, `src/lib/chunkFailure.test.ts` | unit | the route name `JewelDetailNext` and the route table | the page file is renamed or a route is added without its `ROUTE_CODE` row |
| `src/components/AnnouncementBar.test.tsx` | render + source | the strip's lines and that index.css never stops or hides it on the PDP | out of scope |
| `giftbox/BagGiftRow.test.tsx` | render | the unused gift row | only if someone edits giftbox files |

Tests that only touch the unrouted `JewelDetail.tsx` / `CartDrawer.tsx` are not listed; leave those two files alone and they stay green.

## 7. Never-edit files, and a split for two engineers

### 7.1 Can the restyle avoid them?

| Never-edit | Needed for the restyle? | Why / the way round |
|---|---|---|
| `src/contexts/*` | No | the PDP and bag only call `useCart`, `useWishlist`, `useAuth` |
| `src/lib/shopify.ts` | No | no data changes |
| `src/lib/promo.ts` | No | read-only use of `QUANTITY_OFFERS`, `pieceAtRung`, `pdpOfferStatus`, `ladderHeadline`, `resolveCartDiscount` |
| `tailwind.config.ts` | No | Jost (`font-nf-label`), Cormorant Garamond (`font-nf-editorial`), every brand colour (`nf-sage` included, unused today), the tracking ladder and 0 radius are already there; arbitrary values (`text-[24px]`) need no config. A title in Jost is a class change on line 973 |
| `index.html` | No, with one cost | Jost 300/400/500 and Cormorant Garamond 400/500 are already requested. Cost: no Jost 600, and Jost arrives after first paint (4.1). A new face or weight cannot be added without it |
| global rules in `src/index.css` | No | no new global CSS: use Tailwind utilities, `tailwindcss-animate` (`animate-in fade-in-0 …`), existing `.press-scale`, `.heart-pop`, `.scrollbar-hide`. Existing PDP-only rules stay: `.nf-next` palette, press-logo blend, review stars gold, 10px announcement text, `--pdp-sticky-bar-h: 72px`. A shared component that must look different on the PDP gets a prop or variant, not a new `.nf-next` rule |
| `src/main.tsx`, `vite.config.ts`, `package.json`, `bun.lock` | No | no new dependency is needed: lucide icons, Radix dialog and `<details>` are already in use |

Also leave alone although not on the list: `src/App.tsx`, `src/pageCode.ts`, `src/lib/routeCode.ts` (route table, pinned), `components/ui/button.tsx` and `components/ui/sheet.tsx` (shared), `Header.tsx` / `Navbar.tsx` / `AnnouncementBar.tsx`, `pages/JewelDetail.tsx`, `components/CartDrawer.tsx`.
House rule from `CLAUDE.md`: no raw hex, `hsl()` or arbitrary `tracking-[…]` where a token exists; radius stays 0.
Preview: `/preview/jewellery/:handle` already renders the same component (noindex, canonical to the live page, `inPreview` at PDP 280). It is the same code as the live route, so it previews nothing new on its own once merged; a preview that is not live needs a branch build or a branch on `inPreview` / `isPreviewPath`. The bag has no preview flag.

### 7.2 Suggested split (no file touched by both)

| | Engineer A: the PDP | Engineer B: the bag |
|---|---|---|
| Owns | `src/pages/JewelDetailNext.tsx` and `JewelDetailNext.test.ts`; `components/jewellery/PdpOfferLadder.tsx` + test; new files in a new folder `src/components/pdp/` | `src/components/CartDrawerNext.tsx` and its tests (`CartDrawerNext.test.tsx`, `bagBuy4.test.tsx`, `bagTrust.test.tsx`, `bagUndoPrice.test.tsx`, `checkoutTapEvents.test.tsx`); `components/cart/BagTrust.tsx` + test; `components/cart/PayMarks.tsx`; new files in `src/components/cart/` under new names |
| PDP-only parts A may restyle in place | `jewellery/RingSizeGuide.tsx`, `jewellery/RingSizeGuideModal.tsx`, `jewellery/PressMarquee.tsx`, `FomoPopup.tsx` (`quiet` branch), `reels/ReelShopNext.tsx`, `reels/GalleryReel.tsx` | |
| Shared with other pages: add a prop or variant, default unchanged | `product/PincodeChecker.tsx` (apparel page), `CustomerReviews.tsx` (apparel page), `ui/image-lightbox.tsx` (apparel gallery), `Footer.tsx` (`slim` branch only) | none needed |
| Optional | | `giftbox/*` if the gift box returns to the bag (unused today, own test) |
| Frozen for both | `components/checkout/UpiBadges.tsx` (used by both; pass `size` and `className` only), `ui/button.tsx`, `ui/sheet.tsx`, everything in 7.1 | same |

Contracts across the split: A keeps `#product-actions`, `#product-price`, `[data-offer-ladder] ul`, `#customer-reviews`, `id="nf-piece"`. B keeps `data-ladder`, `data-rung-mark`, `data-rung-label`, `data-line`, `data-line-name`, `data-line-total`, `data-line-price`, `data-bag-list`, `data-bag-foot`, `data-total`, `data-you-save`, `data-next-rung`, `data-bag-trust`, `data-checkout`, `data-returns`, `data-undo`, `data-add-error`, `data-adding`, `data-piece-card`, and the trust block directly above the button. The bag carries `.nf-palette` and `font-nf-label` itself, so it does not depend on the PDP's `html.nf-next`. If the two want one shared piece (a product-name style, a hairline rule), agree the class string in the spec rather than a shared file.
