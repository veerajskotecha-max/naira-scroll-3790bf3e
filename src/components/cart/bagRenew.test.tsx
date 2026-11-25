import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JewelPiece } from "@/data/jewellery";

/*
  What the renewed layer adds to the bag (25 Nov 2026): one piece that goes
  with it, one tap away, priced by what it does to this bag; and the total
  before the offer, struck, beside the one that is charged. The cart is a
  stand-in (nothing reaches Shopify); the rupees are the bag's own resolver's.
*/
type Line = { id: string; variantId: string; name: string; price: number; priceLabel: string; currencyCode: string; image: string; quantity: number; lineId: string | null };
const line = (id: string, name: string, price: number): Line => ({
  id, variantId: `gid://shopify/ProductVariant/${id}`, name, price, priceLabel: `₹${price.toLocaleString("en-IN")}`, currencyCode: "INR", image: `${id}.jpg`, quantity: 1, lineId: `line-${id}`,
});
const gold = "18k gold plated · surgical stainless steel";
const silver = "Rhodium coated · surgical stainless steel";
const piece = (handle: string, name: string, category: JewelPiece["category"], price: number, materials: string): JewelPiece => ({
  handle, name, category, sku: "", number: "1", price, priceLabel: `₹${price.toLocaleString("en-IN")}`, variantId: `gid://shopify/ProductVariant/${handle}`,
  availableForSale: true, image: `https://cdn.shopify.com/${handle}.jpg`, blurb: "", materials,
});
const catalogue = [
  piece("prism-riviere-bracelet", "Prism Rivière Bracelet", "Bracelets", 2399, silver),
  piece("woven-gold-hoops", "Woven Gold Hoops", "Earrings", 1049, gold),
  piece("toggle-link-chain", "Toggle Link Chain", "Necklaces", 999, gold),
];
const hoops = line("woven-gold-hoops", "Woven Gold Hoops", 1049);
const bracelet = line("prism-riviere-bracelet", "Prism Rivière Bracelet", 2399);

const cart = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  calls: { addItem: vi.fn(async () => "line"), updateQuantity: vi.fn(), removeItem: vi.fn(), setDrawerOpen: vi.fn(), checkout: vi.fn(), syncCart: vi.fn() },
}));
vi.mock("@/contexts/CartContext", () => ({ useCart: () => ({ ...cart.calls, ...cart.state }) }));
vi.mock("@/lib/pixel", () => ({ trackPixel: vi.fn(), shopifyNumericId: (id?: string) => id?.split("/").pop(), productParams: (p: unknown) => p }));
const clarity = vi.hoisted(() => ({ event: vi.fn() }));
vi.mock("@/lib/clarity", () => ({ clarityEvent: clarity.event, setClarityTag: vi.fn() }));
const live = vi.hoisted(() => ({ value: { jewellery: [] as unknown[], isLoading: false } }));
vi.mock("@/hooks/useLiveJewellery", () => ({ useLiveJewellery: () => live.value }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null }) }));

import CartDrawerNext from "../CartDrawerNext";

const open = (items: Line[], more: Record<string, unknown> = {}) => {
  cart.state = {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    isDrawerOpen: true, checkoutUrl: "https://c/1", isLoading: false, isSyncing: false, pending: null, addError: null,
    ...more,
  };
  return render(
    <MemoryRouter>
      <CartDrawerNext />
    </MemoryRouter>,
  );
};
const text = (selector: string) => document.querySelector(selector)?.textContent ?? null;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  live.value = { jewellery: catalogue, isLoading: false };
});
afterEach(cleanup);

