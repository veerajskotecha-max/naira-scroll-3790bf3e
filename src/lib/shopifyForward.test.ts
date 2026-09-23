import { describe, expect, it } from "vitest";
import { shopifyForwardTarget } from "./shopifyForward";

describe("shopifyForwardTarget", () => {
  /* The bug: Shopify's "View your order" link points at nairaflore.com, which
     had no route for it, so a customer who had just paid saw "Coming Soon".
     The token and the ?key= are what let Shopify show them their order, so
     both must survive the hop untouched. */
  it("forwards the order-status link Clarity caught, path and key intact", () => {
    expect(
      shopifyForwardTarget("/68096065698/orders/d44e6de89d8a0fdb44dbf7e7825f90b7/authenticate", "?key=abc123"),
    ).toBe("https://payments.nairaflore.com/68096065698/orders/d44e6de89d8a0fdb44dbf7e7825f90b7/authenticate?key=abc123");
  });

  it("forwards other Shopify pages under the store id, not just orders", () => {
    expect(shopifyForwardTarget("/68096065698/invoices/xyz")).toBe(
      "https://payments.nairaflore.com/68096065698/invoices/xyz",
    );
  });

  /* Everything else that misses a route is genuinely missing and must still
     reach the Coming Soon page, not be thrown at Shopify. */
  it.each([
    "/the-glolden-hour",
    "/category=Bracelets",
    "/jewellery/orders/x",
    "/12345/orders/x",   // too short to be a Shopify store id
    "/",
  ])("leaves %s to the Coming Soon page", (path) => {
    expect(shopifyForwardTarget(path)).toBeNull();
  });
});
