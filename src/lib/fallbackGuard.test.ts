import { describe, expect, it } from "vitest";
import { FALLBACK_ATTR, clearFallbackMark, withFallbackGuard } from "./fallbackGuard";

const page = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Naira Flore</title></head><body><div id="root"></div></body></html>';

/* Runs the guard's script as the browser would, for one address. */
const run = (pathname: string) => {
  const attrs = new Map<string, string>();
  const timers: (() => void)[] = [];
  const document = {
    documentElement: {
      setAttribute: (k: string, v: string) => attrs.set(k, v),
      removeAttribute: (k: string) => attrs.delete(k),
    },
  };
  const code = withFallbackGuard(page).match(/<script>(.*?)<\/script>/)![1];
  new Function("location", "document", "setTimeout", code)({ pathname }, document, (fn: () => void) => timers.push(fn));
  return { mark: attrs.get(FALLBACK_ATTR) ?? null, fireTimers: () => timers.forEach((fn) => fn()), attrs };
};

describe("withFallbackGuard", () => {
  it("goes first in <head>, before anything can paint", () => {
    const html = withFallbackGuard(page);
    expect(html.indexOf("<script>")).toBe(html.indexOf('<meta charset="UTF-8">') + '<meta charset="UTF-8">'.length);
    expect(html.indexOf("<style>")).toBeLessThan(html.indexOf("<title>"));
  });

  it("is added once, however often the file is written", () => {
    expect(withFallbackGuard(withFallbackGuard(page))).toBe(withFallbackGuard(page));
  });

  it("hides the page under the mark and draws a product outline for a piece", () => {
    const html = withFallbackGuard(page);
    expect(html).toContain(`html[${FALLBACK_ATTR}] #root{visibility:hidden}`);
    expect(html).toContain(`html[${FALLBACK_ATTR}="piece"] body::before{`);
  });
});

describe("the guard's script", () => {
  /* The homepage is the one address this file really is: never hide it. */
  it.each(["/", "/index", "/index.html"])("leaves the homepage alone at %s", (path) => {
    expect(run(path).mark).toBeNull();
  });

  it.each([
    "/jewellery/watch-link-bracelet",
    "/jewellery/watch-link-bracelet/",
    "/jewelry/watch-link-bracelet",
    "/products/watch-link-bracelet",
    "/product/watch-link-bracelet",
    "/preview/jewellery/watch-link-bracelet",
  ])("draws a product outline for a piece the build did not know: %s", (path) => {
    expect(run(path).mark).toBe("piece");
  });

  it.each(["/jewellery", "/jewellery/collections", "/jewellery/collections/rings", "/journal/a-new-post", "/zz-not-a-page"])(
    "shows a plain page, not the homepage, at %s",
    (path) => {
      expect(run(path).mark).toBe("page");
    },
  );

  /* After the app's own 8 s start-up limit: a page whose code never arrives
     must not stay blank. */
  it("takes itself off after 10 s", () => {
    const guard = run("/jewellery/watch-link-bracelet");
    expect(guard.mark).toBe("piece");
    guard.fireTimers();
    expect(guard.attrs.has(FALLBACK_ATTR)).toBe(false);
  });
});

describe("clearFallbackMark", () => {
  it("shows the app's first render", () => {
    document.documentElement.setAttribute(FALLBACK_ATTR, "piece");
    clearFallbackMark();
    expect(document.documentElement.hasAttribute(FALLBACK_ATTR)).toBe(false);
  });

  it("is harmless when nothing was hidden", () => {
    expect(() => clearFallbackMark()).not.toThrow();
  });
});
