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
2. **Upload text files as BASE64, not TEXT, and verify by MD5.**
   `OnlineStoreThemeFileBodyInput` accepts `BASE64`. Encode the file
   locally, check the encoding round-trips (`base64 -d | cmp`), and send
   only that pure-ASCII string. This makes transcription error structurally
   impossible. Every TEXT-body upload in this port that contained a
   box-drawing run (`─`, `═`), a literal `\uXXXX` escape, an escaped quote
   or a stray bullet came back 6 to 18 bytes short; every BASE64 one has
   matched first time. Either way, read `checksumMd5` back and compare with
   `md5sum` — a byte count alone does not catch a same-length corruption.

   For **binaries**, do not base64 them into a prompt. Use a staged upload:
   `stagedUploadsCreate` (resource FILE) -> POST the file to the returned
   `url` with curl, sending every returned parameter as a form field plus
   `-F "file=@<path>"` (201 + an ETag means success, and that ETag is the
   MD5) -> `themeFilesUpsert` with `body: {type: URL, value: <resourceUrl>}`.
   For a file already on a public URL — a Shopify CDN image, say — skip
   straight to the URL body. Note the mutation returns an empty
   `upsertedThemeFiles` array for URL bodies even on success; verify with a
   separate query.
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

## The parity harness

`shopify/PARITY.md` carries the current scoreboard. The method that produces
it matters more than the numbers:

1. Build the React app (`npx vite build --mode development`) and serve
   `dist/` with an SPA fallback — `harness/spa.mjs`, port 4325. Without the
   fallback every route but `/` serves a 404 page and the diff silently
   compares against nothing.
2. Render every theme template and serve it — `render.mjs` then
   `serve.mjs`, port 4310.
3. `REACT_BASE=http://127.0.0.1:4325 bash harness/difall.sh`

`harness/styledif.mjs` walks both DOMs, keys every text-bearing element by
its own text, and reports what each side renders that the other does not
plus the computed properties that diverge. It reads the rendered result, so
it catches what reading the source cannot: a rule that loses the cascade, an
element hidden by an inherited reset, a font that silently falls back.

Two things it gets wrong, so check the JSON before acting on a single row:
it keys by text and keeps the first occurrence per side, so a word that
appears in both a nav drawer and the page body produces a bogus row; and a
count rendered from live Shopify data will never match a count hardcoded in
the React source.

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

### Sync audit at pause — local vs theme 150497591458

Every file this port owns was checked by MD5 against the deployed theme.

**73 files byte-identical.** That includes `sections/nf-header.liquid`, so
the manual-nav fix *is* live — the 6-byte drift chased earlier was two
literal `\u2014` escapes inside schema `"info"` help text, which Shopify
stores as real em dashes. Same parsed value, different bytes. The local
copies of `nf-header.liquid`, `nf-hero.liquid` and `templates/index.json`
have been normalised to the stored form, so the MD5s now agree and this
class of false alarm is gone for good.

**Two real gaps found and fixed here:** `sections/nf-list-collections.liquid`
had never been uploaded at all, and `templates/list-collections.json` was
still the legacy Sense `main-list-collections`. Both are now deployed and
MD5-verified, so `/collections` renders the ported page. An earlier report
that this page was done was wrong.

**Two known, accepted differences:**

- The 7 legacy Sense page templates (`page.custom`, `page`, `page.landingpage`,
  `page.made-for-you`, `page.made-for-you-2`, `page.naira-bridal-edit`,
  `password`) differ. The deployed versions are the truth; the local copies
  are stale pulls. Do not push local over them.
- `assets/nf-wordmark.png` is the same size but different bytes locally and
  remotely, cause unknown. The deployed one is what the header serves and it
  renders correctly, so it was left alone. Do not overwrite it without
  looking at both.

Shopify reports template JSON `size` *excluding* the auto-generated banner
comment it maintains itself. `templates/product.json` reads as 122 bytes
against 485 locally for exactly that reason — its body was fetched and
confirmed to be `nf-product`.

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
