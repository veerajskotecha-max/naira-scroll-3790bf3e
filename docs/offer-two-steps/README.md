# Buy-more offer: Buy 2 = 10%, Buy 3 = 15%, Buy 4 removed

25 Nov 2026. **Built and checked. NOT on `main` yet, and nothing in Shopify has
been touched.** The work is one commit, `c18a5c8b`, on top of `main` as it
stood at `9287744f`, saved beside this file as `offer-two-steps.bundle`.

## What the owner asked

Sent with a screenshot of the live bag (four pieces, "Buy 2 · 10% off / Buy 3 ·
20% off / Buy 4 · 30% off", "includes 30% off 4 pieces"):

> Keep buy 2 get 10% and buy 3 get 15 only on the cart on additional offers.
> Remove buy 4 offer

## What a shopper gets

| Pieces in the bag | Live today | After this change |
|---|---|---|
| 1 | nothing | nothing |
| 2 | 10% off | 10% off |
| 3 | 20% off | **15% off** |
| 4 or more | 30% off | **15% off** (Buy 4 is gone) |

- **Bag:** the strip reads "Buy 2 · 10% off" and "Buy 3 · 15% off". Three or
  more pieces take 15%. The bag stops suggesting another piece at three
  (there is no further step to reach).
- **Product page:** the "Buy more, save more" panel has two steps, each priced
  for the piece; the "Complete the look" bundle totals at 10% for two pieces
  and 15% for three or more.
- **Header strip:** "BUY 2 GET 10% OFF · BUY 3 GET 15% OFF". **Home line:**
  "Up to 15% off when you buy more".
- A BUY4 typed by hand, or left in a browser from before, is ignored and
  never reaches the checkout.

The four-piece bag in the owner's screenshot came to ₹6,017 at 30%. Worked
from that figure (₹8,596 before the offer), it comes to about ₹7,307 at 15%.

Pictures of the built site are in `screens/`: the bag at two, three and four
pieces (real pieces at their real prices: ₹3,103, ₹3,780 and ₹4,374) and the
product page's offer panel. `pictures.cjs` takes them; like `walk.cjs`, it
lets no write and no tracking request leave.

## The code

One file changes in its code: `src/lib/promo.ts`.

```
 PROMO_DISCOUNTS   BUY3: 0.2 → 0.15      BUY4: 0.3 → removed
 QUANTITY_OFFERS   BUY3 rate 0.2 → 0.15  BUY4 (4 pieces, 0.3) → removed
```

Every screen reads the offer from there. The other 36 files in the commit are
tests (the rates are pinned as literals on purpose, each figure worked by
hand), comments, and the notes in `CLAUDE.md`, `AGENTS.md` and `roadmap.md`.
`src/contexts/CartContext.tsx` changes in two comments only; this was checked
by comparing every source file with its comments stripped.

## To make it live, in this order

1. **Put the commit on `main`.** From an up-to-date `main`:
   `git fetch docs/offer-two-steps/offer-two-steps.bundle offer-two-steps && git merge --ff-only FETCH_HEAD`
   (if `main` has moved since `9287744f`, make it a real merge commit; never
   rebase or force-push), then push.
2. **Press Publish in Lovable.** Committing is not deploying.
3. **Only after it is live, in Shopify admin → Discounts:**
   - `BUY3`: change 20% to 15% (and its title, "BUY3 — extra 20% off 3 or
     more items").
   - `BUY4`: deactivate ("BUY4 — extra 30% off 4 or more items").
   - Leave `BUY2` (10%) and `NAIRA10` (10%) as they are.

Why this order: the change lowers what the bag gives. If Shopify moved first,
the live bag would promise 20% and 30% that the checkout no longer gave. Done
this way round, the only gap is in the shopper's favour: between steps 2 and
3 a three-piece order is charged 20% off where the bag quoted 15%. So do step
3 soon after step 2.

Read from Shopify on 25 Nov 2026 (read only): BUY2 10%, BUY3 20%, BUY4 30%,
NAIRA10 10%, FRIENDSANDFAMILY 20%, all five active.

To undo after it is on `main`: `git revert <the commit>`, Publish, and set
Shopify back.

## Two things for the owner

1. **"Only on the cart".** This was read as "keep only these two offers".
   The same two offers therefore show wherever the offer is named: the bag,
   the product page panel, the header strip and the home line. They have to
   agree, because the bag charges by them. If it meant "show the offer in the
   cart and nowhere else", that is a second, small change.
2. **FRIENDSANDFAMILY (20%)** now beats the buy-more offer on every bag. It
   used to tie Buy 3 at three pieces and lose to Buy 4. In Shopify it covers
   jewellery only, so an outfit in a bag with that code would be quoted 20%
   off and charged full price. Keep, lower or retire it: the owner's call.

## Checks

- `npx tsc --noEmit -p tsconfig.app.json`: clean. ESLint on every changed
  file: clean (one old warning in CartContext, not from this change).
- `npx vitest run`: 1,214 of 1,215 pass. The one failure is
  `src/hooks/useReels.test.ts`, which fails on `main` too and always has.
- `npm run build`: 239 of 239 pages pre-rendered. No built file still names
  Buy 4, "GET 20%", "GET 30%" or "Up to 30%".
- `walk.cjs` (in this folder) against the built site in a real browser, every
  write refused and every tracking request aborted. It passed:

  | Bag | Total | Says | Strip |
  |---|---|---|---|
  | 1 piece (₹1,049) | ₹1,049 | suggests "A second piece takes 10% off your bag" | nothing marked |
  | 2 pieces (₹3,448) | ₹3,103 | "includes 10% off 2 pieces"; suggests "A third piece takes 15% off your bag" | Buy 2 |
  | 3 pieces (₹4,447) | ₹3,780 | "includes 15% off 3 pieces"; no suggestion | Buy 3 |
  | 4 pieces (₹5,446) | ₹4,629 | "includes 15% off 4 pieces" | Buy 3 |
  | 5 pieces (₹6,945) | ₹5,903 | "includes 15% off 5 pieces" | Buy 3 |
  | 3 pieces, NAIRA10 typed | ₹3,780 | the step's 15% wins over the code's 10% | |
  | 3 pieces, FRIENDSANDFAMILY typed | ₹3,558 | "includes 20% with your code" | |
  | 4 pieces, BUY4 left in storage | ₹4,629 | the old code is ignored | |

  Product page (₹1,049 piece): "Buy 2 · 10% off · ₹944 each", "Buy 3 · 15% off
  · ₹892 each"; with two other pieces in the bag: "Add to bag and everything
  in it gets 15% off. Your total goes up by ₹722, not ₹1,049."; with three:
  "Your bag already has 15% off. This piece gets it too."
