import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
  The whole bag in each of its states, drawn from the clean system: what is
  on the sheet, in which order, and what each state changes. The cart is a
  stand-in here (nothing reaches Shopify); the rupees come from the bag's own
  resolver, as in the real one.
*/
type Line = { id: string; variantId: string; name: string; price: number; priceLabel: string; currencyCode: string; image: string; quantity: number; lineId: string | null; size?: string; selectedOptions?: Array<{ name: string; value: string }> };
const line = (id: string, name: string, price: number, extra: Partial<Line> = {}): Line => ({
  id, variantId: `gid://shopify/ProductVariant/${id}`, name, price, priceLabel: `₹${price.toLocaleString("en-IN")}`, currencyCode: "INR", image: `${id}.jpg`, quantity: 1, lineId: `line-${id}`, ...extra,
});
const hoops = line("woven-gold-hoops", "Woven Gold Hoops", 1049);
const ring = line("crystal-baguette-eternity-ring", "Crystal Baguette Eternity Ring", 1199, { selectedOptions: [{ name: "Size", value: "US 7" }] });

const cart = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  calls: { addItem: vi.fn(), updateQuantity: vi.fn(), removeItem: vi.fn(), setDrawerOpen: vi.fn(), checkout: vi.fn(), syncCart: vi.fn() },
}));
vi.mock("@/contexts/CartContext", () => ({ useCart: () => ({ ...cart.calls, ...cart.state }) }));
vi.mock("@/lib/pixel", () => ({ trackPixel: vi.fn(), shopifyNumericId: (id?: string) => id?.split("/").pop(), productParams: (p: unknown) => p }));
vi.mock("@/lib/clarity", () => ({ clarityEvent: vi.fn(), setClarityTag: vi.fn() }));
vi.mock("@/hooks/useLiveJewellery", () => ({ useLiveJewellery: () => ({ jewellery: [] }) }));
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
const sheet = () => document.querySelector('[role="dialog"]') as HTMLElement;
const text = (selector: string) => document.querySelector(selector)?.textContent ?? null;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
afterEach(cleanup);

describe("the bag's sheet", () => {
  it("is a clean root that carries its own stylesheet, on every page", () => {
    open([hoops]);
    expect(sheet().className).toMatch(/\bnf-clean\b/);
    expect(sheet().className).toMatch(/\bnf-palette\b/);
    expect(sheet().firstElementChild?.tagName).toBe("STYLE");
    expect(sheet().firstElementChild?.hasAttribute("data-nf-clean")).toBe(true);
    expect(sheet().style.boxShadow).toBe("none");
  });

  it("has four parts with pieces in it: header, offer, list, foot", () => {
    open([hoops, ring]);
    const parts = [...sheet().children].filter((part) => part.tagName !== "STYLE" && !/\bhidden\b/.test(part.className));
    expect(parts).toHaveLength(4);
    expect(parts[1].hasAttribute("data-ladder")).toBe(true);
    expect(parts[2].hasAttribute("data-bag-list")).toBe(true);
    expect(parts[3].hasAttribute("data-bag-foot")).toBe(true);
  });

  /* One way out on every screen: an X named for what it does. The phone's
     chevron and the sheet's own corner cross are gone. */
  it("has one close button, at every width", () => {
    open([hoops]);
    const close = screen.getByRole("button", { name: "Close bag" });
    expect(close.className).toMatch(/\bnc-iconbtn\b/);
    expect(screen.queryByRole("button", { name: "Back to shopping" })).toBeNull();
    const stock = [...sheet().querySelectorAll("button")].filter((button) => button.textContent === "Close");
    expect(stock).toHaveLength(1);
    expect(stock[0].className).toMatch(/\bhidden\b/);
  });

  it("counts the pieces beside the title, in plain words", () => {
    open([hoops]);
    expect(text("h2")).toBe("Your bag1 piece");
    cleanup();
    open([{ ...hoops, quantity: 2 }, ring]);
    expect(text("h2")).toBe("Your bag3 pieces");
    expect(document.querySelector("h2 span")?.className).toMatch(/\bnc-small\b/);
  });

  it("puts nothing in the foot between the trust lines, Checkout and the returns link", () => {
    open([hoops, ring]);
    const foot = document.querySelector("[data-bag-foot]") as HTMLElement;
    const order = [...foot.children].map((child) => (child.hasAttribute("data-bag-trust") ? "trust" : child.hasAttribute("data-checkout") ? "checkout" : child.querySelector("[data-returns]") ? "returns" : child.querySelector("[data-total]") ? "total" : "line"));
    expect(order).toEqual(["total", "line", "line", "trust", "checkout", "returns"]);
    expect(foot.querySelectorAll(".nc-btn--ink")).toHaveLength(1);
    expect(foot.querySelector("svg, img")).toBeNull();
  });
});

