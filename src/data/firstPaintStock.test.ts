import { describe, expect, it } from "vitest";
import { jewellery } from "@/data/jewellery";
import { jewellerySnapshot } from "@/data/jewellerySnapshot";
import { applyJewelFilters, type JewelFilters } from "@/components/jewellery/JewelFilterBar";
import { colourCards } from "@/lib/colourCards";
import { completeTheLook } from "@/lib/pairings";

/*
  Until the live catalogue answers, /jewellery, the "Complete the look" rows
  and product pages reached inside the site draw the bundled pieces. Those
  carry Shopify's stock as read on 30 Oct (audit C25), so first paint already
  does what the live catalogue does: the five pieces Shopify had sold out read
  SOLD OUT and sink to the end of the grid (Rivière Eternal Necklace from 2nd
  to 17th), and no row suggests one of them (Aquarelle Rivière Bracelet's row
  offered Rivière Eternal). If this fails after the price refresh is re-run,
  Shopify's stock has changed: update the list here and the owner's note.
*/
const SOLD_OUT_30_OCT = [
  "riviere-eternal-necklace",
  "molten-bloom-hoops",
  "solitaire-whisper-studs",
  "riviere-of-light-bracelet",
  "first-light-set",
];
const FEATURED: JewelFilters = { sort: "featured", maxPrice: null, minPrice: null, inStockOnly: false, tag: null };
const grid = () => applyJewelFilters(colourCards(jewellery), FEATURED).map((p) => p.handle);

describe("first paint carries Shopify's sold-out state", () => {
  it("marks the pieces Shopify had sold out as sold out", () => {
    expect(jewellery.filter((p) => p.availableForSale === false).map((p) => p.handle)).toEqual(SOLD_OUT_30_OCT);
  });

  it("draws them last on the /jewellery grid", () => {
    expect(grid()).toHaveLength(21);
    expect(grid().slice(-5)).toEqual(SOLD_OUT_30_OCT);
    expect(grid().indexOf("riviere-eternal-necklace") + 1).toBe(17);
  });

  it("suggests none of them in a product page's Complete the look row", () => {
    const aquarelle = jewellerySnapshot.find((p) => p.handle === "aquarelle-riviere-bracelet")!;
    expect(completeTheLook(aquarelle, jewellery, 3).map((p) => p.handle)).not.toContain("riviere-eternal-necklace");
    const suggested = [...jewellery, ...jewellerySnapshot].flatMap((p) => completeTheLook(p, jewellery, 3).map((q) => q.handle));
    expect(suggested.filter((handle) => SOLD_OUT_30_OCT.includes(handle))).toEqual([]);
  });
});
