import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { matchRoutes } from "react-router-dom";
import { ROUTE_CODE } from "@/lib/routeCode";

/*
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

describe("the route table", () => {
  it("is read from App.tsx", () => {
    expect(routes.length).toBeGreaterThan(40);
    expect(land("/jewellery")).toEqual(["/jewellery", "Jewellery"]);
  });
});

/* main.tsx loads a landing page's code before React starts, from the table in
   lib/routeCode.ts. /shop/indo-western still named ShopAll there after App.tsx
   began redirecting it to /customize: every landing downloaded ~29 kB of a page
   no route renders, then the real one, one after the other. */
describe("the landing preload table", () => {
  const PAGE_OF: Record<string, string> = {
    PieceRoute: "JewelDetailNext",
    CollectionRoute: "JewelleryCategory",
    ProductRoute: "ProductDetail",
  };
  it.each(ROUTE_CODE.map(([pattern, key]) => [pattern, key]))("loads the page %s really renders (%s)", (pattern, key) => {
    const [, element] = land(pattern.replace(/:\w+/g, "x"));
    expect(PAGE_OF[element] ?? element).toBe(key);
  });
});
