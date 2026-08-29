# Shopify port — working state

Paused at the user's request. This file is the resume point: everything the
port needs lives in this directory now, so nothing depends on the ephemeral
session scratchpad any more.

## The goal

Rebuild nairaflore.com (React/Vite SPA in `src/`) as a Shopify Liquid theme,
visually identical, verified with screenshots end to end. Opus plans and
verifies; Sonnet agents do the mechanical work.

## Where things are

| | |
|---|---|
| Store | `nc5eti-gp.myshopify.com` |
| Target theme | **150497591458 — UNPUBLISHED** |
| Local theme copy | `shopify/theme/` (this repo) |
| Render + screenshot harness | `shopify/harness/` (run `npm install` first) |
| React source of truth | `src/` (this repo) |

## Deploy protocol — do not skip

1. **Only ever write to theme 150497591458.** It is unpublished.
   `themeFilesUpsert` is rejected on the live/MAIN theme by design.
2. **Every upload is verified by MD5.** Compute the local MD5, upload, then
   read `OnlineStoreThemeFile.checksumMd5` back and compare. Sonnet agents
   have silently mis-transcribed box-drawing runs (`─`, `═`) and `\uXXXX`
   escapes on five separate uploads — 6 to 18 bytes off each time. A byte
   count alone is not enough; only the MD5 catches it.
3. **Order matters.** A template JSON naming a section file that does not
   exist yet is rejected with *"Section type 'X' does not refer to an
   existing section file"*. Upload sections before the templates that use
   them.
4. **Templates must declare their blocks.** Shopify renders only the blocks
   written into the template JSON — it does *not* fall back to the schema
   presets. A section with blocks in its schema but none in `index.json`
   renders empty on the storefront.
5. Live store data (collections, menus, pages, articles, products) is
   **out of scope without explicit approval**. Theme files only.

## Harness

`shopify/harness/` is a local Liquid renderer — the storefront itself is
unreachable (nairaflore.com is served by Lovable, not Shopify), so this is
the only way to see the theme.

- `shopify.mjs` — liquidjs with Shopify shims (`money`, `asset_url`,
  `image_url`, `stylesheet_tag`, `{% schema %}`, `{% paginate %}`, …)
- `data.mjs` — Storefront API → Liquid objects (token in file, API 2025-07)
- `render.mjs` — template JSON → HTML
- `shoot.mjs` — Playwright screenshots
- `report.mjs`, `thumb.mjs`, `hoveraudit.mjs`

Screenshot gotchas already solved, keep them:
- headless Chromium cannot reach external hosts here; `page.route()` proxies
  through Node `fetch`
- `position: fixed` → `absolute` before capture (do **not** force
  `position: static` globally, it collapses every absolute layout)
- force `loading="eager"` on all images before capture
- `reducedMotion: 'reduce'` so the theme's own reduced-motion fallback
  reveals scroll-triggered content that would otherwise sit at opacity 0
- Chromium is pinned at `/opt/pw-browsers/chromium`

## State

### Done and verified in the theme
Header, footer, hero (6 looks), jewellery categories, customisation steps,
brand ethos, craftsmanship, founder teaser, testimonials, campaign film,
collection/listing page with pagination, PDP, cart, search, 404,
list-collections, privacy policy, ring atelier backdrop, global chrome
(film grain / scroll bloom / feather cursor), product card CSS.

Link audit: 32 broken → 0. Hover/focus audit: 30 interactive component
types, all 30 have focus states, reduced-motion handled.

### In flight at pause
- **`sections/nf-header.liquid`** — a background agent was re-uploading the
  manual-nav fix after catching a 6-byte transcription drift on two literal
  `—` sequences in the schema. **Re-verify this file's MD5 first thing.**

### Built locally, not yet uploaded
- **`sections/nf-zircone-turn.liquid`** (new, 16,329 B) — port of
  `src/components/jewellery/ZirconeTurn.tsx`. The two-photo ring turn,
  GSAP timeline reproduced without GSAP. Liquid balance, JS syntax and
  schema JSON all validated. Uses `assets/nf-ring-cut-front.webp` and
  `assets/nf-ring-cut-34.webp`, both already in the theme.
  Next: render it in the harness, screenshot it, upload with MD5 check,
  then add it to `templates/index.json`.

### Known bug found at pause, NOT yet fixed
`sections/nf-ring-backdrop.liquid` is wrong structurally. In
`src/pages/Index.tsx` the backdrop is an absolutely-positioned wash *behind
a group of sections* (ZirconeTurn + JewelleryCategories share one; then
CustomisationSteps + BrandEthos + Craftsmanship + FounderStoryTeaser share
another). The Liquid version is instead a standalone band with its own
`min-height` plus an eyebrow, heading and CTA that do not exist on the live
site. On the homepage its settings are empty so no heading renders, but it
still injects an extra ~420px band that the React page does not have.

Shopify sections cannot wrap other sections. The fix is to render the
`nf-ring-backdrop` snippet *inside* each section that belongs to a wash
band (the snippet already takes `variant: 'section'` and scopes itself to
whatever positioned box renders it), and drop the standalone band from
`index.json`.

### Still unported from React
`ZirconeTurn` is built but not deployed (above). After it:
CustomerReviews (736 lines), ProductDetails (583), JewelCard (344),
CartDrawer (299), ScrollSteps (230), ProductGallery (220), SearchOverlay
(212), CustomizationStories (202), WelcomeOfferPopup (197), AboutTimeline
(193), RingSizeGuideModal (143), SpinStage (127), PincodeChecker (123),
MaterialsCraft (121), SizeGuideModal (118), NewArrivals (114),
WishlistDrawer (110), MegaMenu (96), YouMayAlsoLike (84), SplitText (77),
RingLivingFire (77), Reveal (73).

### Content missing in Shopify (needs the user, not code)
FAQs page; a `/gifting` page (GIFTING currently points at
`/collections/sets` as a stand-in); 5 journal articles (blog `news` has 0).

### Open questions never answered
- 7 legacy Sense-editor templates are still in the theme — keep or delete?
- Task #4 (security and caching headers) and #6 (journal author/cover image)
  are still pending on the React site, unrelated to the port.

## Traps already hit — do not re-learn these

- Liquid has no ternary, and filters are not allowed inside `if` conditions.
- `contains 'ring'` matches `'earring'`. Test earrings before rings.
- Ring size is a **line-item property** (`properties[Size]`), not a variant.
  Zero ring products have more than one Shopify variant, so iterating
  `product.variants` silently loses the shopper's choice.
- `{% paginate %}` is required above 50 products.
- `[hidden]` loses to an explicit `display:` rule.
- Empty theme settings made `body_scale` 0, and `calc(1 + 0.8/0)` resolved
  to FLT_MAX — 2^25px tall elements. Load `config/settings_data.json`.
- The Storefront API token is scoped to the "Naira Headless" publication,
  so it under-reports what exists. Check the Admin API before concluding a
  collection or product is missing.
- `pgrep -f` / `pkill -f` match their own command line and will kill the
  calling shell.
