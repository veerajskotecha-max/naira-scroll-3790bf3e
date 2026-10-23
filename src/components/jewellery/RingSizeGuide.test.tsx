import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ownFit } from "@/data/ringFit";
import RingSizeGuide from "./RingSizeGuide";

afterEach(cleanup);

describe("RingSizeGuide", () => {
  it("gives an open-back ring its US 6–8 fit", () => {
    const { container } = render(<RingSizeGuide adjustable />);
    expect(container.textContent).toMatch(/This open-back ring adjusts to fit US 6–8\. US 5 and US 9 are chart references, not its adjustable fit range\./);
  });

  /* The owner, 23 Oct 2026: Cushion Halo Ring adjusts to fit US 5 to 8. */
  it("gives a ring with its own fit that range, without calling it open back", () => {
    const { container } = render(<RingSizeGuide adjustable fitSizes={ownFit("cushion-halo-ring")?.sizes} />);
    expect(container.textContent).toMatch(/This ring adjusts to fit US 5–8\. US 9 is a chart reference, not its adjustable fit range\./);
    expect(container.textContent).not.toMatch(/open-back/);
  });

  it("says nothing about fit for a ring in fixed sizes", () => {
    const { container } = render(<RingSizeGuide />);
    expect(container.textContent).not.toMatch(/adjusts to fit/);
  });
});
