import { afterEach, describe, expect, it, vi } from "vitest";
import { FASTRR_DOMAIN, currentUtmParams, startFastrrCheckout, toFastrrProducts } from "./fastrr";
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

/**
 * A ring Shopify does not sell in sizes (an adjustable ring, Droplet Open
 * Ring) carries the size the shopper picked as the line's Size attribute on
 * the Shopify cart. Fastrr builds the order from the products it is handed,
 * so the size never reached a Fastrr order, and two sizes of one ring came
 * out as two identical lines.
 */
describe("the size picked reaches a Fastrr order", () => {
  const handoff = vi.fn();
  afterEach(() => {
    handoff.mockReset();
    delete window.shiprocketCheckoutEvents;
  });
  const bag = [
    item({ id: "verdant-eternity-band", variantId: "gid://shopify/ProductVariant/47501788938402", name: "Verdant Eternity Band", size: "US 8" }),
    item({ id: "verdant-eternity-band", variantId: "gid://shopify/ProductVariant/47501788938402", name: "Verdant Eternity Band", size: "US 6", quantity: 2 }),
    item({ id: "woven-gold-hoops", variantId: "gid://shopify/ProductVariant/47501786906786", name: "Woven Gold Hoops" }),
  ];

  it("hands each sized line its Size, and the order a note of every size", async () => {
    window.shiprocketCheckoutEvents = { buyDirect: handoff };
    expect(await startFastrrCheckout(bag, { couponCode: "BUY3" })).toBe(true);
    const payload = handoff.mock.calls[0][0];
    expect(payload.products).toEqual([
      { variantId: "47501788938402", quantity: 1, customAttributes: { Size: "US 8" } },
      { variantId: "47501788938402", quantity: 2, customAttributes: { Size: "US 6" } },
      { variantId: "47501786906786", quantity: 1 },
    ]);
    expect(payload.cartAttributes.sizes).toBe("Verdant Eternity Band: US 8; Verdant Eternity Band: US 6 x2");
  });

  it("adds nothing to a bag with no size", async () => {
    window.shiprocketCheckoutEvents = { buyDirect: handoff };
    await startFastrrCheckout([bag[2]]);
    const payload = handoff.mock.calls[0][0];
    expect(payload.products).toEqual([{ variantId: "47501786906786", quantity: 1 }]);
    expect(payload.cartAttributes).not.toHaveProperty("sizes");
  });
});
