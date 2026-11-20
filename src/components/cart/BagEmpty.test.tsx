import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { JewelPiece } from "@/data/jewellery";
import BagEmpty from "./BagEmpty";

afterEach(cleanup);

const piece = (handle: string, name: string, priceLabel: string) => ({ handle, name, priceLabel, image: `${handle}.jpg`, images: [`${handle}.jpg`] }) as unknown as JewelPiece;
const PIECES = [piece("prism-riviere-bracelet", "Prism Rivière Bracelet", "₹2,399"), piece("woven-gold-hoops", "Woven Gold Hoops", "₹1,049")];

const draw = (props: Partial<Parameters<typeof BagEmpty>[0]> = {}) => {
  const handlers = { onAdd: vi.fn(), onLeave: vi.fn() };
  const view = render(
    <MemoryRouter>
      <BagEmpty pieces={PIECES} adding={null} {...handlers} {...props} />
    </MemoryRouter>,
  );
  return { ...view, ...handlers };
};

describe("BagEmpty: the bag with nothing in it", () => {
  it("says so, offers the best-sellers and one way on", () => {
    const { container } = draw();
    expect(screen.getByText("Your bag is empty")).toBeTruthy();
    expect(screen.getByText("Most loved").className).toMatch(/\bnc-label\b/);
    const rows = [...container.querySelectorAll("[data-piece-card]")];
    expect(rows.map((row) => row.getAttribute("data-piece-card"))).toEqual(["prism-riviere-bracelet", "woven-gold-hoops"]);
    expect(rows[0].textContent).toContain("Prism Rivière Bracelet");
    expect(rows[0].textContent).toContain("₹2,399");
    const explore = screen.getByRole("link", { name: "Explore jewellery" });
    expect(explore.getAttribute("href")).toBe("/jewellery");
  });

  /* One filled button in view: the way to the jewellery. The Adds are outlined. */
  it("fills only the way on", () => {
    const { container } = draw();
    const filled = [...container.querySelectorAll(".nc-btn--ink")];
    expect(filled).toHaveLength(1);
    expect(filled[0].textContent).toBe("Explore jewellery");
    for (const add of screen.getAllByRole("button")) {
      expect(add.className).toMatch(/\bnc-btn\b/);
      expect(add.className).not.toMatch(/nc-btn--ink/);
    }
  });

  it("adds a piece in one tap, named for the piece", () => {
    const { onAdd } = draw();
    fireEvent.click(screen.getByRole("button", { name: "Add Woven Gold Hoops to bag" }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd.mock.calls[0][0].handle).toBe("woven-gold-hoops");
  });

  it("holds the Add of a piece that is on its way in", () => {
    draw({ adding: "woven-gold-hoops" });
    expect(screen.getByRole("button", { name: "Add Woven Gold Hoops to bag" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add Prism Rivière Bracelet to bag" })).not.toBeDisabled();
  });

  it("opens a piece's page from its name, closing the bag first", () => {
    const { onLeave } = draw();
    const name = screen.getByRole("link", { name: "Woven Gold Hoops" });
    expect(name.getAttribute("href")).toBe("/jewellery/woven-gold-hoops");
    fireEvent.click(name);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  /* The catalogue may not have answered yet, or neither piece may be buyable:
     the sentence and the way on still stand, with no empty heading over nothing. */
  it("stands without any piece to offer", () => {
    const { container } = draw({ pieces: [] });
    expect(screen.getByText("Your bag is empty")).toBeTruthy();
    expect(screen.queryByText("Most loved")).toBeNull();
    expect(container.querySelector("[data-piece-card]")).toBeNull();
    expect(screen.getByRole("link", { name: "Explore jewellery" })).toBeTruthy();
  });
});
