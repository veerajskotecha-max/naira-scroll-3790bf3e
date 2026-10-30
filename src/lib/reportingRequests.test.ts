import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { REPORTING_REQUEST } from "./reportingRequests";

/*
  The prerender's capture browser blocked facebook.net/.com and fbcdn only, so
  the site's own Meta relay went straight past it: every publish build posted a
  ViewContent per product page to /functions/v1/meta-capi from 127.0.0.1.
*/
const SUPABASE = "https://xlsejigpjlqfvzfhhntf.supabase.co";

describe("requests the capture browser aborts", () => {
  it.each([
    `${SUPABASE}/functions/v1/meta-capi`,
    `${SUPABASE}/functions/v1/shopper-performance`,
    "https://connect.facebook.net/en_US/fbevents.js",
    "https://www.facebook.com/tr?id=1232524215695667&ev=PageView",
    "https://www.clarity.ms/tag/yizcbmxyht",
    "https://k.clarity.ms/collect",
    "https://www.googletagmanager.com/gtag/js?id=G-1",
    "https://monorail-edge.shopifysvc.com/v1/produce",
    "https://events.pickrr.com/v1/event",
    "https://static.cloudflareinsights.com/beacon.min.js",
    "http://127.0.0.1:4180/~api/analytics",
    "http://127.0.0.1:4180/~flock.js",
  ])("blocks %s", (url) => {
    expect(REPORTING_REQUEST.test(url)).toBe(true);
  });

  /* The capture still needs the shop itself: its code, Shopify's catalogue and
     images, the reels' signed media and the fonts. */
  it.each([
    "http://127.0.0.1:4180/jewellery/prism-riviere-bracelet",
    "http://127.0.0.1:4180/assets/index-BoVmHGha.js",
    "http://127.0.0.1:4180/__l5e/assets-v1/c14c6ac4/cat-rings.jpg",
    "https://nc5eti-gp.myshopify.com/api/2025-07/graphql.json",
    "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/prism.jpg?v=1",
    `${SUPABASE}/storage/v1/object/sign/reels/seed/reel-1.mp4?token=x`,
    `${SUPABASE}/rest/v1/reels?select=*`,
    "https://fonts.googleapis.com/css2?family=Jost",
  ])("lets %s through", (url) => {
    expect(REPORTING_REQUEST.test(url)).toBe(false);
  });

  it("is the pattern the prerender's capture browser routes", () => {
    const script = readFileSync(resolve(__dirname, "../../scripts/prerender.ts"), "utf8");
    expect(script).toMatch(/import \{ REPORTING_REQUEST \} from "\.\.\/src\/lib\/reportingRequests";/);
    expect(script).toMatch(/page\.route\(REPORTING_REQUEST, \(r\) => r\.abort\(\)\)/);
  });
});
