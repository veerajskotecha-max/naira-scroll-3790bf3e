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
  and change the BUY codes in Shopify at the same time.

  The offer since 25 Nov 2026, the owner's ask: BUY2 = 10% at 2+ pieces and
  BUY3 = 15% at 3+, with Buy 4 removed. (Before it: 10%, 20% and 30% at 2, 3
  and 4 pieces from 9 Nov; 20% and 30% at 3 and 4 from 7 Nov; 10% and 20%
  from 3 Nov; 20% and 30% on 2-3 Nov; 15% and 25% from 25 Oct.) In Shopify,
  BUY3 moves to 15% and BUY4 is switched off AFTER this is live, never
  before.
*/
describe("OfferProgress", () => {
  it("pushes the shopper towards the first rung before they reach it", () => {
    render(<OfferProgress totalItems={1} />);
    expect(screen.getByText("Add 1 piece, save 10%")).toBeInTheDocument();
  });

  it("confirms the earned rung and names the next one", () => {
    render(<OfferProgress totalItems={2} />);
    expect(screen.getByText("10% off — add 1 piece for 15%")).toBeInTheDocument();
  });

  /* Three pieces are the top again since 25 Nov 2026: the band names no
     fourth piece and no richer rate. */
  it("at three pieces, says the bag has its best price and names no fourth", () => {
    const { container } = render(<OfferProgress totalItems={3} />);
    expect(screen.getByText("15% off — your best price")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/30%|20%|4 pieces/);
  });

  it("stops asking for more once the ladder is topped out", () => {
    render(<OfferProgress totalItems={4} />);
    expect(screen.getByText("15% off — your best price")).toBeInTheDocument();
  });

  it("keeps the top rung's copy beyond its threshold", () => {
    render(<OfferProgress totalItems={7} />);
    expect(screen.getByText(/^15% off —/)).toBeInTheDocument();
  });

  /* Every rung stays on show at every state: the next one is the reason to
     add another piece, so hiding it until it is earned defeats the ladder.
     Buy 4 and its 30% are gone, at every state too. */
  it.each([1, 2, 3, 4, 5])("shows both rungs, and no Buy 4, at %i pieces", (n) => {
    const { container } = render(<OfferProgress totalItems={n} />);
    expect(screen.getByText("2 pieces")).toBeInTheDocument();
    expect(screen.getByText("3 pieces")).toBeInTheDocument();
    expect(screen.getByText("10% off")).toBeInTheDocument();
    expect(screen.getByText("15% off")).toBeInTheDocument();
    expect(screen.queryByText("4 pieces")).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/30%|20%/);
  });

  /* Each label sits in its own half, under its own marker (1/4 and 3/4):
     placed by piece count, two neighbouring labels overlapped at 280px. */
  it("puts each rung's marker at the centre of its own half", () => {
    const { container } = render(<OfferProgress totalItems={2} />);
    const marks = [...container.querySelectorAll('[role="progressbar"] > span[aria-hidden]')] as HTMLElement[];
    expect(marks.map((m) => parseFloat(m.style.left).toFixed(2))).toEqual(["25.00", "75.00"]);
    expect(container.querySelector("ul")?.className).toMatch(/grid-cols-2/);
  });

  /* A typed 10% code (NAIRA10) is already in hand, and it matches the first
     rung (BUY2, 10%): the band must not offer that 10% again, so it skips
     the rung the code matches and points at the next one worth more, two
     pieces away. (No live code sits below the first rung, so this is also
     the "skips a rung the code matches" case.) */
  it("never offers a saving the bag already has from a code", () => {
    render(<OfferProgress totalItems={1} appliedRate={0.1} quiet />);
    expect(screen.getByText("10% off — add 2 pieces for 15%")).toBeInTheDocument();
    expect(screen.queryByText(/save 10%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/for 10%/)).not.toBeInTheDocument();
  });

  /* A 20% code (FRIENDSANDFAMILY) is richer than both rungs (10% and 15%)
     since 25 Nov 2026, so the band has no rung left to offer: it says the
     bag has its best price, on one piece and on two. */
  it("offers no rung to a bag whose code already beats them all", () => {
    render(<OfferProgress totalItems={1} appliedRate={0.2} quiet />);
    expect(screen.getByText("20% off — your best price")).toBeInTheDocument();
    expect(screen.queryByText(/add \d/)).not.toBeInTheDocument();
    cleanup();
    render(<OfferProgress totalItems={2} appliedRate={0.2} quiet />);
    expect(screen.getByText("20% off — your best price")).toBeInTheDocument();
  });

  it("shows no rung labels in the quiet bag", () => {
    render(<OfferProgress totalItems={1} quiet />);
    expect(screen.getByText("Add 1 piece, save 10%")).toBeInTheDocument();
    expect(screen.queryByText("2 pieces")).not.toBeInTheDocument();
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
