import { describe, expect, it } from "vitest";
import {
  ACCEPTED_PROMO_CODES,
  PROMO_DISCOUNTS,
  QUANTITY_OFFERS,
  TOP_QUANTITY_OFFER,
  discountedSubtotal,
  earnedQuantityOffer,
  itemsToQuantityOffer,
  nextQuantityOffer,
  quantityOfferProgress,
  resolveCartDiscount,
} from "./promo";

/**
 * The bag's total and the total Fastrr charges both come from this resolver.
 * Every case here is a rupee amount a shopper would otherwise see quoted and
 * then not be given.
 */
describe("resolveCartDiscount", () => {
  it("gives nothing for a single piece and no code", () => {
    expect(resolveCartDiscount({ totalItems: 1 })).toEqual({ code: null, rate: 0, automatic: false });
  });

  /* These two rates are not free to drift: they must match the live Shopify
     codes (BUY2 20%, BUY3 30%, both min-quantity scoped to
     `discount-scope-all`). A rate that is generous here and stingy there
     quotes the shopper a total Fastrr never charges. */
  it("earns 10% on the second piece without the shopper typing anything", () => {
    expect(resolveCartDiscount({ totalItems: 2 })).toEqual({ code: "BUY2", rate: 0.1, automatic: true });
  });

  it("climbs to 20% on the third piece", () => {
    expect(resolveCartDiscount({ totalItems: 3 })).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
  });

  it("keeps the top rung beyond its threshold", () => {
    expect(resolveCartDiscount({ totalItems: 9 }).code).toBe("BUY3");
  });

  /* Only ONE code can reach Fastrr — comma-joining two was tested live and made
     it apply neither — so the resolver must return exactly one, never a pair. */
  it("returns a single code, never a combination", () => {
    const r = resolveCartDiscount({ totalItems: 3, promoCode: "FRIENDSANDFAMILY" });
    expect(typeof r.code).toBe("string");
    expect(r.code).not.toContain(",");
    expect(r.rate).toBe(0.2);
  });

  /* FRIENDSANDFAMILY is 20%, which now MATCHES the top rung and BEATS the
     two-piece one, so it is worth the whole ladder on a single piece. Whoever
     hands that code out should know it outranks the offer rather than topping
     it up. */
  it("lets the 20% code out-earn the two-piece rung", () => {
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "FRIENDSANDFAMILY" })).toEqual({
      code: "FRIENDSANDFAMILY",
      rate: 0.2,
      automatic: false,
    });
  });

  /* The rungs must stay ordered: a 2-piece rung that silently outranked the
     3-piece one would undercharge every full bag. */
  it("keeps the 2-piece rung below the 3-piece rung", () => {
    expect(resolveCartDiscount({ totalItems: 2 }).rate).toBeLessThan(
      resolveCartDiscount({ totalItems: 3 }).rate,
    );
  });

  it("keeps the earned rung when it beats the typed code", () => {
    const r = resolveCartDiscount({ totalItems: 3, promoCode: "BUY2" });
    expect(r).toEqual({ code: "BUY3", rate: 0.2, automatic: true });
  });

  /* Three pieces and FRIENDSANDFAMILY are both 20% — the shopper who typed one
     must see the code they entered, not be told the bag did it for them. The
     charge is identical either way; this is about not confusing them. */
  it("keeps the typed code on an exact tie so the shopper sees the one they entered", () => {
    const r = resolveCartDiscount({ totalItems: 3, promoCode: "FRIENDSANDFAMILY" });
    expect(r).toEqual({ code: "FRIENDSANDFAMILY", rate: 0.2, automatic: false });
  });

  it("falls back to the earned rung when the typed code is junk", () => {
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "NOTACODE" }).code).toBe("BUY2");
  });

  it("ignores a junk code on a single piece rather than inventing a discount", () => {
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "NOTACODE" }).rate).toBe(0);
  });

  it("tolerates the messy casing and punctuation mobile autofill produces", () => {
    expect(resolveCartDiscount({ totalItems: 1, promoCode: " friends-and-family " }).code).toBe(
      "FRIENDSANDFAMILY"
    );
  });

  it("treats an empty bag as no discount", () => {
    expect(resolveCartDiscount({ totalItems: 0 }).rate).toBe(0);
  });

  /* NAIRA10 is live again (10%, all customers, no minimum). It must be
     ACCEPTED on a single-piece bag — that is two thirds of orders and the
     ladder gives them nothing — but it must never beat a rung it is worth less
     than, or the bag would quote 10% while the checkout applied 20%. */
  it("accepts the welcome code on a bag the ladder does not reach", () => {
    expect(ACCEPTED_PROMO_CODES).toContain("NAIRA10");
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "NAIRA10" })).toEqual({
      code: "NAIRA10",
      rate: 0.1,
      automatic: false,
    });
  });

  /* NAIRA10 and the two-piece rung are both 10% now, so a two-piece bag
     holding the code names NAIRA10 rather than BUY2 — a tie goes to what the
     shopper typed. The charge is the same either way, which is what matters.
     The third piece still out-earns it and takes over. */
  it("ties the welcome code at two pieces and out-earns it at three", () => {
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "NAIRA10" })).toEqual({
      code: "NAIRA10",
      rate: 0.1,
      automatic: false,
    });
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "NAIRA10" })).toEqual({
      code: "BUY3",
      rate: 0.2,
      automatic: true,
    });
  });
});

