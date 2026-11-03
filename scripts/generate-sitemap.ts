// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml and public/llms.txt from the same route list the
// prerenderer uses, so none of the three can describe a different site.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { BASE_URL, resolveSiteRoutes, sitemapRoutes, type SiteRoute } from "./routes";
import { allLandings, allArticles } from "../src/data/seoContent";

/*
  One sentence describing the business, used verbatim here, in the footer, and
  in the Organization schema. It was previously three different sentences:
  llms.txt called it a bridal couture house, the footer tagline said
  Indo-Western fashion and led with clothing, and the schema said demi-fine
  jewellery — while 71 of the ~100 indexed URLs are jewellery. Since 25 Oct 2026
  the site leads with two things, demi-fine jewellery and outfits made to
  measure, and the sentence says so in that order. Ready-to-wear clothing is out
  of the menus, but its product pages stay live, so nothing here says it is gone.
*/
export const BRAND_SENTENCE =
  "18K gold finished demi-fine jewellery, and outfits made to measure in Nashik, India.";

function generateSitemap(list: SiteRoute[]) {
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

function generateLlmsTxt(landings: typeof allLandings) {
  const line = (path: string, label: string, desc: string) => `- [${label}](${path}): ${desc}`;

  return [
    "# Naira Flore",
    "",
    `> ${BRAND_SENTENCE}`,
    "",
    "Naira Flore is a Nashik-based studio for two things. Naira Petite is its",
    "demi-fine jewellery line of hand-set brilliant-cut zircone and shell pearl in",
    "an 18K gold or rhodium finish, sealed anti-tarnish and waterproof. The studio",
    "also makes outfits to measure, designed with each client over WhatsApp.",
    "Jewellery ships in 3-7 working days; made-to-measure pieces take 4-8 weeks.",
    "Enquiries and customisation run through WhatsApp on +91 9561557935.",
    "",
    "## Core pages",
    "",
    line("/", "Home", "The jewellery line and the custom outfit journey."),
    line("/jewellery", "Naira Petite", "The demi-fine jewellery line: rings, earrings, bracelets and necklaces."),
    line("/customize", "Custom Outfits", "Outfits made to your measurements: share a brief, choose fabric and silhouette, and it is stitched for you."),
    line("/journal", "The Journal", "Guides on sizing, materials, care and choosing demi-fine jewellery."),
    line("/contact", "Contact", "WhatsApp, email and the Nashik studio."),
    line("/faqs", "FAQs", "Sizing, customisation timelines, delivery and care."),
    "",
    "## Jewellery collections",
    "",
    ...landings.map((c) =>
      line(`/jewellery/collections/${c.slug}`, c.h1, c.metaDescription),
    ),
    "",
    "## Journal",
    "",
    ...allArticles.map((a) => line(`/journal/${a.slug}`, a.title, a.metaDescription)),
    "",
    "## Policies",
    "",
    line("/exchange-return-policy", "Exchange & Return Policy", "Return windows and rules for made-to-measure versus ready-to-ship orders."),
    line("/privacy", "Privacy Policy", "How customer data is handled."),
    line("/terms", "Terms of Service", "Terms governing use of the site."),
    "",
  ].join("\n");
}

const routes = sitemapRoutes(await resolveSiteRoutes());
writeFileSync(resolve("public/sitemap.xml"), generateSitemap(routes));
console.log(`sitemap.xml written (${routes.length} entries)`);

/* llms.txt names the same collections the sitemap does. */
const listed = new Set(routes.map((r) => r.path));
const landings = allLandings.filter((c) => listed.has(`/jewellery/collections/${c.slug}`));
writeFileSync(resolve("public/llms.txt"), generateLlmsTxt(landings));
console.log(`llms.txt written (${landings.length} collections, ${allArticles.length} articles)`);
