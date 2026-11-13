# Best-in-class jewellery PDP teardown (360x640 phone, 13 Nov 2026)

I loaded each page with Playwright 1.63 (global install, `chromium.launch()` with no options, 360x640, isMobile, hasTouch, DPR 1). For each brand I took a first-screen shot as the page landed, a second one after closing popups, and a full-page shot. I also saved the visible text and a JSON file with the first-screen text, sticky-bar state every 400px of scroll, section order and JSON-LD.

**Treat these as US visits.** Traffic went out through a US IP, so some brands served a US or UK store and showed location popups.

## Brands checked (8 captured, 2 blocked)

| Brand | Product (live URL) | Price |
|---|---|---|
| GIVA | Golden Zircon Joy Tennis Bracelet, giva.co/products/golden-zircon-joy-tennis-bracelet (redirected to checkout.giva.co) | ₹2,299 (MRP ₹4,399) |
| Palmonas | Black Onyx Ring, palmonas.com/products/black-onyx-ring-18k-gold-plated-26849 | ₹1,199 (MRP ₹3,839) |
| Salty | Radiance Tennis Bracelet - Gold, salty.co.in/products/radiance-tennis-bracelet-gold | Rs. 599 (MRP 1,200) |
| CaratLane (premium reference) | Casual Glimmer Diamond Ring, caratlane.com/jewellery/casual-glimmer-diamond-ring-jr12948-1ys300.html | ₹33,573 (MRP ₹41,965) |
| Mejuri | Bold Dot Ring, mejuri.com/products/bold-dot-ring?Material=18k+Gold+Vermeil | $98 |
| Ana Luisa | Céline Eternity Ring, analuisa.com/products/eternity-ring-celine | $75 ($63.75 for members) |
| Missoma (UK store) | Tennis Eternity Stacking Ring, missoma.com/products/tennis-eternity-round-stacking-ring-18ct-gold-vermeil-cubic-zirconia | £125 |
| Astrid & Miyu (US store after the location popup) | Navette Crystal Band Ring in Gold, astridandmiyu.com/products/navette-crystal-band-ring-in-gold | $110 |

**Skipped:**
- **Mia by Tanishq:** "Access Blocked … Geo Location: US" (403), both with curl and with Playwright.
- **Monica Vinader:** Cloudflare "Performing security verification" (403).
- **Shaya:** returns "Store unavailable" (402). It was a stand-in I tried.

**Caveats:**
- **Palmonas:** the first pick, Sparkle Row Tennis Bracelet (181 reviews), was out of stock, so I switched to the ring.
- **CaratLane:** product details, price breakup and reviews never loaded in this session, even with 1.5 s per scroll step. Only the top of the page and the delivery/stores/trial block are reliable.
- **GIVA:** the first load used the www.giva.co template. There the price (at y=565) sat under the fixed buy bar (from y=542), and the JSON-LD said 45 reviews. That screenshot was overwritten. Every later load redirected to checkout.giva.co (a different template, "290 verified ratings"), and the saved files show that one.

## First screen (640px), after closing popups

| | Image | Name | Price | Rating (count) | Offer | Delivery date | COD | Add-to-cart visible |
|---|---|---|---|---|---|---|---|---|
| GIVA | 318px, in a card | yes (y511, under price) | yes ₹2,299 + strike + "48% off" | yes, badge on image 4.84 \| 290 | % only; "Get at ₹1,954 with coupons" sits just below, under the bar | no (pincode, then a map pin) | not on page | yes: sticky "Gift wrap ₹50" checkbox + Buy Now + Add To Cart |
| Palmonas | 360px square | yes | yes + "69% OFF" | no (just below) | top strip "Buy 1 Get 1 Free: B1G1" | no (pincode) | lower, as an icon | bar says **OUT OF STOCK** |
| Salty | 314px + 4 thumbnails (on-wrist, on-hand) | half-covered by a toast | **no** | no | top strip free pouch/tote; toast "Add Rs. 699 more to unlock reward" | "Check Delivery ETA" link only | not on page | yes: sticky quantity + ADD TO CART |
| CaratLane | 315px dark lifestyle shot, "3k+ views", "TRENDING" | yes | yes | no (only "Write a review") | "Flat 20% off on MRP" | no (pincode) | not on page | yes: sticky video-call + Try at Home + Add to Bag |
| Mejuri | 450px grey studio, angled | yes | yes $98 | 4.7, no count | none | no | n/a | **no**: button at y=879, no sticky bar at all |
| Ana Luisa | from y=238 | yes, **above the image** | yes + member price, above the image | **4.8 (90), above the image** | "SALE up to 25%" badge | no | n/a | yes: sticky name + price + member price + Add to Cart |
| Missoma | carousel showing edges of the next images, 9 images | at y=614 | no | no | 2 promo strips | no | n/a | no (sticky bar comes after scrolling) |
| A&M | studio shot, "1/4", "Shop the look" | yes | **only inside the button "ADD TO BAG - $110"** at y=660 | no | n/a | (date further down) | n/a | just below the fold |

