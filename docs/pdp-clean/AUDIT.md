# Naira PDP + bag: audit of TODAY's page (origin/main, dev server :5310)

Measured 20 Nov 2026 with Playwright (Chromium, deviceScaleFactor 1). Viewports: **360x640** (Instagram Android in-app user agent), **390x844** (iPhone), **1440x900**.
Pieces: `woven-gold-hoops` (plain), `cushion-halo-ring` (ring sized from the US list), `crystal-baguette-eternity-ring` (Shopify sizes), `star-point-band` (metal + size), `bougainvillea-vine-bracelet` (colour), `riviere-classique-necklace` (metal), `clover-trio-edit` (set), `first-light-set` (sold-out set), `serpentine-whisper-chain-silver` (longest name, 33 characters).
All paths below are under `/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/audit/`. `y` = px from the top of the page. Nothing was changed, added to a cart or sent to Shopify (0 mutations attempted; the bag was filled by seeding `localStorage["naira-shopify-cart"]` with `cartId: null`). Reviewer names are shown as "Reviewer" and the "bought" card's generated first name as "Name" in every screenshot and data file.

Limits: the dev server, not production. The "someone bought" card depends on load order (4.2). Tap sizes are element boxes; contrast is computed for text on flat colour only (text over photos is listed, not scored).

## 0. The twelve facts that matter

