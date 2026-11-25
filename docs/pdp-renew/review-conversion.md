CONVERSION REVIEW: Naira renewed product page and bag (report only, nothing edited)

Walked live on the preview at 360x640, 390x844 and in-app heights (390x700, 360x560, 375x620), on hoops, three rings, a set and a bracelet, with empty and filled bags. My evidence pictures are in /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/cro-review/out/ (file names given below are in that folder).

Reel lessons, in short
- Applied well: honest mark on the photo, rating beside the name, saving as a tag, price in the one filled button, date under it, reassurance and pay marks under that, pre-selected chips with a size guide, bag with offer strip, struck total and returns under Checkout.
- Applied weakly: reassurance (off the first screen on Instagram-sized phones), the offer (reads as "two of the same", and the buttons ignore the bag), customer proof (72px, three screens down), the bundle, the bag's add-on.
- Missing, addable from facts the shop has: a video and worn-shot cue in the gallery, date and COD for her own pincode beside the button, the MRP saving in the bag, Indian ring sizes.

On testing: the code's own note says 16 orders in 1 to 15 October, about one a day. A split read on orders will not settle in weeks. Where I say "test", run each version two weeks back to back and read taps (Clarity already records bag_opened, bag_pair_added, bag_checkout_tapped), not orders.

FINDINGS, most important first

1. No cash on delivery, returns or delivery word on the first screen of an Instagram-sized phone; on shorter screens no buy button either.
Where: 360x640 and 390x700. First screen is photo, name, price row (#product-price, y 543 to 567 at 360), then the pinned bar (.rn-bar, y 575 to 640), which repeats the price 8px below it. .rn-trust starts at y 790, its COD cell near y 850. At 360x560 and 375x620 the bar steps aside for the price and Add to cart sits at y 680 to 740, so nothing to buy with is on screen (first-390x700.png, first-360x560.png).
Why: "can I pay on delivery, can I send it back" is this visitor's trust question, and it is answered 1.3 screens down.
Change: one line between #product-price and .rn-lede: "Cash on delivery · Free shipping · 7-day returns", Jost 12px/18px, --nc-muted, "Cash on delivery" in --nc-ink weight 500, margin-top 6px. Photo height min(100vw, 100svh − 300px), floor 240px: 340px instead of 360px at 360x640 so the line clears the bar, and the bar returns on 360x560 and 375x620. Facts: the shop's delivery terms and returns policy.

2. With pieces in the bag, the buttons ignore it: Buy Now checks out this piece alone at full price, and the button quotes ₹1,499 where adding costs ₹855.
Where: any product page with a non-empty bag, #product-actions and .rn-bar. Walked on clover-trio-edit with &bag=1: Buy Now made a separate one-piece cart for checkout (₹1,499, no code) and left three pieces in the bag, on the screen where the offer line says "it adds ₹855, not ₹1,499" (G-pdp-with-bag-390.png; CartContext.buyNow: "only this one goes to checkout").
Why: she is the shopper the offer exists for. She pays full price for one piece, or meets a checkout that does not match her bag.
Change (page only, cart untouched), when the bag holds pieces and this is not one of them: above the buttons one line, 13px/20px, --nc-gold #876629: "With the 2 in your bag: 20% off everything. This adds ₹855, not ₹1,499." (the sentence now at the foot of the offer panel, about 300px lower). Filled button: "ADD TO BAG · +₹855" (promo.ts addOnEffect().adds). Second button, page row and bar: "VIEW BAG · 2" in place of "BUY NOW". If the owner wants Buy Now kept there: "BUY ONLY THIS · ₹1,499".

3. Once this piece is in the bag, the page sells it again and the bundle adds it twice.
Where: woven-gold-hoops after Add to cart. .rn-offer__line reads "Add to bag for 10% off everything: it adds ₹839, not ₹1,049." (a second pair); buttons unchanged; the bundle's fixed first row still counts: "Adds ₹1,429", "ADD 2 PIECES · ₹1,429". Pressing it leaves Woven Gold Hoops ×2 (₹1,679) plus Toggle Link Chain, ₹2,478; she meant hoops plus chain, ₹1,843 (N-bundle-after-add-390.png, N-bag-after-bundle-390.png).
Why: add first, then "Complete the look" is the natural order, and it ends in a dearer, wrong order.
Change, when the bag holds this piece in this choice: offer line "In your bag. Any one more piece takes 10% off both."; buttons "VIEW BAG · 1" (filled) and "ADD ANOTHER" (outline); bundle first row note "In your bag", not added again; sum "Adds ₹794" with ₹999 struck, "10% off your bag"; button "ADD 1 PIECE · ₹794".

4. "Cash on delivery" is promised to everyone, the page's own pincode rules refuse it for whole regions in words that blame her area, and a checked pincode never reaches the button.
Where: .rn-trust fourth cell, [data-pay-line], Delivery dropdown, PincodeChecker. 122002 (Gurugram), 121001 (Faridabad) and 800001 (Patna) answer: "Cash on Delivery is unavailable for this pincode (high return rate on COD in this region). Prepaid only…", printed directly under "Cash on delivery available." (C-pincode-gurgaon-390.png). lib/serviceability blocks prefixes 121 to 122, 180 to 194, 202 to 205, 273 to 277, 781 to 799, 800 to 855. "Check pincode" opens a field about 750px below the buttons.
Why: COD is the promise this audience leans on; withdrawn with that reason, it costs the order and the goodwill.
Change: COD cell detail "On most pincodes · check yours" (tap opens the checker). Refusal: "Prepaid only at 122002: UPI, cards, wallets or net banking. Free insured shipping and 7-day returns apply." No reason given. Open the field in place under the buttons; after a check [data-ship] reads "In stock · To 560001 by Wed, 2 Dec · COD available · Change" (or "· Prepaid only ·"); the checker already works out both and remembers the pincode. Drop "Cash on delivery" from [data-pay-line] (it repeats the cell 30px above) and put "Questions? WhatsApp us" there, the link now hidden in the dropdown.
Facts needed from the owner: whether Shiprocket's checkout refuses COD on the same list (if not, the page turns COD buyers away for nothing); whether 121 to 122 is meant to cover all of Gurugram and Faridabad (the code's note names only Mewat, Palwal and Nuh).

