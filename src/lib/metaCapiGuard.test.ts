import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isShopPage } from "../../supabase/functions/meta-capi/guard";

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
