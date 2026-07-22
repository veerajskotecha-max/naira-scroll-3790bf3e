
## Goal

When the user clicks **Shop Now / Shop Collection** (which routes to `/shop`), the page should open a new landing structured like this:

```text
┌─────────────────────────────────────────────┐
│  JEWELLERY                                  │
│  [ All | Earrings | Rings | Necklaces &    │
│         Pendants | Sets ]                   │
│                                             │
│     ✦  Coming Soon  ✦                       │
│     (elegant placeholder, WhatsApp CTA)     │
├─────────────────────────────────────────────┤
│  INDO-WESTERN OUTFITS                       │
│  (all current Shopify products render here) │
└─────────────────────────────────────────────┘
```

Jewellery stays visually present (with its 5 tabs) but every tab shows the same Coming Soon panel for now. Indo-Western Outfits is the live, shoppable section using the existing Shopify catalogue.

## What we'll build

1. **Rework `src/pages/ShopAll.tsx`** into a section-based layout:
   - **Section A – Jewellery**: heading, 5 tab pills (`All`, `Earrings`, `Rings`, `Necklaces & Pendants`, `Sets`) with `All` selected by default. Body area renders a shared "Coming Soon" panel regardless of tab (subtle animation, brand palette, "Notify on WhatsApp" button → +91 9561557935).
   - **Section B – Indo-Western Outfits**: heading + current toolbar (filters, sort, grid toggle) + the existing product grid fed by `fetchShopifyProducts`. All today's Shopify SKUs live here.
   - Keeps the existing ShopHero above both sections.

2. **New component `src/components/shop/ComingSoonPanel.tsx`** — reusable elegant placeholder (Velista headline, sage divider, single-line copy, WhatsApp CTA). Also used later for individual jewellery category pages.

3. **Anchors + smooth scroll**: `#jewellery` and `#indo-western` so we can deep-link (e.g. navbar "Jewellery" and "Indo-Western" links, and the hero "Shop Now" scrolls to `#jewellery`).

4. **Feature-flag scaffolding** (answers "how to develop rest of page hidden and make live later"):
   - Add `src/config/features.ts`:
     ```ts
     export const FEATURES = {
       jewelleryLive: false, // flip to true to reveal real jewellery catalogue
     };
     ```
   - Jewellery section reads `FEATURES.jewelleryLive`. When `false` → shows Coming Soon on every tab. When `true` → tabs filter real jewellery products by category tag.
   - We can build the full jewellery grid, filters, PDP wiring, etc. behind that flag now; nothing renders to visitors until we flip one boolean and redeploy. This is safer than commented-out code and easier than a separate branch.
   - Optional upgrade later: read the flag from `import.meta.env.VITE_JEWELLERY_LIVE` so we can toggle per-environment without a code change.

5. **Jewellery data readiness (hidden work)**: extend `productFromShopify` mapping to recognise a `category: "Jewellery"` (via Shopify product tag or collection) and a jewellery sub-type tag (`earrings`, `rings`, `necklaces`, `sets`). No visible change until the flag flips — so you can start tagging products in Shopify anytime.

## Out of scope (this pass)

- Building the actual jewellery product grid / PDP (kept for after flag flip).
- Navbar/megamenu changes — happy to add "Jewellery" and "Indo-Western" menu entries in a follow-up if you want.
- Tagging existing Shopify products with jewellery categories (that's done in Shopify admin).

## Technical notes

- Tabs use existing `@/components/ui/tabs` (shadcn) styled with brand tokens (sage active, off-white inactive, 0px radius) to match the editorial look.
- Coming Soon panel: min-height ~420px so the section doesn't collapse; keeps petals/whitespace consistent with the rest of the site.
- Anchor scroll uses `scroll-margin-top` to clear the fixed navbar (94/100/116px).
- Existing filter, sort, layout-toggle behaviour is preserved but scoped inside the Indo-Western section only.
- No changes to Cart, Checkout, or product routing.

## How to go live later (jewellery)

1. Tag jewellery products in Shopify with `Jewellery` + sub-tag (`Earrings`, etc.).
2. Set `FEATURES.jewelleryLive = true` (or `VITE_JEWELLERY_LIVE=true` on the host).
3. Redeploy. Coming Soon disappears; tabs start filtering real products.

Nothing else required.
