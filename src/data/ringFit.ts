/**
 * Rings that adjust to fit, so one piece covers a range of US sizes: each has
 * an open back, a small gap between the two ends of the band that can be
 * gently squeezed or eased open. Verified against the live Shopify photography,
 * the supplier's photos and listing copy for every ring in the catalogue —
 * closed bands are omitted here and stay strictly sized. The owner set the
 * range at US 5–8 on 23 Oct 2026; a ring with its own range is in OWN_FIT.
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
  // KAVNAR's sample (WR10914B2) is open between the cluster and the small stone.
  "blush-cluster-ring",
  // An open toi et moi ring; the owner, 24 Oct 2026: one adjustable stock, not US 6, 7 and 8.
  "golden-duet-ring",
  // Aditya, 25 Oct 2026: each marked "Adjustable" on the supplier's photos.
  "asscher-solitaire-ring",
  "cushion-solitaire-ring",
  "pave-zigzag-ring",
  "lumiere-oval-solitaire-ring",
]);

export const isAdjustableRing = (handle?: string): boolean =>
  !!handle && ADJUSTABLE_RING_HANDLES.has(handle);

/** The US sizes an adjustable ring is offered in, every one ready to ship. */
export const ADJUSTABLE_SIZES = ["5", "6", "7", "8"];

/** Adjustable rings with a narrower fit. The owner, 24 Oct 2026: the new 60
    Cushion Halo Rings fit US 5 to 7. */
const OWN_FIT: Record<string, string[]> = {
  "cushion-halo-ring": ["5", "6", "7"],
};

/** The US sizes an adjustable ring fits. */
export const adjustableSizes = (handle?: string): string[] => (handle && OWN_FIT[handle]) || ADJUSTABLE_SIZES;

/** The line under an adjustable ring's sizes. */
export const adjustableFitNote = (handle?: string) => {
  const sizes = adjustableSizes(handle);
  return `Open-back design — adjustable to fit US ${sizes[0]} to ${sizes[sizes.length - 1]} comfortably.`;
};

export const ADJUSTABLE_FIT_NOTE = adjustableFitNote();
