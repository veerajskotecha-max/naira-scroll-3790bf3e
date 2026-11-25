# Product page and bag: the renewed version (preview, not live)

Status on 25 Nov 2026: built, reviewed from three angles, fixed and measured on the
local branch `pdp-renew` (head `d8f3f8ec`, on top of the clean redesign `pdp-clean`
`d7d59907`, itself based on `main` at `e161ace0`). Nothing is on `main`. The owner
approves from the preview before anything goes live.

Preview for the owner (private): https://claude.ai/artifact/9nsb5Y4ixVFWyAtDNWThnT
Today's page ("Today") beside the renewed one ("Renewed"), six pieces, a working local
bag, three title options and phone / laptop frames. Checkout is switched off; no cart
call reaches Shopify. (The earlier clean-only preview stays at
https://claude.ai/artifact/CLSSAiBkAB3Akme6cHmiZs.)

## Where it came from

The owner sent seven screens of an Instagram reel of before-and-after shop pages and
asked for a separately coded Naira product page and cart in that manner, to approve
later. What the reel's "after" pages share, read from the screens (the audio was not
available): proof before the name; a short name and price, then three quick benefits;
clear options; a real delivery promise; one strong button with the price in it;
reassurance right under the button; an offer you can watch fill; bundles and one-tap
add-ons; generous padding and small motion. Each is built here from facts the shop
already has. Nothing is counted, timed or claimed that it does not know.

## What the renewed layer adds to the clean redesign

- Photo: "Popular" on the first photo where the shop's own view counts earn it, and
  "Video", the way to the piece's reel. On a short phone the photo gives up some height
  so the name, price and a buy button share the first screen.
- Head: rating and clients, name, price with the saving as a tag, one sentence of the
  piece's own (a set says what is in it), three ticked benefits.
- Buttons: Buy now, then Add to bag with the price in it; the same order in the phone's
  bar. Under them: in stock and the arrival dates (a pincode checked before gets its own
  date), four promises, the pay marks and a WhatsApp question link.
- Offer: Buy 2 / 3 / 4 as a line that fills with the bag, this piece priced at each step.
  With pieces in the bag, what adding this one does is said beside the button.
- Bundle: "Complete the look" with ticks, a total by the bag's own arithmetic and one
  button. It never adds a piece the bag already holds.
- Bag: the MRP saving kept in view, a one-tap suggested piece that stays at the foot of
  the list, the offer line with its stops, a shorter foot.
- Motion: the offer line filling, totals ticking in, sections rising in as they are
  reached; all stilled for "reduce motion".

## The three reviews (25 Nov 2026) and what they changed

`review-design.md`, `review-copy.md`, `review-conversion.md` are the reviewers' own
reports. Fixed from them, in commit `479c7e0b` and the four after it:

- A real fault: with a piece already in the bag, the bundle's button added it a second time.
- No buy button on the first screen of a short phone (390x664 Safari, 360x560).
- Cash on delivery promised to everyone though the site's own pincode rules refuse it in
  some regions, and a refusal that blamed the shopper's area.
- Returns worded more generously than the published policy.
- The bag forgetting the saving against MRP; its suggestion cut off on small phones.
- "Popular" over every photo; the video shortcut lost; button order differing between
  the page and the bar; "cart" on the button and "bag" everywhere else.
- Centred rows breaking the left edge; the offer as the quietest block; uneven option
  chips; tight spacing; a narrow column and small type on a laptop.

Held for the owner rather than built: see `OWNER-QUESTIONS.md`.

## Checks on `pdp-renew`

- `npx tsc --noEmit -p tsconfig.app.json`: clean. `npx eslint` on the changed files: clean.
- `npx vitest run`: 1,213 of 1,214 pass. The one failure, `src/hooks/useReels.test.ts`,
  fails on `main` too.
- `npx vite build`: passes. The site's own pre-render (`scripts/prerender.ts`) was run on
  this branch for the speed test: 239 of 239 routes.
- Preview check (`preview-kit/check.cjs`): 36 product pages, 66 flow steps, 0 requests to
  any outside host.
- Only product-page and bag files changed (64 files against `main`, 35 since the clean
  redesign). Untouched: `src/contexts/*`, `shopify.ts`, `promo.ts`, `pixel.ts`,
  `index.html`, `main.tsx`, the configs, `package.json`, `index.css`. Every rupee shown
  is worked by `promo.ts`.
- `PincodeChecker` (shared with the outfit page) changed only in its product-page look
  and gained an optional listener; its default look is pinned by a test.

## Load speed, measured (lab, local production builds, Woven Gold Hoops)

`speed/measure.cjs` loads each pre-built page in a throttled browser; medians below.
Real phones add the distance to the server to both alike.

| Profile | Page | Main photo shown | Layout shift | Requests | Data |
|---|---|---|---|---|---|
| Slow phone (1.6 Mbps, 4x slower CPU), 7 loads | Today | 1.90 s | 0 | 72 | 997 KB |
| | Renewed | 1.91 s | 0 | 49 | 697 KB |
| Good phone (10 Mbps), 5 loads | Today | 0.38 s | 0 | 70 | 944 KB |
| | Renewed | 0.38 s | 0 | 46 | 627 KB |
| Laptop (40 Mbps), 5 loads | Today | 0.45 s | 0 | 88 | 1,228 KB |
| | Renewed | 0.36 s | 0 | 66 | 953 KB |

The first paint is level with today's page, which was already tuned: on a slow
connection it waits on the site's shared shell (the font stylesheet and the app's own
code, about 250 KB), which this work was told not to touch. After that the renewed page
is lighter: about 30% less data and a third fewer requests, because the reviews, the
press strip, the reels, the "more" rail and the size guide photo load only when wanted.

## Restore and rebuild

- Branch: `git fetch docs/pdp-renew/pdp-renew.bundle pdp-renew:pdp-renew` (needs `main`
  at `e161ace0` or later; it carries the clean redesign's commits too).
- Preview: unpack `preview-kit-source.tar.gz`, then
  `PREVIEW_DIST=<out dir> ./build.sh <pdp-renew worktree>` (needs a worktree of `main` at
  `/tmp/pdp-base` for "Today"; its photograph cache is fetched again on the first build).

## Before going live

- The owner's approval of the preview, and her answers in `OWNER-QUESTIONS.md`.
- The full production build with its pre-render (`npm run build`), and `CLAUDE.md`'s
  description of the product page brought up to date.
