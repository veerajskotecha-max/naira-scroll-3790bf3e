import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/* The phone's back closes the search, as it does the menu and the bag, instead
   of leaving the page behind it. The clothing pages keep their header exactly
   as it was. */
const navbar = readFileSync(resolve(__dirname, "Navbar.tsx"), "utf8");
const overlay = readFileSync(resolve(__dirname, "nav/SearchOverlay.tsx"), "utf8");

describe("header search and the phone's back", () => {
  it("gives the open search its own history entry, off the clothing pages", () => {
    expect(navbar).toMatch(/useBackToClose\("nfSearch", searchOpen && !clothing, clothing \? leaveAsIs : setSearchOpen\)/);
    const CLOTHING = new RegExp(navbar.match(/const CLOTHING = \/(.*)\/;/)![1]);
    for (const path of ["/product/royal-enigma", "/products/royal-enigma", "/shop/indo-western"]) expect(CLOTHING.test(path)).toBe(true);
    for (const path of ["/", "/jewellery", "/jewellery/prism-riviere-bracelet", "/jewellery/collections/rings", "/preview/jewellery/x"])
      expect(CLOTHING.test(path)).toBe(false);
  });

  it("closes before following a result, so back from the result returns to the page", () => {
    expect(navbar).toMatch(/onFollow=\{clothing \? undefined : followOut\(search\.closeThen, navigate\)\}/);
    expect(overlay).toMatch(/if \(onFollow\) onFollow\(e\);\s*else onClose\(\);/);
  });
});
