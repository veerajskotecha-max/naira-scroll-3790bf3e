# Buy-more offer: Buy 2 = extra 10%, Buy 3 = extra 20%, Buy 4 removed

25 Nov 2026, the owner's ask, in two messages an hour apart:

> Keep buy 2 get 10% and buy 3 get 15 only on the cart on additional offers.
> Remove buy 4 offer

> Buy 3 keep 20% not 15.... so only buy 2 and 3 remain! 10 and 20% offer shown
> as extra discount on current discount

## Where things stand

**Live and checked.** The corrected offer (Buy 2 = extra 10%, Buy 3 = extra
20%, no Buy 4) is on `main` as `cf0a0b57` and has been live on nairaflore.com
since about 21:33 UTC on 25 Nov 2026 (03:03 IST on 26 Nov).

`live-check.cjs` read the live site right after (no write, no tracking
request leaving): the strip, the product page's two steps ("Extra 10% off ·
₹944 each", "Extra 20% off · ₹839 each"), the home line, and the bag at two,
three and four real pieces: ₹3,103, ₹3,558 and ₹4,117, each with its "extra"
saving line. Pictures in `live/`.

Before that, for about half an hour, the live site showed the first reading
of the ask (Buy 3 = 15%, commit `c18a5c8b`). Shopify charged 20% throughout,
so anyone who ordered three pieces in that window paid less than the bag
quoted.

**One step is left, in Shopify admin → Discounts: deactivate `BUY4`.** Do it a
few hours after the publish, not at once: a shopper who still has an older
copy of the page open has a bag that hands BUY4 to the checkout, and a
deactivated code would leave that order with no discount at all. BUY2 (10%)
and BUY3 (20%) already match the site and need no edit. Shopify was only read
(25 Nov: BUY2 10%, BUY3 20%, BUY4 30%, NAIRA10 10%, FRIENDSANDFAMILY 20%, all
active).

To correct on `main` with the next change there: `CLAUDE.md` says of
`c18a5c8b` that "it was never published". It was, for that half hour.

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
