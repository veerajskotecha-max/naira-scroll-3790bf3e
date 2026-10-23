import { describe, expect, it } from "vitest";
import { ADJUSTABLE_FIT_NOTE, ADJUSTABLE_SIZES, isAdjustableRing } from "./ringFit";

describe("adjustable rings", () => {
  /* The owner, 23 Oct 2026: the open-back rings, Cushion Halo among them, fit US 5 to 8. */
  it("offers every adjustable ring in US 5 to 8", () => {
    expect(isAdjustableRing("cushion-halo-ring")).toBe(true);
    expect(isAdjustableRing("halo-curve-ring")).toBe(true);
    expect(ADJUSTABLE_SIZES).toEqual(["5", "6", "7", "8"]);
    expect(ADJUSTABLE_FIT_NOTE).toBe("Open-back design — adjustable to fit US 5 to 8 comfortably.");
  });

  it("leaves rings sold in sizes, and closed bands, out", () => {
    expect(isAdjustableRing("star-point-band")).toBe(false);
    expect(isAdjustableRing("vintage-halo-ring")).toBe(false);
  });
});
