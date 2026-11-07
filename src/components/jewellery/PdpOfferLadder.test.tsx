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

const rung = (n: 2 | 3 | 4) => document.querySelector(`[data-rung="${n}"]`) as HTMLElement;
const marks = () =>
  ([2, 3, 4] as const).map((n) => (rung(n).hasAttribute("data-current") ? "current" : rung(n).hasAttribute("data-reached") ? "reached" : "open"));
const status = (container: HTMLElement) => container.querySelector("[aria-live] > p")?.textContent;

describe("PdpOfferLadder: Buy 2 / Buy 3 / Buy 4 on the product page", () => {
  /* Rates are literals so this fails alongside OfferProgress.test.tsx if
     promo.ts moves without the Shopify codes. The figures are this piece's
     own price at each rung, rounded as the bag rounds, worked by hand: 999 x
     0.9 / 0.8 / 0.7 = 899.10 / 799.20 / 699.30; 1,199: 1,079.10 / 959.20 /
     839.30; 1,499: 1,349.10 / 1,199.20 / 1,049.30; 2,399: 2,159.10 /
     1,919.20 / 1,679.30. */
  it.each([
    [999, "₹899", "₹799", "₹699"],
    [1199, "₹1,079", "₹959", "₹839"],
    [1499, "₹1,349", "₹1,199", "₹1,049"],
    [2399, "₹2,159", "₹1,919", "₹1,679"],
  ])("prices a ₹%i piece at each of the three rungs", (price, two, three, four) => {
    render(<PdpOfferLadder price={price} />);
    expect(document.querySelectorAll("[data-rung]")).toHaveLength(3);
    expect(rung(2).textContent).toBe(`Buy 210% off${two} each`);
    expect(rung(3).textContent).toBe(`Buy 320% off${three} each`);
    expect(rung(4).textContent).toBe(`Buy 430% off${four} each`);
  });

  /* Palmonas makes the shopper copy a code. Here there is none to copy: the
     bag applies the rung and hands Fastrr the one code itself. */
  it("says it is applied in the bag, names no code and has nothing to tap while the bag is empty", () => {
    const { container } = render(<PdpOfferLadder price={999} />);
    expect(screen.getByText("Applied in your bag · no code")).toBeTruthy();
    expect(container.textContent).not.toMatch(/BUY2|BUY3|BUY4|NAIRA10|FRIENDSANDFAMILY/);
    expect(container.querySelectorAll("a, button")).toHaveLength(0);
    expect(container.querySelector("[data-offer-ladder]")?.getAttribute("data-state")).toBe("0");
    expect(marks()).toEqual(["open", "open", "open"]);
    // The live region is there from the start, empty, so later states are read out.
    expect(container.querySelector("[aria-live]")?.textContent).toBe("");
  });

  it("follows the bag: one piece in it, this one prices as the second", () => {
    cart.totalItems = 1;
    cart.subtotal = 1199;
    const { container } = render(<PdpOfferLadder price={999} />);
    expect(status(container)).toBe("Add to bag for 10% off everything: it adds ₹779, not ₹999.");
    expect(marks()).toEqual(["open", "open", "open"]);
  });

  it("marks the rung the bag has reached and prices this piece as the third", () => {
    cart.totalItems = 2;
    cart.subtotal = 2198;
    const { container } = render(<PdpOfferLadder price={999} />);
    expect(marks()).toEqual(["current", "open", "open"]);
    expect(status(container)).toBe("Add to bag for 20% off everything: it adds ₹580, not ₹999.");
  });

  /* Three pieces are no longer the top: the fourth takes the whole bag to
     30%. 2,997 at 20% is 2,398 (2,397.60); 3,996 at 30% is 2,797 (2,797.20),
     so this piece adds 399. */
  it("at three pieces, Buy 3 is the bag's rung and this piece prices as the fourth", () => {
    cart.totalItems = 3;
    cart.subtotal = 2997;
    const { container } = render(<PdpOfferLadder price={999} />);
    expect(marks()).toEqual(["reached", "current", "open"]);
    expect(container.querySelector("[data-offer-ladder]")?.getAttribute("data-state")).toBe("3");
    expect(status(container)).toBe("Add to bag for 30% off everything: it adds ₹399, not ₹999.");
  });

  /* 3,996 at 30% is 2,797 (2,797.20); 4,995 at 30% is 3,497 (3,496.50,
     rounded half up), so this piece costs 700. */
  it("at four pieces, every rung is reached and the line says the bag has 30%", () => {
    cart.totalItems = 4;
    cart.subtotal = 3996;
    const { container } = render(<PdpOfferLadder price={999} />);
    expect(marks()).toEqual(["reached", "reached", "current"]);
    expect(container.querySelector("[data-offer-ladder]")?.getAttribute("data-state")).toBe("4");
    expect(status(container)).toBe("30% off is on your bag: adding this costs ₹700, not ₹999.");
    // The rung the bag has is said, not only drawn.
    expect(rung(4).textContent).toContain("in your bag");
  });

  it("keeps Buy 4 as the bag's rung past four pieces", () => {
    cart.totalItems = 6;
    cart.subtotal = 5994;
    const { container } = render(<PdpOfferLadder price={999} />);
    expect(marks()).toEqual(["reached", "reached", "current"]);
    expect(container.querySelector("[data-offer-ladder]")?.getAttribute("data-state")).toBe("4");
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
     3 Nov 2026 NAIRA10 (10%) matches Buy 2, so the line names Buy 3;
     FRIENDSANDFAMILY (20%) matches Buy 3, so since Buy 4 (7 Nov 2026) the
     line names the four-piece 30% rather than calling 20% the best price. */
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
    expect(container.querySelector("[aria-live]")?.textContent).toBe("Your code takes 20% off. 4 pieces take 30%.");
  });

  /* A sold-out size or metal is reserved on WhatsApp and never reaches the
     bag: its figures give way to one note in the same row (so the size
     buttons below do not jump under the finger), and no rung is marked as
     the bag's, since this choice cannot join it. */
  it("quotes no per-piece price for a pre-order choice", () => {
    cart.totalItems = 2;
    cart.subtotal = 1998;
    const { container } = render(<PdpOfferLadder price={999} preorder />);
    expect(container.textContent).not.toMatch(/₹/);
    expect(screen.getByText("Not on pre-orders")).toBeTruthy();
    expect(screen.getAllByText("In-stock pieces only")).toHaveLength(1);
    expect(screen.getByText("In-stock pieces only").className).toMatch(/\bh-4\b/);
    expect(marks()).toEqual(["open", "open", "open"]);
    expect(container.querySelector("[aria-live]")?.textContent).toBe("");
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });

  it("renders nothing without a price to work from", () => {
    const { container } = render(<PdpOfferLadder price={0} />);
    expect(container.innerHTML).toBe("");
  });

  /* Equal columns, one per rung, so three rungs never wrap or crowd. */
  it("lays the rungs out in three equal columns", () => {
    const { container } = render(<PdpOfferLadder price={999} />);
    expect(container.querySelector("[data-offer-ladder] ul")?.className).toMatch(/\bgrid-cols-3\b/);
  });

  /* The owner asked for the box to be readable: nothing in it is set under
     11px (the old box had 9.5px and 10px capitals). */
  it("sets no text under 11px", () => {
    const src = readFileSync(resolve(__dirname, "PdpOfferLadder.tsx"), "utf8");
    const sizes = [...src.matchAll(/text-\[(\d+(?:\.\d+)?)px\]/g)].map((m) => Number(m[1]));
    expect(sizes.length).toBeGreaterThan(4);
    sizes.forEach((px) => expect(px).toBeGreaterThanOrEqual(11));
  });

  /* The panel sits right above Add to cart, which stayed on the first screen
     of a 390x844 phone for Prism Rivière with 3px to spare. The rate's row is
     held to 22px: left to size itself, the serif rate and the sans "off" on
     one baseline grew the panel by 3px, and Add to cart ended on the screen's
     very edge. The price row is held to 16px, the pre-order note's height. */
  it("holds both rows to fixed heights so the panel cannot grow", () => {
    const src = readFileSync(resolve(__dirname, "PdpOfferLadder.tsx"), "utf8");
    expect(src).toMatch(/min-\[310px\]:h-\[22px\]/);
    expect(src.match(/\bh-4\b/g)?.length).toBeGreaterThanOrEqual(2);
  });

  /* The phone's buy bar keeps off the rungs' list while it is on screen
     (JewelDetailNext reads `[data-offer-ladder] ul`). The reached rung's
     rule used to hang 8px under that list, on the panel's foot: on a 390x844
     phone (Prism Rivière, two pieces in the bag) the list ended at 775px,
     the bar began at 779px and covered the rule at 781-783px. It sits in the
     column's own 3px foot now, inside the list, and that foot comes out of
     the panel's bottom padding (7px = 3 + 4), so the panel stays 56px. */
  it("draws the reached rung's rule inside the list the buy bar keeps off", () => {
    cart.totalItems = 2;
    cart.subtotal = 1998;
    const { container } = render(<PdpOfferLadder price={999} />);
    const rule = container.querySelector("[data-rung-rule]") as HTMLElement;
    expect(rule.closest("li")).toBe(rung(2));
    expect(rule.closest("[data-offer-ladder] ul")).toBeTruthy();
    expect(rule.className).toMatch(/(^|\s)bottom-0(\s|$)/);
    expect(rule.className).not.toMatch(/-bottom-/);
    expect(rung(2).className).toMatch(/\bpb-\[3px\]/);
    expect((container.querySelector("[data-offer-ladder] > div") as HTMLElement).className).toMatch(/\bpb-\[4px\]/);
    const page = readFileSync(resolve(__dirname, "../../pages/JewelDetailNext.tsx"), "utf8");
    expect(page).toContain('document.querySelector("[data-offer-ladder] ul")');
  });

  /* Nothing moves for a shopper who has asked for less motion. */
  it("stills its transitions under reduced motion", () => {
    const src = readFileSync(resolve(__dirname, "PdpOfferLadder.tsx"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const animated = src.match(/transition-colors|animate-in/g)?.length ?? 0;
    const stilled = src.match(/motion-reduce:(transition-none|animate-none)/g)?.length ?? 0;
    expect(animated).toBeGreaterThan(0);
    expect(stilled).toBe(animated);
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