**As landed:**
- **Missoma:** a cookie dialog covers most of the first screen.
- **A&M:** a cookie modal, then a "Welcome – select your shipping location" modal.
- **No blocking popup:** GIVA, Palmonas, Salty, CaratLane, Mejuri, Ana Luisa.

**Only Ana Luisa and GIVA showed name, price, rating with count and a buy button all in the first 640px.**

## Section order below the fold
- **GIVA:**
  - Coupon price block ("Final price = ₹1,954").
  - Pincode.
  - "GIVA assures you": 15-Day Returns, 6-Month Warranty, Lifetime Plating, 925 Fine Silver.
  - Coupon codes (NEW15, LOYAL).
  - Gift wrap.
  - Description: 925 silver, "Perfect for sensitive skin", chain 15 + 4.5 cm adjustable, authenticity certificate. A gallery image carries a 4.77 cm dimension line.
  - "Style with… Buy all 3", then You may also like, then See similar.
  - Reviews.
- **Palmonas:**
  - Rating "5 | 32", "25 sold in the last 7 days".
  - Anti Tarnish / Skin Safe chips.
  - Limited Time Offers: Buy 2/3/4 at ₹1,899/₹2,699/₹2,999, "Get it for ₹750" each, codes DIWALI2/3/4 with a "Collect" button.
  - Size 6/7/8 + Size Guide, then pincode.
  - Accordions: Description, Specifications, Supplier Information, Return Policy.
  - Icons: 2 Days Return, 10 Days Exchange, Cash On Delivery.
  - Shop By Offers rail, Similar, Reviews, brand story/FAQ.
- **Salty:**
  - Price, then an app banner.
  - 5 coupon cards, each "OFFER ENDING SOON".
  - "Sending this as a gift?" message card.
  - Colour variants.
  - Gift box upsell (₹99 / ₹199, card ₹10).
  - "Best paired with" checkbox bundle with a running total.
  - 6 accordions, Recommended, Similar.
  - "Loved by creators": 4 shoppable HLS videos.
  - Reviews.
- **CaratLane:**
  - Size "12 (51.8 mm)", metal 14KT, diamond FG-SI, Customise.
  - "Not sure about your ring size? LEARN HOW" (video).
  - "Delivery, Stores & Trial": pincode / Locate Me, Expected Delivery Date, Try at Home (up to 5 designs), Store Availability.
  - Promo banners (instalment plan, gold exchange).
- **Mejuri:**
  - Material + size 4–10 + Size Guide.
  - ATC + wishlist, Afterpay/Klarna line.
  - Description.
  - "Why we love it": Hypoallergenic; "2.5 micron layer of 18k Gold, up to 5x thicker than typical gold plating"; "91% Recycled Sterling Silver".
  - Materials & Specs, open by default: palladium barrier, width 3.6 mm, thickness 1.6 mm.
  - Sustainability; Shipping/Returns/Warranty.
  - Reviews (65).
- **Ana Luisa:**
  - Colour / Style / Size 5–10 + Size guide, then ATC, then in-store pickup note.
  - Spend ladder with progress bars: $65 = 15% + free shipping, $125 = 20%, $175 = 25%.
  - "Why Shop with Ana Luisa": Free Shipping, Free Exchanges & Easy Returns, 2-Year Warranty.
  - Accordions Quality (open: "tarnish-free, water-resistant, and hypoallergenic"), Details, Care, Description.
  - Most Helpful Reviews carousel, Shop the Look (on-hand photo).
  - Reviews, then Q&A.
- **Missoma:**
  - Price + ★ (11).
  - Metal / Stone / Size ("Please select a size", sold-out sizes greyed) + Size Guide.
  - Add to Bag, then "Standard Delivery £3.95, FREE over £100".
  - Accordions:
    - Why You'll Love It
    - Details & Dimensions: band 3.9 mm, stones 2.5 mm, 3.6 g
    - How to Style It
    - Delivery & Returns: 90-Day Returns, 2 Year Warranty, gift wrap at checkout
    - Care
  - More Styles: matching tennis hoops and bracelet, each with its own Add to Bag.
  - Discover More chips, You May Also Like, Reviews.
