import { describe, expect, it } from "vitest";
import { COD_FEE_RATE, codFeeFor } from "./payment";

/* The bag quotes this fee before the shopper leaves for the payment page. If it
   drifts from what the checkout charges, the bag either hides a fee the shopper
   then meets at payment or quotes one that is not there. Asserted as literals
   on purpose: changing it must be a deliberate edit alongside the checkout
   setting. */
describe("COD fee", () => {
  it("matches the 5% the checkout adds to a cash-on-delivery order", () => {
    expect(COD_FEE_RATE).toBe(0.05);
  });

  // Figures from live COD orders, fee charged on the total after discount.
  it("reproduces what live COD orders were charged", () => {
    expect(899 + codFeeFor(899)).toBeCloseTo(943.95, 2);
    expect(2338.2 + codFeeFor(2338.2)).toBeCloseTo(2455.11, 2);
  });
});
