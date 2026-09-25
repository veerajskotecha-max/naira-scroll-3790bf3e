import { describe, expect, it } from "vitest";
import { SPIN as BOX_SPIN } from "@/lib/nairaBox/config";
import { SECONDS_PER_TURN, SPIN } from "./config";
import { FLOWER_ASPECT, FLOWER_SHAPES, flowerPath } from "./outline";

/* The owner asked for the flower to turn "smooth and slow like the box". A
   faster turn is what got the box sent back once; this keeps the two locked. */
describe("header flower motion", () => {
  it("turns at the Naira box's pace, about once every 35 seconds", () => {
    expect(SPIN).toBe(BOX_SPIN);
    expect(SECONDS_PER_TURN).toBeGreaterThan(34);
    expect(SECONDS_PER_TURN).toBeLessThan(36);
  });
});

/* The outline is traced from the deck's artwork. A careless re-trace that
   dropped a leaf or broke the scale would still render — just wrongly. */
describe("flower outline", () => {
  it("has the deck mark's five pieces, each a closed polygon", () => {
    expect(FLOWER_SHAPES).toHaveLength(5);
    for (const pts of FLOWER_SHAPES) {
      expect(pts.length % 2).toBe(0);
      expect(pts.length).toBeGreaterThan(20);
    }
  });

  it("is normalised to a height of 1, centred, at the artwork's proportions", () => {
    const xs = FLOWER_SHAPES.flatMap((p) => p.filter((_, i) => i % 2 === 0));
    const ys = FLOWER_SHAPES.flatMap((p) => p.filter((_, i) => i % 2 === 1));
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(1, 2);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(FLOWER_ASPECT, 2);
    expect(Math.max(...ys) + Math.min(...ys)).toBeCloseTo(0, 2);
  });

  it("draws the still as one SVG path per piece", () => {
    expect(flowerPath().match(/M/g)).toHaveLength(5);
  });
});
