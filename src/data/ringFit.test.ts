import { describe, expect, it } from "vitest";
import { ADJUSTABLE_FIT_NOTE, adjustableFitNote, isAdjustableRing, ownFit } from "./ringFit";

describe("adjustable rings", () => {
  /* The owner, 23 Oct 2026: it adjusts to fit US 5 to 8, all 60 pieces. */
  it("offers Cushion Halo Ring in US 5 to 8, every size available", () => {
    expect(isAdjustableRing("cushion-halo-ring")).toBe(true);
    expect(ownFit("cushion-halo-ring")?.sizes).toEqual(["5", "6", "7", "8"]);
    expect(adjustableFitNote("cushion-halo-ring")).toBe("Adjustable — fits US 5 to 8 comfortably.");
  });

  it("keeps the open-back US 6 to 8 line for the other adjustable rings", () => {
    expect(ownFit("halo-curve-ring")).toBeUndefined();
    expect(adjustableFitNote("halo-curve-ring")).toBe(ADJUSTABLE_FIT_NOTE);
  });

  it("leaves a ring sold in sizes out", () => {
    expect(isAdjustableRing("star-point-band")).toBe(false);
  });
});
