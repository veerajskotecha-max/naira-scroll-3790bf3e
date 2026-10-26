import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import RingSizeGuide from "./RingSizeGuide";

afterEach(cleanup);

describe("RingSizeGuide", () => {
  /* The owner, 25 Oct 2026: every adjustable ring fits US 5 to 9, the whole
     chart, so no size is left as "a chart reference". */
  it("gives an adjustable ring its US 5–9 fit", () => {
    const { container } = render(<RingSizeGuide adjustable />);
    expect(container.textContent).toMatch(/This open-back ring adjusts to fit US 5–9\./);
    expect(container.textContent).not.toMatch(/chart reference/);
  });

  it("gives a ring with a narrower fit its own range", () => {
    const { container } = render(<RingSizeGuide adjustable fitSizes={["5", "6", "7"]} />);
    expect(container.textContent).toMatch(/This open-back ring adjusts to fit US 5–7\. US 8 and US 9 are chart references, not its adjustable fit range\./);
  });

  it("says nothing about fit for a ring in fixed sizes", () => {
    const { container } = render(<RingSizeGuide />);
    expect(container.textContent).not.toMatch(/adjusts to fit/);
  });
});
