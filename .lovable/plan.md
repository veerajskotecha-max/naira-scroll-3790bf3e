## Plan

1. **Update checkout URL formatting**
   - Change `formatCheckoutUrl()` so Shopify cart checkout URLs like `/cart/c/<token>` are converted to Shopify’s web checkout route on the permanent domain: `https://nc5eti-gp.myshopify.com/checkouts/cn/<token>`.
   - Preserve the `key` query parameter and keep `channel=online_store`.
   - Keep a safe fallback for unexpected URL formats.

2. **Make saved carts self-heal**
   - Because existing users may still have old `nairaflore.com/cart/c/...` URLs in localStorage, ensure `checkout()` formats the URL at click time before opening it.
   - The current click path already calls `formatCheckoutUrl()`, so improving that function should fix both new and existing saved carts.

3. **Add a defensive internal redirect for `/cart/c/...`**
   - Add a React route for `/cart/c/:token` and `/cart/c/:token/*` that redirects users away from the NAIRA 404 if Shopify still sends them back to the Lovable site.
   - This fallback page will rebuild the Shopify checkout URL from the current path/query and immediately redirect the browser to `nc5eti-gp.myshopify.com/checkouts/cn/<token>?key=...&channel=online_store`.

4. **Verify**
   - Test `formatCheckoutUrl()` with the currently failing URL.
   - Confirm the generated URL no longer uses `/cart/c/...` and does not resolve to the NAIRA 404 route.

## Technical details

The current host rewrite is not enough because Shopify redirects `nc5eti-gp.myshopify.com/cart/c/...` back to the store’s primary domain (`www.nairaflore.com`), which is hosted by Lovable. Using the `/checkouts/cn/...` checkout route avoids that primary-domain cart redirect loop.