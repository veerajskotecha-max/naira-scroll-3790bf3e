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

/**
 * The square social-preview variant of a Shopify image.
 *
 * WhatsApp, iMessage and Slack fetch og:image inline while drawing the link
 * bubble and quietly drop anything too heavy — no thumbnail, no error. The
 * product masters are 2048x2048 PNGs weighing 4-9 MB, so the card fell back to
 * the site-wide og-image.jpg on every share.
 *
 * Asking the CDN for a 1200px JPEG takes the same frame from 5.6 MB to about
 * 165 KB, which every crawler accepts.
 */
export const OG_IMAGE_SIZE = 1200;

export const shopifyOgImage = (url: string, size: number = OG_IMAGE_SIZE): string => {
  if (!isShopifyCdn(url)) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("width", String(size));
    u.searchParams.set("height", String(size));
    u.searchParams.set("crop", "center");
    // A PNG original stays multi-megabyte at any pixel size; only the format
    // swap gets the file small enough to preview.
    u.searchParams.set("format", "jpg");
    return u.toString();
  } catch {
    return url;
  }
};
