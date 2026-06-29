## Goal

Swap the homepage hero (everything above New Arrivals) for the editorial hero used in the **Website Snapshot** project. Everything from New Arrivals downward stays exactly as it is today.

## What the new hero looks like

Taken from `MobileHome.tsx` in Website Snapshot (the "HERO" section, lines 142–329):

- Cream `#FFF8F5` paper background with a pressed-flower pattern wash + warm honey radial gradient
- 10 drifting blush/sage petals animated across the section
- Meta row: "Volume One · Spring · MMXXVI" / "№ 24"
- Giant outlined "06" numeral in sage hairline
- Eyebrow "The Spring Capsule" + masked-reveal headline: **"Softly, slowly,"** with italic **"worn."**
- Edge-to-edge horizontal marquee of 7 exhibition looks (look-1…look-7) gliding side-by-side, with vertical captions "Hand-finished · India" and "Slow-made to measure"
- Italic tagline + dual CTA: **The Edit** (→ /shop, dark btn with sage slide-in) and **Made-to-measure** (→ /customize, outlined)
- Vocabulary marquee: atelier · edit · capsule · hand-finished · slow-made · pressed · salt-washed · made-to-measure

Below it: existing `<TrustStrip />` and `<NewArrivals />` (with its GSAP logo + card reveal) stay untouched.

## Changes

### 1. Copy exhibition images
Copy 7 model cutouts from Website Snapshot into this project:
```
src/assets/exhibition/look-1.png … look-7.png
```

### 2. Load required fonts
The new hero uses Cormorant Garamond (italic display) + Jost (uppercase tracking labels). Add Google Fonts `<link>` tags to `index.html` for both. Project's existing `font-cormorant` Velista utility is untouched — the new hero uses inline `fontFamily` style declarations so they don't collide.

### 3. Rewrite `src/components/HeroSection.tsx`
Replace today's pink-bg hero (watermark NAIRA, model cutout, "Where Tradition Meets Contemporary style") with the editorial hero from `MobileHome.tsx` lines 142–329. Adaptations:
- `Link` import switched from `@/lib/router-shim` → `react-router-dom`
- All asset imports use this project's `@/assets/...` paths (already present except the new `exhibition/` folder)
- All scoped `<style>` keyframes (`naira-reveal-up`, `naira-word-up`, `naira-drift-a/b/c`, `naira-marquee`, `naira-pattern-pan`) ported as-is

### 4. Leave alone
- `src/components/HeroScrollyWrapper.tsx` — still renders `<HeroSection /> <TrustStrip /> <NewArrivals />` with the GSAP logo + card reveal
- `src/components/HeroPetals.tsx` — no longer referenced from the new HeroSection (the new hero has its own petal layer); file kept in place in case other code imports it
- `src/components/NewArrivals.tsx`, `TrustStrip.tsx`, `src/pages/Index.tsx` and everything below — unchanged

## Files touched

| File | Action |
| --- | --- |
| `src/assets/exhibition/look-1.png` … `look-7.png` | Copy from Website Snapshot |
| `index.html` | Add Cormorant Garamond + Jost Google Fonts links |
| `src/components/HeroSection.tsx` | Replace contents with the editorial hero |

## Out of scope

- No changes to NewArrivals, TrustStrip, GSAP scrolly wrapper, footer, or any page beyond the homepage hero.
- Not porting "The Edit", Philosophy, or other sections from `MobileHome.tsx` — user explicitly said "from new arrivals it can be the same as it is".
