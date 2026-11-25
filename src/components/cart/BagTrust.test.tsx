import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BagTrust, RatingLine } from "./BagTrust";

afterEach(cleanup);

describe("RatingLine: the rating line above Checkout", () => {
  /* 5,000 is how many clients bought, not how many rated: "Rated 4.5/5 by
     5,000+" would claim 5,000 ratings the shop does not have. */
  it("states the rating and the clients as two separate facts", () => {
    const { container } = render(<RatingLine />);
    const text = container.textContent ?? "";
    expect(text).toContain("Rated 4.5/5 · Trusted by 5,000+ clients");
    expect(text).not.toMatch(/Rated[^·]*by 5,000/);
  });

  /* One star glyph stands in for the five drawn ones. The rating is written
     out beside it, so the star stays out of the reading order. */
  it("draws one star, as decoration", () => {
    const { container } = render(<RatingLine />);
    const stars = [...container.querySelectorAll("*")].filter((el) => el.children.length === 0 && el.textContent === "★");
    expect(stars).toHaveLength(1);
    expect(stars[0].getAttribute("aria-hidden")).toBe("true");
    expect(stars[0].className).toMatch(/\bnc-star\b/);
    expect(container.querySelector("[data-star-fill], [data-stars], svg")).toBeNull();
  });
});

describe("BagTrust: the rating over one line of ways to pay", () => {
  /* 25 Nov 2026, the renewed layer: the ways to pay are their own marks (the
     three UPI apps, Visa, Mastercard) with cash on delivery in words, the
     same line the product page shows under its buttons. */
  it("leads with the rating line, then shows the ways to pay", () => {
    const { container } = render(<BagTrust />);
    const block = container.querySelector("[data-bag-trust]") as HTMLElement;
    expect(block.firstElementChild?.hasAttribute("data-rating-line")).toBe(true);
    const pay = block.querySelector("[data-pay-line]") as HTMLElement;
    expect(pay.querySelector("[data-upi-badges]")).not.toBeNull();
    expect(pay.querySelector("[data-mark='visa']")).not.toBeNull();
    expect(pay.querySelector("[data-mark='mastercard']")).not.toBeNull();
    expect(pay.textContent).toMatch(/Cash on delivery$/);
  });

  /* The marks are decoration: one sentence says the same to a screen reader. */
  it("says the ways to pay once in words, and hides the marks from the reading order", () => {
    const { container } = render(<BagTrust />);
    const pay = container.querySelector("[data-pay-line]") as HTMLElement;
    expect(pay.querySelector(".nc-sr")?.textContent).toBe("Pay by UPI, Visa, Mastercard or cash on delivery.");
    const groups = [...pay.children].filter((child) => !child.classList.contains("nc-sr"));
    expect(groups).toHaveLength(3);
    for (const group of groups) expect(group.getAttribute("aria-hidden")).toBe("true");
  });

  /* Nothing here is pressable: the one action in the foot stays the filled
     button under it. */
  it("adds no second thing to tap", () => {
    const { container } = render(<BagTrust />);
    expect(container.querySelectorAll("button, a, input")).toHaveLength(0);
  });

  it("is two lines: the rating, then the ways to pay, close under it", () => {
    const { container } = render(<BagTrust />);
    const lines = [...container.querySelectorAll("[data-bag-trust] > p")];
    expect(lines).toHaveLength(2);
    expect(lines[0].className).toMatch(/\bnc-small\b/);
    expect(lines[1].className).toMatch(/\brn-pay\b/);
    expect(lines[1].className).toMatch(/\brn-pay--tight\b/);
  });
});
