import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "./CartContext";

const mocks = vi.hoisted(() => ({ add: vi.fn(), update: vi.fn(), start: vi.fn(), track: vi.fn() }));
vi.mock("@/lib/shopify", () => ({
  addLineToShopifyCart: mocks.add,
  createShopifyCart: vi.fn(),
  applyCartDiscountCodes: vi.fn(),
  fetchShopifyCart: vi.fn(),
  formatCheckoutUrl: (url: string) => url,
  removeLineFromShopifyCart: vi.fn(),
  updateShopifyCartLine: mocks.update,
  updateCartTrackingAttributes: vi.fn(),
}));
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: mocks.start }));
vi.mock("@/lib/pixel", () => ({ productParams: (p: unknown) => p, shopifyNumericId: () => "1", trackPixel: mocks.track }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const piece = { id: "new-piece", variantId: "new-variant", name: "New piece", price: 1499, priceLabel: "₹1,499", currencyCode: "INR", image: "piece.webp" };
describe("Buy Now add failure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "old-cart", checkoutUrl: "https://example.com/old-checkout", items: [{ ...piece, id: "old-piece", variantId: "old-variant", quantity: 1, lineId: "old-line" }] }));
  });

  // An old bag must never become the checkout for a piece that failed to add.
  it("does not initiate checkout for the old bag when adding the selected piece fails", async () => {
    mocks.add.mockRejectedValueOnce(new Error("Unavailable"));
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(piece); });
    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.track).not.toHaveBeenCalled();
    expect(result.current.items.map((item) => item.id)).toEqual(["old-piece"]);
  });
});

describe("Buy Now on a piece already in the bag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "cart-1", checkoutUrl: "https://example.com/checkout", items: [{ ...piece, quantity: 1, lineId: "line-1" }] }));
  });

  // Add, then Buy Now, sent two of the piece to checkout with BUY2 on them.
  it("hands off the line as it is, without adding a second unit", async () => {
    mocks.start.mockResolvedValueOnce(true);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow(piece); });
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.add).not.toHaveBeenCalled();
    expect(mocks.track).not.toHaveBeenCalledWith("AddToCart", expect.anything());
    expect(mocks.start).toHaveBeenCalledTimes(1);
    expect(mocks.start.mock.calls[0][0].map((line: { variantId: string; quantity: number }) => [line.variantId, line.quantity])).toEqual([["new-variant", 1]]);
    expect(result.current.items.map((item) => item.quantity)).toEqual([1]);
  });

  // A ring in another size is another line, so Buy Now still adds it.
  it("still adds the piece in a size the bag does not hold", async () => {
    mocks.add.mockResolvedValueOnce({ success: true, lineId: "line-2", quantity: 1, checkoutUrl: "https://example.com/checkout" });
    mocks.start.mockResolvedValueOnce(true);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.buyNow({ ...piece, size: "US 7" }); });
    expect(mocks.add).toHaveBeenCalledTimes(1);
    expect(mocks.update).not.toHaveBeenCalled();
    expect(result.current.items.map((item) => [item.size ?? "", item.quantity])).toEqual([["", 1], ["US 7", 1]]);
  });
});