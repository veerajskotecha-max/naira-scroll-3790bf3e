import { describe, expect, it } from "vitest";
import {
  ACCEPTED_PROMO_CODES,
  PROMO_DISCOUNTS,
  addOnEffect,
  ladderHeadline,
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
     codes (BUY2 15%, BUY3 25%, both min-quantity scoped to
     `discount-scope-all`). A rate that is generous here and stingy there
     quotes the shopper a total Fastrr never charges. */
  it("earns 15% on the second piece without the shopper typing anything", () => {
    expect(resolveCartDiscount({ totalItems: 2 })).toEqual({ code: "BUY2", rate: 0.15, automatic: true });
  });

  it("climbs to 25% on the third piece", () => {
    expect(resolveCartDiscount({ totalItems: 3 })).toEqual({ code: "BUY3", rate: 0.25, automatic: true });
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
    expect(r.rate).toBe(0.25);
  });

  /* FRIENDSANDFAMILY is 20%: it BEATS the two-piece rung (15%) and sits under
     the top one (25%). On one or two pieces it outranks the offer rather than
     topping it up, and the third piece takes over from it. Whoever hands that
     code out should know. */
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
    expect(r).toEqual({ code: "BUY3", rate: 0.25, automatic: true });
  });

  it("lets the third piece out-earn the 20% code", () => {
    const r = resolveCartDiscount({ totalItems: 3, promoCode: "FRIENDSANDFAMILY" });
    expect(r).toEqual({ code: "BUY3", rate: 0.25, automatic: true });
  });

  /* A shopper who typed BUY2 into a two-piece bag gets exactly what the bag
     earned. They must see the code they entered, not be told the bag did it
     for them. The charge is identical either way; this is about not confusing
     them. */
  it("keeps the typed code on an exact tie so the shopper sees the one they entered", () => {
    const r = resolveCartDiscount({ totalItems: 2, promoCode: "BUY2" });
    expect(r).toEqual({ code: "BUY2", rate: 0.15, automatic: false });
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
     than, or a shopper who earned 15% would be charged at 10%. */
  it("accepts the welcome code on a bag the ladder does not reach", () => {
    expect(ACCEPTED_PROMO_CODES).toContain("NAIRA10");
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "NAIRA10" })).toEqual({
      code: "NAIRA10",
      rate: 0.1,
      automatic: false,
    });
  });

  /* NAIRA10 is worth less than either rung (10% against 15% and 25%), so the
     second piece already out-earns it and the bag names the rung, not the
     code. */
  it("lets both rungs out-earn the welcome code", () => {
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "NAIRA10" })).toEqual({
      code: "BUY2",
      rate: 0.15,
      automatic: true,
    });
    expect(resolveCartDiscount({ totalItems: 3, promoCode: "NAIRA10" })).toEqual({
      code: "BUY3",
      rate: 0.25,
      automatic: true,
    });
  });
});

describe("discountedSubtotal", () => {
  it("takes 15% off a two-piece bag", () => {
    // 2 x 1199 = 2398, less 15% = 2038.30.
    expect(discountedSubtotal(2398, resolveCartDiscount({ totalItems: 2 }))).toBe(2038);
  });

  /* The four-piece bag was the one driven through the live Fastrr checkout,
     which returned totalDiscount 1779.20 on 8896 when the top rung was 20%,
     the bag's own figure to the rupee. At 25% the same bag is 8896 less
     2224 = 6672. */
  it("takes the top rung off the four-piece bag Fastrr was driven with", () => {
    expect(discountedSubtotal(8896, resolveCartDiscount({ totalItems: 4 }))).toBe(6672);
  });

  it("leaves the subtotal alone when nothing applies", () => {
    expect(discountedSubtotal(1199, resolveCartDiscount({ totalItems: 1 }))).toBe(1199);
  });
});

describe("the offer ladder", () => {
  it("counts down to the next rung, not the first", () => {
    expect(itemsToQuantityOffer(0)).toBe(2);
    expect(itemsToQuantityOffer(1)).toBe(1);
    // Two pieces earned 15%; the bar now points at the 3-piece rung.
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

describe("addOnEffect: what one more piece does to the bag", () => {
  it("adds ₹914 and saves ₹585 when ₹1,499 hoops join a ₹2,399 bracelet", () => {
    // 3,898 at 15% is 3,313, against 2,399 for the bracelet alone.
    expect(addOnEffect({ subtotal: 2399, totalItems: 1 }, 1499)).toEqual({ adds: 914, saves: 585, rate: 0.15 });
  });

  it("counts the third piece's 25% on the whole bag", () => {
    // 2,399 + 1,499 at 15% is 3,313; with a third ₹1,499 at 25% it is 4,048.
    expect(addOnEffect({ subtotal: 3898, totalItems: 2 }, 1499)).toEqual({ adds: 735, saves: 764, rate: 0.25 });
  });

  /* The bag already takes 10% with the code (2,159), so the second piece only
     adds the step from 10% to 15% across the bag, not the full 15%. */
  it("with a 10% code already in hand, counts only the step up to the rung", () => {
    expect(addOnEffect({ subtotal: 2399, totalItems: 1, promoCode: "NAIRA10" }, 1499)).toEqual({ adds: 1154, saves: 345, rate: 0.15 });
  });
});

describe("ladderHeadline: the band over the bag", () => {
  it("names what a second piece does, as the plan's mock-up reads", () => {
    expect(ladderHeadline(1)).toBe("A second piece takes 15% off your bag");
  });

  it("says what the bag has and what a third piece adds", () => {
    expect(ladderHeadline(2, 0.15)).toBe("15% off your bag · a third piece makes it 25%");
  });

  it("stops at the top rung", () => {
    expect(ladderHeadline(3, 0.25)).toBe("25% off your bag, the best price");
    expect(ladderHeadline(5, 0.25)).toBe("25% off your bag, the best price");
  });

  /* A 20% code already beats the 15% rung, so the line skips it and names
     only the rung worth more. */
  it("never offers a saving already in hand from a code", () => {
    expect(ladderHeadline(1, 0.1)).toBe("10% off your bag · a second piece makes it 15%");
    expect(ladderHeadline(1, 0.2)).toBe("20% off your bag · 3 pieces make it 25%");
  });
});

