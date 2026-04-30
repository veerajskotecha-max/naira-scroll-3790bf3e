## Goal
Swap the current `naira-logo.svg` (used as the big logo reveal behind the New Arrivals section during the hero scroll animation) with the new uploaded NAIRA wordmark + floral image.

## Steps

1. **Copy the uploaded asset into the project**
   - Source: `user-uploads://ppt_nera-11.webp`
   - Destination: `src/assets/naira-logo-reveal.webp`
   - (Keep the existing `naira-logo.svg` untouched in case it's used elsewhere — quick check shows it's only imported by `HeroScrollyWrapper.tsx`, so leaving it as a harmless orphan is fine. No other files need updating.)

2. **Update `src/components/HeroScrollyWrapper.tsx`**
   - Replace the import:
     ```ts
     import nairaLogo from "@/assets/naira-logo.svg";
     ```
     with:
     ```ts
     import nairaLogo from "@/assets/naira-logo-reveal.webp";
     ```
   - No changes to the `<img>` markup, sizing, GSAP animation, or clip-path reveal — the new image is a wide horizontal wordmark (1920×1080 with lots of whitespace) that will display naturally inside the existing `max-w-[520px] / 760px / 980px` container.

3. **Optional polish (only if it looks off after swap)**
   - The uploaded webp has substantial vertical whitespace around the wordmark. If the logo appears too small inside its container, we can either:
     - Bump the `max-w-*` classes up (e.g. to 720/1000/1280), or
     - Remove the `sepia(0.15) saturate(0.85)` filter since the new asset already uses the brand sage/peach palette.
   - I'll review visually after the swap and adjust only if needed.

## Files Changed
- `src/assets/naira-logo-reveal.webp` (new — copied from upload)
- `src/components/HeroScrollyWrapper.tsx` (1-line import change)

## Out of Scope
- Header/footer logos (those use different assets: `naira-logo-footer.svg` and the header's own logo)
- Removing the old `naira-logo.svg` file
