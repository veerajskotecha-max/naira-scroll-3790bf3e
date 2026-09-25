import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { SECONDS_PER_TURN, SPIN } from "./config";

/* The owner's brief is Bluorng's pace: 0.003 rad per frame at 60fps, about one
   turn every 35 seconds. A four-second turn shipped once and was sent back.
   Asserted as a literal so a tweak to the speed is a decision, not a drift. */
describe("Naira box motion", () => {
  it("turns at the bluorng.com bag's pace", () => {
    expect(SPIN).toBeCloseTo(0.18, 10);
    expect(SECONDS_PER_TURN).toBeGreaterThan(34);
    expect(SECONDS_PER_TURN).toBeLessThan(36);
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

  it("is imported statically only by the scene modules", () => {
    const importers = files(src).filter((f) =>
      /from\s+["']three(\/[^"']*)?["']/.test(readFileSync(f, "utf8"))
    );
    expect(importers.map((f) => f.replace(src, "src")).sort()).toEqual([
      "src/lib/nairaBox/scene.ts",
      "src/lib/nairaFlower/scene.ts",
    ]);
  });

  it("reaches the scene only through a dynamic import", () => {
    const component = readFileSync(resolve(src, "components/NairaBox3D.tsx"), "utf8");
    expect(component).toMatch(/import\("@\/lib\/nairaBox\/scene"\)/);
    expect(component).not.toMatch(/from\s+["']@\/lib\/nairaBox\/scene["']/);
  });

  /* The flower is in the header, on every page and above the fold — the worst
     place for three.js to land in the first download. */
  it("reaches the header flower's scene only through a dynamic import", () => {
    const component = readFileSync(resolve(src, "components/NairaWordmark.tsx"), "utf8");
    expect(component).toMatch(/import\("@\/lib\/nairaFlower\/scene"\)/);
    expect(component).not.toMatch(/from\s+["']@\/lib\/nairaFlower\/scene["']/);
  });
});

/* The owner first asked for the box to open on its own, then for a full 360
   and for the opening to happen on a tap. The loop pulled the box back to the
   front every nine seconds, so it never finished a turn — pins that nothing
   schedules a reveal, that a tap is what starts one, and that the ring it
   shows is the homepage's solitaire render, not a new asset that could drift. */
describe("Naira box reveal", () => {
  it("opens on a tap, never on a timer", async () => {
    const { REVEAL, TAP_MS, TAP_PX } = await import("./config");
    for (const key of ["open", "close", "faceSpeed", "slide"] as const) {
      expect(REVEAL[key]).toBeGreaterThan(0);
    }
    expect(REVEAL).not.toHaveProperty("every");
    expect(REVEAL).not.toHaveProperty("firstAfter");
    expect(TAP_PX).toBeGreaterThan(0);
    expect(TAP_MS).toBeGreaterThan(0);

    const scene = readFileSync(resolve(__dirname, "scene.ts"), "utf8");
    // The only way into the reveal is toggle(), and only a tap or a key calls it.
    expect(scene.match(/go\("face"\)/g)).toHaveLength(1);
    expect(scene).toMatch(/const toggle = \(\) =>[\s\S]*go\("face"\)[\s\S]*const onDown/);
  });

  it("keeps the ring smaller than the open drawer is deep", async () => {
    const { RING_SIZE, BOX } = await import("./config");
    expect(RING_SIZE).toBeLessThan(BOX.h * 1.2);
  });

  it("reveals the solitaire from the homepage ring turn", () => {
    const component = readFileSync(resolve(__dirname, "../../components/NairaBox3D.tsx"), "utf8");
    const turn = readFileSync(resolve(__dirname, "../../components/jewellery/ZirconeTurn.tsx"), "utf8");
    expect(component).toMatch(/import ringUrl from "@\/assets\/jewellery\/ring-cut-34\.webp"/);
    expect(turn).toMatch(/ring-cut-34\.webp/);
  });
});
