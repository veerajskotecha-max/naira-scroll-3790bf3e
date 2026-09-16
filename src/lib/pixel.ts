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
 * The shopper's hashed Meta match keys, set only when a signed-in member has
 * accepted advertising matching. Raw values never leave this module: they are
 * SHA-256'd here in the browser, so neither Meta nor our own server ever
 * receives the address or the number.
 */
type MatchKeys = { em?: string; ph?: string };
let matchKeys: MatchKeys = {};

const sha256Hex = async (value: string): Promise<string | undefined> => {
  try {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return undefined;
  }
};

/** Meta's normalisation for `em`: trimmed and lowercased before hashing. */
export const normalizeEmail = (email?: string | null): string | undefined => {
  const clean = email?.trim().toLowerCase();
  // Cheapest possible sanity check — a hash of "not an email" matches nothing
  // and only pollutes the match pool.
  return clean && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean) ? clean : undefined;
};

/**
 * Meta's normalisation for `ph`: digits only, country code included, no
 * leading zeros and no punctuation.
 *
 * Members enter their number every which way — "+91 98765 43210",
 * "098765-43210", "9876543210". The store sells only into India (INR, IST,
 * India), so a bare ten-digit number is an Indian one and takes the 91 prefix;
 * anything already carrying a country code is left alone. A number that cannot
 * be read as a real subscriber number returns undefined rather than a hash of
 * junk.
 */
export const normalizePhone = (phone?: string | null): string | undefined => {
  if (!phone) return undefined;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  digits = digits.replace(/^00+/, ""); // international access prefix
  digits = digits.replace(/^0+/, ""); // domestic trunk prefix
  // Bare Indian subscriber number (mobile numbers start 6-9).
  if (/^[6-9]\d{9}$/.test(digits)) digits = `91${digits}`;
  // Shortest plausible E.164 is 8 digits, longest is 15.
  return digits.length >= 8 && digits.length <= 15 ? digits : undefined;
};

/**
 * Attaches (or clears) the shopper's Meta match keys.
 *
 * Email and phone are the two highest-value parameters Meta matches on, and
 * `external_id` rides along on the same init so it survives every re-init.
 * Passing nothing clears the keys — which MUST still re-initialise the pixel.
 * Clearing only the module variable used to leave fbevents.js holding the
 * previous member's `em`, so every event fired after a sign-out still carried
 * the signed-out member's address.
 */
export const setAdMatchIdentity = async (identity?: { email?: string | null; phone?: string | null } | null) => {
  const email = normalizeEmail(identity?.email);
  const phone = normalizePhone(identity?.phone);

  const next: MatchKeys = {};
  if (email) next.em = await sha256Hex(email);
  if (phone) next.ph = await sha256Hex(phone);

  if (next.em === matchKeys.em && next.ph === matchKeys.ph) return;
  matchKeys = next;

  try {
    /* Re-init with advanced matching so every later event carries the keys.
       fbevents.js accepts an already-hashed 64-char hex value as-is. */
    window.fbq?.("init", PIXEL_ID, {
      external_id: getVisitorId(),
      ...(matchKeys.em ? { em: matchKeys.em } : {}),
      ...(matchKeys.ph ? { ph: matchKeys.ph } : {}),
    });
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
          ...matchKeys,
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