describe("discountedSubtotal", () => {
  it("takes 10% off a two-piece bag", () => {
    // 2 x 1199 = 2398, less 10% = 2158.20.
    expect(discountedSubtotal(2398, resolveCartDiscount({ totalItems: 2 }))).toBe(2158);
  });

  /* The four-piece bag was the one driven through the live Fastrr checkout,
     which returned totalDiscount 1779.20 on 8896 back when the top rung was
     20%. The bag agreed with the checkout then, and the top rung is 20% once
     more, so this is again the exact figure Fastrr returned. */
  it("takes the top rung off the four-piece bag Fastrr was driven with", () => {
    expect(discountedSubtotal(8896, resolveCartDiscount({ totalItems: 4 }))).toBe(7117);
  });

  it("leaves the subtotal alone when nothing applies", () => {
    expect(discountedSubtotal(1199, resolveCartDiscount({ totalItems: 1 }))).toBe(1199);
  });
});

describe("the offer ladder", () => {
  it("counts down to the next rung, not the first", () => {
    expect(itemsToQuantityOffer(0)).toBe(2);
    expect(itemsToQuantityOffer(1)).toBe(1);
    // Two pieces earned 10%; the bar now points at the 3-piece rung.
    expect(itemsToQuantityOffer(2)).toBe(1);
  });

  it("is zero once the ladder is topped out", () => {
    expect(itemsToQuantityOffer(3)).toBe(0);
    expect(itemsToQuantityOffer(7)).toBe(0);
  });

  it("names the rung earned and the rung ahead", () => {
    expect(earnedQuantityOffer(1)).toBeNull();
    expect(nextQuantityOffer(1)?.code).toBe("BUY2");
    expect(earnedQuantityOffer(2)?.code).toBe("BUY2");
    expect(nextQuantityOffer(2)?.code).toBe("BUY3");
    expect(earnedQuantityOffer(3)?.code).toBe("BUY3");
    expect(nextQuantityOffer(3)).toBeNull();
  });

  /* Measured across the whole ladder so the bar never snaps backwards when a
     rung is cleared. */
  it("fills monotonically and caps at full", () => {
    const steps = [0, 1, 2, 3, 4].map(quantityOfferProgress);
    expect(steps).toEqual([0, 1 / 3, 2 / 3, 1, 1]);
    steps.forEach((v, i) => i && expect(v).toBeGreaterThanOrEqual(steps[i - 1]));
  });

  it("orders the rungs by rising threshold and rising reward", () => {
    for (let i = 1; i < QUANTITY_OFFERS.length; i += 1) {
      expect(QUANTITY_OFFERS[i].minQuantity).toBeGreaterThan(QUANTITY_OFFERS[i - 1].minQuantity);
      expect(QUANTITY_OFFERS[i].rate).toBeGreaterThan(QUANTITY_OFFERS[i - 1].rate);
    }
    expect(TOP_QUANTITY_OFFER.code).toBe("BUY3");
  });

  /* Every rung must be a real Shopify code at the same rate, or the bag quotes
     a discount the checkout will not give. */
  it("has every rung in the discount table at the same rate", () => {
    for (const offer of QUANTITY_OFFERS) {
      expect(PROMO_DISCOUNTS[offer.code]).toBe(offer.rate);
    }
  });
});
