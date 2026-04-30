## Goal

Swap the NAIRA wordmark asset in the New Arrivals scroll-reveal layer from the current SVG (`src/assets/naira-logo.svg`) to the user-provided WebP, keeping the visual output, animation, sizing, responsiveness, and layout pixel-identical.

## Scope

Only `src/components/HeroScrollyWrapper.tsx` (logo `<img>` inside `logoRevealRef`) and adding the new asset. No other files, no animation changes, no container changes.

## Steps

1. **Add the WebP asset**
   - Copy the uploaded image to `src/assets/naira-logo.webp` via `code--copy user-uploads://ppt_nera-11-2.webp src/assets/naira-logo.webp`.

2. **Update the import in `HeroScrollyWrapper.tsx`**
   - Replace `import nairaLogo from "@/assets/naira-logo.svg";` with `import nairaLogo from "@/assets/naira-logo.webp";`.
   - The `<img src={nairaLogo} />` tag stays exactly as-is — same `src` prop name, same parent container, same Tailwind classes (`w-[82vw] max-w-[520px] md:max-w-[760px] lg:max-w-[980px] h-auto`), same `filter` style, same `loading`/`decoding` attrs.

3. **Prevent intrinsic-size drift from the WebP**
   - The uploaded WebP is 1920×1080 (16:9 with lots of empty whitespace), while the current SVG is 192×44 (≈4.36:1, tightly cropped to the wordmark). If we just swap the `src`, the visible "NAIRA" text will appear much smaller because the WebP's bounding box includes large transparent margins.
   - To preserve the exact rendered size of the wordmark, override the `<img>` sizing so the displayed glyphs match the SVG's tight crop:
     - Keep the existing wrapper unchanged.
     - On the `<img>`, change classes to render at the same effective wordmark width as today. Concretely: scale up the WebP by the ratio of (WebP aspect / SVG aspect) ≈ 1920/1080 ÷ 192/44 ≈ 4.07×, so the actual NAIRA letters inside the WebP land at the same px width as the SVG did.
     - Implementation: keep `w-[82vw] max-w-[520px] md:max-w-[760px] lg:max-w-[980px]` on the `<img>` but multiply each by ~4.07× (e.g. `w-[334vw] max-w-[2116px] md:max-w-[3093px] lg:max-w-[3989px]`) and add `h-auto object-contain`. Then wrap the `<img>` in an `overflow-hidden` clipper sized to the original (`w-[82vw] max-w-[520px] …`) and center the oversized image inside it with negative margins / flex centering, so only the wordmark area is visible — visually identical to the current SVG.
   - This keeps GSAP targets, refs, container styles, `clip-path` reveal, opacity/transform animations, and z-index untouched. The `logoRevealRef` div and its inline styles stay exactly as they are; only the inner `<img>` gets a fixed-aspect inner clipper.

4. **Verify**
   - Visually compare the section before/after at desktop (1114px viewport) and mobile widths to confirm the wordmark is the same size and centered identically.
   - Confirm the GSAP timeline still runs (no ref/class changes that would break selectors).

## Technical notes

- File touched: `src/components/HeroScrollyWrapper.tsx` only.
- New file: `src/assets/naira-logo.webp`.
- No changes to: `HeroSection.tsx`, `NewArrivals.tsx`, Shopify integration, GSAP timeline durations/eases, container `logoRevealRef` styles, or any other component.
- The old `naira-logo.svg` can stay in the repo (unused) to avoid risk; safe to remove later.

## Out of scope

- Animation tuning, layout changes, responsiveness changes, replacing the SVG anywhere else (it isn't used elsewhere — verified by file listing).