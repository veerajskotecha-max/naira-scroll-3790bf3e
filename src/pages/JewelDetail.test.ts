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

/*
  The mobile buy bar is pinned to the bottom of the viewport. With a 3/4 hero
  the name and price landed at 1.06 and 1.12 folds — below it — so the first
  thing a shopper could do was buy something whose price they had not been
  shown. Measured on an iPhone 13: the bar covered the price outright.

  Two things keep that fixed, and both must stay:
  the square hero, which lifts name and price above the fold (and stops
  cropping the 15-of-16 hero images that are already square), and the bar's
  refusal to render while it would sit on top of the price.
*/
describe("the buy bar never precedes the price", () => {
  it("uses a square mobile hero", () => {
    expect(code).toMatch(/const MOBILE_FRAME = "1\/1"/);
  });

  it("gates the bar on the price being clear of it", () => {
    const effect = code.match(/const check = \(\) => \{[\s\S]*?setStickyBarVisible\([^)]*\);/)![0];
    expect(effect, "expected the bar to measure its own height").toMatch(/stickyBarRef/);
    expect(effect, "expected a price-clearance check").toMatch(/priceClear/);
    expect(effect).toMatch(/setStickyBarVisible\(offScreen && priceClear\)/);
  });

  it("re-checks when the layout reflows, not only on scroll", () => {
    // The first check runs before images load; without this the bar's state
    // was frozen until the shopper scrolled.
    expect(code).toMatch(/new ResizeObserver\(check\)/);
  });
});
