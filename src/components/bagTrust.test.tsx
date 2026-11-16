import { useEffect } from "react";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "@/contexts/CartContext";
import CartDrawerNext from "./CartDrawerNext";

/*
  The trust block in the real bag (the owner's ask, 16 Nov 2026, option B): the
  star line and the ways to pay sit in the foot, directly above Checkout, and
  the button keeps its GPay, PhonePe and Paytm discs. Shopify is only read here.
*/
const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock("@/lib/shopify", () => ({
  addLineToShopifyCart: vi.fn(),
  createShopifyCart: vi.fn(),
  applyCartDiscountCodes: vi.fn(),
  fetchShopifyCart: mocks.fetch,
  formatCheckoutUrl: (url: string) => url,
  removeLineFromShopifyCart: vi.fn(),
  updateShopifyCartLine: vi.fn(),
  updateCartTrackingAttributes: vi.fn(),
}));
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: vi.fn() }));
vi.mock("@/lib/pixel", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/pixel")>()), trackPixel: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn(), clarityEvent: vi.fn() }));
vi.mock("@/hooks/useLiveJewellery", () => ({ useLiveJewellery: () => ({ jewellery: [], isLive: false, isLoading: false }) }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/integrations/supabase/lazy", () => ({ getSupabase: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const OpenBag = () => {
  const { setDrawerOpen } = useCart();
  useEffect(() => setDrawerOpen(true), [setDrawerOpen]);
  return null;
};

const openBag = async () => {
  localStorage.setItem(
    "naira-shopify-cart",
    JSON.stringify({
      cartId: "cart-1",
      checkoutUrl: "https://c/1",
      items: [{ id: "piece-0", variantId: "gid://shopify/ProductVariant/1000", name: "Piece 0", price: 1499, priceLabel: "₹1,499", currencyCode: "INR", image: "p.jpg", quantity: 1, lineId: "line-0" }],
    }),
  );
  mocks.fetch.mockResolvedValue({
    checkoutUrl: "https://c/1",
    lines: { edges: [{ node: { id: "line-0", quantity: 1, merchandise: { id: "gid://shopify/ProductVariant/1000", price: { amount: "1499.0" } } } }] },
  });
  render(
    <MemoryRouter>
      <CartProvider>
        <OpenBag />
        <CartDrawerNext />
      </CartProvider>
    </MemoryRouter>,
  );
  await waitFor(() => expect(mocks.fetch).toHaveBeenCalled());
  await act(async () => {});
};

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("the bag's trust block (option B)", () => {
  it("sits in the foot, directly above Checkout", async () => {
    await openBag();
    const block = document.querySelector("[data-bag-foot] [data-bag-trust]") as HTMLElement;
    expect(block).toBeTruthy();
    expect(block.nextElementSibling).toBe(document.querySelector("[data-checkout]"));
  });

  /* UPI stays where the owner put it: on the button, the only place the
     three discs are drawn. */
  it("leaves the UPI discs on the Checkout button, and only there", async () => {
    await openBag();
    expect(document.querySelectorAll("[data-upi-badges]")).toHaveLength(1);
    expect(document.querySelector("[data-checkout] [data-upi-badges]")).toBeTruthy();
  });
});
