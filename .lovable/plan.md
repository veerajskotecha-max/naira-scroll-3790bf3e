## Problem

Clicking "Secure Checkout" opens `https://nairaflore.com/cart/c/hWNCEEs...?key=...&channel=online_store` and the site shows the Naira 404 page.

## Root cause

`nairaflore.com` is set as the primary domain inside Shopify, so the Storefront API returns `checkoutUrl` values pointing at `https://nairaflore.com/cart/c/...`. But `nairaflore.com` is hosted on Lovable (a React SPA), not Shopify. Lovable's SPA fallback serves `index.html` for `/cart/c/...`, React Router has no matching route, and the 404 page renders.

Shopify's actual checkout pages live on the store's permanent domain: `nc5eti-gp.myshopify.com` (already stored as `SHOPIFY_STORE_PERMANENT_DOMAIN` in `src/lib/shopify.ts`).

## Fix

Update `formatCheckoutUrl()` in `src/lib/shopify.ts` to rewrite the host of any returned `checkoutUrl` to `SHOPIFY_STORE_PERMANENT_DOMAIN`, while preserving the `/cart/c/<token>` path, query string (including `key=...`), and adding `channel=online_store`.

After the fix, the same click will open:
`https://nc5eti-gp.myshopify.com/cart/c/hWNCEEs...?key=...&channel=online_store`
which is Shopify's real checkout and will load correctly.

No other files need changes — every code path that opens checkout already runs through `formatCheckoutUrl`.

## Optional follow-up (recommended, not required for the fix)

In Shopify Admin → Settings → Domains, either:
- keep `nairaflore.com` as the Lovable-hosted storefront and set the Shopify store's primary domain to `nc5eti-gp.myshopify.com` (or a different subdomain like `shop.nairaflore.com` pointed at Shopify), or
- move the whole storefront onto Shopify.

Without one of these, checkout will work but the URL bar will show `nc5eti-gp.myshopify.com` during checkout, which is less branded.

## Verification

1. Add an item to cart on the published site.
2. Click "Secure Checkout".
3. Confirm new tab opens on `nc5eti-gp.myshopify.com/cart/c/...` and Shopify checkout loads.
