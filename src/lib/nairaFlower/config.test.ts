import { describe, expect, it } from "vitest";
import { SPIN as BOX_SPIN } from "@/lib/nairaBox/config";
import { FILL, HALF_WIDTH, SECONDS_PER_TURN, SPIN, turnAngle } from "./config";
import { FLOWER_ASPECT, FLOWER_SHAPES, flowerPath } from "./outline";
import { WORDMARK, WORDMARK_FLOWER } from "./wordmark";

const TAU = Math.PI * 2;

/* The owner's brief: the box's slow, steady turn, then 30% quicker than it.
   A rest-and-quick-turn shipped once and was sent back. Literals, so a change
   of pace is a decision, not a drift. */
describe("flower-I motion", () => {
  it("turns steadily 30% faster than the Naira box, about once every 27 seconds", () => {
    expect(SPIN).toBeCloseTo(BOX_SPIN * 1.3, 10);
    expect(SECONDS_PER_TURN).toBeGreaterThan(26);
    expect(SECONDS_PER_TURN).toBeLessThan(28);
  });

  it("starts face-on, over the flat flower, and never pauses", () => {
    expect(turnAngle(0)).toBe(0);
    expect(turnAngle(SECONDS_PER_TURN)).toBeCloseTo(TAU, 10);
    expect(turnAngle(2) - turnAngle(1)).toBeCloseTo(turnAngle(10) - turnAngle(9), 10);
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

describe("flower in the wordmark", () => {
  const F = WORDMARK_FLOWER;
  const xs = FLOWER_SHAPES.flatMap((p) => p.filter((_, i) => i % 2 === 0));
  const reach = Math.max(...xs.map((x) => Math.abs(F.cx - F.axis + x * F.height))) / F.height;

  /* Turning on the stem, every point sweeps a circle round it. A canvas
     narrower than the farthest point clips the low leaf mid-turn. */
  it("gives the turning flower room for its farthest leaf on both sides", () => {
    expect(HALF_WIDTH).toBeGreaterThan(reach);
    expect(FILL).toBeLessThan(1);
  });

  /* The flower stands in for the I: it must sit on the I's stem and within
     the letters' height, or the word stops reading NAIRA. */
  it("stands on the I, inside the wordmark's height", () => {
    expect(F.axis / WORDMARK.width).toBeGreaterThan(0.45);
    expect(F.axis / WORDMARK.width).toBeLessThan(0.52);
    expect(F.cy - F.height / 2).toBeGreaterThan(0);
    expect(F.cy + F.height / 2).toBeLessThanOrEqual(WORDMARK.height + 1);
  });
});
