import { Helmet } from "react-helmet-async";

interface PageSEOProps {
  title: string;
  description: string;
  canonical?: string;
  type?: "website" | "product" | "article";
  image?: string;
  /** Keep thin/internal routes out of the index. */
  noindex?: boolean;
  /** One or more JSON-LD objects rendered as ld+json scripts. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Drop-in SEO head component. Use in every page.
 * <PageSEO title="..." description="..." canonical="..." />
 */
const PageSEO = ({
  title,
  description,
  canonical,
  type = "website",
  image,
  noindex = false,
  jsonLd,
}: PageSEOProps) => {
  const fullTitle = title.includes("Naira Flore")
    ? title
    : `${title} | Naira Flore`;
  // The previous default was a Lovable preview screenshot on an R2 bucket — a
  // build-tool artifact, not a chosen asset, and it was the social card for
  // every page that did not pass its own image. public/og-image.jpg is a real
  // brand photograph.
  const ogImage = image || "https://nairaflore.com/og-image.jpg";

  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}
      {/* OG */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:site_name" content="Naira Flore" />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
};

export default PageSEO;

/* ── shared JSON-LD builders ─────────────────────────────────── */

export const breadcrumbLd = (crumbs: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: c.url,
  })),
});

export const faqLd = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});
