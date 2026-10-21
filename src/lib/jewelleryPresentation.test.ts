import { describe, expect, it } from "vitest";
import { jewellery } from "@/data/jewellery";
import { jewellerySnapshot } from "@/data/jewellerySnapshot";
import { coatingOf, hasZirconeStone, presentJewellery, PRISM_BRACELET_SIZE_CM } from "./jewelleryPresentation";

const piece = jewellery[0];

describe("product-specific coating and stones", () => {
  it("keeps Prism's adjustable measurement at 15–19 cm across live and snapshot fields", () => {
    // Shopify's introduction still says 18 cm while its details give a range.
    expect(PRISM_BRACELET_SIZE_CM).toEqual({ min: 15, max: 19 });
    const prism = jewellerySnapshot.find((p) => p.handle === "prism-riviere-bracelet");
    if (!prism) throw new Error("Missing Prism bracelet fixture");
    for (const source of [prism, { ...prism, details: ["Length: 18 cm"] }]) {
      const shown = presentJewellery(source);
      if (!shown) throw new Error("Missing presented bracelet");
      for (const field of [shown.blurb, shown.description, ...(shown.details ?? []).filter((line) => /^Length:/i.test(line))]) {
        const ranges = [...(field ?? "").matchAll(/(\d+)–(\d+)\s*cm/g)];
        expect(ranges.length).toBeGreaterThan(0);
        for (const range of ranges) expect(range.slice(1).map(Number)).toEqual([15, 19]);
        expect(field).not.toMatch(/\b18\s*cm\b/i);
        expect(field).toMatch(/adjustable/i);
      }
    }
    expect(presentJewellery({ ...piece, blurb: "Length: 18 cm" })?.blurb).toBe("Length: 18 cm");
  });
  it("recognises explicitly listed zircone and cubic zirconia", () => {
    expect(hasZirconeStone({ ...piece, blurb: "", description: "", details: ["Stone: Zircone"] })).toBe(true);
    expect(hasZirconeStone(piece)).toBe(true);
  });
  it("does not infer zircone from the old blanket materials summary", () => {
    const pearl = jewellerySnapshot.find((p) => p.handle === "baroque-pearl-lariat");
    if (!pearl) throw new Error("Missing pearl-only regression fixture");
    expect(hasZirconeStone(pearl)).toBe(false);
    expect(hasZirconeStone({ ...piece, blurb: "", description: "", details: [] })).toBe(false);
  });
  it("recognises confirmed mixed pearl and zircone pieces", () => {
    expect(hasZirconeStone({ ...piece, details: ["Stone: Pearl & zircone"] })).toBe(true);
  });
  it("uses the explicit plating rather than a generic gold summary", () => {
    expect(coatingOf({ ...piece, details: ["Plating: Rhodium coated"] })).toBe("Rhodium coated");
    expect(coatingOf({ ...piece, details: ["Plating: Silver coated"] })).toBe("Silver coated");
    expect(coatingOf(piece)).toBe("18K gold coated");
  });
  it("changes coating wording without changing hallmark, name, price or inventory", () => {
    const source = { ...piece, description: "18K gold tone plated, with 925 sterling silver posts" };
    const shown = presentJewellery(source);
    expect(shown?.description).toBe("18K gold coated, with 925 sterling silver posts");
    expect(shown?.name).toBe(source.name);
    expect(shown?.price).toBe(source.price);
    expect(shown?.availableForSale).toBe(source.availableForSale);
  });
});