# Reel Popup and Shopping Drawer

## Goal
Restore the earlier floating reel preview on mobile product pages and move the current embedded “Shop the Reel” experience into an easy-to-close drawer.

## Build
- Replace the embedded mobile reel section with the compact floating 9:16 preview used previously.
- Reveal it after the shopper passes the product buying controls, above the sticky buy bar.
- Autoplay the preview muted with the existing poster-first, slow-network fallback, reduced-motion, save-data, and Instagram-browser safeguards.
- Keep minimise/restore, mute, and close behavior clear without covering the sticky buy controls.
- Tapping “Shop the Reel” opens a bottom drawer containing both published reels.
- Reuse the current reel cards and three-product grid in the drawer, including swipe navigation, pause/play, sound, progress, live pricing and stock, Add, and preorder actions.
- Load reel data lazily and stream only the active reel so opening and swiping remain smooth.
- Keep desktop on the existing floating reel experience.

## Verification
- Test at 393 × 626 on a jewellery product page.
- Confirm muted autoplay, minimise/restore, drawer open/close, both reels, swipe behavior, sound and pause controls, product links, Add to Cart, sticky-bar clearance, and no horizontal overflow.
- Confirm a blocked or slow video still shows its cover and the shopping drawer remains usable.
