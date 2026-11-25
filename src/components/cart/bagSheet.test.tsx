import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
const sheet = () => document.querySelector('[role="dialog"]') as HTMLElement;
const text = (selector: string) => document.querySelector(selector)?.textContent ?? null;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  live.value = { jewellery: [], isLoading: false };
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

  /* Header, offer and foot are pinned and only the list scrolls, so the total
     and Checkout never leave the screen. A phone on its side has no room for
     that (the pinned parts are 330px): there the sheet scrolls as one piece,
     so the lines can be seen and Checkout reached, where the old bag showed
     no lines at all and cut its button off. */
  it("pins its parts round a scrolling list, and scrolls whole on a very short screen", () => {
    open([hoops, ring]);
    expect(sheet().className).toMatch(/(^|\s)overflow-hidden(\s|$)/);
    expect(sheet().className).toContain("[@media(max-height:479px)]:overflow-y-auto");
    const list = document.querySelector("[data-bag-list]") as HTMLElement;
    expect(list.className).toMatch(/(^|\s)overflow-y-auto(\s|$)/);
    expect(list.className).toMatch(/(^|\s)flex-1(\s|$)/);
    expect(list.className).toContain("[@media(max-height:479px)]:flex-none");
    expect(list.className).toContain("[@media(max-height:479px)]:overflow-visible");
    for (const part of [document.querySelector("[data-ladder]"), document.querySelector("[data-bag-foot]")]) expect(part?.className).toMatch(/(^|\s)shrink-0(\s|$)/);
  });

  /* The total is the product page's price figure, kept at the phone's size
     at every width: the drawer is as narrow on a laptop as on a phone. */
  it("sets the total in the price figure's sheet size", () => {
    open([hoops]);
    const total = document.querySelector("[data-total]") as HTMLElement;
    expect(total.className).toMatch(/\bnc-price__now\b/);
    expect(total.className).toMatch(/\bnc-price__now--sheet\b/);
    const css = readFileSync(resolve(__dirname, "../clean/clean.css"), "utf8");
    expect(css).toMatch(/\.nf-clean \.nc-price__now\.nc-price__now--sheet\s*\{\s*font-size:\s*20px;\s*line-height:\s*24px;?\s*\}/);
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
    expect(text("h2")).toBe("Your bag 1 piece");
    cleanup();
    open([{ ...hoops, quantity: 2 }, ring]);
    expect(text("h2")).toBe("Your bag 3 pieces");
    expect(document.querySelector("h2 span:first-child")?.className).toMatch(/\bnc-heading--sheet\b/);
    expect(document.querySelector("h2 span:last-child")?.className).toMatch(/\bnc-small\b/);
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

/* What the review of 20 Nov changed, pinned. */
describe("the bag's edges, gaps and manners", () => {
  /* The cross is 9px wide in the middle of a 44px target. With the target
     flush against the sheet's edge and the cross 1px to the right inside it,
     the cross ends on the 16px line the prices, "Remove" and Checkout end on
     (it sat 5.5px inside it). Nothing reaches past the sheet's edge. */
  it("ends the close cross on the right edge everything else ends on", () => {
    open([hoops]);
    const close = screen.getByRole("button", { name: "Close bag" });
    const header = close.parentElement as HTMLElement;
    expect(header.className.split(/\s+/)).toContain("pl-4");
    expect(header.className.split(/\s+/).some((name) => /^(pr|px|p)-/.test(name))).toBe(false);
    expect(close.className).not.toMatch(/(^|\s)-m/);
    const cross = close.querySelector("svg") as SVGElement;
    expect(cross.getAttribute("width")).toBe("18");
    expect((cross.getAttribute("class") ?? "").split(/\s+/)).toContain("translate-x-px");
  });

  /* 8px over the trust lines, 8px over Checkout, 12px over the returns link:
     the link's 44px target is the 12px above it, its 20px line and the 12px
     under it, so it stops at Checkout's edge instead of running 2px under
     the button, and Checkout needs no layer of its own. */
  it("gives the returns link a whole 44px target that never reaches under Checkout", () => {
    open([hoops, ring]);
    const foot = document.querySelector("[data-bag-foot]") as HTMLElement;
    const has = (element: Element | null | undefined, name: string) => (element?.className ?? "").split(/\s+/).includes(name);
    expect(has(foot.querySelector("[data-bag-trust]"), "mt-2")).toBe(true);
    const checkout = foot.querySelector("[data-checkout]") as HTMLElement;
    expect(has(checkout, "mt-2")).toBe(true);
    expect(checkout.className).not.toMatch(/(^|\s)z-/);
    const returns = foot.querySelector("[data-returns]") as HTMLElement;
    expect(has(returns.parentElement, "mt-3")).toBe(true);
    expect(returns.className).toContain("before:-inset-y-3");
    expect(has(foot, "pb-[max(12px,env(safe-area-inset-bottom))]")).toBe(true);
  });

  /* The clean system stills everything inside the sheet for a shopper who
     asked for less motion; the sheet's own 400ms slide is stilled here. */
  it("does not slide the sheet for a shopper who asked for less motion", () => {
    open([hoops]);
    expect(sheet().className.split(/\s+/)).toContain("motion-reduce:!animate-none");
  });

  it("closes the list with the foot's rule alone", () => {
    open([hoops, ring]);
    const lines = [...document.querySelectorAll("[data-line]")];
    for (const each of lines) expect(each.className).not.toMatch(/(^|\s)(last:)?border-b/);
    expect((document.querySelector("[data-bag-foot]") as HTMLElement).className.split(/\s+/)).toContain("border-t");
  });
});

/* A browser takes focus away from a button the moment it is disabled, and
   the bag disables a line's buttons while Shopify answers: after one press of
   "+" from the keyboard the next Tab began again at the close button. */
describe("the bag keeps a keyboard user's place", () => {
  const press = async (button: HTMLElement, how: "keyboard" | "pointer") => {
    button.focus();
    await act(async () => {
      fireEvent.click(button, { detail: how === "keyboard" ? 0 : 1 });
    });
  };
  const busyThenIdle = (view: ReturnType<typeof open>, items: Line[]) => {
    const draw = (isLoading: boolean) => {
      cart.state = { ...cart.state, items, totalItems: items.reduce((sum, item) => sum + item.quantity, 0), subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0), isLoading };
      view.rerender(
        <MemoryRouter>
          <CartDrawerNext />
        </MemoryRouter>,
      );
    };
    draw(true);
    /* The browser's part. It drops focus from a button as it is disabled, and
       the sheet's focus trap then holds it on the sheet itself (measured in
       Chrome: the page's body, then the dialog). jsdom leaves focus on the
       disabled button, so the sheet is focused here by hand. */
    sheet().focus();
    expect(document.activeElement).toBe(sheet());
    draw(false);
  };

  it("hands focus back to + once Shopify has answered a press from the keyboard", async () => {
    const view = open([hoops, ring]);
    const plus = screen.getAllByRole("button", { name: "Increase quantity" })[1];
    await press(plus, "keyboard");
    expect(cart.calls.updateQuantity).toHaveBeenCalledTimes(1);
    busyThenIdle(view, [hoops, { ...ring, quantity: 2 }]);
    expect(document.activeElement).toBe(screen.getAllByRole("button", { name: "Increase quantity" })[1]);
    expect(document.activeElement?.closest("[data-line]")?.getAttribute("data-line")).toBe("crystal-baguette-eternity-ring");
  });

  it("hands it back to − as well, under whatever name the button now has", async () => {
    const view = open([{ ...hoops, quantity: 2 }, ring]);
    await press(screen.getByRole("button", { name: "Decrease quantity" }), "keyboard");
    busyThenIdle(view, [hoops, ring]);
    expect(document.activeElement).toBe(screen.getAllByRole("button", { name: "Remove Woven Gold Hoops" })[0]);
  });

  it("leaves focus alone after a tap or a click", async () => {
    const view = open([hoops, ring]);
    await press(screen.getAllByRole("button", { name: "Increase quantity" })[0], "pointer");
    busyThenIdle(view, [{ ...hoops, quantity: 2 }, ring]);
    expect(document.activeElement?.closest("[data-line]")).toBeNull();
  });

  it("does not take focus from where the shopper has moved it since", async () => {
    const view = open([hoops, ring]);
    await press(screen.getAllByRole("button", { name: "Increase quantity" })[0], "keyboard");
    const draw = (isLoading: boolean) => {
      cart.state = { ...cart.state, isLoading };
      view.rerender(
        <MemoryRouter>
          <CartDrawerNext />
        </MemoryRouter>,
      );
    };
    draw(true);
    const close = screen.getByRole("button", { name: "Close bag" });
    close.focus();
    draw(false);
    expect(document.activeElement).toBe(close);
  });

  /* After a Remove the line is gone: the line that moves up into its place
     must not find its own Remove under the shopper's next Enter. */
  it("never moves focus to another line when the pressed line has gone", async () => {
    const view = open([hoops, ring]);
    await press(screen.getAllByRole("button", { name: "Remove Woven Gold Hoops" })[1], "keyboard");
    busyThenIdle(view, [ring]);
    expect(document.querySelectorAll("[data-line]")).toHaveLength(1);
    expect(document.activeElement?.closest("[data-line]")).toBeNull();
  });
});

describe("the bag, state by state", () => {
  it("empty: no offer strip and no foot", () => {
    open([]);
    expect(screen.getByText("Your bag is empty")).toBeTruthy();
    expect(text("h2")).toBe("Your bag");
    expect(document.querySelector("[data-ladder], [data-bag-foot], [data-bag-list], [data-checkout]")).toBeNull();
  });

  /* While Shopify's catalogue is on its way the two best-sellers each keep
     their place, so a row that arrives late moves nothing (cart/BagEmpty). */
  it("empty, catalogue still loading: the best-sellers' places are held, in order", () => {
    live.value = { jewellery: [], isLoading: true };
    open([]);
    expect([...document.querySelectorAll("[data-piece-slot]")].map((slot) => slot.getAttribute("data-piece-slot"))).toEqual(["prism-riviere-bracelet", "woven-gold-hoops"]);
    cleanup();
    live.value = { jewellery: [], isLoading: false };
    open([]);
    expect(document.querySelector("[data-piece-slot]")).toBeNull();
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
    expect(text("h2")).toBe("Your bag 2 pieces");
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
