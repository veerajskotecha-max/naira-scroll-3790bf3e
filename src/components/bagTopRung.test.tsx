import { useEffect } from "react";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "@/contexts/CartContext";
import CartDrawerNext from "./CartDrawerNext";

/*
  The top of the offer, in the bag. Since 25 Nov 2026 it is three pieces at
  15% (BUY3 in Shopify, "3 or more"): the owner took Buy 4 and its 30% away
  ("Keep buy 2 get 10% and buy 3 get 15 only on the cart on additional
  offers. Remove buy 4 offer"). A bag of four or five must SHOW 15%, to the
  rupee, by the same resolver and rounding as the code Fastrr is handed, and
  must name no fourth step. (This file was bagBuy4.test.tsx while four
  pieces took 30%.) Shopify is only read here.

  Worked by hand: ₹1,499 + ₹2,399 + ₹1,799 + ₹1,299 = ₹6,996; at 15% that is
  ₹5,946.60, so ₹5,947, and ₹1,049 saved. With ₹999 more, ₹7,995 at 15% is
  ₹6,795.75, so ₹6,796, and ₹1,199 saved.
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
/* The rungs of the bag's offer strip that carry a mark, by their piece count. */
const rungs = (mark: string) => [...document.querySelectorAll(`[data-ladder] [data-rung]${mark}`)].map((r) => r.getAttribute("data-rung"));

describe("the bag at the top of the offer: three pieces or more, 15%", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });
  afterEach(cleanup);

  it("shows 15% off at four pieces, to the rupee, and no fourth step", async () => {
    await openBagWith(PRICES.slice(0, 4));
    expect(text("[data-total]")).toBe("₹5,947");
    expect(text("[data-you-save]")).toBe("You save ₹1,049 · 15% off 4 pieces");
    const lines = [...document.querySelectorAll("[data-line-price]")].map((p) => p.textContent);
    expect(lines).toHaveLength(4);
    lines.forEach((line) => expect(line).toMatch(/15% off$/));
    // Each line's offer price, from the bag's one rounded total: they add up to it.
    const totals = [...document.querySelectorAll("[data-line-total]")].map((t) => Number(t.textContent?.replace(/[₹,]/g, "")));
    expect(totals.reduce((a, b) => a + b, 0)).toBe(5947);
    // The bag sits on the top rung, Buy 3; the one under it is passed, and the line is full.
    expect(rungs("")).toEqual(["2", "3"]);
    expect(rungs("[data-current]")).toEqual(["3"]);
    expect(rungs("[data-reached]")).toEqual(["2", "3"]);
    expect((document.querySelector('[data-ladder] [role="progressbar"] > span') as HTMLElement).style.width).toBe("100%");
    // Nothing in the bag still names Buy 4 or a rate it no longer gives.
    expect(document.body.textContent).not.toMatch(/Buy 4|30%|20%|fourth piece/i);
    // The strip states the offer and nothing else: no line that a sale is live today.
    expect(document.querySelector("[data-ladder] > p")).toBeNull();
    expect(text("[data-ladder]")).not.toMatch(/sitewide sale|live today|up to/i);
  });

  it("keeps 15% at five pieces", async () => {
    await openBagWith(PRICES);
    expect(text("[data-total]")).toBe("₹6,796");
    expect(text("[data-you-save]")).toBe("You save ₹1,199 · 15% off 5 pieces");
    expect(rungs("[data-current]")).toEqual(["3"]);
  });

  /* Two ₹1,499 pieces on one line, with ₹2,399 and ₹1,199: ₹6,596 at 15% is
     ₹5,606.60, so ₹5,607. The bag's leftover rupee lands on the pair (its
     exact 2,548.30 has the largest fraction; the others are 2,039.15 and
     1,019.15), so the pair's line is ₹2,549. Halving that line would read
     ₹1,275 each (1,274.50, rounded up) while the product page's Buy 3 column
     says ₹1,274 and Shopify charges ₹1,274.15 a piece. Each is one piece at
     15%, rounded on its own. */
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
    expect(text("[data-total]")).toBe("₹5,607");
    const first = document.querySelector("[data-line]") as HTMLElement;
    expect(first.querySelector("[data-line-total]")?.textContent).toBe("₹2,549");
    expect(first.querySelector("[data-line-price]")?.textContent).toBe("was ₹1,499₹1,274 each15% off");
    // The lines still add up to the bag's total.
    const totals = [...document.querySelectorAll("[data-line-total]")].map((t) => Number(t.textContent?.replace(/[₹,]/g, "")));
    expect(totals.reduce((a, b) => a + b, 0)).toBe(5607);
  });

  /* Three pieces reach the top: ₹1,499 + ₹2,399 + ₹1,799 = ₹5,697, at 15%
     ₹4,842.45, so ₹4,842 and ₹855 saved. The line is full; there is no
     further step to show. */
  it("shows 15% at three pieces, the top of the offer", async () => {
    await openBagWith(PRICES.slice(0, 3));
    expect(text("[data-total]")).toBe("₹4,842");
    expect(text("[data-you-save]")).toBe("You save ₹855 · 15% off 3 pieces");
    expect(rungs("[data-current]")).toEqual(["3"]);
    expect(rungs("[data-reached]")).toEqual(["2", "3"]);
    expect((document.querySelector('[data-ladder] [role="progressbar"] > span') as HTMLElement).style.width).toBe("100%");
  });

  /* Two pieces sit on the first step: ₹1,499 + ₹2,399 = ₹3,898, at 10%
     ₹3,508.20, so ₹3,508 and ₹390 saved, with Buy 3 still ahead. */
  it("shows 10% at two pieces, with Buy 3 still ahead", async () => {
    await openBagWith(PRICES.slice(0, 2));
    expect(text("[data-total]")).toBe("₹3,508");
    expect(text("[data-you-save]")).toBe("You save ₹390 · 10% off 2 pieces");
    expect(rungs("[data-current]")).toEqual(["2"]);
    expect(rungs("[data-reached]")).toEqual(["2"]);
    expect((document.querySelector('[data-ladder] [role="progressbar"] > span') as HTMLElement).style.width).toBe("25%");
  });
});
