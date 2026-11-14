import { discountedSubtotal, resolveCartDiscount } from "@/lib/promo";
import type { JewelPiece } from "@/data/jewellery";

/* The product page's sets (components/jewellery/PdpSetPicker): this piece,
   then with one, then two of the pieces that go with it, each priced the way
   the bag prices those pieces together: one rung for the whole set, by
   promo.ts's resolver and rounding. */
export type SetTier = {
  /** The pieces this tier adds beside the one on the page. */
  extras: JewelPiece[];
  /** What the bag charges for the whole set, after its rung. */
  total: number;
  /** The set at full price. */
  full: number;
  rate: number;
};

/** The set prices, read the way the bag reads them: one rung for the whole set. */
export const setTiers = (price: number, pairings: JewelPiece[], max = 2): SetTier[] => {
  const tiers: SetTier[] = [];
  for (let n = 0; n <= Math.min(max, pairings.length); n++) {
    const extras = pairings.slice(0, n);
    const full = price + extras.reduce((sum, p) => sum + p.price, 0);
    const resolved = resolveCartDiscount({ totalItems: n + 1 });
    tiers.push({ extras, full, total: discountedSubtotal(full, resolved), rate: resolved.rate });
  }
  return tiers;
};

