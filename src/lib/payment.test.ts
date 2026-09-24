import { describe, expect, it } from "vitest";
import { COD_FEE_RATE, codFeeLabel } from "./payment";

/* The product page quotes this fee beside "Free delivery". If it drifts from
   what the checkout charges, the page either hides a fee the shopper then meets
   at payment or quotes one that is not there. Asserted as a literal on purpose:
   changing it must be a deliberate edit alongside the checkout setting. */
describe("COD fee", () => {
  it("matches the 5% the checkout adds to a cash-on-delivery order", () => {
    expect(COD_FEE_RATE).toBe(0.05);
    expect(codFeeLabel()).toBe("+5%");
  });
});
