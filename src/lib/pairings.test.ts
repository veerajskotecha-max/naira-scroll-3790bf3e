import { describe, expect, it } from "vitest";
import type { JewelPiece } from "@/data/jewellery";
import { bagAddOns, completeTheLook, DEEP_STOCK, familyOf, isPreorder, isSetRow, kindOf, linesOf, matchScore, moreLikeThis, sharedLine, styleOf, wornWithNoun } from "./pairings";

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
  it("suggests one piece from each other category, same metal colour first, a smaller ticket before a larger one", () => {
    const picks = completeTheLook(prism, catalogue).map((p) => p.handle);
    expect(picks).toEqual(["silver-ring", "silver-studs", "silver-chain"]);
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

/* Live pieces with their real prices, metals and tags on 18 October: a few from
   each set, the deep-stock ones the bag may add, and some it must never add. */
const live = [
  piece("prism-riviere-bracelet", "Bracelets", 2399, silver, { name: "Prism Rivière Bracelet" }),
  piece("woven-gold-hoops", "Earrings", 1499, gold, { name: "Woven Gold Hoops" }),
  piece("toggle-link-chain", "Necklaces", 1499, gold, { name: "Toggle Link Chain" }),
  piece("heartbead-bracelet", "Bracelets", 1299, silver, { name: "Heartbead Bracelet" }),
  piece("heartline-paperclip-necklace", "Necklaces", 1899, gold, { name: "Heartline Paperclip Necklace" }),
  piece("bold-nocturne-chain", "Necklaces", 1799, gold, { name: "Bold Nocturne Chain" }),
  piece("bold-nocturne-bracelet", "Bracelets", 1599, gold, { name: "Bold Nocturne Bracelet" }),
  piece("bold-nocturne-drops", "Earrings", 1299, gold, { name: "Bold Nocturne Drops" }),
  piece("baguette-tennis-bracelet", "Bracelets", 1699, gold, { name: "Baguette Tennis Bracelet" }),
  piece("baguette-huggies", "Earrings", 1199, gold, { name: "Baguette Huggies" }),
  piece("baguette-eternity-band", "Rings", 1299, gold, { name: "Baguette Eternity Band" }),
  piece("serpentine-whisper-chain", "Necklaces", 1849, gold, { name: "Serpentine Whisper Chain" }),
  piece("serpentine-whisper-chain-silver", "Necklaces", 1499, silver, { name: "Serpentine Whisper Chain — Silver" }),
  piece("whisper-pave-band", "Rings", 899, silver, { name: "Whisper Pavé Band" }),
  piece("cushion-halo-ring", "Rings", 1199, silver, { name: "Cushion Halo Ring" }),
  piece("star-point-band", "Rings", 799, gold, { name: "Star Point Band" }),
  piece("north-star-bangle", "Bracelets", 1499, gold, { name: "North Star Bangle" }),
  piece("baroque-shell-bracelet", "Bracelets", 1799, gold, { name: "Baroque Shell Bracelet", tags: ["Pearl", "Bracelet"] }),
  piece("pearl-drop-studs", "Earrings", 1199, gold, { name: "Pearl Drop Studs", tags: ["Pearl", "Earrings"] }),
  // The KAVNAR Edition One pieces: 30 in Shopify, tagged pre-order, the listing names no plating.
  piece("prism-cluster-studs-silver", "Earrings", 1899, gold, { name: "Prism Cluster Studs", tags: ["Earrings", "Edition One", "KAVNAR", "pre-order"] }),
  // 3 in stock: linked on product pages, never added from the bag.
  piece("textured-gold-hoops", "Earrings", 1699, gold, { name: "Textured Gold Hoops" }),
  piece("riviere-eternal-necklace", "Necklaces", 1799, gold, { name: "Rivière Eternal Necklace", availableForSale: false }),
];
const byHandle = (handle: string) => live.find((p) => p.handle === handle)!;
const handles = (pieces: JewelPiece[]) => pieces.map((p) => p.handle);
const pick = (inBag: string[], pieces = inBag.length, catalogue = live) => bagAddOns(inBag, pieces, catalogue)?.pieces.map((p) => p.handle) ?? [];

describe("the metal colour of a piece", () => {
  it("is silver when the name or the handle says so, whatever the materials line fell back to", () => {
    expect(familyOf(byHandle("serpentine-whisper-chain-silver"))).toBe("silver");
    expect(familyOf(byHandle("prism-cluster-studs-silver"))).toBe("silver");
    expect(familyOf(byHandle("prism-riviere-bracelet"))).toBe("silver");
    expect(familyOf(byHandle("woven-gold-hoops"))).toBe("gold");
  });
});

describe("the lines that join pieces", () => {
  it("reads sets and motifs from names, and pearls from the Pearl tag too", () => {
    expect(sharedLine(byHandle("bold-nocturne-chain"), byHandle("bold-nocturne-bracelet"))).toBe("set");
    expect(sharedLine(byHandle("baroque-shell-bracelet"), byHandle("pearl-drop-studs"))).toBe("set");
    expect(sharedLine(byHandle("heartline-paperclip-necklace"), byHandle("heartbead-bracelet"))).toBe("motif");
    expect(sharedLine(byHandle("star-point-band"), byHandle("north-star-bangle"))).toBe("motif");
    expect(sharedLine(byHandle("woven-gold-hoops"), byHandle("prism-riviere-bracelet"))).toBeNull();
    expect(linesOf(byHandle("serpentine-whisper-chain-silver")).map(([line]) => line)).toEqual(["whisper"]);
  });

  it("joins the Aditya sets: the clovers, the twin hearts and the watch links", () => {
    const named = (handle: string, category: JewelPiece["category"], name: string) => piece(handle, category, 875, gold, { name });
    const cloverStation = named("clover-station-bracelet", "Bracelets", "Clover Station Bracelet");
    expect(sharedLine(named("clover-drop-earrings", "Earrings", "Clover Drop Earrings"), cloverStation)).toBe("set");
    expect(sharedLine(named("clover-charm-necklace", "Necklaces", "Clover Charm Necklace"), cloverStation)).toBe("set");
    expect(sharedLine(named("twin-heart-necklace", "Necklaces", "Twin Heart Necklace"), named("twin-heart-studs", "Earrings", "Twin Heart Studs"))).toBe("set");
    expect(sharedLine(named("watch-link-bracelet", "Bracelets", "Watch Link Bracelet"), named("watch-link-ring", "Rings", "Watch Link Ring"))).toBe("set");
    // A lone heart, or a flower that is not a clover, still shares only the motif.
    expect(sharedLine(named("twin-heart-studs", "Earrings", "Twin Heart Studs"), byHandle("heartline-paperclip-necklace"))).toBe("motif");
    expect(sharedLine(named("petite-blossom-bracelet", "Bracelets", "Petite Blossom Bracelet"), cloverStation)).toBe("motif");
  });

  it("names each piece's style within its category", () => {
    expect(["baguette-tennis-bracelet", "north-star-bangle", "baguette-huggies", "pearl-drop-studs", "star-point-band", "cushion-halo-ring", "heartline-paperclip-necklace", "toggle-link-chain"].map((h) => styleOf(byHandle(h)))).toEqual([
      "tennis",
      "bangle",
      "huggies",
      "studs",
      "band",
      "statement",
      "pendant",
      "chain",
    ]);
  });
});

describe("completeTheLook: the product page's one-tap row", () => {
  it("puts a piece's own set first: the Bold Nocturne bracelet gets its drops and chain, then a ring", () => {
    const look = completeTheLook(byHandle("bold-nocturne-bracelet"), live);
    expect(handles(look)).toEqual(["bold-nocturne-drops", "bold-nocturne-chain", "baguette-eternity-band"]);
    expect(isSetRow(byHandle("bold-nocturne-bracelet"), look)).toBe(true);
  });

  it("gives a piece without a set the hoops, then one piece of each other kind in its own metal", () => {
    const look = completeTheLook(byHandle("prism-riviere-bracelet"), live);
    expect(handles(look)).toEqual(["woven-gold-hoops", "serpentine-whisper-chain-silver", "cushion-halo-ring"]);
    expect(isSetRow(byHandle("prism-riviere-bracelet"), look)).toBe(false);
  });

  it("never offers its own category, a sold-out piece or a pre-order piece for a one-tap Add", () => {
    for (const anchor of live) {
      const look = completeTheLook(anchor, live);
      expect(new Set(look.map((p) => p.category)).size).toBe(look.length);
      for (const p of look) {
        expect(p.category).not.toBe(anchor.category);
        expect(p.availableForSale).not.toBe(false);
        expect(isPreorder(p)).toBe(false);
      }
    }
  });
});

describe("moreLikeThis: the same category, closest first", () => {
  it("puts the same design in the other metal first", () => {
    expect(handles(moreLikeThis(byHandle("serpentine-whisper-chain"), live))[0]).toBe("serpentine-whisper-chain-silver");
  });

  it("keeps a style together: bands beside a band", () => {
    const more = moreLikeThis(byHandle("star-point-band"), live).map((p) => styleOf(p));
    expect(more.slice(0, 2)).toEqual(["band", "band"]);
  });

  it("links pre-order pieces for browsing, but never a sold-out one", () => {
    expect(handles(moreLikeThis(byHandle("pearl-drop-studs"), live))).toContain("prism-cluster-studs-silver");
    expect(handles(moreLikeThis(byHandle("toggle-link-chain"), live))).not.toContain("riviere-eternal-necklace");
  });
});

describe("bagAddOns: the one piece the bag offers", () => {
  it("offers Woven Gold Hoops beside the Prism Rivière Bracelet, as the plan's mock-up shows", () => {
    const offer = bagAddOns(["prism-riviere-bracelet"], 1, live)!;
    expect(handles(offer.pieces)).toEqual(["woven-gold-hoops"]);
    expect(wornWithNoun(offer.anchor)).toBe("bracelet");
  });

  it("completes hoops with a chain", () => {
    expect(pick(["woven-gold-hoops"])).toEqual(["toggle-link-chain"]);
  });

  it("matches a piece from its own set when the set is in deep stock", () => {
    expect(pick(["bold-nocturne-bracelet"])).toEqual(["bold-nocturne-drops"]);
    expect(pick(["baguette-tennis-bracelet"])).toEqual(["baguette-huggies"]);
  });

  it("lets a shared motif lose to the proven hoops: Heartline Paperclip Necklace was bought with them (#1088)", () => {
    expect(pick(["heartline-paperclip-necklace"])).toEqual(["woven-gold-hoops"]);
  });

  it("never adds a pre-order piece in one tap, even from its own set", () => {
    const preorder = live.map((p) => (p.handle === "baguette-huggies" ? { ...p, tags: ["pre-order"] } : p));
    expect(pick(["baguette-tennis-bracelet"], 1, preorder)).toEqual(["woven-gold-hoops"]);
  });

  it("offers only deep-stock pieces: never hoops with 3 in stock, never a ring", () => {
    const offered = new Set(live.flatMap((p) => pick([p.handle])));
    for (const handle of offered) expect(Object.keys(DEEP_STOCK)).toContain(handle);
    expect(offered.has("textured-gold-hoops")).toBe(false);
    expect([...offered].some((h) => kindOf(byHandle(h)) === "ring")).toBe(false);
  });

  it("pairs with the piece added last, never one already in the bag or sold out", () => {
    expect(pick(["cushion-halo-ring", "woven-gold-hoops"])).toEqual(["toggle-link-chain"]);
    expect(pick(["prism-riviere-bracelet", "woven-gold-hoops"])).not.toContain("woven-gold-hoops");
    const soldOut = live.map((p) => (p.handle === "woven-gold-hoops" ? { ...p, availableForSale: false } : p));
    expect(pick(["prism-riviere-bracelet"], 1, soldOut)).not.toContain("woven-gold-hoops");
  });

  it("offers nothing once the bag holds three pieces, or for a bag it cannot read", () => {
    expect(bagAddOns(["prism-riviere-bracelet"], 3, live)).toBeNull();
    expect(bagAddOns(["not-in-catalogue"], 1, live)).toBeNull();
    expect(bagAddOns([], 0, live)).toBeNull();
  });

  it("never offers a second piece of the same kind, except hoops stacked beside hoops", () => {
    expect(matchScore(byHandle("prism-riviere-bracelet"), byHandle("heartbead-bracelet"))).toBe(0);
    expect(matchScore(byHandle("toggle-link-chain"), byHandle("bold-nocturne-chain"))).toBe(0);
    expect(matchScore(byHandle("woven-gold-hoops"), byHandle("baguette-huggies"))).toBeGreaterThan(0);
  });

  it("is stable from one render to the next", () => {
    expect(bagAddOns(["prism-riviere-bracelet"], 1, live)).toEqual(bagAddOns(["prism-riviere-bracelet"], 1, [...live].reverse()));
    expect(completeTheLook(byHandle("prism-riviere-bracelet"), live)).toEqual(completeTheLook(byHandle("prism-riviere-bracelet"), [...live].reverse()));
  });
});
