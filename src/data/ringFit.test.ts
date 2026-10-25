import { describe, expect, it } from "vitest";
import { ADJUSTABLE_FIT_NOTE, adjustableFitNote, adjustableSizes, isAdjustableRing } from "./ringFit";

describe("adjustable rings", () => {
  /* The owner, 23 Oct 2026: the open-back rings fit US 5 to 8. */
  it("offers an open-back ring in US 5 to 8", () => {
    expect(isAdjustableRing("halo-curve-ring")).toBe(true);
    expect(adjustableSizes("halo-curve-ring")).toEqual(["5", "6", "7", "8"]);
    expect(adjustableFitNote("halo-curve-ring")).toBe(ADJUSTABLE_FIT_NOTE);
    expect(ADJUSTABLE_FIT_NOTE).toBe("Open-back design — adjustable to fit US 5 to 8 comfortably.");
  });

  /* The owner, 24 Oct 2026: the new 60 Cushion Halo Rings fit US 5 to 7. */
  it("offers Cushion Halo Ring in US 5 to 7", () => {
    expect(isAdjustableRing("cushion-halo-ring")).toBe(true);
    expect(adjustableSizes("cushion-halo-ring")).toEqual(["5", "6", "7"]);
    expect(adjustableFitNote("cushion-halo-ring")).toBe("Open-back design — adjustable to fit US 5 to 7 comfortably.");
  });

  it("counts Blush Cluster Ring as open, as the supplier's sample is", () => {
    expect(isAdjustableRing("blush-cluster-ring")).toBe(true);
  });

  /* The owner, 24 Oct 2026: Golden Duet's US 6, 7 and 8 merged into one adjustable ring. */
  it("counts Golden Duet Ring as adjustable, in US 5 to 8", () => {
    expect(isAdjustableRing("golden-duet-ring")).toBe(true);
    expect(adjustableSizes("golden-duet-ring")).toEqual(["5", "6", "7", "8"]);
  });

  /* Aditya, 25 Oct 2026: the supplier marked the three solitaires and the zigzag ring "Adjustable". */
  it("counts the Aditya rings as adjustable, in US 5 to 8", () => {
    for (const handle of ["asscher-solitaire-ring", "cushion-solitaire-ring", "pave-zigzag-ring", "lumiere-oval-solitaire-ring"]) {
      expect(isAdjustableRing(handle)).toBe(true);
      expect(adjustableSizes(handle)).toEqual(["5", "6", "7", "8"]);
    }
  });

  it("leaves rings sold in sizes, and closed bands, out", () => {
    expect(isAdjustableRing("star-point-band")).toBe(false);
    expect(isAdjustableRing("vintage-halo-ring")).toBe(false);
  });
});
