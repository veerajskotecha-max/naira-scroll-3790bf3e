import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "fs";
import { resolve } from "path";
import { afterEach, describe, expect, it } from "vitest";
import HeroSection from "./HeroSection";

afterEach(cleanup);

/* The owner (2 Nov 2026): the offer in the home page's headline too. One
   quiet label under the headline, rates from promo.ts, nothing to tap. Since
   7 Nov 2026 the ladder has three rungs; it must name the new top (30%), never
   leave 20% looking like the most it gives. */
describe("HeroSection: the offer under the headline", () => {
  it("states every rung under the headline, and the top of it on a phone", () => {
    const { container } = render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>,
    );
    const line = container.querySelector("[data-hero-offer]") as HTMLElement;
    expect(line.querySelector("[data-hero-offer-ladder]")?.textContent?.trim()).toBe("Buy 2, 10% off · Buy 3, 20% off · Buy 4, 30% off");
    expect(line.querySelector("[data-hero-offer-short]")?.textContent).toBe("Up to 30% off when you buy more");
    expect(line.previousElementSibling?.tagName).toBe("H1");
    expect(line.querySelectorAll("a, button")).toHaveLength(0);
  });

  /* 9px read as dust on a phone; 11px is the floor for anything she must read. */
  it("sets the line at 11px or more", () => {
    const { container } = render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>,
    );
    const line = container.querySelector("[data-hero-offer]") as HTMLElement;
    const sizes = [...line.className.matchAll(/text-\[(\d+(?:\.\d+)?)px\]/g)].map((m) => Number(m[1]));
    expect(sizes.length).toBeGreaterThan(0);
    sizes.forEach((px) => expect(px).toBeGreaterThanOrEqual(11));
  });

  /* CLAUDE.md design rule 1: no arbitrary tracking-[...] where a token has
     the value. The line came in with tracking-[0.16em] / [0.24em], which are
     exactly tracking-nf-16 / nf-24. */
  it("spaces the line with the letter-spacing tokens", () => {
    const { container } = render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>,
    );
    const line = container.querySelector("[data-hero-offer]") as HTMLElement;
    expect(line.className).toMatch(/(^|\s)tracking-nf-16(\s|$)/);
    expect(line.className).toMatch(/(^|\s)sm:tracking-nf-24(\s|$)/);
    expect(line.className).not.toMatch(/tracking-\[/);
  });

  it("reads the rates from promo.ts", () => {
    const src = readFileSync(resolve(__dirname, "HeroSection.tsx"), "utf8");
    const line = src.slice(src.indexOf("data-hero-offer"), src.indexOf("</p>", src.indexOf("data-hero-offer")));
    expect(line).toMatch(/QUANTITY_OFFERS\.map/);
    expect(line).not.toMatch(/\d+%/);
  });
});
