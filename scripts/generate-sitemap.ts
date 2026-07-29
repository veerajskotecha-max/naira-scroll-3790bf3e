// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { allLandings as categoryLandings, allArticles as journal } from "../src/data/seoContent";

// Product handles are read from the data file directly — importing the module
// would pull in Vite asset imports that tsx cannot resolve outside the bundler.
const jewelleryHandles = [
  ...readFileSync(resolve("src/data/jewellery.ts"), "utf8").matchAll(/handle:\s*"([^"]+)"/g),
].map((m) => m[1]);

const BASE_URL = "https://nairaflore.com";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/shop", changefreq: "weekly", priority: "0.9" },
  { path: "/jewellery", changefreq: "weekly", priority: "0.9" },
  ...categoryLandings.map<SitemapEntry>((c) => ({
    path: `/jewellery/collections/${c.slug}`,
    changefreq: "weekly",
    priority: "0.9",
  })),
  ...jewelleryHandles.map<SitemapEntry>((handle) => ({
    path: `/jewellery/${handle}`,
    changefreq: "monthly",
    priority: "0.8",
  })),
  { path: "/journal", changefreq: "weekly", priority: "0.7" },
  ...journal.map<SitemapEntry>((a) => ({
    path: `/journal/${a.slug}`,
    lastmod: a.published,
    changefreq: "monthly",
    priority: "0.7",
  })),
  { path: "/customize", changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/faqs", changefreq: "monthly", priority: "0.6" },
  { path: "/exchange-return-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

function generateSitemap(list: SitemapEntry[]) {
  const urls = list.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
