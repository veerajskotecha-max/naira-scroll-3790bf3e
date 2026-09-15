/**
 * Meta Pixel standard events.
 *
 * The base pixel is loaded in index.html (fbq init + PageView). This module is
 * the single place the app calls to fire standard events, so every call site
 * stays consistent and safe when the pixel is blocked or not yet loaded.
 *
 * Every event is now sent twice: once from the browser (`fbq`) and once from
 * our own server (the `meta-capi` function). Both copies carry the same
 * `event_id`, so Meta deduplicates them into one event — the browser copy is
 * dropped by ad blockers and iOS often enough that the server copy is what
 * keeps match quality up.
 */

import { getFbBrowserId, getFbClickId, getVisitorId } from "@/lib/visitorId";

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

export const PIXEL_ID = "1232524215695667";

/** Events worth the server round trip. Low-value UI signals stay browser-only. */
const SERVER_EVENTS = new Set<PixelEvent>([
  "ViewContent",
  "AddToCart",
  "AddToWishlist",
  "InitiateCheckout",
  "AddPaymentInfo",
  "CompleteRegistration",
  "Search",
  "Lead",
  "Contact",
]);

/**
 * SHA-256 hash of the signed-in shopper's email, set only when that shopper
 * has accepted advertising matching. Never the raw address, never persisted.
 */
let hashedEmail: string | undefined;

const sha256Hex = async (value: string): Promise<string | undefined> => {
  try {
    const bytes = new TextEncoder().encode(value.trim().toLowerCase());
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return undefined;
  }
};

/**
 * Attaches (or clears) the signed-in shopper's email as a Meta match key.
 * Email is the single highest-value parameter Meta uses; it is hashed here in
 * the browser, so neither Meta nor our own server ever receives the address.
 */
export const setAdMatchEmail = async (email?: string | null) => {
  if (!email) {
    hashedEmail = undefined;
    return;
  }
  const next = await sha256Hex(email);
  if (!next || next === hashedEmail) return;
  hashedEmail = next;
  try {
    // Re-init with advanced matching so every later event carries the key.
    window.fbq?.("init", PIXEL_ID, { external_id: getVisitorId(), em: hashedEmail });
  } catch {
    /* pixel blocked */
  }
};

const newEventId = (): string => {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `e-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
};

const CAPI_URL = `${import.meta.env.VITE_SUPABASE_URL ?? ""}/functions/v1/meta-capi`;
const CAPI_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

/** Mirrors one event to Meta's Conversions API through our own function. */
const sendServerEvent = (event: PixelEvent, eventId: string, params?: Record<string, unknown>) => {
  if (!CAPI_URL.startsWith("http") || !SERVER_EVENTS.has(event)) return;
  try {
    void fetch(CAPI_URL, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", apikey: CAPI_KEY, Authorization: `Bearer ${CAPI_KEY}` },
      body: JSON.stringify({
        event_name: event,
        event_id: eventId,
        event_source_url: window.location.href,
        custom_data: params ?? {},
        user_data: {
          external_id: getVisitorId(),
          fbc: getFbClickId(),
          fbp: getFbBrowserId(),
          em: hashedEmail,
        },
      }),
    }).catch(() => {
      /* measurement must never break the shop */
    });
  } catch {
    /* ignore */
  }
};

/** Fires a Meta standard event (browser + server). No-ops when blocked. */
export const trackPixel = (event: PixelEvent, params?: Record<string, unknown>) => {
  const eventId = newEventId();
  try {
    window.fbq?.("track", event, params, { eventID: eventId });
  } catch {
    /* pixel blocked — analytics must never break the shop */
  }
  sendServerEvent(event, eventId, params);
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
