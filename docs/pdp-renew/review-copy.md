# Copy review: renewed product page and bag (words only)

I read the built preview live at 390x844 and 360x640: hoops, eternity band and clover trio in full (every dropdown open), plus the first screens of the cushion ring, droplet ring and prism bracelet. I also read the bag at 0 to 5 pieces, the bundle in every tick state, the pre-order choices and five pincodes. Replacements marked "fits" were tried in the browser at 360px, in the page's DOM only; no file was edited. Dropdown text and reviews were read for errors only.

## Findings, most important first

**1. The returns promise says more than the policy it links to.**
- **Where:** every product and the bag. Tile (`ul.rn-trust`, PdpTrust.tsx): "7-day returns / Exchange or return". Bag foot link (`[data-returns]`): "Easy 7-day exchange & returns". Care dropdown: "If it does not suit you, return it within 7 days."
- **Why:** `/exchange-return-policy` and the FAQ allow a return only for a manufacturing defect, within 7 days of delivery, settled by repair, replacement or store credit (refunds "case by case"). Worn pieces are excluded and every example is a garment. "Exchange or return" (new in this layer; the footer says "On eligible pieces"), "Easy" and "if it does not suit you" cannot be shown from it.
- **Fact needed from the owner:** on jewellery, is a return for any reason or for faults only, and does she give money back, an exchange or store credit?
- **Change, true to the policy as published:** tile detail becomes "If it arrives faulty" (fits); bag link becomes "7-day returns policy" (fits); cut the Care sentence. If she confirms any-reason returns, keep "Exchange or return", drop "Easy", and the policy page (outside this work) must say so.

**2. "Adds ₹…" is a change in the bag's total, but reads as the piece's price.**
- **Where:**
  - Offer line once the bag holds pieces (`p.rn-offer__line`, promo.ts `pdpOfferStatus`): "Add to bag for 20% off everything: it adds ₹1,575, not ₹2,399." It sits under "Buy 3 · 20% off / ₹1,919 each" and a button that says ₹2,399, so one piece shows three prices.
  - Bag suggestion (`[data-bag-addon]`): "ONE MORE PIECE · 20% OFF EVERYTHING / Adds ₹355" with ₹699 struck. After the tap its row shows ₹559.
  - Bundle with a filled bag: rows of ₹1,049 and ₹999, then "Adds ₹744" with ₹2,048 struck, and the button "ADD 2 PIECES · ₹744".
- **Why:** the figures are right, but "everything" and "it adds" take a second read. A struck price beside the figure makes it look like a sale price the bag then breaks. At 360x640 only the suggestion's label shows above the pinned total, so it must make sense alone.

