import { describe, expect, it } from "vitest";
import { offerPerPiece } from "./PdpOffers";

// The PDP must quote the same per-piece drop the bag charges: 20% at 3
// pieces and 30% at 4 (two rungs since 7 Nov 2026; Buy 2 is gone).
describe("offerPerPiece", () => {
  it("₹2,399 drops to ₹1,919 at 3 pieces and ₹1,679 at 4", () => {
    // 2,399 x 0.8 = 1,919.20.
    expect(offerPerPiece(2399, 0.2)).toBe(1919);
    // 2,399 x 0.7 = 1,679.30.
    expect(offerPerPiece(2399, 0.3)).toBe(1679);
  });
});
