import { describe, expect, it } from "vitest";
import { jewellery } from "@/data/jewellery";
import { jewellerySnapshot } from "@/data/jewellerySnapshot";
import { coatingOf, hasZirconeStone, presentJewellery } from "./jewelleryPresentation";

const piece = jewellery[0];

describe("product-specific coating and stones", () => {
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