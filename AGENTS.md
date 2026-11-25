# Project rules

- Resolve specialist collection membership and occasion filters through jewelleryCollections; broad category matching alone must not put unrelated styles in named collections.
- Keep budget bands in the shared filter module and filter colour cards by their own variant prices; disjoint boundaries prevent overlapping budget edits.
- Homepage jewellery cards share the live catalogue cache and JewelCard purchase guards; a second apparel-card path must not bypass ring choices or stale stock protection.

- Keep ring measurement data and instructions shared between ring PDP Details and the size-guide modal; one reference prevents conflicting measurements and guidance.
- Keep the bag gift-box preview in a dedicated CSS-only component; it must not import three.js, so opening the bag stays lightweight.
- Pass the bag's existing catalogue to its gift-box row rather than subscribing again; one catalogue observer avoids duplicate mapping and refresh work.
- Keep jewellery PDP coating, confirmed measurement corrections and stone evidence in the shared jewelleryPresentation module; live, embedded and snapshot pages must agree without inferring stones from generic materials summaries.
- PDP Buy Now must use CartContext.buyNow with the selected cart line; this keeps checkout provider, discount and tracking handoffs shared with the bag.
- Closed bag catalogue observers must stay disabled while reading shared cached data; this avoids starting catalogue requests on unrelated landing pages.
- Bag line-price presentation uses cartPricing with the resolved cart discount and allocates rounding across lines; individual prices must sum to the existing checkout goods total without changing offer selection.
- Shopper performance uses a small production-only observer and anonymous bounded events; keep order paths, click IDs and shopper details out of telemetry to protect privacy and page speed.
- Performance reports are served only after server-side admin validation; aggregate in SQL and lazy-load the private dashboard so shopper pages never download reporting UI.
- Shop and menu collection cards share cached 30-day visit counts for top-ten in-stock bestseller badges; stock placement runs after pinning/sorting with at most one sold-out card per twenty until buyable cards end, so merchandising never bypasses the stock limit.

- Routed PDP offers use the renewed offer panel (components/pdp/PdpOfferTracker) and the "Complete the look" bundle (components/pdp/PdpBundle), which the owner approved from a preview on 25 Nov 2026 in place of the quiet note; every figure comes from QUANTITY_OFFERS through promo.ts, and discount resolution stays in the bag so presentation never changes checkout rules.
- The product page and the bag are drawn from two scoped style layers, components/clean (nc- classes) and components/pdp/renew.css (rn- classes); keep new rules inside those scopes so no other page changes, and keep every price worked by promo.ts rather than in a component.
- A piece already in the bag is never added a second time by the product page's filled button or by the bundle (the button reads "View bag"); the bundle once added it twice, and renewParts.test.tsx pins the fix.
- The product page and bag promise only what the shop can show: cash on delivery "on most pincodes", returns "on eligible pieces", no sold counts, no invented ratings and no sale that ends; do not reintroduce those lines.
- The buy-more offer is two steps since 25 Nov 2026, the owner's ask: Buy 2 = extra 10% (BUY2) and Buy 3 or more = extra 20% (BUY3); Buy 4 was removed. The steps live only in QUANTITY_OFFERS in src/lib/promo.ts and must match the Shopify codes of the same names, and wherever the offer is stated it is said as "extra" (it comes on top of the price a piece already sells at); never move a rate, add a step or drop that word without the owner asking, and when a rate is lowered or a step removed the site goes live before the Shopify code changes.
