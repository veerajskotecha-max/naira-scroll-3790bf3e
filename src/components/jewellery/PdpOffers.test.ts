import { describe, expect, it } from "vitest";
import { offerPerPiece } from "./PdpOffers";

// The PDP must quote the same per-piece drop the bag charges (10% / 20% since
// 3 Nov 2026, and 30% at 4 pieces since 7 Nov 2026).
describe("offerPerPiece", () => {
  it("₹2,399 drops to ₹2,159 at 2 pieces, ₹1,919 at 3 and ₹1,679 at 4", () => {
    expect(offerPerPiece(2399, 0.1)).toBe(2159);
    expect(offerPerPiece(2399, 0.2)).toBe(1919);
    // 2,399 x 0.7 = 1,679.30.
    expect(offerPerPiece(2399, 0.3)).toBe(1679);
  });
});
