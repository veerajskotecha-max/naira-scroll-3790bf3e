import { describe, expect, it } from "vitest";
import { CYCLE, FILL, HALF_WIDTH, REST, TURN, turnAngle } from "./config";
import { FLOWER_ASPECT, FLOWER_SHAPES, flowerPath } from "./outline";
import { WORDMARK, WORDMARK_FLOWER } from "./wordmark";

const TAU = Math.PI * 2;

/* The owner asked for more movement than the box's 35 s drift. The answer is
   a rest face-on and one eased turn, not a faster spin: a steady spin never
   lets NAIRA read. Literals, so a change of pace is a decision, not a drift. */
describe("flower-I motion", () => {
  it("rests 3 s face-on, then turns once in 1.6 s", () => {
    expect(REST).toBe(3);
    expect(TURN).toBe(1.6);
  });

  it("holds exactly face-on through the rest, so it sits on the flat flower", () => {
    for (const s of [0, 1, 2.99]) expect(turnAngle(s)).toBe(0);
    expect(turnAngle(CYCLE + 1)).toBeCloseTo(TAU, 10);
  });

  it("turns one full revolution per cycle and never runs backwards", () => {
    expect(turnAngle(REST + TURN / 2)).toBeCloseTo(Math.PI, 10);
    let prev = 0;
    for (let s = 0; s < CYCLE * 3; s += 0.01) {
      const a = turnAngle(s);
      expect(a).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = a;
    }
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
