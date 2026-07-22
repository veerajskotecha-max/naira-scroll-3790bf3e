## Loading speed audit

I audited the bundle, assets, and HTML. The biggest wins are unused files being downloaded and oversized testimonial images. Nothing here changes the design — only what the browser fetches and when.

### What's slowing the site down today

1. **Broken LCP preload (biggest bug).** `index.html` preloads `/src/assets/naira-final-hero-1.png` (**4.1 MB**) with `fetchpriority="high"`. That image is not used anywhere on the site — the hero uses the small `exhibition/look-*.webp` files. Every visitor is downloading 4 MB for nothing, blocking the real hero images from getting priority bandwidth.
2. **Dead heavy assets shipped in the bundle.** Vite tree-shakes JS but the following are still on disk and easily re-introduced. They aren't imported anywhere:
   - `naira-final-hero-1.png` 4.1 MB
   - `naira-final-hero-2.png` 1.8 MB
   - `naira-final-hero-3.png` 764 KB
   - `naira-hero-model-optimized.png` 1.0 MB
   - `floral-pattern-frame.svg` 1.3 MB
   Total: **~9 MB** removable.
3. **Oversized testimonial images (used, but too big).** All actively loaded on the homepage further down:
   - `testimonials-tall-pink.webp` 2.8 MB
   - `testimonials-t1-zardozi.webp` 975 KB
   - `testimonials-bot-evening.webp` 819 KB
   - `testimonials-mr-bridal.webp` 769 KB
   - `about-dream-stitched.webp` 756 KB, `testimonials-bl-lehenga.webp` 756 KB, `testimonials-top-blush-anarkali.webp` 752 KB
   These should be re-encoded to ~150–250 KB each at display resolution.
4. **No route-level code splitting.** `src/App.tsx` eager-imports every page (Shop, Product, About, Contact, Privacy, Terms, Exchange, FAQ, MadeForYou, Cart redirect). The homepage bundle includes all of them.
5. **Unused GSAP chunk.** `vite.config.ts` declares an `animations: ['gsap', '@gsap/react']` manual chunk, but no source file imports GSAP anymore (removed when the scroll wrapper was rewritten). Vite may still resolve and ship it because it's named in `manualChunks`.
6. **Testimonial images load eagerly.** Section is far below the fold; images should be `loading="lazy"` with explicit `width`/`height` so the browser skips them until scrolled near.

### Plan

**A. Fix the hero preload (instant win, ~4 MB saved per visit)**
- In `index.html`, replace the `naira-final-hero-1.png` preload with the actual LCP image: the first exhibition look. Since bundlers hash the filename, use a preload for the first exhibition WebP via a Vite-friendly path, or move `look-1.webp` to `/public/hero/look-1.webp` and preload that stable URL. The hero `<img>` already sets `fetchPriority="high"` on the first look, so at minimum the wrong preload must go.

**B. Delete unused heavy assets (~9 MB off the repo, prevents accidental re-import)**
- Remove `naira-final-hero-1.png`, `naira-final-hero-2.png`, `naira-final-hero-3.png`, `naira-hero-model-optimized.png`, `floral-pattern-frame.svg`.

**C. Recompress testimonial + about images**
- Re-encode the seven files above to WebP quality ~78 at their real render size (long edge ≤ 1400 px). Target ≤ 250 KB each. Overwrite in place so imports don't change.

**D. Route-level code splitting in `src/App.tsx`**
- Convert every non-home route to `React.lazy(() => import(...))` and wrap `<Routes>` in `<Suspense fallback={null}>`. Home (`Index`) stays eager so first paint is unchanged. This trims the initial JS bundle noticeably — Shop, PDP, About etc. only load when visited.

**E. Clean up `vite.config.ts`**
- Drop the `animations: ['gsap', '@gsap/react']` entry (and remove those deps from `package.json` if truly unused) so Rollup doesn't ship an empty/phantom chunk.

**F. Lazy-load below-the-fold images**
- Add `loading="lazy"` and `decoding="async"` plus explicit `width`/`height` (or `aspect-ratio`) to `<img>` tags in `Testimonials.tsx`, `Craftsmanship.tsx`, `FounderStoryTeaser.tsx`, `BrandEthos.tsx`, `CampaignFilm.tsx`. Home-hero images stay as they are.

### Expected impact
- Initial download: **~4 MB → ~500 KB** for a fresh homepage visit (mostly from removing the bogus preload).
- Repo weight: **-9 MB** of dead assets.
- Homepage JS: smaller by whatever the non-home routes weigh (typically 30–80 KB gzipped).
- LCP: significantly faster because the real hero image finally gets the priority slot.

### Out of scope (not touching)
- Visual design, layout, fonts, animations, copy.
- The scroll-driven marquee behavior added in the previous turn.
- Shopify data fetching (product loading is already deferred by the API itself).
