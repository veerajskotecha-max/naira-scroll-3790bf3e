/**
 * Meta Pixel standard events.
 *
 * The base pixel is loaded in index.html (fbq init + PageView). This module is
 * the single place the app calls to fire standard events, so every call site
 * stays consistent and safe when the pixel is blocked or not yet loaded.
 */

type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

export type PixelEvent =
  | "AddPaymentInfo"
  | "AddToCart"
  | "AddToWishlist"
  | "CompleteRegistration"
  | "Contact"
  | "CustomizeProduct"
  | "Donate"
  | "FindLocation"
  | "InitiateCheckout"
  | "Lead"
  | "Purchase"
  | "Schedule"
  | "Search"
  | "StartTrial"
  | "SubmitApplication"
  | "Subscribe"
  | "ViewContent";

export const CURRENCY = "INR";

/** Fires a Meta standard event. No-ops when the pixel is unavailable. */
export const trackPixel = (event: PixelEvent, params?: Record<string, unknown>) => {
  try {
    window.fbq?.("track", event, params);
  } catch {
    /* pixel blocked — analytics must never break the shop */
  }
};

/** Fires the base PageView (used on client-side route changes). */
export const trackPageView = () => {
  try {
    window.fbq?.("track", "PageView");
  } catch {
    /* ignore */
  }
};

/**
 * Meta keys every catalogue row on `retailer_id`, and Shopify's Facebook &
 * Instagram channel sets that to the bare numeric variant ID ("45794971222178").
 * The Storefront API hands us the GID form, so strip it back to digits. Sending
 * anything else — a handle, a slug — matches no catalogue row, which silently
 * costs both dynamic retargeting and conversion attribution.
 */
export const shopifyNumericId = (gid?: string | null): string | undefined => {
  if (!gid) return undefined;
  const match = /(\d+)\s*$/.exec(gid);
  return match ? match[1] : undefined;
};

type ProductLike = {
  id: string;
  /** Shopify variant GID. Preferred over `id` as the catalogue content id. */
  variantId?: string | null;
  name: string;
  price?: number;
  category?: string;
  currencyCode?: string;
  quantity?: number;
};

export const productParams = ({ id, variantId, name, price, category, currencyCode, quantity }: ProductLike) => {
  const qty = quantity && quantity > 0 ? quantity : 1;
  // Meta requires `value` to be a positive number (decimals allowed).
  const value = typeof price === "number" && price > 0 ? Number((price * qty).toFixed(2)) : undefined;
  // Fall back to the handle only when no variant is known — it will not match
  // the catalogue, but a malformed event is worse than an unmatched one.
  const contentId = shopifyNumericId(variantId) ?? id;
  return {
    content_ids: [contentId],
    content_name: name,
    content_type: "product",
    content_category: category,
    contents: [{ id: contentId, quantity: qty, ...(value ? { item_price: Number((value / qty).toFixed(2)) } : {}) }],
    ...(value ? { value } : {}),
    currency: currencyCode || CURRENCY,
  };
};

