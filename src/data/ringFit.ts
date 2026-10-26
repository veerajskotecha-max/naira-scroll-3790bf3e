/**
 * Rings that adjust to fit, so one piece covers a range of US sizes: each has
 * an open back, a small gap between the two ends of the band that can be
 * gently squeezed or eased open. Closed bands stay strictly sized.
 *
 * Shopify decides: a ring tagged "Adjustable" is adjustable, so a new listing
 * needs no code change (Asscher Solitaire, Lumière Oval Solitaire and Pavé
 * Zigzag were tagged but missing from this list, and their pages sold US 5
 * and 7 as pre-orders). The list below keeps the first paint, drawn from the
 * bundled snapshot, in agreement before live data arrives.
 *
 * Every adjustable ring fits US 5 to 9 (the owner, 25 Oct 2026; it was 5 to
 * 8, and Cushion Halo 5 to 7). One stock per ring: the size rides on the
 * order as a note, not as a variant.
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
  // Aditya's open rings, tagged Adjustable in Shopify.
  "asscher-solitaire-ring",
  "lumiere-oval-solitaire-ring",
  "pave-zigzag-ring",
  "cushion-solitaire-ring",
]);

/** A handle, or a piece whose Shopify tags can say it adjusts. */
type Ring = string | { handle: string; tags?: string[] };

export const isAdjustableRing = (ring?: Ring): boolean => {
  if (!ring) return false;
  if (typeof ring === "string") return ADJUSTABLE_RING_HANDLES.has(ring);
  return ADJUSTABLE_RING_HANDLES.has(ring.handle) || (ring.tags ?? []).some((tag) => tag.trim().toLowerCase() === "adjustable");
};

/** The US sizes an adjustable ring is offered in, every one ready to ship. */
export const ADJUSTABLE_SIZES = ["5", "6", "7", "8", "9"];

/** Adjustable rings with a narrower fit, by handle. None at present: the
    owner set every adjustable ring to US 5 to 9 on 25 Oct 2026. */
const OWN_FIT: Record<string, string[]> = {};

/** The US sizes an adjustable ring fits. */
export const adjustableSizes = (handle?: string): string[] => (handle && OWN_FIT[handle]) || ADJUSTABLE_SIZES;

/** The line under an adjustable ring's sizes. */
export const adjustableFitNote = (handle?: string) => {
  const sizes = adjustableSizes(handle);
  return `Open-back design — adjustable to fit US ${sizes[0]} to ${sizes[sizes.length - 1]} comfortably.`;
};

export const ADJUSTABLE_FIT_NOTE = adjustableFitNote();
