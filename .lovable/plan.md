## Mobile spacing audit — what's wrong

From a 390px viewport inspection of `/`:

1. **Top gap (header → "Volume One")** — Index wraps everything in `pt-[94px]` to clear the fixed header, and `HeroSection` then adds another `pt-[110px]`. That's **~204px of dead space** above the "Volume One · Spring · MMXXVI" meta row.

2. **Trust Strip rendered twice** — `HeroScrollyWrapper` already renders `<HeroSection /> <TrustStrip /> <NewArrivals />`, and `src/pages/Index.tsx` then renders `<TrustStrip />` **again** right after the wrapper. Result: one strip between Hero and New Arrivals, a second identical strip between New Arrivals and Customisation Steps. That's the "irregular floating line of secure payments" the user is seeing.

3. **Big empty band between Trust Strip and "New Arrivals" heading** — `NewArrivals` declares `min-height: 100vh` and `pt-[130px] md:pt-[140px] lg:pt-[155px]` to leave room for the GSAP logo reveal overlay. On mobile this reads as a long blank gap above the heading.

## Fix

### a. `src/components/HeroSection.tsx`
Drop the section's own top padding so it sits flush under the navbar:
- Replace `pt-[110px] pb-10 px-5 lg:px-16 lg:pt-[140px] lg:pb-16` with `pt-6 pb-10 px-5 lg:px-16 lg:pt-10 lg:pb-16`.

### b. `src/pages/Index.tsx`
Remove the duplicate Trust Strip (the one already rendered inside `HeroScrollyWrapper`):
- Delete line 45 `<TrustStrip />` and its now-unused import on line 3.

### c. `src/components/NewArrivals.tsx`
Tighten the oversized top padding / forced viewport height on mobile so the heading sits closer to the Trust Strip without disturbing the desktop GSAP logo reveal:
- `min-height: 100vh` → `min-height: auto` on mobile, keep `100vh` from `lg:` up via inline media (use a Tailwind `lg:min-h-screen` instead of the inline style).
- `pt-[130px] md:pt-[140px] lg:pt-[155px]` → `pt-10 md:pt-14 lg:pt-[155px]` so only desktop keeps the logo-reveal headroom.

### d. Verification
After edits, re-run the Playwright mobile screenshot and confirm:
- Less than ~20px between navbar and "Volume One" meta row.
- Only one Trust Strip exists on the page (between Hero and New Arrivals).
- Less than ~40px between that Trust Strip and the "New Arrivals" heading.

## Out of scope
- No design changes to the hero content, marquees, or product cards.
- No desktop layout changes other than the duplicate-strip removal (which fixes desktop too).
