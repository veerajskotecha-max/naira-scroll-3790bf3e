import { describe, expect, it } from "vitest";
import { ADJUSTABLE_FIT_NOTE, adjustableFitNote, adjustableSizes, isAdjustableRing, stockedSize } from "./ringFit";

describe("adjustable rings", () => {
  /* The owner, 25 Oct 2026: every adjustable ring fits US 5 to 9. */
  it("offers an open-back ring in US 5 to 9", () => {
    expect(isAdjustableRing("halo-curve-ring")).toBe(true);
    expect(adjustableSizes("halo-curve-ring")).toEqual(["5", "6", "7", "8", "9"]);
    expect(adjustableFitNote("halo-curve-ring")).toBe(ADJUSTABLE_FIT_NOTE);
    expect(ADJUSTABLE_FIT_NOTE).toBe("Open-back design — adjustable to fit US 5 to 9 comfortably.");
  });

  /* Cushion Halo had its own US 5 to 7 until 25 Oct 2026; it is 5 to 9 now. */
  it("gives Cushion Halo Ring the same US 5 to 9", () => {
    expect(isAdjustableRing("cushion-halo-ring")).toBe(true);
    expect(adjustableSizes("cushion-halo-ring")).toEqual(["5", "6", "7", "8", "9"]);
    expect(adjustableFitNote("cushion-halo-ring")).toBe(ADJUSTABLE_FIT_NOTE);
  });

  it("counts Blush Cluster Ring as open, as the supplier's sample is", () => {
    expect(isAdjustableRing("blush-cluster-ring")).toBe(true);
  });

  /* The owner, 24 Oct 2026: Golden Duet's US 6, 7 and 8 merged into one adjustable ring. */
  it("counts Golden Duet Ring as adjustable, in US 5 to 9", () => {
    expect(isAdjustableRing("golden-duet-ring")).toBe(true);
    expect(adjustableSizes("golden-duet-ring")).toEqual(["5", "6", "7", "8", "9"]);
  });

  /* These three were tagged Adjustable in Shopify but missing here, so their
     pages sold US 5 and 7 as pre-orders. */
  it("counts Asscher Solitaire, Lumière Oval Solitaire and Pavé Zigzag", () => {
    for (const handle of ["asscher-solitaire-ring", "lumiere-oval-solitaire-ring", "pave-zigzag-ring"]) {
      expect(isAdjustableRing(handle)).toBe(true);
    }
  });

  /* Shopify decides, so a ring listed tomorrow needs no code change. */
  it("counts any ring Shopify tags Adjustable", () => {
    expect(isAdjustableRing({ handle: "a-ring-listed-tomorrow", tags: ["Ring", "Adjustable"] })).toBe(true);
    expect(isAdjustableRing({ handle: "a-ring-listed-tomorrow", tags: [" adjustable "] })).toBe(true);
    expect(isAdjustableRing({ handle: "a-ring-listed-tomorrow", tags: ["Ring"] })).toBe(false);
    expect(isAdjustableRing({ handle: "a-ring-listed-tomorrow" })).toBe(false);
  });

  /* Aditya, 25 Oct 2026: the supplier marked the three solitaires and the zigzag ring "Adjustable". */
  it("counts the Aditya rings as adjustable, in US 5 to 9", () => {
    for (const handle of ["asscher-solitaire-ring", "cushion-solitaire-ring", "pave-zigzag-ring", "lumiere-oval-solitaire-ring"]) {
      expect(isAdjustableRing(handle)).toBe(true);
      expect(adjustableSizes(handle)).toEqual(["5", "6", "7", "8", "9"]);
    }
  });

  it("leaves rings sold in sizes, and closed bands, out", () => {
    expect(isAdjustableRing("star-point-band")).toBe(false);
    expect(isAdjustableRing("vintage-halo-ring")).toBe(false);
    expect(isAdjustableRing({ handle: "pearl-ribbon-ring", tags: ["Ring", "Pearl"] })).toBe(false);
  });
});

describe("closed rings", () => {
  /* Their Shopify copy: "Made in a fixed US size 7". */
  it("stocks Chevron Whisper and Pearl Ribbon in US 7", () => {
    expect(stockedSize("chevron-whisper-ring")).toBe("7");
    expect(stockedSize("pearl-ribbon-ring")).toBe("7");
  });

  it("stocks the other closed rings in US 6", () => {
    expect(stockedSize("vintage-halo-ring")).toBe("6");
    expect(stockedSize()).toBe("6");
  });
});
