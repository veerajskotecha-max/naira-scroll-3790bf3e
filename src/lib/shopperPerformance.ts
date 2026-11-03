export const SLOW_READY_MS = 3000;
export const SLOW_LCP_MS = 4000;
export type PerformanceKind = "timing" | "missing_product" | "unknown_page" | "product_load_error" | "route_timeout";
export const productionShop = (host: string) => host === "nairaflore.com" || host === "www.nairaflore.com";
// Never collect checkout/order tokens, arbitrary query strings or shopper identifiers.
export const safePerformancePath = (path: string) => {
  if (/^\/(?:admin|auth|account|cart|checkouts|\.lovable|\d{6,})(?:\/|$)/.test(path)) return null;
  return /^\/[a-zA-Z0-9/_-]{0,299}$/.test(path) ? path : null;
};
export const campaignLabels = (search: string) => {
  const query = new URLSearchParams(search);
  const clean = (key: string, max: number) => {
    const value = query.get(key) ?? "";
    return /^[a-zA-Z0-9 _.-]*$/.test(value) && !value.includes("@") ? value.slice(0, max) : "";
  };
  return { campaign: clean("utm_campaign", 100), source: clean("utm_source", 60) };
};
export const isSlowPage = (page: { ready_p75: number | null; lcp_p75: number | null }) =>
  (page.ready_p75 ?? 0) > SLOW_READY_MS || (page.lcp_p75 ?? 0) > SLOW_LCP_MS;

const endpoint = () => `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopper-performance`;
let landing: { landing_path: string; campaign: string; source: string } | null = null;
export const initPerformanceLanding = () => {
  const path = safePerformancePath(window.location.pathname);
  if (!landing && path) landing = { landing_path: path, ...campaignLabels(window.location.search) };
};
/* crypto.randomUUID arrived in Safari 15.4 and Chrome 92; the build still runs
   on Safari 14 and Chrome 87, where it threw inside a page's effect and the
   error panel replaced the shop. The fallback is a real v4 UUID, because the
   function's z.string().uuid() rejects anything else. */
export const eventId = () => {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};
export const reportShopperPerformance = (kind: PerformanceKind, timing: Record<string, unknown> = {}) => {
  // Called from page effects: whatever goes wrong here must never take the page down.
  try {
    if (!productionShop(window.location.hostname)) return;
    initPerformanceLanding();
    const path = safePerformancePath(typeof timing.path === "string" ? timing.path : window.location.pathname);
    if (!path || !landing) return;
    const payload = {
      id: eventId(), path, ...landing, kind,
      device: window.innerWidth < 768 ? "mobile" : "desktop",
      navigation: "client", ...timing,
    };
    // A single small, best-effort request; telemetry must never block shopping.
    void fetch(endpoint(), {
      method: "POST", keepalive: true,
      headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  } catch { /* telemetry is optional */ }
};