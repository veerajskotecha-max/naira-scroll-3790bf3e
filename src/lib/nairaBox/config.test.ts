import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { SECONDS_PER_TURN, SPIN } from "./config";

/* The owner's brief is one full turn about every four seconds. Asserted as a
   literal so a tweak to the speed is a decision, not a drift. */
describe("Naira box motion", () => {
  it("turns once every four seconds", () => {
    expect(SECONDS_PER_TURN).toBe(4);
    expect(SPIN * 4).toBeCloseTo(Math.PI * 2, 10);
  });
});

/* three.js is ~146 KB gzipped. It sits at the bottom of every page, so it must
   only ever arrive through the dynamic import in NairaBox3D — a static import
   anywhere else would put it in the bundle every visitor downloads first. */
describe("three.js stays out of the main bundle", () => {
  const src = resolve(__dirname, "../..");
  const files = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? files(join(dir, e.name)) : /\.(tsx?|jsx?)$/.test(e.name) ? [join(dir, e.name)] : []
    );

  it("is imported statically only by the scene module", () => {
    const importers = files(src).filter((f) =>
      /from\s+["']three(\/[^"']*)?["']/.test(readFileSync(f, "utf8"))
    );
    expect(importers.map((f) => f.replace(src, "src"))).toEqual(["src/lib/nairaBox/scene.ts"]);
  });

  it("reaches the scene only through a dynamic import", () => {
    const component = readFileSync(resolve(src, "components/NairaBox3D.tsx"), "utf8");
    expect(component).toMatch(/import\("@\/lib\/nairaBox\/scene"\)/);
    expect(component).not.toMatch(/from\s+["']@\/lib\/nairaBox\/scene["']/);
  });
});
