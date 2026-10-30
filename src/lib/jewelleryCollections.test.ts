import { describe, expect, it } from "vitest";
import { collectionPieces, matchesOccasion, stockedLandings } from "./jewelleryCollections";
import { colourCards } from "./colourCards";
import { jewellery, type JewelPiece } from "@/data/jewellery";
import { jewellerySnapshot } from "@/data/jewellerySnapshot";
import { allLandings, categoryBySlug } from "@/data/seoContent";

const piece = (handle: string, name: string, category: JewelPiece["category"], tags: string[] = []) =>
  ({ handle, name, category, tags, blurb: "", materials: "" }) as JewelPiece;

describe("specialist collections", () => {
  const hoops = piece("woven-gold-hoops", "Woven Gold Hoops", "Earrings");
  const studs = piece("petite-bow-studs", "Petite Bow Studs", "Earrings");
  it("keeps studs out of hoops and hoops out of studs", () => {
    expect(collectionPieces([hoops, studs], { slug: "hoop-earrings", category: "Earrings" })).toEqual([hoops]);
    expect(collectionPieces([hoops, studs], { slug: "stud-earrings", category: "Earrings" })).toEqual([studs]);
  });
  it("keeps fixed rings out of adjustable rings", () => {
    const adjustable = piece("droplet-open-ring", "Droplet Open Ring", "Rings");
    const fixed = piece("star-point-band", "Star Point Band", "Rings");
    expect(collectionPieces([adjustable, fixed], { slug: "adjustable-rings", category: "Rings" })).toEqual([adjustable]);
  });
  it("does not substitute ordinary bracelets for an absent evil-eye range", () => {
    expect(collectionPieces([piece("heartbead-bracelet", "Heartbead Bracelet", "Bracelets")], { slug: "evil-eye-bracelets", category: "Bracelets" })).toEqual([]);
  });
  it("matches pearl and rose-gold evidence rather than the entire catalogue", () => {
    const pearl = piece("pearl-chain", "Pearl Chain", "Necklaces");
    const rose = piece("rose-verdant-band", "Verdant Band", "Rings", ["Rose Gold Tone"]);
    expect(collectionPieces([hoops, pearl, rose], { slug: "pearl-jewellery" })).toEqual([pearl]);
    expect(collectionPieces([hoops, pearl, rose], { slug: "rose-gold-jewellery" })).toEqual([rose]);
  });
  it("excludes a silver colour from gold collections", () => {
    expect(collectionPieces([{ ...hoops, colour: { option: "Metal", value: "Silver" } }], { slug: "gold-plated-jewellery" })).toEqual([]);
  });
  it("supports everyday links when Shopify does not carry occasion tags", () => {
    expect(matchesOccasion(studs, "Everyday")).toBe(true);
    expect(matchesOccasion(hoops, "nonexistent")).toBe(false);
  });
  /* 122 of 136 live pieces carry "Demi Fine" and "Naira Petite". Matched as
     style words, they put 131 pieces, Bold Nocturne Chain among them, in
     Minimal and Office Wear, and the menu's Everyday filter hid almost nothing. */
  it("does not read the line's own tags as a style", () => {
    const line = ["Demi Fine", "Naira Petite"];
    const bold = piece("bold-nocturne-chain", "Bold Nocturne Chain", "Necklaces", [...line, "Necklace"]);
    const halo = piece("cushion-halo-ring", "Cushion Halo Ring", "Rings", [...line, "Ring"]);
    const petite = piece("petite-bow-studs", "Petite Bow Studs", "Earrings", line);
    expect(collectionPieces([bold, halo, petite], { slug: "minimal-jewellery" })).toEqual([petite]);
    // Office Wear takes chains by name; the halo ring has nothing for it.
    expect(collectionPieces([bold, halo, petite], { slug: "office-wear-jewellery" })).toEqual([bold, petite]);
    expect(matchesOccasion(halo, "Everyday")).toBe(false);
    // A shopper who picks the tag itself still gets every piece carrying it.
    expect(matchesOccasion(halo, "Naira Petite")).toBe(true);
  });
});

describe("landings that repeat a broader landing", () => {
  /* Gold Plated and 18K Gold Plated share one rule, and Pendant Sets' rule
     takes in every necklace, so each pair listed the same grid as two indexed
     pages. The narrower page names the broader one as its canonical; that is
     only true while its pieces stay inside the broader page's. */
  const cards = colourCards([...jewellery, ...jewellerySnapshot]);
  const handles = (slug: string) => new Set(collectionPieces(cards, categoryBySlug(slug)!).map((p) => p.handle));
  const pointed = allLandings.filter((c) => c.canonicalSlug);

  it("points Pendant Sets at Necklaces and Gold Plated at 18K Gold Plated", () => {
    expect(Object.fromEntries(pointed.map((c) => [c.slug, c.canonicalSlug]))).toEqual({
      "pendant-sets": "necklaces",
      "gold-plated-jewellery": "18k-gold-plated-jewellery",
    });
  });

  it.each(pointed.map((c) => [c.slug, c.canonicalSlug!]))("%s shows nothing %s does not", (slug, target) => {
    const broader = categoryBySlug(target);
    expect(broader, `${target} is not a landing`).toBeDefined();
    expect(broader!.canonicalSlug, `${target} must be its own canonical`).toBeUndefined();
    const outside = [...handles(slug)].filter((h) => !handles(target).has(h));
    expect(outside).toEqual([]);
  });
});

describe("landings with nothing to show", () => {
  /* No evil-eye piece is listed, so its landing showed "No pieces in this
     collection right now" under copy describing bracelets the shop does not
     sell, while the sitemap, Shop All and 30 other landings advertised it. */
  const bracelet = piece("heartbead-bracelet", "Heartbead Bracelet", "Bracelets", ["Demi Fine", "Naira Petite"]);
  const evilEye = categoryBySlug("evil-eye-bracelets")!;
  const charm = categoryBySlug("charm-bracelets")!;

  it("drops a landing none of the pieces belong to and keeps the rest", () => {
    expect(stockedLandings([bracelet], [evilEye, charm])).toEqual([charm]);
    expect(stockedLandings([], [evilEye, charm])).toEqual([]);
  });

  it("counts a piece by the colour card the landing draws", () => {
    const twoTone = {
      ...piece("verdant-band", "Verdant Band", "Rings"),
      options: [{ name: "Metal", values: ["Gold", "Rose Gold"] }],
      variants: ["Gold", "Rose Gold"].map((metal, i) => ({
        id: `gid://shopify/ProductVariant/${i}`, title: metal, price: 999, availableForSale: true,
        options: { Metal: metal }, image: `https://cdn.example/verdant-band-${metal.replace(" ", "-").toLowerCase()}.jpg`,
      })),
    } as JewelPiece;
    expect(stockedLandings([twoTone], [categoryBySlug("rose-gold-jewellery")!])).toHaveLength(1);
  });
});
