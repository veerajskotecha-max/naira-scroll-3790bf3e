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
- Shopper performance uses a small production-only observer and anonymous bounded events; keep order paths, click IDs and shopper details out of telemetry to protect privacy and page speed.
- Performance reports are served only after server-side admin validation; aggregate in SQL and lazy-load the private dashboard so shopper pages never download reporting UI.