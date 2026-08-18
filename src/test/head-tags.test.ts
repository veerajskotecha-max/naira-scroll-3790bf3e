import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/*
  index.html must not declare SEO tags that routes also set through PageSEO.

  react-helmet-async can only manage tags it rendered itself, so a static copy
  in index.html is never replaced — it is duplicated. This shipped twice before
  anyone noticed: first two conflicting Organization JSON-LD nodes, then two
  canonicals on every prerendered page, the static one pointing at the homepage
  while the correct one sat below it.

  Cheap to check, and the failure mode is invisible in the browser.
*/

const html = readFileSync(resolve(__dirname, "../../index.html"), "utf8");

/** Strip comments — they explain this rule and name the very tags it forbids. */
const markup = html.replace(/<!--[\s\S]*?-->/g, "");

describe("index.html head tags", () => {
  it.each([
    ["canonical link", /<link[^>]+rel=["']canonical["']/i],
    ["meta description", /<meta[^>]+name=["']description["']/i],
    ["og:title", /<meta[^>]+property=["']og:title["']/i],
    ["og:description", /<meta[^>]+property=["']og:description["']/i],
    ["og:image", /<meta[^>]+property=["']og:image["']/i],
    ["og:url", /<meta[^>]+property=["']og:url["']/i],
    ["twitter:card", /<meta[^>]+name=["']twitter:card["']/i],
    ["twitter:title", /<meta[^>]+name=["']twitter:title["']/i],
  ])("does not statically declare %s — PageSEO owns it", (_label, pattern) => {
    expect(markup).not.toMatch(pattern);
  });

  it("declares exactly one title element as the fallback", () => {
    expect(markup.match(/<title[\s>]/gi) ?? []).toHaveLength(1);
  });

  it("does not declare an Organization node — Index.tsx emits it", () => {
    const blocks = [...markup.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => {
        try {
          return JSON.parse(m[1])["@type"];
        } catch {
          return "PARSE_ERROR";
        }
      });
    expect(blocks).not.toContain("PARSE_ERROR");
    expect(blocks).not.toContain("Organization");
    // WebSite/SearchAction has no React equivalent, so it belongs here.
    expect(blocks).toContain("WebSite");
  });
});
