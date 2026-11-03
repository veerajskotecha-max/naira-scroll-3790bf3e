import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import PdpOfferLadder from "./PdpOfferLadder";
import { PROMO_EVENT } from "@/lib/promo";

const cart = vi.hoisted(() => ({ totalItems: 0, subtotal: 0, setDrawerOpen: vi.fn() }));
vi.mock("@/contexts/CartContext", () => ({ useCart: () => cart }));

beforeEach(() => {
  cart.totalItems = 0;
  cart.subtotal = 0;
  cart.setDrawerOpen.mockClear();
  localStorage.clear();
});
afterEach(cleanup);

const rung = (n: 2 | 3) => document.querySelector(`[data-rung="${n}"]`) as HTMLElement;

describe("PdpOfferLadder: Buy 2 / Buy 3 on the product page", () => {
  /* Rates are literals so this fails alongside OfferProgress.test.tsx if
     promo.ts moves without the Shopify codes. The figures are this piece's
     own price at each rung, rounded as the bag rounds. */
  it.each([
    [999, "₹899", "₹799"],
    [1199, "₹1,079", "₹959"],
    [1499, "₹1,349", "₹1,199"],
    [2399, "₹2,159", "₹1,919"],
  ])("prices a ₹%i piece at each rung", (price, two, three) => {
    render(<PdpOfferLadder price={price} />);
    expect(rung(2).textContent).toBe(`Buy 2 · 10% off${two} each`);
    expect(rung(3).textContent).toBe(`Buy 3 · 20% off${three} each`);
  });

  /* Palmonas makes the shopper copy a code. Here there is none to copy: the
     bag applies the rung and hands Fastrr the one code itself. */
  it("says it is applied in the bag, names no code and has nothing to tap while the bag is empty", () => {
    const { container } = render(<PdpOfferLadder price={999} />);
    expect(screen.getByText("Applied in your bag · no code")).toBeTruthy();
    expect(container.textContent).not.toMatch(/BUY2|BUY3|NAIRA10|FRIENDSANDFAMILY/);
    expect(container.querySelectorAll("a, button")).toHaveLength(0);
    expect(container.querySelector("[data-offer-ladder]")?.getAttribute("data-state")).toBe("0");
    // The live region is there from the start, empty, so later states are read out.
    expect(container.querySelector("[aria-live]")?.textContent).toBe("");
  });

  it("follows the bag: one piece in it, this one prices as the second", () => {
    cart.totalItems = 1;
    cart.subtotal = 1199;
    const { container } = render(<PdpOfferLadder price={999} />);
    expect(container.querySelector("[aria-live] > p")?.textContent).toBe("Add to bag for 10% off everything: it adds ₹779, not ₹999.");
    expect(rung(2).hasAttribute("data-reached")).toBe(false);
  });

  it("marks the rung the bag has reached and prices this piece as the third", () => {
    cart.totalItems = 2;
    cart.subtotal = 2198;
    const { container } = render(<PdpOfferLadder price={999} />);
    expect(rung(2).hasAttribute("data-reached")).toBe(true);
    expect(rung(3).hasAttribute("data-reached")).toBe(false);
    expect(container.querySelector("[aria-live] > p")?.textContent).toBe("Add to bag for 20% off everything: it adds ₹580, not ₹999.");
  });

  it("at three pieces, both rungs are reached and the line says the bag has 20%", () => {
    cart.totalItems = 3;
    cart.subtotal = 2997;
    const { container } = render(<PdpOfferLadder price={999} />);
    expect(rung(2).hasAttribute("data-reached")).toBe(true);
    expect(rung(3).hasAttribute("data-reached")).toBe(true);
    expect(container.querySelector("[data-offer-ladder]")?.getAttribute("data-state")).toBe("3");
    expect(container.querySelector("[aria-live] > p")?.textContent).toBe("20% off is on your bag: adding this costs ₹799, not ₹999.");
  });

  /* With pieces in the bag the one control is View bag, a full 44px target. */
  it("opens the bag from View bag once it holds a piece", () => {
    cart.totalItems = 1;
    cart.subtotal = 999;
    render(<PdpOfferLadder price={999} />);
    const button = screen.getByRole("button", { name: "View bag" });
    expect(button.className).toMatch(/min-h-\[44px\]/);
    fireEvent.click(button);
    expect(cart.setDrawerOpen).toHaveBeenCalledWith(true);
  });

  /* A typed code is never offered back as a saving the shopper has. Since
     3 Nov 2026 NAIRA10 (10%) matches Buy 2, so the line names only Buy 3;
     FRIENDSANDFAMILY (20%) matches Buy 3, so it names no rung at all. */
  it("follows a typed code as it changes", () => {
    const { container } = render(<PdpOfferLadder price={999} />);
    act(() => {
      localStorage.setItem("naira-promo-code", "NAIRA10");
      window.dispatchEvent(new CustomEvent(PROMO_EVENT));
    });
    expect(container.querySelector("[aria-live]")?.textContent).toBe("Your code takes 10% off. 3 pieces take 20%.");
    act(() => {
      localStorage.setItem("naira-promo-code", "FRIENDSANDFAMILY");
      window.dispatchEvent(new CustomEvent(PROMO_EVENT));
    });
    expect(container.querySelector("[aria-live]")?.textContent).toBe("Your code takes 20% off, the best price.");
  });

  /* A sold-out size or metal is reserved on WhatsApp and never reaches the
     bag: its figures give way to a note in the same space (so the size
     buttons below do not jump under the finger). */
  it("quotes no per-piece price for a pre-order choice", () => {
    cart.totalItems = 1;
    cart.subtotal = 999;
    const { container } = render(<PdpOfferLadder price={999} preorder />);
    expect(container.textContent).not.toMatch(/₹/);
    expect(screen.getByText("Not on pre-orders")).toBeTruthy();
    expect(screen.getAllByText("In-stock pieces only")).toHaveLength(2);
    expect(container.querySelector("[aria-live]")?.textContent).toBe("");
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });

  it("renders nothing without a price to work from", () => {
    const { container } = render(<PdpOfferLadder price={0} />);
    expect(container.innerHTML).toBe("");
  });

  /* No rate or rupee figure is typed into the component; all of it comes
     from promo.ts. */
  it("reads every rate and figure from promo.ts", () => {
    const src = readFileSync(resolve(__dirname, "PdpOfferLadder.tsx"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(src).toMatch(/QUANTITY_OFFERS\.map/);
    expect(src).toMatch(/pieceAtRung\(price, offer\)/);
    expect(src).toMatch(/pdpOfferStatus\(/);
    expect(src).not.toMatch(/\d+%|0\.[123]\b|₹\d/);
  });
});