1. **Title** is `Velista` (the wordmark's face, capitals only), weight 600, 22px/24.2px on phones, 30px/33px on laptop, ink #1A1614. Eyebrow above it already exists: Jost 9.5px, caps, 0.24em, gold #80612A. Owner's reference = same eyebrow, mixed-case light sans title.
2. **Add to cart is off the first screen at 360x640 on every piece** (y761 to y1034; the screen ends at 640). At 390x844 it is on the first screen only for pieces with no picker (y760, 34px spare); any picker pushes it to y873-1064.
3. **Between price and Add to cart sit three persuasion blocks**: badges (26px, 57px when they wrap), sold-count band (32px), offer ladder (56px) = 114-145px plus 44px of gaps.
4. **The offer is said three times on the product page and twice more in the bag**: marquee, ladder, "2 pieces · 10% off" beside Complete the look; then the bag's ladder and its "You save" line. The first screen at 390 carries up to 7 percentage figures (40%, the ladder's 10/20/30, the marquee's 10/20/30 as it moves) and 5 rupee amounts.
5. **4 font families on the page**: Velista, Cormorant Garamond, Jost and the *device's system sans* (`ui-sans-serif`; body has no font set), which draws badges, struck price, GST note, rating, gift line, reviews. The bag is Jost throughout, so the two screens do not match.
6. **18 font sizes** on the phone page (9 to 27px), 13-15 in the first two screens; 26 of 90 text runs are under 11px.
7. **14 text colours** with the fold-downs closed (17 with them open); ink alone comes at 5 opacities closed (100/80/75/70/65) and 7 open (adds 90 and 85). Three golds (#80612A, #B0843A, #C99A4C). Three greens (#AEBDB6 marquee, #8EA9A1 footer, #4F7268 buttons); the brand sage #99B4AF is used by none of them. Four off-whites (#FBF3EC page, #F4EBE2, #F4F1ED nav bar, #F4EBE1).
8. **25 boxes and 16 rules** on the phone page; 16 boxes in the first two screens.
9. **Sticky bar** (65px) shows at load on 360x640 and covers the badge row; with the 111px header, 27.5% of a 640px screen is fixed chrome.
10. **"Someone bought" card** (236x46) appears about 6 s after load on most pieces (18 of 18 loads of two newer pieces; 1 of 7 of Woven Gold Hoops) and at 360x640 lands on the title and price. Names, cities and minutes are generated in code.
11. **Details fold-down opens to 1,018-1,048px** on phones (1.2 to 1.6 screens).
12. **Bag is already far calmer** (2 families, 9 boxes against the page's 25, one black button) but at 360x640 its fixed parts take 421 of 640px, leaving 219px (34%) for the pieces; it shows 13 font sizes and 8 ink opacities, and its rating (4.5/5) disagrees with the product page (4.9).

## 1. PDP inventory, top to bottom

### 1.1 Position of price and Add to cart (all pieces)

| piece | 360x640 price y / ATC y | 390x844 price y / ATC y | 1440x900 price y / ATC y | page height 360 / 390 / 1440 | screens 360 / 390 / 1440 |
|---|---|---|---|---|---|
| woven-gold-hoops (plain) | 553 / 761 | 583 / 760 | 248 / 428 | 3451 / 3501 / 2938 | 5.39 / 4.15 / 3.26 |
| clover-trio-edit (set) | 553 / 761 | 583 / 791 (4 badges, 2 rows) | 248 / 428 | 3451 / 3532 / 2938 | 5.39 / 4.18 / 3.26 |
| serpentine-whisper-chain-silver (33 chars) | 577 / 785 | 607 / 815 (button cut by the fold: ends 865) | 248 / 428 | 3475 / 3556 / 2938 | 5.43 / 4.21 / 3.26 |
| riviere-classique-necklace (metal) | 553 / 843 | 583 / 873 | 248 / 510 | 3533 / 3614 / 3020 | 5.52 / 4.28 / 3.36 |
| bougainvillea-vine-bracelet (colour, opens on the sold-out colour) | 553 / 888 | 583 / 918 | 248 / 536 | 3578 / 3659 / 3047 | 5.59 / 4.34 / 3.39 |
| cushion-halo-ring (US list) | 553 / 970 | 583 / 1000 | 248 / 566 | 3659 / 3741 / 3076 | 5.72 / 4.43 / 3.42 |
| crystal-baguette-eternity-ring (sizes) | 577 / 976 | 583 / 982 | 248 / 566 | 3665 / 3722 / 3076 | 5.73 / 4.41 / 3.42 |
| star-point-band (metal + size) | 553 / 1034 | 583 / 1064 | 248 / 648 | 3723 / 3804 / 3159 | 5.82 / 4.51 / 3.51 |
| first-light-set (sold out, Reserve now) | 553 / 693 | 583 / 723 | 248 / 360 | 3400 / 3464 / 2870 | 5.31 / 4.10 / 3.19 |

Add to cart is 50px tall. First screen ends at 640 / 844 / 900. So: **360x640: never on the first screen. 390x844: on it for 3 of 9 pieces. 1440x900: always.**

### 1.2 Woven Gold Hoops, element by element (y / height in px)

| element | 360x640 | 390x844 | 1440x900 | from price top (390), + = below | from ATC top (390), + = below |
|---|---|---|---|---|---|
| Announcement marquee (fixed, sage, 4 rotating lines) | 0 / 34 | 0 / 34 | 0 / 40 | | |
| Nav bar (fixed; menu, search, wordmark, account, wishlist, bag) | 34 / 77 | 34 / 77 | 40 / 96 | | |
| Breadcrumb + Back (laptop only) | | | 136 / 17 | | |
| Gallery (phone: 1 square photo, swipe, "1 / 8", "▶ Video", back, heart) | 107 / 360 | 107 / 390 | 165 / 744 (2x2 grid, 336x370 each, "+3 photos") | | |
| Eyebrow "EARRINGS" + "★ 4.9 50 reviews" | 487 / 24 | 517 / 24 | 173 / 24 | -66 | -243 |
| Title h1 | 519 / 24 | 549 / 24 | 205 / 33 | -34 | -211 |
| Price row: ₹1,049, ₹1,749 struck, "40% OFF", "incl. 3% GST" | 553 / 19 | 583 / 19 | 248 / 22 | 0 | -177 |
| Badges (3 chips; 4 when the piece has a stone) | 586 / **57** (2 rows) | 616 / 26 | 284 / 26 | +33 | -144 |
| Sold-count band "6 pieces sold in the last 48 hours" | 653 / 32 | 652 / 32 | 320 / 32 | +69 | -108 |
| Offer ladder (Buy 2 / 3 / 4) | 697 / 56 | 696 / 56 | 364 / 56 | +113 | -64 |
| Buy Now + Add to cart (two halves, 50px) | 761 / 50 | 760 / 50 | 428 / 50 | +177 | 0 |
| Gift line | 823 / 17 | 822 / 17 | 490 / 17 | +239 | +62 |
| Fold-downs: Details, Care, Delivery & returns (3 x 51) | 873 / 153 | 872 / 153 | 540 / 153 | +289 | +112 |
| Complete the look (3 cards + "2 pieces · 10% off") | 1066 / 249 | 1065 / 259 | 733 / 333 | +482 | +305 |
| Customer reviews (1 quote, photos, View more, Write a review) | 1364 / 539 | 1373 / 539 | 1114 / 522 | +790 | +613 |
| As featured in (logo marquee) | 1903 / 161 | 1912 / 161 | 1636 / 177 | | |
| Shop the reel (phone only; video + "In this reel" cards) | 2105 / 713 | 2114 / 741 | none | | |
| More earrings (8 cards; phone: sideways scroll) | 2859 / 332 | 2896 / 345 | 1813 / 913 (4 x 2 grid) | | |
| Footer (sage) | 3191 / 260 | 3241 / 260 | 2726 / 212 | | |
| Sticky buy bar (phone, fixed bottom: heart 48, Buy Now, Add to cart 48) | 575 / 65 | 779 / 65 | none | | |

Gaps in the buy box (390): eyebrow→title 8, title→price 10, price→badges 14, badges→sold 10, sold→ladder 12, ladder→buttons 8, buttons→gift 12, gift→folds 33, folds→look 40.

### 1.3 What the first screen holds

- **360x640**: header 111px (17.3%), photo 360px (56.3%), eyebrow, title, price (ends y572), then the sticky bar from y575 (65px, 10.2%). The badge row (y586-643) is under the bar. Sold count, ladder, Add to cart and gift line are on screen 2. Between photo and bar the product gets 108px, 17% of the screen.
- **390x844**: header 111px (13.2%), photo 390px (46.2%), then the whole buy box down to the gift line (ends y839, 5px spare). No sticky bar at load. 36 text runs, 11 font sizes, 9 text colours, 8 boxes, 16 icons, 11 all-caps labels on this one screen.
- **1440x900**: header 136px (15.1%), breadcrumb, 4 photos (676x744), buy box (y173-507), the three fold-downs and the top of Complete the look. 58 text runs, 28 all-caps labels.

Strips (one screenshot per screen): `strips/<handle>-<p360|p390|d1440>-strip.png` for all 9 pieces; single screens in `shots/`.

## 2. Clutter counts (Woven Gold Hoops; other pieces in `data/analysis/summary.md`)

| scope | text runs | families | sizes | weights | trackings | text colours | boxes | rules | icons | all-caps | under 11px | tappable |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 360x640 screen 1 | 17 | 3 | 8 | 3 | 6 | 8 | 8 | 1 | 15 | 6 | 9 | 14 |
| 360x640 screens 1-2 | 52 | 4 | 13 | 4 | 6 | 10 | 16 | 6 | 23 | 20 | 17 | 28 |
| 360x640 whole page | 90 | 4 | 18 | 4 | 9 | 14 | 25 | 16 | 34 | 31 | 26 | 56 |
| 390x844 screen 1 | 36 | 4 | 11 | 4 | 6 | 9 | 8 | 4 | 16 | 11 | 10 | 13 |
| 390x844 screens 1-2 | 60 | 4 | 15 | 4 | 8 | 11 | 16 | 7 | 28 | 22 | 20 | 29 |
| 390x844 whole page | 90 | 4 | 18 | 4 | 9 | 14 | 25 | 16 | 35 | 31 | 26 | 57 |
| 1440x900 screen 1 | 58 | 4 | 13 | 4 | 7 | 9 | 8 | 5 | 18 | 28 | 20 | 28 |
| 1440x900 screens 1-2 | 78 | 4 | 16 | 4 | 9 | 11 | 16 | 8 | 25 | 36 | 27 | 41 |
| 1440x900 whole page | 101 | 4 | 17 | 4 | 9 | 14 | 16 | 9 | 26 | 36 | 27 | 62 |
| star-point-band 390x844 screens 1-2 (worst) | 69 | 4 | 14 | 4 | 6 | 11 | 26 | 7 | 24 | 24 | 24 | 36 |

Closed fold-downs are not counted. "Boxes" = elements with a border on 3+ sides; "rules" = hairlines.

**Families (390, screens 1-2):** Jost x26 (eyebrow, labels, buttons, fold titles, ladder labels); system sans `ui-sans-serif` x21 (marquee, rating, struck price, GST, badges, ladder prices, gift line, card prices); Velista x10 (title, price, sold numeral, card names, section heads); Cormorant Garamond x3 (ladder 10% / 20% / 30%).
**Sizes px (390, screens 1-2):** 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 13.5, 15, 18, 19, 22, 23, 27. Whole page adds 14, 17, 26. Half-pixel steps: 9.5, 10.5, 11.5, 13.5.
**Weights:** 400 x35, 500 x20, 600 x4, 300 x1 (the sold-count caps). **Italic:** sold numeral, review quote, footer line.
**Letter-spacing (em):** 0, 0.04, 0.08, 0.12, 0.14, 0.16, 0.18, 0.24 (9 values over the page, with 0.1).
**All-caps labels (22 in screens 1-2 at 390):** marquee, ▶ Video, Earrings, 40% off, pieces sold in the last 48 hours, Applied in your bag · no code, Buy 2, Buy 3, Buy 4, Buy Now, Add to cart, Details, Care, Delivery & returns, 2 pieces · 10% off, Add x2, Choose size, Kind words, Verified buyer. Plus Velista itself is capitals only: title, price, card names, "Complete the look", "Customer reviews".

**Text colours and where (390, whole page):**
`#1A1614` ink (title, price, buttons, fold titles, rating number) · `@90` (spec values, only inside Details) · `@85` (paragraphs inside Details and Care) · `@80` (badges, gift line) · `@75` (review count, card prices) · `@70` ("off", counters) · `@65` (struck MRP, "incl. 3% GST", "each") · `#80612A` gold text (eyebrow, 40% off, sold numeral, ladder legend and labels, "2 pieces · 10% off", spec labels) · `#B0843A` (the rating star) · `#4F7268` green (Add, Choose size, Verified buyer) · `#6B625B` warm grey (Kind words, review quote, View more reviews) · `#FFFFFF` (marquee) · `#FBF3EC` (Add to cart label) · `#F6F3EE` at 100/78/60% (footer).
**Border colours:** `#C99A4C@30` (badges, sold band) · `#C99A4C@15` (fold-down rules, sticky bar) · `#C99A4C@20/@25` (cards) · `#B0843A@45` (ladder box) · `#B0843A@25` (ladder dividers) · `#1A1614` (Buy Now, Write a review) · `#1A1614@40` (Buy Now in the bar) · `#1A1614@25` (heart in the bar) · `#4F7268` (Add buttons) · `#E3D9CE` (review rules). 15 border colours in all.
**Fills:** `#FBF3EC` page · `#F4EBE2` photo ground · `#F4EBE2@70` (badges, sold band) · `#FFBDA8@35` peach (badge icon tiles) · `#F4F1ED` nav bar · `#AEBDB6` marquee · `#8EA9A1` footer · `#1A1614` Add to cart · `#FBF3EC@75/@85/@95` (photo chips, sticky bar) · `#F4EBE1` (review avatar).
**Icons on screen 1 (390): 16 SVGs.** Menu, search, wordmark, account, wishlist, bag, back arrow, heart, 3 badge icons, sold-count star, 3 payment discs inside Buy Now, gift; plus the ★ and ▶ glyphs.
**Badges:** 3 (4 with "Zircone Stone"); chip 26px tall, 10px text at 360, 10.5px at 390+.

**Competing messages before Add to cart (390, in reading order): 10.** (1) marquee: Buy 2 / 3 / 4 offer, then "Sitewide sale live today!", "Free insured shipping", "Made in limited batches", moving; (2) "▶ Video" chip and "1 / 8"; (3) ★ 4.9 · 50 reviews; (4) "40% OFF"; (5) "incl. 3% GST"; (6) three badges; (7) sold count; (8) "Applied in your bag · no code"; (9) three offer rungs with three per-piece prices; (10) GPay / PhonePe / Paytm discs in Buy Now. After the button: gift line. Over all of it, about 6 s in: the "bought" card.

### 2.1 The ten worst offenders (PDP)

Sheet of all ten: `crops/_pdp-worst-ten-sheet.png`.

| # | offender | measured | crop |
|---|---|---|---|
| 1 | **Title in Velista capitals** | 22px/600 phone, 30px/600 laptop, capitals only (the face draws every letter as a capital); same face again for the price (19px/600) and the sold numeral, so the title does not stand apart. 30+ characters wrap to 2 lines at 360 (48px) and 33 characters wrap at 390. | `crops/title-p390.png`, `crops/title-p360.png`, `crops/title-d1440.png`, `crops/title-long-serpentine-whisper-chain-silver-p390.png` |
| 2 | **Offer ladder** | 358x56 gold box (#B0843A@45), legend sitting on the top border, 3 columns with 2 gold dividers, 5 text styles in 56px (11px gold caps, 23px Cormorant, 11.5px "off", 13.5px system sans price, 11.5px "each"), 16 text runs. Repeats the marquee. | `crops/ladder-p390.png` |
| 3 | **Badges** | Each chip = gold border + tinted fill + 18px peach tile + 11px icon + 10-10.5px text (4 layers for 2 words). 3 chips = 341px of a 358px row at 390; wrap to 2 rows (57px) at 360 and whenever there are 4. | `crops/badges-p390.png`, `crops/badges-p360.png` |
| 4 | **Sold-count band** | 358x32 band, tinted fill, 2 gold rules, star, italic Velista numeral 15px, Jost 300 caps 10.5px, and a stray 1x8px tick at the right end. 4 type styles in one line. | `crops/sold-p390.png` |
| 5 | **Fixed header + marquee** | 111px on phones (17.3% of 640), 136px on laptop. Marquee: moving, 10px white on #AEBDB6 = 1.95:1. Nav bar ground #F4F1ED differs from the page's #FBF3EC. | `crops/header-p390.png`, `crops/header-d1440.png` |
| 6 | **Two equal buttons, twice** | Buy Now (outline, 3 colour logos) and Add to cart (black) share the row 175/175px at 390, 160/160 at 360; the same pair returns in the sticky bar with a heart. Buy Now is first (left). | `crops/buttons-p390.png`, `crops/sticky-bar-p390.png` |
| 7 | **Sticky bar over content at 360x640** | Shows at load, 65px (10.2%), hides 54px of the badge row; price ends 3px above it. Flickers on rings: on at 0, off at 140, on at 180, off at 410, on at 1020. | `crops/sticky-covers-badges-p360.png`, `crops/first-screen-woven-gold-hoops-p360.png` |
| 8 | **"Someone bought" card** | 236x46, about 6 s after load, 2.0-2.2 s long, every 60 s. At 360x640 it sits at y510 on the title and price; at 390x844 on the sold count and ladder when the bar is up. | `crops/popup-over-title-p360.png`, `crops/popup-over-offer-p390.png`, `crops/popup-over-photo-p390.png` |
| 9 | **Pickers** | Label row + chips + helper sentence; sold-out values carry a second line "PRE-ORDER" (chip 92x44 against 68x44). Metal + size = 242px before the button. Cushion Halo Ring shows 5 sizes (189px) although every size says "ships now, adjustable to fit US 5 to 9". | `crops/picker-star-point-band-p390.png`, `crops/size-picker-cushion-halo-ring-p390.png` |
| 10 | **Complete the look** | Third button style on the page: green outline (#4F7268) "ADD" / "CHOOSE SIZE", 10px caps, plus a third statement of the offer ("2 pieces · 10% off"), card names in Velista capitals on 2 lines. | `crops/complete-the-look-p390.png` |

Close behind: the Details fold-down at 1,048px (see 3.5); 9.5-10px fold-down titles; the reviews block (539px for one quote, set in italic capitals).

## 3. Crops

### 3.1 Title
| viewport | piece | face / size / weight / line-height | box | lines |
|---|---|---|---|---|
| 360 | Woven Gold Hoops (16 chars) | Velista 22 / 600 / 24.2 | 328x24 | 1 |
| 360 | Crystal Baguette Eternity Ring (30) | same | 328x48 | 2 |
| 360 | Serpentine Whisper Chain — Silver (33) | same | 328x48 | 2 |
| 390 | Woven Gold Hoops | same | 358x24 | 1 |
| 390 | Crystal Baguette Eternity Ring (30) | same | 358x24 | 1 |
| 390 | Serpentine Whisper Chain — Silver (33) | same | 358x48 | 2 |
| 1440 | any (to 33 chars) | Velista 30 / 600 / 33 | 580x33 | 1 |

Eyebrow: Jost 9.5px, 400, caps, 2.28px (0.24em) tracking, #80612A, 5.2:1. Rating: "★ 4.9 50 reviews", system sans 11.5px, link box 105x44, star #B0843A.
Files: `crops/title-{p360,p390,d1440}.png`, `crops/title-long-{serpentine-whisper-chain-silver,crystal-baguette-eternity-ring,petite-pear-solitaire-necklace}-{p360,p390,d1440}.png`. Owner's reference: `../owner-title-screenshot.png`.
Price row: ₹1,049 Velista 19px/600 (22px laptop) · ₹1,749 system sans 12px, ink@65, struck · "40% OFF" Jost 10.5px/500 caps gold · "incl. 3% GST" system sans 10.5px ink@65. Four styles in one 19px row.

### 3.2 Badges (`crops/badges-*.png`)
"Anti-tarnish" 93x26, "Skin-friendly" 99x26, "PVD 18K gold coated" 139x26 (390). Text system sans 10.5px (10px at 360), ink@80. Border #C99A4C@30, fill #F4EBE2@70, icon tile 18x18 #FFBDA8@35, icon 11px gold. Not tappable. A fourth, "Zircone Stone", appears on stone pieces and forces a second row at 390 (57px).

### 3.3 Sold count (`crops/sold-*.png`)
"6 PIECES SOLD IN THE LAST 48 HOURS": 358x32, centred. Numeral Velista italic 15px gold; label Jost 300, 10.5px, caps, 0.08em. Values seen: 3, 5, 6. Shown on the sold-out set too ("3 pieces sold in the last 48 hours" above "Reserve now").

### 3.4 Offer ladder (`crops/ladder-*.png`)
358x56 (580x56 laptop). Legend "APPLIED IN YOUR BAG · NO CODE" (Jost 11px/500 caps gold). Rungs: Buy 2 10% off ₹944 each · Buy 3 20% off ₹839 each · Buy 4 30% off ₹734 each. On a pre-order choice the legend becomes "NOT ON PRE-ORDERS" and the prices become "In-stock pieces only"; on a sold-out piece the ladder is gone.

### 3.5 Buttons (`crops/buttons-*.png`, `crops/sticky-bar-*.png`)
In page: Buy Now 175x50 (outline #1A1614, 3 payment discs 16px) left; Add to cart 175x50 (fill #1A1614, text #FBF3EC) right; 8px gap; Jost 11.5px/500, caps, 0.08em. Laptop 286x50 each. Gift line under them: system sans 11.5px, ink@80, gift icon 14px.
Sticky bar: heart 48x48 (border ink@25), Buy Now 152x48 (137 at 360, border ink@40), Add to cart 150x48 (135 at 360), 11px labels; ground #FBF3EC@95 with blur, top rule #C99A4C@15.

### 3.6 Fold-downs, open (titles: Jost 10px caps 0.16em, row 358x50, "+" 14px)
| fold-down | open height 360 / 390 / 1440 | words | contents |
|---|---|---|---|
| Details | 1,018 / 1,048 / 966 px | 155 | 1 paragraph (7 lines at 390); table of 8 rows: Style, Size, Surface, Stones, Sold as, Plating, Material, PVD vs plating (labels 9.5px gold caps; the last row is a 5-line paragraph); a square size-guide photo (358px); an italic styling note with a gold side rule |
| Care | 309 / 265 / 199 px | 102 | 3 paragraphs: waterproof and care; "Will it tarnish?"; "Sensitive skin?" |
| Delivery & returns | 273 / 273 / 251 px | 33 + form | 2 lines of text, "read the policy" link, pincode box (input + black CHECK), "Questions? Chat with us on WhatsApp" link |
| Delivery, after pincode 400001 | 409 / 391 / 352 px | | adds "Delivery to 400001 in 3 working days · by Wed, 25 Nov" and "Cash on Delivery available · UPI, cards, wallets and net banking accepted" |

All three open at once = 1,600px (360) / 1,586px (390) = 2.5 / 1.9 screens. Files: `crops/fold-1-details-{1,2,3}-*.png`, `crops/fold-2-care-*.png`, `crops/fold-3-delivery-returns-*.png`, `crops/pincode-400001-*.png`.
Ring size guide ("Size guide" link): bottom sheet 360x563 (scrolls 1,203px) at 360; 390x743 (1,127px) at 390; centred 560x792 dialog (1,029px) on laptop. 293 words, 6-row table, 2 Velista headings (21 and 22px). `crops/size-guide-*.png`.

## 4. States

### 4.1 Pickers and pre-order
| state | what shows | height (phone) | button | crop |
|---|---|---|---|---|
| Ring from the US list (cushion-halo-ring) | "RING SIZE · US" + Size guide; chips 5 6 7 8 9 (68x44, selected = green fill #4F7268); line "US 6 ships now. Open-back design — adjustable to fit US 5 to 9 comfortably." All 5 sizes say "ships now". | 189 (118 laptop) | Add to cart + Buy Now | `crops/size-picker-cushion-halo-ring-*.png`, `crops/buybox-cushion-halo-ring-*.png` |
| Shopify sizes (crystal-baguette-eternity-ring) | "SIZE · US 6"; 5 chips, 8 and 9 marked PRE-ORDER (92x44) | 144 + status line | in stock: both buttons; 8 or 9: one "RESERVE NOW" | `crops/picker-crystal-baguette-eternity-ring-*.png`, `crops/preorder-crystal-baguette-eternity-ring-*.png` |
| Colour (bougainvillea-vine-bracelet) | "COLOUR Fuchsia"; chips Fuchsia PRE-ORDER, Violet, White | 62 + 37px sold-out sentence | **opens on Fuchsia, which is sold out: "RESERVE NOW" on arrival** (every load but one of those measured); first photo is the White one by its alt text | `crops/buybox-bougainvillea-vine-bracelet-*.png` |
| Metal (riviere-classique-necklace) | "METAL Gold"; chips with a 12px colour square: Silver PRE-ORDER, Gold | 62 | Gold: both buttons; Silver: Reserve now. Opens on Gold, first photo is the Silver one by its alt text | `crops/picker-riviere-classique-necklace-*.png` |
| Metal + size (star-point-band) | two groups; sizes 5, 7, 9 marked PRE-ORDER | 62 + 144 + line = 242 | in stock: both; pre-order: Reserve now | `crops/picker-star-point-band-*.png`, `crops/preorder-star-point-band-*.png` |
| Pre-order choice (any) | ladder legend "NOT ON PRE-ORDERS", prices replaced by "In-stock pieces only"; sentence "… is sold out for now. Reserve it and we will confirm the date on WhatsApp."; gift line unchanged | button drops 18-45px | one full-width black "RESERVE NOW" 358x50 | `crops/preorder-*.png` |
| Sold out (first-light-set) | no ladder, no pickers; sold-count band stays; line "Hand-finished for you and shipped within 2 weeks, gift-boxed"; eyebrow reads "NECKLACES" on a set | button at y723 (390) | one "RESERVE NOW" | `crops/soldout-first-light-set-*.png`, `crops/soldout-first-screen-*.png` |

No `<select>` dropdown is used for any option; every option is a row of chips. Chips: system sans 12px, border ink@25, 44px tall; selected = fill #4F7268 with ivory text; "PRE-ORDER" 9px caps on a second line; metal chips carry a 12px colour square.

### 4.2 Sticky bar and pop-ups
| | 360x640 | 390x844 |
|---|---|---|
| Bar size | 360x65, y575-640 (10.2% of the screen) | 390x65, y779-844 (7.7%) |
| Plain piece | on at load; off from scroll 140 to 810 (while the in-page buttons show); on from 820 to the end | off at load; on from scroll 820 |
| Ring | on at load, off at 140, on at 180, off at 410, on from 1020 | on at load (4px over the ladder box), off at 240, on from 1050 |
| Covers at load | badge row, 54px (plain and ring) | plain: nothing; ring: bottom 4px of the ladder |
| With the header | 176px fixed = 27.5% | 176px = 20.9% |

Rule in code: the bar shows when Add to cart is not fully on screen, unless it would cover the price or the offer rungs.

"Someone bought" card (`FomoPopup`, quiet style): 236x46, gold hairline box, 36px photo, 2 lines (11px "name, city · n min ago", 13px Velista "bought the …"), 32x32 dismiss. First seen 5.8-6.7 s after navigation, shown 1.9-2.2 s, next one 60 s later. Position: phone, bar hidden → fixed at y166 over the photo; phone, bar up → 12px above the bar (y510 at 360x640 = over title and price; y714 at 390x844 = over sold count and ladder); laptop → bottom left (24, 830) over the gallery. Seen on 18 of 18 loads of two pieces outside the 23 built into the code (Bougainvillea Vine Bracelet, Clover Drop Earrings; 3 viewports, 3 rounds) and on 1 of 7 loads of Woven Gold Hoops, which is built in (there it came later, about 9.5 s). Likely cause, read from the component: its timer is cleared when the live catalogue replaces the built-in list and is not restarted. Several state crops (`crops/preorder-*`, `crops/buybox-riviere-classique-necklace-p390.png`) caught the card lying across the title. Buyer name, city and minutes are picked at random from lists in the component, not from orders. `crops/popup-screen-*.png`.
No other pop-up, modal, cookie bar or chat bubble appeared in 24 s on any viewport. Laptop has a fixed scroll rail at the right edge (34x378, x1386, petal + percentage): `crops/scroll-rail-d1440.png`.

## 5. Laptop, 1440x900

- Page container 1400px, 20px outer margin, 24px padding: content runs x44 to x1396.
- **Left column** x44-720 (676px, 47% of the window): 2x2 photo grid, each 336x370, 4px gaps, 744px tall, 4 of 8 photos, "+3 photos" chip. Sticky at top 140, height = window - 156.
- **Buy column** x720-1396 (676px) with 48px side padding: **content 580px wide** (x768-1348, 40% of the window). 92px from its right edge to the window edge.
- Buy column is 902px tall (y165-1067); the gallery is 744px. **Sticky travel is 158px**, so the pinned gallery is barely felt.
- The buy box itself (eyebrow to gift line) is 580x334px: 15% of the first screen. Buttons 286x50 each.
- Below the two columns everything is full width: reviews (container 1200px, 522px tall: one quote ending near x817, the rating at x1310, about 430px empty between them), logo marquee 177px, "More earrings" 4x2 grid 913px, footer 212px. No reel section on laptop. Total 2,938px = 3.26 screens.
- Header 136px fixed (15.1%); nav links are Velista capitals 14px, 14-21px tall.
- First screen: 58 text runs, 28 all-caps labels, 13 font sizes. Screens: `shots/woven-gold-hoops-d1440-0{0..3}.png`; 2x2 sheet `before/pdp-1440x900-strip-2x2.png`.

## 6. The bag

Phone: full-screen sheet. Laptop: right drawer 420x900 over a dimmed page. Font Jost throughout, "Your bag" in Cormorant Garamond 20px/500. Ground #FBF3EC.

### 6.1 Inventory, top to bottom (y / height)
| part | 360x640 | 390x844 | 1440x900 | contents |
|---|---|---|---|---|
| Header | 0 / 55 | 0 / 55 | 0 / 51 | back chevron 44x44 (phone) or X 44x44 (laptop), "Your bag", "3 PIECES" 9.5px caps |
| Offer band (only with pieces) | 55 / 107 | 55 / 107 | 51 / 107 | "✦ SITEWIDE SALE LIVE TODAY · UP TO 30% OFF" 10px caps ink@60; track with 3 square 16px nodes (filled black when reached); "Buy 2 / 10% off", "Buy 3 / 20% off", "Buy 4 / 30% off" |
| List (scrolls) | 162 / **219** | 162 / 423 | 158 / 483 | one row per piece |
| Row | 118 (no option) / 138 (option line) | same | 142 / 162 | photo 64x80 (72x90 laptop); name 13.5px/500; line total 14px/500; option 12px ink@60; struck price 12px ink@50, price 13.5px/500, "20% off" 11px gold; stepper 98x32 (border ink@40); remove X 44x44 ("Remove" word on laptop) |
| Foot (fixed) | 381 / 259 | 585 / 259 | 641 / 259 | Total row 26; saving or next-rung line 19; "Incl. 3% GST. Free insured shipping · arrives 25–27 Nov." 19; trust block 44 (stars + "Rated 4.5/5 · Trusted by 5,000+ clients" between hairlines; Visa, Mastercard, "Cards", cash icon, "Cash on delivery"); **Checkout 52** (319 / 349 / 379 wide, 15px/500, 3 payment discs); "Easy 7-day exchange & returns" link 44 |
| Empty bag | 55 / 585 | 55 / 789 | 51 / 849 | "Your bag is empty" Cormorant 20px; "MOST LOVED" 9.5px gold caps; 2 cards 341x59 (gold hairline, photo 36x45, name · price 12.5px, black-outline ADD 53x44); "EXPLORE JEWELLERY" green underlined caps link 152x44 |

Share of the screen with pieces in the bag: **360x640: header 8.6%, offer band 16.7%, list 34.2%, foot 40.5%. 390x844: 6.5%, 12.7%, 50.1%, 30.7%.**

### 6.2 Scroll length
| pieces | 360x640 | 390x844 | 1440x900 |
|---|---|---|---|
| 0 | none | none | none |
| 1 | none (row 118 in a 219 window) | none | none |
| 3 | list content 411px in a 219px window = 1.9 windows; **1.6 rows visible; the bag opens scrolled 192px, to the last row, so the first piece is out of sight** | exact fit, 394px of rows in 423px; a 4th piece scrolls | fits (483px) |

### 6.3 Counts (3 pieces)
| viewport | text runs | families | sizes | weights | trackings | text colours | boxes | rules | border colours | icons | all-caps | under 11px | tappable |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 360x640 | 40 | 2 | 13 | 2 | 5 | 10 | 9 | 6 | 4 | 27 | 3 | 6 | 18 |
| 390x844 | 40 | 2 | 13 | 2 | 5 | 10 | 9 | 8 | 5 | 27 | 3 | 6 | 18 |
| 1440x900 | 44 | 2 | 15 | 2 | 5 | 10 | 9 | 8 | 5 | 27 | 3 | 6 | 18 |
| 390, 1 piece | 24 | 2 | 13 | 2 | 5 | 9 | 7 | 6 | 5 | 21 | 3 | 6 | 8 |
| 390, empty | 10 | 2 | 5 | 2 | 2 | 3 | 4 | 2 | 3 | 1 | 4 | 3 | 8 |

Sizes px: 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 15, 17, 20. Weights 400 and 500 only.
Text colours: ink at 100 / 80 / 75 / 70 / 65 / 60 / 50 / 30% (8 steps), gold #80612A, ivory on the button; green #4F7268 only on "Explore jewellery" in the empty bag.
Borders: ink at 100 / 40 / 20 / 15 / 10%; gold #C99A4C@20 only on the empty-bag cards. Fills: ivory, #F4EBE2 photo ground, white ladder nodes (#FFFFFF, the only pure white), black button and nodes.
Icons 27: chevron, 9 in steppers and removes, 10 star shapes, Visa, Mastercard, cash, 3 payment discs, returns arrow.
Badges: none. Messages: 9 (sale line; ladder; "20% off" on each row; You save ₹539 · 20% for 3 pieces; GST + shipping + arrival; rating + clients; cards + COD; payment discs; returns).

### 6.4 What competes with Checkout
- In the 108px above it: 5 gold stars and the rating between two hairlines, the Visa and Mastercard marks (the only blue, red and orange on the screen), a cash icon.
- Inside it: 3 coloured payment discs right of the word.
- 1px under it: a 44px returns link.
- Other solid black: the reached ladder nodes (2 x 16px squares) and the 2px track. Empty bag: two black-outline ADD buttons and no checkout.
- The button is the only filled rectangle and the widest element: 349x52 at 390. It is not lost; it is crowded from above.

### 6.5 The ten worst offenders (bag). Sheet: `crops/_bag-worst-ten-sheet.png`
| # | offender | measured | crop |
|---|---|---|---|
| 1 | Offer band | 107px (16.7% of a 640 screen), 8 text runs, a track and 3 boxes to say what the "You save" line says again 420px lower | `crops/bag-ladder-p390.png` |
| 2 | Foot height | 259px fixed, 6 rows, 40.5% of 360x640 | `crops/bag-foot-p390.png` |
| 3 | List window at 360x640 | 219px, 1.6 rows, opens on the last row | `crops/bag-list-window-p360.png`, `crops/bag-3-screen-p360.png` |
| 4 | Trust block above the button | stars + rating + clients + 2 card marks + cash icon in 44px; "4.5/5" here, "4.9" on the product page | `crops/bag-trust-p390.png` |
| 5 | Three prices per row | line total (₹800), struck MRP (₹999), unit price (₹800 again), "20% off": the same figure twice | `crops/bag-line-p390.png` |
| 6 | Payment marks | 6 around one button: Visa, Mastercard, cash above; 3 discs inside | `crops/bag-checkout-p390.png` |
| 7 | 13 font sizes, 8 ink opacities | in one 390px-wide drawer | `before/bag-3-pieces-390x844.png` |
| 8 | Stepper + separate X | boxed 98x32 stepper (ink@40) and a 14px X at the far right at ink@60; two ways to remove (the minus at 1 also removes) | `crops/bag-stepper-p390.png` |
| 9 | Header count | "3 PIECES" 9.5px caps beside a 20px serif title; the band below repeats the count as filled nodes | `crops/bag-header-p390.png` |
| 10 | Empty bag | 2 gold-bordered cards with black ADD buttons and a green caps link: the only gold boxes and the only green in the bag | `crops/bag-empty-p390.png` |

Screens: `shots/bag-{0,1,3}-{p360,p390,d1440}-00.png`; strips in `strips/bag-*`.

## 7. Tap targets under 44px, contrast failures, text under 11px

### 7.1 Tap targets (box smaller than 44px on a side)
| where | element | size | note |
|---|---|---|---|
| PDP phone | marquee (whole strip is one link) | 360x34, 390x34 | fixed, top edge |
| PDP phone | product names under the reel | 118-141 x 19, 2 to 3 of them | the "Add" beside each is 44 |
| PDP phone | "read the policy" (inside Delivery & returns) | text line about 17px tall | inline link |
| PDP, all | dismiss X on the "bought" card | 32x32 | card lasts about 2 s |
| PDP laptop | breadcrumb Home 33x17, Jewellery 54x17, Back 56x17; nav links 14-21px tall; marquee 1440x40 | | pointer device |
| Bag | steppers − and + | 32x32 drawn | hit area widened to 44 by a pseudo-element |
| Bag | piece name links | 111-211 x 19 | the photo (64x80) is a link too |

Count: PDP 3 of 56 (360), 3 of 57 (390), 4 of 67 on star-point-band, 9 of 62 (1440). Bag: 9 of 18 by box, 3 after the widened steppers.
At or above 44: back, heart, rating link (105x44), size and colour chips (68-92x44), Buy Now / Add to cart (50), fold-down rows (50), bar buttons (48), Add (44), bag remove (44), Checkout (52).

### 7.2 Contrast failures (WCAG AA 4.5:1 for small text; computed)
| text | colour on ground | ratio | size |
|---|---|---|---|
| Marquee (all 4 lines) | #FFFFFF on #AEBDB6 | **1.95:1** | 10px/500 |
| Footer © line | #F6F3EE@60 on #8EA9A1 | 1.68:1 | 12px |
| Footer Returns, Privacy, Terms, tagline | #F6F3EE@78 on #8EA9A1 | 1.94:1 | 14px |
| Footer Contact us | #F6F3EE on #8EA9A1 | 2.27:1 | 14px |
| Rating star | #B0843A on #FBF3EC | 3.08:1 | 11.5px |
| Bag: struck prices | #1A1614@50 on #FBF3EC | 3.34:1 | 12px |
| Bag: "·" between Cards and COD | #1A1614@30 | 1.94:1 | 12px (decorative) |

Pass, for reference: ink 16.4:1; ink@80 8.7-9.0; ink@75 7.6; ink@70 6.4; ink@65 5.4; ink@60 4.56 (bag sale line, options, returns: 0.06 above the line); gold text #80612A 5.2 on ivory, 4.97 on the sold band; green #4F7268 4.86.
Not scored (over a photo or video): "1 / 8" and "▶ Video" chips (ink on #FBF3EC@85), "+3 photos", the reel's caption.

### 7.3 Text under 11px
- **PDP 360x640: 26 of 90 runs (29%)**: 9px x1, 9.5px x6, 10px x16, 10.5px x3. 390x844: 26 of 90 (9, 9.5 x6, 10 x12, 10.5 x7). 1440x900: 27 of 101. Star Point Band: 33 of 106.
- 9px: "Verified buyer". 9.5px: eyebrow, "2 pieces · 10% off", "In this reel", reel "Add" x3, spec labels in Details (x8), "PRE-ORDER" under a chip.
- 10px: marquee, "▶ Video", badges at 360, sold-count caps at 360, fold-down titles (Details, Care, Delivery & returns), "Add" / "Choose size", "Kind words", "As featured in", "Seen on Naira".
- 10.5px: "1 / 8", "40% OFF", "incl. 3% GST", badges and sold-count caps at 390+.
- **Bag: 6 of 40 runs**: "3 PIECES" 9.5px; sale line 10px x2; "Buy 2 / 3 / 4" 10.5px x3. Empty bag: "MOST LOVED" 9.5px, "ADD" 10.5px x2.

## 8. Files

- "Before" set for the owner, `before/`: `pdp-390x844-first-screen.png`, `pdp-390x844-strip.png`, `pdp-1440x900-first-screen.png`, `pdp-1440x900-strip.png` (4 screens side by side), `pdp-1440x900-strip-2x2.png`, `bag-3-pieces-390x844.png`; also `pdp-360x640-first-screen.png`, `pdp-360x640-strip.png`, `pdp-ring-390x844-strip.png`, `pdp-metal-size-390x844-strip.png`, `bag-1-piece-390x844.png`, `bag-empty-390x844.png`, `bag-3-pieces-360x640-strip.png`, `bag-3-pieces-1440x900.png`.
- Raw data: `data/pdp-<handle>-<vp>.json` (every text run, tap target, border, fill, icon with position and computed style), `data/bag-<n>-<vp>.json`, `data/crops-<vp>.json`, `data/sticky.json`, `data/popup.json`, `data/popup-rerun.json`, `data/sizeguide.json`, `data/extras.json`, `data/catalogue.json` (178 live pieces, 47 sold out, 27 with options), `data/analysis/*.txt`, `data/analysis/summary.md`.
- Scripts (read-only): `lib.cjs` (guards: third-party trackers, checkout hosts and WhatsApp aborted; every Storefront mutation and every Supabase write aborted), `inpage.js`, `pdp.cjs`, `crops.cjs`, `sticky.cjs`, `popup.cjs`, `extras.cjs`, `sizeguide.cjs`, `bag.cjs`, `analyze.cjs`, `inventory.cjs`, `summary.cjs`.
