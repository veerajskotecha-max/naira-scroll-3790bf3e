# Truth sheet for the Naira product page prototype (verified 13 Nov 2026). Nothing outside this sheet may be stated as fact.

## The piece (Shopify, live)
- Prism Rivière Bracelet: ₹2,399, compare-at ₹3,999. 49 in stock. 18 cm long, fits wrists 15–19 cm. Cushion-cut pastel cubic zirconia about 5 mm each (aqua blue, soft pink, pale yellow, repeating), each in a fine clear pavé halo, continuous line, fold-over clasp. PVD rhodium coating on surgical stainless steel. Listing care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals." Ships in the Naira Petite gift box.
- Photos available (real, in proto/i/ and pdp10/img/): worn on wrist, on plaster block, over blue velvet, macro of stones, from above, Riya's video (the product video is her reel), gift box, size guide. Creator Riya wore it in a paid/barter creator video: label creators as creators.
- Pairing pieces (live): Prism Emerald-Cut Hoops ₹1,299 (cmp ₹1,629, 8 in stock, gold tone, no PVD claim in listing); Prism Pear Drop Necklace ₹999 (cmp ₹1,110, 3 in stock, PVD 18K gold coating); Cushion Halo Ring ₹999 (cmp ₹1,669, 52 in stock, PVD rhodium, adjustable US 5–9).

## Offer, payment, delivery (live)
- Ladder: any 2 pieces 10% off, any 3 20%, any 4 30%, applied automatically in the bag (codes BUY2/BUY3/BUY4 carried to checkout). Per-piece: ₹2,159 / ₹1,919 / ₹1,679 for this bracelet.
- NAIRA10 (10% code) is live but must not be shown on this page (owner rule for these designs).
- Free insured shipping across India. Delivery estimate = today + 3–5 working days (for an order on 13 Nov: 18–20 Nov). It is an estimate, not a courier promise. A pincode checker exists in code (local rules, no courier API).
- COD available. Fastrr adds a 5% COD fee shown in the bag; the owner's rule is that the PDP says only "COD available".
- Prepaid: 55 of ~105 prepaid orders in 30 days carried an exact 5% "PrepaidDiscount" at Fastrr checkout. Treat "extra 5% off when you pay online" as PROPOSED, needs owner confirmation; mark it so in the prototype notes, not as a live fact.
- Checkout is Fastrr (off-site). Buy now goes straight to it.

## Returns (the real policy, /exchange-return-policy)
- Returns only for manufacturing defects, reported within 7 days of delivery on WhatsApp with photos; outcome repair, replacement or store credit; refunds case by case. Worn or customer-damaged items not eligible. The page must NOT promise "7-day returns" or "exchange if it doesn't suit you". Recommending a better policy to the owner is fine, as a recommendation.

## Proof that is real
- Orders: 253 orders ever, 222 shipped (Shopify). 206 orders in the last 30 days. Prism: 10 units sold in 30 days.
- Reviews: NONE collected for this piece. The live 4.9 / 51 reviews are authored text from src/data/productReviews.ts and reviewWall.ts and must not appear. A real review system (e.g. Judge.me or Shopify Product Reviews, request 7 days after delivery, photo reviews) is roadmap.
- WhatsApp: +91 95615 57935 (public in the site footer), https://wa.me/919561557935.
- Instagram: @naira.flore exists (follower count unknown: do not state one).
- Press logos: unverified, must not appear.

## Never on this page
Invented reviews, ratings, "verified buyer", sold counts, FOMO popups, visitor counts, timers, "sale live today", "only N left" unless inventory is <= 5 and true (Pear Drop Necklace: 3 is true), press logos, "hypoallergenic", "skin-friendly", "nickel-free", "3-year plating assurance", "Mumbai atelier", "real silver/gold", bare "18K gold" (say "PVD 18K gold tone/coating" for gold pieces), "diamond", NAIRA10.

## Brand
Fonts: Cormorant Garamond (names, prices, headings) + Jost (everything else). Colours: ivory #FBF3EC, ink #1A1614, sage #99B4AF, deep sage #50726A, gold labels #9A7A3E, blush #FFBDA8. Radius 0 everywhere (the bag's checkout button is the one 10px exception). Elegant, quiet, editorial; no shouting discount badges, no emoji, no gimmicks. Header 77px with the NAIRA logo.

## Measured context
- Traffic: mostly Meta ads, half in the Instagram in-app browser on ~360x640 Android. Design at 360x640.
- Funnel (browser pixel, 28d): PDP view -> add to cart 8.5% (mobile 12–15%); add to cart -> checkout 20% (biggest step loss, flat across ads); checkout -> order ~25%. Android finishes checkout far less than iPhone.
- 68–74% of orders are one piece; AOV ₹1,511; ad cost per order ₹979. Shoppers who buy 2+ use the ladder.
- COD 45% of orders; COD RTO 21% vs prepaid ~1%.
- Live page faults: first screen lacks ladder, add-to-cart, delivery and COD; invented proof; FOMO covers title; dead zone with no usable buy button; hero 3:4 cropped to 1:1; 37 of 38 images load at once; a 3.4 MB reel loads; nothing changes by ad.
