import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isRelayedEvent, isShopOrigin, isShopPage, RELAYED_EVENTS } from "../../supabase/functions/meta-capi/guard";
import { SERVER_EVENTS } from "./pixel";

/*
  The meta-capi relay forwarded any event_source_url to Meta: a Lovable
  preview, a localhost run and the publish build's capture browser
  (http://127.0.0.1:4180/jewellery/<handle>) all reached the live pixel as
  shoppers. The relay's entry point runs on Deno and cannot be imported here,
  so its checks live in guard.ts and this file pins both the checks and their
  use.
*/
const relay = readFileSync(resolve(__dirname, "../../supabase/functions/meta-capi/index.ts"), "utf8");

describe("the Meta relay forwards events from the shop's own pages only", () => {
  it.each([
    "https://nairaflore.com/jewellery/prism-riviere-bracelet",
    "https://www.nairaflore.com/jewellery/prism-riviere-bracelet?fbclid=abc",
    "https://nairaflore.com/",
  ])("forwards %s", (url) => {
    expect(isShopPage(url)).toBe(true);
  });

  it.each([
    ["the capture browser", "http://127.0.0.1:4180/jewellery/prism-riviere-bracelet"],
    ["a dev server", "http://localhost:8080/jewellery/prism-riviere-bracelet"],
    ["a Lovable preview", "https://id-preview--1a2b3c.lovable.app/jewellery/prism-riviere-bracelet"],
    ["a preview carrying the shop's name", "https://nairaflore-com.lovable.app/"],
    ["a look-alike host", "https://nairaflore.com.evil.example/"],
    ["another subdomain", "https://payments.nairaflore.com/checkouts/cn/x"],
    ["plain http", "http://nairaflore.com/"],
    ["another port", "https://nairaflore.com:8443/"],
    ["no address", undefined],
    ["an empty address", ""],
    ["not a URL", "nairaflore.com/jewellery"],
  ])("skips %s", (_name, url) => {
    expect(isShopPage(url)).toBe(false);
  });

  it("checks the page before anything is forwarded to Meta", () => {
    expect(relay).toMatch(/import \{[^}]*\bisShopPage\b[^}]*\} from "\.\/guard\.ts";/);
    const check = relay.indexOf("if (!isShopPage(body.event_source_url))");
    expect(check).toBeGreaterThan(relay.indexOf("const body = parsed.data;"));
    expect(check).toBeLessThan(relay.indexOf("await fetch(`${GRAPH}"));
    expect(relay.slice(check, check + 200)).toMatch(/return new Response/);
  });
});

/*
  Anyone could post to the relay with the publishable key the bundle ships:
  a forged Purchase {value: 999999} from https://evil.example, or a made-up
  event name, went to Meta under the shop's pixel exactly like a shopper's
  ViewContent.
*/
describe("the Meta relay takes only the shop's own callers and events", () => {
  it.each(["https://nairaflore.com", "https://www.nairaflore.com"])("accepts posts from %s", (origin) => {
    expect(isShopOrigin(origin)).toBe(true);
  });

  it.each([
    ["another site", "https://evil.example"],
    ["a Lovable preview", "https://id-preview--1a2b3c.lovable.app"],
    ["plain http", "http://nairaflore.com"],
    ["a look-alike", "https://nairaflore.com.evil.example"],
    ["the checkout subdomain", "https://payments.nairaflore.com"],
    ["an opaque origin", "null"],
    ["no Origin header (a script)", null],
  ])("refuses %s", (_name, origin) => {
    expect(isShopOrigin(origin)).toBe(false);
  });

  it("relays exactly the events the shop's pages send", () => {
    expect([...RELAYED_EVENTS].sort()).toEqual([...SERVER_EVENTS].sort());
    for (const name of SERVER_EVENTS) expect(isRelayedEvent(name)).toBe(true);
  });

  it.each(["Purchase", "TotallyMadeUpEvent", "PageView", "Subscribe", "CustomizeProduct", "viewcontent", "", undefined])(
    "refuses %s",
    (name) => {
      expect(isRelayedEvent(name)).toBe(false);
    },
  );

  it("refuses a foreign caller first, and an unlisted event before anything reaches Meta", () => {
    const origin = relay.indexOf('if (!isShopOrigin(req.headers.get("origin")))');
    const event = relay.indexOf("if (!isRelayedEvent(body.event_name))");
    const send = relay.indexOf("await fetch(`${GRAPH}");
    expect(origin).toBeGreaterThan(relay.indexOf('if (req.method === "OPTIONS")'));
    expect(origin).toBeLessThan(relay.indexOf("const parsed = BodySchema.safeParse"));
    expect(relay.slice(origin, origin + 260)).toMatch(/status: 403/);
    expect(event).toBeGreaterThan(relay.indexOf("const body = parsed.data;"));
    expect(event).toBeLessThan(send);
    expect(relay.slice(event, event + 260)).toMatch(/status: 400/);
  });
});
