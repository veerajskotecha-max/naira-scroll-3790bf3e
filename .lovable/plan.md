# Four visual fixes

## 1. White boxes behind the hero look photos
The seven hero strip photos (`src/assets/exhibition/look-1…7.webp`) still carry a baked-in white
rectangle with rough cut edges, so each model sits on a white card over the peach paper wash.

Fix: re-cut all seven with clean transparent alpha (feathered edge, no halo/checkerboard fringe),
re-upload as transparent WebP/PNG, and keep the same import names so no layout changes.
Verification: capture the homepage hero at mobile (393px) and desktop widths and sample the pixels
around each figure to confirm the background is the page wash, not white. Repeat until clean.

## 2. Ring turn should follow the scroll all the way
Right now the ring's rotation timeline ends well before the section leaves the viewport, so the turn
finishes early and the last stretch of scroll shows a static ring.

Fix in `src/components/jewellery/ZirconeTurn.tsx`:
- Retime the ScrollTrigger so the turn starts as the ring enters and completes exactly as the ring
  reaches the top of the viewport (start/end tied to the ring element, not a fixed `+=110%`).
- Keep the current two-sided 3D card (no flicker regression) and keep scrub smoothing.
- Distribute the callouts, scale and finale evenly across the new range so speed feels matched to
  the scroll on both mobile and desktop.
Verification: scripted scroll pass capturing frames at intervals to confirm rotation progresses
smoothly from 0 to a full turn across the section, with no flash frames.

## 3. "The edit" category images
The four category tiles use existing packshots that read flat and inconsistent, and on mobile the
big label overlaps the "N PIECES" badge.

Fix in `src/components/jewellery/JewelleryCategories.tsx`:
- New, cohesive editorial imagery for Rings / Bracelets / Earrings / Necklaces — warm neutral
  styling, soft daylight, consistent tone so the four sit as a set.
- Tidy the overlay: label block and pieces badge stacked so they never collide on small screens.

## 4. `/innercircle` coming-soon page
New route `/innercircle` (plus the same page at `/inner-circle` so both spellings resolve), rendering
a quiet coming-soon page in the brand language: marquee-free, Velista headline, one line of copy, and
an email/WhatsApp capture CTA so the link is usable the moment it is shared.
Added to the router and to the sitemap route list so the published link works and is indexed.

## Technical notes
- Assets go through the Lovable asset CDN pointers, matching existing jewellery assets.
- New page: `src/pages/InnerCircle.tsx`, lazy-loaded in `src/App.tsx`, listed in `scripts/routes.ts`
  so it is prerendered and present in the sitemap.
- Each step is verified with a live-preview screenshot before the task is closed.
