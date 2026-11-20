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
  it("leads with the rating line, then names the ways to pay in words", () => {
    const { container } = render(<BagTrust />);
    const block = container.querySelector("[data-bag-trust]") as HTMLElement;
    expect(block.firstElementChild?.hasAttribute("data-rating-line")).toBe(true);
    const pay = block.querySelector("[data-pay-line]") as HTMLElement;
    expect(pay.textContent).toBe("UPI · Cards · Cash on delivery");
  });

  /* The card marks and the banknote were the only foreign colours left in
     the bag: the ways to pay are words now. */
  it("draws no card marks, no banknote and no logo", () => {
    const { container } = render(<BagTrust />);
    expect(container.querySelector("[data-mark], svg, img")).toBeNull();
  });

  /* Nothing here is pressable, and nothing looks it: the one action in the
     foot stays the filled button under it. */
  it("adds no second thing to tap", () => {
    const { container } = render(<BagTrust />);
    expect(container.querySelectorAll("button, a")).toHaveLength(0);
    expect(container.innerHTML).not.toMatch(/border/);
  });

  it("sets both lines in the one supporting text style", () => {
    const { container } = render(<BagTrust />);
    const lines = [...container.querySelectorAll("[data-bag-trust] > p")];
    expect(lines).toHaveLength(2);
    for (const line of lines) expect(line.className).toMatch(/\bnc-small\b/);
  });
});
