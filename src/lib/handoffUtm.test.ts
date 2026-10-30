import { afterEach, describe, expect, it, vi } from "vitest";
import type { CartItem } from "@/contexts/CartContext";

/*
  An ad click that browses on before checkout: the hand-off read the address
  at the tap, which had lost the campaign by then (the router drops the
  query), so Fastrr got no utmParams at all; and Shopify's own checkout (the
  fallback) never carried the campaign anywhere. Each case lands with a
  campaign, loads the code fresh as a page load would, then moves on.
*/
const piece = { id: "prism-riviere-bracelet", variantId: "gid://shopify/ProductVariant/47501788348578", name: "Prism Rivière Bracelet", price: 1499, quantity: 1 } as CartItem;
const land = async (path: string) => {
  window.history.replaceState(null, "", path);
  vi.resetModules();
};

afterEach(() => {
  delete window.shiprocketCheckoutEvents;
  sessionStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("the landing campaign reaches Fastrr after the shopper browses on", () => {
  it("hands Fastrr the campaign the session landed with", async () => {
    await land("/jewellery?utm_source=facebook&utm_medium=paid&utm_campaign=audit_camp&fbclid=x");
    const { startFastrrCheckout } = await import("./fastrr");
    // Shop All, then a piece: the address has no campaign left.
    window.history.pushState(null, "", "/jewellery/prism-riviere-bracelet");
    const buyDirect = vi.fn();
    window.shiprocketCheckoutEvents = { buyDirect };
    await startFastrrCheckout([piece]);
    expect(buyDirect.mock.calls[0][0].utmParams).toBe("utm_source=facebook&utm_medium=paid&utm_campaign=audit_camp");
  });

  it("sends no campaign when the session had none", async () => {
    await land("/jewellery");
    const { startFastrrCheckout } = await import("./fastrr");
    const buyDirect = vi.fn();
    window.shiprocketCheckoutEvents = { buyDirect };
    await startFastrrCheckout([piece]);
    expect(buyDirect.mock.calls[0][0]).not.toHaveProperty("utmParams");
  });
});

describe("the landing campaign rides on the Shopify cart", () => {
  it("adds the session's utm_* to the cart's attributes", async () => {
    await land("/products/triple-coil-wrap-bangle?utm_source=facebook&utm_campaign=audit_camp");
    const { trackingCartAttributes } = await import("./shopify");
    window.history.pushState(null, "", "/jewellery");
    expect(trackingCartAttributes()).toEqual(expect.arrayContaining([
      { key: "utm_source", value: "facebook" },
      { key: "utm_campaign", value: "audit_camp" },
    ]));
  });
});
