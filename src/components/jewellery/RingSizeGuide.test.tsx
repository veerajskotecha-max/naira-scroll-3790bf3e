import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { adjustableSizes } from "@/data/ringFit";
import RingSizeGuide from "./RingSizeGuide";

afterEach(cleanup);

describe("RingSizeGuide", () => {
  /* The owner, 23 Oct 2026: the open-back rings fit US 5 to 8. */
  it("gives an adjustable ring its US 5–8 fit", () => {
    const { container } = render(<RingSizeGuide adjustable />);
    expect(container.textContent).toMatch(/This open-back ring adjusts to fit US 5–8\. US 9 is a chart reference, not its adjustable fit range\./);
  });

  /* The owner, 24 Oct 2026: the new 60 Cushion Halo Rings fit US 5 to 7. */
  it("gives a ring with a narrower fit its own range", () => {
    const { container } = render(<RingSizeGuide adjustable fitSizes={adjustableSizes("cushion-halo-ring")} />);
    expect(container.textContent).toMatch(/This open-back ring adjusts to fit US 5–7\. US 8 and US 9 are chart references, not its adjustable fit range\./);
  });

  it("says nothing about fit for a ring in fixed sizes", () => {
    const { container } = render(<RingSizeGuide />);
    expect(container.textContent).not.toMatch(/adjusts to fit/);
  });
});
