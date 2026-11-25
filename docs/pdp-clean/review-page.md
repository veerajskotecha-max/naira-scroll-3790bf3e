# Product page review (branch pdp-clean-page), 20 Nov 2026

Reviewed at head 0a244ffb, then fixed. Scripts and screenshots: `review/pagerev/` (screenshots in `review/pagerev/out/`).
Viewports: 360x640 (Instagram Android in-app), 390x844 (iPhone), 1280x720, 1440x900, device scale 1.
Pieces: woven-gold-hoops, serpentine-whisper-chain-silver (longest name), cushion-halo-ring (adjustable), chevron-whisper-ring (fixed list, pre-order sizes), crystal-baguette-eternity-ring (sizes), star-point-band (metal + size), bougainvillea-vine-bracelet (colour, opens on a sold-out value), riviere-classique-necklace (metal), baguette-huggies (stones), clover-trio-edit (set), first-light-set (sold out).

Status words: FIXED (changed in this pass), HOLDS (measured, no change needed), LEFT (not changed, with the reason).

## 1. Graphic designer

Measured as built (before fixes), woven-gold-hoops at 390x844, inside `main .nf-clean` and the pinned bar:

| Measure (rubric row) | himscience | Naira today | New page |
|---|---|---|---|
| Text colours, first two screens (1) | 5 | 14 | 5: ink, muted, gold, ivory on the filled button, star gold |
| Fills | 3 | - | ivory, linen, ink, rule colour (the 2px line) |
| Border colours (14) | 1 | - | 2: rule `#DCD4CE`, ink `#1A1614` |
| Hues (2) | 1 | 3 | 1 (gold) |
| Faces asked for (7) | 2 | 4 | 1 (Jost) |
| Type styles, first two screens (8) | 14 | 33 | 10 |
| Type styles in the buy box (9) | 7 in 4 sizes | - | 5 in 4 sizes (26, 20, 13, 11) |
| Text sizes, whole page (10) | 11 | - | 8 (11, 12, 13, 14, 15, 20, 22, 26) |
| Gold text in the buy box (4) | - | - | 1 ("40% off") plus the eyebrow |
| Radius, shadow, gradient (15, 16) | 0 | many | 0, 0, 0 |
| Photo to buttons (11) | 285px | 294px | 281px, 3 blocks, 0 boxes, 1 icon |
| Left and right edges of every buy-area block | - | - | all at x 16 and x 374 |
| Vertical rhythm, buy area | - | - | 2, 6, 16, 20, 24, 48 as the spec sets |

It is at the references' level on colour, type count, boxes and rhythm. What was not:

