/*
  The campaign that brought the shopper in, kept for the session.

  The router rewrites the URL as soon as the shopper moves on, so the checkout
  hand-off used to read whatever page the shopper was on at the tap: an ad
  click that browsed from a collection to a piece reached checkout with no
  campaign at all (docs/measurement-playbook.md: read UTMs from the landing
  URL, once). The first campaign a session lands with is kept for that tab's
  session and handed to both checkouts. Storage can be blocked (some in-app
  browsers), so a copy is kept in memory as well.
*/
const KEY = "naira_landing_utm";
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

type Utm = Partial<Record<(typeof UTM_KEYS)[number], string>>;

let inMemory: Utm | null = null;

export const utmFrom = (search: string): Utm => {
  const params = new URLSearchParams(search);
  const out: Utm = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) out[key] = value;
  }
  return out;
};

const stored = (): Utm | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Utm) : null;
  } catch {
    return null;
  }
};

/** The session's first campaign, or an empty object. */
export const sessionUtm = (): Utm => stored() ?? inMemory ?? {};

/** Notes the landing campaign; the first one a session sees is kept. */
export const captureLandingUtm = (search = typeof window === "undefined" ? "" : window.location.search) => {
  if (Object.keys(sessionUtm()).length) return;
  const utm = utmFrom(search);
  if (!Object.keys(utm).length) return;
  inMemory = utm;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(utm));
  } catch {
    /* storage blocked: the in-memory copy serves this page's life */
  }
};

/** "utm_source=…&utm_campaign=…", as Fastrr's utmParams takes it. */
export const sessionUtmParams = (): string =>
  Object.entries(sessionUtm())
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

/** The checkout URL with the session's campaign on it, unless it has one. */
export const withSessionUtm = (url: string): string => {
  const utm = sessionUtm();
  if (!Object.keys(utm).length) return url;
  try {
    const out = new URL(url);
    if (UTM_KEYS.some((key) => out.searchParams.has(key))) return url;
    for (const [key, value] of Object.entries(utm)) out.searchParams.set(key, value);
    return out.toString();
  } catch {
    return url;
  }
};

/** Test seam: forgets the session's campaign. */
export const resetLandingUtmForTest = () => {
  inMemory = null;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};

/* Read at boot, while the address is still the one the shopper landed on:
   this module is loaded with the bag, before the first render. */
captureLandingUtm();
