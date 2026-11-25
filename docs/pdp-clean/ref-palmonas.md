# Reference study: Palmonas PDP and cart (with one Mejuri PDP for contrast)

Study notes only. Nothing here (images, text, code) is for shipping. Measured 20 Nov 2026 with Playwright Chromium, deviceScaleFactor 1.
All paths below are relative to `/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/ref/`.

## What was opened

| Tag | Page | Viewport | Length |
|---|---|---|---|
| hoop-390 | palmonas.com/products/small-heart-hoop-earrings-18k-gold-plated-97092 | 390x844 phone | 7185 px = 8.5 screens |
| ring-390 | palmonas.com/products/criss-cross-ring-18k-gold-plated-91108 (a ring with sizes 6, 7, 8) | 390x844 phone | 6980 px = 8.3 screens |
| hoop-360 | same hoops | 360x640 phone | 7420 px = 11.6 screens |
| hoop-1440 | same hoops | 1440x900 laptop | 6576 px = 7.3 screens |
| cart-390 / cart-360 / cart-1440 | palmonas.com/cart with one pair of hoops | all three | 1014 px = 1.2 screens at 390 |
| mejuri-390 | mejuri.com Tube Huggie Hoops (contrast) | 390x844 | 5743 px = 6.8 screens |
| naira-390 | Naira today, Woven Gold Hoops (same counting script, for like-for-like numbers) | 390x844 | 3501 px = 4.1 screens |

No popups appeared on Palmonas. One product was added to the cart; checkout was never opened and nothing was typed anywhere (the pincode box was left empty). Monica Vinader blocked the automated browser (403 "Just a moment"), so Mejuri is the contrast page.

Montages (one shot per screen, side by side):
- `palmonas/hoop-390-montage.png`, `palmonas/ring-390-montage.png`, `palmonas/hoop-360-montage.png`, `palmonas/hoop-1440-montage.png`
- `palmonas/cart-390-montage.png` (after-add state, cart screen 1, cart screen 2), `palmonas/cart-390-crops-montage.png`
- `palmonas/compare-fold-naira-palmonas-mejuri.png` (three first screens side by side: Naira today, Palmonas, Mejuri)
- `mejuri/mejuri-390-montage.png`
- Single screens: `palmonas/shots/<tag>-sNN.png`. Crops: `palmonas/crops/`.

## 1. Order of sections, phone (hoop-390; y is the page offset in px)

