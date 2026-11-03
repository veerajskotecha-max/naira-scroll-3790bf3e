import { describe, expect, it } from "vitest";
import { categoryBySlug } from "./seoContent";
import { menuCategories, popularSearches } from "./navigation";

const landingOf = (to: string) => categoryBySlug(to.match(/^\/jewellery\/collections\/([a-z0-9-]+)$/)?.[1]);

describe("navigation links", () => {
  /* /jewellery?category=Rings canonicalises to /jewellery, so every menu and
     tile link to it sent nothing to the indexable Rings landing — and the
     product pages, whose only category links are the menus, sent none at all. */
  it("opens each category on its own landing, for that category", () => {
    for (const c of menuCategories) {
      expect(c.to, c.label).not.toContain("?");
      expect(landingOf(c.to)?.category, c.label).toBe(c.category);
    }
  });

  /* The Popular Searches were /jewellery?search=<term>; nothing reads that
     parameter, so all eight showed the same unfiltered shop. */
  it("sends every Popular Search to a page that exists, never to an ignored ?search=", () => {
    expect(popularSearches.map((p) => p.label)).toEqual([
      "Zircone Rings",
      "Gold Plated Earrings",
      "Huggie Hoops",
      "Tennis Bracelet",
      "Layered Necklace",
      "Anti-Tarnish Jewellery",
      "Demi-Fine Jewellery",
      "Gifts for Her",
      "Made to Measure",
      "Handmade Custom Outfits",
    ]);
    for (const p of popularSearches) {
      expect(p.to, p.label).not.toContain("?");
      if (p.to !== "/customize") expect(landingOf(p.to), p.label).toBeDefined();
    }
  });
});
