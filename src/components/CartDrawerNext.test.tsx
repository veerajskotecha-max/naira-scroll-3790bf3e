import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "fs";
import { resolve } from "path";
import { BagReturns, SimpleLadder } from "./CartDrawerNext";

afterEach(cleanup);

/* The offer's explanation rides ON TOP of the track, where the eye lands
   first — it must name the saving (up to 30% off, the top rung since the
   owner added Buy 4 on 7 Nov 2026; 20% would now undersell it) and say it
   runs today. */
describe("SimpleLadder: the bag's offer track", () => {
  it("leads with the up-to-30% explanation on top of the track", () => {
    const { container } = render(<SimpleLadder totalItems={1} />);
    const ladder = container.querySelector("[data-ladder]") as HTMLElement;
    expect(ladder.firstElementChild?.textContent).toContain("Sitewide sale live today");
    expect(ladder.firstElementChild?.textContent).toContain("up to 30% off");
    expect(ladder.textContent).not.toContain("up to 20%");
  });

  /* 8.5px was dust on a phone; 11px is the least a shopper can read. */
  it("sets the line over the track at 11px", () => {
    const { container } = render(<SimpleLadder totalItems={1} />);
    expect((container.querySelector("[data-ladder] > p") as HTMLElement).className).toMatch(/text-\[11px\]/);
  });

  /* At 11px a 280-320px phone broke the line mid-phrase: "Sitewide sale
     live / today · up to 30% off". Each half is held together, with the dot
     on the first, so the only break falls after the dot. */
  it("breaks the line over the track only after the dot", () => {
    const { container } = render(<SimpleLadder totalItems={1} />);
    const line = container.querySelector("[data-ladder] > p") as HTMLElement;
    const halves = [...line.children] as HTMLElement[];
    expect(halves.map((h) => h.textContent)).toEqual(["✦ Sitewide sale live today ·", "up to 30% off"]);
    halves.forEach((h) => expect(h.className).toMatch(/\bwhitespace-nowrap\b/));
    expect(line.textContent).toBe("✦ Sitewide sale live today · up to 30% off");
  });

  it("states all three rungs under the track", () => {
    const { container } = render(<SimpleLadder totalItems={1} />);
    const labels = [...container.querySelectorAll("[data-rung-label]")].map((l) => [...l.children].map((c) => c.textContent).join(" "));
    expect(labels).toEqual(["Buy 2 10% off", "Buy 3 20% off", "Buy 4 30% off"]);
  });

  /* Each label sits in its own third, under its own ring (1/6, 1/2, 5/6): at
     the rungs' piece counts Buy 3 and Buy 4 were a quarter apart, Buy 4 at the
     very end, and their labels met on a 280px phone. */
  it("centres each ring in its own third, over its label", () => {
    const { container } = render(<SimpleLadder totalItems={2} />);
    const lefts = [...container.querySelectorAll("[data-rung-mark]")].map((m) => parseFloat((m as HTMLElement).style.left).toFixed(2));
    expect(lefts).toEqual(["16.67", "50.00", "83.33"]);
    expect(container.querySelector("[data-rung-label]")?.parentElement?.className).toMatch(/grid-cols-3/);
  });

  /* The track fills piece by piece and meets each ring as it is reached. */
  it.each([
    [1, "8.333", [false, false, false]],
    [2, "16.667", [true, false, false]],
    [3, "50.000", [true, true, false]],
    [4, "100.000", [true, true, true]],
    [5, "100.000", [true, true, true]],
  ])("at %i pieces fills %s%% and fills the rings it has reached", (n, width, reached) => {
    const { container } = render(<SimpleLadder totalItems={n} />);
    const fill = container.querySelector('[role="progressbar"] > span') as HTMLElement;
    expect(parseFloat(fill.style.width).toFixed(3)).toBe(width);
    expect([...container.querySelectorAll("[data-rung-mark]")].map((m) => m.className.includes("bg-nf-ink"))).toEqual(reached);
    expect(container.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow")).toBe(String(Math.min(n, 4)));
  });
});

/* The bag says "easy 7-day exchange & returns" in its own words, and sends the
   shopper to the policy that states the window — a promise with no page behind
   it is the kind of line that turns into a WhatsApp argument. */
describe("BagReturns: the bag's exchange and returns line", () => {
  it("promises an easy 7-day exchange and returns", () => {
    render(
      <MemoryRouter>
        <BagReturns />
      </MemoryRouter>,
    );
    expect(screen.getByText(/easy 7-day exchange & returns/i)).toBeTruthy();
  });

  it("links to the policy that spells the window out", () => {
    render(
      <MemoryRouter>
        <BagReturns />
      </MemoryRouter>,
    );
    const line = screen.getByText(/easy 7-day exchange & returns/i).closest("a");
    expect(line).toHaveAttribute("href", "/exchange-return-policy");
  });
});

/* Three of one piece at 20% divide a rounded total by three: three ₹999
   pieces come to ₹2,398, and "₹799.33 each" would read like an error. Each
   shows in whole rupees, as the product page quotes it; the line total stays
   the exact rupee figure the checkout charges. */
describe("bag line prices", () => {
  it("shows each piece's price in whole rupees", () => {
    const src = readFileSync(resolve(__dirname, "CartDrawerNext.tsx"), "utf8");
    expect(src).toMatch(/const formatUnitPrice = \(n: number\) => `₹\$\{Math\.round\(n\)\.toLocaleString\("en-IN"\)\}`/);
    expect(src).not.toMatch(/maximumFractionDigits: 2/);
  });
});
