import { describe, expect, it } from "vitest";
import { offerPerPiece } from "./PdpOffers";

// The PDP must quote the same per-piece drop the bag charges (20% / 30%).
describe("offerPerPiece", () => {
  it("₹2,399 drops to ₹1,919 at 2 pieces and ₹1,679 at 3", () => {
    expect(offerPerPiece(2399, 0.2)).toBe(1919);
    expect(offerPerPiece(2399, 0.3)).toBe(1679);
  });
});
