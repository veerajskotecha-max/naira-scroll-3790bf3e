import { describe, expect, it } from "vitest";
import type { JewelPiece } from "@/data/jewellery";
import { parseQuery, searchPieces, shopPageFor } from "./search";

const piece = (p: Partial<JewelPiece> & Pick<JewelPiece, "handle" | "name" | "category" | "price">): JewelPiece => ({
  sku: "",
  number: "",
  priceLabel: `₹${p.price}`,
  variantId: "gid://shopify/ProductVariant/1",
  availableForSale: true,
  image: "",
  blurb: "",
  materials: "",
  ...p,
});

/* In catalogue order, earrings first, as the shop lists them. */
const catalogue = [
  piece({ handle: "molten-bloom-hoops", name: "Molten Bloom Hoops", category: "Earrings", price: 1300, tags: ["18k Gold Tone Plated", "Demi Fine"] }),
  piece({ handle: "ribbon-bow-earrings", name: "Ribbon Bow Earrings", category: "Earrings", price: 1599, tags: ["Cubic Zirconia"] }),
  piece({ handle: "solitaire-whisper-studs", name: "Solitaire Whisper Studs", category: "Earrings", price: 1099, tags: ["Rhodium Silver Tone Plated", "Cubic Zirconia"] }),
  piece({ handle: "prism-riviere-bracelet", name: "Prism Rivière Bracelet", category: "Bracelets", price: 2399, tags: ["Cubic Zirconia"] }),
  piece({ handle: "star-point-band", name: "Star Point Band", category: "Rings", price: 799, options: [{ name: "Metal", values: ["Gold", "Silver"] }] }),
  piece({ handle: "cushion-halo-ring", name: "Cushion Halo Ring", category: "Rings", price: 1199, tags: ["18k Gold Tone Plated"] }),
  piece({ handle: "golden-duet-ring", name: "Golden Duet Ring", category: "Rings", price: 1399 }),
  piece({ handle: "pearl-legacy-necklace", name: "Pearl Legacy Necklace", category: "Necklaces", price: 1799, tags: ["Pearl"] }),
  piece({ handle: "bold-nocturne-chain", name: "Bold Nocturne Chain", category: "Necklaces", price: 1799 }),
];
const handles = (q: string) => searchPieces(catalogue, q).map((p) => p.handle);

describe("searchPieces", () => {
  it("finds rings for 'ring', not the earrings that contain the letters", () => {
    expect(handles("ring")).toEqual(["cushion-halo-ring", "golden-duet-ring", "star-point-band"]);
    expect(handles("Rings")).toEqual(["cushion-halo-ring", "golden-duet-ring", "star-point-band"]);
  });

  it("puts a name match ahead of a category match", () => {
    expect(handles("ring")[0]).toBe("cushion-halo-ring");
  });

  it("ignores accents", () => {
    expect(handles("riviere")).toEqual(["prism-riviere-bracelet"]);
  });

  it("needs every word, wherever it appears", () => {
    // Star Point Band is sold in gold as well as silver.
    expect(handles("gold ring")).toEqual(["golden-duet-ring", "cushion-halo-ring", "star-point-band"]);
    expect(handles("silver studs")).toEqual(["solitaire-whisper-studs"]);
    expect(handles("silver ring")).toEqual(["star-point-band"]);
  });

  it("understands the stone and the misspellings shoppers type", () => {
    expect(handles("zircone")).toEqual(["ribbon-bow-earrings", "solitaire-whisper-studs", "prism-riviere-bracelet"]);
    expect(handles("earing")).toEqual(["ribbon-bow-earrings", "molten-bloom-hoops", "solitaire-whisper-studs"]);
  });

  it("filters by price", () => {
    expect(handles("Under 1500")).toEqual(["molten-bloom-hoops", "solitaire-whisper-studs", "star-point-band", "cushion-halo-ring", "golden-duet-ring"]);
    expect(handles("rings under ₹1,200")).toEqual(["cushion-halo-ring", "star-point-band"]);
    expect(handles("necklace above 1500")).toEqual(["pearl-legacy-necklace", "bold-nocturne-chain"]);
  });

  it("returns nothing for a query that matches nothing, and for an empty one", () => {
    expect(handles("xyzzy")).toEqual([]);
    expect(handles("  ")).toEqual([]);
  });
});

describe("parseQuery", () => {
  it("reads price bounds and the category", () => {
    expect(parseQuery("rings under 1,500")).toMatchObject({ terms: ["ring"], max: 1500, min: null, category: "Rings" });
    expect(parseQuery("2000+")).toMatchObject({ terms: [], max: null, min: 2000, category: null });
    expect(parseQuery("gold earrings and rings").category).toBeNull();
  });
});

describe("shopPageFor", () => {
  it("sends category and price searches to the shop page, filtered", () => {
    expect(shopPageFor("rings")).toBe("/jewellery?category=Rings");
    expect(shopPageFor("under 1500")).toBe("/jewellery?under=1500");
    expect(shopPageFor("earrings under 1000")).toBe("/jewellery?category=Earrings&under=1000");
  });

  it("leaves other searches to the results list", () => {
    expect(shopPageFor("gold ring")).toBeNull();
    expect(shopPageFor("pearl")).toBeNull();
  });
});
