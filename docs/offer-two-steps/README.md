# Buy-more offer: Buy 2 = extra 10%, Buy 3 = extra 20%, Buy 4 removed

25 Nov 2026, the owner's ask, in two messages an hour apart:

> Keep buy 2 get 10% and buy 3 get 15 only on the cart on additional offers.
> Remove buy 4 offer

> Buy 3 keep 20% not 15.... so only buy 2 and 3 remain! 10 and 20% offer shown
> as extra discount on current discount

## Where things stand

| | Offer it shows | State |
|---|---|---|
| The live site (nairaflore.com) | Buy 2 = 10%, Buy 3 = **15%**, no Buy 4 | Published the evening of 25 Nov from `main` at `c18a5c8b`, the first reading of the ask. **Not what the owner wants.** |
| `main` | the same (`c18a5c8b`) | |
| The corrected version | Buy 2 = **extra 10%**, Buy 3 = **extra 20%**, no Buy 4 | Commit `cf0a0b57` on top of `c18a5c8b`. Built and checked. Kept here as `offer-two-steps.bundle` until the owner says to send it to `main`. |
| Shopify | BUY2 10%, BUY3 20%, BUY4 30%, all active | Untouched. Read only. |

While the 15% version is live, a three-piece order is charged 20% off
(Shopify's BUY3) where the bag quotes 15%: the shopper pays less than quoted.

## What a shopper gets with the corrected version

| Pieces in the bag | Before 25 Nov | Corrected version |
|---|---|---|
| 1 | nothing | nothing |
| 2 | 10% off | extra 10% off |
| 3 | 20% off | extra 20% off |
| 4 or more | 30% off | extra 20% off (Buy 4 is gone) |

"Extra" because the offer comes off the price a piece already sells at, on top
of its saving on MRP. It is said that way wherever the offer is stated:

- **Bag:** "Buy 2 · extra 10% off", "Buy 3 · extra 20% off"; the saving line
  reads "You save ₹3,619 · includes extra 20% off 3 pieces". The bag stops
  suggesting another piece at three.
- **Product page:** the panel's two steps read "Extra 10% off" and "Extra 20%
  off", each priced for the piece.
- **Header strip:** "BUY 2 GET EXTRA 10% OFF · BUY 3 GET EXTRA 20% OFF".
  **Home line:** "Up to extra 20% off when you buy more".
- A BUY4 typed by hand, or left in a browser from before, is ignored.

Pictures of the built site are in `screens/` (real pieces at their real
prices: two pieces ₹3,103, three ₹3,558, four ₹4,117).

## To make it live, in this order

1. **Put `cf0a0b57` on `main`** (needs the owner's word). From `main` at
   `c18a5c8b`:
   `git fetch docs/offer-two-steps/offer-two-steps.bundle offer-extra && git merge --ff-only FETCH_HEAD`
   (a real merge commit if `main` has moved; never rebase or force-push).
2. **Press Publish in Lovable.**
3. **Only after it is live, in Shopify admin → Discounts: deactivate `BUY4`.**
   BUY2 (10%) and BUY3 (20%) already match the site and need no edit.

## The code

- `src/lib/promo.ts`: BUY4 leaves the ladder and the table of typed codes;
  BUY2 stays 10% and BUY3 stays 20%.
- The word "extra": `clean/CleanRungs.tsx`, `pdp/PdpOfferTracker.tsx`,
  `AnnouncementBar.tsx`, `HeroSection.tsx`, and the saving line in
  `CartDrawerNext.tsx`.
- Everything else is tests (rates pinned as literals, worked by hand),
  comments, and the notes in `CLAUDE.md`, `AGENTS.md` and `roadmap.md`.

## Checks

- tsc clean; ESLint clean (one old warning in CartContext).
- 1,214 of 1,215 tests pass; the one failure is the old `useReels` test.
- Full build, 239 of 239 pages pre-rendered; no built page names Buy 4,
  "GET 30%" or 15%.
- `stores/fit.cjs`: "extra" measured at 320, 360 and 390px. The panel, the
  bag's strip and the saving line hold one line; the home line takes two
  lines at 320px only.
- `pictures.cjs`: bag totals to the rupee at two, three and four pieces, no
  write and no tracking request leaving.

FRIENDSANDFAMILY (20%) ties the top step again from three pieces, where the
bag hands the checkout BUY3; it wins on one and two pieces, as before 25 Nov.

## The three stores, side by side

`stores/` holds one phone (390x844), one piece (Woven Gold Hoops), three
versions: the site as built on 16 Nov ("a week ago"), the version that went
live on 25 Nov with the three-step offer, and the corrected two-step version.
`three-stores-*.jpg` are the boards, `measurements.json` the plain
measurements, `shoot.cjs` the script that took both.
