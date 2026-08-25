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
  /* /shop/indo-western and /shop/jewellery are deliberately absent. Both render
     ShopAll, which hardcodes canonical=/shop, so listing them told Google to
     index URLs the pages themselves disclaim. Jewellery already has the richer
     /jewellery landing. They still route and still work — they are just no
     longer advertised as canonical destinations. */
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

interface LiveProduct {
  handle: string;
  vendor: string;
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
        query: `{ products(first: 250) { edges { node { handle vendor } } } }`,
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

export const resolveSiteRoutes = async (): Promise<SiteRoute[]> => {
  const products = await fetchLiveProducts();
  if (!products) {
    console.warn("routes: could not reach Shopify, keeping all product routes");
    return siteRoutes;
  }
  const live = new Set(products.map((p) => p.handle));
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

  // Jewellery listings added in Shopify after the bundled file was generated
  // still render fine at runtime (the app merges static + live), but they were
  // never prerendered or listed in the sitemap because routes were seeded from
  // the bundled file alone. Only 18 of 68 live pieces had a static page. Seed
  // from Shopify too, so every sellable piece is crawlable and shareable.
  const routed = new Set(kept.map((r) => r.path));
  const jewellery = products
    .filter((p) => (p.vendor || "").trim().toLowerCase() === JEWELLERY_VENDOR)
    .map<SiteRoute>((p) => ({ path: `/jewellery/${p.handle}`, changefreq: "weekly", priority: "0.8" }))
    .filter((r) => !routed.has(r.path));
  if (jewellery.length) console.log(`routes: adding ${jewellery.length} live jewellery route(s)`);

  // Clothing listings live at /product/<handle>. They are read straight from
  // Shopify so every shareable product URL is prerendered with its own title,
  // description and preview image, and appears in the sitemap.
  const jewellerySet = new Set(jewelleryHandles);
  const clothing = products
    .filter((p) => (p.vendor || "").trim().toLowerCase() !== JEWELLERY_VENDOR && !jewellerySet.has(p.handle))
    .map<SiteRoute>((p) => ({ path: `/product/${p.handle}`, changefreq: "monthly", priority: "0.8" }));
  if (clothing.length) console.log(`routes: adding ${clothing.length} clothing product route(s)`);

  return [...kept, ...jewellery, ...clothing];
};


/*
  Deliberately absent, though App.tsx routes them:
    /index      renders the same component as "/", so listing it invites
                Google to pick between two URLs for one page
    /concepts   unlinked from any nav or footer
    /ring-lab   likewise
  Add them here if they ever become pages meant to be found.
*/
