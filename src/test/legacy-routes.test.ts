import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { matchRoutes } from "react-router-dom";

/*
  nairaflore.com is the Shopify store's primary domain, so every address a
  Shopify theme, checkout or email ever built still arrives here. Nine of the
  eleven pages the store publishes, a piece opened from a collection, and
  Shopify's /cart, /search and /account/login all showed "Coming soon", and the
  outfit collection opened the jewellery grid.

  The routes are read from App.tsx and matched with React Router's own ranking;
  a redirect is followed to the page it lands on.
*/
const app = readFileSync(resolve(__dirname, "../App.tsx"), "utf8");
const routes = [...app.matchAll(/<Route path="([^"]+)" element=\{<(\w+)(?: to="([^"]+)")? \/>\} \/>/g)].map(
  ([, path, element, to]) => ({ path, element, to }),
);

/** The page a URL ends on: [the route it renders, its element]. */
const land = (url: string): [string, string] => {
  let path = url;
  for (let hop = 0; hop < 4; hop++) {
    const route = matchRoutes(routes, path)?.[0]?.route as (typeof routes)[number] | undefined;
    if (!route) return ["", "none"];
    if (route.element !== "KeepQuery") return [route.path, route.element];
    path = route.to!;
  }
  return ["", "loop"];
};

describe("Shopify-shaped addresses", () => {
  it("reads the route table", () => {
    expect(routes.length).toBeGreaterThan(60);
    expect(land("/jewellery")).toEqual(["/jewellery", "Jewellery"]);
  });

  /* The store's published Online Store pages (Admin, read-only, 30 Oct 2026). */
  it.each([
    ["contact", "/contact"],
    ["about-naira", "/"],
    ["made-for-you", "/customize"],
    ["custom", "/customize"],
    ["privacy-policy", "/privacy"],
    ["terms", "/terms"],
    ["faqs", "/faqs"],
    ["exchange-return-policy", "/exchange-return-policy"],
    ["concepts", "/concepts"],
    ["gifting", "/gifting"],
    ["shop", "/jewellery"],
  ])("lands /pages/%s on %s", (handle, page) => {
    expect(land(`/pages/${handle}`)[0]).toBe(page);
  });

  it.each([
    ["/pages/about-us", "/"],
    ["/pages/contact-us", "/contact"],
    ["/pages/faq", "/faqs"],
    ["/pages/size-guide", "/journal/:slug"],
    ["/pages/track-order", "/track-order"],
    ["/apps/track", "/track-order"],
    ["/policies/privacy-policy", "/privacy"],
    ["/policies/terms-of-service", "/terms"],
    ["/policies/refund-policy", "/exchange-return-policy"],
    ["/policies/shipping-policy", "/faqs"],
    ["/policies/contact-information", "/contact"],
    ["/policies/legal-notice", "/terms"],
    ["/cart", "/jewellery"],
    ["/cart/add", "/jewellery"],
    ["/checkout", "/jewellery"],
    ["/search", "/jewellery"],
    ["/account/login", "/auth"],
    ["/account/register", "/auth"],
    ["/account/orders/123", "/auth"],
    ["/collections/dusk", "/customize"],
    ["/collections/frontpage", "/customize"],
  ])("lands %s on %s", (url, page) => {
    expect(land(url)[0]).toBe(page);
  });

  it("opens a piece reached through a collection on the product route", () => {
    expect(land("/collections/bracelets/products/prism-riviere-bracelet")).toEqual([
      "/collections/:slug/products/:id",
      "ProductRoute",
    ]);
    expect(land("/collections/bracelets")).toEqual(["/collections/:slug", "CollectionRoute"]);
  });

  /* The new aliases must not swallow the real pages beside them. */
  it("leaves the account page, the checkout bounce and unknown pages alone", () => {
    expect(land("/account")).toEqual(["/account", "Account"]);
    expect(land("/cart/c/abc123")).toEqual(["/cart/c/:token", "CartCheckoutRedirect"]);
    expect(land("/pages/no-such-page")).toEqual(["*", "CatchAll"]);
    expect(land("/68096065698/orders/abc/authenticate")).toEqual(["*", "CatchAll"]);
  });

  it("sends every redirect to a real page", () => {
    const dead = routes.filter((r) => r.element === "KeepQuery").filter((r) => ["none", "loop", "CatchAll"].includes(land(r.path)[1]));
    expect(dead).toEqual([]);
  });

  it("keeps the ad's query on an unknown collection's way to the listing", () => {
    const page = readFileSync(resolve(__dirname, "../pages/JewelleryCategory.tsx"), "utf8");
    expect(page).toMatch(/if \(!landing\) return <Navigate to=\{\{ pathname: "\/jewellery", search \}\} replace \/>/);
  });
});
