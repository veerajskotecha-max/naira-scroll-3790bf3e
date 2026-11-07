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
    // Both rungs are reached, and the track is full.
    expect([...document.querySelectorAll("[data-rung-mark]")].map((m) => m.className.includes("bg-nf-ink"))).toEqual([true, true]);
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

  /* Three pieces are 20%, the first ring (Buy 3, a quarter across) is
     filled, and the Buy 4 ring is still open. 1,499 + 2,399 + 1,799 = 5,697;
     at 20% 4,557.60, so ₹4,558, and ₹1,139 saved. */
  it("shows 20% at three pieces, with Buy 4 still ahead", async () => {
    await openBagWith(PRICES.slice(0, 3));
    expect(text("[data-total]")).toBe("₹4,558");
    expect(text("[data-you-save]")).toBe("You save ₹1,139 · 20% for 3 pieces");
    expect(document.querySelector("[data-next-rung]")).toBeNull();
    expect([...document.querySelectorAll("[data-rung-mark]")].map((m) => m.className.includes("bg-nf-ink"))).toEqual([true, false]);
    expect((document.querySelector('[data-ladder] [role="progressbar"] > span') as HTMLElement).style.width).toBe("25%");
  });
});

/*
  The owner, 7 Nov 2026: "remove buy 2 10% from cart and offer too, we need
  only buy 3 20% off and buy 4 30% off". A bag of one or two pieces takes no
  rung: full price, no "You save", no line struck through, and nothing for
  Fastrr. Where the saving would be, the bag says what the third piece does.
  A typed NAIRA10 or FRIENDSANDFAMILY still discounts one or two pieces; a
  BUY2 left in storage from an earlier visit is no code at all.

  Worked by hand: ₹1,499 + ₹2,399 = ₹3,898. With NAIRA10, 3,898 at 10% is
  3,508.20, so ₹3,508 and ₹390 saved; the lines at 10% are 1,349.10 and
  2,159.10, so ₹1,349 and ₹2,159, which add up to it. With FRIENDSANDFAMILY,
  3,898 at 20% is 3,118.40, so ₹3,118 and ₹780 saved.
*/
const rings = () => [...document.querySelectorAll("[data-rung-mark]")].map((m) => m.className.includes("bg-nf-ink"));
const linePrices = () => [...document.querySelectorAll("[data-line-price]")].map((p) => p.textContent);
const lineTotals = () => [...document.querySelectorAll("[data-line-total]")].map((t) => t.textContent);

describe("the bag at one and two pieces: no rung yet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });
  afterEach(cleanup);

  it("shows two pieces at full price and says what a third piece does", async () => {
    await openBagWith(PRICES.slice(0, 2));
    expect(text("[data-total]")).toBe("₹3,898");
    expect(document.querySelector("[data-you-save]")).toBeNull();
    expect(text("[data-next-rung]")).toBe("A third piece takes 20% off your bag");
    expect(linePrices()).toEqual(["₹1,499", "₹2,399"]);
    expect(lineTotals()).toEqual(["₹1,499", "₹2,399"]);
    expect(document.querySelectorAll("[data-line-price] del")).toHaveLength(0);
    // Neither ring is filled; the track is two thirds of the way to Buy 3.
    expect(rings()).toEqual([false, false]);
    expect(parseFloat((document.querySelector('[data-ladder] [role="progressbar"] > span') as HTMLElement).style.width).toFixed(3)).toBe("16.667");
    expect([...document.querySelectorAll("[data-rung-label]")].map((l) => l.textContent)).toEqual(["Buy 320% off", "Buy 430% off"]);
    // Nothing anywhere in the bag still offers Buy 2 or its 10%.
    expect(document.body.textContent).not.toMatch(/Buy 2|BUY2|10%/);
  });

  it("shows one piece at full price and points at the third piece", async () => {
    await openBagWith(PRICES.slice(0, 1));
    expect(text("[data-total]")).toBe("₹1,499");
    expect(document.querySelector("[data-you-save]")).toBeNull();
    expect(text("[data-next-rung]")).toBe("Your third piece takes 20% off your bag");
    expect(rings()).toEqual([false, false]);
  });

  it("takes a typed NAIRA10's 10% off two pieces, as the code's saving", async () => {
    localStorage.setItem("naira-promo-code", "NAIRA10");
    await openBagWith(PRICES.slice(0, 2));
    expect(text("[data-total]")).toBe("₹3,508");
    expect(text("[data-you-save]")).toBe("You save ₹390 · 10% with your code");
    expect(document.querySelector("[data-next-rung]")).toBeNull();
    expect(linePrices()).toEqual(["₹1,499₹1,34910% off", "₹2,399₹2,15910% off"]);
    expect(lineTotals()).toEqual(["₹1,349", "₹2,159"]);
  });

  it("takes a typed FRIENDSANDFAMILY's 20% off two pieces", async () => {
    localStorage.setItem("naira-promo-code", "FRIENDSANDFAMILY");
    await openBagWith(PRICES.slice(0, 2));
    expect(text("[data-total]")).toBe("₹3,118");
    expect(text("[data-you-save]")).toBe("You save ₹780 · 20% with your code");
  });

  it("gives a stored BUY2 nothing on two pieces, and BUY3 on three", async () => {
    localStorage.setItem("naira-promo-code", "BUY2");
    const view = await openBagWith(PRICES.slice(0, 2));
    expect(text("[data-total]")).toBe("₹3,898");
    expect(document.querySelector("[data-you-save]")).toBeNull();
    expect(text("[data-next-rung]")).toBe("A third piece takes 20% off your bag");
    view.unmount();
    await openBagWith(PRICES.slice(0, 3));
    expect(text("[data-total]")).toBe("₹4,558");
    expect(text("[data-you-save]")).toBe("You save ₹1,139 · 20% for 3 pieces");
  });
});
