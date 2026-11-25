import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "fs";
import { resolve } from "path";
import { QUANTITY_OFFERS, quantityOfferProgress } from "@/lib/promo";
import { BagReturns, SimpleLadder } from "./CartDrawerNext";

afterEach(cleanup);

/* What a shopper reads in a rung: its words, without the note a screen
   reader hears on the rung the bag sits on (", in your bag"). */
const rungText = (rung: Element) => {
  const copy = rung.cloneNode(true) as Element;
  copy.querySelectorAll(".nc-sr").forEach((hidden) => hidden.remove());
  return copy.textContent;
};

/* The bag's offer is one line of words over one 2px line: the three rungs,
   the one the bag sits on marked, and the line filling as pieces arrive. It
   states the offer and nothing else: the line that rode on top of it, that a
   sitewide sale was live today, described a permanent offer as a passing one
   and is gone. */
describe("SimpleLadder: the bag's offer strip", () => {
  it("states all three rungs as words", () => {
    const { container } = render(<SimpleLadder totalItems={1} />);
    const rungs = [...container.querySelectorAll("[data-ladder] [data-rung]")];
    expect(rungs.map(rungText)).toEqual(["Buy 2 · 10% off", "Buy 3 · 20% off", "Buy 4 · 30% off"]);
    expect(rungs.map((rung) => rung.getAttribute("data-rung"))).toEqual(QUANTITY_OFFERS.map((offer) => String(offer.minQuantity)));
  });

  it("no longer says a sitewide sale is live today", () => {
    const { container } = render(<SimpleLadder totalItems={3} />);
    const ladder = container.querySelector("[data-ladder]") as HTMLElement;
    expect(ladder.textContent).not.toMatch(/sitewide sale/i);
    expect(ladder.textContent).not.toMatch(/live today/i);
    expect(ladder.textContent).not.toMatch(/up to/i);
    expect(ladder.querySelector("p")).toBeNull();
  });

  /* The strip is two things, the words and the line under them: no marks on
     the line, no second row of labels, nothing to press. */
  it("is the rungs and the line, with nothing else", () => {
    const { container } = render(<SimpleLadder totalItems={2} />);
    const ladder = container.querySelector("[data-ladder]") as HTMLElement;
    expect([...ladder.children].map((child) => child.tagName)).toEqual(["UL", "DIV"]);
    expect(ladder.lastElementChild?.getAttribute("role")).toBe("progressbar");
    expect(ladder.querySelector("[data-rung-mark], [data-rung-label]")).toBeNull();
    expect(ladder.querySelector("a, button, svg, img")).toBeNull();
  });

  /* The line fills to a sixth at two pieces and to a half at three. Three
     equal columns across the whole sheet put the middle of "Buy 2" at a sixth
     and of "Buy 3" at a half, so the line stops exactly under the rung it
     marks. Any side padding on the rungs moves the words off it (16px of it
     put "Buy 2" 11px to the right of where the line stopped). */
  it("sets the rungs in three columns the full width of the line under them", () => {
    const { container } = render(<SimpleLadder totalItems={2} />);
    const rungs = container.querySelector("[data-ladder] > ul") as HTMLElement;
    const classes = rungs.className.split(/\s+/);
    expect(classes).toContain("nc-rungs--center");
    expect(classes.filter((name) => /(^|:)-?(p[xlrse]?|m[xlrse])-/.test(name) && !/^py-/.test(name))).toEqual([]);
    expect(rungs.querySelectorAll(":scope > li")).toHaveLength(3);
    const ladder = container.querySelector("[data-ladder]") as HTMLElement;
    expect(ladder.className.split(/\s+/).some((name) => /(^|:)-?(p|m)[xlrse]?-/.test(name))).toBe(false);
  });

  /* The rung the bag sits on follows the pieces, and the line fills piece by
     piece (promo.ts `quantityOfferProgress`). */
  it.each([
    [1, null, [], "8.333"],
    [2, "2", [], "16.667"],
    [3, "3", ["2"], "50.000"],
    [4, "4", ["2", "3"], "100.000"],
    [5, "4", ["2", "3"], "100.000"],
  ])("at %i pieces marks rung %s, steps back %j and fills %s%%", (n, current, passed, width) => {
    const { container } = render(<SimpleLadder totalItems={n} />);
    const marked = [...container.querySelectorAll("[data-rung][data-current]")].map((rung) => rung.getAttribute("data-rung"));
    expect(marked).toEqual(current ? [current] : []);
    expect([...container.querySelectorAll("[data-rung][data-passed]")].map((rung) => rung.getAttribute("data-rung"))).toEqual(passed);
    const bar = container.querySelector('[role="progressbar"]') as HTMLElement;
    const fill = bar.querySelector("span") as HTMLElement;
    expect(parseFloat(fill.style.width).toFixed(3)).toBe(width);
    expect(parseFloat(fill.style.width)).toBeCloseTo(quantityOfferProgress(n) * 100, 3);
    expect(bar.getAttribute("aria-valuenow")).toBe(String(Math.min(n, 4)));
    expect(bar.getAttribute("aria-valuemax")).toBe("4");
    expect(bar.getAttribute("aria-label")).toBe(`${n} of 4 pieces`);
  });

  /* The rung the bag has reached is said, not only coloured. */
  it("tells a screen reader which rung the bag sits on", () => {
    const { container } = render(<SimpleLadder totalItems={3} />);
    expect(container.querySelector("[data-current]")?.textContent).toBe("Buy 3 · 20% off, in your bag");
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

  /* Words only: the arrow that used to sit before them is gone. */
  it("is a text link with no icon", () => {
    const { container } = render(
      <MemoryRouter>
        <BagReturns />
      </MemoryRouter>,
    );
    expect(container.querySelector("svg, img")).toBeNull();
    expect(container.querySelector("[data-returns]")?.className).toMatch(/\bnc-link\b/);
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

/* The clean system's one rule for the bag (SPEC section 2): type and colour
   come from the nc- classes and the --nc- tokens and from nowhere else.
   Tailwind utilities in the bag's files are layout only, so a font, a text
   size, a brand colour utility, a radius, a shadow or a raw hex value in any
   of them is a drift back to the old look. */
describe("the bag's files draw from the clean system alone", () => {
  const FILES = ["CartDrawerNext.tsx", "cart/BagLine.tsx", "cart/BagOffer.tsx", "cart/BagEmpty.tsx", "cart/BagTrust.tsx"];
  /* Comments may name what was removed; the rule is about the code. */
  const code = (file: string) =>
    readFileSync(resolve(__dirname, file), "utf8")
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
  const FORBIDDEN: Array<[string, RegExp]> = [
    ["a font utility", /(^|[\s"'`{])!?font-[a-z]/m],
    ["an arbitrary text size or colour", /(^|[\s"'`{:])!?text-\[/m],
    ["a brand text colour utility", /text-nf-/],
    ["a brand fill utility", /bg-nf-/],
    ["a brand border utility", /border-nf-/],
    ["a tracking utility", /(^|[\s"'`{:])!?-?tracking-/m],
    ["a radius utility", /(^|[\s"'`{:])!?rounded(-|\b)/m],
    ["a shadow utility", /(^|[\s"'`{:])!?shadow(-|\b)/m],
    ["the old palette's variables", /--nf-/],
    ["a raw hex colour", /#[0-9a-fA-F]{3,8}\b/],
    ["an rgb or hsl colour", /\b(rgba?|hsla?)\(/],
    ["the UPI discs", /UpiBadges/],
    ["the card marks", /PayMarks/],
    ["the shared button", /components\/ui\/button/],
  ];

  it.each(FILES)("%s", (file) => {
    const text = code(file);
    for (const [what, pattern] of FORBIDDEN) expect(pattern.test(text), `${file} uses ${what}`).toBe(false);
  });

  it("carries the clean root on the sheet and writes its stylesheet inside it", () => {
    const text = code("CartDrawerNext.tsx");
    expect(text).toMatch(/className=\{?[`"]nf-palette nf-clean /);
    expect(text).toMatch(/<CleanStyles \/>/);
    expect(text).toMatch(/closeClassName="hidden"/);
  });

  /* The bag is its own offer's only home: no "Sitewide sale live today". */
  it("does not say a sale is live today anywhere in the bag", () => {
    for (const file of FILES) expect(code(file)).not.toMatch(/sitewide sale|live today/i);
  });
});
