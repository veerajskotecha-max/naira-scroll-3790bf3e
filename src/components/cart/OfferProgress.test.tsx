import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import OfferProgress from "./OfferProgress";

afterEach(cleanup);

/*
  The percentages below are written as literals ON PURPOSE.

  The banner reads its rates from QUANTITY_OFFERS, so a rate changed in
  promo.ts alone would keep the component and its source in perfect agreement
  while both drifted away from the live Shopify codes — and the bag would
  promise a discount Fastrr never applies. Hard-coding them here means the
  rates cannot be moved without this file failing, which is the prompt to go
  and change BUY2/BUY3 in Shopify at the same time.

  Live at the time of writing: BUY2 = 10% at 2+ pieces, BUY3 = 20% at 3+.
*/
describe("OfferProgress", () => {
  it("pushes the shopper towards the first rung before they reach it", () => {
    render(<OfferProgress totalItems={1} />);
    expect(screen.getByText("Add 1 piece, save 10%")).toBeInTheDocument();
  });

  it("confirms the earned rung and names the next one", () => {
    render(<OfferProgress totalItems={2} />);
    expect(screen.getByText("10% off — add 1 piece for 20%")).toBeInTheDocument();
  });

  it("stops asking for more once the ladder is topped out", () => {
    render(<OfferProgress totalItems={3} />);
    expect(screen.getByText("20% off — your best price")).toBeInTheDocument();
  });

  it("keeps the top rung's copy beyond its threshold", () => {
    render(<OfferProgress totalItems={7} />);
    expect(screen.getByText(/^20% off —/)).toBeInTheDocument();
  });

  /* Both rungs stay on show at every state: the second one is the reason to
     add a third piece, so hiding it until it is earned defeats the ladder. */
  it.each([1, 2, 3, 5])("shows both rungs at %i pieces", (n) => {
    render(<OfferProgress totalItems={n} />);
    expect(screen.getByText("2 pieces")).toBeInTheDocument();
    expect(screen.getByText("3 pieces")).toBeInTheDocument();
    expect(screen.getByText("10% off")).toBeInTheDocument();
    expect(screen.getByText("20% off")).toBeInTheDocument();
  });

  it("reports progress across the whole ladder, not the current rung", () => {
    render(<OfferProgress totalItems={2} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "2");
    expect(bar).toHaveAttribute("aria-valuemax", "3");
  });

  /* A bag past the top rung must not report more progress than exists — an
     aria-valuenow above aria-valuemax is invalid and read out as nonsense. */
  it("clamps progress at the top rung", () => {
    render(<OfferProgress totalItems={9} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
  });
});
