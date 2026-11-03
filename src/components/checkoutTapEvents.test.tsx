import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

/*
  One tap on the bag's Checkout sent AddPaymentInfo (value 2718, the bag's
  total) and, a millisecond later, InitiateCheckout (from the hand-off), both
  to the browser pixel and the server copy, before the shopper had reached
  Shiprocket or typed any payment detail. Shiprocket's checkout sends its own
  AddPaymentInfo when payment is really reached, under its own event id, so
  Meta counted two for every checkout that got there.
*/
const mocks = vi.hoisted(() => ({ track: vi.fn(), checkout: vi.fn() }));
vi.mock("@/lib/pixel", () => ({ trackPixel: mocks.track, shopifyNumericId: (id?: string) => id?.split("/").pop(), productParams: (p: unknown) => p }));
vi.mock("@/lib/clarity", () => ({ clarityEvent: vi.fn(), setClarityTag: vi.fn() }));
vi.mock("@/hooks/useLiveJewellery", () => ({ useLiveJewellery: () => ({ jewellery: [] }) }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
const line = (id: string, variant: string, name: string, price: number) => ({
  id, variantId: `gid://shopify/ProductVariant/${variant}`, name, price, priceLabel: `₹${price}`, currencyCode: "INR", image: "x.jpg", quantity: 1, lineId: `line-${id}`,
});
const items = [line("prism-riviere-bracelet", "47501788348578", "Prism Rivière Bracelet", 2399), line("brushed-gold-huggies", "47501787594914", "Brushed Gold Huggies", 999)];
vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({
    items, totalItems: 2, subtotal: 3398, addItem: vi.fn(), updateQuantity: vi.fn(), removeItem: vi.fn(),
    isDrawerOpen: true, setDrawerOpen: vi.fn(), checkout: mocks.checkout, checkoutUrl: "https://payments.nairaflore.com/cart/c/x",
    isLoading: false, isSyncing: false, syncCart: vi.fn(), pending: null, addError: null,
  }),
}));

import CartDrawerNext from "./CartDrawerNext";

afterEach(cleanup);

describe("the bag's Checkout tap", () => {
  it("hands off once and reports no payment details nobody has entered", async () => {
    render(<MemoryRouter><CartDrawerNext /></MemoryRouter>);
    const button = document.querySelector<HTMLButtonElement>("[data-checkout]")!;
    expect(button).not.toBeNull();
    await act(async () => {
      fireEvent.click(button);
    });
    // The tap first steps the bag's history entry back (at most 600 ms).
    await vi.waitFor(() => expect(mocks.checkout).toHaveBeenCalledTimes(1), { timeout: 2000 });
    expect(mocks.track.mock.calls.map(([event]) => event)).not.toContain("AddPaymentInfo");
  });
});
