import { describe, expect, it } from "vitest";
import { offerPerPiece } from "./PdpOffers";

// The PDP must quote the same per-piece drop the bag charges (10% / 20% since 3 Nov 2026).
describe("offerPerPiece", () => {
  it("₹2,399 drops to ₹2,159 at 2 pieces and ₹1,919 at 3", () => {
    expect(offerPerPiece(2399, 0.1)).toBe(2159);
    expect(offerPerPiece(2399, 0.2)).toBe(1919);
  });
});
