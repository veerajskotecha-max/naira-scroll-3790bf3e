import { render, screen } from "@testing-library/react";
import UpiBadges from "./UpiBadges";

/* The GPay / PhonePe / Paytm badge on the buy buttons. Each case guards a way
   it has broken or would break without anyone noticing on one phone. */
describe("UpiBadges", () => {
  it("draws the three apps in their own colours", () => {
    const { container } = render(<UpiBadges />);
    const fills = [...container.querySelectorAll("path")].map((p) => p.getAttribute("fill"));
    // Google's four, PhonePe's purple, Paytm's navy "pay" and sky "tm".
    expect(fills).toEqual(["#4285F4", "#34A853", "#FABB05", "#E94235", "#5F259F", "#002970", "#00BAF2"]);
  });

  /* The theme sets every radius, "full" included, to 0px, so rounded-full
     would draw three squares. */
  it("keeps the discs round in a square-cornered theme", () => {
    const { container } = render(<UpiBadges />);
    const discs = [...container.querySelectorAll("[data-upi-badges] > span")];
    expect(discs).toHaveLength(3);
    discs.forEach((d) => expect(d.className).toContain("rounded-[50%]"));
  });

  /* The shared Button sets [&_svg]:size-4 on every svg inside it; inline sizes
     are what keep the marks at their own proportions. */
  it("sizes every mark inline, scaled to the disc", () => {
    const { container } = render(<UpiBadges size={20} />);
    const discs = [...container.querySelectorAll<HTMLElement>("[data-upi-badges] > span")];
    expect(discs.map((d) => d.style.width)).toEqual(["20px", "20px", "20px"]);
    const marks = [...container.querySelectorAll<SVGElement>("svg")].map((s) => s.style.width);
    expect(marks).toEqual(["12px", "14px", "16px"]);
  });

  it("leaves the button's name alone", () => {
    render(<button type="button">Buy Now<UpiBadges /></button>);
    expect(screen.getByRole("button", { name: "Buy Now" })).toBeTruthy();
  });
});
