# Product page and bag: the clean redesign (preview, not live)

Status on 25 Nov 2026: built, reviewed and merged on the local branch `pdp-clean`
(head `d7d59907`, based on `main` at `e161ace0`). Nothing is on `main`; the owner
approves from the preview before anything goes live.

Preview for the owner (private): https://claude.ai/artifact/CLSSAiBkAB3Akme6cHmiZs
It carries today's page (Before) and the redesign (After), six pieces, a working
local bag, three title options (A clean left, B serif left, C clean centred) and
phone / laptop frames. Checkout is switched off; no cart call reaches Shopify.

## What is here

| File | What it is |
|---|---|
| `pdp-clean.bundle` | The branch as a git bundle (commits after `e161ace0`). Restore: `git fetch docs/pdp-clean/pdp-clean.bundle pdp-clean:pdp-clean` |
| `SPEC.md` | The design spec (four angles, the clean system, every block and state, acceptance checks, the owner's questions) |
| `review-page.md`, `review-bag.md` | The four-angle reviews and what each fixed |
| `code-map.md`, `AUDIT.md` | Today's page and bag: where everything is in the code, and what it measures on phones and laptops |
| `ref-himscience.md`, `ref-palmonas.md` | The two reference studies |
| `preview-kit-source.tar.gz` | The preview builder (frame, local guard, scripts). `./build.sh <source dir>` rebuilds the preview; its cache of photographs is not included and is fetched again on the first build |

## Checks on the merged branch

- `npx tsc --noEmit -p tsconfig.app.json`: clean.
- `npx vitest run`: 1,130 of 1,131 pass. The one failure, `src/hooks/useReels.test.ts`, fails on `main` too.
- `npx vite build`: passes. The full prerender (`npm run build`) was not run.
- Only product-page and bag files changed (46 files); contexts, `shopify.ts`, `promo.ts`, `pixel.ts`,
  `index.html`, `main.tsx`, the configs and `index.css` are untouched. Meta events were compared tap for tap with today's page: identical.

## Not carried over, because the code shows it to be invented

1. "N pieces sold in the last 48 hours" (a number made from the product's name).
2. The "someone just bought" pop-up (made-up names, cities and minutes).
3. "4.9 · 50 reviews" on every product and the review notes dealt to each product from one shared list.
   The page now shows the shop's own "4.5 · 5,000+ clients" and only photographed or customer-submitted reviews.
4. "Sitewide sale live today" in the bag (the Buy 2 / 3 / 4 offer is permanent).

## Before going live

- The owner's answers to the six questions at the end of `SPEC.md`.
- Run the full production build with its prerender, and update `CLAUDE.md`'s description of the product page.
