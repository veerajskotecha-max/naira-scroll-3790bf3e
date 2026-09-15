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
 * PageView. This module reads the same cookie and is the single accessor the
 * app uses (cart attributes handed to Shopify, per-event user data).
 */

export const VISITOR_COOKIE = "naira_vid";

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

/** Returns the visitor id, creating and persisting one on first call. */
export const getVisitorId = (): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const existing = readCookie(VISITOR_COOKIE);
  if (existing) return existing;
  const next = randomId();
  writeCookie(next);
  return next;
};

/**
 * Meta's click id cookie, written by the pixel from `?fbclid=`. Passed to
 * Shopify so the server-side Purchase event can be joined to the same click.
 */
export const getFbClickId = (): string | undefined => readCookie("_fbc");

/** Meta's browser id cookie. */
export const getFbBrowserId = (): string | undefined => readCookie("_fbp");
