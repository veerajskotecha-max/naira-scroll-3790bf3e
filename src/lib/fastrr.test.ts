import { describe, expect, it } from "vitest";
import { FASTRR_DOMAIN, currentUtmParams, toFastrrProducts } from "./fastrr";
import type { CartItem } from "@/contexts/CartContext";

const item = (over: Partial<CartItem> = {}): CartItem =>
  ({
    id: "cushion-halo-ring",
    variantId: "gid://shopify/ProductVariant/47501788577954",
    name: "Cushion Halo Ring",
    price: 1199,
    quantity: 1,
    image: "https://example.com/ring.jpg",
    ...over,
  }) as CartItem;

/**
 * Fastrr keys its seller lookup on the STOREFRONT domain, not the Shopify
 * permanent domain. Sending `nc5eti-gp.myshopify.com` made their seller-config
 * API answer 402 "Seller not found or inactive"; their script then reported
 * NATIVE_REDIRECT_THRESHOLD_BREACHED and silently redirected to the fallback,
 * so checkout looked like it simply bounced to Shopify with no error anywhere.
 * Verified against their API: nairaflore.com 201, the myshopify/www/payments
 * hosts all 402.
 */
describe("FASTRR_DOMAIN", () => {
  it("is the apex storefront domain Fastrr has the seller config against", () => {
    expect(FASTRR_DOMAIN).toBe("nairaflore.com");
  });

  it("is not the Shopify permanent domain", () => {
    expect(FASTRR_DOMAIN).not.toContain("myshopify.com");
  });

  it("is not the www host, which is a separate inactive record", () => {
    expect(FASTRR_DOMAIN).not.toMatch(/^www\./);
  });
});

/**
 * The web flow resolves price and stock from Shopify by variant id. Sending a
 * price would reintroduce the 100x unit ambiguity the mobile-app script had.
 */
describe("toFastrrProducts", () => {
  it("sends only variantId and quantity — never a price", () => {
    const [product] = toFastrrProducts([item()]);
    expect(product).toEqual({ variantId: "47501788577954", quantity: 1 });
    expect(Object.keys(product)).toHaveLength(2);
  });

  it("strips the GID down to the bare numeric variant id", () => {
    expect(toFastrrProducts([item()])[0].variantId).toBe("47501788577954");
  });

  it("keeps an already-numeric variant id", () => {
    expect(toFastrrProducts([item({ variantId: "47501788577954" })])[0].variantId).toBe("47501788577954");
  });

  it("drops a line with no variant rather than sending a broken one", () => {
    expect(toFastrrProducts([item({ variantId: null })])).toEqual([]);
  });

  it("carries quantity through", () => {
    expect(toFastrrProducts([item({ quantity: 3 })])[0].quantity).toBe(3);
  });
});

describe("currentUtmParams", () => {
  it("forwards the campaign params Shopify should see on the order", () => {
    expect(currentUtmParams("?utm_source=ig&utm_campaign=diwali&x=1")).toBe(
      "utm_source=ig&utm_campaign=diwali"
    );
  });

  it("returns an empty string when there is no campaign", () => {
    expect(currentUtmParams("?x=1")).toBe("");
    expect(currentUtmParams("")).toBe("");
  });
});
