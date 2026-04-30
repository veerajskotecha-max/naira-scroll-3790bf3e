# Replace Cormorant Garamond with Velista (global)

## Goal
Switch every typographic surface currently using Cormorant Garamond to **Velista**, with zero layout/spacing/responsiveness regressions and no render-blocking penalty. Visual hierarchy (sizes, weights, line-heights) stays identical.

## Key insight
All 226 usages across the codebase go through a single Tailwind utility: **`font-cormorant`**. So we do **not** need to edit any component. We simply remap that utility to load Velista, and remove the Google Fonts request for Cormorant.

## Steps

### 1. Add the Velista font file to the project
- Copy uploaded `user-uploads://VELISTA_1.ttf` → `public/fonts/Velista.ttf`
  (using `public/` so it's served at a stable URL and easy to `@font-face` from CSS, matching the "load efficiently / no render-blocking" requirement).

### 2. Register Velista via `@font-face` in `src/index.css`
Add at the top of the file:
```css
@font-face {
  font-family: 'Velista';
  src: url('/fonts/Velista.ttf') format('truetype');
  font-weight: 400 600;          /* covers existing 400/500/600 usage */
  font-style: normal;
  font-display: swap;            /* non-blocking, instant fallback */
}
```
- `font-display: swap` ensures no render-blocking; fallback shows immediately, Velista swaps in when ready.
- Single file covers the 400/500/600 weight range that components currently request.

### 3. Remove the Cormorant Google Fonts request from `index.html`
Delete:
- the `<link rel="stylesheet" ... Cormorant+Garamond ...>` block (with its `media=print` swap trick)
- the `<noscript>` Cormorant fallback
- the now-unused `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com`

This eliminates an external network request and improves the Speed score we worked on previously.

### 4. Remap the Tailwind `font-cormorant` utility to Velista
In `tailwind.config.ts`, change:
```ts
fontFamily: {
  cormorant: ['"Cormorant Garamond"', 'serif'],
},
```
to:
```ts
fontFamily: {
  cormorant: ['Velista', 'Cormorant Garamond', 'Georgia', 'serif'],
},
```
- Keeping the utility name `font-cormorant` means **no component edits** — all 226 call sites automatically pick up Velista.
- Fallback chain: Velista → (legacy Cormorant if cached) → Georgia → generic serif. Guarantees a serif-like fallback so layout doesn't shift to a sans-serif during font swap.

### 5. Optional micro-adjustment for visual balance
Velista's metrics differ slightly from Cormorant Garamond. To keep the "visually identical structure" requirement safe, add a tiny global tuning rule in `index.css` scoped only to the utility:
```css
.font-cormorant {
  /* Velista runs slightly tighter than Cormorant; nudge for parity */
  letter-spacing: 0.005em;
}
```
After the change is live we'll visually QA hero/headings/buttons and only keep this rule if needed (remove if Velista already matches).

## Files changed
- `public/fonts/Velista.ttf` (new — copied from upload)
- `src/index.css` (add `@font-face` + optional letter-spacing nudge)
- `index.html` (remove Cormorant `<link>`, `<noscript>`, font preconnects)
- `tailwind.config.ts` (remap `cormorant` family to Velista with fallbacks)

## What does NOT change
- No component files are modified.
- All `font-cormorant` class usages, sizes, weights, leading, tracking, and responsive breakpoints stay exactly as-is.
- Hero LCP preload, Shopify image optimizations, and other Speed-tab fixes from the prior pass are untouched.

## Risk & QA
- **Risk:** Velista's x-height or width may differ enough to cause a 1–2px shift in tightly-fit headings (e.g., hero wordmark, sticky CTA). Mitigation: `font-display: swap` + serif fallback chain prevents jarring sans-serif flash; optional letter-spacing nudge handles fine balance.
- **QA after build:** Spot-check Hero, New Arrivals heading, Product card titles, Footer, Buttons, Mobile menu — confirm no overflow/clipping at 375px / 768px / 1114px / 1440px widths.
