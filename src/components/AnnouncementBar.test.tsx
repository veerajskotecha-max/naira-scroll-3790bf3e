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

/* The owner set the order: the sale, then the shipping promise, then the
   small-run line. Any change here is a change to what shoppers are told. */
const SEQUENCE = ["SITEWIDE SALE", "FREE INSURED SHIPPING ON ALL ORDERS", "MADE IN LIMITED BATCHES"];

const lines = (container: HTMLElement) =>
  [...container.querySelectorAll("a > div > span")].map((s) => s.textContent?.replace(/\u2726/g, "").trim());

describe("AnnouncementBar", () => {
  /* Nothing here may name a code (the owner took NAIRA10 off the header) or a
     rate (the percentage was asked off the sale line). */
  it("carries the sale, the shipping promise and the small-run line, no promo code and no rate", () => {
    bar();
    expect(screen.getAllByText(/SITEWIDE SALE/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/FREE INSURED SHIPPING/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/MADE IN LIMITED BATCHES/)[0]).toBeInTheDocument();
    expect(screen.queryByText(/NAIRA10/)).toBeNull();
    expect(screen.queryByText(/%/)).toBeNull();
  });

  /* The owner asked for the three lines to come round three times before the
     run repeats, and for the sale to lead. The run is still two identical
     halves, so the loop cannot jump. */
  it("runs the three lines in order, three times per half", () => {
    const { container } = bar();
    const spans = lines(container);
    const half = spans.slice(0, spans.length / 2);
    expect(half).toEqual([...SEQUENCE, ...SEQUENCE, ...SEQUENCE]);
  });

  /* The shared marquee crosses one half in 22s. Tripling the sequence without
     tripling the duration would send the strip past at three times the pace. */
  it("keeps the pace while carrying three cycles", () => {
    const { container } = bar();
    const track = container.querySelector("a > div") as HTMLElement;
    expect(track.style.animationDuration).toBe("66s");
  });

  /* The marquee animates to translateX(-50%): the run must be exactly two
     identical halves or the loop visibly jumps. */
  it("renders an even run so the loop does not jump", () => {
    const { container } = bar();
    const spans = lines(container);
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
