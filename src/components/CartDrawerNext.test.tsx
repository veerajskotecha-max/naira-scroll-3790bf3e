import { render, screen } from "@testing-library/react";
import { SimpleLadder } from "./CartDrawerNext";

/* The offer's explanation rides ON TOP of the track, where the eye lands
   first — it must name the saving (up to 20% off), say it runs today, and
   carry the limited-stock urgency. */
describe("SimpleLadder: the bag's offer track", () => {
  it("leads with the up-to-20% explanation on top of the track", () => {
    const { container } = render(<SimpleLadder totalItems={1} />);
    const ladder = container.querySelector("[data-ladder]") as HTMLElement;
    expect(ladder.firstElementChild?.textContent).toContain("Up to 20% off today");
    expect(ladder.firstElementChild?.textContent).toContain("limited pieces");
  });

  it("still states both rungs under the track", () => {
    render(<SimpleLadder totalItems={1} />);
    expect(screen.getByText(/Buy 2 get 10% off/i)).toBeTruthy();
    expect(screen.getByText(/Buy 3 get 20% off/i)).toBeTruthy();
  });
});