- **A&M:**
  - ADD TO BAG - $110.
  - Swatches + "Only a few pieces left!".
  - Size + "Find my size", "In Stock - Free Delivery Available", Find in store.
  - Quantity + ATC + "Buy with Shop" express button.
  - Promise lines:
    - "Want it Tue 17th Nov - Wed 18th Nov? Choose Express Delivery at checkout"
    - Free Standard Delivery
    - Free returns
    - 2 year warranty
    - Gifting options available
  - Description.
  - Details: 2.5 micron 18k vermeil, inner diameter 16.3 mm, 1.33 g.
  - Care: avoid water, sweat and cosmetics; store in the pouch.
  - You may also like (ratings on cards).
  - "Our Packaging – The Ultimate Gift".
  - Reviews.
  - "Send a hint to someone!", #MUSESOFAM.

## Sticky buy bar
- **GIVA:** on from landing. It disappears while the in-page Buy Now block is on screen (scroll 2000–2800) and comes back after.
- **Ana Luisa:** on from landing with name, price and member price. It is replaced while the in-page button is in view (400–800).
- **Missoma:** appears once the in-page button scrolls away (name + £125 + Add to Bag) and hides at the footer.
- **A&M:** "ADD TO BAG - $110" appears from about 1200px and stays.
- **Palmonas:** always on, showing strike price + price + button. It reads "OUT OF STOCK" because size 6 is preselected and sold out. Tapping size 7 changes it to "Buy Now / Add to Cart" (checked).
- **Salty and CaratLane:** always on.
- **Mejuri:** none.

## Reviews
- **Ana Luisa (richest):**
  - 4.8 / 90 with a histogram and customer images and videos.
  - Quality/Value scores, plus "Heaviness" and "Fit (small/large)" sliders.
  - Search, sort, "VERIFIED PURCHASER", helpful votes, Q&A.
  - Inconsistent count: it says "8 out of 8 (100%) reviewers recommend" next to 90 reviews.
- **Mejuri:** 65 reviews, "AI REVIEW SUMMARY", search, filter by topics, sort, Verified Buyer, 17 pages.
- **A&M:** 4.9 / 259, "Customers say – AI-generated from customer reviews", summary by topics, search, filters, Verified Buyer.
- **GIVA:** 4.84/5, "290 verified ratings", "GIVA is committed to show genuine and verified reviews", "Images By Customers" (2 + "+20"), 3 short reviews shown.
- **Missoma:** 5.0 / 11, histogram rows you can filter by, "8 out of 9 (89%) recommend", Verified Purchaser.
- **Salty:** 12 ratings (7/3/2 across 5/4/3 stars). It shows 3-star reviews, brand replies and "rating submitted from My Orders". In my capture the widget rendered as an unstyled list with loading spinners.
- **Palmonas:** 5.0 / 32 with every one of the 32 at five stars; text only; "All" filter.
- **CaratLane:** only a "Write a review" button rendered.

## The 12 patterns that matter most for an Instagram-ad shopper on a phone
1. **The first screen answers what it is, what it costs and whether it's good: image + name + price + rating with a count.** Ana Luisa (puts these above the image), GIVA (rating badge on the image, price under it), Mejuri (no count), CaratLane (no rating). Missoma, A&M, Salty and Palmonas push price or rating below 640px.
2. **A sticky buy bar that carries the price and gets out of the way when the in-page button is on screen.** Ana Luisa, GIVA, Missoma, A&M; Palmonas and Salty keep theirs on all the time. Price on the button: A&M "ADD TO BAG - $110".
3. **The offer shown as a rupee result, not a code to work out.** GIVA ("Final price = ₹1,954" and "Get it for ₹X with coupon" on every card), Palmonas ("Get it for ₹750 with offers").
4. **Multi-buy or spend ladder you can see, with progress.** Ana Luisa (15/20/25% tiers with bars), Palmonas (Buy 2/3/4 chips and a filtered product rail), Salty (free-gift thresholds and a progress toast).
5. **A delivery promise as a date.** A&M shows a dated window without asking anything. Palmonas, after a pincode, shows "Free Delivery by 16th November" (3 days out). CaratLane shows "Expected Delivery Date" after a pincode. GIVA cards say "Get it in 24 hrs - 3 days". All four Indian brands ask for a pincode first; GIVA also wants a map pin.
6. **A payment reassurance line next to the button.** Palmonas (Cash On Delivery icon), Mejuri (Afterpay/Klarna), A&M (Shop Pay). Among the four Indian sites, only Palmonas states COD on the product page. GIVA, Salty and CaratLane don't mention it in the rendered text or the server HTML.
7. **A trust row with numbers, near the button.**
   - GIVA: 15-day returns, 6-month warranty, lifetime plating, 925 silver.
   - Mejuri: 2 Year Warranty and Free Returns, as a strip right under the image.
   - Ana Luisa: free shipping, exchanges and returns, 2-year warranty.
   - A&M: free delivery, free returns, 2-year warranty, gifting.
   - Palmonas: 2 Days Return, 10 Days Exchange, COD.
