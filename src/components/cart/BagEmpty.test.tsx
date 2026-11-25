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

/* The bundled catalogue cannot sell every best-seller (one has no variant in
   it), so that row arrives with Shopify's answer, and it is the first row.
   The row already drawn used to drop one place as it came: a finger reaching
   for the hoops' Add met the bracelet's. Each best-seller now keeps its own
   place from the first frame. */
describe("BagEmpty: while the live catalogue is on its way", () => {
  const SLOTS = ["prism-riviere-bracelet", "woven-gold-hoops"];

  it("holds the place of a best-seller it cannot draw yet", () => {
    const { container } = draw({ pieces: [PIECES[1]], slots: SLOTS });
    const rows = [...container.querySelectorAll("ul > li")];
    expect(rows).toHaveLength(2);
    expect(rows[0].getAttribute("data-piece-slot")).toBe("prism-riviere-bracelet");
    expect(rows[1].getAttribute("data-piece-card")).toBe("woven-gold-hoops");
    /* The held place is the row's own size (a 60px block between the same
       12px), says nothing, and cannot be pressed or read out. */
    expect(rows[0].getAttribute("aria-hidden")).toBe("true");
    expect(rows[0].textContent).toBe("");
    expect(rows[0].querySelector("a, button, img, svg")).toBeNull();
    const block = rows[0].firstElementChild as HTMLElement;
    expect(block.className.split(/\s+/)).toEqual(expect.arrayContaining(["h-[60px]", "w-[48px]"]));
    for (const name of ["py-3", "border-b"]) expect(rows[0].className.split(/\s+/)).toContain(name);
    for (const name of ["py-3", "border-b"]) expect(rows[1].className.split(/\s+/)).toContain(name);
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("puts the arriving piece in the place that was held for it, above the one already there", () => {
    const view = draw({ pieces: [PIECES[1]], slots: SLOTS });
    const hoops = view.container.querySelector('[data-piece-card="woven-gold-hoops"]');
    view.rerender(
      <MemoryRouter>
        <BagEmpty pieces={PIECES} adding={null} onAdd={view.onAdd} onLeave={view.onLeave} slots={SLOTS} />
      </MemoryRouter>,
    );
    const rows = [...view.container.querySelectorAll("ul > li")];
    expect(rows.map((row) => row.getAttribute("data-piece-card"))).toEqual(SLOTS);
    expect(rows[1]).toBe(hoops);
    expect(view.container.querySelector("[data-piece-slot]")).toBeNull();
  });

  it("holds every place, under the label, even before any piece can be drawn", () => {
    const { container } = draw({ pieces: [], slots: SLOTS });
    expect(screen.getByText("Most loved")).toBeTruthy();
    expect(container.querySelectorAll("[data-piece-slot]")).toHaveLength(2);
  });

  /* Once Shopify has answered, a best-seller that cannot be bought has no
     row and no held place. */
  it("holds nothing once the catalogue has answered", () => {
    const { container } = draw({ pieces: [PIECES[1]] });
    expect(container.querySelectorAll("ul > li")).toHaveLength(1);
    expect(container.querySelector("[data-piece-slot]")).toBeNull();
  });
});
