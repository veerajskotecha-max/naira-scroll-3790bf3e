import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PdpBuyFacts from "./PdpBuyFacts";

afterEach(cleanup);

describe("PdpBuyFacts", () => {
  /* The ladder is the only discount most ad visitors never saw — it sat about
     one and a half screens down. Rates are literals so this fails alongside
     OfferProgress.test.tsx if promo.ts moves without the Shopify codes. */
  it("states both rungs of the multi-buy ladder", () => {
    render(<PdpBuyFacts arrivesBy="Thu, 1 Oct" />);
    expect(screen.getByText("Buy 2, save 10%")).toBeTruthy();
    expect(screen.getByText("Buy 3, save 20%")).toBeTruthy();
  });

  /* "COD available" next to "Free delivery" without the fee would put an
     unannounced 5% in front of the shopper at payment. */
  it("names COD together with its fee, never alone", () => {
    const { container } = render(<PdpBuyFacts arrivesBy="Thu, 1 Oct" />);
    expect(container.textContent).toMatch(/Free delivery by Thu, 1 Oct/);
    expect(container.textContent).toMatch(/COD available \(\+5%\)/);
  });

  it("falls back to the working-day range when no date is computed", () => {
    const { container } = render(<PdpBuyFacts arrivesBy={null} />);
    expect(container.textContent).toMatch(/Free delivery in 3–5 working days/);
  });

  /* Sold-out pieces are pre-orders shipping within two weeks; quoting the
     five-day date would be a promise the atelier cannot keep. */
  it("does not promise the in-stock date on a sold-out piece", () => {
    const { container } = render(<PdpBuyFacts arrivesBy="Thu, 1 Oct" soldOut />);
    expect(container.textContent).not.toMatch(/Thu, 1 Oct/);
    expect(container.textContent).toMatch(/ships within 2 weeks/);
  });

  /* A line that looks tappable and goes nowhere is a dead click. */
  it("contains nothing interactive", () => {
    const { container } = render(<PdpBuyFacts arrivesBy="Thu, 1 Oct" />);
    expect(container.querySelectorAll("a, button")).toHaveLength(0);
  });
});
