import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import AnnouncementBar from "./AnnouncementBar";
import { ACCEPTED_PROMO_CODES } from "@/lib/promo";

afterEach(cleanup);

const bar = () =>
  render(
    <MemoryRouter>
      <AnnouncementBar />
    </MemoryRouter>,
  );

describe("AnnouncementBar", () => {
  /* The strip is the only place a shopper is told the welcome code exists —
     the ladder in the bag is applied automatically, this one must be typed.
     Advertising a code the resolver does not accept would send shoppers to a
     checkout that rejects it. */
  it("advertises a code the app actually accepts", () => {
    bar();
    const shown = screen.getAllByText(/NAIRA10/)[0];
    expect(shown).toBeInTheDocument();
    expect(ACCEPTED_PROMO_CODES).toContain("NAIRA10");
  });

  it("keeps the scarcity line alongside it", () => {
    bar();
    expect(screen.getAllByText(/LIMITED PIECES IN STOCK/)[0]).toBeInTheDocument();
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
