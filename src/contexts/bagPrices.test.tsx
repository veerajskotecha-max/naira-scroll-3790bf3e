import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "./CartContext";

/*
  A bag line used to keep the price the card showed at the tap. A card drawn
  before the live catalogue (₹699 for a ₹799 ring), or a bag kept across an
  owner's price change, then quoted a Total Shopify never charged.
*/
const mocks = vi.hoisted(() => ({ add: vi.fn(), update: vi.fn(), fetch: vi.fn() }));
vi.mock("@/lib/shopify", () => ({
  addLineToShopifyCart: mocks.add,
  createShopifyCart: vi.fn(),
  applyCartDiscountCodes: vi.fn(),
  fetchShopifyCart: mocks.fetch,
  formatCheckoutUrl: (url: string) => url,
  removeLineFromShopifyCart: vi.fn(),
  updateShopifyCartLine: mocks.update,
  updateCartTrackingAttributes: vi.fn(),
}));
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: vi.fn() }));
vi.mock("@/lib/pixel", () => ({ productParams: (p: unknown) => p, shopifyNumericId: () => "1", trackPixel: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const ring = { id: "mesh-band-ring", variantId: "gid://shopify/ProductVariant/9", name: "Mesh Band Ring", price: 699, priceLabel: "₹699", currencyCode: "INR", image: "m.jpg" };

describe("bag prices come from Shopify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "cart-1", checkoutUrl: "https://c/1", items: [{ ...ring, quantity: 1, lineId: "line-1" }] }));
  });

  it("re-prices a saved line when the bag syncs", async () => {
    mocks.fetch.mockResolvedValueOnce({ checkoutUrl: "https://c/1", lines: { edges: [{ node: { id: "line-1", quantity: 1, merchandise: { id: ring.variantId, price: { amount: "799.0" } } } }] } });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    expect(result.current.subtotal).toBe(699);
    await act(async () => {
      await result.current.syncCart();
    });
    expect(result.current.subtotal).toBe(799);
    expect(result.current.items[0].priceLabel).toBe("₹799");
  });

  it("takes Shopify's price for a piece added from a stale card", async () => {
    mocks.add.mockResolvedValueOnce({ success: true, lineId: "line-2", quantity: 1, price: 1899, checkoutUrl: "https://c/1" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => {
      await result.current.addItem({ ...ring, id: "heartline-paperclip-necklace", variantId: "gid://shopify/ProductVariant/5", price: 2449, priceLabel: "₹2,449" });
    });
    expect(result.current.items.find((i) => i.lineId === "line-2")?.price).toBe(1899);
    expect(result.current.subtotal).toBe(699 + 1899);
  });

  it("re-prices a line when its quantity changes", async () => {
    mocks.update.mockResolvedValueOnce({ success: true, quantity: 2, price: 799, checkoutUrl: "https://c/1" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => {
      await result.current.updateQuantity(ring.id, undefined, 2, ring.variantId);
    });
    expect(result.current.subtotal).toBe(1598);
  });
});