1. **FIXED. The title is lighter than the owner's screenshot.** The screenshot's "Woven Gold Hoops" was measured against Jost at 300, 400 and 500 set at the same size: ink coverage per width squared is 21.1 for the screenshot, 15.7 for Jost 300, 22.4 for Jost 400, 26.8 for Jost 500; the letterforms match Jost. The owner showed Jost 400 at about 26.5px. The build set 300 (the spec's value). `out/title-compare.png` shows the three. The title is now Jost 400 at the same sizes (26/32 phone, 34/40 laptop); everything else in the system stays as specified. This is the one place the page departs from the spec's table, on purpose.
2. **FIXED. A button label on two lines.** At 360 wide the third "Complete the look" card read "CHOOSE / SIZE" beside two one-line "ADD" buttons.
3. **FIXED. Orphaned words.** "…by Wed, 25 / Nov" in the pincode answer; "…return it within 7 / days." and "…before you / pay." in dropdown prose; "read / the policy".
4. **FIXED. The Maharashtra Times mark was a grey tile** (a 100px app icon with a pale-blue ground) beside four clean wordmarks.
5. **FIXED. A hole in the laptop reviews.** Three reviews in two columns left the right half of the second row empty.
6. **FIXED. A blank line between name and price** on every card of "More earrings" whose name fits one line (the room kept for a second line).
7. LEFT. Three widths of middle dot: QUALITY (17px between values), OFFER and the delivery line (a space each side), the rating (4px gap). They come from the frozen parts (`CleanDots`, `CleanRungs`); evening them is a one-line change in `clean.css` for the lead.
8. LEFT. A ring with five sizes of which two are pre-order wraps its fifth chip to a second row at 360 (three 52px chips and two 90px ones do not fit 328px). The chip and its "PRE-ORDER" note are the frozen system's.
9. LEFT. On a pre-order choice the OFFER row keeps an empty line between the muted rungs and "Not on pre-orders." It is deliberate (the lead's commit 5b863019: sizes must not jump) and reads as a small hole.
10. LEFT. ₹ and ★ are not in Jost, so the phone draws them in its own sans (here Inter; on Android, Roboto through "Jost Fallback"). The same is true of every price on today's site.
11. LEFT, owner question 3. Pieces whose first photo is the dark burgundy campaign shot with "NAIRA" printed on it open on a foreign ground; the page is calmest where the light stone-block photo leads. The order is set in Shopify.

Side by side: `out/side-390-first.png` (today, new, himscience, first two screens at 390). After the fixes: `out/after-hoops-p360-montage.png`, `out/after-hoops-p390-montage.png`, `out/after-hoops-d1440-first.png`, `-s02.png`, `-s03.png`; the title against the owner's screenshot: `out/zoom-after-360.png`.

## 2. Conversion (360x640 first)

| Question | Measured |
|---|---|
| What the first screen holds at 360x640 | header 107, photo 360, position line, category and shop rating, name (y 505 to 537), price row with MRP, "40% off" and tax note (ends y 567), the pinned bar with Buy Now and Add to cart (from y 575). Nothing over the photo or the price |
| Photo to the in-page buttons | 281px at 360 and at 390 (photo ends 469 / 499, buttons start 750 / 780). Today 294. himscience 285 |
| 390x844 first screen | name, price, QUALITY, OFFER with this piece's price at each rung, both buttons (end y 832). The delivery line is the next line (y 844 to 864) |
| Seen without a tap | price, MRP, discount, tax note, qualities, the offer priced per piece, size or colour chips and their stock sentence, the arrival date ("Arrives 25–27 Nov", new on the first view), free shipping, gift box, the shop's rating |
| Taps added against today | none. Removed: the description is open (it was inside a closed fold-down); the arrival date no longer needs the Delivery fold-down |
| Laptop | buttons end y 491 at 1440x900 and y 483 at 1280x720; in the tallest state (metal + five sizes, bag of one) at 1280x720 they end inside the first screen |

1. **FIXED. The pinned bar flickered on the first scroll at 360x640.** As built: on 0 to 40, off 60 to 120, on 140 to 160, off 180 to 800, on from 820. Today's page: on 0 to 100, off 120 to 800, on from 820. The extra "on" for 40px was new: the offer became a table row, so 104px now lie between the rungs' foot and the button's (63 today), more than the bar's 65. Now: on 0 to 40, off 60 to 800, on from 820, the same shape as today; scrolling back up: on, off 800 to 60, on. The three historical conditions and their pinned lines are untouched; one condition was added (a bar that is away stays away while the button is already arriving at the bottom edge) and the source test pins it. The ring page keeps today's shape (on 0 to 40, off 60 to 120, on 140 to 300 over the chips, off 320 to 940, on).
2. HOLDS, noted. On a two-line name at 360x640 (5 of 113 names) the price ends at y 599, so by today's "never over the price" rule the bar is held back until the first scroll: that first screen has no buy button. Same rule as today.
3. HOLDS, noted. At scroll 20 and 40 the bar covers the top of the offer rungs as they enter under the bottom edge (today: at 80 and 100). That is the existing rule "rungs reaching past the edge do not hold it back"; check 14 as literally worded does not hold there, as the engineer reported.
4. What went quieter, on purpose: the offer (a row, not a box; said three times on the page instead of four), "Gift-ready: every piece arrives in the Naira gift box" (now "Gift-boxed"), the payment discs, the wishlist heart in the bar.
5. Suggestion for the lead, not done (it would add words): cash on delivery is only said inside "Delivery and returns", as today. For this audience it could join the delivery line.

## 3. Phone and accessibility

| Check | Measured |
|---|---|
| Tap targets under 44px | 0 of 71 (hoops, 390), 0 of 80 (star-point-band, 360), 0 of 52 (hoops, 1440), every dropdown open; links inside a sentence excepted |
| Text under 13px | only the 11px caps label (weight 500) and the 12px small-button label; nothing under 11px |
| Contrast, every text run against its ground (122 to 177 runs) | ink 16.37:1, muted 5.92:1, gold text 4.83:1, ivory on ink 16.37:1. Only the ★ glyphs (2.33:1) are under 4.5; they are decorative and each rating has its words |
| Keyboard order | photos, reel controls, category, rating, heart, size guide, the chosen size, Buy Now, Add to cart, the four dropdowns, cards, reviews: the reading order. 37 stops walked; every one shows the 2px ink ring, 2px off |
| Names | every button and link has one; stars are `role="img"` "5 out of 5"; the rating link says what it is and where it goes; the pincode field has a label |
| Live regions | the offer's status line is polite. **FIXED:** the pincode answer was not announced (only its error was); it is now in a polite region |
| Headings | h1, then the h2 sections. LEFT: the ring chart inside "Details and size" carries an h3 and h4s before the first h2, as on today's page |
| Reduced motion | no animation running; a dropdown opens at once (the press row stands still) |
| A dropdown opening | 220ms by its rule (settled by 257ms at frame resolution); the page does not scroll and the row does not move |
| Layout shift, first paint to settled, throttled to 1.6 Mbps / 150ms | production build: 0.0007 (hoops), 0.0004 (the longest name), 0.0000 (Bougainvillea Vine Bracelet, the name nearest the line's limit). The name's height is the same before and after Jost arrives on all three |
| Horizontal scroll | none at 360, 390, 820, 1280, 1440, dropdowns open or closed |
| Safe areas | the bar pads by `env(safe-area-inset-bottom)`; not provable in a headless browser |
| Slow network | the page paints styled from the first frame (both stylesheets are in the HTML). Noted, not in this lane: the first photo can swap when the live catalogue answers (hoops: the stone-block photo, then the burgundy one), exactly as on today's page |
| After 70 seconds | no card has appeared; the page text has no "sold in the last", "bought the", "min ago" or review count |

## 4. The keeper

| Check | Result |
|---|---|
| States | plain; bag of 1, 2, 4; longest name; adjustable ring; size guide open; fixed list in stock and pre-order; sizes in stock, pre-order, pre-order with a bag; metal + size; colour opening on a sold-out value and in stock; metal; stones; set; sold out; each dropdown; pincode ok, error, unconfirmed; wishlisted; reviews and View all; press; reel; more. All reached at four viewports: `out/states-*.png` |
| Meta events, tap for tap, both builds (fbq stubbed, the relay's requests recorded and stopped) | identical at 390 and 1440: PageView, ViewContent 1049 + relay copy; AddToWishlist 1049 + copy; AddToCart 999 (pairing Add) + copy; AddToCart 1049 + copy; InitiateCheckout 1049 + copy. Same names, parameters, count and order. Every cart call was answered locally; the one checkout navigation was stopped |
| Contact | "Questions? Chat with us on WhatsApp" is still an `<a href>` to the same address on both builds (never clicked) |
| The pre-built page (production build, captured as the prerender captures it) | one h1, canonical and robots as before, `nf-piece` with `rating: null`, both stylesheets in the HTML, four dropdowns with all their words, opened with JavaScript off it paints styled at 390 and 1280 |
| Lane | `git diff --stat pdp-clean`: only the page engineer's files and new files under `src/components/pdp/`, plus 15 lines of `src/components/clean/clean.css` changed by the page engineer before this review (a Liberation Sans fallback source and a reduced-motion line for the dropdown's height). That file is frozen by the spec: the lead should carry those 15 lines when merging the bag's lane |
| Tests | none deleted. Case counts against origin/main: JewelDetailNext 25 to 31, PdpOfferLadder 17 to 17 (rewritten for the row), PincodeChecker 4 to 10, CustomerReviews 2 to 3, new PdpReviews (8) and pdpCss (5) |
| Head and structured data, 7 pieces, both builds | 22 head tags identical on each; JSON-LD identical (WebSite, BreadcrumbList, Product InStock, and OutOfStock on first-light-set); one h1, one main. The embedded piece's `rating` is `null` where it was `{4.9, 50 or 51}` (the invented figure), by the spec |
| Other pages, pixel for pixel against origin/main (390 and 1440) | home, /jewellery, an outfit page, the wishlist drawer and the product page's header: 0 pixels different. The product page's footer: 0 different at 1440; at 390 the only difference is the pinned bar lying over it (the page's own, changed by design); the footer itself differs by 5 pixels of antialiasing, none beyond 3% |
