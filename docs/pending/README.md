# Site fixes from the phone audit (21–22 Oct 2026)

Shipped to the site's `main` (live after Lovable Publish → Update):
- 45a63f3: Shiprocket's session code hidden on the "Initiating Checkout" screen.
- b2f5dc8: pincode Check button, iPhone zoom on fields, header logo below
  360 px and at 280 px, Most loved row, 44 px tap areas, gift-box title,
  and search (ranking, prices, stone and spelling, Go key, Pearl chip).

Held back, not shipped: the Shop grid "no-jump" change
(`src/main.tsx`, `src/lib/catalogue.ts`, `src/lib/queryClient.ts` in
`phone-fixes-for-review.patch`). It made React wait for the live catalogue
before taking over the grid pages. Measured on pre-built pages, throttled
Android (4x CPU, 4G):

| Page | Buttons work, before | With the wait | Layout shift before → with |
|---|---|---|---|
| Shop All | 1.49 s | 3.04 s | 0.076 → 0 |
| Earrings collection | 1.38 s | 2.80 s | 0.002 → 0 |
| Product pages | 1.1–1.2 s | unchanged (excluded) | 0 → 0 |

The jump goes, but Add to cart on the grids works about 1.5 s later, so it
was not shipped. The better route, for the owner's review: save the live
catalogue into the pre-built grid pages at build time and hand it to React
on load, so the first render matches the page on screen with no wait.

Note for local testing: `vite preview` serves `/jewellery` as the app shell
and only `/jewellery/` as the pre-built page; the live host serves the
pre-built page for both. The pre-renderer uses port 4180 — keep it free
while building.
