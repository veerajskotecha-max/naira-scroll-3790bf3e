import { useEffect } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "@/contexts/CartContext";
import CartDrawerNext from "./CartDrawerNext";

/*
  Undo in the bag puts a removed piece back at the bag line's price. Once bag
  lines take Shopify's price (audit C02), that is Shopify's price, so the Add
  to cart Meta hears for an Undo follows it: Mesh Band Ring saved at ₹699,
  Shopify at ₹799, Undo told Meta 699 before and 799 after. Every other Add
  to cart keeps the page's price. Shopify is only read here.
*/
const mocks = vi.hoisted(() => ({ create: vi.fn(), fetch: vi.fn(), remove: vi.fn(), track: vi.fn() }));
vi.mock("@/lib/shopify", () => ({
  addLineToShopifyCart: vi.fn(),
  createShopifyCart: mocks.create,
  applyCartDiscountCodes: vi.fn(),
  fetchShopifyCart: mocks.fetch,
  formatCheckoutUrl: (url: string) => url,
  removeLineFromShopifyCart: mocks.remove,
  updateShopifyCartLine: vi.fn(),
  updateCartTrackingAttributes: vi.fn(),
}));
vi.mock("@/lib/fastrr", () => ({ isFastrrEnabled: () => true, primeFastrr: vi.fn(), startFastrrCheckout: vi.fn() }));
vi.mock("@/lib/pixel", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/pixel")>()), trackPixel: mocks.track }));
vi.mock("@/lib/clarity", () => ({ setClarityTag: vi.fn(), clarityEvent: vi.fn() }));
vi.mock("@/hooks/useLiveJewellery", () => ({ useLiveJewellery: () => ({ jewellery: [], isLive: false, isLoading: false }) }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/integrations/supabase/lazy", () => ({ getSupabase: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const VARIANT = "gid://shopify/ProductVariant/50710035529890";
const ring = { id: "mesh-band-ring", variantId: VARIANT, name: "Mesh Band Ring", price: 699, priceLabel: "₹699", currencyCode: "INR", image: "m.jpg", quantity: 1, lineId: "line-1" };
const shopifyLine = (id: string) => ({ id, quantity: 1, merchandise: { id: VARIANT, price: { amount: "799.0" } } });
const addToCarts = () => mocks.track.mock.calls.filter(([event]) => event === "AddToCart").map(([, params]) => params);

const OpenBag = () => {
  const { setDrawerOpen } = useCart();
  useEffect(() => setDrawerOpen(true), [setDrawerOpen]);
  return null;
};

describe("Undo in the bag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "cart-1", checkoutUrl: "https://c/1", items: [ring] }));
    mocks.fetch.mockResolvedValue({ checkoutUrl: "https://c/1", lines: { edges: [{ node: shopifyLine("line-1") }] } });
    mocks.remove.mockResolvedValue({ success: true, checkoutUrl: "https://c/1" });
    mocks.create.mockResolvedValue({ cartId: "cart-2", checkoutUrl: "https://c/2", lineId: "line-2", quantity: 1, price: 799 });
  });
  afterEach(cleanup);

  it("re-adds a removed piece at the bag's price, which is Shopify's", async () => {
    render(
      <MemoryRouter>
        <CartProvider>
          <OpenBag />
          <CartDrawerNext />
        </CartProvider>
      </MemoryRouter>,
    );
    /* The bag syncs with Shopify as it opens. */
    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(1));
    await act(async () => {});

    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: "Remove Mesh Band Ring" })[0]);
    });
    await act(async () => {
      fireEvent.click(await screen.findByRole("button", { name: "Undo" }));
    });

    expect(mocks.create).toHaveBeenCalledWith(VARIANT, 1, undefined);
    expect(addToCarts()).toEqual([
      expect.objectContaining({ value: 799, currency: "INR", contents: [{ id: "50710035529890", quantity: 1, item_price: 799 }] }),
    ]);
  });
});
