import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "fs";
import { resolve } from "path";
import { afterEach, describe, expect, it } from "vitest";
import HeroSection from "./HeroSection";

afterEach(cleanup);

/* The owner (2 Nov 2026): the offer in the home page's headline too. One
   quiet label under the headline, rates from promo.ts, nothing to tap. */
describe("HeroSection: the offer under the headline", () => {
  it("states both rungs under the headline", () => {
    const { container } = render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>,
    );
    const line = container.querySelector("[data-hero-offer]") as HTMLElement;
    expect(line.textContent).toBe("Buy 2, 20% off · Buy 3, 30% off");
    expect(line.previousElementSibling?.tagName).toBe("H1");
    expect(line.querySelectorAll("a, button")).toHaveLength(0);
  });

  it("reads the rates from promo.ts", () => {
    const src = readFileSync(resolve(__dirname, "HeroSection.tsx"), "utf8");
    const line = src.slice(src.indexOf("data-hero-offer"), src.indexOf("</p>", src.indexOf("data-hero-offer")));
    expect(line).toMatch(/QUANTITY_OFFERS\.map/);
    expect(line).not.toMatch(/\d+%/);
  });
});
