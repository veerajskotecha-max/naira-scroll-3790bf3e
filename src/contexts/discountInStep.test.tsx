import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "./CartContext";

/*
  The bag's rung code goes on the Shopify cart at checkout. Removing a piece
  left the old rung's code there, and a one-piece checkout never cleared it:
  live, BUY2 stayed on a one-piece cart ({BUY2, applicable: false}).
*/
const mocks = vi.hoisted(() => ({ codes: vi.fn(), start: vi.fn() }));
vi.mock("@/lib/shopify", () => ({
  addLineToShopifyCart: vi.fn(),
  createShopifyCart: vi.fn(),
  applyCartDiscountCodes: mocks.codes,
  fetchShopifyCart: vi.fn(),
  formatCheckoutUrl: (url: string) => url,
  removeLineFromShopifyCart: vi.fn(),
  updateShopifyCartLine: vi.fn(),
  updateCartTrackingAttributes: vi.fn(),
}));
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: mocks.start }));
vi.mock("@/lib/pixel", () => ({ productParams: (p: unknown) => p, shopifyNumericId: () => "1", trackPixel: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const line = (id: string) => ({ id, variantId: `v-${id}`, name: id, price: 1499, priceLabel: "₹1,499", currencyCode: "INR", image: "x.webp", quantity: 1, lineId: `l-${id}` });
const bag = (...ids: string[]) =>
  localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "c1", checkoutUrl: "https://example.com/checkout", items: ids.map(line) }));

describe("the Shopify cart's discount code follows the rung", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.codes.mockResolvedValue({ applied: true });
    mocks.start.mockResolvedValue(true);
  });

  it("clears the cart's code when one piece earns none", async () => {
    bag("prism");
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { result.current.checkout(); });
    expect(mocks.codes).toHaveBeenCalledWith("c1", []);
    // Fastrr still gets no coupon, as before.
    expect(mocks.start.mock.calls[0][1].couponCode).toBeNull();
  });

  it("still sets the rung's code at two pieces", async () => {
    bag("prism", "hoops");
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { result.current.checkout(); });
    expect(mocks.codes).toHaveBeenCalledWith("c1", ["BUY2"]);
    expect(mocks.codes).toHaveBeenCalledTimes(1);
  });

  it("never holds checkout on the clearing call", async () => {
    bag("prism");
    mocks.codes.mockReturnValueOnce(new Promise(() => {}));
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { result.current.checkout(); });
    expect(mocks.start).toHaveBeenCalledTimes(1);
  });
});
