import { describe, expect, it } from "vitest";
import { collectionPieces, matchesOccasion } from "./jewelleryCollections";
import type { JewelPiece } from "@/data/jewellery";

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
});