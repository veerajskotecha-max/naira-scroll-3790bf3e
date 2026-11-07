import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "./CartContext";

/*
  "+" in the bag puts another piece in Shopify's cart, and is how a shopper
  reaches the Buy 3 / Buy 4 saving, but Meta heard nothing of it: Woven Gold
  Hoops went from 1 to 2 with one Add to cart in all (audit C63). A raise is
  told as an add of the pieces Shopify really added, through the same call
  (browser pixel and its server copy under one event id).
*/
const mocks = vi.hoisted(() => ({ update: vi.fn(), remove: vi.fn(), track: vi.fn() }));
vi.mock("@/lib/shopify", () => ({
  addLineToShopifyCart: vi.fn(),
  createShopifyCart: vi.fn(),
  applyCartDiscountCodes: vi.fn(),
  fetchShopifyCart: vi.fn(),
  formatCheckoutUrl: (url: string) => url,
  removeLineFromShopifyCart: mocks.remove,
  updateShopifyCartLine: mocks.update,
  updateCartTrackingAttributes: vi.fn(),
}));
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: vi.fn() }));
vi.mock("@/lib/pixel", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/pixel")>()), trackPixel: mocks.track }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const hoops = { id: "woven-gold-hoops", variantId: "gid://shopify/ProductVariant/47501786906786", name: "Woven Gold Hoops", price: 1299, priceLabel: "₹1,299", currencyCode: "INR", image: "w.jpg", lineId: "line-1" };
const addToCarts = () => mocks.track.mock.calls.filter(([event]) => event === "AddToCart").map(([, params]) => params);

describe("a raise in the bag is an Add to cart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });
  const bagAt = (quantity: number) =>
    localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "cart-1", checkoutUrl: "https://c/1", items: [{ ...hoops, quantity }] }));

  it("tells Meta of the one piece \"+\" added", async () => {
    bagAt(1);
    mocks.update.mockResolvedValueOnce({ success: true, quantity: 2, checkoutUrl: "https://c/1" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => {
      await result.current.updateQuantity(hoops.id, undefined, 2, hoops.variantId);
    });
    expect(result.current.totalItems).toBe(2);
    expect(mocks.track).toHaveBeenCalledTimes(1);
    expect(addToCarts()).toEqual([
      { content_ids: ["47501786906786"], content_name: "Woven Gold Hoops", content_type: "product", content_category: undefined, contents: [{ id: "47501786906786", quantity: 1, item_price: 1299 }], value: 1299, currency: "INR" },
    ]);
  });

  it("tells Meta nothing when Shopify capped the raise", async () => {
    bagAt(1);
    mocks.update.mockResolvedValueOnce({ success: true, quantity: 1, checkoutUrl: "https://c/1" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => {
      await result.current.updateQuantity(hoops.id, undefined, 2, hoops.variantId);
    });
    expect(addToCarts()).toEqual([]);
  });

  it("tells Meta nothing for \"−\"", async () => {
    bagAt(2);
    mocks.update.mockResolvedValueOnce({ success: true, quantity: 1, checkoutUrl: "https://c/1" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => {
      await result.current.updateQuantity(hoops.id, undefined, 1, hoops.variantId);
    });
    expect(result.current.totalItems).toBe(1);
    expect(mocks.track).not.toHaveBeenCalled();
  });
});
