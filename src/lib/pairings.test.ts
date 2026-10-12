import { describe, expect, it } from "vitest";
import type { JewelPiece } from "@/data/jewellery";
import { bagPairings, completeTheLook, moreLikeThis } from "./pairings";

const piece = (handle: string, category: JewelPiece["category"], price: number, materials: string, extra: Partial<JewelPiece> = {}): JewelPiece => ({
  handle,
  name: handle,
  category,
  sku: "",
  number: "1",
  price,
  priceLabel: `₹${price}`,
  variantId: `gid://shopify/ProductVariant/${handle}`,
  availableForSale: true,
  image: `https://cdn.shopify.com/${handle}.jpg`,
  blurb: "",
  materials,
  ...extra,
});

const silver = "Rhodium coated · surgical stainless steel";
const gold = "18k gold plated · surgical stainless steel";
const catalogue = [
  piece("prism-bracelet", "Bracelets", 2399, silver),
  piece("silver-studs", "Earrings", 1499, silver),
  piece("gold-studs", "Earrings", 1499, gold),
  piece("silver-ring", "Rings", 1199, silver),
  piece("silver-chain", "Necklaces", 2599, silver),
  piece("sold-out-necklace", "Necklaces", 2400, silver, { availableForSale: false }),
  piece("silver-cuff", "Bracelets", 2200, silver),
  piece("gold-cuff", "Bracelets", 2300, gold),
];
const prism = catalogue[0];

describe("completeTheLook", () => {
  it("suggests one piece from each other category, same metal colour first", () => {
    const picks = completeTheLook(prism, catalogue).map((p) => p.handle);
    expect(picks).toEqual(["silver-chain", "silver-studs", "silver-ring"]);
  });

  it("never suggests the piece itself, its own category or a sold-out piece", () => {
    const picks = completeTheLook(prism, catalogue, 10).map((p) => p.handle);
    expect(picks).not.toContain("prism-bracelet");
    expect(picks).not.toContain("silver-cuff");
    expect(picks).not.toContain("sold-out-necklace");
  });

  it("is stable from one render to the next", () => {
    expect(completeTheLook(prism, catalogue)).toEqual(completeTheLook(prism, [...catalogue].reverse()));
  });
});

describe("moreLikeThis", () => {
  it("keeps to the category, same metal first", () => {
    expect(moreLikeThis(prism, catalogue).map((p) => p.handle)).toEqual(["silver-cuff", "gold-cuff"]);
  });
});

describe("bagPairings", () => {
  it("completes the look of the bag, skipping pieces already in it", () => {
    const picks = bagPairings(["prism-bracelet", "silver-chain"], catalogue).map((p) => p.handle);
    expect(picks).toEqual(["silver-studs", "silver-ring"]);
  });

  it("suggests nothing for a bag it cannot read", () => {
    expect(bagPairings(["not-in-catalogue"], catalogue)).toEqual([]);
  });
});
