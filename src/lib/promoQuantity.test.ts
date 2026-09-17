import { describe, expect, it } from "vitest";
import {
  PROMO_CATALOGUE,
  QUANTITY_OFFER,
  discountedSubtotal,
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
    const r = resolveCartDiscount({ totalItems: 1 });
    expect(r.codes).toEqual([]);
    expect(r.rate).toBe(0);
  });

  it("earns BUY2 on the second piece without the shopper typing anything", () => {
    const r = resolveCartDiscount({ totalItems: 2 });
    expect(r.codes).toEqual(["BUY2"]);
    expect(r.lines[0].automatic).toBe(true);
    expect(r.productRate).toBe(0.1);
    expect(r.orderRate).toBe(0);
  });

  /* BUY2 is a PRODUCT discount and NAIRA10 an ORDER discount, and each is
     configured in Shopify to combine with the other's class — so both apply. */
  it("stacks the earned product offer with an order code", () => {
    const r = resolveCartDiscount({ totalItems: 2, promoCode: "NAIRA10" });
    expect(r.codes.sort()).toEqual(["BUY2", "NAIRA10"]);
    expect(r.productRate).toBe(0.1);
    expect(r.orderRate).toBe(0.1);
  });

  /* Shopify takes the product discount off the lines, THEN the order discount
     off what remains. Adding the two would overstate every stacked bag. */
  it("compounds rather than adds: 10 and 10 is 19 percent, not 20", () => {
    const r = resolveCartDiscount({ totalItems: 2, promoCode: "NAIRA10" });
    expect(r.stackedRate).toBeCloseTo(0.19, 10);
    expect(r.stackedRate).not.toBeCloseTo(0.2, 4);
  });

  /* Fastrr carries ONE coupon: comma-joining two was tested live and made it
     apply neither. So `rate` — the number the bag deducts — must never be the
     stacked figure, however much Shopify would allow. */
  it("only counts the single code the checkout can actually carry", () => {
    const r = resolveCartDiscount({ totalItems: 2, promoCode: "NAIRA10" });
    expect(r.rate).toBe(0.1);
    expect(r.rate).toBeLessThan(r.stackedRate);
    expect(r.passedCode).toBeTruthy();
    expect(r.stackableCode).toBeTruthy();
    expect(r.passedCode).not.toBe(r.stackableCode);
  });

  /* FRIENDSANDFAMILY is also a PRODUCT discount, so it and BUY2 compete for
     the same slot — Shopify will never apply both. */
  it("never doubles up within a class: the better product discount wins alone", () => {
    const r = resolveCartDiscount({ totalItems: 3, promoCode: "FRIENDSANDFAMILY" });
    expect(r.codes).toEqual(["FRIENDSANDFAMILY"]);
    expect(r.productRate).toBe(0.2);
    expect(r.rate).toBeCloseTo(0.2, 10);
  });

  it("keeps the typed code on an exact tie so the shopper sees the one they entered", () => {
    const r = resolveCartDiscount({ totalItems: 2, promoCode: "BUY2" });
    expect(r.codes).toEqual(["BUY2"]);
  });

  it("applies a typed order code on a single piece, with no product discount", () => {
    const r = resolveCartDiscount({ totalItems: 1, promoCode: "NAIRA10" });
    expect(r.codes).toEqual(["NAIRA10"]);
    expect(r.productRate).toBe(0);
    expect(r.orderRate).toBe(0.1);
  });

  it("falls back to the earned offer when the typed code is junk", () => {
    expect(resolveCartDiscount({ totalItems: 2, promoCode: "NOTACODE" }).codes).toEqual(["BUY2"]);
  });

  it("ignores a junk code on a single piece rather than inventing a discount", () => {
    expect(resolveCartDiscount({ totalItems: 1, promoCode: "NOTACODE" }).rate).toBe(0);
  });

  it("tolerates the messy casing and punctuation mobile autofill produces", () => {
    expect(resolveCartDiscount({ totalItems: 1, promoCode: " naira-10 " }).codes).toEqual(["NAIRA10"]);
  });

  it("treats an empty bag as no discount", () => {
    expect(resolveCartDiscount({ totalItems: 0 }).rate).toBe(0);
  });
});

describe("discountedSubtotal", () => {
  it("matches what Fastrr charged on the verified two-piece bag", () => {
    // 2 x Cushion Halo Ring at 1199 -> Fastrr returned totalDiscount 239.80.
    const r = resolveCartDiscount({ totalItems: 2 });
    expect(discountedSubtotal(2398, r)).toBe(2158);
  });

  it("deducts only the carried code, never the stacked ceiling", () => {
    const r = resolveCartDiscount({ totalItems: 2, promoCode: "NAIRA10" });
    // Quoting the 19% stack here would promise 1,942 and charge 2,158.
    expect(discountedSubtotal(2398, r)).toBe(2158);
  });

  it("leaves the subtotal alone when nothing applies", () => {
    expect(discountedSubtotal(1199, resolveCartDiscount({ totalItems: 1 }))).toBe(1199);
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

/* The catalogue must mirror Shopify. A class that drifts silently changes what
   stacks; a rate that drifts makes the bag quote a total nobody is charged. */
describe("PROMO_CATALOGUE mirrors Shopify", () => {
  it("has BUY2 as a product discount so it can stack on an order code", () => {
    expect(PROMO_CATALOGUE.BUY2).toEqual({ rate: QUANTITY_OFFER.rate, klass: "product" });
  });

  it("has NAIRA10 as an order discount", () => {
    expect(PROMO_CATALOGUE.NAIRA10).toEqual({ rate: 0.1, klass: "order" });
  });

  it("has FRIENDSANDFAMILY as a product discount", () => {
    expect(PROMO_CATALOGUE.FRIENDSANDFAMILY).toEqual({ rate: 0.2, klass: "product" });
  });
});