describe("the bag's suggestion: one piece that goes with it", () => {
  it("offers the chain beside the hoops, at the foot of the list, with what it adds to this bag", () => {
    open([hoops]);
    const row = document.querySelector("[data-bag-list] [data-bag-addon]") as HTMLElement;
    expect(row.getAttribute("data-bag-addon")).toBe("toggle-link-chain");
    /* 1,049 + 999 = 2,048 at 10% is 1,843.20 → 1,843: it adds 794, not 999. */
    expect(row.textContent).toMatch(/A second piece takes 10% off your bag/);
    expect(row.textContent).toMatch(/Toggle Link Chain/);
    expect(row.textContent).toMatch(/Adds ₹794 to your total/);
    expect(row.querySelector("del")).toBeNull();
    /* It comes after the lines, inside the part that scrolls. */
    const list = document.querySelector("[data-bag-list]") as HTMLElement;
    expect(list.lastElementChild).toBe(row);
  });

  it("adds it on a tap and notes it for the session record", async () => {
    open([hoops]);
    await act(async () => void fireEvent.click(screen.getByRole("button", { name: "Add Toggle Link Chain to bag" })));
    expect(cart.calls.addItem).toHaveBeenCalledTimes(1);
    expect((cart.calls.addItem.mock.calls[0] as unknown as [{ id: string; price: number }])[0]).toMatchObject({ id: "toggle-link-chain", price: 999 });
    expect(clarity.event).toHaveBeenCalledWith("bag_pair_added");
  });

  it("counts the whole bag moving up a step", () => {
    open([hoops, bracelet]);
    const row = document.querySelector("[data-bag-addon]") as HTMLElement;
    expect(row.getAttribute("data-bag-addon")).toBe("toggle-link-chain");
    /* 3,448 at 10% is 3,103; with the chain 4,447 at 20% is 3,557.60 → 3,558: it adds 455. */
    expect(row.textContent).toMatch(/A third piece takes 20% off your bag/);
    expect(row.textContent).toMatch(/Adds ₹455 to your total/);
  });

  it("offers nothing when the catalogue has no match, and nothing in an empty bag", () => {
    live.value = { jewellery: [catalogue[1]], isLoading: false };
    open([hoops]);
    expect(document.querySelector("[data-bag-addon]")).toBeNull();
    cleanup();
    live.value = { jewellery: catalogue, isLoading: false };
    open([]);
    expect(document.querySelector("[data-bag-addon]")).toBeNull();
  });

  it("waits while the bag is busy", () => {
    open([hoops], { isLoading: true });
    expect((screen.getByRole("button", { name: "Add Toggle Link Chain to bag" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("the bag's total, against the total before the offer", () => {
  it("strikes the pre-offer total beside the one charged, once an offer applies", () => {
    open([hoops, bracelet]);
    expect(text("[data-total]")).toBe("₹3,103");
    expect(text("[data-total-was]")).toBe("was ₹3,448");
    expect(document.querySelector("[data-total-was]")?.tagName).toBe("DEL");
    expect(text("[data-you-save]")).toBe("You save ₹345 · 10% off 2 pieces");
  });

  it("strikes nothing while nothing is off", () => {
    open([hoops]);
    expect(text("[data-total]")).toBe("₹1,049");
    expect(document.querySelector("[data-total-was]")).toBeNull();
  });

  it("says the tax beside the total's name and the delivery terms on one line", () => {
    open([hoops]);
    expect(document.querySelector("[data-bag-foot]")?.firstElementChild?.textContent).toMatch(/^Totalincl\. 3% GST/);
    expect(text("[data-bag-terms]")).toMatch(/^Free insured shipping · Arrives /);
  });

  /* The chain's row heading already says what the next piece does; the foot
     does not say it a second time. */
  it("does not repeat the next step in the foot while a suggestion says it", () => {
    open([hoops]);
    expect(document.querySelector("[data-bag-addon]")).not.toBeNull();
    expect(document.querySelector("[data-next-rung]")).toBeNull();
  });
});

/* The product page says "₹1,049, MRP ₹1,749, 40% off". The bag kept the
   price and forgot the MRP, so the largest saving she had been shown was
   gone at the moment of paying (the conversion review, 25 Nov 2026). */
describe("the bag keeps the saving against MRP the product page showed", () => {
  const withMrp = () => {
    live.value = {
      jewellery: [
        { ...catalogue[0], compareAtPrice: 3999 },
        { ...catalogue[1], compareAtPrice: 1749 },
        catalogue[2],
      ],
      isLoading: false,
    };
  };

  it("one piece: its MRP struck on the line and at the total, and the saving named as against MRP", () => {
    withMrp();
    open([hoops]);
    expect(text("[data-line-price]")).toBe("was ₹1,74940% off");
    expect(text("[data-total]")).toBe("₹1,049");
    expect(text("[data-total-was]")).toBe("was ₹1,749");
    expect(text("[data-you-save]")).toBe("You save ₹700 on MRP");
  });

  it("two pieces: one saving, the offer inside it, and each line's rate worked against its MRP", () => {
    withMrp();
    open([hoops, bracelet]);
    /* 3,448 at 10% is 3,103.20 → 3,103; at MRP the two are 5,748. */
    expect(text("[data-total]")).toBe("₹3,103");
    expect(text("[data-total-was]")).toBe("was ₹5,748");
    expect(text("[data-you-save]")).toBe("You save ₹2,645 · includes 10% off 2 pieces");
    /* 944 against 1,749 and 2,159 against 3,999 are both 46% off: "10% off"
       beside a struck MRP would be the wrong sum. */
    expect([...document.querySelectorAll("[data-line-total]")].map((total) => total.textContent)).toEqual(["₹944", "₹2,159"]);
    expect([...document.querySelectorAll("[data-line-price]")].map((row) => row.textContent)).toEqual(["was ₹1,74946% off", "was ₹3,99946% off"]);
  });

  it("a piece the catalogue has no MRP for keeps the price it replaces, and the totals still add up", () => {
    live.value = { jewellery: [{ ...catalogue[0], compareAtPrice: 3999 }, catalogue[1], catalogue[2]], isLoading: false };
    open([hoops, bracelet]);
    expect([...document.querySelectorAll("[data-line-price]")].map((row) => row.textContent)).toEqual(["was ₹1,04910% off", "was ₹3,99946% off"]);
    /* 1,049 + 3,999 at MRP, against 3,103 charged. */
    expect(text("[data-total-was]")).toBe("was ₹5,048");
    expect(text("[data-you-save]")).toBe("You save ₹1,945 · includes 10% off 2 pieces");
  });

  it("an MRP that is not above the price is not an MRP", () => {
    live.value = { jewellery: [catalogue[0], { ...catalogue[1], compareAtPrice: 1049 }, catalogue[2]], isLoading: false };
    open([hoops]);
    expect(document.querySelector("[data-total-was]")).toBeNull();
    expect(document.querySelector("[data-you-save]")).toBeNull();
  });

  it("carries the renewed layer's stylesheet with the clean one, so the marks and the motion are drawn on every page", () => {
    open([hoops]);
    const sheet = document.querySelector('[role="dialog"]') as HTMLElement;
    const styles = [...sheet.children].filter((child) => child.tagName === "STYLE");
    expect(styles.map((style) => (style.hasAttribute("data-nf-clean") ? "clean" : style.hasAttribute("data-nf-renew") ? "renew" : "?"))).toEqual(["clean", "renew"]);
  });
});
