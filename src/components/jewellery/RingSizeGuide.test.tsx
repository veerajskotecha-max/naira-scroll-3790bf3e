import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import RingSizeGuide from "./RingSizeGuide";

afterEach(cleanup);

describe("RingSizeGuide", () => {
  /* The owner, 23 Oct 2026: the open-back rings fit US 5 to 8. */
  it("gives an adjustable ring its US 5–8 fit", () => {
    const { container } = render(<RingSizeGuide adjustable />);
    expect(container.textContent).toMatch(/This open-back ring adjusts to fit US 5–8\. US 9 is a chart reference, not its adjustable fit range\./);
  });

  it("says nothing about fit for a ring in fixed sizes", () => {
    const { container } = render(<RingSizeGuide />);
    expect(container.textContent).not.toMatch(/adjusts to fit/);
  });
});
