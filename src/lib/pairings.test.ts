import { describe, expect, it } from "vitest";
import type { JewelPiece } from "@/data/jewellery";
import { addOnScore, bagAddOns, completeTheLook, DEEP_STOCK, familyOf, isHoops, kindOf, moreLikeThis, wornWithNoun } from "./pairings";

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

/* The live pieces with their real prices and metals on 16 October: the deep-stock
   ones, and a few the bag must never offer (3 or fewer in stock, or a ring). */
const live = [
  piece("prism-riviere-bracelet", "Bracelets", 2399, silver, { name: "Prism Rivière Bracelet" }),
  piece("woven-gold-hoops", "Earrings", 1499, gold, { name: "Woven Gold Hoops" }),
  piece("toggle-link-chain", "Necklaces", 1499, gold, { name: "Toggle Link Chain" }),
  piece("heartbead-bracelet", "Bracelets", 1299, gold, { name: "Heartbead Bracelet" }),
  piece("bold-dome-huggies", "Earrings", 1649, gold, { name: "Bold Dome Huggies" }),
  piece("torsade-huggies", "Earrings", 1799, gold, { name: "Torsade Huggies" }),
  piece("petite-square-huggies", "Earrings", 1599, gold, { name: "Petite Square Huggies" }),
  // Its listing names no plating, so the materials line falls back to gold.
  piece("riviere-huggies-silver", "Earrings", 1999, gold, { name: "Rivière Huggies — Silver" }),
  piece("quatrefoil-eclat-studs", "Earrings", 2449, gold, { name: "Quatrefoil Éclat Studs" }),
  piece("textured-gold-hoops", "Earrings", 1699, gold, { name: "Textured Gold Hoops" }),
  piece("cushion-halo-ring", "Rings", 1999, silver, { name: "Cushion Halo Ring" }),
  piece("lilac-papillon-ring", "Rings", 1499, gold, { name: "Lilac Papillon Ring" }),
  piece("charm-box-chain", "Necklaces", 1599, gold, { name: "Charm Box Chain" }),
];
const byHandle = (handle: string) => live.find((p) => p.handle === handle)!;
const pick = (inBag: string[], pieces = inBag.length, catalogue = live) => bagAddOns(inBag, pieces, catalogue)?.pieces.map((p) => p.handle) ?? [];

describe("the metal colour of a piece", () => {
  it("is silver when the name says so, whatever the materials line fell back to", () => {
    expect(familyOf(byHandle("riviere-huggies-silver"))).toBe("silver");
    expect(familyOf(byHandle("prism-riviere-bracelet"))).toBe("silver");
    expect(familyOf(byHandle("woven-gold-hoops"))).toBe("gold");
  });
});

describe("bagAddOns: the one piece the bag offers", () => {
  it("offers Woven Gold Hoops beside the Prism Rivière Bracelet, as the plan's mock-up shows, over huggies in its own silver", () => {
    const offer = bagAddOns(["prism-riviere-bracelet"], 1, live)!;
    expect(offer.pieces.map((p) => p.handle)).toEqual(["woven-gold-hoops"]);
    expect(wornWithNoun(offer.anchor)).toBe("bracelet");
  });

  it("puts hoops first beside a necklace, a ring or a pair of studs", () => {
    expect(pick(["charm-box-chain"])).toEqual(["woven-gold-hoops"]);
    expect(pick(["cushion-halo-ring"])).toEqual(["woven-gold-hoops"]);
    expect(pick(["quatrefoil-eclat-studs"])).toEqual(["woven-gold-hoops"]);
  });

  it("counts huggies as hoops, and names them as a shopper would", () => {
    expect(kindOf(byHandle("torsade-huggies"))).toBe("hoops");
    expect(isHoops(byHandle("bold-dome-huggies"))).toBe(true);
    expect(wornWithNoun(byHandle("torsade-huggies"))).toBe("huggies");
    expect(wornWithNoun(byHandle("woven-gold-hoops"))).toBe("hoops");
  });

  it("completes hoops or huggies with a chain, in the same gold", () => {
    expect(pick(["woven-gold-hoops"])).toEqual(["toggle-link-chain"]);
    expect(pick(["torsade-huggies"])).toEqual(["toggle-link-chain"]);
  });

  it("after the hoops and a chain, offers huggies to stack: two only when equally good, deeper stock first", () => {
    expect(pick(["woven-gold-hoops", "toggle-link-chain"])).toEqual(["bold-dome-huggies", "torsade-huggies"]);
  });

  it("matches a silver piece in silver once the gold hoops are in the bag", () => {
    expect(pick(["woven-gold-hoops", "prism-riviere-bracelet"])).toEqual(["riviere-huggies-silver"]);
  });

  it("pairs with the piece added last", () => {
    expect(pick(["cushion-halo-ring", "woven-gold-hoops"])).toEqual(["toggle-link-chain"]);
  });

  it("offers only deep-stock pieces: never hoops with 3 in stock, never a ring", () => {
    const bags = [["prism-riviere-bracelet"], ["charm-box-chain"], ["woven-gold-hoops"], ["woven-gold-hoops", "toggle-link-chain"], ["toggle-link-chain", "woven-gold-hoops"]];
    const offered = new Set(bags.flatMap((bag) => pick(bag)));
    for (const handle of offered) expect(Object.keys(DEEP_STOCK)).toContain(handle);
    expect(offered.has("textured-gold-hoops")).toBe(false);
    expect([...offered].some((h) => kindOf(byHandle(h)) === "ring")).toBe(false);
  });

  it("never offers a piece already in the bag, or one that has sold out", () => {
    expect(pick(["prism-riviere-bracelet", "woven-gold-hoops"])).not.toContain("woven-gold-hoops");
    const soldOut = live.map((p) => (p.handle === "woven-gold-hoops" ? { ...p, availableForSale: false } : p));
    expect(pick(["prism-riviere-bracelet"], 1, soldOut)).toEqual(["riviere-huggies-silver"]);
  });

  it("offers nothing once the bag holds three pieces, or for a bag it cannot read", () => {
    expect(bagAddOns(["prism-riviere-bracelet"], 3, live)).toBeNull();
    expect(bagAddOns(["not-in-catalogue"], 1, live)).toBeNull();
    expect(bagAddOns([], 0, live)).toBeNull();
  });

  it("never offers a second piece of the same kind, except hoops stacked beside hoops", () => {
    expect(addOnScore(byHandle("prism-riviere-bracelet"), byHandle("heartbead-bracelet"))).toBe(0);
    expect(addOnScore(byHandle("toggle-link-chain"), byHandle("charm-box-chain"))).toBe(0);
    expect(addOnScore(byHandle("woven-gold-hoops"), byHandle("torsade-huggies"))).toBeGreaterThan(0);
  });

  it("is stable from one render to the next", () => {
    expect(bagAddOns(["prism-riviere-bracelet"], 1, live)).toEqual(bagAddOns(["prism-riviere-bracelet"], 1, [...live].reverse()));
    expect(pick(["woven-gold-hoops", "toggle-link-chain"], 2, [...live].reverse())).toEqual(["bold-dome-huggies", "torsade-huggies"]);
  });
});
