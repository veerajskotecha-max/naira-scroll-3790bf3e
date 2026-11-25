import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { addOnEffect } from "@/lib/promo";
import { bundleEffect, ledeOf, nextPieceLine, OFFER_OPEN_LINE, offerLine, oneOf, setLede } from "./renew";

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

  it("gives nothing for an announcement or a question: only a plain sentence about the piece", () => {
    expect(ledeOf("Adjustable version is live! A cushion-cut stone in a halo of smaller ones.")).toBeNull();
    expect(ledeOf("Looking for an everyday ring? This is the one.")).toBeNull();
  });

  it("gives nothing when the description is one sentence (it would only be said twice), too short, or missing", () => {
    expect(ledeOf("Texture does the talking here.")).toBeNull();
    expect(ledeOf("Gold. And then a long second sentence about it.")).toBeNull();
    expect(ledeOf("")).toBeNull();
    expect(ledeOf(undefined)).toBeNull();
  });
});

describe("setLede: a piece sold as a set says what is in it", () => {
  it("uses the listing's own Set row, as one sentence", () => {
    expect(setLede("Three pairs, huggie hoops, clover studs and round solitaire studs")).toBe("In the set: three pairs, huggie hoops, clover studs and round solitaire studs.");
    expect(setLede("Pendant necklace and matching stud pair.")).toBe("In the set: pendant necklace and matching stud pair.");
  });

  it("keeps an abbreviation's capitals", () => {
    expect(setLede("CZ studs and a chain")).toBe("In the set: CZ studs and a chain.");
  });

  it("gives nothing for a missing row, a stub, or a row too long to read at a glance", () => {
    expect(setLede(undefined)).toBeNull();
    expect(setLede("Two")).toBeNull();
    expect(setLede("A very long list of everything in the box, ".repeat(4))).toBeNull();
  });
});

