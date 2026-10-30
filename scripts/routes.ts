// The site's route list, in one place.
//
// The sitemap generator and the prerenderer both read this. They used to be
// able to drift: a stale deploy once published 39 /jewellery/<handle> URLs that
// no longer existed in the data, and every one of them bounced to /jewellery.
// One source means a URL cannot be advertised without also being prerendered.

import { allLandings as categoryLandings, allArticles as journal } from "../src/data/seoContent";
// Both data files are plain data now (no Vite asset imports), so tsx loads them.
import { jewellery } from "../src/data/jewellery";
import { jewellerySnapshot } from "../src/data/jewellerySnapshot";
import { stockedLandings } from "../src/lib/jewelleryCollections";

const jewelleryHandles = jewellery.map((p) => p.handle);

/* Every piece the site can draw before Shopify answers: the hand-authored
   file plus the snapshot the app's own mapping made from the live store
   (scripts/generate-jewellery-snapshot.ts). A collection with none of them is
   empty, and is neither advertised nor prerendered. */
const firstPaint = [...jewellery, ...jewellerySnapshot];
const landingPath = (slug: string) => `/jewellery/collections/${slug}`;

export const BASE_URL = "https://nairaflore.com";

export interface SiteRoute {
  path: string;
  /** Set when the page names another URL as its canonical: it is still
      prerendered, but a sitemap lists canonical URLs only. */
  canonical?: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const siteRoutes: SiteRoute[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  /* /shop now redirects to /jewellery, so it is not a prerenderable route and is
     no longer advertised. /shop/indo-western and /shop/jewellery stay absent too:
     they redirect, to /customize and /jewellery. */

  { path: "/jewellery", changefreq: "weekly", priority: "0.9" },
  ...stockedLandings(firstPaint, categoryLandings).map<SiteRoute>((c) => ({
    path: landingPath(c.slug),
    ...(c.canonicalSlug ? { canonical: landingPath(c.canonicalSlug) } : {}),
    changefreq: "weekly",
    priority: "0.9",
  })),
  ...jewelleryHandles.map<SiteRoute>((handle) => ({
    path: `/jewellery/${handle}`,
    changefreq: "monthly",
    priority: "0.8",
  })),
  { path: "/journal", changefreq: "weekly", priority: "0.7" },
  ...journal.map<SiteRoute>((a) => ({
    path: `/journal/${a.slug}`,
    lastmod: a.published,
    changefreq: "monthly",
    priority: "0.7",
  })),
  { path: "/customize", changefreq: "monthly", priority: "0.8" },
  { path: "/gifting", changefreq: "monthly", priority: "0.7" },
  { path: "/track-order", changefreq: "monthly", priority: "0.4" },
  { path: "/innercircle", changefreq: "monthly", priority: "0.5" },

  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/faqs", changefreq: "monthly", priority: "0.6" },
  { path: "/exchange-return-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

/*
  A /jewellery/<handle> page only resolves when Shopify still lists that handle;
  the app redirects delisted pieces back to /jewellery. Advertising or
  prerendering those URLs is what makes the build fail and the sitemap lie, so
  the live handle set is fetched once at build time and used to filter.
  If Shopify is unreachable, fall back to the full static list — degraded, not
  broken.
*/
const STOREFRONT_URL = "https://nc5eti-gp.myshopify.com/api/2025-07/graphql.json";
const STOREFRONT_TOKEN = "0f6fd83502924ac437a5d19180bb08c3";

interface LiveProduct {
  handle: string;
  vendor: string;
  updatedAt?: string;
}

/** The Shopify vendor holding the jewellery line; everything else is clothing. */
const JEWELLERY_VENDOR = "naira petite";

const fetchLiveProducts = async (): Promise<LiveProduct[] | null> => {
  try {
    const res = await fetch(STOREFRONT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: `{ products(first: 250) { edges { node { handle vendor updatedAt } } } }`,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { products?: { edges?: { node: LiveProduct }[] } };
    };
    const edges = json.data?.products?.edges;
    if (!edges?.length) return null;
    return edges.map((e) => e.node);
  } catch {
    return null;
  }
};

/** The routes a sitemap may list: those that are their own canonical. */
export const sitemapRoutes = (routes: SiteRoute[]) => routes.filter((r) => !r.canonical || r.canonical === r.path);

export const resolveSiteRoutes = async (): Promise<SiteRoute[]> => {
  const products = await fetchLiveProducts();
  if (!products) {
    console.warn("routes: could not reach Shopify, keeping all product routes");
    return siteRoutes;
  }
  const live = new Set(products.map((p) => p.handle));
  /* Each product page carries the day Shopify last changed its listing, so a
     new photo, price or description is a recrawl hint, not just the journal. */
  const updated = new Map(products.map((p) => [p.handle, p.updatedAt?.slice(0, 10)]));
  const dated = (route: SiteRoute, handle: string): SiteRoute => {
    const lastmod = updated.get(handle);
    return lastmod ? { ...route, lastmod } : route;
  };
  /* A collection whose every piece has since been unlisted is empty too. One
     stocked only by pieces newer than the snapshot stays out until the
     snapshot is regenerated: under-advertised for a while, never a soft 404. */
  const stocked = new Set(
    stockedLandings(firstPaint.filter((p) => live.has(p.handle)), categoryLandings).map((c) => landingPath(c.slug)),
  );
  const dropped: string[] = [];
  const emptied: string[] = [];
  const kept = siteRoutes.filter((route) => {
    if (route.path.startsWith("/jewellery/collections/")) {
      if (stocked.has(route.path)) return true;
      emptied.push(route.path);
      return false;
    }
    const match = route.path.match(/^\/jewellery\/([^/]+)$/);
    if (!match || match[1] === "collections") return true;
    if (live.has(match[1])) return true;
    dropped.push(route.path);
    return false;
  });
  if (dropped.length) {
    console.log(`routes: skipping ${dropped.length} delisted product route(s)`);
  }
  if (emptied.length) console.log(`routes: skipping ${emptied.length} emptied collection(s): ${emptied.join(", ")}`);
  const keptDated = kept.map((route) => {
    const match = route.path.match(/^\/jewellery\/([^/]+)$/);
    return match ? dated(route, match[1]) : route;
  });

  // Jewellery listings added in Shopify after the bundled file was generated
  // still render fine at runtime (the app merges static + live), but they were
  // never prerendered or listed in the sitemap because routes were seeded from
  // the bundled file alone. Only 18 of 68 live pieces had a static page. Seed
  // from Shopify too, so every sellable piece is crawlable and shareable.
  const routed = new Set(kept.map((r) => r.path));
  const jewellery = products
    .filter((p) => (p.vendor || "").trim().toLowerCase() === JEWELLERY_VENDOR)
    .map<SiteRoute>((p) => dated({ path: `/jewellery/${p.handle}`, changefreq: "weekly", priority: "0.8" }, p.handle))
    .filter((r) => !routed.has(r.path));
  if (jewellery.length) console.log(`routes: adding ${jewellery.length} live jewellery route(s)`);

  // Clothing listings live at /product/<handle>. They are read straight from
  // Shopify so every shareable product URL is prerendered with its own title,
  // description and preview image, and appears in the sitemap.
  const jewellerySet = new Set(jewelleryHandles);
  const clothing = products
    .filter((p) => (p.vendor || "").trim().toLowerCase() !== JEWELLERY_VENDOR && !jewellerySet.has(p.handle))
    .map<SiteRoute>((p) => dated({ path: `/product/${p.handle}`, changefreq: "monthly", priority: "0.8" }, p.handle));
  if (clothing.length) console.log(`routes: adding ${clothing.length} clothing product route(s)`);

  return [...keptDated, ...jewellery, ...clothing];
};


/*
  Deliberately absent, though App.tsx routes them:
    /index      renders the same component as "/", so listing it invites
                Google to pick between two URLs for one page
    /concepts   unlinked from any nav or footer
    /ring-lab   likewise
  Add them here if they ever become pages meant to be found.
*/
