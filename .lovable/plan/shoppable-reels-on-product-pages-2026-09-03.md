# Shoppable Reels on Product Pages

A floating mini-reel that slides in on product pages after the shopper scrolls past the details, expands into a full-screen swipeable reel gallery with sound, shoppable product tags and Add to cart — plus an admin page to upload more reels.

## What the shopper sees

1. On a jewellery/product page, after scrolling roughly one screen past the product details, a small vertical video card slides up in the bottom corner (bottom-left on desktop, bottom-right above the sticky cart bar on mobile).
2. It tries to play with sound; if the browser blocks it, it plays muted with a "Tap for sound" badge. A close button dismisses it for the rest of the session.
3. Tapping the card opens the full-screen reel viewer: one reel per screen, swipe up/down for the next, tap to pause, mute toggle, progress bar, close.
4. Each reel can carry tagged products shown as small cards over the video with image, name, price and an Add to cart button; tapping the card name opens the product page.

## Keeping the product page light

- The mini-reel is not rendered at all until the scroll trigger fires, and the viewer is code-split (lazy loaded) so its JS never ships in the initial product-page bundle.
- The video element uses `preload="none"` with a poster image until the card actually appears; only one video loads at a time in the viewer (neighbours are unloaded).
- Video files are served from Cloud storage with a generated poster frame; the uploaded 36 MB clip is compressed to a web-sized MP4 (roughly 720x1280, target under 6 MB) before it becomes the seed reel.
- Respects `prefers-reduced-motion` and skips autoplay on save-data connections.
- No layout shift on the product page: the widget is fixed-position and does not affect page flow.

## Admin upload

- New protected route `/admin/reels`, visible only to signed-in users holding an admin role.
- Upload form: video file, optional poster image, caption, and product tagging (search the live catalogue, pick products, set the order they appear).
- List of existing reels with reorder, publish/unpublish and delete.

## Technical notes

- Backend: new `reels` table (video path, poster path, caption, sort order, published flag) and `reel_products` table (reel id, product handle, title, price, image, position). Public read of published reels for `anon`/`authenticated`; insert/update/delete restricted to admins. Grants issued per table.
- Roles: add `app_role` enum, `user_roles` table and a `has_role` security-definer function (none exists yet) so admin checks never live client-side. First admin is granted by migration for the owner account.
- Storage: public `reels` bucket for videos and posters; upload policy limited to admins, read public.
- Frontend: `src/components/reels/ReelPeek.tsx` (floating trigger, IntersectionObserver-based), `src/components/reels/ReelViewer.tsx` (lazy, full-screen swipe gallery), `src/hooks/useReels.ts` (fetch published reels + tags), `src/pages/admin/Reels.tsx`. Mounted in `src/pages/JewelDetail.tsx` and `src/pages/ProductDetail.tsx` only.
- Add to cart reuses the existing CartContext; tracking fires the existing pixel events.
- The uploaded clip is compressed and seeded as the first published reel.
