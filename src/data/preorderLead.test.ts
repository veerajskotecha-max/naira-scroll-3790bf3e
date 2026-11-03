import { describe, expect, it } from "vitest";
import { preorderLead, SOLD_OUT_LEAD } from "./jewellery";

/* A sold-out piece read "shipped within 2 weeks", "Delivery in 3–5 working
   days" and a dated pincode promise on one page; a sold-out colour and a
   made-to-order ring size were promised the in-stock date. Each state has
   one lead time. */
const state = { soldOut: false, variantSoldOut: false, sizePreorder: false, size: "6" };

describe("preorderLead", () => {
  it("is null for a piece that ships now", () => {
    expect(preorderLead(state)).toBeNull();
  });

  it("gives a sold-out piece its two weeks, whatever else is chosen", () => {
    expect(preorderLead({ ...state, soldOut: true, variantSoldOut: true, sizePreorder: true })).toBe(`${SOLD_OUT_LEAD}.`);
  });

  it("dates a sold-out colour or size on WhatsApp", () => {
    expect(preorderLead({ ...state, variantSoldOut: true, sizePreorder: true })).toBe("Reserve it and we will confirm the date on WhatsApp.");
  });

  it("gives a ring size made to order its 45 days", () => {
    expect(preorderLead({ ...state, sizePreorder: true, size: "5" })).toBe("US 5 is a pre-order, delivered in 45 days.");
  });

  it("never names the in-stock delivery for a piece that cannot ship now", () => {
    for (const s of [{ soldOut: true }, { variantSoldOut: true }, { sizePreorder: true }]) {
      expect(preorderLead({ ...state, ...s })).not.toMatch(/working days|arrives by/);
    }
  });
});
