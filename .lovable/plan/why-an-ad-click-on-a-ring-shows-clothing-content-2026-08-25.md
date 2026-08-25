# Why an ad click on a ring shows clothing content

## What is actually happening

The site has two different product pages:

- `/jewellery/<handle>` — the jewellery page (ring rotation, plating assurance, US 5–7 sizes, jewellery reviews).
- `/product/<handle>` — the original clothing page (stitching/made-to-measure copy, apparel reviews, S/M/L sizes).

Ads and the Shopify/Meta catalogue link to the **clothing** URL, `/product/<handle>`, because that is the generic product link. So the ring loads inside the clothing template. That is why the screenshots show, on a ring:

- "Ready-to-ship pieces deliver within 3–7 working days; made-to-measure pieces take 4–8 weeks" (`src/components/product/ProductDetails.tsx`)
- a "Handcrafted" scissors badge from the apparel trust row
- customer photos of lehengas in the reviews block (the apparel review set)
- a sticky bottom bar showing size "M" for Vintage Halo Ring

It is not a second, separate clothing page for the product — it is the same product rendered by the wrong template. Only the size selector is currently jewellery-aware there; everything else is not.

## The fix

1. **Send jewellery handles to the jewellery page.** On `/product/<handle>`, once the product loads, if it belongs to the jewellery line (Shopify vendor / product type, the same rule the jewellery listing already uses), redirect to `/jewellery/<handle>` with a replace so the ad click lands on the correct page and back-button behaviour stays clean. Show the existing loading state during the check so there is no flash of clothing copy.
2. **Make the clothing template safe anyway** (for any jewellery item the vendor rule misses):
   - swap the GST/made-to-measure line for the jewellery delivery line already used on the jewellery page
   - swap the "Handcrafted / stitching" trust badges for the jewellery set (2-year plating assurance, anti-tarnish, secure payment)
   - pass the jewellery review variant so jewellery photos and reviews show, not lehenga photos
   - hide the size label in the sticky bar when there is no real size option
3. **Canonical + sharing.** Set the canonical URL and OG/Twitter URL on the redirected page to `/jewellery/<handle>` so shared links, Google, and the catalogue converge on one page per product.
4. **Point the ads/catalogue at the right link.** The product link that feeds the catalogue should be the `/jewellery/<handle>` URL for jewellery items. The redirect above makes existing live ads correct immediately; updating the feed link removes the extra hop.

## Technical notes

- Files touched: `src/pages/ProductDetail.tsx` (redirect + canonical + review variant + sticky bar props), `src/components/product/ProductDetails.tsx` (category-aware delivery line and trust badges).
- Jewellery detection reuses the vendor constant from `src/hooks/useLiveJewellery.ts` rather than a new hardcoded list.
- No change to the jewellery page itself, cart, checkout, or pixel events.
