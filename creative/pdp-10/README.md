# Naira product page, 10/10 proposal (13 Nov 2026)

A product page for the Prism Rivière Bracelet, built on real photos, prices and the live offer. It was scored and rebuilt over six rounds by four independent critics (conversion, trust and consumer law, art direction, mobile and speed) against an evidence-based rubric.

- **Open** `prototype/naira-pdp.html` on a phone, or at 360x640. It is a self-contained page: images in `prototype/i/`, Riya's 3.3 s clip in `prototype/v/`.
  - `naira-pdp-live-cdn.html` is the same page, but its full-screen viewer reads the originals from cdn.shopify.com.
- **Proposal:** `naira-pdp-proposal.html` (published at https://claude.ai/artifact/DNUGJfLTaGuHtcYB6cfrpF).
- **Truth sheet:** `FACTS.md`. Nothing outside it is stated on the page as fact.
- **Rubric:** `rubric.md`, with 21 weighted criteria and sourced findings.
- **Research:** `research/` holds the live-page code and honesty audit, the funnel and order data, and the teardown of 8 jewellery PDPs.
- **Critiques:** `rounds/` holds every critic's scores and fixes per round.
- **Tools:** `tools/render.sh` renders the page and measures its first screen.

## Scores (score_now: honest content available today)

| Round | Conversion | Trust | Art | Mobile | Mean |
|---|---|---|---|---|---|
| 1 | 4.6 | 4.7 | 5.3 | 4.9 | 4.9 |
| 3 | 8.5 | 8.3 | 8.5 | 8.3 | 8.4 |
| 6 | 8.9 | 8.8 | 9.0 | 9.0 | 8.93 |

The critics put the same page at 9.3–9.5 once these inputs exist:
- real reviews;
- 1,440 px originals and a macro video;
- an ad-to-asset map;
- the owner's answers to the launch blockers.

The launch blockers and the build notes for the live release sit below the prototype's footer.

## Not done yet
- Nothing on the live site has changed.
- Building it into `JewelDetailNext` / `CartDrawerNext` needs a branch from `main` and the owner's go-ahead. Do the honest baseline first (remove the invented reviews, sold counts, FOMO popup, press strip and "sale live today"), then run an A/B test.
