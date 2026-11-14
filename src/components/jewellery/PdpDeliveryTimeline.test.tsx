import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import PdpDeliveryTimeline from "./PdpDeliveryTimeline";

/* The cover for a faulty piece sits by the buttons, in the policy's own terms
   (defects, 7 days, repair / replacement / store credit), and never says
   "returns" or "exchange": the policy covers defects only. */
describe("the delivery block under Add to bag", () => {
  const draw = () =>
    render(
      <MemoryRouter>
        <PdpDeliveryTimeline arrivesBy="18–20 Nov" />
      </MemoryRouter>,
    );

  it("states the faulty-piece cover and links the policy", () => {
    draw();
    expect(screen.getByText(/Faulty piece\? Repaired, replaced or credited if you tell us within 7 days of delivery\./)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Policy" })).toHaveAttribute("href", "/exchange-return-policy");
    expect(document.body.textContent).not.toMatch(/return|exchange/i);
  });

  it("dates delivery as an estimate and says COD is available, without a fee", () => {
    draw();
    expect(document.body.textContent).toMatch(/Delivered free\s*est\. 18–20 Nov/);
    expect(document.body.textContent).toMatch(/COD available/);
    expect(document.body.textContent).not.toMatch(/fee/i);
  });
});