describe("the bag, state by state", () => {
  it("empty: no offer strip and no foot", () => {
    open([]);
    expect(screen.getByText("Your bag is empty")).toBeTruthy();
    expect(text("h2")).toBe("Your bag");
    expect(document.querySelector("[data-ladder], [data-bag-foot], [data-bag-list], [data-checkout]")).toBeNull();
  });

  it("one piece: nothing struck, and the saving's line names the next rung", () => {
    open([hoops]);
    expect(text("[data-total]")).toBe("₹1,049");
    expect(document.querySelector("[data-line-price]")).toBeNull();
    expect(text("[data-next-rung]")).toBe("A second piece takes 10% off your bag");
    expect(document.querySelector("[data-you-save]")).toBeNull();
    expect(document.querySelector("[data-rung][data-current]")).toBeNull();
  });

  it("two pieces: Buy 2 reached, each line struck with its rate, one saving sentence", () => {
    open([hoops, ring]);
    expect(text("[data-total]")).toBe("₹2,023");
    expect(text("[data-you-save]")).toBe("You save ₹225 · 10% for 2 pieces");
    expect(document.querySelector("[data-next-rung]")).toBeNull();
    expect([...document.querySelectorAll("[data-line-price]")].map((row) => row.textContent)).toEqual(["₹1,04910% off", "₹1,19910% off"]);
    expect([...document.querySelectorAll("[data-line-total]")].map((total) => total.textContent)).toEqual(["₹944", "₹1,079"]);
    expect(document.querySelector("[data-rung][data-current]")?.getAttribute("data-rung")).toBe("2");
    for (const saving of document.querySelectorAll("[data-you-save], [data-line-price] > span:last-child")) expect(saving.className).toMatch(/\bnc-gold\b/);
  });

  it("two of one piece at full price would read each; with Buy 2 it reads the struck price, each and the rate", () => {
    open([{ ...hoops, quantity: 2 }]);
    expect(text("[data-line-price]")).toBe("₹1,049₹944 each10% off");
    expect(text("[data-line-total]")).toBe("₹1,888");
  });

  it("a line with choices says them under its name", () => {
    open([line("star-point-band", "Star Point Band", 799, { selectedOptions: [{ name: "Metal", value: "Silver" }], size: "US 7" })]);
    expect(document.querySelector("[data-line]")?.textContent).toContain("Metal: Silver · Size: US 7");
  });

  it("a typed code: the saving is the code's", () => {
    localStorage.setItem("naira-promo-code", "NAIRA10");
    open([hoops]);
    expect(text("[data-you-save]")).toBe("You save ₹105 · 10% with your code");
    expect(text("[data-line-price]")).toBe("₹1,04910% off");
  });

  /* The piece on its way in is listed and counted from the tap. */
  it("adding: the arriving piece is a line at once, and Checkout waits", () => {
    open([ring], { pending: { ...hoops, lineId: null }, isLoading: true });
    expect(text("h2")).toBe("Your bag2 pieces");
    const arriving = document.querySelector("[data-adding]") as HTMLElement;
    expect(arriving.getAttribute("data-line")).toBe("woven-gold-hoops");
    expect(arriving.querySelector('[role="status"]')?.textContent).toContain("Adding to your bag…");
    expect(document.querySelector("[data-rung][data-current]")?.getAttribute("data-rung")).toBe("2");
    const checkout = document.querySelector("[data-checkout]") as HTMLButtonElement;
    expect(checkout).toBeDisabled();
    expect(checkout.textContent).toBe("Checkout");
    expect(checkout.querySelector("svg")).toBeTruthy();
  });

  it("busy: quantity, Remove and Checkout wait for Shopify", () => {
    open([hoops, ring], { isLoading: true });
    for (const button of document.querySelectorAll("[data-line] button")) expect(button).toBeDisabled();
    expect(document.querySelector("[data-checkout]")).toBeDisabled();
  });

  it("syncing: Checkout waits, the lines stay usable", () => {
    open([hoops, ring], { isSyncing: true });
    expect(document.querySelector("[data-checkout]")).toBeDisabled();
    for (const button of document.querySelectorAll("[data-line] button")) expect(button).not.toBeDisabled();
  });

  it("error: said in an alert under the offer, above the list", () => {
    open([ring], { addError: "Woven Gold Hoops couldn't be added. It may have just sold out." });
    const alert = screen.getByRole("alert");
    expect(alert.hasAttribute("data-add-error")).toBe(true);
    expect(alert.className).toMatch(/\bnc-notice\b/);
    expect(alert.previousElementSibling?.hasAttribute("data-ladder")).toBe(true);
    expect(alert.nextElementSibling?.hasAttribute("data-bag-list")).toBe(true);
  });

  it("removed: an Undo notice under the offer, which puts the piece back", async () => {
    open([hoops, ring]);
    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: "Remove Woven Gold Hoops" })[1]);
    });
    expect(cart.calls.removeItem).toHaveBeenCalledWith("woven-gold-hoops", undefined, hoops.variantId);
    const notice = document.querySelector("[data-undo]") as HTMLElement;
    expect(notice.getAttribute("role")).toBe("status");
    expect(notice.className).toMatch(/\bnc-notice\b/);
    expect(notice.textContent).toBe("Woven Gold Hoops removedUndo");
    expect(notice.previousElementSibling?.hasAttribute("data-ladder")).toBe(true);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    });
    expect(cart.calls.addItem).toHaveBeenCalledTimes(1);
    expect(cart.calls.addItem.mock.calls[0][0]).toMatchObject({ id: "woven-gold-hoops", variantId: hoops.variantId, price: 1049 });
    expect(cart.calls.addItem.mock.calls[0][1]).toBe(1);
    expect(document.querySelector("[data-undo]")).toBeNull();
  });

  it("plus adds one; minus at one removes the line", async () => {
    open([hoops, { ...ring, quantity: 2 }]);
    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: "Increase quantity" })[0]);
    });
    expect(cart.calls.updateQuantity).toHaveBeenLastCalledWith("woven-gold-hoops", undefined, 2, hoops.variantId);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Decrease quantity" }));
    });
    expect(cart.calls.updateQuantity).toHaveBeenLastCalledWith("crystal-baguette-eternity-ring", undefined, 1, ring.variantId);
    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: "Remove Woven Gold Hoops" })[0]);
    });
    expect(cart.calls.removeItem).toHaveBeenCalledWith("woven-gold-hoops", undefined, hoops.variantId);
  });

  it("opening checkout: the button says so at once and cannot be tapped twice", async () => {
    open([hoops, ring]);
    const checkout = document.querySelector("[data-checkout]") as HTMLButtonElement;
    await act(async () => {
      fireEvent.click(checkout);
    });
    expect(checkout.textContent).toBe("Opening checkout…");
    expect(checkout).toBeDisabled();
    await vi.waitFor(() => expect(cart.calls.checkout).toHaveBeenCalledTimes(1), { timeout: 2000 });
  });

  it("closes through the bag's own back step from the X", async () => {
    open([hoops]);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Close bag" }));
    });
    await vi.waitFor(() => expect(cart.calls.setDrawerOpen).toHaveBeenCalledWith(false), { timeout: 2000 });
  });
});
