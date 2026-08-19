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
  Deliberately absent, though App.tsx routes them:
    /index      renders the same component as "/", so listing it invites
                Google to pick between two URLs for one page
    /concepts   unlinked from any nav or footer
    /ring-lab   likewise
  Add them here if they ever become pages meant to be found.
*/
