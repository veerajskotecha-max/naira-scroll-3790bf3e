import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "fs";
import { resolve } from "path";
import { afterEach, describe, expect, it } from "vitest";
import AnnouncementBar from "./AnnouncementBar";

afterEach(cleanup);

const bar = () =>
  render(
    <MemoryRouter>
      <AnnouncementBar />
    </MemoryRouter>,
  );

describe("AnnouncementBar", () => {
  /* The owner asked for the code to come off the header, the percentage off
     the strip (the bag's ladder names it), an exclamation mark on the sale,
     and the other lines kept short — the strip carries exactly these three
     messages and nothing here may name a code or a percentage. */
  it("carries the sale, the shipping promise and the limited-batch line, nothing longer", () => {
    bar();
    expect(screen.getAllByText(/SITEWIDE SALE!/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/FREE INSURED SHIPPING$/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/MADE IN LIMITED BATCHES/)[0]).toBeInTheDocument();
    expect(screen.queryByText(/NAIRA10/)).toBeNull();
    expect(screen.queryByText(/20% OFF/)).toBeNull();
  });

  /* The marquee animates to translateX(-50%): the run must be exactly two
     identical halves or the loop visibly jumps. */
  it("renders an even run so the loop does not jump", () => {
    const { container } = bar();
    const spans = [...container.querySelectorAll("a > div > span")].map((s) => s.textContent);
    expect(spans.length % 2).toBe(0);
    expect(spans.slice(0, spans.length / 2)).toEqual(spans.slice(spans.length / 2));
  });

  /* The product page puts "nf-next" on the root, and that rule used to freeze
     the run and hide every line but the first — a shopper landing from an ad
     saw a still shipping bar and never the sale. No page may stop the strip or
     drop one of its lines. */
  it("keeps running and shows every line on the product page too", () => {
    const css = readFileSync(resolve(__dirname, "../index.css"), "utf8");
    const bodies = [...css.matchAll(/\[data-announcement\][^{]*\{([^}]*)\}/g)].map((m) => m[1]);
    expect(bodies.length).toBeGreaterThan(0);
    for (const body of bodies) {
      expect(body).not.toMatch(/animation:\s*none/);
      expect(body).not.toMatch(/display:\s*none/);
    }
  });
});
