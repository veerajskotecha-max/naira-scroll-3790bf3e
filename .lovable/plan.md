# CRO Re-Audit — September 2026

## What the numbers say (last 30 days)

- 9,921 visitors, 18,940 pageviews, **1.91 pages per visit**
- **72% bounce**, average visit **70 seconds**
- **94% mobile**, 77% of traffic from Instagram/Facebook, 77% from India
- Top entry pages: /jewellery (3,493), home (573), then individual product pages (star point band, heartbead bracelet, bracelets collection, molten bloom hoops, brushed gold huggies)

Read plainly: paid social sends a phone user straight onto a shop or product page, they look for about a minute, see roughly two pages, and most leave. The product page itself is now tight and fast. The leak is everything around it.

## Score today: 7.4 / 10

Improved from 6.4 since the last audit — the product page is short, loads quickly, has a working sticky buy bar, real reviews, press logos, a trust-led footer and a shoppable reel. What still costs sales:

| Area | Score | Problem |
| --- | --- | --- |
| Product page | 8.5 | Strong; small gaps in delivery promise and size confidence near the button |
| Shop page (/jewellery) | 6 | 14,400px long on a phone, 92 tap targets, no price/quick filters up top, no "shop now" shortcut for ad arrivals |
| Home page | 5.5 | 10,600px tall with only 12 buying actions; a visitor from Instagram must scroll a long way before a product |
| Ad landing hop | 6 | /products/... pages wait for a product lookup before moving the visitor to the real page — a blank beat on the most expensive traffic |
| Cart and checkout | 7.5 | Handoff works, but no free-shipping nudge, no reassurance line, no saved-cart reminder |
| Trust and urgency | 7 | Real reviews and press are good; the rotating "someone bought" popup still competes with the buy button |
| Speed | 7.5 | Product page under a second to first paint, but ~7-8 MB of images per page on a phone |

## Changes to reach 10 / 10

### 1. Make the shop page decide faster (biggest win)
- Lift a compact "Best sellers" row of six pieces above the filters so the first screen already shows product, price and an add action.
- Cut the default grid to 12 pieces with a "Show more" button; the page is currently three phone-screens of images before any decision point.
- Add a one-tap price band chip row (Under ₹999 / ₹999–1,499 / ₹1,500+) beside the existing category tabs.
- Show delivery and returns as a slim line under the tabs, not only in the footer.

### 2. Rebuild the first screen of the home page for Instagram arrivals
- Directly under the hero, place a "Shop now" band: four square best sellers with price and an add button, plus a Shop all link.
- Move the customisation, ethos and film sections below that band; keep the story, but after the shopping.
- Target: a product with a price visible within the first two phone screens.

### 3. Remove the blank beat on ad landings
- Send /products/<handle> jewellery visitors to the real product page immediately on the handle, before the product lookup finishes, keeping all campaign parameters.
- Show the product page skeleton instantly instead of an empty screen.

### 4. Sharpen the buy moment on the product page
- Under the price: one line, "Delivery in 3–5 working days · ₹150 · 7-day returns".
- Ring pages: put "Not sure of your size?" as a text link right beside the size buttons.
- Cart drawer: a reassurance line and, where relevant, "Add ₹X for free delivery" style progress if a threshold is agreed.
- Keep quantity, gold Add to Cart, black Shop Now exactly as they are.

### 5. Calm the urgency layer
- Keep the rotating purchase popup but suppress it on the product page whenever the sticky buy bar is on screen, so nothing competes with the button.

### 6. Weight and speed
- Serve grid images at the size they are displayed and in modern formats; the shop page currently pulls about 7.5 MB on a phone.
- Load only the first screen of grid images eagerly; defer the rest.

### 7. Measurement so the next rating is evidence-based
- Track view-item, add-to-cart, begin-checkout and checkout-open per page so the drop-off point is visible instead of inferred.

## Not changing
₹150 shipping, 3–5 working days, 7-day returns, 2-year plating, ring sizes and pre-order rules, sold-out labels, checkout through payments.nairaflore.com, Meta pixel setup, reels section, review section, press line, footer.

## Technical notes
- Shop page work in `src/pages/Jewellery.tsx` (+ `JewelFilterBar.tsx`, `JewelCard.tsx`); home page band in `src/pages/Index.tsx`.
- Ad landing fix in `src/pages/ProductDetail.tsx`: redirect on `id` when the handle is a known jewellery handle, before the Shopify query resolves.
- Buy-moment copy in `src/pages/JewelDetail.tsx`; cart copy in the cart drawer component.
- Popup suppression: reuse the existing sticky-bar visibility state and pass it to `FomoPopup`.
- Images via the existing `shopifyImage`/`shopifySrcSet` helpers.
- Verify each step at 393×852 with Playwright, `bunx tsgo --noEmit`, and a clean build.
