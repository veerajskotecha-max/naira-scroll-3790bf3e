/**
 * Anonymous first-party visitor id.
 *
 * Meta's `external_id` match key is the only identifier that exists for a
 * logged-out shopper, so every browser event should carry one. The value is a
 * random opaque UUID — never an email, a phone number or a hash of anything
 * personal — stored in a first-party cookie for two years.
 *
 * The cookie is written by the inline snippet in index.html before
 * `fbq('init', ...)` runs, so advanced matching has it on the very first
 * PageView. That snippet also parks the value on `window.__nairaVid`, which is
 * the authoritative source here: it is the exact value the browser pixel was
 * initialised with, and it survives the case where the cookie write itself
 * fails. This module is the single accessor the app uses (cart attributes
 * handed to Shopify, per-event user data).
 */

export const VISITOR_COOKIE = "naira_vid";

declare global {
  interface Window {
    /** Visitor id chosen by the inline snippet in index.html, pre-`fbq('init')`. */
    __nairaVid?: string;
  }
}

const readCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
};

const randomId = (): string => {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `v-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
};

const writeCookie = (value: string) => {
  if (typeof document === "undefined") return;
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${VISITOR_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=63072000; SameSite=Lax${secure}`;
};

/*
  Remembered for the life of the page.

  Without this, a browser that refuses cookies re-entered the mint-a-new-id
  branch on every single call: the cookie write silently failed, the next read
  found nothing, and each event went out under a *different* external_id. That
  is worse than sending none — it inflates Meta's unique-user count and, because
  the browser pixel was initialised once from window.__nairaVid, the server copy
  of an event no longer shared an external_id with its own browser twin.
*/
let cachedId: string | undefined;

/** Returns the visitor id, creating and persisting one on first call. */
export const getVisitorId = (): string | undefined => {
  if (typeof document === "undefined") return undefined;
  if (cachedId) return cachedId;
  // The id the pixel was actually initialised with wins, then the cookie.
  cachedId = (typeof window !== "undefined" ? window.__nairaVid : undefined) || readCookie(VISITOR_COOKIE);
  if (cachedId) return cachedId;
  cachedId = randomId();
  writeCookie(cachedId);
  return cachedId;
};

/** Test seam: drops the in-memory id so the next read re-resolves it. */
export const resetVisitorIdCache = () => {
  cachedId = undefined;
};

/**
 * Meta's click id cookie, written from `?fbclid=` by the inline snippet in
 * index.html (and later by fbevents.js). Passed to Shopify so the server-side
 * Purchase event can be joined to the same click.
 */
export const getFbClickId = (): string | undefined => readCookie("_fbc");

/** Meta's browser id cookie. */
export const getFbBrowserId = (): string | undefined => readCookie("_fbp");
