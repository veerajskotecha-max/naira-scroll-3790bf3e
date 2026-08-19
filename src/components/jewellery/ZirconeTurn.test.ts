import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/*
  The ring turn must never rotate a face past edge-on.

  These are flat photographs. A plane at 90° has zero width, so the ring
  disappears — and because the section still "animates", nothing looks broken
  in code review. It shipped twice in two days: 18 Aug replaced the turn with a
  0→180→360 flip card, 19 Aug made it one continuous 360° spin. Both drove the
  ring through 90° twice per scroll.

  A browser test would be the honest check, but it needs a build, a server and
  a real compositor. This is the cheap guard that would have caught both
  regressions at the moment they were written.
*/

const src = readFileSync(resolve(__dirname, "ZirconeTurn.tsx"), "utf8");
const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

describe("ZirconeTurn rotation limits", () => {
  const angles = [...code.matchAll(/rotationY:\s*(-?\d+(?:\.\d+)?)/g)].map((m) => Math.abs(Number(m[1])));

  it("declares rotationY somewhere — the turn is the whole point", () => {
    expect(angles.length).toBeGreaterThan(0);
  });

  it("never rotates a face to or past edge-on", () => {
    const past = angles.filter((a) => a >= 70);
    expect(past, `rotationY values at/over 70°: ${past.join(", ")} — the ring vanishes at 90°`).toEqual([]);
  });

  it("keeps the two photos on separate faces rather than one flip card", () => {
    // Each photo carries its own rotationY. Rotating one shared card instead
    // is what forces the turn past 90°, because face B only faces the viewer
    // at 180° — that is exactly how both regressions were written.
    expect(code).toMatch(/gsap\.set\(\s*faceA/);
    expect(code).toMatch(/gsap\.set\(\s*faceB/);
    const cardVars = [...code.matchAll(/\bcard\s*,\s*\{([^}]*)\}/g)].map((m) => m[1]);
    const spun = cardVars.filter((v) => /rotationY/.test(v));
    expect(spun, `the card itself is being rotated: ${spun.join(" | ")}`).toEqual([]);
  });

  it("never leaves both faces part-transparent at once", () => {
    // Whichever face arrives fades up over an opaque outgoing face; the
    // outgoing one is only dropped afterwards, in a single frame.
    expect(code).toMatch(/\.set\(faceA,\s*\{\s*autoAlpha:\s*0\s*\}/);
    expect(code).not.toMatch(/to\(\s*\[\s*faceA\s*,\s*faceB\s*\][^)]*autoAlpha/);
  });
});
