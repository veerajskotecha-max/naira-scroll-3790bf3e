import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BagTrust, RatingLine } from "./BagTrust";

afterEach(cleanup);

describe("RatingLine: the star line above Checkout", () => {
  /* 5,000 is how many clients bought, not how many rated: "Rated 4.5/5 by
     5,000+" would claim 5,000 ratings the shop does not have. */
  it("states the rating and the clients as two separate facts", () => {
    const { container } = render(<RatingLine />);
    const text = container.textContent ?? "";
    expect(text).toContain("Rated 4.5/5 · Trusted by 5,000+ clients");
    expect(text).not.toMatch(/Rated[^·]*by 5,000/);
  });

  it("fills four and a half of five stars", () => {
    const { container } = render(<RatingLine />);
    const fills = [...container.querySelectorAll("[data-star-fill]")].map((s) => Number(s.getAttribute("data-star-fill")));
    expect(fills).toEqual([1, 1, 1, 1, 0.5]);
  });

  /* The rating is written out, so the stars stay out of the reading order. */
  it("keeps the stars decorative", () => {
    const { container } = render(<RatingLine />);
    expect(container.querySelector("[data-stars]")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("BagTrust (option B): the star line over one line of ways to pay", () => {
  it("leads with the star line, then names cards and cash on delivery", () => {
    const { container } = render(<BagTrust />);
    const block = container.querySelector("[data-bag-trust]") as HTMLElement;
    expect(block.firstElementChild?.hasAttribute("data-rating-line")).toBe(true);
    const pay = block.querySelector("[data-pay-line]") as HTMLElement;
    expect(pay.querySelector('[data-mark="visa"]')).toBeTruthy();
    expect(pay.querySelector('[data-mark="mastercard"]')).toBeTruthy();
    expect(pay.textContent).toContain("Cards");
    expect(pay.textContent).toContain("Cash on delivery");
  });

  /* Nothing here is pressable, and nothing looks it: the one action in the
     foot stays the black button under it. */
  it("adds no second thing to tap", () => {
    const { container } = render(<BagTrust />);
    expect(container.querySelectorAll("button, a")).toHaveLength(0);
    expect(container.innerHTML).not.toMatch(/border-nf-ink/);
  });
});