| Now | Change to |
|---|---|
| Add to bag for 20% off everything: it adds ₹495, not ₹1,049. | Add to bag and everything in it gets 20% off. Your total goes up by ₹495, not ₹1,049. (two lines at 360, as now) |
| …: your total drops ₹550. | … Your total drops by ₹550. |
| 30% off is on your bag, this piece included. | Your bag already has 30% off. This piece gets it too. |
| ONE MORE PIECE · 20% OFF EVERYTHING | A THIRD PIECE TAKES 20% OFF YOUR BAG (second / third / fourth; the sentence the bag's foot already uses; one line at 360) |
| Adds ₹355, with ₹699 struck | Adds ₹355 to your total (no struck price) |
| Bundle, bag not empty: Adds ₹744, ₹2,048 struck; button ADD 2 PIECES · ₹744 | Adds ₹744 to your total; button ADD 2 PIECES with no figure |

- With one piece in the bag the same fact is on screen twice: "ONE MORE PIECE · 10% OFF EVERYTHING" and, in the foot, "A second piece takes 10% off your bag". Show the foot's line only when there is no suggestion row.

**3. Cash on delivery is said twice on one screen, and is not true for every pincode.**
- **Where:** under the buttons on every product: tile "Cash on delivery / UPI and cards too", then directly below, the pay row "UPI · Cards · Cash on delivery". In the Delivery dropdown after checking 800001, "Cash on delivery available." stands three lines above "Cash on Delivery is unavailable for this pincode (high return rate on COD in this region). Prepaid only · …".
- **Why:** the shop's own rules (lib/serviceability.ts) refuse COD in Bihar, Jharkhand, the North East, J&K and Ladakh, parts of UP and Haryana, and the islands. The tile is unconditional, the dropdown contradicts itself, and the bracket tells a shopper her area is a bad risk.

| Now | Change to |
|---|---|
| Tile detail: UPI and cards too | On most pincodes (fits) |
| Pay row on the product page: UPI · Cards · Cash on delivery | Marks with "UPI" and "Cards" only (the bag keeps all three; it has no tile) |
| Cash on delivery available. (dropdown) | Cash on delivery on most pincodes. |
| Cash on Delivery is unavailable for this pincode (high return rate…). Prepaid only · … | Cash on delivery is not available for this pincode. You can pay by UPI, card, wallet or net banking. |
| Cash on Delivery available · UPI, cards, wallets and net banking accepted | Cash on delivery available. UPI, cards, wallets and net banking too. |

**4. "★ 4.5 · 5,000+ clients" reads as 4.5 from 5,000 ratings.**
- **Where:** head of every product page, `a[href="#customer-reviews"]`.
- **Why:** star, score, count is the usual shape of a rating count. lib/trust.ts says the shop must not claim that: 5,000 is clients served, 4.5 is the owner's rating. The bag and the Reviews heading avoid it with "Trusted by"; the head dropped the words. One line has three forms across page and bag.
- **Change:** one string in all three places: "★ 4.5/5 · Trusted by 5,000+ clients" (fits at 360 beside "BRACELETS"). The link's spoken label is already right.

**5. The button says "cart"; everything else says "bag".**
- **Where:** `#product-actions` and the phone bar say "ADD TO CART". Elsewhere: "Your bag", "View bag", "Applied in your bag", "Add to bag for 20% off…", "Close bag".
- **Why:** the offer line tells her to "Add to bag" and no button carries those words. promo.ts chose the phrase to point at this button, not Buy Now.
- **Change:** "Add to cart" becomes "Add to bag" in both places (fits). If the owner prefers "cart", rename every "bag" instead; one word either way.
- In the markup "Buy Now" is the only button in title case ("Add to cart", "Reserve now", "Checkout"): make it "Buy now". The caps on screen do not change.
- The phone bar shows Buy Now first, the page shows it second: use one order.

**6. Bundle: the gold label goes stale, and the empty state instructs twice.**
- **Where:** `section[aria-labelledby="complete-the-look"]`.
- **What:**
  - "2 PIECES · 10% OFF" never changes. With three ticked it sits over "You save ₹549 · 20% off 3 pieces"; with a filled bag, over "30% off your bag". When it is right it repeats the saving line.
  - Nothing ticked: "Tick a piece to see what the two cost together." above a disabled "TICK A PIECE TO PAIR". On an earrings page "pair" already means two earrings.
  - Clover Trio Edit (three pairs sold as one) is titled "Complete the set" and its own row says "This piece".
  - Notes under single pieces are plural: "Necklaces", "Bracelets".
- **Change:**
  - The label follows the ticks: "3 PIECES · 20% OFF" (filled bag: "30% OFF YOUR WHOLE BAG"), and the saving line becomes "You save ₹549".
  - Nothing ticked: "Tick a piece to add it with this one." and the button "ADD BOTH TO BAG".
  - A piece with a "Set" row in Details: title "Complete the look", note "This set".
  - Notes in the singular: "Necklace", "Bracelet", "Ring", "Earrings".

**7. "Applied in your bag. No code needed." has no subject, and nothing says any pieces count.**
- **Where:** offer panel with an empty bag, every product (`[data-offer-ladder]`).
- **Why:** on an empty bag "Applied" reads as already done. "Buy 2 · 10% off / ₹944 each" on a hoops page reads as two of these hoops. The offer counts any pieces (promo.ts: every product), and no words say so.
- **Change:** "Mix any pieces. The discount applies in your bag, no code needed." (two lines at 360). If it must stay one line: "Mix any pieces. No code needed."

**8. "Pre-order" and "reserve" name the same thing on one screen.**
- **Where:** Baguette Eternity Band with Ruby or US 5 chosen. Chips say "PRE-ORDER"; the note says "Emerald, size 5 is sold out for now. Reserve it and we will confirm the date on WhatsApp."; the button says "RESERVE NOW". Then "Free insured shipping · Gift-boxed" sits directly above the tile "Free shipping / Insured, gift-boxed". The offer line is "Not on pre-orders. In-stock pieces only."
- **Why:** two words for one action; the button does not say it opens WhatsApp; the shipping line is repeated by the tile under it.

| Now | Change to |
|---|---|
| RESERVE NOW | PRE-ORDER ON WHATSAPP (phone bar: PRE-ORDER) |
| … Reserve it and we will confirm the date on WhatsApp. | … Pre-order it on WhatsApp and we will confirm the delivery date. |
| Free insured shipping · Gift-boxed (under the button) | Remove in this state |
| Not on pre-orders. In-stock pieces only. | This offer is for in-stock pieces, not pre-orders. |

- All fit at 360. The Delivery dropdown still says "Cash on delivery available." for a pre-order arranged on WhatsApp: leave it out there.

**9. Rings: stock is said twice, and the stone is named three ways.**
- **Stock:** "US 6 is in stock and ships now." sits above the buttons and "In stock · Arrives 30 Nov – 2 Dec" below. Drop the note for an in-stock size and let the line carry it: "US 6 in stock · Arrives 30 Nov – 2 Dec · Check pincode" (one line at 360).
- **Adjustable rings:** "US 6 ships now. Open-back design — adjustable to fit US 5 to 9 comfortably." becomes "Open-back design, adjustable to fit US 5 to 9."
- **Selector label:** "STONE" over Ruby / Emerald / Amethyst, while Details lists those as "COLOURS" of cubic zirconia, reads as a gemstone claim. Change to "STONE COLOUR".
- **Fourth tick:** "Zircone Stone" is in title case beside "Skin-friendly", and Details says "cubic zirconia". Change to "Zircone stone", and use one spelling for the stone on the page.

**10. The sentence under the price is sometimes mood, not information.**
- **Good:** "Colour all the way round.", "A ball and a drop, almost touching.", "Colour, laid out in a straight line."
- **Weak:** "Texture does the talking here." (no size; "here" points at nothing). "Three ways to wear one idea." never says ₹1,499 buys three pairs.
- **Stale preview:** it still shows "Adjustable version is live!" on Cushion Halo Ring. The source drops it since 14:05 but the preview was built at 13:57, so rebuild before the owner looks.
- **Change:** where Details has a "Set" row, show it: "Three pairs in one set: huggie hoops, clover studs and round solitaire studs." Hoops: "Chunky braided hoops, about 25 mm across." Both come from the listing's own Details.
- **Fact needed for the rest:** a short factual line per piece from the owner. Until then: "Set row first, else the first sentence".

**11. Existing copy in the dropdowns and lower page: errors only.**
- "Order today and it arrives by 30 Nov – 2 Dec.": "by" cannot take a range. Use "arrives between 30 Nov and 2 Dec".
- "…3-year plating assurance — cared for well, it keeps its colour for a lifetime." and "Waterproof and tarnish free": a lifetime and an absolute beside a 3-year assurance and a tick that says only "Anti-tarnish".
- "Questions? Chat with us on WhatsApp" pre-fills, on an in-stock piece, "I'd love to pre-order the "Woven Gold Hoops" from Naira Petite…". On rings it pre-fills "…in Ruby, size 6 Could you share availability…" with no full stop.
- Baguette Eternity Band: Details says "US 5, 6, 7 and 8"; the selector and chart offer US 9.
- "7-day returns — read the policy.": at 390 the dash opens the second line.
- "AS FEATURED IN" (five mastheads) and "Verified buyer" on each review are not on the brief's list of what the shop knows. Keep them only if the owner can show them.

**12. Spoken names and small consistency.**
- Bag progress at five pieces: aria-label "5 of 4 pieces". Stop at "4 of 4 pieces".
- Struck prices carry no words for a screen reader: "₹1,049 ₹1,749 40% off", "Total ₹3,448 ₹3,103", "Adds ₹615₹1,199". Add a hidden "was " inside each `<del>`.
- The offer section's aria-label is "Buy more, pay less" under the visible "BUY MORE, SAVE MORE": use the same words.
- The ticks list is labelled "Made to last", which covers "Skin-friendly" and is a claim: use "Materials and finish".
- "Increase quantity" is the name on every bag line: use "Add one more Woven Gold Hoops".
- Bundle link "Choose size": name it "Choose a size for Baguette Eternity Band".
- Four buttons are named "Open customer photo 1": add the reviewer's name.
- On a laptop "Popular" sits inside the photo button, whose label hides it.
- Bag foot: "You save ₹345 · 10% for 2 pieces" becomes "… 10% off 2 pieces", as in the bundle.
- Bag foot: "Incl. 3% GST. Free insured shipping · arrives 30 Nov – 2 Dec." becomes "Incl. 3% GST · Free insured shipping · Arrives 30 Nov – 2 Dec".
- Empty bag: "MOST LOVED" over the hoops the page marks "POPULAR". Use "POPULAR".
- Error "This product is not available for checkout yet.": use "This piece…".
- A number to know: the page says "₹839 each" at Buy 3 and the bag's row for the same piece says ₹840 (₹734 and ₹735 at Buy 4).

## Right, and must be kept
1. **Nothing counted or timed.** No "only N left", no sold counts; "Popular" rather than "Bestseller" because it is views; "Your total drops ₹550" rather than a negative figure.
2. **"In stock · Arrives 30 Nov – 2 Dec · Check pincode".** Dates, not "3–5 days". The pincode answers are equally plain: "Delivery to 400001 in 3 working days · by Mon, 30 Nov" and "We can't confirm delivery to 999999 here. It is checked with your full address at checkout, before you pay."
3. **One noun everywhere: "piece".** No "item" or "product" on the page or bag; one price form (₹1,049, Indian grouping); "incl. 3% GST" at the price and again at the total.
4. **The price inside the button.** "… · ₹1,049" and "ADD 3 PIECES · ₹2,198", with "₹2,198, ₹2,747 struck · You save ₹549" beside it on an empty bag.
5. **Short reassurances.** "3-year assurance / On the plating" and "Free shipping / Insured, gift-boxed": a short title and what it covers, with no "lifetime" or "premium". Also keep "Woven Gold Hoops removed · Undo" and the spoken sentences "Rated 4.5 out of 5. Trusted by 5,000+ clients. Jump to reviews." and "Pay by UPI, Visa, Mastercard or cash on delivery."

## Outside this work, for the owner
- The policy page's wording (finding 1).
- The top strip's "SITEWIDE SALE LIVE TODAY!" beside an offer the code calls permanent.
- The header's "Open cart" label, if the button becomes "bag".

## Evidence
- Page, bag and bundle text with accessibility names, three pieces: /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-copy/real-p390-after.json
- Tap-through states (bundle, pre-order, pincodes, bag at 0 to 5 pieces): /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-copy/states.log
- Bundle with a filled bag ("ADD 2 PIECES · ₹744"): /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-copy/shots/B-bundle-with-bag.png
- Pre-order screen: /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-copy/shots/C2-ring-size5-preorder.png
- Pincode 800001, the COD contradiction: /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-copy/shots/D-pincode-800001.png
- Bag with one piece, the same fact twice: /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-copy/shots/F-bag-one.png
- Replacements tried at 360px (bag): /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-copy/fit/p360-bag.png
- Replacements tried at 360px (offer line with a filled bag): /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-copy/fit/p360-page-offer-with-bag.png
- Sources read, none edited: /tmp/pdp-renew/src/pages/JewelDetailNext.tsx, /tmp/pdp-renew/src/lib/promo.ts, /tmp/pdp-renew/src/components/pdp/PdpTrust.tsx, /tmp/pdp-renew/src/components/pdp/PdpBundle.tsx, /tmp/pdp-renew/src/components/cart/BagAddOn.tsx, /tmp/pdp-renew/src/components/product/PincodeChecker.tsx, /tmp/pdp-renew/src/lib/serviceability.ts, /tmp/pdp-renew/src/lib/trust.ts, /tmp/pdp-renew/src/pages/ExchangeReturnPolicy.tsx
