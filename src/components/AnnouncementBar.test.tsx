import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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
  /* The owner asked for the code to come off the header, but wanted the
     small-run scarcity line kept alongside the shipping promise — the strip
     carries exactly those two messages and nothing here may name a code. */
  it("carries the shipping promise and the limited-pieces line, no promo code", () => {
    bar();
    expect(screen.getAllByText(/FREE INSURED SHIPPING/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/LIMITED PIECES IN STOCK/)[0]).toBeInTheDocument();
    expect(screen.queryByText(/NAIRA10/)).toBeNull();
  });

  /* The marquee animates to translateX(-50%): the run must be exactly two
     identical halves or the loop visibly jumps. */
  it("renders an even run so the loop does not jump", () => {
    const { container } = bar();
    const spans = [...container.querySelectorAll("a > div > span")].map((s) => s.textContent);
    expect(spans.length % 2).toBe(0);
    expect(spans.slice(0, spans.length / 2)).toEqual(spans.slice(spans.length / 2));
  });
});
