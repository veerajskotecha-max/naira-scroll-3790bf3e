# Three stores rated, and the conversion rate before the redesign

Written 25 Nov 2026, 21:30 UTC (03:00 IST on 26 Nov), at the owner's ask: "check
our previous conversion rate and also rate store 1 (old one, 1 week ago), store
2 (today's live one), store 3 (current changes). Check graphics, ease of use
and rate each on 10."

The scores are a judgment from the pictures and measurements in `stores/`
(same phone, 390x844, same piece). They are not test results: only orders
over one to two weeks can say which page sells more.

## The scores

| | Graphics | Ease of use | Overall |
|---|---|---|---|
| Store 1: the site as built on 16 Nov | 5.5 | 6.5 | 6 |
| Store 2: the renewed page as it went live on 25 Nov (Buy 2 / 3 / 4) | 8 | 8 | 8 |
| Store 3: the same page with Buy 2 = extra 10%, Buy 3 = extra 20% | 8 | 8.5 | 8 |

### What was measured on the first screen

| | Store 1 | Store 2 | Store 3 |
|---|---|---|---|
| Typefaces | 4 | 2 | 2 |
| Text sizes | 10 (9.5 to 23px) | 6 (10 to 26px) | 6 |
| Pieces of text under 12px | 30 | 11 | 11 |
| Text colours | 8 | 5 | 5 |
| Name | 22px ornate capitals | 26px plain | 26px plain |
| Buttons end at (of 844px) | 810 | 746 | 746 |
| Add button | "Add to cart" | "Add to bag · ₹1,049" | same |
| Page length | 4.1 screens | 5.2 screens | 5.2 screens |
| Saving the bag states (same three pieces, same ₹3,558 total) | ₹889 | ₹3,619 (against MRP) | ₹3,619 |

### Why

- **Store 1.** A strong photo, but the first screen stacks five boxed blocks
  before the buttons in four typefaces, most of it under 12px. The name is in
  ornate capitals and the price in old-style numerals, both slow to read. It
  did put the offer box, a per-piece rating ("4.9 · 50 reviews") and "6
  pieces sold in the last 48 hours" above the buttons; the renewed page
  dropped the last two under the rule to show only what the shop can prove.
- **Store 2.** One typeface and a clear order: name, price, saving, one line,
  three ticks, buttons. The buttons sit 66px higher and the Add button carries
  the price. Stock, delivery date and pincode are right under them, then four
  reassurances. The bag states the whole saving against MRP and offers one
  piece one tap away. Against it: the offer panel is now below the buttons,
  the page is a screen longer, and on a 360x640 phone the main buttons start
  below the first screen (the pinned bar covers that).
- **Store 3.** The same page. Two steps read faster than three and "extra"
  answers whether the offer comes on top of the 40% already shown. The cost:
  at three pieces the bag no longer suggests a fourth, and the most a bag can
  earn is 20%, not 30%.

## The conversion rate before the redesign

Meta pixel events from the site's browser pixel, Shopify orders. Events are
not people, and some hours carry hundreds of desktop product views with no
add-to-cart at all, so the real rate for human visitors is higher than these.

| | 11–17 Nov | 18–24 Nov |
|---|---|---|
| Product views | 14,794 | 11,780 |
| Add to cart | 755 (near 656 once a double count on 11–12 Nov is removed) | 541 |
| Checkout started | 308 | 252 |
| Shopify orders | 56 | 46 |
| Sales | ₹1,06,645 | ₹85,675 |
| Product view → add to cart | 5.1% (4.4% corrected) | 4.6% |
| Add to cart → checkout started | 41% | 47% |
| Product view → order | 0.38% | 0.39% |

About 4 orders for every 1,000 product views, in both weeks.

**The redesign cannot be judged yet.** When this was read it had been live
for about one hour of night traffic: 6 add-to-carts, no checkout started, no
order. It needs one to two weeks.

## Two things in the numbers the owner should know

1. **Every order since 22 Nov came through Shopify's own checkout, not
   Fastrr.** By sales channel: Fastrr 8, 7, 9, 9, 6 orders a day on 17–21 Nov;
   on 22 Nov one Fastrr order and seven "Lovable"; then "Lovable" only (4, 1,
   3). The site is still built to open Fastrr first and falls back to
   Shopify's checkout when Fastrr cannot start, and nothing in the site's
   checkout code changed between 16 and 25 Nov. Orders went from about 8 a
   day to about 4 a day across the same days, with traffic also down on 23–24
   Nov. This started three days before the redesign. The Shiprocket / Fastrr
   account is the thing to check.
2. **Buy 4 carried the biggest orders.** 7–25 Nov, by discount code: BUY4 13
   orders, 68 pieces, ₹58,085 (9% of orders, 22% of sales, ₹3,896 an order);
   BUY3 14 orders, ₹38,503; BUY2 12 orders, ₹22,011; no code 103 orders at
   ₹1,173 an order. Without Buy 4 those baskets pay about 14% more. That is
   margin gained on each one and a risk that some shrink; the share of
   three-or-more-piece orders is the number to watch for two weeks.
