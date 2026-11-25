import { useEffect } from "react";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "@/contexts/CartContext";
import CartDrawerNext from "./CartDrawerNext";

/*
  The trust block in the real bag (the owner's ask, 16 Nov 2026): the rating
  line and the ways to pay sit in the foot, directly above Checkout. In the
  clean redesign the ways to pay are words ("UPI · Cards · Cash on delivery")
  and the button is its label alone: the GPay, PhonePe and Paytm discs were
  the last foreign colours in the bag. Shopify is only read here.
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

describe("the bag's trust block", () => {
  it("sits in the foot, directly above Checkout", async () => {
    await openBag();
    const block = document.querySelector("[data-bag-foot] [data-bag-trust]") as HTMLElement;
    expect(block).toBeTruthy();
    expect(block.nextElementSibling).toBe(document.querySelector("[data-checkout]"));
  });

  /* UPI is said in the line above the button, first of the three ways to
     pay; no payment disc or logo is drawn anywhere in the bag. */
  /* 25 Nov 2026, the renewed layer: the ways to pay are their own marks
     again, once, in the trust block above the button; the button itself
     stays a plain word. */
  it("shows the ways to pay as marks above the button, and none on the button", async () => {
    await openBag();
    expect(document.querySelectorAll("[data-upi-badges]")).toHaveLength(1);
    const pay = document.querySelector("[data-bag-trust] [data-pay-line]") as HTMLElement;
    expect(pay.textContent).toBe("Pay by UPI, Visa, Mastercard or cash on delivery.UPICardsCash on delivery");
    expect(pay.querySelector("[data-mark='visa']")).not.toBeNull();
    expect(pay.querySelector("[data-mark='mastercard']")).not.toBeNull();
    const button = document.querySelector("[data-checkout]") as HTMLElement;
    expect(button.textContent).toBe("Checkout");
    expect(button.querySelector("svg, img")).toBeNull();
  });
});
