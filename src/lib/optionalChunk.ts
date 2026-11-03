/*
  Code whose failure to load costs nothing: the 3D header flower and gift box
  keep their flat artwork when three.js or their scene fails to arrive. main.tsx
  reloads the page when a chunk fails (a stale build is the usual cause), and
  for these it used to as well — a flaky mobile connection or an ad blocker
  reloaded the page the shopper was reading, for a decoration. vite.config.ts
  names the three.js chunk "three" so this pattern stays true. The wishlist's
  look-up of the jewellery handle list (WishlistDrawer) is the same: without
  it a piece still opens, through /product/<handle>.
*/
const OPTIONAL = /\/assets\/(?:three|scene|jewelleryHandles)-[\w-]+\.js/;

export const isOptionalChunkFailure = (reason: unknown): boolean =>
  OPTIONAL.test(String((reason as Error | undefined)?.message ?? reason ?? ""));
