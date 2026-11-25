import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import BagLine from "./BagLine";

afterEach(cleanup);

const item = { id: "woven-gold-hoops", variantId: "gid://shopify/ProductVariant/1", name: "Woven Gold Hoops", image: "hoops.jpg", quantity: 1 };

const draw = (props: Partial<Parameters<typeof BagLine>[0]> = {}) => {
  const handlers = { onDecrease: vi.fn(), onIncrease: vi.fn(), onRemove: vi.fn(), onLeave: vi.fn() };
  const view = render(
    <MemoryRouter>
      <ul>
        <BagLine item={item} href="/jewellery/woven-gold-hoops" options="" total="₹1,049" adding={false} busy={false} eager {...handlers} {...props} />
      </ul>
    </MemoryRouter>,
  );
  return { ...view, ...handlers, line: view.container.querySelector("[data-line]") as HTMLElement };
};

describe("BagLine: one piece in the bag", () => {
  it("names the piece, links it to its page and shows what the line costs", () => {
    const { line } = draw();
    expect(line.getAttribute("data-line")).toBe("woven-gold-hoops");
    expect(line.getAttribute("data-variant")).toBe("gid://shopify/ProductVariant/1");
    const name = line.querySelector("[data-line-name]") as HTMLAnchorElement;
    expect(name.textContent).toBe("Woven Gold Hoops");
    expect(name.getAttribute("href")).toBe("/jewellery/woven-gold-hoops");
    expect(line.querySelector("[data-line-total]")?.textContent).toBe("₹1,049");
  });

  /* The figure at the right is the price: a single piece at full price has
     nothing to explain, so no second figure is printed under its name. */
  it("draws no price row for one piece at full price", () => {
    const { line } = draw();
    expect(line.querySelector("[data-line-price]")).toBeNull();
    expect(line.textContent?.match(/₹1,049/g)).toHaveLength(1);
  });

  /* One discounted piece: the price it replaces, struck, and the rate. The
     discounted price is the total at the right and is not printed twice. */
  it("explains a discount on one piece with the struck price and the rate", () => {
    const { line } = draw({ total: "₹944", was: "₹1,049", off: "10% off" });
    const row = line.querySelector("[data-line-price]") as HTMLElement;
    expect(row.textContent).toBe("₹1,04910% off");
    expect(row.querySelector("del")?.textContent).toBe("₹1,049");
    expect(row.lastElementChild?.className).toMatch(/\bnc-gold\b/);
    expect(line.textContent?.match(/₹944/g)).toHaveLength(1);
  });

  it("adds one piece's price on a line of two or more", () => {
    const { line } = draw({ item: { ...item, quantity: 2 }, total: "₹1,469", was: "₹1,049", each: "₹734 each", off: "30% off" });
    expect(line.querySelector("[data-line-price]")?.textContent).toBe("₹1,049₹734 each30% off");
    expect(screen.getByLabelText("Quantity 2")).toBeTruthy();
  });

  it("says each piece's price on a line of two with nothing off", () => {
    const { line } = draw({ item: { ...item, quantity: 2 }, total: "₹2,098", each: "₹1,049 each" });
    const row = line.querySelector("[data-line-price]") as HTMLElement;
    expect(row.textContent).toBe("₹1,049 each");
    expect(row.querySelector("del")).toBeNull();
  });

  it("shows the line's choices only when it has them", () => {
    expect(draw().line.textContent).not.toMatch(/Size:/);
    cleanup();
    expect(draw({ options: "Metal: Silver · Size: US 7" }).line.textContent).toContain("Metal: Silver · Size: US 7");
  });

  /* Minus at one piece removes the line, and is named for what it does. */
  it("names minus for what it does, and has the word Remove on every screen", () => {
    const { onDecrease, onIncrease, onRemove } = draw();
    const removes = screen.getAllByRole("button", { name: "Remove Woven Gold Hoops" });
    expect(removes).toHaveLength(2);
    expect(removes[1].textContent).toBe("Remove");
    expect(removes[1].querySelector("svg")).toBeNull();
    fireEvent.click(removes[0]);
    expect(onDecrease).toHaveBeenCalledTimes(1);
    fireEvent.click(removes[1]);
    expect(onRemove).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(onIncrease).toHaveBeenCalledTimes(1);
  });

  it("calls minus Decrease quantity once there is more than one", () => {
    draw({ item: { ...item, quantity: 3 } });
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Remove Woven Gold Hoops" })).toHaveLength(1);
  });

  it("holds quantity and Remove while the bag is busy", () => {
    const { line } = draw({ busy: true });
    for (const button of line.querySelectorAll("button")) expect(button).toBeDisabled();
  });

  /* A piece on its way in is listed at once, and says so. */
  it("marks a line that is still arriving", () => {
    const arriving = draw({ adding: true, busy: true });
    expect(arriving.line.hasAttribute("data-adding")).toBe(true);
    expect(arriving.line.querySelector('p[role="status"]')?.textContent).toContain("Adding to your bag…");
    cleanup();
    const settled = draw();
    expect(settled.line.hasAttribute("data-adding")).toBe(false);
    expect(settled.line.querySelector('p[role="status"]')).toBeNull();
  });

  /* The photo is a second way to the piece's page, kept out of the tab order
     and the reading order: the name beside it is the link that is announced. */
  it("keeps the photo link out of the tab order", () => {
    const { line } = draw();
    const links = [...line.querySelectorAll("a")];
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute("tabindex")).toBe("-1");
    expect(links[0].getAttribute("aria-hidden")).toBe("true");
    expect(links[0].querySelector("img")?.getAttribute("width")).toBe("72");
    expect(links[0].querySelector("img")?.getAttribute("height")).toBe("90");
  });

  it("loads the first photos at once and the rest on scroll", () => {
    expect(draw({ eager: true }).line.querySelector("img")?.getAttribute("loading")).toBe("eager");
    cleanup();
    expect(draw({ eager: false }).line.querySelector("img")?.getAttribute("loading")).toBe("lazy");
  });

  it("closes the bag on the way to the piece's page", () => {
    const { line, onLeave } = draw();
    fireEvent.click(line.querySelector("[data-line-name]") as HTMLElement);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });
});

