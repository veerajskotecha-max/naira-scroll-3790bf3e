/**
 * Rings that adjust to fit, so one piece covers US 5–8: each has an open back,
 * a small gap between the two ends of the band that can be gently squeezed or
 * eased open. Verified against the live Shopify photography and listing copy
 * for every ring in the catalogue — closed bands are omitted here and stay
 * strictly sized. The owner set the range at US 5–8 on 23 Oct 2026.
 */
export const ADJUSTABLE_RING_HANDLES = new Set<string>([
  "rose-verdant-band",
  "granule-dome-ring",
  "verdant-eternity-band",
  "halo-curve-ring",
  "silver-dome-ring",
  "petite-pave-band",
  // Edition Two: "Open at the back, so it adjusts to fit" (and tagged Adjustable).
  "droplet-open-ring",
  // The owner, 23 Oct 2026: a small gap between the ends; it adjusts to fit.
  "cushion-halo-ring",
]);

export const isAdjustableRing = (handle?: string): boolean =>
  !!handle && ADJUSTABLE_RING_HANDLES.has(handle);

/** The US sizes an adjustable ring is offered in, every one ready to ship. */
export const ADJUSTABLE_SIZES = ["5", "6", "7", "8"];

export const ADJUSTABLE_FIT_NOTE =
  "Open-back design — adjustable to fit US 5 to 8 comfortably.";
