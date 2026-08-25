import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/*
  The PDP must never redirect a handle away while the Shopify catalogue is
  still loading.

  useLiveJewellery serves the bundled file as a first-paint fallback and only
  swaps in the live catalogue once the Storefront query resolves. A bare
  `if (!piece) return <Navigate/>` therefore fires on every cold load of a
  piece that exists only in Shopify — an ad click, a shared link, a search
  result — and throws the shopper back to the grid before the data arrives.

  It measured 29 of 47 product links bouncing, and it is invisible in review:
  clicking through from the listing works, because by then the catalogue is
  already in cache. Only a cold load reproduces it.
*/

const src = readFileSync(resolve(__dirname, "JewelDetail.tsx"), "utf8");
const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

describe("PDP redirect guard", () => {
  it("checks the catalogue has loaded before redirecting a missing handle", () => {
    const redirect = code.match(/if \(!piece\)[\s\S]{0,220}?Navigate to="\/jewellery"/);
    expect(redirect, "expected a !piece guard that can reach <Navigate>").not.toBeNull();
    // The loading state must be consulted between the two.
    expect(redirect![0]).toMatch(/catalogueLoading/);
  });

  it("reads the loading state from the catalogue hook", () => {
    expect(code).toMatch(/isLoading:\s*catalogueLoading\s*\}\s*=\s*useLiveJewellery\(\)/);
  });
});

/* The hook must actually report the in-flight query, or the guard above is a
   no-op that always sees `false`. */
describe("useLiveJewellery loading contract", () => {
  const hook = readFileSync(resolve(__dirname, "../hooks/useLiveJewellery.ts"), "utf8");

  it("propagates isLoading on the bundled-file fallback branch", () => {
    expect(hook).toMatch(/if \(!data\?\.length\) return \{[^}]*isLoading[^}]*\}/);
  });
});

/*
  The metal normaliser rewrites supplier copy that loosely calls rhodium
  plating "silver". It must not touch a piece that carries a real hallmark:
  Verdant Drop Earrings discloses 925 sterling silver ear posts on a copper
  alloy body, and the blanket rule turned that into "925 rhodium coated metal
  posts" — a true material statement rewritten into a false one.
*/
describe("metal normaliser", () => {
  const hook = readFileSync(resolve(__dirname, "../hooks/useLiveJewellery.ts"), "utf8");

  it("bails out before rewriting hallmarked silver", () => {
    const fn = hook.match(/const normalizeMetalCopy[\s\S]*?\n\};/)![0];
    const guard = fn.indexOf("925");
    const firstRewrite = fn.indexOf("sterling silver");
    expect(guard, "expected a 925 hallmark guard").toBeGreaterThan(-1);
    expect(guard).toBeLessThan(firstRewrite);
  });
});
