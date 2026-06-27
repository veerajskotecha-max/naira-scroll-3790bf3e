## Goal

Lift the existing homepage hero from a 5/10 to a 10/10 editorial moment by layering in elegant, hand-illustrated floral overlays — inspired by direction v2 (Editorial Couture). Everything currently on the page stays: the existing model image, the giant "NAIRA" watermark, the falling HeroPetals layer, the masked headline, the supporting line, the SHOP COLLECTION CTA, the cursor glow, the parallax. Only additive — no structural rewrites.

## What changes

### 1. New floral overlay assets (generated, transparent PNG)
Four refined botanical illustrations, rendered as transparent PNGs so they layer cleanly over the warm beige + model:

- **Top-left marigold + jasmine cluster** — dense ochre/burgundy marigolds with white jasmine buds and sage leaves, hand-painted gouache style with subtle gold-leaf petal edges. Asymmetric, spills inward.
- **Right-edge jasmine garland** — vertical white jasmine vine with green leaves draping down the right margin, behind/over the model's outer edge.
- **Bottom-left gulmohar bloom + petal scatter** — single oversized burgundy/ochre bloom anchoring the corner, with 4–6 small loose petals to scatter around the CTA.
- **Corner ornament motif** — fine gold botanical filigree for the four corners (single asset, rotated per corner).

All saved under `src/assets/hero/` as `.png` with transparent backgrounds, generated at premium quality.

### 2. New `HeroFlorals.tsx` component
A dedicated layer mounted inside `HeroSection` (above the model, below the headline text), holding the four overlay groups. Pure presentational — no scroll listeners, no business logic. Uses CSS keyframe animations with `prefers-reduced-motion` guard.

### 3. Bouncing motion (the key request)
Replace any "falling / cascading" feel with elegant, gentle **floating bounce**. Three custom keyframes added to `tailwind.config.ts`:

- `bloom-bounce`: 6s ease-in-out infinite — translateY ±6px + rotate ±1.5°, staggered phase per cluster
- `petal-drift`: 9s ease-in-out infinite — translateY ±10px + translateX ±4px + rotate ±6°, per scattered petal
- `garland-sway`: 8s ease-in-out infinite — rotate ±2° from top anchor for the jasmine garland

Each overlay also gets a one-time mount entrance: scale 0.94 → 1 + opacity 0 → 1 over 1.2s with staggered delays (200ms / 450ms / 700ms / 900ms) so the florals "bloom in" after the headline mask reveal finishes.

### 4. Subtle paper grain + gold accents (v2 cues, kept tasteful)
- Faint paper-grain overlay across the hero (5% opacity, mix-blend-multiply) for editorial weight
- Hairline gold rule under the SHOP COLLECTION CTA (linear gradient #B8860B → transparent), no other CTA changes
- Tiny "EST. MMXXIV" meta label, top-left of the text column, 9px Montserrat tracking — visual weight only

### 5. What stays untouched (explicit)
- `HeroSection.tsx` structure, layout grid, paddings, breakpoints
- `heroModel1` image and its sizing/positioning
- "NAIRA" watermark and its parallax
- `HeroPetals` falling-petals layer
- Headline mask-reveal animation, copy, and italic
- Supporting paragraph and CTA destination
- Cursor glow effect
- Trust strip below

## Composition (z-index map)

```text
z-1   NAIRA watermark (unchanged)
z-2   NEW  background lotus ghost (12% opacity, bottom-left)
z-3   HeroPetals (unchanged)
z-4   heroModel1 image (unchanged)
z-5   cursor glow (unchanged)
z-6   NEW  right-edge jasmine garland (over model edge)
z-7   NEW  top-left marigold cluster (over headline corner)
z-8   NEW  bottom-left gulmohar + scattered petals
z-9   NEW  four gold corner motifs + paper grain
z-50  Headline + CTA text layer (unchanged)
```

The headline always sits on top — florals never obscure the words.

## Files

**New**
- `src/assets/hero/marigold-cluster.png` (generated, transparent)
- `src/assets/hero/jasmine-garland.png` (generated, transparent)
- `src/assets/hero/gulmohar-bloom.png` (generated, transparent)
- `src/assets/hero/gold-corner.png` (generated, transparent)
- `src/assets/hero/paper-grain.png` (generated, seamless tile)
- `src/components/HeroFlorals.tsx`

**Edited**
- `src/components/HeroSection.tsx` — mount `<HeroFlorals />` inside the existing `<section>`, add the EST. MMXXIV meta label and gold underline on the CTA. No other changes.
- `tailwind.config.ts` — add `bloom-bounce`, `petal-drift`, `garland-sway` keyframes + animations.

## Technical notes
- All overlay images are decorative → `alt=""` + `aria-hidden="true"`, `loading="eager"` on the marigold + garland (above-the-fold), `loading="lazy"` on petals/lotus.
- Each overlay wrapped in `motion-safe:` Tailwind variants so `prefers-reduced-motion` users get static composition.
- No JS scroll listeners added — bouncing is pure CSS, GPU-accelerated (`transform`, `opacity` only, `will-change: transform`).
- Mobile: marigold cluster scales to ~60% size and shifts to top-right to avoid colliding with the centered mobile headline; bottom gulmohar moves to bottom-right of CTA.

## Out of scope
- Desktop variations (v1, v3) — not building those
- Logo, navbar, trust strip, hero copy, CTA destination — untouched
- Replacing the model image or the NAIRA watermark
