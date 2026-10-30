import { describe, expect, it } from "vitest";
import { routeKeyFor } from "./routeCode";

describe("routeKeyFor", () => {
  it("finds the page behind the URLs shoppers land on", () => {
    expect(routeKeyFor("/")).toBe("Index");
    expect(routeKeyFor("/jewellery")).toBe("Jewellery");
    expect(routeKeyFor("/jewellery/prism-riviere-bracelet")).toBe("JewelDetailNext");
    expect(routeKeyFor("/jewellery/prism-riviere-bracelet/")).toBe("JewelDetailNext");
    expect(routeKeyFor("/jewellery/collections/bracelets")).toBe("JewelleryCategory");
    expect(routeKeyFor("/collections/bracelets")).toBe("JewelleryCategory");
    expect(routeKeyFor("/product/royal-enigma")).toBe("ProductDetail");
    expect(routeKeyFor("/products/royal-enigma")).toBe("ProductDetail");
    expect(routeKeyFor("/journal/how-to-layer")).toBe("JournalArticle");
  });

  /* Load the page a URL really opens: /collections/dusk redirects to the
     outfits, and preloading the jewellery grid for it would be wasted. */
  it("finds the page behind Shopify-shaped URLs", () => {
    expect(routeKeyFor("/collections/bracelets/products/prism-riviere-bracelet")).toBe("ProductDetail");
    expect(routeKeyFor("/collections/dusk")).toBe("MadeForYou");
    expect(routeKeyFor("/collections/frontpage")).toBe("MadeForYou");
  });

  it("leaves unknown URLs to render the ordinary way", () => {
    expect(routeKeyFor("/no-such-page")).toBeNull();
    expect(routeKeyFor("/jewellery/a/b/c")).toBeNull();
  });
});
