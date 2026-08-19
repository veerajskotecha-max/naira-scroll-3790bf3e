// The site's route list, in one place.
//
// The sitemap generator and the prerenderer both read this. They used to be
// able to drift: a stale deploy once published 39 /jewellery/<handle> URLs that
// no longer existed in the data, and every one of them bounced to /jewellery.
// One source means a URL cannot be advertised without also being prerendered.

import { readFileSync } from "fs";
import { resolve } from "path";
import { allLandings as categoryLandings, allArticles as journal } from "../src/data/seoContent";

// Product handles are read from the data file as text rather than imported —
// the module pulls in Vite asset imports that tsx cannot resolve outside the
// bundler.
const jewelleryHandles = [
  ...readFileSync(resolve("src/data/jewellery.ts"), "utf8").matchAll(/handle:\s*"([^"]+)"/g),
].map((m) => m[1]);

export const BASE_URL = "https://nairaflore.com";

export interface SiteRoute {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const siteRoutes: SiteRoute[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/shop", changefreq: "weekly", priority: "0.9" },
  { path: "/shop/indo-western", changefreq: "weekly", priority: "0.8" },
  { path: "/shop/jewellery", changefreq: "weekly", priority: "0.8" },
  { path: "/jewellery", changefreq: "weekly", priority: "0.9" },
  ...categoryLandings.map<SiteRoute>((c) => ({
    path: `/jewellery/collections/${c.slug}`,
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

  { path: "/about", changefreq: "monthly", priority: "0.6" },
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

const fetchLiveHandles = async (): Promise<Set<string> | null> => {
  try {
    const res = await fetch(STOREFRONT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: `{ products(first: 250) { edges { node { handle } } } }`,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { products?: { edges?: { node: { handle: string } }[] } };
    };
    const edges = json.data?.products?.edges;
    if (!edges?.length) return null;
    return new Set(edges.map((e) => e.node.handle));
  } catch {
    return null;
  }
};

export const resolveSiteRoutes = async (): Promise<SiteRoute[]> => {
  const live = await fetchLiveHandles();
  if (!live) {
    console.warn("routes: could not reach Shopify, keeping all product routes");
    return siteRoutes;
  }
  const dropped: string[] = [];
  const kept = siteRoutes.filter((route) => {
    const match = route.path.match(/^\/jewellery\/([^/]+)$/);
    if (!match || match[1] === "collections") return true;
    if (live.has(match[1])) return true;
    dropped.push(route.path);
    return false;
  });
  if (dropped.length) {
    console.log(`routes: skipping ${dropped.length} delisted product route(s)`);
  }
  return kept;
};

/*
  Deliberately absent, though App.tsx routes them:
    /index      renders the same component as "/", so listing it invites
                Google to pick between two URLs for one page
    /concepts   unlinked from any nav or footer
    /ring-lab   likewise
  Add them here if they ever become pages meant to be found.
*/
