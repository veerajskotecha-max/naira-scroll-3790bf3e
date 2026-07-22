/**
 * Feature flags.
 *
 * Flip a boolean here (or set the matching VITE_* env var) and redeploy
 * to reveal work that has been built behind a flag. Keeps unreleased UI
 * out of the visitor's view without deleting or branching code.
 */
export const FEATURES = {
  /**
   * When false → the Jewellery section on /shop renders the elegant
   * "Coming Soon" panel for every tab.
   * When true  → the same tabs render a real product grid filtered by
   * Shopify tag (Earrings / Rings / Necklaces / Sets).
   *
   * Optional env override for per-environment control:
   *   VITE_JEWELLERY_LIVE=true
   */
  jewelleryLive:
    (import.meta.env.VITE_JEWELLERY_LIVE ?? "").toString().toLowerCase() === "true",
};
