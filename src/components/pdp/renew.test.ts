import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { addOnEffect } from "@/lib/promo";
import { bundleEffect, ledeOf } from "./renew";

/*
  The renewed product page's own wording and arithmetic (renew.ts) and its
  stylesheet (renew.css). The figures are worked by hand against promo.ts:
  two pieces take 10% off both, three 20%, four 30%, rounded as the bag
  rounds its total.
*/
describe("ledeOf: one sentence of the piece's own description, under the price", () => {
  it("takes a short first sentence, with its full stop", () => {
    expect(ledeOf("Texture does the talking here. These hoops measure about 25mm across.")).toBe("Texture does the talking here.");
    expect(ledeOf("A first piece of gold, and a quiet one. Three pieces, one box.")).toBe("A first piece of gold, and a quiet one.");
  });

  it("does not stop at a decimal point or an abbreviation without a space after it", () => {
    expect(ledeOf("Just 2.5 mm of gold on the finger. It stacks with anything.")).toBe("Just 2.5 mm of gold on the finger.");
  });

  it("gives nothing when the first sentence is too long to read at a glance", () => {
    const long = `${"A very long opening that keeps going and going, well past what a glance can take in, ".repeat(2).trim()}. Then more.`;
    expect(ledeOf(long)).toBeNull();
  });

  it("gives nothing when the description is one sentence (it would only be said twice), too short, or missing", () => {
    expect(ledeOf("Texture does the talking here.")).toBeNull();
    expect(ledeOf("Gold. And then a long second sentence about it.")).toBeNull();
    expect(ledeOf("")).toBeNull();
    expect(ledeOf(undefined)).toBeNull();
  });
});

describe("bundleEffect: what ticked pieces add to the bag, by the bag's own arithmetic", () => {
  const empty = { subtotal: 0, totalItems: 0 };

  it("prices two pieces together at 10% off both, three at 20%, four at 30%", () => {
    /* 1,049 + 999 = 2,048; at 10% 1,843.20 → 1,843. */
    expect(bundleEffect(empty, [1049, 999])).toEqual({ sum: 2048, adds: 1843, saves: 205, rate: 0.1 });
    /* + 699 = 2,747; at 20% 2,197.60 → 2,198. */
    expect(bundleEffect(empty, [1049, 999, 699])).toEqual({ sum: 2747, adds: 2198, saves: 549, rate: 0.2 });
    /* + 899 = 3,646; at 30% 2,552.20 → 2,552. */
    expect(bundleEffect(empty, [1049, 999, 699, 899])).toEqual({ sum: 3646, adds: 2552, saves: 1094, rate: 0.3 });
  });

  it("takes nothing off one piece on its own", () => {
    expect(bundleEffect(empty, [1049])).toEqual({ sum: 1049, adds: 1049, saves: 0, rate: 0 });
  });

  it("counts the pieces already in the bag: what these add, not a price for them alone", () => {
    /* One ₹2,399 piece in the bag (nothing off). Adding 1,049 + 999 makes
       three: 4,447 at 20% is 3,557.60 → 3,558; less the 2,399 already there,
       they add 1,159 and save 889 against their own 2,048. */
    expect(bundleEffect({ subtotal: 2399, totalItems: 1 }, [1049, 999])).toEqual({ sum: 2048, adds: 1159, saves: 889, rate: 0.2 });
  });

  it("is promo.ts's addOnEffect when one piece is added", () => {
    for (const bag of [empty, { subtotal: 2399, totalItems: 1 }, { subtotal: 3698, totalItems: 2 }, { subtotal: 5597, totalItems: 3 }]) {
      const one = addOnEffect(bag, 1049);
      expect(bundleEffect(bag, [1049])).toMatchObject({ adds: one.adds, saves: one.saves, rate: one.rate });
    }
  });

  it("honours a typed code where it beats the step", () => {
    /* FRIENDSANDFAMILY is 20%: on two pieces it beats Buy 2's 10%. */
    const effect = bundleEffect({ subtotal: 0, totalItems: 0, promoCode: "FRIENDSANDFAMILY" }, [1049, 999]);
    expect(effect.rate).toBe(0.2);
    expect(effect.adds).toBe(1638);
  });
});

const css = readFileSync(resolve(__dirname, "renew.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const selectors = [...css.matchAll(/(^|\})\s*([^{}@]+)\{/g)]
  .flatMap((m) => m[2].split(",").map((s) => s.trim()))
  .filter((s) => s && !/^(from|to|\d+%)$/.test(s));

describe("renew.css", () => {
  it("keeps every rule inside the .nf-clean scope, so no other page can be touched by it", () => {
    expect(selectors.length).toBeGreaterThan(40);
    for (const selector of selectors) expect(selector.startsWith(".nf-clean")).toBe(true);
  });

  it("adds three tints to the clean palette and no other colour", () => {
    const tokens = [...css.matchAll(/(--rn-[a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2].toUpperCase()]);
    expect(tokens).toEqual([
      ["--rn-gold-wash", "#F3E6CE"],
      ["--rn-sage", "#5F8279"],
      ["--rn-sage-wash", "#E7EEEA"],
    ]);
    expect(css.match(/#[0-9A-Fa-f]{3,8}\b/g)).toHaveLength(3);
    expect(css).not.toMatch(/\b(rgb|rgba|hsl|hsla)\(/);
  });

  it("adds no face, radius, shadow or gradient, and no text under 11px", () => {
    expect(css).not.toMatch(/font-family|border-radius|box-shadow|text-shadow|gradient\(/);
    const sizes = [...css.matchAll(/font-size:\s*(\d+)px/g)].map((m) => Number(m[1]));
    expect(Math.min(...sizes)).toBe(11);
    expect(css).not.toMatch(/!important/);
  });

  it("stills its motion for people who ask for less, and hides nothing until the page is armed", () => {
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toMatch(/\.rn-dot::after \{ animation: none/);
    expect(reduced).toMatch(/\.rn-armed \.rn-reveal \{ opacity: 1; transform: none; transition: none; \}/);
    /* A section is only ever clear under .rn-armed, which the script adds. */
    for (const rule of css.match(/[^{}]*\{[^{}]*opacity:\s*0[^{}]*\}/g) ?? []) {
      if (/\.rn-reveal/.test(rule)) expect(rule).toMatch(/\.rn-armed/);
    }
  });

  /* The bundle's tick is drawn over the middle of its box, in a layer above
     the input (it is transformed). In a browser a tap there landed on the
     drawing and ticked nothing; it must let taps through. */
  it("lets taps pass through the bundle's drawn tick to its input", () => {
    expect(css).toMatch(/\.nf-clean \.rn-check svg \{[^}]*pointer-events: none/);
    const bundle = readFileSync(resolve(__dirname, "PdpBundle.tsx"), "utf8");
    expect(bundle).toMatch(/<label className="rn-check" data-on=\{on \? "" : undefined\}>\s*<input\s+type="checkbox"/);
  });

  it("moves only transform, opacity, colour and the offer line's width", () => {
    const moved = [...css.matchAll(/transition:\s*([^;]+);/g)].flatMap((m) => m[1].split(",").map((part) => part.trim().split(/\s+/)[0]));
    expect([...new Set(moved)].sort()).toEqual(["background-color", "border-color", "color", "none", "opacity", "transform", "width"]);
  });
});
