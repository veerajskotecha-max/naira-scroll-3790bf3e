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

  /* Three pieces take 20% (BUY3). 2,399 + 1,499 + 999 = 4,897, at 20%
     3,917.60, so a 3,918 bag; the lines at 20% are 1,919.20, 1,199.20 and
     799.20, floored to 3,917, and the one rupee left goes to the first of
     the equal fractions. */
  it("lowers every individual price again when three pieces earn 20%", () => {
    const prices = discountedCartLines(pieces, resolveCartDiscount({ totalItems: 3 }));
    expect(prices).toEqual([
      { total: 1920, unit: 1920 }, { total: 1199, unit: 1199 }, { total: 799, unit: 799 },
    ]);
    expect(prices.reduce((sum, price) => sum + price.total, 0)).toBe(3918);
  });

  /* Four pieces stay at 20%: Buy 4 is gone (25 Nov 2026) and BUY3 is "3 or
     more". 1,499 + 2,399 + 1,799 + 1,299 = 6,996, at 20% 5,596.80, so a
     5,597 bag; the lines at 20% are 1,199.20, 1,919.20, 1,439.20 and
     1,039.20, floored to 5,596, and the one rupee left goes to the first of
     the equal fractions. */
  it("keeps every individual price at 20% when the bag holds four pieces", () => {
    const four = [1499, 2399, 1799, 1299].map((price) => ({ price, quantity: 1 }));
    const prices = discountedCartLines(four, resolveCartDiscount({ totalItems: 4 }));
    expect(prices).toEqual([
      { total: 1200, unit: 1200 }, { total: 1919, unit: 1919 }, { total: 1439, unit: 1439 }, { total: 1039, unit: 1039 },
    ]);
    expect(prices.reduce((sum, price) => sum + price.total, 0)).toBe(5597);
  });

  // Independently rounding each ₹999 line would quote ₹2,397 against a ₹2,398 bag.
  it("keeps rounded line prices equal to the goods total", () => {
    const lines = Array.from({ length: 3 }, () => ({ price: 999, quantity: 1 }));
    const discount = resolveCartDiscount({ totalItems: 3 });
    const prices = discountedCartLines(lines, discount);
    expect(prices.map((price) => price.total)).toEqual([800, 799, 799]);
    expect(prices.reduce((sum, price) => sum + price.total, 0)).toBe(discountedSubtotal(2997, discount));
  });

  it("counts multiple quantities of one variant toward the offer and shows its per-piece price", () => {
    expect(discountedCartLines([{ price: 1199, quantity: 2 }], resolveCartDiscount({ totalItems: 2 }))).toEqual([{ total: 2158, unit: 1079 }]);
  });

  it("uses the winning typed offer without stacking discounts", () => {
    expect(discountedCartLines(pieces.slice(0, 1), resolveCartDiscount({ totalItems: 1, promoCode: "FRIENDSANDFAMILY" }))).toEqual([{ total: 1919, unit: 1919 }]);
  });
});