import { act, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider } from "./CartContext";
import { WishlistProvider, useWishlist } from "./WishlistContext";
import { readStaleReelCache } from "@/hooks/useReels";

/*
  With browser storage blocked (Chrome's "Block all cookies", some locked-down
  in-app WebViews) even reading window.localStorage throws a SecurityError.
  The cart and wishlist providers wrote to it from effects that sit above every
  error boundary, so the whole app unmounted: the pre-built page showed for a
  second, then the screen went white. Product pages then fell to the error
  panel on the reels cache, whose `typeof sessionStorage` check sat outside its
  try.
*/
vi.mock("@/lib/shopify", () => ({
  addLineToShopifyCart: vi.fn(),
  createShopifyCart: vi.fn(),
  applyCartDiscountCodes: vi.fn(),
  fetchShopifyCart: vi.fn(() => Promise.resolve(null)),
  formatCheckoutUrl: (url: string) => url,
  removeLineFromShopifyCart: vi.fn(),
  updateShopifyCartLine: vi.fn(),
  updateCartTrackingAttributes: vi.fn(),
}));
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: vi.fn() }));
vi.mock("@/lib/pixel", () => ({ productParams: (p: unknown) => p, shopifyNumericId: () => "1", trackPixel: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn() }));

const denied = () => {
  throw new DOMException("Failed to read the 'localStorage' property from 'Window': Access is denied for this document.", "SecurityError");
};
const block = (name: "localStorage" | "sessionStorage") =>
  Object.defineProperty(window, name, { get: denied, configurable: true });

describe("with browser storage blocked", () => {
  const saved = {
    localStorage: Object.getOwnPropertyDescriptor(window, "localStorage")!,
    sessionStorage: Object.getOwnPropertyDescriptor(window, "sessionStorage")!,
  };
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    block("localStorage");
    block("sessionStorage");
  });
  afterEach(() => {
    Object.defineProperty(window, "localStorage", saved.localStorage);
    Object.defineProperty(window, "sessionStorage", saved.sessionStorage);
    vi.restoreAllMocks();
  });

  it("still renders the shop under the cart and wishlist", () => {
    render(
      <CartProvider>
        <WishlistProvider>
          <h1>Demi-Fine Jewellery</h1>
        </WishlistProvider>
      </CartProvider>,
    );
    expect(screen.getByRole("heading", { name: "Demi-Fine Jewellery" })).toBeTruthy();
  });

  it("keeps the wishlist working for the visit", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper: WishlistProvider });
    act(() => result.current.addItem({ id: "prism-riviere-bracelet", name: "Prism Rivière Bracelet" } as never));
    expect(result.current.items).toHaveLength(1);
  });

  it("reads the reels cache as empty instead of throwing", () => {
    expect(() => readStaleReelCache()).not.toThrow();
    expect(readStaleReelCache()).toBeUndefined();
  });
});
