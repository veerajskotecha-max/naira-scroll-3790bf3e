import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { siteRoutes, sitemapRoutes } from "../../scripts/routes";
import { jewellery } from "@/data/jewellery";
import { jewellerySnapshot } from "@/data/jewellerySnapshot";
import { allLandings } from "@/data/seoContent";
import { stockedLandings } from "@/lib/jewelleryCollections";

const firstPaint = [...jewellery, ...jewellerySnapshot];
const landingPaths = (paths: string[]) => paths.filter((p) => p.startsWith("/jewellery/collections/"));

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

  /* Evil Eye sat in the sitemap at priority 0.9 with no piece in it. Only a
     landing with something to show is prerendered and advertised. */
  it("lists exactly the landings that have a piece to show", () => {
    const stocked = stockedLandings(firstPaint, allLandings).map((c) => `/jewellery/collections/${c.slug}`);
    expect(landingPaths(siteRoutes.map((r) => r.path))).toEqual(stocked);
    expect(stocked.length).toBeLessThan(allLandings.length);
  });

  /* The footer is on every page and cannot wait for the catalogue, so its
     collection links are fixed: each must have something in it. */
  it("never links an empty collection from the footer", () => {
    const footer = readFileSync(resolve(__dirname, "../components/Footer.tsx"), "utf8");
    const linked = [...footer.matchAll(/"\/jewellery\/collections\/([^"]+)"/g)].map((m) => m[1]);
    const stocked = new Set(stockedLandings(firstPaint, allLandings).map((c) => c.slug));
    expect(linked.length).toBeGreaterThan(0);
    expect(linked.filter((slug) => !stocked.has(slug))).toEqual([]);
  });
});
