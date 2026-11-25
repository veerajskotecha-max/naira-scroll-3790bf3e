import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/*
  The product page's own stylesheet stays what it is for: a handful of rules
  only this page needs, inside the clean system's scope and palette. It adds
  no colour, face or size of its own.
*/
const css = readFileSync(resolve(__dirname, "pdp.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const page = readFileSync(resolve(__dirname, "../../pages/JewelDetailNext.tsx"), "utf8");
const selectors = [...css.matchAll(/(^|\})\s*([^{}@]+)\{/g)].flatMap((m) => m[2].split(",").map((s) => s.trim())).filter(Boolean);

describe("pdp.css", () => {
  it("keeps every rule inside the .nf-clean scope, so no other page can be touched by it", () => {
    expect(selectors.length).toBeGreaterThan(0);
    for (const selector of selectors) expect(selector.startsWith(".nf-clean ")).toBe(true);
  });

  it("adds no colour, face, size, radius or shadow of its own", () => {
    expect(css).not.toMatch(/#[0-9A-Fa-f]{3,8}\b|\b(rgb|rgba|hsl|hsla)\(/);
    expect(css).not.toMatch(/font-family|font-size|font:\s/);
    expect(css).not.toMatch(/border-radius|box-shadow|text-shadow|gradient\(/);
    expect(css).not.toMatch(/(^|[^-])color\s*:/);
  });

  /* The owner's screenshot of the name measures as Jost 400 (see pdp.css).
     The rule carries one element and two classes, so the preview's title B
     (html[data-pdp-title="b"] .nf-clean [data-pdp="title"], one more
     attribute) still overrides it, weight and tracking both. */
  it("sets the piece's name at Jost 400, under the preview's title B rule", () => {
    expect(css).toMatch(/\.nf-clean h1\.nc-title \{ font-weight: 400; letter-spacing: -0\.015em; \}/);
    expect(css).not.toMatch(/!important/);
    expect(page).toMatch(/<h1 data-pdp="title" className="nc-title min-w-0">/);
  });

  it("is written into the page once, after the clean system's stylesheet", () => {
    expect(page.match(/<PdpStyles \/>/g)).toHaveLength(1);
    expect(page).toMatch(/<CleanStyles \/>\s*<PdpStyles \/>/);
  });

  it("keeps a card's button on one line where a third of a phone allows it", () => {
    expect(css).toMatch(/\.nf-clean \.nc-btn\.pdp-cardbtn \{[^}]*white-space: normal/);
    expect(css).toMatch(/@media \(max-width: 379px\) \{\s*\.nf-clean \.nc-btn\.pdp-cardbtn \{ padding: 0 2px; letter-spacing: 0\.08em; \}/);
    expect(page).toMatch(/cleanButton\(\{ size: "sm", block: true \}\)\} pdp-cardbtn mt-2/);
  });
});
