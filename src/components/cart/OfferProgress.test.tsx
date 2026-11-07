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
  and change BUY3/BUY4 in Shopify at the same time.

  Live at the time of writing: BUY3 = 20% at 3+ pieces (set back by the
  owner on 3 Nov 2026 to the rate it had before 25 Oct) and BUY4 = 30% at 4+
  (added by the owner on 7 Nov 2026). Buy 2 (10% at 2+) was taken away the
  same day ("we need only buy 3 20% off and buy 4 30% off"): two pieces earn
  nothing, and no rung for them is shown.
*/
describe("OfferProgress", () => {
  it("pushes the shopper towards the first rung before they reach it", () => {
    render(<OfferProgress totalItems={1} />);
    expect(screen.getByText("Add 2 pieces, save 20%")).toBeInTheDocument();
  });

  /* Two pieces earn nothing since 7 Nov 2026: the band names the third
     piece's 20% and claims no saving yet. */
  it("on two pieces, offers the third piece's 20% and claims nothing earned", () => {
    render(<OfferProgress totalItems={2} />);
    expect(screen.getByText("Add 1 piece, save 20%")).toBeInTheDocument();
    expect(screen.queryByText(/10%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/% off —/)).not.toBeInTheDocument();
  });

  /* Three pieces are not the top any more: the band names the fourth. */
  it("at three pieces, names the fourth piece and its 30%", () => {
    render(<OfferProgress totalItems={3} />);
    expect(screen.getByText("20% off — add 1 piece for 30%")).toBeInTheDocument();
  });

  it("stops asking for more once the ladder is topped out", () => {
    render(<OfferProgress totalItems={4} />);
    expect(screen.getByText("30% off — your best price")).toBeInTheDocument();
  });

  it("keeps the top rung's copy beyond its threshold", () => {
    render(<OfferProgress totalItems={7} />);
    expect(screen.getByText(/^30% off —/)).toBeInTheDocument();
  });

  /* Both rungs stay on show at every state: the next one is the reason to
     add another piece, so hiding it until it is earned defeats the ladder.
     Two rungs only: no "2 pieces" or 10% rung since 7 Nov 2026. */
  it.each([1, 2, 3, 4, 5])("shows both rungs, and only those, at %i pieces", (n) => {
    const { container } = render(<OfferProgress totalItems={n} />);
    expect(screen.getByText("3 pieces")).toBeInTheDocument();
    expect(screen.getByText("4 pieces")).toBeInTheDocument();
    expect(screen.getByText("20% off")).toBeInTheDocument();
    expect(screen.getByText("30% off")).toBeInTheDocument();
    expect(container.querySelectorAll("ul > li")).toHaveLength(2);
    expect(screen.queryByText("2 pieces")).not.toBeInTheDocument();
    expect(screen.queryByText("10% off")).not.toBeInTheDocument();
  });

  /* Each label sits in its own half, under its own marker (1/4, 3/4): at
     their piece counts "3 pieces" and "4 pieces" overlapped at 280px. */
  it("puts each rung's marker at the centre of its own half", () => {
    const { container } = render(<OfferProgress totalItems={2} />);
    const marks = [...container.querySelectorAll('[role="progressbar"] > span[aria-hidden]')] as HTMLElement[];
    expect(marks.map((m) => parseFloat(m.style.left).toFixed(2))).toEqual(["25.00", "75.00"]);
    expect(container.querySelector("ul")?.className).toMatch(/\bgrid-cols-2\b/);
    expect(container.querySelector("ul")?.className).not.toMatch(/grid-cols-3/);
  });

  /* A typed 10% code (NAIRA10) is already in hand. It is worth less than
     either rung, so the band names the first rung worth more, BUY3's 20%,
     two pieces away, and never offers the code's own 10% back. */
  it("never offers a saving the bag already has from a code", () => {
    render(<OfferProgress totalItems={1} appliedRate={0.1} quiet />);
    expect(screen.getByText("10% off — add 2 pieces for 20%")).toBeInTheDocument();
    expect(screen.queryByText(/save 10%/)).not.toBeInTheDocument();
    expect(screen.queryByText(/for 10%/)).not.toBeInTheDocument();
  });

  /* A 20% code (FRIENDSANDFAMILY) matches the three-piece rung (BUY3, 20%),
     so on one piece the band skips Buy 3 and points at Buy 4, the only rung
     worth more, three pieces away. */
  it("skips every rung the code already matches", () => {
    render(<OfferProgress totalItems={1} appliedRate={0.2} quiet />);
    expect(screen.getByText("20% off — add 3 pieces for 30%")).toBeInTheDocument();
    expect(screen.queryByText(/for 20%/)).not.toBeInTheDocument();
  });

  /* Two pieces with FRIENDSANDFAMILY: two pieces earn no rung, so the bag's
     rate is the code's 20%; the third piece's 20% adds nothing on top, and
     the fourth's 30% does. */
  it("skips the rung a code that beats the earned one already matches", () => {
    render(<OfferProgress totalItems={2} appliedRate={0.2} quiet />);
    expect(screen.getByText("20% off — add 2 pieces for 30%")).toBeInTheDocument();
  });

  it("shows no rung labels in the quiet bag", () => {
    render(<OfferProgress totalItems={1} quiet />);
    expect(screen.getByText("Add 2 pieces, save 20%")).toBeInTheDocument();
    expect(screen.queryByText("3 pieces")).not.toBeInTheDocument();
  });

  it("reports progress across the whole ladder, not the current rung", () => {
    render(<OfferProgress totalItems={2} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "2");
    expect(bar).toHaveAttribute("aria-valuemax", "4");
  });

  /* A bag past the top rung must not report more progress than exists — an
     aria-valuenow above aria-valuemax is invalid and read out as nonsense. */
  it("clamps progress at the top rung", () => {
    render(<OfferProgress totalItems={9} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "4");
  });
});
