## Problem

On mobile, in `src/components/jewellery/ZirconeTurn.tsx`, the two benefit labels — **"18K GOLD COATED"** (band) and **"BRILLIANT-CUT ZIRCONE"** (stone) — float far from the ring because they're positioned against the pinned container edges (`top-[18%]` / `top-[24%]`, `left-3` / `right-3`).

Confirmed via mobile screenshots (394px) on both `/` and `/jewellery`:
- Before scroll: the "18K GOLD COATED" chip sits near the top of the viewport with a short leader line pointing into empty space, nowhere near the ring.
- Mid-scroll: the ring turns in the vertical center, but the callouts never appear beside it; the leader lines don't reach the ring.
- After scroll: the "BRILLIANT-CUT ZIRCONE" chip sits high-right, again disconnected from the stone.
- The chips also visually collide with the sticky header/marquee band on shorter phones.

Root cause: mobile positioning uses `%` offsets from the pinned section, but the ring is centered by flex. As pin height varies with `100svh`/`min-h`, the callouts drift away from the ring instead of tracking it.

## Fix

Anchor the callouts to the ring wrapper (not the pinned section) on mobile, and stack them tight above/below the ring so leader lines physically reach the band and the stone.

1. Move `data-call-l` and `data-call-r` **inside** the ring wrapper `div` (the one with `perspective`) so their `absolute` positions are relative to the ring, not the pinned column.
2. Mobile layout for the two callouts:
   - Band callout: positioned at the ring's mid-band height on the left, chip flush to the ring edge, short 20px leader touching the band. Use `-left-2` with chip translated left of the ring.
   - Stone callout: positioned at the stone height on the right, mirrored.
   - Shrink chip padding and leader length on mobile so nothing extends past the viewport on 360–394px widths.
3. Preserve current desktop placement (`md:` classes stay as-is).
4. Ensure the ring wrapper still centers vertically inside the pin so the chips sit inside the pinned frame, not overlapping the sticky header — the header is outside the pin and won't conflict once callouts are ring-relative.
5. Keep the GSAP data-attribute selectors (`[data-call-l]`, `[data-line-l]`, etc.) unchanged so the existing timeline continues to fade/reveal them.

## Technical details

File: `src/components/jewellery/ZirconeTurn.tsx`

- Relocate the two `<div data-call-l>` / `<div data-call-r>` blocks into the `perspective` wrapper alongside the `cardRef` div.
- Replace mobile classes:
  - `data-call-l`: `absolute top-[46%] -translate-y-1/2 right-full mr-1 flex items-center` (chip → line → dot, dot touches ring left edge). Desktop overrides via `md:` stay.
  - `data-call-r`: `absolute top-[42%] -translate-y-1/2 left-full ml-1 flex items-center` (dot → line → chip). Desktop overrides via `md:` stay.
- Reduce mobile chip padding to `px-2 py-1` and leader `w-3` so total width fits within a 360px viewport when combined with a 260px ring.
- No changes to `HeroSection`, `NewArrivals`, or animation timings.

## Verification

- Re-run the Playwright mobile capture at 394×800 across scroll offsets and confirm both chips sit beside the ring band/stone with visibly connected leader lines, before and after the turn.
- Spot-check at 360px and desktop `md` breakpoint to confirm no regression.
