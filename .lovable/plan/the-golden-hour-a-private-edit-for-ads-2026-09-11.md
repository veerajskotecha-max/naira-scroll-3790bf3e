# The Golden Hour — a private edit for ads

A hidden, ad-only collection page with 10 hand-picked pieces. It looks and shops exactly like a Shop All page, but it is not linked anywhere in the menus, footer, or search on the site — only people who click your ad reach it.

## The link

`https://nairaflore.com/the-golden-hour`

Alternatives if you prefer a different name (say the word and I'll use it instead):
- `/the-gilded-edit`
- `/maison-edit`
- `/private-atelier`

## The 10 pieces

Confirmed in the catalogue:
1. Toggle Link Chain
2. Woven Gold Hoops
3. Molten Bloom Hoops
4. Charm Box Chain
5. Cushion Halo Ring
6. Brushed Gold Huggies
7. Blush Cluster Ring
8. Pearl Drop Studs

Named by you but listed under slightly different titles in the store — I'll match them to the live Shopify products at build time:
9. Prism Rivière Bracelet
10. Heartbead Bracelet

If either of those two isn't found live, I'll substitute Rivière of Light Bracelet and Pearl Link Bracelet and tell you.

## What the page has

- Editorial hero: "The Golden Hour — a private edit", short line of copy, no navigation clutter.
- Grid of the 10 pieces using the same product cards as Shop All (live price, sold-out state, add to cart, links into each product page).
- Same header/footer as the rest of the site so it feels native and shoppers can still browse.
- Kept out of the sitemap and set to no-index, so it stays out of Google and off the menus while remaining fully shareable in ads.
- Meta Pixel page-view and add-to-cart tracking works there like everywhere else.

## Technical notes

- New route `/the-golden-hour` in `src/App.tsx` rendering a new `src/pages/GoldenHourEdit.tsx`.
- Curated handle list in the page (or `src/data/adsEdit.ts`), resolved against `useLiveJewellery()` and ordered as listed, so pricing and stock stay live.
- `PageSEO` with `noindex, nofollow`, canonical to itself; excluded from `public/sitemap.xml`.
- Reuses `JewelCard` and the existing grid layout; no changes to menus, `Jewellery.tsx`, or `ShopAll.tsx`.
