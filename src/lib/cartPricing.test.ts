import { describe, expect, it } from "vitest";
import { discountedCartLines } from "./cartPricing";
import { discountedSubtotal, resolveCartDiscount } from "./promo";

describe("individual bag offer prices", () => {
  const pieces = [{ price: 2399, quantity: 1 }, { price: 1499, quantity: 1 }, { price: 999, quantity: 1 }];

  it("leaves a single piece at its original price without an offer", () => {
    expect(discountedCartLines(pieces.slice(0, 1), resolveCartDiscount({ totalItems: 1 }))).toEqual([{ total: 2399, unit: 2399 }]);
  });

  it("shows discounted individual prices when two pieces earn 10%", () => {
    expect(discountedCartLines(pieces.slice(0, 2), resolveCartDiscount({ totalItems: 2 }))).toEqual([
      { total: 2159, unit: 2159 }, { total: 1349, unit: 1349 },
    ]);
  });

  /* Three pieces take 15% (BUY3, since 25 Nov 2026). 2,399 + 1,499 + 999 =
     4,897, at 15% 4,162.45, so a 4,162 bag; the lines at 15% are 2,039.15,
     1,274.15 and 849.15, which floor to exactly that. */
  it("lowers every individual price again when three pieces earn 15%", () => {
    const prices = discountedCartLines(pieces, resolveCartDiscount({ totalItems: 3 }));
    expect(prices).toEqual([
      { total: 2039, unit: 2039 }, { total: 1274, unit: 1274 }, { total: 849, unit: 849 },
    ]);
    expect(prices.reduce((sum, price) => sum + price.total, 0)).toBe(4162);
  });

  /* Four pieces stay at 15%: Buy 4 is gone and BUY3 is "3 or more". 1,499 +
     2,399 + 1,799 + 1,299 = 6,996, at 15% 5,946.60, so a 5,947 bag; the
     lines at 15% are 1,274.15, 2,039.15, 1,529.15 and 1,104.15, floored to
     5,946, and the one rupee left goes to the first of the equal fractions. */
  it("keeps every individual price at 15% when the bag holds four pieces", () => {
    const four = [1499, 2399, 1799, 1299].map((price) => ({ price, quantity: 1 }));
    const prices = discountedCartLines(four, resolveCartDiscount({ totalItems: 4 }));
    expect(prices).toEqual([
      { total: 1275, unit: 1275 }, { total: 2039, unit: 2039 }, { total: 1529, unit: 1529 }, { total: 1104, unit: 1104 },
    ]);
    expect(prices.reduce((sum, price) => sum + price.total, 0)).toBe(5947);
  });

  // Independently rounding each ₹999 line (849.15) would quote ₹3,396 against a ₹3,397 bag (3,396.60).
  it("keeps rounded line prices equal to the goods total", () => {
    const lines = Array.from({ length: 4 }, () => ({ price: 999, quantity: 1 }));
    const discount = resolveCartDiscount({ totalItems: 4 });
    const prices = discountedCartLines(lines, discount);
    expect(prices.map((price) => price.total)).toEqual([850, 849, 849, 849]);
    expect(prices.reduce((sum, price) => sum + price.total, 0)).toBe(discountedSubtotal(3996, discount));
    expect(discountedSubtotal(3996, discount)).toBe(3397);
  });

  it("counts multiple quantities of one variant toward the offer and shows its per-piece price", () => {
    expect(discountedCartLines([{ price: 1199, quantity: 2 }], resolveCartDiscount({ totalItems: 2 }))).toEqual([{ total: 2158, unit: 1079 }]);
  });

  it("uses the winning typed offer without stacking discounts", () => {
    expect(discountedCartLines(pieces.slice(0, 1), resolveCartDiscount({ totalItems: 1, promoCode: "FRIENDSANDFAMILY" }))).toEqual([{ total: 1919, unit: 1919 }]);
  });
});