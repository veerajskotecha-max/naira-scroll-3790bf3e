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

/* The offer is a row of the product page's facts table, so it renders inside one. */
const row = (ui: React.ReactElement) => render(<dl>{ui}</dl>);
const rung = (n: 2 | 3 | 4) => document.querySelector(`[data-rung="${n}"]`) as HTMLElement;
const marks = () =>
  ([2, 3, 4] as const).map((n) => (rung(n).hasAttribute("data-current") ? "current" : rung(n).hasAttribute("data-reached") ? "reached" : "open"));
const status = (container: HTMLElement) => container.querySelector("[aria-live] > p")?.textContent;
const source = () => readFileSync(resolve(__dirname, "PdpOfferLadder.tsx"), "utf8");

/*
  20 Nov 2026: the gold box (legend on its rule, serif numerals, dividers)
  became the OFFER row of the product page's table: the same rungs, the same
  per-piece prices and the same sentences from promo.ts, as plain words.
*/
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
    row(<PdpOfferLadder price={price} />);
    expect(document.querySelectorAll("[data-rung]")).toHaveLength(3);
    expect(rung(2).textContent).toBe(`Buy 2 · 10% off${two} each`);
    expect(rung(3).textContent).toBe(`Buy 3 · 20% off${three} each`);
    expect(rung(4).textContent).toBe(`Buy 4 · 30% off${four} each`);
  });

  it("is the OFFER row of the facts table: a caps label and its values, no box", () => {
    const { container } = row(<PdpOfferLadder price={999} />);
    const fact = container.querySelector(".nc-facts__row") as HTMLElement;
    expect(fact.querySelector("dt")?.textContent).toBe("Offer");
    const ladder = fact.querySelector("dd [data-offer-ladder]") as HTMLElement;
    expect(ladder.getAttribute("role")).toBe("group");
    expect(ladder.getAttribute("aria-label")).toBe("Buy more, pay less");
    expect(container.innerHTML).not.toMatch(/border|bg-|font-nf|font-cormorant|text-nf|tracking-/);
  });

  /* Palmonas makes the shopper copy a code. Here there is none to copy: the
     bag applies the rung and hands Fastrr the one code itself. */
  it("says it is applied in the bag, names no code and has nothing to tap while the bag is empty", () => {
    const { container } = row(<PdpOfferLadder price={999} />);
    expect(status(container)).toBe("Applied in your bag. No code needed.");
    expect(container.textContent).not.toMatch(/BUY2|BUY3|BUY4|NAIRA10|FRIENDSANDFAMILY/);
    expect(container.querySelectorAll("a, button")).toHaveLength(0);
    expect(container.querySelector("[data-offer-ladder]")?.getAttribute("data-state")).toBe("0");
    expect(marks()).toEqual(["open", "open", "open"]);
    // One line, and no room held for a second, so nothing below it is pushed down.
    expect((container.querySelector("[aria-live]") as HTMLElement).className).not.toMatch(/min-h-/);
  });

  it("follows the bag: one piece in it, this one prices as the second", () => {
    cart.totalItems = 1;
    cart.subtotal = 1199;
    const { container } = row(<PdpOfferLadder price={999} />);
    expect(status(container)).toBe("Add to bag for 10% off everything: it adds ₹779, not ₹999.");
    expect(marks()).toEqual(["open", "open", "open"]);
  });

  it("marks the rung the bag has reached and prices this piece as the third", () => {
    cart.totalItems = 2;
    cart.subtotal = 2198;
    const { container } = row(<PdpOfferLadder price={999} />);
    expect(marks()).toEqual(["current", "open", "open"]);
    expect(status(container)).toBe("Add to bag for 20% off everything: it adds ₹580, not ₹999.");
  });

  /* Three pieces are no longer the top: the fourth takes the whole bag to
     30%. 2,997 at 20% is 2,398 (2,397.60); 3,996 at 30% is 2,797 (2,797.20),
     so this piece adds 399. */
  it("at three pieces, Buy 3 is the bag's rung and this piece prices as the fourth", () => {
    cart.totalItems = 3;
    cart.subtotal = 2997;
    const { container } = row(<PdpOfferLadder price={999} />);
    expect(marks()).toEqual(["reached", "current", "open"]);
    expect(rung(2).hasAttribute("data-passed")).toBe(true);
    expect(container.querySelector("[data-offer-ladder]")?.getAttribute("data-state")).toBe("3");
    expect(status(container)).toBe("Add to bag for 30% off everything: it adds ₹399, not ₹999.");
  });

  /* The gold Buy 4 column prices this piece at ₹699 (999 at 30% is 699.30).
     The line under it used to add "adding this costs ₹700" (the whole bag
     rounded again: 4,995 at 30% is 3,497, from 3,496.50, less 2,797), two
     figures for one piece a line apart. One figure now, in the column. */
  it("at four pieces, every rung is reached and the line says the bag has 30%", () => {
    cart.totalItems = 4;
    cart.subtotal = 3996;
    const { container } = row(<PdpOfferLadder price={999} />);
    expect(marks()).toEqual(["reached", "reached", "current"]);
    expect(container.querySelector("[data-offer-ladder]")?.getAttribute("data-state")).toBe("4");
    expect(status(container)).toBe("30% off is on your bag, this piece included.");
    expect(rung(4).textContent).toContain("₹699 each");
    expect(status(container)).not.toMatch(/₹/);
    // The rung the bag has is said, not only drawn.
    expect(rung(4).textContent).toContain("in your bag");
  });

  it("keeps Buy 4 as the bag's rung past four pieces", () => {
    cart.totalItems = 6;
    cart.subtotal = 5994;
    const { container } = row(<PdpOfferLadder price={999} />);
    expect(marks()).toEqual(["reached", "reached", "current"]);
    expect(container.querySelector("[data-offer-ladder]")?.getAttribute("data-state")).toBe("4");
  });

  /* With pieces in the bag the one control is View bag: a text link with a
     full 44px target (clean.css `nc-tap`), floated to the right of the first
     line so the sentence runs round it. */
  it("opens the bag from View bag once it holds a piece", () => {
    cart.totalItems = 1;
    cart.subtotal = 999;
    const { container } = row(<PdpOfferLadder price={999} />);
    const button = screen.getByRole("button", { name: "View bag" });
    expect(button.className).toMatch(/\bnc-tap\b/);
    expect(button.className).toMatch(/\bnc-link\b/);
    expect(button.className).toMatch(/\bfloat-right\b/);
    expect(container.querySelectorAll("button")).toHaveLength(1);
    fireEvent.click(button);
    expect(cart.setDrawerOpen).toHaveBeenCalledWith(true);
  });

  /* On a 360px phone the add-on sentence takes two lines; the line holds that
     room from the first piece on, so a size chosen below never jumps as the
     sentence changes with the choice. */
  it("holds two lines' room for the sentence while the bag has pieces", () => {
    cart.totalItems = 2;
    cart.subtotal = 1998;
    const live = () => document.querySelector("[aria-live]") as HTMLElement;
    const { rerender } = row(<PdpOfferLadder price={999} />);
    expect(live().className).toMatch(/min-h-\[40px\]/);
    rerender(<dl><PdpOfferLadder price={999} preorder /></dl>);
    expect(live().className).toMatch(/min-h-\[40px\]/);
  });

  /* A typed code is never offered back as a saving the shopper has. Since
     3 Nov 2026 NAIRA10 (10%) matches Buy 2, so the line names Buy 3;
     FRIENDSANDFAMILY (20%) matches Buy 3, so since Buy 4 (7 Nov 2026) the
     line names the four-piece 30% rather than calling 20% the best price. */
  it("follows a typed code as it changes", () => {
    const { container } = row(<PdpOfferLadder price={999} />);
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
     bag: its figures give way to one sentence, the rungs step back (and keep
     their second line's room in clean.css, so the size buttons below do not
     jump under the finger), and no rung is marked as the bag's, since this
     choice cannot join it. */
  it("quotes no per-piece price for a pre-order choice", () => {
    cart.totalItems = 2;
    cart.subtotal = 1998;
    const { container } = row(<PdpOfferLadder price={999} preorder />);
    expect(container.textContent).not.toMatch(/₹/);
    expect(status(container)).toBe("Not on pre-orders. In-stock pieces only.");
    expect(container.querySelector("[data-offer-ladder] ul")?.hasAttribute("data-muted")).toBe(true);
    expect(rung(2).textContent).toBe("Buy 2 · 10% off");
    expect(marks()).toEqual(["open", "open", "open"]);
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });

  it("renders nothing without a price to work from", () => {
    const { container } = row(<PdpOfferLadder price={0} />);
    expect(container.querySelector("dl")?.innerHTML).toBe("");
  });

  /* The phone's buy bar keeps off the rungs' list while it is on screen
     (JewelDetailNext reads `[data-offer-ladder] ul`). Everything that marks a
     rung, the reached one's gold included, is on the list's own items. */
  it("keeps the rungs in one list, the element the buy bar keeps off", () => {
    cart.totalItems = 2;
    cart.subtotal = 1998;
    const { container } = row(<PdpOfferLadder price={999} />);
    const list = container.querySelector("[data-offer-ladder] ul") as HTMLElement;
    expect(list.className).toMatch(/\bnc-rungs\b/);
    expect([...list.children].map((li) => li.getAttribute("data-rung"))).toEqual(["2", "3", "4"]);
    expect(rung(2).closest("[data-offer-ladder] ul")).toBe(list);
    expect(rung(2).hasAttribute("data-current")).toBe(true);
    const page = readFileSync(resolve(__dirname, "../../pages/JewelDetailNext.tsx"), "utf8");
    expect(page).toContain('document.querySelector("[data-offer-ladder] ul")');
  });

  /* On a 320px phone the three columns are 68px each and "Buy 2 · 10%" is as
     wide: the rungs read "Buy 2 · 10%Buy 3 · 20%Buy 4 · 30%", no space
     between them. Under 360px each rung is a line of its own instead. */
  it("gives each rung its own line on a phone narrower than 360px", () => {
    const { container } = row(<PdpOfferLadder price={999} />);
    const list = container.querySelector("[data-offer-ladder] ul") as HTMLElement;
    expect(list.className).toContain("max-[359px]:!grid-flow-row");
    expect(list.className).toContain("max-[359px]:[&>li]:flex");
  });

  /* Nothing in the row is under 13px, and its type comes from the clean
     system: no sizes, faces or colours of its own. */
  it("sets no type or colour of its own", () => {
    const src = source().replace(/\/\*[\s\S]*?\*\//g, "");
    expect(src).not.toMatch(/text-\[|font-|tracking-|text-nf-|bg-nf-|border-nf-|#[0-9a-fA-F]{3,8}\b/);
    /* Its motion is clean.css's too, which stills everything under reduced motion. */
    expect(src).not.toMatch(/transition|animate-|duration-/);
  });

  /* No rate or rupee figure is typed into the component; all of it comes
     from promo.ts. */
  it("reads every rate and figure from promo.ts", () => {
    const src = source().replace(/\/\*[\s\S]*?\*\//g, "");
    expect(src).toMatch(/offers=\{QUANTITY_OFFERS\}/);
    expect(src).toMatch(/pieceAtRung\(price, offer\)/);
    expect(src).toMatch(/pdpOfferStatus\(/);
    expect(src).not.toMatch(/\d+%|0\.[123]\b|₹\d/);
  });
});