describe("bundleEffect: what ticked pieces add to the bag, by the bag's own arithmetic", () => {
  const empty = { subtotal: 0, totalItems: 0 };

  /* The offer of 25 Nov 2026, as literals: 10% at two pieces, 15% at three,
     and no richer step at four. */
  it("prices two pieces together at 10% off both, three at 15%, and four at 15% too", () => {
    /* 1,049 + 999 = 2,048; at 10% 1,843.20 → 1,843. */
    expect(bundleEffect(empty, [1049, 999])).toEqual({ sum: 2048, adds: 1843, saves: 205, rate: 0.1 });
    /* + 699 = 2,747; at 15% 2,334.95 → 2,335. */
    expect(bundleEffect(empty, [1049, 999, 699])).toEqual({ sum: 2747, adds: 2335, saves: 412, rate: 0.15 });
    /* + 899 = 3,646; still 15%: 3,099.10 → 3,099. */
    expect(bundleEffect(empty, [1049, 999, 699, 899])).toEqual({ sum: 3646, adds: 3099, saves: 547, rate: 0.15 });
  });

  it("takes nothing off one piece on its own", () => {
    expect(bundleEffect(empty, [1049])).toEqual({ sum: 1049, adds: 1049, saves: 0, rate: 0 });
  });

  it("counts the pieces already in the bag: what these add, not a price for them alone", () => {
    /* One ₹2,399 piece in the bag (nothing off). Adding 1,049 + 999 makes
       three: 4,447 at 15% is 3,779.95 → 3,780; less the 2,399 already there,
       they add 1,381 and save 667 against their own 2,048. */
    expect(bundleEffect({ subtotal: 2399, totalItems: 1 }, [1049, 999])).toEqual({ sum: 2048, adds: 1381, saves: 667, rate: 0.15 });
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

describe("offerLine: what adding this piece does to the bag, in words that say whose figure it is", () => {
  it("says that any pieces count, and that nothing is typed, on an empty bag", () => {
    expect(offerLine({ subtotal: 0, totalItems: 0 }, 1049)).toBe(OFFER_OPEN_LINE);
    expect(OFFER_OPEN_LINE).toBe("Mix any pieces. The discount applies in your bag, no code needed.");
  });

  it("says the step the bag reaches and what its total goes up by, never a third price for the piece", () => {
    /* One ₹2,399 piece in the bag. With this one: 3,448 at 10% is 3,103.20 → 3,103; up by 704. */
    expect(offerLine({ subtotal: 2399, totalItems: 1 }, 1049)).toBe("Add to bag and everything in it gets 10% off. Your total goes up by ₹704, not ₹1,049.");
    /* Two pieces (3,698, at 10%: 3,328). With this one: 4,747 at 15% is 4,034.95 → 4,035; up by 707. */
    expect(offerLine({ subtotal: 3698, totalItems: 2 }, 1049)).toBe("Add to bag and everything in it gets 15% off. Your total goes up by ₹707, not ₹1,049.");
  });

  it("says a drop as a drop, never as a negative sum", () => {
    /* At 10% and 15% no bag of the shop's own prices is dear enough for a
       piece to lower it; these figures are for the wording. One ₹12,000
       piece, nothing off. With a ₹1,049 one: 13,049 at 10% is 11,744.10 →
       11,744: 256 less. And 9,441 with 1,049 more: 10,490 at 10% is 9,441. */
    expect(offerLine({ subtotal: 12000, totalItems: 1 }, 1049)).toBe("Add to bag and everything in it gets 10% off. Your total drops by ₹256.");
    expect(offerLine({ subtotal: 9441, totalItems: 1 }, 1049)).toBe("Add to bag and everything in it gets 10% off. Your total stays the same.");
  });

  it("names the rate a full bag already has, and leaves the figure to the steps", () => {
    /* Three pieces are the top since 25 Nov 2026: a fourth, or a fifth, gets the bag's 15%. */
    expect(offerLine({ subtotal: 5697, totalItems: 3 }, 1049)).toBe("Your bag already has 15% off. This piece gets it too.");
    expect(offerLine({ subtotal: 7196, totalItems: 4 }, 1049)).toBe("Your bag already has 15% off. This piece gets it too.");
  });

  it("stops selling a piece the bag already holds, and says what one more would do", () => {
    expect(offerLine({ subtotal: 1049, totalItems: 1 }, 1049, true)).toBe("This piece is in your bag. One more piece takes 10% off everything.");
    expect(offerLine({ subtotal: 3448, totalItems: 2 }, 1049, true)).toBe("This piece is in your bag. One more piece takes 15% off everything.");
    expect(offerLine({ subtotal: 5697, totalItems: 3 }, 1049, true)).toBe("This piece is in your bag, with 15% off.");
    expect(offerLine({ subtotal: 7196, totalItems: 4 }, 1049, true)).toBe("This piece is in your bag, with 15% off.");
  });

  it("keeps promo.ts's own sentence for a typed code", () => {
    expect(offerLine({ subtotal: 0, totalItems: 0, promoCode: "NAIRA10" }, 1049)).toMatch(/^Your code takes 10% off\./);
  });

  it("never says 0% off, and never a rate the bag does not give", () => {
    for (const totalItems of [0, 1, 2, 3, 4, 5]) {
      for (const inBag of [false, true]) {
        const line = offerLine({ subtotal: totalItems * 1200, totalItems }, 1049, inBag && totalItems > 0);
        expect(line).not.toMatch(/\b0% off|NaN|undefined|₹-/);
        // No rate the offer no longer has (Buy 3 was 20%, Buy 4 was 30%).
        expect(line).not.toMatch(/20%|30%/);
        expect(line.length).toBeGreaterThan(10);
      }
    }
  });
});

describe("nextPieceLine and oneOf: the small words", () => {
  it("names the piece a richer step starts at, as the bag's foot always has", () => {
    expect(nextPieceLine(1, 0, 0.1)).toBe("A second piece takes 10% off your bag");
    expect(nextPieceLine(2, 0.1, 0.15)).toBe("A third piece takes 15% off your bag");
  });

  it("says nothing when one more piece reaches no richer step", () => {
    /* A fourth piece beside three: the bag stays at the top step's 15%. */
    expect(nextPieceLine(3, 0.15, 0.15)).toBe("");
    expect(nextPieceLine(1, 0.2, 0.2)).toBe("");
  });

  it("names one piece of a category", () => {
    expect(["Necklaces", "Bracelets", "Rings", "Earrings"].map(oneOf)).toEqual(["Necklace", "Bracelet", "Ring", "Earrings"]);
  });
});

const css = readFileSync(resolve(__dirname, "renew.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const selectors = [...css.matchAll(/(^|\})\s*([^{}@]+)\{/g)]
  .flatMap((m) => m[2].split(",").map((s) => s.trim()))
  .filter((s) => s && !/^(from|to|\d+%)$/.test(s));

describe("renew.css", () => {
  /* One exception, and it is still this page's alone: the site's film-grain
     layer, hidden while html carries nf-next, the class only the product
     page sets (and takes off when it is left). */
  const FILM = ["html.nf-next .film-grain", "html.nf-next .film-grain + div"];
  it("keeps every rule inside the .nf-clean scope, so no other page can be touched by it", () => {
    expect(selectors.length).toBeGreaterThan(40);
    for (const selector of selectors) expect(selector.startsWith(".nf-clean") || FILM.includes(selector)).toBe(true);
    expect(selectors.filter((selector) => !selector.startsWith(".nf-clean"))).toEqual(FILM);
    const page = readFileSync(resolve(__dirname, "../../pages/JewelDetailNext.tsx"), "utf8");
    expect(page).toMatch(/root\.classList\.add\("nf-next"\);\s*return \(\) => root\.classList\.remove\("nf-next"\);/);
  });

  it("caps the phone's photo frame on a short screen, and only the frame", () => {
    expect(css).toMatch(/@media \(max-width: 767px\) \{\s*\.nf-clean \.rn-frame \{ max-height: max\(240px, calc\(100vh - 310px\)\); \}/);
    expect(css).toMatch(/@supports \(height: 100svh\) \{\s*\.nf-clean \.rn-frame \{ max-height: max\(240px, calc\(100svh - 310px\)\); \}/);
  });

  it("starts the rows under the buttons from the page's left edge", () => {
    const rule = (name: string) => css.match(new RegExp(`\\.nf-clean ${name} \\{([^}]*)\\}`))?.[1] ?? "";
    expect(rule("\\.rn-ship")).not.toMatch(/justify-content: center|text-align: center/);
    expect(rule("\\.rn-pay\\.rn-pay--marks")).toMatch(/justify-content: flex-start/);
    /* The bag's own line of marks and words stays centred over Checkout. */
    expect(rule("\\.rn-pay")).toMatch(/justify-content: center/);
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
