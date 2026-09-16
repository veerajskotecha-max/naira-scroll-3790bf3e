# CRO Re-Audit — September 2026

## What the numbers say (last 30 days)

- 9,921 visitors, 18,940 pageviews, **1.91 pages per visit**
- **72% bounce**, average visit **70 seconds**
- **94% mobile**, 77% of traffic from Instagram/Facebook, 77% from India
- Top entry pages: /jewellery (3,493), home (573), then individual product pages (star point band, heartbead bracelet, bracelets collection, molten bloom hoops, brushed gold huggies)

Read plainly: paid social sends a phone user straight onto a shop or product page, they look for about a minute, see roughly two pages, and most leave. The product page itself is now tight and fast. The leak is everything around it, plus sheer page weight.

## Score today: 7.4 / 10

Improved from 6.4 since the last audit — the product page is short, loads quickly, has a working sticky buy bar, real reviews, press logos, a trust-led footer and a shoppable reel. What still costs sales:

| Area | Score | Problem |
| --- | --- | --- |
| Product page | 8.5 | Strong; small gaps in delivery promise and size confidence near the button |
| Shop page (/jewellery) | 6 | 14,400px long on a phone, 92 tap targets, no price filter, no fast path to a decision |
| Ad landing hop | 6 | /products/... pages wait for a product lookup before moving the visitor to the real page — a blank beat on the most expensive traffic |
| Cart and checkout | 7.5 | Handoff works, but no reassurance line or saved-cart nudge |
| Trust and urgency | 7 | Real reviews and press are good; the rotating "someone bought" popup competes with the buy button |
| Page weight | 5.5 | Roughly 7.5–8 MB and 190–240 requests per page on a phone — the single biggest drag on a 94% mobile audience |

Home page is out of scope by request and stays exactly as it is.

## Changes to reach 10 / 10

### 1. Cut page weight (first priority)
- Serve every grid, related and reel thumbnail at the size it is actually displayed, in modern formats, with correct responsive sources — today full-size images are pulled for small tiles.
- Load only the first screen of grid images eagerly; defer everything below.
- Give every image a fixed box so nothing jumps while loading.
- Trim the decorative background art and floral overlays on mobile where they add weight without adding sales.
- Split heavy page code so the shop page does not download product-page and reel code up front.
- Target: under 2.5 MB and under 120 requests on first view of the shop and product pages.

### 2. Make the shop page decide faster
- Lift a compact "Best sellers" row of six pieces above the filters so the first screen already shows product, price and an add action.
- Cut the default grid to 12 pieces with a "Show more" button.
- Add a one-tap price band chip row (Under ₹999 / ₹999–1,499 / ₹1,500+) beside the existing category tabs.
- Show delivery and returns as a slim line under the tabs, not only in the footer.

### 3. Remove the blank beat on ad landings
- Send /products/<handle> jewellery visitors to the real product page immediately on the handle, before the product lookup finishes, keeping all campaign parameters.
- Show the product page skeleton instantly instead of an empty screen.

### 4. Sharpen the buy moment on the product page
- Under the price: one line, "Delivery in 3–5 working days · ₹150 · 7-day returns".
- Ring pages: "Not sure of your size?" as a text link right beside the size buttons.
- Cart drawer: a short reassurance line under the checkout button.
- Keep quantity, gold Add to Cart and black Shop Now exactly as they are.

### 5. Calm the urgency layer
- Keep the rotating purchase popup, but suppress it on the product page whenever the sticky buy bar is on screen, so nothing competes with the button.

### 6. Measurement
- Track view-item, add-to-cart, begin-checkout and checkout-open per page so the next rating is based on real drop-off, not inference.

## Not changing
Home page, ₹150 shipping, 3–5 working days, 7-day returns, 2-year plating, ring sizes and pre-order rules, sold-out labels, checkout through payments.nairaflore.com, Meta pixel setup, reels section, review section, press line, footer.

## Technical notes
- Weight: `shopifyImage`/`shopifySrcSet` sizing audit across `JewelCard.tsx`, `MobileReelShop.tsx`, `JewelleryCategories.tsx`; `loading`/`decoding`/`fetchpriority` pass; route-level lazy imports; mobile gating for `RingAtelierBackdrop` and floral overlay layers.
- Shop page work in `src/pages/Jewellery.tsx` plus `JewelFilterBar.tsx`.
- Ad landing fix in `src/pages/ProductDetail.tsx`: redirect on `id` for known jewellery handles before the Shopify query resolves.
- Buy-moment copy in `src/pages/JewelDetail.tsx`; cart copy in the cart drawer.
- Popup suppression: reuse the existing sticky-bar visibility state and pass it to `FomoPopup`.
- Verify each step at 393×852 with Playwright, re-run the weight measurement, `bunx tsgo --noEmit`, clean build.
