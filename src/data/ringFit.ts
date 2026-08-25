/**
 * Rings with an open-back shank can be gently squeezed or eased open, so one
 * piece covers roughly US 6–8. Verified against the live Shopify photography
 * and listing copy for every ring in the catalogue — closed bands are omitted
 * here and stay strictly sized.
 */
export const ADJUSTABLE_RING_HANDLES = new Set<string>([
  "rose-verdant-band",
  "granule-dome-ring",
  "verdant-eternity-band",
  "halo-curve-ring",
  "silver-dome-ring",
  "petite-pave-band",
]);

export const isAdjustableRing = (handle?: string): boolean =>
  !!handle && ADJUSTABLE_RING_HANDLES.has(handle);

export const ADJUSTABLE_FIT_NOTE =
  "Open-back design — adjustable to fit US 6 to 8 comfortably.";
