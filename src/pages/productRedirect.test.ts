import { describe, expect, it } from "vitest";
import { JEWELLERY_HANDLES } from "@/data/jewelleryHandles";
import { jewellery as staticJewellery } from "@/data/jewellery";
import { isJewelleryProduct } from "@/lib/isJewelleryProduct";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/*
  /products/<handle> must hand every jewellery piece to /jewellery/<handle> and
  must never take an apparel piece there — JewelDetail cannot render apparel and
  bounces it to the listing, so a handle in the wrong set loses the sale.
*/
describe("the /products -> /jewellery hop", () => {
  it("recognises every bundled piece, so the catalogue can never outrun the list", () => {
    const missing = staticJewellery.map((p) => p.handle).filter((h) => !JEWELLERY_HANDLES.has(h));
    expect(missing).toEqual([]);
  });

  /* These are the handles the live Facebook catalogue ads point at. Each one
     landing on /products/<handle> must be recognised on the FIRST render;
     otherwise a paid click pays for a Shopify round trip before it sees the
     page that actually sells. */
  it("redirects every ad-linked handle without waiting for Shopify", () => {
    const adLinked = [
      "cushion-halo-ring",
      "verdant-drop-earrings",
      "petite-pave-band",
      "vintage-halo-ring",
      "textured-gold-hoops",
      "filigree-bloom-studs",
      "ribbon-bead-bracelet",
      "star-point-band",
    ];
    expect(adLinked.filter((h) => !JEWELLERY_HANDLES.has(h))).toEqual([]);
  });

  /* Apparel lives on the /products template and must stay there. */
  it("keeps apparel out of the jewellery set", () => {
    const apparel = [
      "blush-of-dawn",
      "ethereal-lilac",
      "royal-enigma",
      "ivory-whisper-co-ord-set",
      "crimson-legacy-set",
      "noir-mela",
    ];
    expect(apparel.filter((h) => JEWELLERY_HANDLES.has(h))).toEqual([]);
  });

  /* The early hop is a shortcut for the same decision the resolved product
     makes; the two must not disagree, or a piece would redirect on one path
     and render in the apparel template on the other. */
  it("agrees with the vendor rule the resolved product uses", () => {
    expect(isJewelleryProduct({ vendor: "Naira Petite", productType: "Ring" })).toBe(true);
    expect(isJewelleryProduct({ vendor: "Naira Flore", productType: "" })).toBe(false);
  });

  /* The pre-boot rewrite in index.html is generated at build time by the
     naira-jewellery-redirect plugin in vite.config.ts, which reads this same
     file with a regex. Reformatting the generated file would make that parse
     come back short — the build refuses rather than shipping an empty map, but
     this fails first and says why. */
  it("keeps the generated shape the build-time injector parses", () => {
    const source = readFileSync(resolve(__dirname, "../data/jewelleryHandles.ts"), "utf8");
    const parsed = [...source.matchAll(/^\s*"([a-z0-9-]+)",\s*$/gm)].map((m) => m[1]);
    expect(parsed.length).toBe(JEWELLERY_HANDLES.size);
    expect(parsed.filter((h) => !JEWELLERY_HANDLES.has(h))).toEqual([]);
  });
});

/* A catalogue or ad link to a piece since unlisted, and the bare /products
   prefix, used to end on "Coming soon" — the one button there went to the
   apparel line. Both must reach the jewellery listing with the ad's query. */
describe("/products dead ends", () => {
  const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  const detail = strip(readFileSync(resolve(__dirname, "ProductDetail.tsx"), "utf8"));
  const app = strip(readFileSync(resolve(__dirname, "../App.tsx"), "utf8"));

  it("sends a handle Shopify does not return to the listing, keeping the query", () => {
    const block = detail.match(/if \(isError \|\| !product\) \{[\s\S]*?replace \/>/)?.[0] ?? "";
    expect(block).toMatch(/Navigate to=\{\{ pathname: "\/jewellery", search: window\.location\.search \}\}/);
    expect(detail).not.toMatch(/shop\/indo-western"\s*\n?\s*primaryLabel/);
  });

  it("routes the bare /products and /product prefixes to the listing", () => {
    expect(app).toMatch(/path="\/products" element=\{<KeepQuery to="\/jewellery" \/>\}/);
    expect(app).toMatch(/path="\/product" element=\{<KeepQuery to="\/jewellery" \/>\}/);
  });
});
