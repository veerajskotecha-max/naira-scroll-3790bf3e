/**
 * Rings that adjust to fit, so one piece covers a range of US sizes. Most have
 * an open-back shank that can be gently squeezed or eased open to fit roughly
 * US 6–8. Verified against the live Shopify photography and listing copy for
 * every ring in the catalogue — closed bands are omitted here and stay strictly
 * sized, unless the owner says otherwise (see OWN_FIT).
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
  // The owner, 23 Oct 2026: it adjusts to fit US 5 to 8.
  "cushion-halo-ring",
]);

export const isAdjustableRing = (handle?: string): boolean =>
  !!handle && ADJUSTABLE_RING_HANDLES.has(handle);

export const ADJUSTABLE_FIT_NOTE =
  "Open-back design — adjustable to fit US 6 to 8 comfortably.";

/**
 * Adjustable rings whose fit is not the open-back US 6 to 8: the US sizes the
 * product page offers, and the line under them. Cushion Halo Ring's photos
 * show a closed band, so its line does not say open back.
 */
const OWN_FIT: Record<string, { sizes: string[]; note: string }> = {
  "cushion-halo-ring": { sizes: ["5", "6", "7", "8"], note: "Adjustable — fits US 5 to 8 comfortably." },
};

export const ownFit = (handle?: string) => (handle ? OWN_FIT[handle] : undefined);

export const adjustableFitNote = (handle?: string) => ownFit(handle)?.note ?? ADJUSTABLE_FIT_NOTE;