5. The photographs that sell jewellery are buried and the video lost its shortcut.
Where: phone gallery, woven-gold-hoops. Slide 4 is worn on the ear, slide 7 the size guide ("Hoop 25 mm across"), slide 8 the reel. Today's page has a "▶ Video" chip on photo 1; the renewed page has nothing. .rn-tag (Popular) rides over every slide and covers the size guide's note and the reel's captions (M-slide-7.png, M-slide-8.png).
Why: these visitors arrive from video, and "how big is it on me" is the doubt a ₹1,049 pair of hoops has to clear.
Change: slide order hero, worn, reel, size guide, the rest, gift box last. On slide 1, bottom right, a mark in .rn-tag's style: "▶ VIDEO" (tap jumps to the reel). Popular on slide 1 only. Add the Details row's size to the sentence under the price: "Texture does the talking here. 25 mm across." Facts: the piece's own photos, reel and spec.

6. The bag forgets the saving the product page showed.
Where: bag, every size. One piece: "Woven Gold Hoops ₹1,049", "Total ₹1,049", then a line about a second piece; no ₹1,749, no 40%. Two pieces (boards/bag-phone-390.png): "You save ₹345" where the same two are ₹2,645 under MRP. CartDrawerNext computes mrpOf, mrpTotal and youSave and draws none of them.
Why: two-thirds of orders are one piece (promo.ts note), and for them the bag shows no saving at the moment of Checkout. The reel's cart strikes the old price on every line and at the subtotal.
Change: each line, MRP struck under the name (del, 13px, --nc-muted): "₹1,749". Total row: MRP total struck, then the total. Gold line: "You save ₹700 on MRP" (one piece); "You save ₹2,645 on MRP · includes 10% for 2 pieces" (two). Fact: Shopify's compare-at price, the one the product page strikes.

