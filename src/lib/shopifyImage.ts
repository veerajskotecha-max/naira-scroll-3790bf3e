/**
 * Shopify CDN image helpers.
 *
 * Shopify's CDN supports on-the-fly resizing via query params:
 *   https://cdn.shopify.com/.../image.jpg?width=600
 *
 * Serving an appropriately sized variant (instead of the full 2000–3000px
 * original) is the single biggest perf win for image delivery / LCP.
 */

const isShopifyCdn = (url: string): boolean =>
  typeof url === "string" && url.includes("cdn.shopify.com");

/**
 * Append (or replace) a `width=` query param on a Shopify CDN URL.
 * Non-Shopify URLs are returned unchanged.
 */
export const shopifyImage = (url: string, width: number): string => {
  if (!isShopifyCdn(url)) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("width", String(width));
    return u.toString();
  } catch {
    return url;
  }
};

/**
 * Build a responsive srcset string for a Shopify image at the given widths.
 * Returns an empty string for non-Shopify URLs (so callers can skip srcset).
 */
export const shopifySrcSet = (
  url: string,
  widths: number[] = [300, 400, 600, 800, 1200],
): string => {
  if (!isShopifyCdn(url)) return "";
  return widths
    .map((w) => `${shopifyImage(url, w)} ${w}w`)
    .join(", ");
};
