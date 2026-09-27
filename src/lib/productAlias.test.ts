import { describe, expect, it } from "vitest";
import { productAliasFor, withAliasRedirect } from "./productAlias";

describe("productAliasFor", () => {
  it("twins every product page at the ad's /products/ address", () => {
    expect(productAliasFor("/jewellery/prism-riviere-bracelet")).toEqual({
      alias: "/products/prism-riviere-bracelet",
      canonical: "/jewellery/prism-riviere-bracelet",
    });
    expect(productAliasFor("/product/royal-enigma")).toEqual({
      alias: "/products/royal-enigma",
      canonical: "/product/royal-enigma",
    });
  });

  it("leaves listings and every other page alone", () => {
    for (const path of ["/", "/jewellery", "/jewellery/collections", "/jewellery/collections/rings", "/journal/a-post", "/products/x"]) {
      expect(productAliasFor(path)).toBeNull();
    }
  });
});

describe("withAliasRedirect", () => {
  const page = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>x</title></head><body></body></html>';

  it("moves the address bar before anything else in <head> runs", () => {
    const html = withAliasRedirect(page, "/jewellery/prism-riviere-bracelet");
    expect(html).toContain(
      '<meta charset="UTF-8"><script>try{history.replaceState(null,"","/jewellery/prism-riviere-bracelet"+location.search+location.hash)}catch(e){}</script><title>',
    );
  });

  it("works without a charset tag too", () => {
    const html = withAliasRedirect("<html><head><title>x</title></head></html>", "/product/royal-enigma");
    expect(html.indexOf("replaceState")).toBeLessThan(html.indexOf("<title>"));
  });

  it("keeps the query string, so the ad's click id reaches the pixel", () => {
    const html = withAliasRedirect(page, "/jewellery/a");
    const script = html.match(/<script>(.*?)<\/script>/)![1];
    const calls: string[] = [];
    new Function("history", "location", script)(
      { replaceState: (_s: unknown, _t: string, url: string) => calls.push(url) },
      { search: "?fbclid=abc&utm_source=facebook", hash: "" },
    );
    expect(calls).toEqual(["/jewellery/a?fbclid=abc&utm_source=facebook"]);
  });
});
