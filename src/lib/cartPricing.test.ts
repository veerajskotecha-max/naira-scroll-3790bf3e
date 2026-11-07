import { describe, expect, it } from "vitest";
import { discountedCartLines } from "./cartPricing";
import { discountedSubtotal, resolveCartDiscount } from "./promo";

describe("individual bag offer prices", () => {
  const pieces = [{ price: 2399, quantity: 1 }, { price: 1499, quantity: 1 }, { price: 999, quantity: 1 }];

  it("leaves a single piece at its original price without an offer", () => {
    expect(discountedCartLines(pieces.slice(0, 1), resolveCartDiscount({ totalItems: 1 }))).toEqual([{ total: 2399, unit: 2399 }]);
  });

  /* Two pieces earn no rung since 7 Nov 2026 (Buy 2 is gone): each line
     stays at its own price. */
  it("leaves two pieces at their original prices", () => {
    expect(discountedCartLines(pieces.slice(0, 2), resolveCartDiscount({ totalItems: 2 }))).toEqual([
      { total: 2399, unit: 2399 }, { total: 1499, unit: 1499 },
    ]);
  });

  /* A typed NAIRA10 still discounts two pieces: 2,399 and 1,499 at 10% are
     2,159.10 and 1,349.10, and 3,898 at 10% is 3,508.20, so the lines are
     2,159 and 1,349 and add up to the bag's 3,508. */
  it("shows the typed 10% on two pieces", () => {
    expect(discountedCartLines(pieces.slice(0, 2), resolveCartDiscount({ totalItems: 2, promoCode: "NAIRA10" }))).toEqual([
      { total: 2159, unit: 2159 }, { total: 1349, unit: 1349 },
    ]);
  });

  /* 2,399, 1,499 and 999 at 20% are 1,919.20, 1,199.20 and 799.20, floored
     to 3,917; 4,897 at 20% is 3,917.60, so 3,918, and the one rupee left goes
     to the first of the equal fractions. */
  it("lowers every individual price when three pieces earn 20%", () => {
    expect(discountedCartLines(pieces, resolveCartDiscount({ totalItems: 3 }))).toEqual([
      { total: 1920, unit: 1920 }, { total: 1199, unit: 1199 }, { total: 799, unit: 799 },
    ]);
  });

  /* Four pieces take 30% (BUY4, 7 Nov 2026). 1,499 + 2,399 + 1,799 + 1,299 =
     6,996, at 30% 4,897.20, so a 4,897 bag; the lines at 30% are 1,049.30,
     1,679.30, 1,259.30 and 909.30, floored to 4,896 and the one rupee left
     goes to the first of the equal fractions. */
  it("lowers every individual price to 30% when four pieces earn BUY4", () => {
    const four = [1499, 2399, 1799, 1299].map((price) => ({ price, quantity: 1 }));
    const prices = discountedCartLines(four, resolveCartDiscount({ totalItems: 4 }));
    expect(prices).toEqual([
      { total: 1050, unit: 1050 }, { total: 1679, unit: 1679 }, { total: 1259, unit: 1259 }, { total: 909, unit: 909 },
    ]);
    expect(prices.reduce((sum, price) => sum + price.total, 0)).toBe(4897);
  });

  // Independently rounding each ₹999 line would quote ₹2,397 against a ₹2,398 bag.
  it("keeps rounded line prices equal to the goods total", () => {
    const lines = Array.from({ length: 3 }, () => ({ price: 999, quantity: 1 }));
    const discount = resolveCartDiscount({ totalItems: 3 });
    const prices = discountedCartLines(lines, discount);
    expect(prices.map((price) => price.total)).toEqual([800, 799, 799]);
    expect(prices.reduce((sum, price) => sum + price.total, 0)).toBe(discountedSubtotal(2997, discount));
  });

  /* Three of one ₹1,199 piece on one line earn BUY3: 3,597 at 20% is
     2,877.60, so 2,878. (The bag's "each" on such a line is one piece at the
     rung, ₹959, from pieceAtRung, not this share.) Two of it earn nothing. */
  it("counts multiple quantities of one variant toward the offer", () => {
    expect(discountedCartLines([{ price: 1199, quantity: 3 }], resolveCartDiscount({ totalItems: 3 }))).toEqual([{ total: 2878, unit: 2878 / 3 }]);
    expect(discountedCartLines([{ price: 1199, quantity: 2 }], resolveCartDiscount({ totalItems: 2 }))).toEqual([{ total: 2398, unit: 1199 }]);
  });

  it("uses the winning typed offer without stacking discounts", () => {
    expect(discountedCartLines(pieces.slice(0, 1), resolveCartDiscount({ totalItems: 1, promoCode: "FRIENDSANDFAMILY" }))).toEqual([{ total: 1919, unit: 1919 }]);
  });
});