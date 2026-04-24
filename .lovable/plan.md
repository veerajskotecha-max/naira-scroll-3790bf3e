## Plan: Fix Empty Space Below Product Gallery

The desktop product gallery currently uses `sticky top-[120px]` with a fixed `height: calc(100vh - 120px)`, so once the right info panel is taller than the viewport, the left gallery stops short and leaves a white gap below.

The fix: let the gallery stretch to match the right column's natural height, while keeping the images filling the full vertical space.

### Edit `src/pages/ProductDetail.tsx`

- On the desktop grid wrapper, change `lg:items-start` → `lg:items-stretch` so both columns share the same height.
- Ensure the gallery wrapper `<div className="hidden md:block">` becomes `hidden md:block h-full` so it expands to the grid row height.

### Edit `src/components/product/ProductGallery.tsx` (desktop branch only)

Replace the current sticky/fixed-height container with a full-height flex container:

- Outer wrapper: `relative w-full h-full min-h-full` (remove `sticky top-[120px]` and `height: calc(100vh - 120px)`).
- Inner grid: keep `grid grid-cols-2 gap-[4px] h-full`.
- Each image cell: `overflow-hidden relative h-full min-h-full`.
- Each `<img>`: keep `w-full h-full object-cover` (already set) so images stretch to fill without distortion.

### Result

The two product images on the left will always extend to the exact height of the right-side info panel — no empty white space below the gallery. Mobile carousel behavior is unchanged.

### Files
- **Edit**: `src/pages/ProductDetail.tsx`
- **Edit**: `src/components/product/ProductGallery.tsx`
