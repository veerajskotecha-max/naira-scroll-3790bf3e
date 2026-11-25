import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CLEAN_ROOT,
  CleanDots,
  CleanDropdown,
  CleanDropdowns,
  CleanFact,
  CleanFacts,
  CleanPrice,
  CleanRungs,
  CleanStepper,
  CleanStyles,
  CleanTrack,
  cleanButton,
  cleanType,
  percent,
  rungStates,
  rupees,
} from "./index";

afterEach(cleanup);

/* A ladder for these parts to draw, not the shop's offer (that is promo.ts,
   two rungs since 25 Nov 2026): three rungs here, so a rung still ahead of a
   three-piece bag can be drawn. */
const OFFERS = [
  { code: "BUY2", minQuantity: 2, rate: 0.1 },
  { code: "BUY3", minQuantity: 3, rate: 0.2 },
  { code: "BUY4", minQuantity: 4, rate: 0.3 },
] as const;

describe("format", () => {
  it("writes rupees whole, with Indian grouping", () => {
    expect(rupees(1049)).toBe("₹1,049");
    expect(rupees(125000)).toBe("₹1,25,000");
    expect(rupees(839.3)).toBe("₹839");
  });
  it("writes a rate as a whole percentage", () => {
    expect(percent(0.2)).toBe("20%");
    expect(percent(0.3)).toBe("30%");
  });
});

describe("rungStates: where a bag stands on the ladder", () => {
  const mins = OFFERS.map((offer) => offer.minQuantity);
  it("marks nothing below the first rung", () => {
    expect(rungStates(0, mins)).toEqual(["ahead", "ahead", "ahead"]);
    expect(rungStates(1, mins)).toEqual(["ahead", "ahead", "ahead"]);
  });
  it("marks the highest rung reached as current and the ones under it as passed", () => {
    expect(rungStates(2, mins)).toEqual(["current", "ahead", "ahead"]);
    expect(rungStates(3, mins)).toEqual(["passed", "current", "ahead"]);
    expect(rungStates(4, mins)).toEqual(["passed", "passed", "current"]);
    expect(rungStates(9, mins)).toEqual(["passed", "passed", "current"]);
  });
  it("follows whatever ladder it is given", () => {
    expect(rungStates(3, [3, 4])).toEqual(["current", "ahead"]);
    expect(rungStates(5, [])).toEqual([]);
  });
});

describe("CleanRungs: the offer as words", () => {
  it("names each rung and its rate, with the piece's price there when given", () => {
    const { container } = render(<CleanRungs offers={OFFERS} totalItems={0} each={(offer) => `${rupees(1049 * (1 - offer.rate))} each`} />);
    const rungs = [...container.querySelectorAll("li")].map((li) => li.textContent);
    expect(rungs).toEqual(["Buy 2 · extra 10% off₹944 each", "Buy 3 · extra 20% off₹839 each", "Buy 4 · extra 30% off₹734 each"]);
    expect(container.querySelector("[data-current]")).toBeNull();
    expect(container.querySelector("a, button")).toBeNull();
  });
  it("marks the rung the bag sits on, and says so to a screen reader", () => {
    const { container } = render(<CleanRungs offers={OFFERS} totalItems={3} />);
    const current = container.querySelector("[data-current]");
    expect(current?.getAttribute("data-rung")).toBe("3");
    expect(current?.textContent).toBe("Buy 3 · extra 20% off, in your bag");
    expect(container.querySelector('[data-rung="2"]')?.hasAttribute("data-passed")).toBe(true);
    expect(container.querySelector('[data-rung="2"]')?.hasAttribute("data-reached")).toBe(true);
    expect(container.querySelector('[data-rung="4"]')?.hasAttribute("data-reached")).toBe(false);
  });
  it("marks no rung on a pre-order choice, whatever the bag holds", () => {
    const { container } = render(<CleanRungs offers={OFFERS} totalItems={4} muted />);
    expect(container.querySelector("[data-current], [data-reached]")).toBeNull();
    expect(container.querySelector("ul")?.hasAttribute("data-muted")).toBe(true);
  });
  it("centres itself for the bag", () => {
    const { container } = render(<CleanRungs offers={OFFERS} totalItems={2} centered />);
    expect(container.querySelector("ul")?.className).toContain("nc-rungs--center");
  });
});

describe("CleanTrack: the 2px line", () => {
  it("is a progress bar filled to its value", () => {
    render(<CleanTrack value={0.5} now={3} max={4} label="3 of 4 pieces" />);
    const bar = screen.getByRole("progressbar", { name: "3 of 4 pieces" });
    expect(bar.getAttribute("aria-valuenow")).toBe("3");
    expect(bar.getAttribute("aria-valuemax")).toBe("4");
    expect((bar.firstElementChild as HTMLElement).style.width).toBe("50%");
  });
  it("never overflows or runs backwards", () => {
    const { rerender } = render(<CleanTrack value={1.4} now={7} max={4} label="x" />);
    const bar = screen.getByRole("progressbar");
    expect((bar.firstElementChild as HTMLElement).style.width).toBe("100%");
    expect(bar.getAttribute("aria-valuenow")).toBe("4");
    rerender(<CleanTrack value={-1} now={-2} max={4} label="x" />);
    expect((bar.firstElementChild as HTMLElement).style.width).toBe("0%");
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
  });
});

