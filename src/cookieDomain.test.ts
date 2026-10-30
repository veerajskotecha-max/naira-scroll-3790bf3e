import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { visitorCookie } from "@/lib/visitorId";

/*
  The visitor id (naira_vid) and the ad click id (_fbc) were written for the
  exact host only. Live: after landing on https://nairaflore.com/?fbclid=…, a
  page on payments.nairaflore.com (Shopify's checkout) received neither in its
  Cookie header, while a cookie written for .nairaflore.com did arrive. These
  run index.html's own inline scripts in a fresh page at each address, then
  ask the cookie jar what the checkout's host would be sent.
*/
const html = readFileSync(resolve(__dirname, "../index.html"), "utf8");
const inline = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .filter(([tag]) => !/\bsrc=|type="(?:module|application\/ld\+json)"/.test(tag.slice(0, tag.indexOf(">"))))
  .map(([, body]) => body);

const CHECKOUT = "https://payments.nairaflore.com/checkouts/cn/x";
const pages: JSDOM[] = [];
const land = (url: string, existing: string[] = []) => {
  // One inert <script> for the loaders to insert theirs beside; nothing is fetched.
  const dom = new JSDOM("<!doctype html><html><head><script></script></head><body></body></html>", { url, runScripts: "outside-only" });
  pages.push(dom);
  for (const cookie of existing) dom.cookieJar.setCookieSync(cookie, url);
  for (const script of inline) dom.window.eval(script);
  return dom;
};
const sentTo = (dom: JSDOM, at: string, name: string) => dom.cookieJar.getCookiesSync(at).filter((c) => c.key === name);

afterEach(() => {
  while (pages.length) pages.pop()!.window.close();
});

describe("the shop's ids reach its own checkout", () => {
  it.each(["https://nairaflore.com/?fbclid=AdClick1", "https://www.nairaflore.com/jewellery?fbclid=AdClick1"])("from %s", (url) => {
    const dom = land(url);
    const vid = sentTo(dom, CHECKOUT, "naira_vid");
    const fbc = sentTo(dom, CHECKOUT, "_fbc");
    expect(vid).toHaveLength(1);
    expect(vid[0].value).toBe(encodeURIComponent(dom.window.__nairaVid));
    expect(vid[0].maxAge).toBe(63072000);
    expect(fbc).toHaveLength(1);
    expect(fbc[0].value).toMatch(/^fb\.1\.\d{13}\.AdClick1$/);
    expect(fbc[0].maxAge).toBe(7776000);
    // One copy of each on the shop itself, the shared one.
    expect(sentTo(dom, url, "naira_vid")).toHaveLength(1);
    expect(sentTo(dom, url, "_fbc")).toHaveLength(1);
  });

  it("moves a returning visitor's ids onto the shop's domain, unchanged", () => {
    const clicked = Date.now() - 10 * 86400 * 1000;
    const dom = land("https://nairaflore.com/", ["naira_vid=returning-visitor; Path=/", `_fbc=fb.1.${clicked}.OldClick; Path=/`]);
    expect(sentTo(dom, CHECKOUT, "naira_vid").map((c) => c.value)).toEqual(["returning-visitor"]);
    expect(dom.window.__nairaVid).toBe("returning-visitor");
    const fbc = sentTo(dom, CHECKOUT, "_fbc");
    expect(fbc.map((c) => c.value)).toEqual([`fb.1.${clicked}.OldClick`]);
    // The click keeps what is left of its own 90 days, not a fresh 90.
    expect(fbc[0].maxAge).toBeGreaterThan(80 * 86400 - 60);
    expect(fbc[0].maxAge).toBeLessThanOrEqual(80 * 86400);
  });

  it("lets a new ad click replace a returning visitor's old one", () => {
    const dom = land("https://nairaflore.com/?fbclid=NewClick", [`_fbc=fb.1.${Date.now() - 86400000}.OldClick; Path=/`]);
    expect(sentTo(dom, CHECKOUT, "_fbc").map((c) => c.value)).toEqual([expect.stringMatching(/\.NewClick$/)]);
    expect(dom.window.document.cookie.match(/_fbc=/g)).toHaveLength(1);
  });

  it("does not stretch an expired click", () => {
    const dom = land("https://nairaflore.com/", [`_fbc=fb.1.${Date.now() - 91 * 86400 * 1000}.Stale; Path=/`]);
    expect(sentTo(dom, CHECKOUT, "_fbc")).toHaveLength(0);
  });

  it.each(["http://127.0.0.1:4173/?fbclid=AdClick1", "https://id-preview--1a2b3c.lovable.app/?fbclid=AdClick1", "https://nairaflore-com.lovable.app/?fbclid=AdClick1"])(
    "keeps both on the host off the shop (%s)",
    (url) => {
      const dom = land(url);
      for (const name of ["naira_vid", "_fbc"]) {
        const [cookie] = sentTo(dom, url, name);
        expect(cookie).toBeDefined();
        expect(cookie.hostOnly).toBe(true);
      }
    },
  );
});

describe("the app's own fallback write of the visitor id", () => {
  it.each(["nairaflore.com", "www.nairaflore.com"])("is for the shop's domain on %s", (host) => {
    expect(visitorCookie("v-1", host, "https:")).toBe("naira_vid=v-1; path=/; max-age=63072000; domain=.nairaflore.com; SameSite=Lax; Secure");
  });

  it.each(["localhost", "127.0.0.1", "id-preview--1a2b3c.lovable.app", "nairaflore.com.evil.example"])("stays on the host on %s", (host) => {
    expect(visitorCookie("v-1", host, "http:")).toBe("naira_vid=v-1; path=/; max-age=63072000; SameSite=Lax");
  });
});
