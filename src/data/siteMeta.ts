/* Tiny, dependency-free site metadata.
   Kept OUT of seoContent.ts on purpose: seoContent pulls in the full landing
   and journal copy (~140 kB of source). The homepage only needs the
   Organization JSON-LD, so importing it from here keeps that copy out of the
   entry bundle. seoContent re-exports both names for backwards compatibility. */

export const SITE_URL = "https://nairaflore.com";

/**
 * Organization JSON-LD for the site.
 *
 * Every value below is taken from something already published on the site
 * (the PDP "Additional Information" block and the footer), so the schema and
 * the visible page agree — which is what Google checks.
 *
 * Deliberately omitted: `founder` and `foundingDate`. Both are recommended
 * for a brand Organization, but neither appears anywhere in the codebase and
 * inventing them would be fabricated markup. Fill them in and uncomment.
 */
export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Naira Flore",
  url: SITE_URL,
  // Google accepts JPG, PNG or WEBP for Organization.logo — not .ico.
  logo: `${SITE_URL}/logo.png`,
  email: "shopatnaira@gmail.com",
  telephone: "+91-9561557935",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Flat 7, Veeraj Blossom, Karanyogi Nagar",
    addressLocality: "Nashik",
    addressRegion: "Maharashtra",
    postalCode: "422002",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-9561557935",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["en", "hi", "mr"],
  },
  sameAs: ["https://www.instagram.com/nairaflore/"],
  // founder: { "@type": "Person", name: "<founder name>" },
  // foundingDate: "<YYYY>",
} as const;
