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
  /* The owner asked (2 Nov 2026) for the offer to lead the strip. The rates
     are literals here on purpose, as in OfferProgress.test.tsx: promo.ts
     moving without the Shopify codes fails this too (10% and 20% since 3 Nov
     2026). The code stays off the header (the owner's earlier ask), and the
     three older lines follow. */
  it("leads with the buy-more offer, then the sale, shipping and limited-batch lines", () => {
    const { container } = bar();
    const lines = [...container.querySelectorAll("a > div > span")].map((s) => s.firstChild?.textContent);
    expect(lines.slice(0, 4)).toEqual([
      "BUY 2 GET 10% OFF · BUY 3 GET 20% OFF",
      "SITEWIDE SALE LIVE TODAY!",
      "FREE INSURED SHIPPING",
      "MADE IN LIMITED BATCHES",
    ]);
    expect(screen.queryByText(/NAIRA10|BUY2\b|BUY3\b|FRIENDSANDFAMILY/)).toBeNull();
    expect(container.querySelector("a")?.getAttribute("aria-label")).toMatch(/buy 2 get 10% off · buy 3 get 20% off/);
  });

  /* The rates come from promo.ts, never typed into the strip. */
  it("reads the rates from promo.ts", () => {
    const src = readFileSync(resolve(__dirname, "AnnouncementBar.tsx"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(src).toMatch(/QUANTITY_OFFERS\.map/);
    expect(src).not.toMatch(/\d+%/);
  });

  /* A longer run on the same 22 s would race. The duration grows with the
     run so the letters keep the pace they had: 22 s for the three older lines,
     about 32 s with the offer leading. */
  it("keeps the strip's pace with the longer run", () => {
    const { container } = bar();
    const seconds = parseFloat((container.querySelector(".animate-marquee") as HTMLElement).style.animationDuration);
    expect(seconds).toBeGreaterThan(30);
    expect(seconds).toBeLessThan(35);
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
