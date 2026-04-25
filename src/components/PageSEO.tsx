import { Helmet } from "react-helmet-async";

interface PageSEOProps {
  title: string;
  description: string;
  canonical?: string;
  type?: "website" | "product";
  image?: string;
}

/**
 * Drop-in SEO head component. Use in every page.
 * <PageSEO title="..." description="..." />
 */
const PageSEO = ({
  title,
  description,
  canonical,
  type = "website",
  image,
}: PageSEOProps) => {
  const fullTitle = title.includes("Naira Flore")
    ? title
    : `${title} | Naira Flore`;
  const ogImage =
    image ||
    "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d9f51973-2ec0-4d49-a69e-f13e9fffd76c/id-preview-2d7a8ea8--65257c60-b4a2-459e-a774-14078a2a16e3.lovable.app-1773403558374.png";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      {/* OG */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default PageSEO;
