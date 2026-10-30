import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "@/contexts/CartContext";

/* From the review of 2128022 (scratchpad fix-oct30/final/a1/repro): a bag line
   Shopify answers "does not exist" for. Before 2128022 the cart layer read that
   as a lost cart and the whole bag was cleared; with 2128022 alone the removal
   threw, the shopper got "Could not remove this item." and the line stayed in
   the bag (and in what checkout was handed) until a later sync. The line is
   already gone, which is what the shopper asked for. Real src/lib/shopify.ts,
   only fetch stubbed. */
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: vi.fn() }));
vi.mock("@/lib/pixel", () => ({ productParams: (p: unknown) => p, shopifyNumericId: () => "1", trackPixel: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn() }));
const toastError = vi.hoisted(() => vi.fn());
vi.mock("sonner", () => ({ toast: { error: toastError } }));

const line = (id: string, lineId: string) => ({ id, variantId: `gid://shopify/ProductVariant/${id}`, name: id, price: 999, priceLabel: "₹999", currencyCode: "INR", image: "x.jpg", quantity: 1, lineId });
const answer = (userErrors: Array<{ message: string }>) =>
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ data: { cartLinesRemove: { cart: null, userErrors } } }))));

describe("removing a line Shopify no longer has", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "gid://shopify/Cart/c1", checkoutUrl: "https://c/1", items: [line("a", "gid://shopify/CartLine/stale"), line("b", "gid://shopify/CartLine/ok")] }));
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.unstubAllGlobals());

  it("drops that line with no error, and keeps the rest of the bag and its cart", async () => {
    answer([{ message: "The merchandise line with id gid://shopify/CartLine/stale does not exist." }]);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.removeItem("a", undefined, "gid://shopify/ProductVariant/a"); });
    expect(result.current.items.map((i) => i.id)).toEqual(["b"]);
    expect(toastError).not.toHaveBeenCalled();
    // Not a lost cart: the cart the other piece is on is kept.
    expect(JSON.parse(localStorage.getItem("naira-shopify-cart")!).cartId).toBe("gid://shopify/Cart/c1");
  });

  it("still clears the bag when the cart itself is gone", async () => {
    answer([{ message: "The specified cart does not exist." }]);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.removeItem("a", undefined, "gid://shopify/ProductVariant/a"); });
    expect(result.current.items).toEqual([]);
  });

  it("still says so when Shopify refuses the removal for another reason", async () => {
    answer([{ message: "Something else went wrong." }]);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { await result.current.removeItem("a", undefined, "gid://shopify/ProductVariant/a"); });
    expect(result.current.items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(toastError).toHaveBeenCalledWith("Could not remove this item.");
  });
});
