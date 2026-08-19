export const SITE_ORIGIN = "https://nairaflore.com";

/**
 * Social crawlers require an absolute https URL for og:image / twitter:image.
 * Bundled assets resolve to "/assets/x.webp", which silently produces no
 * preview when a link is shared. Shopify CDN URLs are already absolute.
 */
export const absoluteUrl = (url?: string | null, fallback = `${SITE_ORIGIN}/og-image.jpg`) => {
  if (!url) return fallback;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${SITE_ORIGIN}${url}`;
  return `${SITE_ORIGIN}/${url}`;
};
