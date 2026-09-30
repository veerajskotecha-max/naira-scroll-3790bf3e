// Requests a test run must never send, so no run reaches anyone's reports: ad
// pixels and analytics tags, the site's own Meta relay (/functions/v1/meta-capi),
// the host's visitor counter (/~api/analytics) and the visitor events the
// checkout provider's script sends when the bag fills (Shiprocket, Cloudflare).
// Every browser script checks this first in its request handler and aborts a match.
export const NO_REPORT = /(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics|analytics\.google|doubleclick|hotjar|monorail-edge|events\.pickrr\.com|cloudflareinsights\.com|\/functions\/v1\/meta-capi|~api\/analytics)/i;
