import { afterEach, describe, expect, it, vi } from "vitest";
import { addLineToShopifyCart, createShopifyCart } from "./shopify";

/* Shopify answers an Add of a sold-out piece with a line of quantity 0 and no
   error. Taken as added, the bag showed "Molten Bloom Hoops ₹0 · qty 0" with a
   Checkout button. A line of 0 is a piece Shopify could not add. */
const VARIANT = "gid://shopify/ProductVariant/47501786841250";
const cart = (quantity: number) => ({
  id: "gid://shopify/Cart/1", checkoutUrl: "https://nairaflore.com/cart/c/1",
  lines: { edges: [{ node: { id: "gid://shopify/CartLine/1", quantity, attributes: [], merchandise: { id: VARIANT, price: { amount: "1300.0" } } } }] },
});
const answer = (data: unknown) => vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ data }) }));

afterEach(() => vi.unstubAllGlobals());

describe("a sold-out piece Shopify leaves at 0", () => {
  it("is not a new cart's line", async () => {
    vi.stubGlobal("fetch", answer({ cartCreate: { cart: cart(0), userErrors: [] } }));
    expect(await createShopifyCart(VARIANT, 1)).toBeNull();
  });

  it("is not a line added to the cart", async () => {
    vi.stubGlobal("fetch", answer({ cartLinesAdd: { cart: cart(0), userErrors: [] } }));
    expect((await addLineToShopifyCart("gid://shopify/Cart/1", VARIANT, 1)).lineId).toBeUndefined();
  });

  it("still takes a line Shopify did add, at its price", async () => {
    vi.stubGlobal("fetch", answer({ cartLinesAdd: { cart: cart(1), userErrors: [] } }));
    expect(await addLineToShopifyCart("gid://shopify/Cart/1", VARIANT, 1)).toMatchObject({ lineId: "gid://shopify/CartLine/1", quantity: 1, price: 1300 });
  });
});
