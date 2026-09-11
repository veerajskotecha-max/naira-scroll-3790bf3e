# Bracelets Collection — Ad Landing Page Upgrade

Target: `/jewellery/collections/bracelets` (the page your Facebook ads point at). The same template also serves rings, earrings and necklaces, so every change is written to work for all four while being tuned on bracelets.

## What changes for the shopper

1. **Short, punchy top of page**
   - Replace the two long paragraphs with one line of promise (roughly 15 words) plus three small proof chips: "Anti-tarnish 18K finish", "7-day returns", "Insured delivery 3-5 days".
   - The longer story text moves further down the page, under the product grid, so it still counts for search but no longer delays the products.
   - Products start within the first screen-and-a-half on mobile instead of after a wall of text.

2. **Best pieces first, sold-out last**
   - Pinned order at the top: Prism Rivière Bracelet, then Heartbead Bracelet, then the rest of the in-stock pieces.
   - Anything sold out is automatically pushed to the bottom of the grid and clearly marked, so an ad click never lands on an unavailable piece first.

3. **Aesthetic pass (award-style collection landing)**
   - Warm ivory-to-blush wash behind the header with a soft floral glow, matching the home hero.
   - Editorial hero: kicker, large serif heading, one-line promise, and a live piece count ("14 pieces · from ₹X").
   - First two cards get a slightly larger, gentler entrance; the rest fade in with a small stagger.
   - Sticky slim trust strip under the header on mobile (returns · shipping · plating assurance).
   - Cleaner card rhythm: consistent 3:4 frames, price and "Add" always aligned, sold-out pieces shown with a quiet "Pre-order" treatment rather than a dead card.

4. **Conversion helpers**
   - A single primary action per card (Add to cart) with the product link on the image and title.
   - Bottom band: "Not sure of your wrist size?" with the WhatsApp atelier link, then the FAQ and the sibling-collection links (kept, but condensed).

## Technical notes

- Edit `src/pages/JewelleryCategory.tsx`: split `intro` rendering into a one-line lead (new short field) plus the existing paragraphs relocated below the grid.
- Add a short `lead` string and keep existing `intro`/`bullets`/`faqs` in `src/data/seoContent.ts` for the bracelets entry (and a sensible lead for the other three slugs).
- Ordering helper in the page: pinned handles/title matches first (Prism Rivière, Heartbead — resolved by live Shopify title like `src/data/adsEdit.ts` does), then in-stock by existing order, then `availableForSale === false` last.
- Reuse `RingAtelierBackdrop` (section variant) for the header wash and `Reveal` for stagger — no new animation library.
- Styling stays on existing tokens/fonts; no change to `JewelCard` logic beyond the sold-out label treatment.
- SEO unchanged: same H1, canonical, breadcrumb, FAQ and CollectionPage JSON-LD; moved copy still renders server-side in the prerender.
