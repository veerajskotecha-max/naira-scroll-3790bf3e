import { describe, expect, it } from "vitest";
import { siteRoutes, sitemapRoutes } from "../../scripts/routes";

describe("sitemap routes", () => {
  /* A sitemap lists canonical URLs only. Gold Plated and Pendant Sets name
     a broader landing as their canonical; listed as well, each was a second
     URL for one grid. They are still prerendered, with that canonical. */
  it("leaves out a landing that names another as its canonical, but still prerenders it", () => {
    const paths = sitemapRoutes(siteRoutes).map((r) => r.path);
    expect(paths).not.toContain("/jewellery/collections/pendant-sets");
    expect(paths).not.toContain("/jewellery/collections/gold-plated-jewellery");
    expect(paths).toContain("/jewellery/collections/necklaces");
    expect(paths).toContain("/jewellery/collections/18k-gold-plated-jewellery");
    expect(siteRoutes.find((r) => r.path === "/jewellery/collections/pendant-sets")?.canonical).toBe("/jewellery/collections/necklaces");
  });
});
