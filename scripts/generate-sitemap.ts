// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml and public/llms.txt from the same route list the
// prerenderer uses, so none of the three can describe a different site.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { BASE_URL, resolveSiteRoutes, type SiteRoute } from "./routes";
import { allLandings, allArticles } from "../src/data/seoContent";

/*
  One sentence describing the business, used verbatim here, in the footer, and
  in the Organization schema. It was previously three different sentences:
  llms.txt called it a bridal couture house, the footer tagline said
  Indo-Western fashion and led with clothing, and the schema said demi-fine
  jewellery — while 71 of the ~100 indexed URLs are jewellery.
*/
export const BRAND_SENTENCE =
  "Handcrafted Indo-Western wear and 18K gold finished demi-fine jewellery, made to order in Nashik, India.";

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

function generateLlmsTxt() {
  const line = (path: string, label: string, desc: string) => `- [${label}](${path}): ${desc}`;

  return [
    "# Naira Flore",
    "",
    `> ${BRAND_SENTENCE}`,
    "",
    "Naira Flore is a Nashik-based atelier. The catalogue is led by Naira Petite,",
    "a demi-fine jewellery line of hand-set brilliant-cut zircone and shell pearl",
    "in an 18K gold or rhodium finish, sealed anti-tarnish and waterproof. It also",
    "makes made-to-measure Indo-Western wear. Jewellery ships ready-to-wear in 3-7",
    "working days; made-to-measure pieces take 4-8 weeks. Enquiries and",
    "customisation run through WhatsApp on +91 9561557935.",
    "",
    "## Core pages",
    "",
    line("/", "Home", "New arrivals, the jewellery line, and the customisation journey."),
    line("/shop", "Shop All", "The full catalogue — jewellery and Indo-Western wear, filterable by category."),
    line("/jewellery", "Naira Petite", "The demi-fine jewellery line: rings, earrings, bracelets and necklaces."),
    line("/journal", "The Journal", "Guides on sizing, materials, care and choosing demi-fine jewellery."),
    line("/customize", "Customise", "Made-to-measure process — share a brief and co-create a piece."),
    line("/about", "About", "The atelier story, craft philosophy and values."),
    line("/contact", "Contact", "WhatsApp, email and the Nashik studio."),
    line("/faqs", "FAQs", "Sizing, customisation timelines, delivery and care."),
    "",
    "## Jewellery collections",
    "",
    ...allLandings.map((c) =>
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

const routes = await resolveSiteRoutes();
writeFileSync(resolve("public/sitemap.xml"), generateSitemap(routes));
console.log(`sitemap.xml written (${routes.length} entries)`);

writeFileSync(resolve("public/llms.txt"), generateLlmsTxt());
console.log(`llms.txt written (${allLandings.length} collections, ${allArticles.length} articles)`);
