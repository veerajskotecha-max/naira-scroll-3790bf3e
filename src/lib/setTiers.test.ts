import { describe, it, expect } from "vitest";
import { setTiers } from "./setTiers";
import { discountedSubtotal, resolveCartDiscount } from "./promo";
import type { JewelPiece } from "@/data/jewellery";

const piece = (handle: string, price: number) => ({ handle, price }) as unknown as JewelPiece;

/* The set's price is the bag's price for those pieces together. A card that
   rounded per piece, or took the rung from the pieces already in the bag,
   would quote a total the checkout does not charge. */
describe("set tiers", () => {
  it("prices each set as the bag does: one rung for the whole set", () => {
    const tiers = setTiers(2399, [piece("cushion-halo-ring", 999), piece("prism-pear-drop-necklace", 999)]);
    expect(tiers).toHaveLength(3);
    expect(tiers[0]).toMatchObject({ full: 2399, total: 2399, rate: 0 });
    expect(tiers[1]).toMatchObject({ full: 3398, total: 3058, rate: 0.1 });
    expect(tiers[2]).toMatchObject({ full: 4397, total: 3518, rate: 0.2 });
    for (const [i, t] of tiers.entries()) {
      expect(t.total).toBe(discountedSubtotal(t.full, resolveCartDiscount({ totalItems: i + 1 })));
    }
  });

  it("offers only the sets the pairings can make", () => {
    expect(setTiers(999, [])).toHaveLength(1);
    expect(setTiers(999, [piece("a", 500)])).toHaveLength(2);
    expect(setTiers(999, [piece("a", 500), piece("b", 500), piece("c", 500)])).toHaveLength(3);
  });
});
