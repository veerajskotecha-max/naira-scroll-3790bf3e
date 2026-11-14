import { useEffect } from "react";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "@/contexts/CartContext";
import CartDrawerNext from "./CartDrawerNext";

/*
  The owner's fourth rung (7 Nov 2026): four pieces take 30% (BUY4 in
  Shopify, BUY3's twin at 30% and 4+). The bag must SHOW it, to the rupee, by
  the same resolver and rounding as the code Fastrr is handed: before BUY4 a
  four-piece bag still read 20% ("You save … · 20% for 4 pieces") while the
  ladder topped out at three. Shopify is only read here.

  Worked by hand: ₹1,499 + ₹2,399 + ₹1,799 + ₹1,299 = ₹6,996; at 30% that is
  ₹4,897.20, so ₹4,897, and ₹2,099 saved. With ₹999 more, ₹7,995 at 30% is
  ₹5,596.50, so ₹5,597 (the bag rounds half up), and ₹2,398 saved.
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

const PRICES = [1499, 2399, 1799, 1299, 999];
const item = (price: number, i: number) => ({
  id: `piece-${i}`,
  variantId: `gid://shopify/ProductVariant/${1000 + i}`,
  name: `Piece ${i}`,
  price,
  priceLabel: `₹${price.toLocaleString("en-IN")}`,
  currencyCode: "INR",
  image: "p.jpg",
  quantity: 1,
  lineId: `line-${i}`,
});
const shopifyLine = (price: number, i: number) => ({
  id: `line-${i}`,
  quantity: 1,
  merchandise: { id: `gid://shopify/ProductVariant/${1000 + i}`, price: { amount: `${price}.0` } },
});

const OpenBag = () => {
  const { setDrawerOpen } = useCart();
  useEffect(() => setDrawerOpen(true), [setDrawerOpen]);
  return null;
};

const openBagWith = async (prices: number[]) => {
  localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "cart-1", checkoutUrl: "https://c/1", items: prices.map(item) }));
  mocks.fetch.mockResolvedValue({ checkoutUrl: "https://c/1", lines: { edges: prices.map((p, i) => ({ node: shopifyLine(p, i) })) } });
  const view = render(
    <MemoryRouter>
      <CartProvider>
        <OpenBag />
        <CartDrawerNext />
      </CartProvider>
    </MemoryRouter>,
  );
  await waitFor(() => expect(mocks.fetch).toHaveBeenCalled());
  await act(async () => {});
  return view;
};

const text = (selector: string) => document.querySelector(selector)?.textContent ?? "";

describe("the bag at four and five pieces: Buy 4, 30%", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });
  afterEach(cleanup);

  it("shows 30% off at four pieces, to the rupee", async () => {
    await openBagWith(PRICES.slice(0, 4));
    expect(text("[data-total]")).toBe("₹4,897");
    expect(text("[data-you-save]")).toBe("You save ₹2,099 · 30% for 4 pieces");
    const lines = [...document.querySelectorAll("[data-line-price]")].map((p) => p.textContent);
    expect(lines).toHaveLength(4);
    lines.forEach((line) => expect(line).toMatch(/30% off$/));
    // Each line's offer price, from the bag's one rounded total: they add up to it.
    const totals = [...document.querySelectorAll("[data-line-total]")].map((t) => Number(t.textContent?.replace(/[₹,]/g, "")));
    expect(totals.reduce((a, b) => a + b, 0)).toBe(4897);
    // Every rung is reached, and the track is full.
    expect([...document.querySelectorAll("[data-rung-mark]")].map((m) => m.className.includes("bg-nf-ink"))).toEqual([true, true, true]);
    expect((document.querySelector('[data-ladder] [role="progressbar"] > span') as HTMLElement).style.width).toBe("100%");
    expect(text("[data-ladder] > p")).toContain("up to 30% off");
  });

  it("keeps 30% at five pieces", async () => {
    await openBagWith(PRICES);
    expect(text("[data-total]")).toBe("₹5,597");
    expect(text("[data-you-save]")).toBe("You save ₹2,398 · 30% for 5 pieces");
  });

  /* Two ₹1,499 pieces on one line, with ₹2,399 and ₹1,199: ₹6,596 at 30% is
     ₹4,617.20, so ₹4,617. The bag's leftover rupee lands on the pair (its
     exact 2,098.60 has the largest fraction), so the pair's line is ₹2,099,
     and "each" read ₹1,050 (2,099 / 2 = 1,049.50, rounded up) while the
     product page's Buy 4 column says ₹1,049 and Shopify charges ₹1,049.30 a
     piece. Each is now one piece at 30%, rounded on its own. */
  it("prices each piece of a pair as the product page does", async () => {
    const pair = [{ ...item(1499, 0), quantity: 2 }, item(2399, 1), item(1199, 2)];
    localStorage.setItem("naira-shopify-cart", JSON.stringify({ cartId: "cart-1", checkoutUrl: "https://c/1", items: pair }));
    mocks.fetch.mockResolvedValue({
      checkoutUrl: "https://c/1",
      lines: { edges: pair.map((p, i) => ({ node: { ...shopifyLine(p.price, i), quantity: p.quantity } })) },
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
    expect(text("[data-total]")).toBe("₹4,617");
    const first = document.querySelector("[data-line]") as HTMLElement;
    expect(first.querySelector("[data-line-total]")?.textContent).toBe("₹2,099");
    expect(first.querySelector("[data-line-price]")?.textContent).toBe("₹1,499₹1,049 each30% off");
    // The lines still add up to the bag's total.
    const totals = [...document.querySelectorAll("[data-line-total]")].map((t) => Number(t.textContent?.replace(/[₹,]/g, "")));
    expect(totals.reduce((a, b) => a + b, 0)).toBe(4617);
  });

  /* Three pieces are 20%, and the fourth ring is still open. */
  it("shows 20% at three pieces, with Buy 4 still ahead", async () => {
    await openBagWith(PRICES.slice(0, 3));
    expect(text("[data-total]")).toBe("₹4,558");
    expect(text("[data-you-save]")).toBe("You save ₹1,139 · 20% for 3 pieces");
    expect([...document.querySelectorAll("[data-rung-mark]")].map((m) => m.className.includes("bg-nf-ink"))).toEqual([true, true, false]);
    expect((document.querySelector('[data-ladder] [role="progressbar"] > span') as HTMLElement).style.width).toBe("50%");
  });
});

/* The bag states the COD fee in rupees before the payment page: Fastrr adds
   5% of the total to a cash-on-delivery order, and the product page says
   only "COD available" because the bag carries the fee. The line had gone
   from this bag, so a COD shopper met the 5% first at payment. */
describe("the bag states the COD fee", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });
  afterEach(cleanup);

  it("prices COD at 5% of the discounted total, none online", async () => {
    await openBagWith(PRICES.slice(0, 4));
    expect(text("[data-cod-fee]")).toBe("Cash on delivery adds ₹245 · none if paid online.");
  });

  it("on one piece, 5% of its price", async () => {
    await openBagWith([2399]);
    expect(text("[data-cod-fee]")).toBe("Cash on delivery adds ₹120 · none if paid online.");
  });
});
