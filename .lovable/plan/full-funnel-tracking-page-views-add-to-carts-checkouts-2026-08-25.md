# Full funnel tracking: page views, add to carts, checkouts

## Where things stand today

The site already fires a Meta Pixel event on every important action — product view, add to cart, wishlist, search, begin checkout, add payment info, lead capture, sign-up, WhatsApp/phone contact. These are visible in Meta Events Manager only.

Lovable's built-in analytics (the screen you are on) reports visitors, page views, sources and devices. It does not report add to carts or revenue.

The purchase itself happens on Shopify's hosted checkout, which is a different domain — no code in this app can see it. Purchase must be tracked from the Shopify side.

## What will be built

**1. One shared tracking layer**

Turn the current Meta-only helper into a dispatcher that sends each event to every configured tracker at once. Adding a new pixel later becomes a few lines, not a rewrite. No existing call sites change behaviour.

**2. Google Analytics 4 added as a second tracker**

Connect GA4 through the Google Analytics connector, then send:

- `page_view` on every route change (SPA routes are not auto-tracked)
- `view_item` on product and jewellery detail pages
- `add_to_cart` / `remove_from_cart` with product, price and quantity
- `add_to_wishlist`
- `view_cart` when the cart drawer opens
- `begin_checkout` when the shopper leaves for Shopify checkout
- `search`, `sign_up`, `generate_lead`, `contact`

This gives a proper funnel view (views to add to cart to checkout) with conversion rates per page, plus the page-level tracking already in Lovable analytics but broken down by event.

**3. Cross-domain continuity to Shopify checkout**

Append the GA4 client/session parameters to the Shopify checkout URL so a session that starts on nairaflore.com and converts on Shopify is attributed to one user rather than counted as a new "shopify referral" visit.

**4. Purchase tracking (Shopify side, no app code)**

Documented steps for you to complete in Shopify admin:
- Meta: Facebook & Instagram sales channel to fire Purchase with the Conversions API
- GA4: add the same measurement ID in Shopify's Google & YouTube channel
Without this, add to carts are tracked here but purchases are not attributed anywhere.

**5. Optional extras (say the word and they get included)**

- TikTok / Pinterest / Snapchat pixels — drop into the same dispatcher
- Google Tag Manager container instead of hardcoded tags, so future pixels can be added without code
- Scroll depth and CTA click tracking on the homepage and product pages

## Technical notes

- New `src/lib/analytics/` module: `dispatch(event, payload)` fans out to registered trackers; `pixel.ts` becomes the Meta adapter and keeps its current exported API so no call site breaks.
- GA4 measurement ID comes from the Google Analytics connector as `VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY`; gtag.js is bootstrapped once at app start and no-ops when the ID is absent.
- `PixelEvents.tsx` is renamed in behaviour to a generic analytics listener handling route changes and contact/map link clicks for all trackers.
- Cart, wishlist, search, auth and product-detail call sites are switched from `trackPixel` to the dispatcher; event payloads are mapped per tracker (Meta `content_ids` vs GA4 `items`).
- Everything stays failure-safe: any tracker throwing or being blocked never affects the shop.
