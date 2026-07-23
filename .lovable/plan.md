## Problem

On the home page, the ring section (`ZirconeTurn`) pins for 170% of viewport height with `scrub: 0.6` and starts with `scale: 1.08`. On mobile that creates a visible "break": as the user scrolls into the section, the pin snaps in late, the ring pops from scale 1.08 → 0.96, and the finale + "VIEW ALL" only appear near the end of a long scrubbed timeline. After the pin releases, the next section (`JewelleryCategories`) jumps in abruptly because there's no fade/handoff.

## Goal

Make the ring section enter, animate, and exit smoothly on both mobile and desktop — no snap, no late pop, no jarring handoff into the categories grid below.

## Changes (all in `src/components/jewellery/ZirconeTurn.tsx`)

1. **Softer pin entry**
   - Change ScrollTrigger `start` from `"top top"` to `"top top+=1"` and add `pinSpacing: true` (default, but explicit) so the browser reserves the space cleanly and doesn't jump when the pin engages.
   - Remove the initial `scale: 1.08` on the card so the ring doesn't visibly "pop" as the pin engages. Keep the shrink-to-0.96 finale beat but start from 1.

2. **Shorter, smoother scrub**
   - Reduce `end` from `+=170%` to `+=120%` so the pinned section doesn't feel like it "holds" the page for too long.
   - Increase `scrub` from `0.6` to `1` for a smoother lerp that hides frame-to-frame jitter on mobile.

3. **Mobile: lighter treatment**
   - Split the `matchMedia` into `(min-width: 768px)` (full pinned flip timeline as today) and `(max-width: 767px)` (no pin — just a short in-view fade for the callouts + finale). Mobile Safari's pin behavior with `100svh` + address bar resize is the main source of the "break" the user is seeing.
   - On mobile, show both callouts and the finale via a simple IntersectionObserver-triggered fade so the section reads as a still editorial vignette instead of a broken scrub.

4. **Clean handoff to next section**
   - Add a short fade-in on the following `JewelleryCategories` via a `section-reveal` wrapper in `src/pages/Index.tsx` (same pattern already used for `CustomisationSteps`) so it eases in after the pin releases instead of snapping.

## Verification

- Playwright at 394×543 (current mobile viewport): scroll from top past the ring section, screenshot at 4 scroll positions, confirm no snap and that the ring, callouts, and "VIEW ALL" are visible together at rest.
- Repeat at 1280×1800 to confirm the desktop flip animation still plays.

## Out of scope

Visuals of the ring, copy, colors, and the finale layout stay exactly as they are — this is a motion/scroll fix only.