8. **Material claims you can measure, plus size and scale.**
   - Mejuri: 2.5 micron, "5x thicker than typical plating", 3.6 x 1.6 mm.
   - A&M: 2.5 micron, 16.3 mm, 1.33 g, and honest care advice.
   - Missoma: 3.9 mm band, 2.5 mm stones, 3.6 g.
   - GIVA: 15 + 4.5 cm adjustable, a 4.77 cm dimension overlay, authenticity certificate.
   - Ana Luisa: "tarnish-free, water-resistant, hypoallergenic" backed by testing.
9. **Reviews with substance:** a count and histogram, customer photos, search or topics, a verified label, AI summaries. Ana Luisa, Mejuri, A&M, GIVA, Missoma. Salty showing 3-star reviews with brand replies reads as credible.
10. **Size certainty.**
    - Missoma: no silent default size, "Please select a size", sold-out sizes greyed.
    - CaratLane: size shown with mm, plus a "LEARN HOW" video.
    - A&M: "Find my size".
    - Ana Luisa: fit slider in reviews and a sizing Q&A.
    - Mejuri: Size Guide next to the selector.
11. **A gift option where people buy.**
    - GIVA: a ₹50 gift-wrap checkbox inside the sticky bar.
    - Salty: message card and boxes at ₹99 / ₹199.
    - A&M: a packaging section ("The Ultimate Gift") and "Send a hint".
    - Missoma: gift wrap at checkout.
12. **Complete-the-look cross-sell with one-tap add, plus on-body and creator media.**
    - Cross-sell:
      - Missoma: matching hoops and bracelet with their own Add to Bag.
      - GIVA: "Buy all 3".
      - Salty: "Best paired with" checkboxes and a running total.
      - A&M and Ana Luisa: Shop the Look.
    - On-body and creator media:
      - Salty: on-wrist thumbnails and 4 creator videos.
      - Mejuri: second image on a hand.
      - Ana Luisa: customer images and videos.
      - A&M: #MusesofAM.

## 5 things to avoid
1. **Preselecting a sold-out variant.** Palmonas' ad-landing screen reads "OUT OF STOCK" while size 7 is in stock.
2. **Covering the first screen.** Missoma's cookie dialog, A&M's cookie and location modals, Salty's reward toast over the product name, and GIVA's www template with the bar over the price.
3. **Urgency that never ends or can't be checked.**
   - Salty: "OFFER ENDING SOON" on all 5 coupons, with no end date.
   - Palmonas: "25 sold in the last 7 days".
   - A&M: "Only a few pieces left!".
   - CaratLane: "3k+ views" and "TRENDING".
4. **Inflated MRP anchors and discount stacking the shopper has to work out.**
   - Inflated MRP anchors: Palmonas 69% off ₹3,839, Salty "Save 50%".
   - Discount stacking:
     - GIVA: 48% off, then a coupon, then two more codes. Its "Buy all 3 … 47% off" is just the three sale prices against the three MRPs (₹12,497 vs ₹23,397), with no extra bundle saving.
     - Salty: 5 codes.
     - Palmonas: B1G1 plus DIWALI2/3/4.
5. **Review numbers that don't add up or look too perfect.**
   - Palmonas: 32 of 32 reviews are five stars.
   - Ana Luisa: "8 of 8 recommend" next to 90 reviews.
   - GIVA: 45 vs 290 for the same piece on its two templates.
   - Salty: an unstyled review widget.

## Files
All in /tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/pdp10/bench/:
- `<brand>-fold.png`: first screen as landed.
- `<brand>-fold-clean.png`: first screen after closing popups.
- `<brand>-full.png`: full page. caratlane-full.png is 5355px wide because that page overflows sideways; a 360px crop is at /tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/pdp10/dl/caratlane-full-360.png.
- `<brand>-text.txt` and `<brand>.json` (first-screen text, sticky-bar log, section order, JSON-LD).

Brands are giva, palmonas, salty, caratlane, mejuri, analuisa, missoma, astridmiyu.

Side-by-side review sheets are in /tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/pdp10/sheets/. The Palmonas screenshot after picking size 7 is /tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/pdp10/dl/palm-size.png. Scripts are in /tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/pdp10/scripts/ (capture.js, accordions.js, pincode.js, gallery.js, tiles.py, sheet.py, summ.py).