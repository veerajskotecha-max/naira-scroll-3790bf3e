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

  it("lowers every individual price again when three pieces earn 20%", () => {
    expect(discountedCartLines(pieces, resolveCartDiscount({ totalItems: 3 }))).toEqual([
      { total: 1920, unit: 1920 }, { total: 1199, unit: 1199 }, { total: 799, unit: 799 },
    ]);
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