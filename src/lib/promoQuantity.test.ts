import { describe, expect, it } from "vitest";
import {
  QUANTITY_OFFER,
  getPromoDiscountRate,
  itemsToQuantityOffer,
  resolveCartDiscount,
} from "./promo";

/**
 * The drawer's total and the total Fastrr charges both come from this
 * resolver. Every case here is a rupee amount a shopper would otherwise see
 * quoted and then not be given.
 */
describe("resolveCartDiscount", () => {
  it("gives nothing for a single piece and no code", () => {
    expect(resolveCartDiscount({ totalItems: 1 })).toEqual({ code: null, rate: 0, automatic: false });
  });

  it("earns BUY2 on the second piece without the shopper typing anything", () => {
    expect(resolveCartDiscount({ totalItems: 2 })).toEqual({
      code: "BUY2",
      rate: 0.1,
      automatic: true,
    });
  });

  it("keeps BUY2 beyond the threshold", () => {
    expect(resolveCartDiscount({ totalItems: 5 }).code).toBe("BUY2");
  });

  it("applies a typed code on a single piece", () => {
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "NAIRA10" })).toEqual({
      code: "NAIRA10",
      rate: 0.1,
      automatic: false,
    });
  });

  /* Shopify order discounts are created with combinesWith.orderDiscounts
     false, so they never stack. Resolving to the larger rate is what Shopify
     itself will do — returning 0.2 here, not 0.3. */
  it("never stacks: the better single discount wins", () => {
    const resolved = resolveCartDiscount({ totalItems: 3, promoCode: "FRIENDSANDFAMILY" });
    expect(resolved).toEqual({ code: "FRIENDSANDFAMILY", rate: 0.2, automatic: false });
    expect(resolved.rate).toBeLessThan(0.2 + QUANTITY_OFFER.rate);
  });

  it("keeps the typed code on an exact tie so the shopper sees the one they entered", () => {
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "NAIRA10" })).toEqual({
      code: "NAIRA10",
      rate: 0.1,
      automatic: false,
    });
  });

  it("falls back to the earned offer when the typed code is junk", () => {
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "NOTACODE" }).code).toBe("BUY2");
  });

  it("ignores a junk code on a single piece rather than inventing a discount", () => {
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "NOTACODE" })).toEqual({
      code: null,
      rate: 0,
      automatic: false,
    });
  });

  it("tolerates the messy casing and punctuation mobile autofill produces", () => {
    expect(resolveCartDiscount({ totalItems: 1, promoCode: " naira-10 " }).code).toBe("NAIRA10");
  });

  it("treats an empty bag as no discount", () => {
    expect(resolveCartDiscount({ totalItems: 0 }).rate).toBe(0);
  });
});

describe("itemsToQuantityOffer", () => {
  it("counts down to the offer", () => {
    expect(itemsToQuantityOffer(0)).toBe(2);
    expect(itemsToQuantityOffer(1)).toBe(1);
  });

  it("is zero once earned", () => {
    expect(itemsToQuantityOffer(2)).toBe(0);
    expect(itemsToQuantityOffer(7)).toBe(0);
  });
});

/* BUY2 must be a real code the checkout will accept, not a display-only label:
   it is sent to Fastrr as couponCode and to Shopify as ?discount=. */
describe("BUY2 as a code", () => {
  it("carries the same rate the resolver hands the drawer", () => {
    expect(getPromoDiscountRate(QUANTITY_OFFER.code)).toBe(QUANTITY_OFFER.rate);
  });
});
