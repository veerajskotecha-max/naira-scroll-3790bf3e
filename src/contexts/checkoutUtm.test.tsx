import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/* The Shopify checkout the hand-off falls back to (Fastrr's fallbackUrl, and
   the page opened when Fastrr cannot start) never carried the campaign. */
const mocks = vi.hoisted(() => ({ start: vi.fn() }));
vi.mock("@/lib/shopify", () => ({
  addLineToShopifyCart: vi.fn(),
  createShopifyCart: vi.fn(),
  applyCartDiscountCodes: vi.fn(async () => ({ applied: true })),
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

const piece = { id: "prism", variantId: "v-prism", name: "Prism", price: 1499, priceLabel: "₹1,499", currencyCode: "INR", image: "x.webp", quantity: 1, lineId: "l1" };

describe("the Shopify checkout hand-off carries the landing campaign", () => {
  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("puts the session's utm_* on the checkout address", async () => {
    window.history.replaceState(null, "", "/jewellery?utm_source=facebook&utm_medium=paid&utm_campaign=audit_camp");
    vi.resetModules();
    const { CartProvider, useCart } = await import("./CartContext");
    window.history.pushState(null, "", "/jewellery/prism-riviere-bracelet");
    localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "c1", checkoutUrl: "https://payments.nairaflore.com/checkouts/cn/T?key=K&channel=online_store", items: [piece] }));
    mocks.start.mockResolvedValueOnce(true);
    const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
    await act(async () => { result.current.checkout(); });
    const fallback = new URL(mocks.start.mock.calls[0][1].fallbackUrl);
    expect(fallback.searchParams.get("utm_source")).toBe("facebook");
    expect(fallback.searchParams.get("utm_medium")).toBe("paid");
    expect(fallback.searchParams.get("utm_campaign")).toBe("audit_camp");
    expect(fallback.searchParams.get("key")).toBe("K");
  });
});
