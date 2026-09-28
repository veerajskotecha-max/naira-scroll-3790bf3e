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
  /* The owner asked for the strip to carry only the shipping promise — no
     promo code up here. The code still resolves in the bag; it just is not
     advertised on the header any more, so nothing here may name one. */
  it("carries only the free insured shipping line", () => {
    bar();
    expect(screen.getAllByText(/FREE INSURED SHIPPING/)[0]).toBeInTheDocument();
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
