I’ll restore the real Shopify storefront integration that was overwritten, focused on New Arrivals, Shop, product cards, and checkout. I will not modify the Hero animation files/components.

Plan:

1. Restore Shopify Storefront API helpers
   - Recreate `src/lib/shopify.ts` with the connected store domain `nc5eti-gp.myshopify.com`, Storefront token, and API version `2025-07`.
   - Add typed product queries for product lists and product-by-handle.
   - Add cart mutations for `cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`, and cart sync.
   - Ensure checkout URLs are generated only through Shopify’s Storefront API and include `channel=online_store`.

2. Restore Shopify-backed cart behavior
   - Replace the overwritten localStorage-only cart context with a Shopify-backed cart that persists `cartId`, `checkoutUrl`, line IDs, variant IDs, quantity, images, prices, and selected options.
   - Keep the existing cart drawer UI styling as much as possible, but make quantity changes/removal update Shopify cart lines.
   - Make the Secure Checkout button open the real Shopify checkout URL in a new tab.
   - Add graceful loading/error handling and clear stale carts if Shopify returns “cart not found”.

3. Re-wire ProductCard to real Shopify products
   - Extend the `Product` shape to support Shopify product handle, variant ID, currency, selected options, availability, and real images.
   - Make desktop and mobile “Add to Cart” buttons actually add the selected/first available Shopify variant to cart.
   - Keep the current luxury card styling, hover image behavior, wishlist support, and `/product/:handle` links.
   - Remove fabricated static product ratings/review counts from Shopify-fed cards to avoid fake social proof.

4. Re-wire New Arrivals
   - Replace the static stock-image array with `useQuery` loading live Shopify products.
   - Show the first few real Shopify products in the existing New Arrivals grid.
   - Add lightweight loading and empty states that fit the existing design.
   - Do not alter Hero or scroll animation components.

5. Re-wire Shop page
   - Replace `allProducts` static stock products with live Shopify products.
   - Keep the current shop toolbar, filters, sort controls, grid/list toggles, sidebar, and visual layout.
   - Adapt filters to available Shopify data: price and availability will work from real variants; category can use Shopify product type/vendor/tags where available.
   - Keep the empty state as “No products found” when Shopify returns none or filters exclude all.

6. Restore product detail route compatibility
   - Keep `/product/:id` route but treat the param as a Shopify handle.
   - Fetch product by handle and pass real product/variant data into the detail area and Add to Cart flow.
   - Avoid changing unrelated product-detail decorative/hero-like components unless needed for data wiring.

7. Add cart sync hook back into App
   - Recreate `src/hooks/useCartSync.ts` and call it inside the app tree so returning from checkout or tab visibility changes sync the Shopify cart.

Technical notes:
- I verified the project is connected to Shopify store `nc5eti-gp.myshopify.com` and it currently has 19 products.
- Current code has been reverted to static stock-image products in `NewArrivals.tsx`, `ShopAll.tsx`, `ProductCard.tsx`, `CartContext.tsx`, and `CartDrawer.tsx`.
- I will not edit Hero animation-related files such as `HeroSection`, `HeroScrollyWrapper`, or GSAP/scroll animation code.