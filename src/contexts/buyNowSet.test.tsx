import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "./CartContext";

/*
  Buy Now on a set chosen on the product page ("Make it a set"). The page's
  own first version added the set with addItem and checked out the bag: Add
  to bag then Buy Now paid for the set twice, a piece that would not add left
  the rest to check out at a lower rung than quoted, and other pieces in the
  bag were charged too. It now goes through buyNow, as AGENTS.md requires.
*/
const mocks = vi.hoisted(() => ({
  add: vi.fn(),
  create: vi.fn(),
  createLines: vi.fn(),
  update: vi.fn(),
  codes: vi.fn(),
  attrs: vi.fn(),
  start: vi.fn(),
  track: vi.fn(),
  toast: vi.fn(),
}));
vi.mock("@/lib/shopify", () => ({
  addLineToShopifyCart: mocks.add,
  createShopifyCart: mocks.create,
  createShopifyCartLines: mocks.createLines,
  applyCartDiscountCodes: mocks.codes,
  fetchShopifyCart: vi.fn(),
  formatCheckoutUrl: (url: string) => url,
  removeLineFromShopifyCart: vi.fn(),
  updateShopifyCartLine: mocks.update,
  updateCartTrackingAttributes: mocks.attrs,
}));
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: mocks.start }));
vi.mock("@/lib/pixel", () => ({ productParams: (p: unknown) => p, shopifyNumericId: (id: string) => id, trackPixel: mocks.track }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: mocks.toast } }));

const prism = { id: "prism-riviere-bracelet", variantId: "v-prism", name: "Prism Rivière Bracelet", price: 2399, priceLabel: "₹2,399", currencyCode: "INR", image: "p.webp" };
const hoops = { id: "prism-emerald-cut-hoops", variantId: "v-hoops", name: "Prism Emerald-Cut Hoops", price: 1299, priceLabel: "₹1,299", currencyCode: "INR", image: "h.webp" };
const other = { id: "woven-gold-hoops", variantId: "v-woven", name: "Woven Gold Hoops", price: 1049, priceLabel: "₹1,049", currencyCode: "INR", image: "w.webp" };
const bag = (items: object[]) =>
  localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "bag-cart", checkoutUrl: "https://example.com/bag", items }));
const handedOff = () => mocks.start.mock.calls[0][0].map((l: { variantId: string; quantity: number }) => [l.variantId, l.quantity]);

describe("Buy Now on a chosen set", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    mocks.start.mockResolvedValue(true);
    mocks.codes.mockResolvedValue({ applied: true });
  });

  it("puts the set in an empty bag and checks out both pieces with the rung they earn", async () => {
    mocks.create.mockResolvedValueOnce({ cartId: "bag-cart", checkoutUrl: "https://example.com/bag", lineId: "l-prism", quantity: 1 });
    mocks.add.mockResolvedValueOnce({ success: true, lineId: "l-hoops", quantity: 1, checkoutUrl: "https://example.com/bag" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(prism, 1, [hoops]); });
    expect(handedOff()).toEqual([["v-prism", 1], ["v-hoops", 1]]);
    expect(mocks.start.mock.calls[0][1].couponCode).toBe("BUY2");
    expect(mocks.createLines).not.toHaveBeenCalled();
  });

  it("checks out only the set, on a cart of its own, and keeps the bag's other pieces", async () => {
    bag([{ ...other, quantity: 1, lineId: "l-woven" }]);
    mocks.add
      .mockResolvedValueOnce({ success: true, lineId: "l-prism", quantity: 1, checkoutUrl: "https://example.com/bag" })
      .mockResolvedValueOnce({ success: true, lineId: "l-hoops", quantity: 1, checkoutUrl: "https://example.com/bag" });
    mocks.createLines.mockResolvedValueOnce({
      cartId: "own-cart",
      checkoutUrl: "https://example.com/own",
      lines: [
        { variantId: "v-prism", lineId: "o-prism", quantity: 1 },
        { variantId: "v-hoops", lineId: "o-hoops", quantity: 1 },
      ],
    });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(prism, 1, [hoops]); });
    expect(mocks.createLines).toHaveBeenCalledWith([
      { variantId: "v-prism", quantity: 1, size: undefined },
      { variantId: "v-hoops", quantity: 1, size: undefined },
    ]);
    expect(handedOff()).toEqual([["v-prism", 1], ["v-hoops", 1]]);
    expect(mocks.start.mock.calls[0][1].couponCode).toBe("BUY2");
    expect(mocks.start.mock.calls[0][1].fallbackUrl).toMatch(/^https:\/\/example\.com\/own/);
    expect(mocks.codes).toHaveBeenCalledWith("own-cart", ["BUY2"]);
    expect(result.current.items.map((i) => i.id)).toEqual(["woven-gold-hoops", "prism-riviere-bracelet", "prism-emerald-cut-hoops"]);
  });

  it("does not open checkout when a piece of the set will not go in", async () => {
    mocks.create.mockResolvedValueOnce({ cartId: "bag-cart", checkoutUrl: "https://example.com/bag", lineId: "l-prism", quantity: 1 });
    mocks.add.mockResolvedValueOnce({ success: false });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(prism, 1, [hoops]); });
    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.toast).toHaveBeenCalled();
  });

  it("never adds a piece of the set again when the bag already holds it", async () => {
    bag([{ ...prism, quantity: 1, lineId: "l-prism" }, { ...hoops, quantity: 1, lineId: "l-hoops" }]);
    mocks.update.mockResolvedValue({ success: true, quantity: 1, checkoutUrl: "https://example.com/bag" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(prism, 1, [hoops]); });
    expect(mocks.add).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
    expect(handedOff()).toEqual([["v-prism", 1], ["v-hoops", 1]]);
  });

  it("does not open checkout when Shopify's own cart for the set comes back short", async () => {
    bag([{ ...other, quantity: 1, lineId: "l-woven" }]);
    mocks.add
      .mockResolvedValueOnce({ success: true, lineId: "l-prism", quantity: 1, checkoutUrl: "https://example.com/bag" })
      .mockResolvedValueOnce({ success: true, lineId: "l-hoops", quantity: 1, checkoutUrl: "https://example.com/bag" });
    mocks.createLines.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(prism, 1, [hoops]); });
    expect(mocks.start).not.toHaveBeenCalled();
  });
});
