/*
  Requests the prerender's capture browser must never send.

  It opens every page of the shop on 127.0.0.1, so anything it reports is a
  visit nobody made. Blocking only Meta's own domains was not enough: the site
  mirrors the pixel through its own relay (/functions/v1/meta-capi), and a
  publish build sent a server-side ViewContent for every product page it
  captured, marked with a 127.0.0.1 address. The shop's shopper-performance
  log, the analytics tags and the checkout provider's events are the same kind
  of thing. Same list as the test harness's NO_REPORT, less Lovable's /__l5e/
  prefix: on this origin that is the app's own image path, not a beacon.
*/
export const REPORTING_REQUEST =
  /(facebook\.net|facebook\.com|fbcdn\.net|clarity\.ms|googletagmanager|google-analytics|analytics\.google|doubleclick|hotjar|monorail-edge|events\.pickrr\.com|cloudflareinsights\.com|\/functions\/v1\/meta-capi|\/functions\/v1\/shopper-performance|~api\/analytics|~flock\.js|tinybird\.co)/i;