describe("CleanDropdown: a row that folds its contents away", () => {
  it("is closed until asked for, with its contents still in the page", () => {
    const { container } = render(
      <CleanDropdowns>
        <CleanDropdown title="Care and plating" id="pdp-panel-care">
          <p>Store in the pouch.</p>
        </CleanDropdown>
      </CleanDropdowns>,
    );
    const details = container.querySelector("details")!;
    expect(details.open).toBe(false);
    expect(details.querySelector("summary")?.textContent).toBe("Care and plating");
    expect(container.querySelector("#pdp-panel-care")?.textContent).toBe("Store in the pouch.");
    expect(container.querySelector(".nc-drops")).not.toBeNull();
  });
  it("can start open", () => {
    const { container } = render(
      <CleanDropdown title="Description" defaultOpen>
        <p>Braided by hand.</p>
      </CleanDropdown>,
    );
    expect(container.querySelector("details")!.open).toBe(true);
  });
  it("tells its caller when it opens and closes", () => {
    const onToggle = vi.fn();
    const { container } = render(
      <CleanDropdown title="Delivery and returns" onToggle={onToggle}>
        <p>Free insured shipping.</p>
      </CleanDropdown>,
    );
    const details = container.querySelector("details")!;
    details.open = true;
    fireEvent(details, new Event("toggle"));
    expect(onToggle).toHaveBeenLastCalledWith(true);
    details.open = false;
    fireEvent(details, new Event("toggle"));
    expect(onToggle).toHaveBeenLastCalledWith(false);
  });
  it("keeps its plus out of the reading order", () => {
    const { container } = render(
      <CleanDropdown title="Description">
        <p>x</p>
      </CleanDropdown>,
    );
    expect(container.querySelector(".nc-drop__mark")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("CleanStepper: the bag's quantity", () => {
  it("shows the quantity and calls back for each side", () => {
    const down = vi.fn();
    const up = vi.fn();
    render(<CleanStepper quantity={2} onDecrease={down} onIncrease={up} />);
    expect(screen.getByLabelText("Quantity 2").textContent).toBe("2");
    fireEvent.click(screen.getByRole("button", { name: "Decrease quantity" }));
    fireEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(down).toHaveBeenCalledTimes(1);
    expect(up).toHaveBeenCalledTimes(1);
  });
  it("lets the caller name what minus does at one piece", () => {
    render(<CleanStepper quantity={1} onDecrease={() => {}} onIncrease={() => {}} decreaseLabel="Remove Woven Gold Hoops" />);
    expect(screen.getByRole("button", { name: "Remove Woven Gold Hoops" })).toBeTruthy();
  });
  it("stops both buttons while the bag is busy", () => {
    const down = vi.fn();
    render(<CleanStepper quantity={1} onDecrease={down} onIncrease={down} disabled />);
    screen.getAllByRole("button").forEach((button) => {
      expect((button as HTMLButtonElement).disabled).toBe(true);
      fireEvent.click(button);
    });
    expect(down).not.toHaveBeenCalled();
  });
});

describe("CleanPrice: the price row", () => {
  it("shows the price, the struck MRP, the saving and the note, in that order", () => {
    const { container } = render(<CleanPrice id="product-price" price="₹1,049" compareAt="₹1,749" percentOff={40} note="incl. 3% GST" />);
    const row = container.querySelector("#product-price")!;
    expect([...row.children].map((child) => child.textContent)).toEqual(["₹1,049", "₹1,749", "40% off", "incl. 3% GST"]);
    expect(row.querySelector("del")?.textContent).toBe("₹1,749");
  });
  it("shows no MRP and no saving when there is nothing saved", () => {
    const { container, rerender } = render(<CleanPrice price="₹999" compareAt="₹999" percentOff={0} />);
    expect(container.textContent).toBe("₹999");
    rerender(<CleanPrice price="₹999" compareAt={null} percentOff={12} />);
    expect(container.textContent).toBe("₹999");
    rerender(<CleanPrice price="₹999" />);
    expect(container.textContent).toBe("₹999");
  });
});

describe("CleanFacts: labels and their values", () => {
  it("is a description list, one row per fact", () => {
    const { container } = render(
      <CleanFacts>
        <CleanFact label="Quality">
          <CleanDots items={["Anti-tarnish", "Skin-friendly", "PVD 18K gold coated"]} />
        </CleanFact>
        <CleanFact label="Offer">Buy more</CleanFact>
      </CleanFacts>,
    );
    expect(container.querySelector("dl")).not.toBeNull();
    expect([...container.querySelectorAll("dt")].map((dt) => dt.textContent)).toEqual(["Quality", "Offer"]);
    expect(container.querySelectorAll(".nc-facts__row")).toHaveLength(2);
  });
  it("drops empty values from a dotted line", () => {
    const { container } = render(<CleanDots items={["Anti-tarnish", false, null, undefined, "", "Zircone Stone"]} />);
    const items = [...container.querySelectorAll(".nc-dots > span > span")].map((span) => span.textContent);
    expect(items).toEqual(["Anti-tarnish", "Zircone Stone"]);
  });
});

describe("class names", () => {
  it("builds the one button family", () => {
    expect(cleanButton()).toBe("nc-btn");
    expect(cleanButton({ fill: "ink" })).toBe("nc-btn nc-btn--ink");
    expect(cleanButton({ fill: "ink", size: "bar" })).toBe("nc-btn nc-btn--ink nc-btn--bar");
    expect(cleanButton({ size: "sm", block: true })).toBe("nc-btn nc-btn--sm nc-btn--block");
  });
  it("names the root and the type styles", () => {
    expect(CLEAN_ROOT).toBe("nf-clean");
    expect(cleanType.title).toBe("nc-title");
    expect(cleanType.eyebrow).toBe("nc-label nc-label--gold");
  });
  it("writes the stylesheet into the page", () => {
    const { container } = render(<CleanStyles />);
    expect(container.querySelector("style[data-nf-clean]")).not.toBeNull();
  });
});
