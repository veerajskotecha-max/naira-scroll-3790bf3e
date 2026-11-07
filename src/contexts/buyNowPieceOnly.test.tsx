import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "./CartContext";

/*
  The owner's open question on Buy Now: with other pieces in the bag, Buy Now
  sent the whole bag to checkout (and the ladder code the whole bag earned).
  This option checks out only the piece being viewed, and leaves the rest of
  the bag where it is.
*/
const mocks = vi.hoisted(() => ({ add: vi.fn(), create: vi.fn(), codes: vi.fn(), attrs: vi.fn(), start: vi.fn(), track: vi.fn(), toast: vi.fn() }));
vi.mock("@/lib/shopify", () => ({
  addLineToShopifyCart: mocks.add,
  createShopifyCart: mocks.create,
  applyCartDiscountCodes: mocks.codes,
  fetchShopifyCart: vi.fn(),
  formatCheckoutUrl: (url: string) => url,
  removeLineFromShopifyCart: vi.fn(),
  updateShopifyCartLine: vi.fn(),
  updateCartTrackingAttributes: mocks.attrs,
}));
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: mocks.start }));
vi.mock("@/lib/pixel", () => ({ productParams: (p: unknown) => p, shopifyNumericId: (id: string) => id, trackPixel: mocks.track }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: mocks.toast } }));

const hoops = { id: "woven-gold-hoops", variantId: "v-hoops", name: "Woven Gold Hoops", price: 1299, priceLabel: "₹1,299", currencyCode: "INR", image: "h.webp" };
const prism = { id: "prism-riviere-bracelet", variantId: "v-prism", name: "Prism Rivière Bracelet", price: 1499, priceLabel: "₹1,499", currencyCode: "INR", image: "p.webp" };
const bag = (items: object[]) =>
  localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "bag-cart", checkoutUrl: "https://example.com/bag", items }));
const handedOff = () => mocks.start.mock.calls[0][0].map((l: { variantId: string; quantity: number }) => [l.variantId, l.quantity]);
const initiated = () => mocks.track.mock.calls.find(([name]) => name === "InitiateCheckout")?.[1];

describe("Buy Now checks out only the piece being viewed", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    mocks.start.mockResolvedValue(true);
    mocks.codes.mockResolvedValue({ applied: true });
    mocks.create.mockResolvedValue({ cartId: "own-cart", checkoutUrl: "https://example.com/own", lineId: "own-line", quantity: 1 });
  });

  it("hands off just the piece, on a cart of its own, and keeps the bag", async () => {
    bag([{ ...hoops, quantity: 1, lineId: "l-hoops" }]);
    mocks.add.mockResolvedValueOnce({ success: true, lineId: "l-prism", quantity: 1, checkoutUrl: "https://example.com/bag" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(prism); });
    expect(handedOff()).toEqual([["v-prism", 1]]);
    expect(mocks.start.mock.calls[0][1]).toEqual({ couponCode: null, fallbackUrl: "https://example.com/own" });
    expect(mocks.create).toHaveBeenCalledWith("v-prism", 1, undefined);
    expect(initiated()).toMatchObject({ value: 1499, num_items: 1, content_ids: ["v-prism"] });
    // The bag and its Shopify cart are left alone.
    expect(result.current.items.map((i) => i.id)).toEqual(["woven-gold-hoops", "prism-riviere-bracelet"]);
    expect(mocks.codes).not.toHaveBeenCalledWith("bag-cart", expect.anything());
    expect(mocks.attrs).not.toHaveBeenCalled();
  });

  /* The piece's own quantity, not the bag's, decides the rung: three of it
     earn BUY3 (20%) on its own cart, whatever else the bag holds. */
  it("gives the piece's own cart the code its quantity earns", async () => {
    bag([{ ...hoops, quantity: 1, lineId: "l-hoops" }, { ...prism, quantity: 3, lineId: "l-prism" }]);
    mocks.create.mockResolvedValueOnce({ cartId: "own-cart", checkoutUrl: "https://example.com/own", lineId: "own-line", quantity: 3 });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(prism); });
    expect(handedOff()).toEqual([["v-prism", 3]]);
    expect(mocks.start.mock.calls[0][1].couponCode).toBe("BUY3");
    expect(mocks.codes).toHaveBeenCalledWith("own-cart", ["BUY3"]);
    // 3 x 1,499 = 4,497 at 20% is 3,597.60, so 3,598.
    expect(initiated()).toMatchObject({ value: 3598, num_items: 3 });
  });

  /* Two of the piece earn no rung since 7 Nov 2026 (Buy 2 is gone): the own
     cart gets no code, and any old one is cleared from it. Before, the bag
     plus this piece made three, but the hand-off is the piece alone. */
  it("gives two of the piece no code on their own cart", async () => {
    bag([{ ...hoops, quantity: 1, lineId: "l-hoops" }, { ...prism, quantity: 2, lineId: "l-prism" }]);
    mocks.create.mockResolvedValueOnce({ cartId: "own-cart", checkoutUrl: "https://example.com/own", lineId: "own-line", quantity: 2 });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(prism); });
    expect(handedOff()).toEqual([["v-prism", 2]]);
    expect(mocks.start.mock.calls[0][1].couponCode).toBeNull();
    expect(mocks.codes).toHaveBeenCalledWith("own-cart", []);
    expect(mocks.codes).not.toHaveBeenCalledWith("own-cart", ["BUY2"]);
    expect(initiated()).toMatchObject({ value: 2998, num_items: 2 });
  });

  it("checks out the bag as before when it holds only this piece", async () => {
    // An empty bag: Buy Now starts the bag's cart with the piece, as before.
    mocks.create.mockResolvedValueOnce({ cartId: "bag-cart", checkoutUrl: "https://example.com/bag", lineId: "l-prism", quantity: 1 });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(prism); });
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(handedOff()).toEqual([["v-prism", 1]]);
    expect(mocks.start.mock.calls[0][1].fallbackUrl).toBe("https://example.com/bag");
    expect(mocks.attrs).toHaveBeenCalledWith("bag-cart");
    expect(result.current.items.map((i) => i.id)).toEqual(["prism-riviere-bracelet"]);
  });

  it("does not open checkout when the piece's own cart cannot be made", async () => {
    bag([{ ...hoops, quantity: 1, lineId: "l-hoops" }, { ...prism, quantity: 1, lineId: "l-prism" }]);
    mocks.create.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(prism); });
    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalled();
  });
});
