# Palmonas vs Naira Flore — Full Menu & Feature Gap Audit

Studied palmonas.com (home, /collections/rings, a product page) against the current Naira Flore codebase. Below is everything they have, what we have, and what is missing — then what I propose to build.

## 1. Navigation menu

| Palmonas | Naira Flore today | Gap |
|---|---|---|
| Two top-level worlds: DEMIFINE COLLECTION and GOLD, each with its own mega-menu | Single SHOP dropdown with 2 links (Jewellery, Indo-Western) | No mega-menu, no image tiles |
| Mega-menu blocks: Shop by Category (8 image tiles), New Arrivals, Best Seller, Fine Silver, Shop by Occasion, Shop by Collection, Shop by Gender | Flat 4-item desktop menu, 6-item mobile drawer | Missing every "shop by" axis |
| Direct menu entries: Gifting (Gifts for Her/Him/Mother, Gift Card, Gift Box), Corporate Gifting, Stores & Services, Track Order, Careers, celebrity/collab pages | None of these exist | Missing |
| 3 rotating promo strips in header, each linking to a sale collection | One static announcement marquee | No clickable offer strips |
| Working search with suggestions; login/account; wishlist; cart | Search icon just routes to /shop; account icon routes to /contact | Search and account are fake |

## 2. Collection / listing page

| Palmonas | Naira Flore today | Gap |
|---|---|---|
| Sub-collection chips under the title (Statement, Dainty, Solitaire, Bands, Pearl, Stackable, Signet) | Category chips only (All/Rings/Bracelets/Earrings/Necklaces) | No style-level sub-collections |
| Sort menu: Featured, Most relevant, Best selling, A-Z, Z-A, Price low/high, Date old/new | No sort at all | Missing |
| Filter drawer: Price slider, Product type, Colour, Occasion, Style — each with live counts | No filters beyond category | Missing |
| Collection banner image + long SEO copy block + FAQ | Text hero + FAQ present | Banner image missing |
| Card: sale ribbon ("Flat 999"), dual image swap, Add to Wishlist, Add to Bag, MRP struck through + discount % | Card: badge, image swap, price, Add to Cart, Shop Now | No strike-through MRP, no discount %, no wishlist on card |
| Pagination / load-more on 540 products | Everything renders at once | Fine at our size, will break past ~60 SKUs |

## 3. Product page

| Palmonas | Naira Flore today | Gap |
|---|---|---|
| MRP struck through, sale price, "Inclusive of all taxes" | Single price + tax line | No MRP/savings |
| Trust badge icons: Anti-Tarnish, Skin Safe, 18K Plated | 3-icon trust grid present | Parity |
| Urgency: "121 quantity sold in last 7 days" | None | Missing |
| SKU shown | Not shown | Missing |
| Deals block: stacked coupon offers with copy-to-clipboard codes + "View all offers" sheet + eligible-items links | None on PDP | Missing |
| "In stock — ready to ship" status chip | None | Missing |
| Gift sleeve add-on (+₹50) as a paid upsell | None | Missing |
| Size selector, Add to Cart, Buy It Now, Add to Wishlist, Notify Me When Available | Size, Add to Cart, Shop Now, Wishlist | No back-in-stock notify |
| Pincode checker with same-day/free-delivery ETA | Present (PincodeChecker) | Parity |
| Review count next to title, full review section | Reviews present | Parity |
| Description tabs | Tabs + accordions present | Parity |
| Social share (FB/Pinterest) | Native share present | Parity |

## 4. Site-level features

Present on Palmonas, absent for us: real search, customer accounts/login, order tracking, gift cards and gifting hub, corporate gifting, stores & services page, careers page, mobile-app banner, offer/coupon hub pages, recently viewed, back-in-stock alerts, sold-count social proof.

Present for both: blog/journal, wishlist, cart drawer with coupon field, free-shipping progress, Shopify hosted checkout, policy pages, FAQ.

Present for us, not them: bespoke customisation journey, editorial hero and scroll storytelling, WhatsApp concierge.

## 5. What I propose to build (in order)

**Phase 1 — merchandising basics (highest revenue impact)**
1. Sort control on /jewellery and /shop: Featured, Best selling, Price low-high, Price high-low, Newest.
2. Filter panel: price range, category, occasion/style tag, availability — driven off Shopify tags, with live counts, URL-synced so filters are shareable, no scroll jump.
3. Strike-through MRP + discount % on cards and PDP, using Shopify `compareAtPrice`.
4. Wishlist heart on every listing card (jewellery and apparel).

**Phase 2 — menu depth**
5. Rebuild the header into a mega-menu: Jewellery (category image tiles, New Arrivals, Bestsellers), Indo-Western, Shop by Occasion, Gifting, Customise. Mobile drawer mirrors it as expandable accordions.
6. Clickable promo strip in the announcement bar linking to the active offer collection.
7. New routes: `/gifting` hub and `/jewellery/collections/:slug` reuse for occasion collections.

**Phase 3 — real search and PDP conversion**
8. Real search: overlay with instant results across jewellery + apparel (title, tag, category), recent searches, popular chips.
9. PDP additions: SKU line, in-stock chip, "Deals" block with copyable coupon codes, savings amount, and a Notify-Me capture for sold-out sizes.
10. Recently viewed rail on PDP and listing pages.

**Phase 4 — service pages**
11. Track Order page (Shopify order-status lookup by order number + email).
12. Gift card product + optional gift note at cart, Careers and Stores/Services pages if wanted.

## Technical notes
- Sort/filter run client-side over the already-fetched Shopify product set, with state in URL search params and no scroll reset (same pattern as the current category chips).
- MRP/discount read `compareAtPrice` from the Storefront API; nothing hardcoded.
- Search is a client-side index over loaded products — no backend needed.
- Notify-Me and Track Order need a backend (Lovable Cloud) for email capture and order lookup; everything else is frontend-only.
- No fake reviews, no invented sold-counts — urgency copy will only use real Shopify inventory data.
