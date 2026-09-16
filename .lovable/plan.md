# CRO Re-Rating — Walked as a Customer (September 2026)

Method: a phone-sized walkthrough (393x852) of the shop page, a bracelet collection page, a product page and the cart, plus current category research. No traffic figures used.

## Score today: 7.8 / 10

| Step of the journey | Score | What I saw |
| --- | --- | --- |
| Product page | 8.8 | Photo, name, price, discount, delivery and returns line, quantity, gold Add to Cart, black Shop Now, payment reassurance — all on the first screen. Missing: star rating near the price, and a named delivery date |
| Cart | 8.5 | Shipping, total, promo, secure checkout, payment marks all clear. One large empty gap between the item and the summary |
| Shop page | 7 | "Most loved", price chips and the delivery line land well. One lead card shows the white gift-box photo as its cover; names are cut mid-word |
| Bracelet collection page | 7.5 | Beautiful opener, but the page runs 7,400px and the first product only appears after a full screen of copy |
| Shop All page | 5.5 | 14,700px tall on a phone with 138 buy actions in one stream — no paging, no rest |
| Tap comfort | 6.5 | 112-122 controls on listing pages are under the comfortable 44px thumb size |
| Page weight | 6 | Still heavy on first view; images themselves are now light (240-860 KB), the bulk is code |

Research context: Baymard's 2026 mobile benchmark rates 75% of mobile stores only "mediocre" [4](https://baymard.com/blog/mobile-ux-ecommerce), jewellery converts lowest of any category at around 0.9-1.5% [5](https://gainerdigital.com/jewelry-website-visitors-leave-without-buying/), and the single biggest fixable checkout leak is delivery-date ambiguity — showing a dated arrival estimate before checkout moves completion by 6-12 points [4](https://www.acceleroi.com/blog/benchmarks/dtc-jewelry-checkout-conversion-rate).

## Changes to reach 10 / 10

### 1. Fix what a buyer sees first
- No packaging or gift-box photo may ever be a card cover anywhere — extend the existing cover rule to every product, checking all catalogue pieces, not just the three already fixed.
- Let product names wrap to two lines instead of being cut mid-word.

### 2. Give the exact arrival date
- Under the price on the product page and in the cart, show a real date: "Order today, arrives by Sat, 20 Sep" alongside the existing 3-5 working days promise.

### 3. Add the rating where the decision happens
- Stars and rating value directly under the product name, tapping through to the reviews.

### 4. Make the long pages finishable
- Shop All: show 12 pieces with a "Show more" button, the same as the jewellery page.
- Collection pages: lift the first products above the fold by shortening the opening copy block on phones.

### 5. Comfortable thumbs
- Raise every listing control (wishlist heart, filter chips, tabs, arrows) to a 44px touch area without changing how they look.

### 6. Lighten first load
- Split page code so the shop page does not download product-page and reel code before it paints.
- Keep the first row of grid images eager with fixed boxes; defer the rest.

### 7. Cart polish
- Close the empty gap so the item, total and checkout button read as one block on a phone.

## Not changing
Home page, prices, Rs 150 shipping, 7-day returns, 2-year plating, ring sizing rules, sold-out and pre-order treatment, checkout provider, reels section, reviews, press logos, footer.

## Technical notes
- Cover rule: generalise `coverFirst`/`COVER_PICKS` in `useLiveJewellery.ts` into a packaging-detection sink applied to every handle; audit all live products for a packaging-first gallery.
- Delivery date: reuse `src/lib/deliveryDate` helper in `JewelDetail.tsx` and `CartDrawer.tsx`.
- Rating: reuse the reviews aggregate already computed for `CustomerReviews` and render Stars under the title.
- Paging: port the `PAGE_SIZE`/`visibleCount` pattern from `Jewellery.tsx` into `ShopAll.tsx`.
- Tap targets: padding-based hit areas on `JewelCard` heart, `JewelFilterBar` chips, category tabs.
- Weight: route-level lazy imports for PDP and reel bundles; verify at 393x852 with Playwright, `bunx tsgo --noEmit`, clean build.
