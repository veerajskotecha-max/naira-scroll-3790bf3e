import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";

/*
  fbevents.js is the only thing that wrote Meta's browser id (_fbp), and it
  loads after idle or the first tap. On a cold landing the first ViewContent's
  server copy went out first, so its user_data was {external_id, fbc} with no
  fbp (11 of 12 cold landings on the live site). These run index.html's own
  inline scripts in a fresh page at each address.
*/
const html = readFileSync(resolve(__dirname, "../index.html"), "utf8");
const inline = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .filter(([tag]) => !/\bsrc=|type="(?:module|application\/ld\+json)"/.test(tag.slice(0, tag.indexOf(">"))))
  .map(([, body]) => body);

const pages: JSDOM[] = [];
const land = (url: string, existing: string[] = []) => {
  // One inert <script> for the loaders to insert theirs beside; nothing is fetched.
  const dom = new JSDOM("<!doctype html><html><head><script></script></head><body></body></html>", { url, runScripts: "outside-only" });
  pages.push(dom);
  for (const cookie of existing) dom.cookieJar.setCookieSync(cookie, url);
  for (const script of inline) dom.window.eval(script);
  return dom;
};
const cookie = (dom: JSDOM, name: string, at: string) => dom.cookieJar.getCookiesSync(at).find((c) => c.key === name);

afterEach(() => {
  while (pages.length) pages.pop()!.window.close();
});

describe("Meta's browser id exists before the first event", () => {
  it.each(["https://nairaflore.com/jewellery/prism-riviere-bracelet?fbclid=abc", "https://www.nairaflore.com/"])("on %s", (url) => {
    const dom = land(url);
    const fbp = cookie(dom, "_fbp", url);
    expect(fbp?.value).toMatch(/^fb\.1\.\d{13}\.\d{1,10}$/);
    // Written as fbevents.js writes it: the shop's domain, 90 days.
    expect(fbp?.domain).toBe("nairaflore.com");
    expect(fbp?.hostOnly).toBe(false);
    expect(fbp?.maxAge).toBe(7776000);
    expect(dom.window.document.cookie).toMatch(/(?:^|; )_fbp=fb\.1\./);
  });

  it("keeps a browser id that already exists", () => {
    const dom = land("https://nairaflore.com/", ["_fbp=fb.1.1700000000000.123456789; Domain=nairaflore.com; Path=/"]);
    expect(cookie(dom, "_fbp", "https://nairaflore.com/")?.value).toBe("fb.1.1700000000000.123456789");
    expect(dom.cookieJar.getCookiesSync("https://nairaflore.com/").filter((c) => c.key === "_fbp")).toHaveLength(1);
  });

  it.each(["http://127.0.0.1:4173/", "http://localhost:8080/", "https://id-preview--1a2b3c.lovable.app/"])("is not minted off the shop (%s)", (url) => {
    expect(cookie(land(url), "_fbp", url)).toBeUndefined();
  });
});
