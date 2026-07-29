## Problem

On mobile, the ring section (`src/components/jewellery/ZirconeTurn.tsx`) has two issues during the pinned scroll:

1. The callouts are absolutely positioned relative to the ring at `left/right: -46%`. With a ~190px ring on a 394px screen, the "BRILLIANT-CUT ZIRCONE" label runs past the right viewport edge and gets clipped, and the header line above the ring scrolls out of the pinned frame.
2. Label text at 10px is too small to read comfortably.

## Plan

### 1. Mobile callout layout — stack instead of side-arms
Below the `md` breakpoint, stop hanging the labels off the left/right of the ring. Instead:
- Keep the pointer dot + short connector line anchored to the band and the stone as they are now.
- Place the label itself in a fixed-width, viewport-safe position (left label pinned near the left gutter, right label near the right gutter, both within `px-4` of the section), with the connector line stretching from the label to the dot.
- This guarantees no horizontal clipping at 360-430px widths.

Desktop layout stays exactly as it is.

### 2. Keep the header visible while pinned
The "THE ZIRCONE EDIT · DEMI-GOLD" line stays inside the pinned frame at all times: keep it in the pinned flex column with fixed top padding clearing the navbar, and never animate its opacity. Confirm on a 394px viewport that it stays on screen for the full scrub.

### 3. Readable type on mobile
- Callout labels: 10px → 12px, tracking loosened slightly, padding bumped so the chips stay balanced.
- Finale sub-line ("18K Gold Finished · brilliant-cut zircone · 4-prong"): 12px → 13px.
- "SCROLL — IT TURNS" hint: 9px → 10px.

### 4. Smooth scrub on mobile
- Keep the pinned flip animation intact — no change to the timeline structure.
- Verify the pinned element height fits within a mobile viewport (including browser chrome) so the pin never jumps; if the taller type pushes it over, reduce ring width slightly rather than cutting animation.
- Keep `scrub: 1` and `anticipatePin: 1`, add `fastScrollEnd` so flicky flick-scrolls settle cleanly.

### 5. Verify
Screenshot the section at 394px at several scroll offsets (start, mid-flip, callout hold, finale) and confirm: header visible, both labels fully on screen, dots landing on band and stone, no layout jump at pin start/end. Same check on the `/jewellery` page since it uses the same component.

## Technical notes

Single file: `src/components/jewellery/ZirconeTurn.tsx`. No animation-timeline rewrite — only positioning, sizing, and ScrollTrigger config touches.
