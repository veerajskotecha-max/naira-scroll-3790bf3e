import { discountedSubtotal, resolveCartDiscount } from "@/lib/promo";
import type { JewelPiece, JewelVariant } from "@/data/jewellery";

/* One piece of a set as it will go in the bag: the variant the bag line
   carries and that variant's price, so the card shows and prices exactly
   what is added. */
export type SetOption = { piece: JewelPiece; variant?: JewelVariant; price: number };

export type SetTier<T extends { price: number } = SetOption> = {
  extras: T[];
  /** This piece and the extras at their own prices. */
  full: number;
  /** What the bag charges for them together. */
  total: number;
  rate: number;
};

/* The sets the product page offers: this piece alone, then with one and two
   of its pairings. Each set is priced as the bag prices those pieces
   together, through promo.ts's resolver and rounding (a typed code included,
   as the bag takes the richer of the two), so a card never quotes a total the
   checkout will not charge. */
export const setTiers = <T extends { price: number }>(
  price: number,
  pairings: T[],
  promoCode?: string | null,
  max = 2,
): SetTier<T>[] => {
  const tiers: SetTier<T>[] = [];
  for (let n = 0; n <= Math.min(max, pairings.length); n++) {
    const extras = pairings.slice(0, n);
    const full = price + extras.reduce((sum, p) => sum + p.price, 0);
    const resolved = resolveCartDiscount({ totalItems: n + 1, promoCode });
    tiers.push({ extras, full, total: discountedSubtotal(full, resolved), rate: resolved.rate });
  }
  return tiers;
};
