import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ImageLightbox from "./image-lightbox";

afterEach(cleanup);

const open = () => {
  render(<ImageLightbox images={["a.jpg", "b.jpg", "c.jpg"]} name="Prism Rivière Bracelet" open onOpenChange={() => {}} />);
  return screen.getByRole("img").parentElement!;
};
const swipe = (el: Element, fromX: number, toX: number, dy = 0) => {
  const from = { clientX: fromX, clientY: 300 };
  const to = { clientX: toX, clientY: 300 + dy };
  fireEvent.touchStart(el, { touches: [from], changedTouches: [from] });
  fireEvent.touchEnd(el, { touches: [], changedTouches: [to] });
};
const shown = () => screen.getByRole("img").getAttribute("alt");

/* On a phone only the small arrow buttons moved the full-screen viewer; a
   swipe, which moves the page gallery right behind it, did nothing. */
describe("ImageLightbox swipe", () => {
  it("moves to the next photo on a leftward swipe and back on a rightward one", () => {
    const stage = open();
    expect(shown()).toBe("Prism Rivière Bracelet, view 1 of 3");
    swipe(stage, 320, 60);
    expect(shown()).toBe("Prism Rivière Bracelet, view 2 of 3");
    swipe(stage, 60, 320);
    expect(shown()).toBe("Prism Rivière Bracelet, view 1 of 3");
    swipe(stage, 60, 320); // wraps round, as the arrows do
    expect(shown()).toBe("Prism Rivière Bracelet, view 3 of 3");
  });

  it("ignores a tap, a short drag and a mostly vertical move", () => {
    const stage = open();
    swipe(stage, 200, 200);
    swipe(stage, 200, 175);
    swipe(stage, 200, 140, 200);
    expect(shown()).toBe("Prism Rivière Bracelet, view 1 of 3");
  });

  it("keeps the arrow buttons", () => {
    open();
    fireEvent.click(screen.getByRole("button", { name: "Next image" }));
    expect(shown()).toBe("Prism Rivière Bracelet, view 2 of 3");
  });
});
