# Bag trust block: two options, waiting for the owner's pick (16 Nov 2026)

The owner sent a checkout screenshot ("The last thing buyers see") and asked for the same thing above Checkout in the bag:
- pay with cards and COD;
- trusted by 5,000+ clients (served at exhibitions);
- a 4.5-star rating.

**Decision, 16 Nov 2026:** the owner chose option B. It is on `main` as e161ace0 (the B commit, reworded), and goes live when the owner presses Publish in Lovable.
Option A stays in the bundle in case it is wanted later.

| | Option A, express row | Option B, quiet seal |
|---|---|---|
| Above Checkout | "Pay your way", three square tiles (UPI · Visa/Mastercard · Cash on delivery), then the star line | the star line, then "Visa Mastercard Cards · Cash on delivery" |
| Taps | each tile opens the same checkout (Clarity `bag_pay_tile_<method>`) | nothing new to tap |
| UPI discs | move off the Checkout button into the UPI tile | stay on the Checkout button |
| Height added to the bag's foot | 96px | 44px |
| Commit | `bag-trust-a` d8bc115c | `bag-trust-b` 1c1a24bb |

Star line in both: ★★★★½ "Rated 4.5/5 · Trusted by 5,000+ clients", between hairlines.
It never says "rated by 5,000": the 5,000 are clients served, not ratings.

Both are built on `main` at bd412960.
Checks on both: `tsc` clean, `vite build` OK, and the full vitest suite passes except `useReels.test.ts > uses the signed urls when signing works`, which fails on `main` as well.
Screenshots were taken on 390x844, 360x780 and 360x640 phones; there is no sideways scroll at any size.

To ship the pick:

```
git fetch docs/bag-trust/bag-trust-options.bundle bag-trust-a   # or bag-trust-b
git merge --no-ff FETCH_HEAD                                     # on a branch from main
```

Fastrr charged no COD fee on 16 Nov 2026: six COD orders went through at list price with ₹0 shipping.
So neither option names a fee. `src/lib/payment.ts` still says 5%, and nothing reads it.
