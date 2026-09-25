import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

/* The header is fixed, and every page clears it with a hard-coded top padding
   (pt-[..px] md:pt-[..px] lg:pt-[..px]). When the bar grew 20% those numbers
   had to move with it on some thirty pages; one left behind puts the top of
   that page — a title, a breadcrumb, the PDP's back button — under the bar.
   This reads the bar's real heights and holds every page to them. */
const src = resolve(__dirname, "..");
const header = readFileSync(resolve(__dirname, "Header.tsx"), "utf8");
const px = (re: RegExp) => Number(header.match(re)![1]);
const HEIGHT = {
  base: px(/"--announcement-h": "(\d+)px"/) + px(/"--navbar-h": "(\d+)px"/),
  md: px(/min-width: 768px[^}]*--announcement-h: (\d+)px/) + px(/min-width: 768px[^}]*--navbar-h: (\d+)px/),
  lg: px(/min-width: 1024px[^}]*--announcement-h: (\d+)px/) + px(/min-width: 1024px[^}]*--navbar-h: (\d+)px/),
};
// Pages have always tucked a few pixels under the bar: 4px on phones and
// desktop, 8px on tablets (a 100px offset under a 108px bar before the 20%).
// The resize kept those gaps exactly; this catches a page left further behind.
const TUCK = 8;

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : e.name.endsWith(".tsx") ? [join(dir, e.name)] : []
  );

describe("pages clear the fixed header", () => {
  it("reads the bar's heights", () => {
    expect(HEIGHT).toEqual({ base: 111, md: 122, lg: 136 });
  });

  const triples = files(join(src, "pages")).flatMap((f) =>
    [...readFileSync(f, "utf8").matchAll(/\bpt-\[(\d+)px\][^"]*\bmd:pt-\[(\d+)px\][^"]*\blg:pt-\[(\d+)px\]/g)].map((m) => ({
      file: f.replace(src, "src"),
      base: Number(m[1]),
      md: Number(m[2]),
      lg: Number(m[3]),
    }))
  );

  it("finds the pages' header offsets", () => {
    expect(triples.length).toBeGreaterThan(15);
  });

  it.each(triples.map((t) => [t.file, t]))("%s sits below the bar", (_f, t) => {
    const o = t as { base: number; md: number; lg: number };
    expect(o.base).toBeGreaterThanOrEqual(HEIGHT.base - TUCK);
    expect(o.md).toBeGreaterThanOrEqual(HEIGHT.md - TUCK);
    expect(o.lg).toBeGreaterThanOrEqual(HEIGHT.lg - TUCK);
  });
});
