# Product page and bag: the renewed version (on `main` since 25 Nov 2026)

Status on 25 Nov 2026: the owner approved the preview ("Push it live") and the branch
was merged into `main` the same day: merge commit `63e667c0`, `main` at `0957ed00`.
The live site shows it once **Publish** is pressed in Lovable (pushing to GitHub does
not deploy). To undo: `git revert -m 1 63e667c0` on `main`, then Publish again.

`main` had moved while the branch was being built: five Lovable edits of 21 Nov had
simplified the live product page (plain feature text, no "sold in the last 48 hours"
panel, no gift-box sentence, softer type, the offer as one quiet line). The renewed
page already does all of that except the last, where it shows the offer as a panel
that fills with the bag; the six files both sides had changed were taken from the
renewed branch, and Lovable's other files were kept. `AGENTS.md`, `roadmap.md` and
`CLAUDE.md` on `main` now describe the renewed page.

Built on the local branch `pdp-renew` (head `d8f3f8ec`, on top of the clean redesign
`pdp-clean` `d7d59907`, itself based on `main` at `e161ace0`).

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
- On the merged tree, before the push: `tsc` and `eslint` clean, `vitest` 1,214 of 1,215
  (the same one failure), `npm run build` with its pre-render 239 of 239, and a browser
  walk of the built site (`golive-walk.cjs`: 15 product page loads on three screens, add
  to bag with every Shopify write refused, the bag on the product page, the listing and
  the home page, the already-in-bag state, an ad link's hop). All passed.
- Preview check (`preview-kit/check.cjs`): 36 product pages, 66 flow steps, 0 requests to
  any outside host.
- Only product-page and bag files changed (64 files against `main`, 35 since the clean
  redesign). Untouched: `src/contexts/*`, `shopify.ts`, `promo.ts`, `pixel.ts`,
  `index.html`, `main.tsx`, the configs, `package.json`, `index.css`. Every rupee shown
  is worked by `promo.ts`.
- `PincodeChecker` (shared with the outfit page) changed only in its product-page look
  and gained an optional listener; its default look is pinned by a test.

## Load speed against the page that was live on 25 Nov (after Lovable's edits)

Measured again at go-live, `main` at `27dea572` against the merged build:

| Profile | Page | Main photo shown | Layout shift | Requests | Data |
|---|---|---|---|---|---|
| Slow phone, 7 loads | Live on 25 Nov | 1.88 s | 0 | 75 | 952 KB |
| | Renewed | 1.94 s | 0 | 49 | 698 KB |
| Good phone, 5 loads | Live on 25 Nov | 0.38 s | 0 | 74 | 926 KB |
| | Renewed | 0.40 s | 0 | 46 | 627 KB |

Level on the first paint (0.06 s apart on the slow profile, inside the spread between
runs), with about 27 to 32% less data and a third fewer requests.

## Load speed against the page of 20 Nov (lab, local production builds, Woven Gold Hoops)

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

## After going live

- Press **Publish** in Lovable; then the live page can be checked for the renewed markup.
- The questions in `OWNER-QUESTIONS.md` are still open. They went live with the defaults
  described there (title A, "Add to bag", returns "on eligible pieces", cash on delivery
  "on most pincodes").
