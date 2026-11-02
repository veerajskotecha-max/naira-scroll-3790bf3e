import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "fs";
import { resolve } from "path";
import { BagReturns, SimpleLadder } from "./CartDrawerNext";

afterEach(cleanup);

/* The offer's explanation rides ON TOP of the track, where the eye lands
   first — it must name the saving (up to 30% off), say it runs today, and
   carry the limited-stock urgency. */
describe("SimpleLadder: the bag's offer track", () => {
  it("leads with the up-to-30% explanation on top of the track", () => {
    const { container } = render(<SimpleLadder totalItems={1} />);
    const ladder = container.querySelector("[data-ladder]") as HTMLElement;
    expect(ladder.firstElementChild?.textContent).toContain("Sitewide sale live today");
    expect(ladder.firstElementChild?.textContent).toContain("up to 30% off");
  });

  it("still states both rungs under the track", () => {
    render(<SimpleLadder totalItems={1} />);
    expect(screen.getByText(/Buy 2 get 20% off/i)).toBeTruthy();
    expect(screen.getByText(/Buy 3 get 30% off/i)).toBeTruthy();
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

/* Three of one piece at 30% divide a rounded total by three: "₹699.33 each"
   read like an error. Each shows in whole rupees, as the product page quotes
   it; the line total stays the exact rupee figure the checkout charges. */
describe("bag line prices", () => {
  it("shows each piece's price in whole rupees", () => {
    const src = readFileSync(resolve(__dirname, "CartDrawerNext.tsx"), "utf8");
    expect(src).toMatch(/const formatUnitPrice = \(n: number\) => `₹\$\{Math\.round\(n\)\.toLocaleString\("en-IN"\)\}`/);
    expect(src).not.toMatch(/maximumFractionDigits: 2/);
  });
});
