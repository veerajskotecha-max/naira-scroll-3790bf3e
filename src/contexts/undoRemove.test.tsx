import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "./CartContext";

/*
  The bag's Undo re-adds a piece the moment it is tapped. Tapped before
  Shopify had answered the removal, it updated the line Shopify was deleting,
  Shopify refused it, and the whole bag was cleared as "timed out".
*/
const mocks = vi.hoisted(() => ({ add: vi.fn(), update: vi.fn(), remove: vi.fn(), track: vi.fn() }));
vi.mock("@/lib/shopify", () => ({
  addLineToShopifyCart: mocks.add,
  createShopifyCart: vi.fn(),
  applyCartDiscountCodes: vi.fn(),
  fetchShopifyCart: vi.fn(),
  formatCheckoutUrl: (url: string) => url,
  removeLineFromShopifyCart: mocks.remove,
  updateShopifyCartLine: mocks.update,
  updateCartTrackingAttributes: vi.fn(),
}));
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: vi.fn() }));
vi.mock("@/lib/pixel", () => ({ productParams: (p: unknown) => p, shopifyNumericId: () => "1", trackPixel: mocks.track }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const piece = { id: "woven-gold-hoops", variantId: "gid://shopify/ProductVariant/2", name: "Woven Gold Hoops", price: 1299, priceLabel: "₹1,299", currencyCode: "INR", image: "w.jpg" };
const kept = { ...piece, id: "prism-riviere-bracelet", variantId: "gid://shopify/ProductVariant/1", name: "Prism Rivière Bracelet", quantity: 1, lineId: "line-1" };
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
};

describe("Undo while the removal is still with Shopify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "cart-1", checkoutUrl: "https://c/1", items: [kept, { ...piece, quantity: 1, lineId: "line-2" }] }));
  });

  it("waits for the removal, then adds the piece back as a new line", async () => {
    const removal = deferred<{ success: boolean; checkoutUrl: string }>();
    mocks.remove.mockReturnValueOnce(removal.promise);
    mocks.add.mockResolvedValueOnce({ success: true, lineId: "line-3", quantity: 1, checkoutUrl: "https://c/1" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    let removing!: Promise<void>;
    let undoing!: Promise<string | null>;
    act(() => {
      removing = result.current.removeItem(piece.id, undefined, piece.variantId);
      undoing = result.current.addItem(piece);
    });
    // Nothing reaches Shopify for the Undo until the removal has answered.
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.add).not.toHaveBeenCalled();
    await act(async () => {
      removal.resolve({ success: true, checkoutUrl: "https://c/1" });
      await removing;
      await undoing;
    });
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.add).toHaveBeenCalledTimes(1);
    expect(result.current.items.map((i) => [i.id, i.lineId])).toEqual([["prism-riviere-bracelet", "line-1"], ["woven-gold-hoops", "line-3"]]);
    expect(result.current.isLoading).toBe(false);
  });

  it("keeps the bag busy until the re-added piece lands", async () => {
    const removal = deferred<{ success: boolean; checkoutUrl: string }>();
    const readd = deferred<{ success: boolean; lineId: string; quantity: number; checkoutUrl: string }>();
    mocks.remove.mockReturnValueOnce(removal.promise);
    mocks.add.mockReturnValueOnce(readd.promise);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    let undoing!: Promise<string | null>;
    act(() => {
      result.current.removeItem(piece.id, undefined, piece.variantId);
      undoing = result.current.addItem(piece);
    });
    await act(async () => {
      removal.resolve({ success: true, checkoutUrl: "https://c/1" });
    });
    // Checkout reads this: the bag must not hand off before the Undo lands.
    expect(result.current.isLoading).toBe(true);
    await act(async () => {
      readd.resolve({ success: true, lineId: "line-3", quantity: 1, checkoutUrl: "https://c/1" });
      await undoing;
    });
    expect(result.current.isLoading).toBe(false);
  });
});