/* What the review of 20 Nov changed, pinned. */
describe("BagLine: its rules and its edges", () => {
  /* A line used to close with its own hairline and the foot opened with one:
     at 390x844 four pieces left the two 2px apart, and a short bag boxed an
     empty band between them. Rules now sit between lines only. */
  it("is ruled off from the line above it, never under itself", () => {
    const { line } = draw();
    const classes = line.className.split(/\s+/);
    expect(classes).toContain("border-t");
    expect(classes).toContain("first:border-t-0");
    expect(classes.some((name) => /^(last:)?border-b/.test(name))).toBe(false);
  });

  /* The name's capitals start level with the top of the photograph: its row
     gives back the 5px of air above a 14px capital in a 20px line. */
  it("lifts the name's row so its capitals meet the top of the photo", () => {
    const { line } = draw();
    const row = line.querySelector("[data-line-name]")?.parentElement as HTMLElement;
    expect(row.className.split(/\s+/)).toContain("-mt-[5px]");
    expect(row.contains(line.querySelector("[data-line-total]"))).toBe(true);
  });

  /* "Serpentine Whisper Chain — Silver" broke after the dash at 360px and
     left "Silver" alone on the second line. */
  it("breaks a two-line name evenly", () => {
    const { line } = draw({ item: { ...item, name: "Serpentine Whisper Chain — Silver" } });
    const clamp = line.querySelector("[data-line-name] > span") as HTMLElement;
    expect(clamp.className.split(/\s+/)).toEqual(expect.arrayContaining(["line-clamp-2", "text-balance"]));
  });

  /* The controls sit at the foot of the photograph whatever is above them. */
  it("keeps the stepper and Remove on the photo's foot", () => {
    const { line } = draw();
    const controls = line.querySelector(".nc-stepper")?.parentElement as HTMLElement;
    expect(controls.className.split(/\s+/)).toContain("mt-auto");
    expect(controls.lastElementChild?.textContent).toBe("Remove");
  });
});
