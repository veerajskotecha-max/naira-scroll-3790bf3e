import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "./CartContext";

/*
  The bag opens at the Add tap (owner's choice, 27 Oct 2026) and shows the
  piece on its way in while Shopify adds it. These hold the cart to that:
  the piece is listed until Shopify answers, a refusal is said in the bag,
  and the sync the bag runs as it opens never undoes the add.
*/
const mocks = vi.hoisted(() => ({ add: vi.fn(), create: vi.fn(), fetch: vi.fn(), remove: vi.fn(), track: vi.fn(), toast: vi.fn() }));
vi.mock("@/lib/shopify", () => ({
  addLineToShopifyCart: mocks.add,
  createShopifyCart: mocks.create,
  applyCartDiscountCodes: vi.fn(),
  fetchShopifyCart: mocks.fetch,
  formatCheckoutUrl: (url: string) => url,
  removeLineFromShopifyCart: mocks.remove,
  updateShopifyCartLine: vi.fn(),
  updateCartTrackingAttributes: vi.fn(),
}));
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: vi.fn() }));
vi.mock("@/lib/pixel", () => ({ productParams: (p: unknown) => p, shopifyNumericId: () => "1", trackPixel: mocks.track }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: mocks.toast } }));

const piece = { id: "tubogas-dome-ring", variantId: "gid://shopify/ProductVariant/7", name: "Tubogas Dome Ring", price: 1399, priceLabel: "₹1,399", currencyCode: "INR", image: "t.jpg" };
const held = { ...piece, id: "prism-riviere-bracelet", variantId: "gid://shopify/ProductVariant/1", name: "Prism Rivière Bracelet", quantity: 1, lineId: "line-1" };
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
};

describe("the bag opens at the tap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "cart-1", checkoutUrl: "https://c/1", items: [held] }));
  });

  it("lists the piece while Shopify adds it, then the real line takes its place", async () => {
    const answer = deferred<{ success: boolean; lineId: string; quantity: number; checkoutUrl: string }>();
    mocks.add.mockReturnValueOnce(answer.promise);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    let adding!: Promise<string | null>;
    act(() => {
      result.current.setDrawerOpen(true);
      adding = result.current.addItem(piece);
    });
    expect(result.current.pending?.id).toBe("tubogas-dome-ring");
    expect(result.current.isLoading).toBe(true);
    await act(async () => {
      answer.resolve({ success: true, lineId: "line-2", quantity: 1, checkoutUrl: "https://c/2" });
      await adding;
    });
    expect(result.current.pending).toBeNull();
    expect(result.current.items.map((i) => [i.id, i.lineId])).toEqual([["prism-riviere-bracelet", "line-1"], ["tubogas-dome-ring", "line-2"]]);
    expect(mocks.track).toHaveBeenCalledTimes(1);
  });

  it("says in the open bag that a piece has sold out, with no toast behind it", async () => {
    mocks.add.mockRejectedValueOnce(new Error("The product 'Tubogas Dome Ring' is already sold out."));
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => {
      result.current.setDrawerOpen(true);
      await result.current.addItem(piece);
    });
    expect(result.current.addError).toBe("Tubogas Dome Ring has just sold out.");
    expect(mocks.toast).not.toHaveBeenCalled();
    expect(result.current.pending).toBeNull();
    expect(result.current.items.map((i) => i.id)).toEqual(["prism-riviere-bracelet"]);
    expect(mocks.track).not.toHaveBeenCalled();
  });

  it("adds no row Shopify did not add, and says so", async () => {
    mocks.add.mockResolvedValueOnce({ success: true, lineId: undefined, quantity: undefined, checkoutUrl: "https://c/1" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => {
      result.current.setDrawerOpen(true);
      await result.current.addItem(piece);
    });
    expect(result.current.items.map((i) => i.id)).toEqual(["prism-riviere-bracelet"]);
    expect(result.current.addError).toBe("Tubogas Dome Ring couldn't be added. It may have just sold out.");
  });

  it("toasts the refusal when the bag is not open", async () => {
    mocks.add.mockRejectedValueOnce(new Error("Network error"));
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => {
      await result.current.addItem(piece);
    });
    expect(mocks.toast).toHaveBeenCalledWith("Tubogas Dome Ring couldn't be added. Please try again.");
  });

  it("clears the message when the bag closes", async () => {
    mocks.add.mockRejectedValueOnce(new Error("sold out"));
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => {
      result.current.setDrawerOpen(true);
      await result.current.addItem(piece);
    });
    expect(result.current.addError).not.toBeNull();
    act(() => result.current.setDrawerOpen(false));
    expect(result.current.addError).toBeNull();
  });

  /* The bag syncs as it opens. Run beside an add, it took Shopify's new line
     for a stale one and deleted it, or committed the bag from before it. */
  it("never syncs over an add under way", async () => {
    const answer = deferred<{ success: boolean; lineId: string; quantity: number; checkoutUrl: string }>();
    mocks.add.mockReturnValueOnce(answer.promise);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    let adding!: Promise<string | null>;
    act(() => {
      adding = result.current.addItem(piece);
    });
    await act(async () => {
      await result.current.syncCart();
    });
    expect(mocks.fetch).not.toHaveBeenCalled();
    await act(async () => {
      answer.resolve({ success: true, lineId: "line-2", quantity: 1, checkoutUrl: "https://c/2" });
      await adding;
    });
    expect(result.current.items.map((i) => i.lineId)).toEqual(["line-1", "line-2"]);
  });

  it("leaves the cart alone when an add starts while a sync waits on Shopify", async () => {
    const cart = deferred<unknown>();
    mocks.fetch.mockReturnValueOnce(cart.promise);
    mocks.add.mockResolvedValueOnce({ success: true, lineId: "line-2", quantity: 1, checkoutUrl: "https://c/2" });
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    let syncing!: Promise<void>;
    act(() => {
      syncing = result.current.syncCart();
    });
    await act(async () => {
      await result.current.addItem(piece);
    });
    await act(async () => {
      /* Shopify's answer already holds the new line, unknown to the sync. */
      cart.resolve({ checkoutUrl: "https://c/2", lines: { edges: [{ node: { id: "line-1", quantity: 1 } }, { node: { id: "line-2", quantity: 1 } }] } });
      await syncing;
    });
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(result.current.items.map((i) => i.lineId)).toEqual(["line-1", "line-2"]);
  });
});
