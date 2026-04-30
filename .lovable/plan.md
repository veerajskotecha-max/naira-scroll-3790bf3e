I’ll re-wire the Shopify product flow end-to-end again, with special focus on why `/product/royal-enigma` is falling back to the old stock product page.

Plan:

1. Fix the Shopify product detail query
   - Update `src/lib/shopify.ts` so the `PRODUCT_BY_HANDLE_QUERY` no longer requests the restricted `quantityAvailable` field.
   - Keep the Storefront API on version `2025-07` and use the connected store `nc5eti-gp.myshopify.com`.
   - Add safer handling for Storefront API GraphQL errors so failed product-detail fetches don’t silently render the fake fallback product.

2. Remove stock fallback rendering from individual product pages
   - Update `src/pages/ProductDetail.tsx` so it shows a proper loading state while Shopify is fetching.
   - If Shopify returns no product for the handle, show a real “Product not found” state instead of the hardcoded “Midnight Silk Drape Saree”.
   - Use Shopify’s title, description, price, images, handle, variant, and availability in the page metadata and sticky add-to-cart.

3. Reconnect Product Gallery and Product Details to real Shopify data only
   - Remove or isolate the old imported stock images from `ProductGallery` and `ProductDetails` so they are not used for Shopify product pages.
   - Gallery will render Shopify images from `product.images`; if a Shopify product has no images, it will show a neutral placeholder instead of old stock couture images.
   - Details will render the actual Shopify description, variants/options, price, and selected size/option state.

4. Verify ProductCard links from New Arrivals and Shop
   - Ensure `ProductCard` always links using the Shopify `handle`, e.g. `/product/royal-enigma`.
   - Ensure New Arrivals and Shop continue using `fetchShopifyProducts(...)` and `productFromShopify(...)`, not static arrays.
   - Keep the card styling, wishlist behavior, and Add to Cart behavior intact.

5. Restore/confirm Shopify cart checkout
   - Confirm `CartContext`, `CartDrawer`, `StickyAddToCart`, and `useCartSync` use Storefront API cart mutations only.
   - Ensure checkout URL is generated from Shopify cart APIs and includes `channel=online_store`.
   - Do not add manual checkout URLs or direct Shopify product-page redirects.

6. Clean up remaining stock-product sections that affect product pages
   - Replace the `YouMayAlsoLike` static stock-product cards on the product detail page with live Shopify products, excluding the current product when possible.
   - Leave unrelated Hero animation components untouched: no edits to `HeroSection`, `HeroScrollyWrapper`, or scroll/GSAP animation files.

7. Validation
   - Check that a Shopify product such as “Royal Enigma” loads at `/product/royal-enigma` with its real Shopify title, description, price, and images.
   - Check New Arrivals and Shop still list live Shopify products.
   - Check Add to Cart and Secure Checkout still create/update a Shopify cart rather than using fake/local-only checkout.

Files expected to change:
- `src/lib/shopify.ts`
- `src/pages/ProductDetail.tsx`
- `src/components/product/ProductGallery.tsx`
- `src/components/product/ProductDetails.tsx`
- `src/components/YouMayAlsoLike.tsx`
- Possibly `src/components/StickyAddToCart.tsx` and `src/components/ProductCard.tsx` if needed for variant/handle consistency

Files I will not touch:
- `src/components/HeroSection.tsx`
- `src/components/HeroScrollyWrapper.tsx`
- Hero animation or GSAP/scroll-animation files