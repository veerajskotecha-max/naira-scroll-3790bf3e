# Cart checkout button on narrow Android

## What was wrong

The "Proceed To Checkout" button holds two things side by side: a text column
(title + a delivery sub-line) and the payment marks — paytm, PhonePe, GPay.

The payment marks are `shrink-0`. The text column had `min-w-0`, but the
**sub-line row inside it did not**, so that row never took part in the shrink.
It kept its natural width, overflowed the column, and ran underneath the marks,
which are opaque. The text was not clipped by the browser — it was painted and
then covered.

Measured overlap of the sub-line and the payment marks, before the change:

| device | width | sub-line runs under the marks by |
| --- | ---: | ---: |
| Galaxy Z Fold, cover screen | 344 px | **45 px** |
| Galaxy A / Redmi | 360 px | **29 px** |
| iPhone SE | 375 px | **14 px** |
| iPhone 14 / 15 | 390 px | −1 px (just clear) |
| Pixel / large Android | 412 px | −23 px (clear) |

At 360 px the line read `Free insured delivery · COD & pr` and stopped. Which
is why it only ever showed up on "certain phones": above about 390 px the
sentence fits and nothing looks wrong at all.

## Why it cannot simply be made to fit

At 360 px the button's inner width is 287 px. The payment marks take 84 px and
the gap 12 px, leaving 191 px for the text. The sentence measures 226 px — and
it measured 226 px at *every* viewport, because without `min-w-0` it never
shrank at all. It is 35 px too long, and no amount of tracking or font-size
recovers that without making the sub-line unreadable.

So it wraps. `flex-wrap`, not `truncate`: COD is most of why people trust this
checkout, and it is not worth an ellipsis.

## Second bug, found while fixing the first

shadcn's `Button` carries `size: default` = `h-10 px-4 py-2` — a **fixed**
height. The checkout button set `min-h-[72px]`, which raises the floor to 72 px
but leaves `height: 40px` in place, so the box could never grow past 72 px.
The moment the sub-line wrapped to two lines the content (66 px + 24 px
padding = 90 px) overflowed its own rounded box and the text sat hard against
the top and bottom edges.

`h-auto` in the className drops `h-10` via tailwind-merge and lets `min-h`
behave the way it reads.

## Changes

| | |
| --- | --- |
| sub-line | split into two facts in a `flex-wrap` group with `min-w-0`, so each can hold its own line |
| separator | the `·` is gone — it would have led the wrapped line. The gap separates them on one line and costs nothing on two |
| bolt icon | moved out of the wrapping group into its own fixed column, so "COD & prepaid" lands under "Free insured delivery" and not under the icon |
| bolt size | `!size-3`. The Button base sets `[&_svg]:size-4` on every descendant svg, which outranks a plain class on the icon — it was rendering at 16 px next to 10 px text, against the `size={12}` the code asked for |
| button height | `h-auto` added so `min-h-[72px]` can grow |
| payment marks | `h-7 w-7` below `sm`, `h-8 w-8` from `sm`. At 32 px the three chips plus the gap do not fit beside the title at 360 px |
| paytm wordmark | `text-[6px]` below `sm`. On a 28 px chip the neighbouring chip's 4 px overlap was covering the final `m` |
| spacing | button `mt-2` → `mt-3` and `gap-3`, so ₹-total and marks are not touching |

## After

Every width clean — the whole sub-line clear of the marks, nothing hidden,
no horizontal page overflow:

| device | width | clearance | sub-line | button |
| --- | ---: | ---: | ---: | --- |
| Z Fold cover | 344 px | 12 px | 2 lines | 92 px |
| Galaxy A / Redmi | 360 px | 12 px | 2 lines | 92 px |
| Galaxy A tall | 360 px | 12 px | 2 lines | 92 px |
| iPhone SE | 375 px | 12 px | 2 lines | 92 px |
| iPhone 14 / 15 | 390 px | 12 px | 2 lines | 92 px |
| Pixel | 412 px | 30 px | 1 line | 72 px |

The break point is about 405 px, so an iPhone 14 wraps and a Pixel does not.
Both read correctly; the button simply grows by 20 px where it needs to.

## How it was checked

`shopify/harness/cartrow.mjs` and `cartclip.mjs` drive a real Chromium at each
width, add the bracelet to the cart, open the drawer and measure the sub-line's
right edge against the payment marks' left edge. Before and after were captured
from the **same local build** with only this patch stashed and unstashed
between runs, so the comparison is not confounded by live data or a different
bundle. `cartsheet.mjs` and `cartgrid.mjs` render the contact sheets.

## Applying it

This branch is 595 commits behind `main` and its `CartDrawer.tsx` predates the
payment marks entirely — the bug does not exist here, so the fix cannot be
committed against this tree. `cart-checkout-button.patch` in this directory is
the change against `main` and applies cleanly there:

```
git checkout -b fix/cart-checkout-button origin/main
git apply docs/mobile/cart-checkout-button.patch
```

`npx tsc --noEmit` is clean with it applied.
