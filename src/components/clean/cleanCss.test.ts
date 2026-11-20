import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/*
  The discipline the clean system exists for, held in the stylesheet itself:
  six colours and one accent line, every one a token; no radius, no shadow;
  nothing set under 11px; every rule inside the .nf-clean scope, so no other
  page can be touched by it.
*/
const css = readFileSync(resolve(__dirname, "clean.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

describe("clean.css", () => {
  it("defines exactly the palette: two grounds, ink, one muted ink, one rule, one gold (text and line)", () => {
    const tokens = [...css.matchAll(/(--nc-[a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => `${m[1]} ${m[2].toUpperCase()}`);
    expect(tokens).toEqual([
      "--nc-ivory #FBF3EC",
      "--nc-linen #F4EBE2",
      "--nc-ink #1A1614",
      "--nc-muted #625D59",
      "--nc-rule #DCD4CE",
      "--nc-gold #876629",
      "--nc-gold-line #C99A4C",
    ]);
  });

  it("uses a colour only through its token", () => {
    const hexes = css.match(/#[0-9A-Fa-f]{3,8}\b/g) ?? [];
    expect(hexes).toHaveLength(7);
    expect(css).not.toMatch(/\b(rgb|rgba|hsl|hsla)\(/);
  });

  it("has no radius and no shadow", () => {
    expect(css).not.toMatch(/border-radius/);
    expect(css).not.toMatch(/box-shadow/);
    expect(css).not.toMatch(/text-shadow/);
    expect(css).not.toMatch(/gradient\(/);
  });

  it("draws every rule 1px wide in the rule colour, or in ink for a chosen or pressable outline", () => {
    const borders = [...css.matchAll(/border(?:-top|-bottom)?:\s*([^;]+);/g)].map((m) => m[1].trim());
    const allowed = new Set(["0", "1px solid var(--nc-rule)", "1px solid var(--nc-ink)", "2px solid var(--nc-ink)"]);
    expect(borders.filter((border) => !allowed.has(border))).toEqual([]);
  });

  it("sets no text under 11px, and only the caps label at 11px", () => {
    const sizes = [...css.matchAll(/font:\s*\d+\s+(\d+)px/g)].map((m) => Number(m[1])).concat([...css.matchAll(/font-size:\s*(\d+)px/g)].map((m) => Number(m[1])));
    expect(Math.min(...sizes)).toBe(11);
    const elevens = [...css.matchAll(/([^{}]+)\{[^{}]*font:\s*\d+\s+11px[^{}]*\}/g)];
    expect(elevens.length).toBeGreaterThan(0);
    for (const [rule] of elevens) expect(rule).toMatch(/text-transform:\s*uppercase/);
    expect([...new Set(sizes)].sort((a, b) => a - b)).toEqual([11, 12, 13, 14, 15, 16, 20, 22, 26, 28, 34]);
  });

  it("uses only the weights of Jost the site loads", () => {
    const weights = [...css.matchAll(/font:\s*(\d+)\s+\d+px/g)].map((m) => m[1]).concat([...css.matchAll(/font-weight:\s*(\d+)/g)].map((m) => m[1]));
    expect([...new Set(weights)].sort()).toEqual(["300", "400", "500"]);
  });

  it("keeps every rule inside the .nf-clean scope", () => {
    const body = css.replace(/@font-face\s*\{[^}]*\}/g, "").replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
    const selectors = [...body.matchAll(/(^|\})\s*([^{}@]+)\{/g)].map((m) => m[2].trim()).filter(Boolean);
    expect(selectors.length).toBeGreaterThan(40);
    for (const selector of selectors) {
      for (const part of selector.split(",")) expect(part.trim().startsWith(".nf-clean")).toBe(true);
    }
  });

  it("stills its motion for people who ask for less", () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });

  it("gives hover styles only to devices that hover", () => {
    const outside = css.replace(/@media \(hover: hover\)\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
    expect(outside).not.toMatch(/:hover/);
  });

  it("sizes a fallback face to Jost at each weight, so the title does not re-wrap when Jost arrives", () => {
    const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
    expect(faces).toHaveLength(3);
    for (const face of faces) {
      expect(face).toMatch(/font-family:\s*"Jost Fallback"/);
      expect(face).toMatch(/src:\s*local\(/);
      expect(face).toMatch(/size-adjust:\s*\d+(\.\d+)?%/);
    }
    expect(css).toMatch(/--nc-font:\s*"Jost",\s*"Jost Fallback"/);
  });
});
