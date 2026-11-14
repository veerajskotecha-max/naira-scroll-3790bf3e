import { describe, it, expect } from "vitest";
import { setTiers } from "./setTiers";
import { discountedSubtotal, resolveCartDiscount } from "./promo";

const option = (price: number) => ({ price });

/* The set's price is the bag's price for those pieces together. A card that
   rounded per piece, or took the rung from the pieces already in the bag,
   would quote a total the checkout does not charge. */
describe("set tiers", () => {
  it("prices each set as the bag does: one rung for the whole set", () => {
    const tiers = setTiers(2399, [option(999), option(999)]);
    expect(tiers).toHaveLength(3);
    expect(tiers[0]).toMatchObject({ full: 2399, total: 2399, rate: 0 });
    expect(tiers[1]).toMatchObject({ full: 3398, total: 3058, rate: 0.1 });
    expect(tiers[2]).toMatchObject({ full: 4397, total: 3518, rate: 0.2 });
    for (const [i, t] of tiers.entries()) {
      expect(t.total).toBe(discountedSubtotal(t.full, resolveCartDiscount({ totalItems: i + 1 })));
    }
  });

  /* The card prices the variant that goes in the bag, not the piece's
     headline price: the two can differ (a size 9 ring, a silver finish). */
  it("prices each extra at its own option price", () => {
    const [, two] = setTiers(1000, [option(1299)]);
    expect(two).toMatchObject({ full: 2299, total: discountedSubtotal(2299, resolveCartDiscount({ totalItems: 2 })) });
  });

  /* With FRIENDSANDFAMILY typed, the bag charges 20% on two pieces; the card
     said 10% and quoted more than the shopper pays. */
  it("takes a typed code into the price, as the bag does", () => {
    const [, two] = setTiers(2399, [option(999)], "FRIENDSANDFAMILY");
    const bag = resolveCartDiscount({ totalItems: 2, promoCode: "FRIENDSANDFAMILY" });
    expect(two.rate).toBe(bag.rate);
    expect(two.total).toBe(discountedSubtotal(3398, bag));
  });

  it("offers only the sets the pairings can make", () => {
    expect(setTiers(999, [])).toHaveLength(1);
    expect(setTiers(999, [option(500)])).toHaveLength(2);
    expect(setTiers(999, [option(500), option(500), option(500)])).toHaveLength(3);
  });
});