7. The bag's one-tap suggestion is hidden on small phones and often asks for a dear piece.
Where: bag at 360x640. [data-bag-foot] is 253px (40% of the screen), the list 288px. With 2 pieces [data-bag-addon] sits at y 344 to 452 under a list that ends at 387: heading visible, ADD button not. With 3 pieces it is wholly out of sight (F-bag-3-p360.png). Choice (lib/pairings bagAddOns): by pairing score, ties by stock depth, so a ₹2,198 three-piece bag is offered Bold Nocturne Chain, "Adds ₹984", and a ₹899 ring's bag Baguette Huggies, "Adds ₹989".
Why: this row is the bag's lever on order size; half the visitors cannot see its button, and ₹984 is a second purchase, not a top-up.
Change: [data-bag-addon] position: sticky; bottom: 0 inside [data-bag-list]. On screens 700px tall or less: foot without the rating line (−24px), terms on one line "Free insured shipping · arrives 30 Nov – 2 Dec" with the label "Total incl. GST" (−20px), line photo 56x70. Words: "+₹214 to your total" then ₹699 struck; button "ADD · ₹214".
Test, not decide: A, best match (now); B, among pieces that pair at all, the one that adds least (Ribbon Bead Bracelet ₹699 takes that three-piece bag to 30% for ₹214; Brushed Gold Huggies adds ₹539 to the ring's bag). Read bag_pair_added per bag_opened.

8. The offer reads as "two of the same piece". Its place is right while the bag is empty.
Where: [data-offer-ladder], y 961 to 1105 at 360x640: "BUY MORE, SAVE MORE / Buy 2 · 10% off / ₹944 each … Applied in your bag. No code needed."
Why: "Buy 2 … ₹944 each" on a hoops page says two pairs of these hoops; nothing says any pieces count. Under the reassurances is the right place for an empty bag (trust first, and the strip above the header already announces it); with pieces in the bag its selling sentence belongs at the button (finding 2).
Change: label "MIX ANY PIECES, SAVE MORE"; steps "Any 2 · 10% off" / "this one ₹944", "Any 3 · 20% off" / "this one ₹839", "Any 4 · 30% off" / "this one ₹734"; foot "Any pieces count. Applied in your bag, no code."
Test, not decide: A, the panel only; B, also one line under the price, 13px, --nc-gold, linking to the panel: "₹944 with any second piece". Read add-to-cart taps and pieces per order.

9. Proof sits three to five screens down at thumbnail size.
Where: reviews start near y 1,860, after the bundle; the creator reel near y 2,950; customers' own photographs are 72px squares inside review rows.
Why: the reel's pages put customers straight under the reassurance; a first-time visitor rarely scrolls three screens to learn whether the piece is real.
Change: under [data-pay-line], before the offer panel: a strip labelled "FROM OUR CLIENTS" (nc-label), the seven customer photographs in reviewWall realReviews, this piece's first, 96px squares in one row that scrolls sideways, tap opens the existing photo dialog; under it "★ 4.5 · 5,000+ clients, online and at exhibitions · Read reviews". About 150px.
Facts: the photographs, and "served 5,000 clients offline at exhibitions" (the owner, lib/trust). Owner to confirm: the two reviews without photographs, S. K. and P. D., share almost every phrase and would lead the Blush Cluster Ring's list (read from the data file; that page is not in the preview).

10. Rings: a choice that changes nothing, a size sold unseen, US sizes only, a dead end at pre-order.
- Adjustable rings (14 of the 24 rings, ringFit.ts "one stock per ring"): five size chips, all "ships now", under "adjustable to fit US 5 to 9". Change: one line, "One size · adjusts to fit US 5 to 9", plus "Size guide"; the order note stays US 6. Fact needed: does the workshop set the size before dispatch? If yes, keep the chips and say "We set it to your size before it ships."
- Sized rings (baguette-eternity-band, 360x640): the bar sells the pre-selected size before the chips (y 700 to 900) are seen; one tap put "Stone: Emerald · Size: 6" in the bag. Change: the bar's second price line reads "Size 6" in place of the struck MRP, and tapping it scrolls to the chips.
- Sizes are US only. Change: the Indian size under each chip and a column in the chart; the chart's own circumferences give about 9, 12, 14, 17, 20 for US 5 to 9 (mm minus 40; owner to confirm).
- "Emerald, size 7 is sold out for now" leaves one button, RESERVE NOW, which opens WhatsApp. The page knows Amethyst has size 7 and Emerald has 6, 8, 9. Change: under the note, "In stock now: Amethyst in 7 · Emerald in 6, 8, 9" as links; button "RESERVE ON WHATSAPP".

11. The bundle's label contradicts its total, one row leaks, and the bar competes with its button.
Where: .rn-panel "Complete the look". The tag stays "2 PIECES · 10% OFF" while the sum says "20% off 3 pieces" (raw/flow-2-bundle-three.png) or "30% off your bag". "Choose size" on the fourth row leaves the page; Back returns to the top with the ticks reset. At the bundle the bar shows "₹1,049 BUY NOW / ADD TO CART" 24px under "ADD 2 PIECES · ₹1,843" (H-bundle-with-bar-p360.png).
Change: the tag follows the sum ("3 PIECES · 20% OFF"); under the sum, while a step remains: "Tick one more: 20% off all three" (13px, --nc-gold); only one-tap pieces in the bundle (three tickable rows, rings stay in "More"); the bar steps aside while [data-bundle-add] is on screen, as it already does for the offer's steps. Keep the pre-ticked first match: nothing reaches the bag without the labelled button.

12. Keep the pairing, make it consistent, test the emphasis.
- Add to cart filled with the price and Buy Now outlined is right while the offer needs the bag, and the bar is the first-screen buy button for every in-app visitor. But the order flips: page row is Add then Buy, bar is Buy then Add, so at 360x640 the filled button jumps sides after 100px of scroll. Change: page row in the bar's order, Buy Now (112px) left, Add with price right.
- Test, not decide: A as now; B "BUY NOW · ₹1,049" filled and wide, "ADD TO BAG" outlined. Two-thirds of orders are one piece and Buy Now is one tap to checkout, but B may cut pieces per order. Read checkout starts per 100 product views and pieces per order.
- Words: the button says "cart", everything else "bag" ("Add to bag for 20% off…" has no button of that name): "ADD TO BAG". "5,000+ clients" to "customers" if the owner agrees. The fourth tick, "Zircone Stone", wraps the tick row to a second line and reads as a misspelling: the stone's proper name, owner to confirm.

RIGHT, AND MUST BE KEPT

1. Only true proof: the made-up "6 pieces sold in the last 48 hours" and "4.9 · 50 reviews" are gone; "Popular" comes from real views; the rating and client count are the owner's; reviews are the photographed ones.
2. One filled button with the price in it and "In stock · Arrives 30 Nov – 2 Dec · Check pincode" directly under it; at 390x844 name, price, benefits, both buttons and the date fit the first screen.
3. Every rupee is the checkout's own arithmetic (promo.ts): "it adds ₹855, not ₹1,499", "Adds ₹355" beside ₹699 struck, the struck total, the bundle's sum. It is the most persuasive copy on the page.
4. Choices: an in-stock option pre-selected, the chosen chip filled, "Pre-order" inside the chip, the size guide beside the label, the stock sentence under it.
5. The bar's rule (either the page's buttons or the bar is on screen, never over the price), and the bag opening at the tap, Undo on remove, ways to pay above Checkout and returns under it.

Note for the build: the preview still shows "Adjustable version is live!" under Cushion Halo Ring's price; the source (renew.ts ledeOf, uncommitted) already drops it. Rebuild before the owner sees it.
