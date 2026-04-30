## Goal
Make the new NAIRA webp logo in the New Arrivals scroll-reveal render at the same visual size as the previous SVG. The webp ships on a 1920×1080 canvas with ~60% transparent padding around the wordmark, so when constrained to the SVG's old `max-w-[520/760/980px]`, the visible logo looks roughly 2.5× too small.

## Fix
In `src/components/HeroScrollyWrapper.tsx`, update the `<img>` inside `logoRevealRef` (currently lines 259–266):

**From:**
```tsx
<img
  src={nairaLogo}
  alt=""
  className="w-[82vw] max-w-[520px] md:max-w-[760px] lg:max-w-[980px] h-auto"
  style={{ filter: "sepia(0.15) saturate(0.85)" }}
  loading="eager"
  decoding="async"
/>
```

**To:**
```tsx
<img
  src={nairaLogo}
  alt=""
  className="w-full max-w-[1300px] md:max-w-[1900px] lg:max-w-[2450px] h-auto object-contain"
  loading="eager"
  decoding="async"
/>
```

### What changes & why
- **`w-full` instead of `w-[82vw]`** — image fills the parent flex container (already `inset-x-0 flex justify-center`), no intrinsic-resolution clamping.
- **`max-w` bumped ~2.5×** (520→1300, 760→1900, 980→2450) — compensates for the wordmark only occupying ~40% of the webp's transparent canvas, so the *visible* NAIRA glyphs end up at the same on-screen width the SVG had.
- **`object-contain`** — guarantees the full image renders without cropping at any aspect ratio.
- **Removed `filter: sepia/saturate`** — the SVG was a flat sage outline that needed warming; the new webp already uses the correct brand sage + peach palette, so the filter would mute it.
- **No changes** to the wrapper `<div>`, GSAP timeline, clip-path reveal, positioning (`top-[38vh]/34vh/30vh`), z-index, or `willChange` — animation behaves identically.

## Files Changed
- `src/components/HeroScrollyWrapper.tsx` (one `<img>` block, lines 259–266)

## Verification
After the swap, the wordmark should:
- Span roughly the full content width on desktop (matching the original SVG's commanding presence behind the products grid).
- Stay centered horizontally via the existing `flex justify-center` parent.
- Animate in via the same clip-path / opacity / scale GSAP sequence — no layout shift, no animation regression.
- If on very large monitors (>1600px) the wordmark looks slightly *too* large, we can dial the `lg:max-w` down from 2450 → 2100. I'll review visually after the change.
