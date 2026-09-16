# Mobile Shoppable Reel Section

## Goal
Replace the floating PDP reel and the “You may also like” recommendations with a polished, embedded mobile shopping section placed after customer reviews and the press logos, before the footer.

## Build
- Create a mobile-only vertical reel carousel using the existing published reel videos and live product data.
- Show one 9:16 reel at a time with muted autoplay, tap-to-pause, sound control, progress, and clear swipe navigation between reels.
- Keep the experience inside the page—no popup, floating launcher, or full-screen overlay on jewellery PDPs.
- Place three compact shoppable product cards directly beneath each reel, with photo, name, live price/stock state, product link, Add to Cart, and the existing preorder treatment where required.
- Add position indicators and a subtle “Swipe for next reel” cue without obstructing the video.
- Lazy-load video data only as the section approaches the viewport and preload only the adjacent reel for smooth swiping.
- Remove the current five-product “You may also like” section from jewellery PDPs.
- Leave desktop unchanged for this first release: hide the new section on tablet/desktop and retain the current desktop reel behavior until the mobile direction is approved.

## Placement
```text
Customer reviews
Press logos
Shop the Reel — vertical swipe reel + 3 products
Compact trust-led footer
Sticky mobile buy bar
```

## Verification
- Test at 393px mobile width with two reels and three products per reel.
- Confirm swipe, mute, pause, live Add to Cart, product links, preorder state, sticky bar clearance, lazy loading, and no horizontal overflow.
