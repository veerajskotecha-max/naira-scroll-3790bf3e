# Fix the ad-tracking gaps the report found

The report's core point: Meta only scores your purchase events well (8.3). Product views and add-to-carts score 6.1 because they arrive from the browser only, with no customer details attached. Three things fix that, and all three are in our control.

## 1. Send the events from our own server as well as the browser

Today Meta hears about a product view or add-to-cart only from the shopper's browser, which ad blockers and iOS routinely drop.

- Add a server sender that reports Product view, Add to cart, Begin checkout and Sign-up to Meta directly.
- Every event gets a shared ID so the browser copy and the server copy are recognised as one event, never double-counted.
- The server copy carries what the browser cannot: the shopper's country, the page they were on, their device details and network address, the anonymous visitor id, and the ad-click id.
- This needs one thing from you: a Meta access token for the dataset, and confirmation of which dataset to use — the pixel's own, or the unused one (1754760745561273). I will ask for the token when we build.

## 2. Attach the shopper's email when we legitimately have it

- For signed-in shoppers only, their email is scrambled (SHA-256, never readable, never stored by us) and attached to their events — this is the single highest-value detail Meta uses.
- Signed-in shoppers get a clear opt-in at sign-up and a switch in their account to turn it off; we send nothing for anyone who has not accepted. Guests stay anonymous-id only, exactly as now.
- The privacy policy is updated to name this.

## 3. Clean up the ad-click path

- Ad clicks currently land on `www.nairaflore.com/products/<handle>`, which bounces to the plain domain, then to the jewellery page — two hops before anything is measured, and the first product view can fire against the wrong page.
- Fix: recognise the `/products/` link straight away and show the correct jewellery page without the extra hop, keeping the ad-click and campaign tags intact.
- The product view will only be reported once the real product page is on screen, so it is never recorded against the homepage shell.
- Note: the `www` hop itself lives in your Shopify product feed. I cannot change the feed from here; I will tell you exactly what to change there.

## Also checked and fixed while in there

- Every event will carry the page address and the ad-click and browser ids, not just the visitor id.
- Purchase continues to come from Shopify, unchanged.
- The stale catalogue dataset (1470484131554912) has to be removed inside your Meta account — I cannot reach it.

## Technical details

- New edge function `meta-capi`: validated payload (Zod), SHA-256 hashing server-side, `event_id` deduplication against the browser pixel, `client_ip_address`/`client_user_agent`/`event_source_url`/`fbc`/`fbp`/`external_id` in `user_data`. Secret `META_CAPI_ACCESS_TOKEN` requested at build time.
- `src/lib/pixel.ts` gains an `event_id` generator and a single dispatch that fires `fbq` and the server call together; call sites in `JewelDetail.tsx`, `ProductDetails.tsx`, `CartContext.tsx`, `Auth.tsx` are updated to use it.
- Advanced matching: re-init `fbq` with `{ external_id, em }` when a session exists and advertising consent is recorded; consent flag stored on `profiles` with its own column plus timestamp.
- `App.tsx`: `/products/:id` resolves the jewellery template directly instead of rendering `ProductDetail` first; `search` is preserved as today.
- Verification: fire each event in the preview, confirm dedup in Meta's test events, then re-read match quality about 48 hours after publishing.
