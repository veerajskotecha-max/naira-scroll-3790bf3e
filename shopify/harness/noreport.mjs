// Requests a test run must never send, so no run reaches anyone's reports: ad
// pixels and analytics tags, the site's own Meta relay (/functions/v1/meta-capi)
// and the host's visitor counter (/~api/analytics). Browser scripts check this
// first in their request handler and abort a match.
export const NO_REPORT = /(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics|analytics\.google|doubleclick|hotjar|monorail-edge|\/functions\/v1\/meta-capi|~api\/analytics)/i;
