import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "./CartContext";

/*
  Meta hears of an Add to cart only for the pieces Shopify really put in the
  bag. Shopify caps a line at its stock and answers without an error: a second
  tap on the last Baguette Arc Hoops came back at 1, the bag said "Only 1 left,
  all in your bag", and Meta was still told a ₹1,899 add (audit C57).
*/
const mocks = vi.hoisted(() => ({ add: vi.fn(), create: vi.fn(), update: vi.fn(), track: vi.fn() }));
vi.mock("@/lib/shopify", () => ({
  addLineToShopifyCart: mocks.add,
  createShopifyCart: mocks.create,
  applyCartDiscountCodes: vi.fn(),
  fetchShopifyCart: vi.fn(),
  formatCheckoutUrl: (url: string) => url,
  removeLineFromShopifyCart: vi.fn(),
  updateShopifyCartLine: mocks.update,
  updateCartTrackingAttributes: vi.fn(),
}));
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: vi.fn() }));
vi.mock("@/lib/pixel", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/pixel")>()), trackPixel: mocks.track }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const hoops = { id: "baguette-arc-hoops", variantId: "gid://shopify/ProductVariant/47501787136162", name: "Baguette Arc Hoops", price: 1899, priceLabel: "₹1,899", currencyCode: "INR", image: "b.jpg" };
const addToCarts = () => mocks.track.mock.calls.filter(([event]) => event === "AddToCart").map(([, params]) => params);
const bagWith = (items: unknown[]) =>
  localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: items.length ? "cart-1" : null, checkoutUrl: items.length ? "https://c/1" : null, items }));

describe("Add to cart counts what Shopify added", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("sends nothing when Shopify kept the line where it was", async () => {
    bagWith([{ ...hoops, quantity: 1, lineId: "line-1" }]);
    mocks.update.mockResolvedValueOnce({ success: true, quantity: 1, checkoutUrl: "https://c/1" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    let url: string | null = null;
    await act(async () => {
      result.current.setDrawerOpen(true);
      url = await result.current.addItem(hoops);
    });
    expect(addToCarts()).toEqual([]);
    expect(result.current.addError).toBe("Only 1 of Baguette Arc Hoops left, all in your bag.");
    expect(result.current.items[0].quantity).toBe(1);
    /* The bag is still a bag: Buy Now hands it to checkout as before. */
    expect(url).toBe("https://c/1");
  });

  it("counts only the pieces Shopify added to a line", async () => {
    bagWith([{ ...hoops, quantity: 1, lineId: "line-1" }]);
    mocks.update.mockResolvedValueOnce({ success: true, quantity: 2, checkoutUrl: "https://c/1" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => {
      await result.current.addItem(hoops, 3);
    });
    expect(addToCarts()).toEqual([expect.objectContaining({ value: 1899, contents: [{ id: "47501787136162", quantity: 1, item_price: 1899 }] })]);
  });

  it("counts only the pieces a new bag really holds", async () => {
    mocks.create.mockResolvedValueOnce({ cartId: "cart-1", checkoutUrl: "https://c/1", lineId: "line-1", quantity: 1 });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => {
      await result.current.addItem(hoops, 2);
    });
    expect(addToCarts()).toEqual([expect.objectContaining({ value: 1899, contents: [{ id: "47501787136162", quantity: 1, item_price: 1899 }] })]);
  });

  it("sends nothing for a line Shopify left at 0", async () => {
    bagWith([{ ...hoops, id: "woven-gold-hoops", variantId: "gid://shopify/ProductVariant/1", quantity: 1, lineId: "line-1" }]);
    mocks.add.mockResolvedValueOnce({ success: true, lineId: "line-2", quantity: 0, checkoutUrl: "https://c/1" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => {
      await result.current.addItem(hoops);
    });
    expect(addToCarts()).toEqual([]);
  });

  it("still sends one Add to cart for an add Shopify took in full", async () => {
    bagWith([{ ...hoops, id: "woven-gold-hoops", variantId: "gid://shopify/ProductVariant/1", quantity: 1, lineId: "line-1" }]);
    mocks.add.mockResolvedValueOnce({ success: true, lineId: "line-2", quantity: 2, checkoutUrl: "https://c/1" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => {
      await result.current.addItem(hoops, 2);
    });
    expect(addToCarts()).toEqual([expect.objectContaining({ value: 3798, currency: "INR", content_ids: ["47501787136162"], contents: [{ id: "47501787136162", quantity: 2, item_price: 1899 }] })]);
  });
});