| y | Height | Section |
|---|---|---|
| 0 | 32 | Offer bar: black, white 14 px/500, one centred line, scrolls away |
| 32 | 54 | Header, sticky, white, 1 px rule #e7e5e4. Menu, logo image 137x14 beside the menu (left), three 20 px icons |
| 86 | 390 | Gallery: one square 390x390 image, edge to edge, swipe, 6 images. Only overlay is a 24 px share circle. Dots 5 px (active #fccaca, rest #dfdfdf) |
| 525 | 96 | Price row, tax line, title, rating; 32 px heart at the right |
| 645 | 85 | Three quality chips (48 px tall) and "139 sold in the last 7 days" |
| 754 | 177 | "Limited Time Offers": sideways carousel of 3 offer cards, each with a coupon code |
| 954 | 50 | Ring only: "Select Size" and "Size Guide" |
| 954 (ring 1028) | 74 | "Check delivery" pincode box |
| 1052 | 184 | Four accordions, all closed |
| 1276 | 53 | Three icons: 2 Days Return, 10 Days Exchange, Cash On Delivery |
| 1362 | 402 | "Shop By Offers": 3 pills and a product carousel |
| 1764 | 354 | "Similar Products" carousel (10 cards) |
| 2118 | 354 | "Complete Look" carousel |
| 2472 | 354 | "Shop The Look" carousel |
| 2826 | 880 | "Ratings & Reviews" |
| 3706 | 1566 | SEO copy: a long brand text, "About Palmonas" (open), four more dropdowns |
| 5272 | 1914 | Footer: subscribe, address, 3 dropdowns, socials, app badges, payment icons, "Popular Searches" (961 px of links) |
| fixed | 75 | Buy bar pinned to the bottom of the screen, always |

- The product part ends at 3706 px (4.4 screens). The last 3479 px, 48% of the page, is SEO copy and footer.
- The buy area itself (price to the three icons) is 804 px on the hoops and 878 px on the ring: about one screen.
- Reviews start on screen 4, after four product carousels (1464 px).
- Laptop (hoop-1440): header 114 px in two rows; gallery is a two-column grid of 450 px squares with 20 px gaps at the left (x 32 to 952); buy column starts at x 992 and is 371 px wide; 40 px between gallery and column; blocks in the column are 32 px apart. The gallery is cut at the height of the buy column (main is 839 px tall), then the three icons run full width. First screen: `palmonas/crops/hoop-1440-00-first-screen.png`.

## 2. Title, eyebrow, price

Crop: `palmonas/crops/hoop-390-01-price-title.png` (laptop: `hoop-1440-01-price-title.png`).

| Item | Measured |
|---|---|
| Title (h1) | Nunito Sans, 16 px / 24 px, weight 400, colour #4a4a4a (grey, not black), mixed case (text-transform capitalize), letter-spacing normal, left aligned, one line. Laptop: 20 px / 30 px |
| Where the title sits | Third line of the block: price first, tax note second, title third, rating fourth |
| Eyebrow | None. No category, no brand line, no collection label |
| Strike price | First in the row. 17 px, weight 400, #595959, line-through |
| Price | Second. 19 px, weight 700, #151515. Laptop 28 px (strike 24 px) |
| Discount | A black pill after the price: "67% OFF", 11 px / 700 white on #151515, 64x18, fully rounded, padding 2 px 8 px |
| Tax note | "Inclusive of all taxes", 12 px / 16 px, weight 400, #151515, its own line under the price |
| Rating | "4.7", five 11 px stars (#F5B301), "| 387"; text 12 px / 700; tapping jumps to reviews |
| Gaps | 0 px price to tax, 8 px tax to title, 8 px title to rating, 24 px to the next block. No rule and no box anywhere in this block |

The only bold thing in the block is the price. That single contrast is most of why the top reads as clean.

## 3. Qualities (anti-tarnish, waterproof, hypoallergenic, warranty)

Crop: `palmonas/crops/hoop-390-02-qualities.png`.

- Shown as three picture chips, not text: each is a PNG of a rounded pill with a peach icon circle and a label. Sizes at 390: "Anti-Tarnish" 133x48, "Skin Safe Jewellery" 177x48, "18K Gold Tone Plated" 190x48, 16 px apart, in a sideways-scrolling row.
- The third chip starts at x 358 on a 390 px phone, so 16 px of it shows. On a 360 px phone it is off screen. A shopper who does not swipe never learns the plating.
- Warranty, waterproof and hypoallergenic are not stated anywhere in the buy area. The words first appear at y 4745 (screen 6) inside the SEO copy and inside closed FAQ dropdowns. "Lifetime Warranty Policy" is a footer link.
- Under the chips: "139 sold in the last 7 days", 12 px, the number in red #b91c1c weight 700, with a shimmer animation.
- Mejuri for contrast: a row of plain 12 px black text with small line icons directly under the image ("2 Year Warranty", "Free Returns & Exchanges"), no boxes; lower down, "Why We Love It" is three plain 14 px lines (Hypoallergenic, gold thickness, recycled silver).

## 4. Offers and coupons

Crops: `palmonas/crops/hoop-390-03-offers-coupons.png`, `hoop-390-08-shop-by-offers.png`.

| Where | What | How loud |
|---|---|---|
| Top bar | One line, "Buy 1 Get 1 Free" with a code | 32 px black strip, scrolls away |
| Inside the buy area, above size, pincode and details | "Limited Time Offers" (14 px / 600 with a 16 px icon), then a carousel of 3 cards. Card 280x145, 1 px #e4e9f7 border, radius 16. Inside: 40 px coupon icon with a green dot, "Get it for ₹750" 15 px / 600, two lines of 12 px grey, then a coupon strip 254x42 with a dashed 1 px #b3c4ff border, mint fill #f0f9f4, ticket notches, the code in 13 px / 600 and a green "Collect" (#008236) | 177 px tall (21% of a screen). The loudest block in the first two screens: it brings 4 colours used nowhere else |
| Below the buy area | "Shop By Offers": 3 pills 36 px tall (active black, others white with 1 px #ddd7cf) over a product carousel | 402 px |
| Every product card | A green line "Buy 4 At ₹2999 + 2 more" (12 px / 700) or a pill "Get it for ₹750 with offers" set in 8 px type with a 6 px "%" | Repeats on every card in four carousels (10 or more cards each) |

## 5. Pickers, size guide, buttons, sticky bar

Crops: `palmonas/crops/ring-390-04-size-picker.png`, `ring-390-04-size-guide-open.png`, `hoop-390-12-sticky-bar.png`, `hoop-390-12-sticky-bar-scrolled.png`, `hoop-360-00-fold.png`.

- Size (ring): one line with "Select Size" (14 px / 400) at the left and "Size Guide" (12 px with a 16 px ruler icon) at the right. Sizes are circles 26x26, 12 px text, 1 px #d6d6d6 border, 10 px apart. Selected: fill #ece2df, border #977979, weight 700. The first size is preselected. 26 px is well under a 44 px tap target.
- Size guide: a bottom sheet 390x717 with rounded top corners over a dimmed page. Title "Ring Size Guide" and a close X; two tab buttons ("Measure My Ring Size" / "Measure My Finger Size", active one black); two instruction lines; a 4-column table (Indian size, diameter, circumference, US size).
- No colour picker on these two products.
- Buttons: two, and only in the pinned bar. There is no button row in the page body, on phone or laptop.
  - "Buy Now": white, 1 px #151515 border. "Add to Cart": #151515 fill, white text.
  - Each 175x42 at 390 (160x42 at 360), radius 10, 14 px / 600, letter-spacing 0.35 px, sentence case, 8 px apart.
  - Bar: 75 px tall, fill #f7f7f7, 1 px top rule #efefef, shadow 0 -2px 6px rgba(0,0,0,.15), 16 px padding.
  - Once the page price scrolls away the bar adds "₹3,686 ₹1,199" at the left (14 px strike, 16 px / 700 price) and the buttons shrink to 118x42 (103x42 at 360).
  - After adding: the label becomes "Add to Cart (1)", a green toast "Product has been added to your cart" shows above the bar, and the bag icon gets a count. No cart drawer opens.
  - Laptop: the same bar spans the full width with two 140x42 buttons at the right.

## 6. Dropdowns (accordions)

Crops: `palmonas/crops/hoop-390-06-accordions-closed.png`, `hoop-390-06-accordion-open-1.png` to `-4.png`.

| Property | Measured |
|---|---|
| Names, in order | Description, Specifications, Supplier Information, Return Policy |
| Default | All four closed. Several can be open at once |
| Row | 358 px wide, 46 px tall (45 + rule). Padding 12 px 8 px. Laptop 49 px |
| Label | 14 px / 21 px, weight 400, #151515, sentence case, no icon at the left. Laptop 16 px / 24 px |
| Marker | A small filled black triangle, 10x6, at the right; turns 180 degrees when open. Not a plus, not a thin chevron |
| Rule | One hairline under each row, #efefef, declared 0.5 px (renders as 1 px at scale 1). No rule above the first row, no box, no fill |
| Content type | 12 px / 16.5 px, #4a4a4a, padding 0 8 px 12 px, plain lines. Laptop 14 px / 19.25 px |
| Description | One paragraph and the SKU; opens to 194 px |
| Specifications | Plain lines: material (base metal, plating), then type, closure, length, weight, net quantity |
| Supplier Information | Marketed by, address, country of origin, brand |
| Return Policy | Four numbered lines (2-day returns, unused with tags, refund in 7 to 10 working days, offer purchases refund to wallet) |
| Total closed height | 184 px for four topics |

Mejuri for contrast: three rows (Materials & Specifications, Sustainability, Shipping, Returns & Warranty), the first one open by default; row 67 px; label uppercase 14 px with 0.28 px tracking; thin plus/minus; square corners.

## 7. Delivery, returns, COD, pincode

Crops: `palmonas/crops/hoop-390-05-pincode.png`, `hoop-390-07-delivery-returns-cod.png`.

- Pincode: label "Check delivery" 14 px / 500. Input 358x42, 1 px light stone border, radius 6, placeholder 16 px. A black "Check" button 68x28 sits inside the input at the right (radius 6, 16 px / 500). It comes after the offers and before the dropdowns. No delivery date is shown until a pincode is entered.
- Under the dropdowns: three 28 px line icons in a 3-column grid with centred 12 px labels in #595959: "2 Days Return", "10 Days Exchange", "Cash On Delivery". 53 px tall, no boxes.
- Return terms live in the fourth dropdown. There is no shipping cost line on the PDP.

## 8. After the buy area: recommendations and reviews

Crops: `palmonas/crops/hoop-390-09-similar.png`, `hoop-390-10-complete-look.png`, `hoop-390-11-reviews-screen.png`.

- Four product carousels in a row (Shop By Offers, Similar Products, Complete Look, Shop The Look), 1464 px.
- Section headings: 16 px / 24 px, weight 500, #151515, left, mixed case.
- Card: 180x269 with a 178x178 square image, 1 px rgba(0,0,0,.1) border, no radius, cards share borders with no gap. On the image: a magenta "Bestseller" ribbon (#c2185b, white 12 px / 600), a 28 px white heart circle, and a rating chip at the bottom right. Under it: price 12 px / 700 with a 12 px strike, a 22x22 black "+" quick-add (radius 4), the green offer line, the name in 12 px / 400 cut to one line.
- Reviews (880 px): "Ratings & Reviews" 16 px / 400 at the left with "4.7 ★ 387 reviews" at the right on the same line; five bar rows (black bar on a #dfdfdf track, count at the right, 36 px apart); "387 Reviews" with an "All" filter (69x38, 1 px #e0e0e0, radius 8); four reviews, each a 40 px initials circle, name 14 px / 600, small stars and a date, text 14 px / 22.75 px in #525252. No boxes round reviews, no photos, about 115 px per review. Then a centred "View All" pill 105x42 with a 1 px #d4d4d4 border.

## 9. The cart

Shots: `palmonas/cart-390-montage.png`, `palmonas/shots/cart-390-full.png`, `palmonas/shots/cart-1440-s01.png`. Crops: `palmonas/crops/cart-390-01-line.png` to `cart-390-05-checkout-bar.png`.

It is a full page at /cart, 1014 px tall (1.2 screens at 390; 1001 px at 360). The site header and offer bar are gone: only a back arrow and "Cart (1 item)" (16 px / 600, the count in grey #9a9a9a).

| Block | y | Measured |
|---|---|---|
| "Order Summary" heading | 81 | 15 px / 600 |
| Line | 119 | Card 370x98, 1 px #e2e8f0, radius 16. Thumb 80x80, radius 12. Name 12 px / 400, price 12 px / 700. Grey bin icon at the top right (32 px tap area). Stepper at the bottom right: 62x32, fill #ece2df, radius 4, with 14x14 minus and plus buttons in 10 px type. No variant line, no strike price on the line |
| Offers & Coupons | 229 | Card 370x148, 1 px green border (rgba 0,160,43,.18), radius 16, soft shadow. 28 px "%" circle, title 14 px / 600, "Save more on this order" 10 px green, "Have a code?" 11 px link at the right. One offer row 340x44 with an upright "OFFER" tab in 8 px caps, the offer in 12 px / 600, a 10 px hint, an "Add Items" pill 67x22. "More offers" 12 px link |
| "Limited Time Offer" | 398 | A product carousel, cards 177x264, the same card as on the PDP |
| Totals | 712 | Card 370x202, 1 px #e8e8e8, radius 16. Rows in 13 px (label #6b6b6b weight 400, value #151515 weight 500): Cart Subtotal; Shipping Charges "FREE" in green #16a34a; Total savings in green. A 1 px #ececec rule, then "Estimated Total" 15 px / 600 with the amount 16 px / 600 |
| Button | fixed | White bar 390x60 with a shadow. One button, "Continue to Checkout", 370x44, #151515, radius 8, 14 px / 400, with three 17 px payment app icons inside the button after the label |

- One button on the whole page. That is the calmest thing about it.
- Because the upsell carousel sits between the line and the totals, "Estimated Total" is at y 875, below the first screen even at 844 px tall.
- Counts for the whole cart page: 20 type styles, 9 sizes (6 to 16 px), 14 text colours, 11 full boxes, 6 different corner radii.
- Laptop: two columns. Lines at the left (836 px wide); a 360 px column at the right with offers, upsell, totals and the button.

## 10. Counts: colours, type styles, borders

Counted by script over everything visible in the given band at 390 px wide (`palmonas/stats.cjs` on the saved inventories). A "type style" is a distinct combination of face, size, weight, case, tracking and italic. A "full box" has a visible border on 3 or 4 sides; a "rule" has it on 1 or 2.

First two screens (0 to 1688 px):

| | Palmonas hoops | Palmonas ring | Mejuri | Naira today |
|---|---|---|---|---|
| Text runs | 66 | 47 | 58 | 86 |
| Typefaces | 1 (Nunito Sans) | 1 | 2 | 4 (system sans stack 41 runs, Jost 32, Velista 10, Cormorant Garamond 3) |
| Type styles | 21 | 19 | 25 | 33 |
| Type sizes | 11 (6, 8, 9, 11, 12, 13, 14, 15, 16, 17, 19 px) | 9 | 5 (10, 12, 14, 16, 18 px) | 15 (9 to 27 px, four of them half-pixel: 9.5, 10.5, 11.5, 13.5) |
| Weights | 4 | 4 | 2 | 4 |
| Text colours | 9 | 7 | 7 | 14 (8 are ink at different opacities) |
| Fill colours | 11 | 11 | 6 | 12 |
| Bordered elements | 29 (21 boxes, 8 rules) | 27 (19 boxes, 8 rules) | 6 (4 boxes, 2 rules) | 31 (14 boxes, 17 rules) |
| Corner radii in use | 6 (pill x24, 16, 10, 8, 6, 4 px) | 5 | 1 | 1 (circles only) |

First screen only (0 to 844 px):

| | Palmonas hoops | Mejuri | Naira today |
|---|---|---|---|
| Text runs | 19 | 29 | 36 |
| Type styles | 12 | 17 | 19 |
| Type sizes | 8 | 5 | 11 |
| Text colours | 5 | 7 | 9 |
| Full boxes | 3 | 2 | 8 |

Notes on reading these:
- Palmonas' first screen is calm (19 text runs, 3 boxes). Its second screen is not: the offer cards, coupon strips and product cards add 18 boxes and type at 6 and 8 px.
- Of Palmonas' 21 full boxes in two screens, 7 are the offer and coupon block and 8 belong to product cards. The price, title, rating, chips and sold line have none. The only rules in the buy area are the 4 dropdown hairlines.
- Naira today puts almost twice as many text runs in the first screen as Palmonas (36 against 19) and 8 boxes against 3. That, more than colour, is the gap the owner is seeing.
- On Naira's live page 41 of 86 text runs have the system sans stack as their first font family (the offer strip, strike price, badge text, description and review text), not Jost. Worth checking that Jost is applied where it is meant to be.
- Palmonas whitespace: 16 px side gutters everywhere; 24 px between blocks in the buy area (32 px on laptop); 8 px inside a block; 40 px before the three icons.

## 11. What feels calm on Palmonas, and why

1. One typeface, and nearly all reading text in 12, 14 or 16 px.
2. One near-black (#151515) does every piece of chrome: the discount pill, both buttons, the Check button, the active pill. No second accent in the top screen.
3. The price, title and rating block has no borders, fills or icons. Order is carried by weight alone: only the price is bold.
4. The product photo is a plain light studio square, edge to edge, with a single 24 px control on it and 5 px dots under it.
5. Four dropdowns hold all the long text in 184 px, with hairlines and regular-weight 14 px labels.
6. The buttons live only in the pinned bar, so the page body has no button boxes competing with the content.
7. A steady rhythm: 16 px gutters, 24 px between blocks.

## 12. What is still clutter on Palmonas

1. The offer and coupon block in the buy area: dashed periwinkle borders, mint fill, green links, ticket notches, a carousel, 177 px, placed above size and delivery.
2. Quality chips as pictures with peach icons; the third is cut off on every phone; warranty and waterproof are missing from the buy area.
3. Urgency and badge noise: a red sold counter with shimmer, a black "% OFF" pill, magenta "Bestseller" ribbons, green offer lines on every card, type at 6 and 8 px.
4. Four product carousels before the reviews; reviews do not start until screen 4.
5. 48% of the page is SEO copy, footer and "Popular Searches".
6. Tap targets: 26 px size circles, 14 px stepper buttons in the cart, 22 px quick-add.
7. The title is small and grey under the price, with no eyebrow: quiet, but it gives the product no voice.
8. Filled triangle markers on the dropdowns look like form selects.
9. Six different corner radii.
10. "Supplier Information" takes a whole dropdown row for legal text.
11. In the cart: a green offer card with a shadow, an upsell carousel between the line and the totals (the total falls below the first screen), 14 text colours, payment logos inside the checkout button.

## What Naira should take

Patterns, with numbers, restated in Naira's own brand (ivory #FBF3EC ground, ink #1A1614, sage #99B4AF, gold #C99A4C / #B0843A, Jost and Cormorant Garamond, square corners).

1. **A top block with no boxes.** Eyebrow, title, price row, qualities line: no borders, fills or icons between the image and the first picker. Budget for the first screen at 390x844: at most 20 text runs (Palmonas 19, Naira today 36) and at most 3 full boxes (Naira today 8), the two bar buttons included.
2. **Eyebrow and title.** Eyebrow: Jost 10 to 11 px, caps, tracking about 0.18em, gold #B0843A, one line. Title: Jost weight 300 or 400, mixed case, 20 to 22 px with line-height about 1.25, ink, left aligned, 8 px under the eyebrow. Palmonas gives the pattern (regular weight, mixed case, no decoration); do not take its 16 px grey.
3. **One price row, one bold thing.** Price 18 to 19 px, weight 500 or 600, ink. MRP 13 to 14 px, line-through, ink at about 60%. Discount as plain words in gold ("40% off"), 12 to 13 px, no pill. Tax note 11 to 12 px muted on the same line or the next. No more than 3 sizes in the row; 0 px to the tax note, 8 px to the next line.
4. **Qualities as one icon-less line under the price.** "Anti-tarnish · Skin-friendly · 18K gold PVD", Jost 12 to 13 px, weight 400, ink at about 70%, middots between, wrapping to at most 2 lines at 360 px, 40 px tall at most. No borders, no fills, no pictures. All three must be readable without swiping (Palmonas hides the third).
5. **Dropdowns for everything long.** At most 4 rows, all closed, more than one may be open. Row 48 to 52 px tall. Label Jost 13 to 14 px, sentence case, weight 400, ink, no icon at the left. A 1 px rule under each row at about 12% ink. A thin 12 px plus/minus or 1 px chevron at the right, not a filled triangle. Content 13 px with line-height about 1.55 at about 75% ink, 16 px bottom padding, plain short lines. Suggested rows: Description; Details and size (materials, dimensions, weight, with the seller and origin lines at the bottom); Delivery and returns (COD, pincode check, return terms); Care and warranty.
6. **Two buttons, pinned.** A bottom bar of 76 px at most: 16 px padding, two equal buttons 44 to 48 px tall, 8 px apart, ink-filled "Add to cart" and outlined "Buy now", 13 to 14 px labels, square corners. Show the price in the bar only after the page price has scrolled away. On the phone, do not repeat the button row in the page body.
7. **Delivery, returns, COD in one quiet row.** Three short labels (for example "Free shipping", "7-day returns", "COD available") as 11 to 12 px text, with or without 20 px line icons, 56 px tall at most, no boxes. Pincode: one 44 px input with a text "Check" inside it at the right, placed in or just above the Delivery dropdown.
8. **Size picker on one line.** "Size" at the left (13 to 14 px), an underlined "Size guide" link at the right on the same line. Chips square, at least 40x40 (aim 44), 1 px rule, 8 px apart; selected is an ink border or ink fill. Size guide as a bottom sheet with a close X, two tabs and one 4-column table.
9. **One slot for offers in the buy area, 60 px at most.** One line ("Buy 2, save 10% · Buy 3, 20% · Buy 4, 30%. Applied in your bag.") with a "See offers" link that opens a sheet or dropdown. The top bar stays one static 32 px line.
10. **Spacing.** 16 px side gutters; 24 px between buy-area blocks; 8 px inside a block; section headings 16 to 18 px.
11. **After the buy area.** One recommendation row before the reviews (two at most). Reviews: heading and "4.9 · 50 reviews" on one line, 3 or 4 reviews with no boxes (name 13 to 14 px / 500, text 13 to 14 px with line-height about 1.6), then one outlined "View all" button. Reviews should start by screen 3.
12. **A type and colour budget for the first two screens.** At most 2 faces (Jost for all interface text; Cormorant Garamond for one display use only). At most 6 sizes, whole pixels only (for example 11, 12, 13, 14, 16, 21). At most 3 weights. At most 5 text colours (ink, ink 70%, ink 55%, gold, white) in place of today's 14.
13. **Cart.** No site header: a back arrow and "Bag (1)". Line: 72 to 80 px thumb, name 13 to 14 px, variant line, price; a stepper with 32 to 44 px targets; a text "Remove". One quiet offer line. Totals in 13 px rows (label muted, value ink), savings in gold or sage, a 1 px rule, then the total at 15 to 16 px / 600. One full-width 48 px button in a pinned bar, label only. With one item at 360x640 the total and the button must show without scrolling: put any "add more" row below the totals.
14. **Image.** Square, edge to edge, plain; 5 px dots or a small counter; at most one control on the image.

## What Naira should not copy

- Picture-based quality chips, or any quality row that scrolls sideways and cuts off an item. They are the rounded cousins of the boxed badges the owner already dislikes.
- Coupon cards: dashed borders, ticket notches, periwinkle and mint, a "Collect" step, a carousel inside the buy area.
- Urgency and badge colour: the red sold counter with shimmer, the black "% OFF" pill, magenta "Bestseller" ribbons, green offer lines on every card, any type under 11 px.
- Four carousels before the reviews, and the SEO text wall with "Popular Searches" (48% of their page).
- The title under the price in 16 px grey with no eyebrow. Naira wants the opposite: a designed title with a gold eyebrow above it.
- Filled triangle dropdown markers, and the mix of six corner radii. Naira is square-cornered.
- 26 px size circles, 14 px stepper buttons, 22 px quick-add buttons.
- A dropdown row spent on "Supplier Information"; fold it into Details.
- The white, near-black, Nunito look itself. Take the discipline, keep ivory, ink, sage and gold.
- From the cart: the upsell carousel between the line and the totals, the green shadowed offer card, 14 text colours, payment logos inside the checkout button.
- On laptop, a pinned bar as the only place to buy: keep the buttons in the buy column there.
