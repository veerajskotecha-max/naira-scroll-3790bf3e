import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { jewellery } from "@/data/jewellery";
import { jewellerySnapshot } from "@/data/jewellerySnapshot";
import { colourOfVariant } from "@/lib/colourCards";
import { viewContentParams } from "./viewContent";

/*
  ViewContent reported the piece's lead variant whatever the page opened on.
  Live: the catalogue ad for the Silver Triple Coil Wrap Bangle
  (?variant=50651931672738) opened with Silver selected and sent content_ids
  ["50651931639970"], the Gold catalogue item; ?colour=silver and the Emerald
  Baguette Tennis Bracelet card did the same. The Add to cart that followed
  carried the right id, so a view and an add on one page disagreed.
*/
const piece = (handle: string) => {
  const found = jewellerySnapshot.find((p) => p.handle === handle);
  if (!found) throw new Error(`${handle} is not in the snapshot`);
  return found;
};
/* As the page reads its link: ?colour= first, else a catalogue ad's ?variant=. */
const pageColour = (handle: string, search: string) => {
  const q = new URLSearchParams(search);
  return q.get("colour") ?? colourOfVariant(piece(handle), q.get("variant"))?.toLowerCase() ?? null;
};
const viewOf = (handle: string, search = "") => viewContentParams(piece(handle), pageColour(handle, search));

describe("ViewContent names the variant the page opens on", () => {
  it.each([
    ["the Silver catalogue ad", "triple-coil-wrap-bangle", "?utm_source=facebook&variant=50651931672738&fbclid=x", "50651931672738"],
    ["a Silver colour card", "triple-coil-wrap-bangle", "?colour=silver", "50651931672738"],
    ["the Gold catalogue ad", "triple-coil-wrap-bangle", "?variant=50651931639970", "50651931639970"],
    ["the plain page (Gold first)", "triple-coil-wrap-bangle", "", "50651931639970"],
    ["an Emerald colour card", "baguette-tennis-bracelet", "?colour=emerald", "50651931803810"],
    ["the plain page (Crystal first)", "baguette-tennis-bracelet", "", "50651931738274"],
    ["a colour the piece is not sold in", "triple-coil-wrap-bangle", "?colour=rose", "50651931639970"],
  ])("%s", (_link, handle, search, id) => {
    const params = viewOf(handle, search);
    expect(params.content_ids).toEqual([id]);
    expect(params.contents[0].id).toBe(id);
    expect(params.currency).toBe("INR");
  });

  it("values the view at the opening variant's own price", () => {
    const p = piece("triple-coil-wrap-bangle");
    const silver = p.variants!.find((v) => v.id.endsWith("50651931672738"))!;
    expect(viewOf("triple-coil-wrap-bangle", "?colour=silver").value).toBe(silver.price);
  });

  it("keeps the lead variant for a piece with no variants yet", () => {
    const p = { ...piece("triple-coil-wrap-bangle"), variants: undefined };
    expect(viewContentParams(p, "silver").content_ids).toEqual(["50651931639970"]);
  });

  /* Star Point Band, once Shopify's Gold / Silver, US 5–8 have arrived (the
     bundled copy has none; see useViewContent for the wait). */
  it("names Star Point Band's Silver / US 6 from its Silver ad link", () => {
    const bundled = jewellery.find((p) => p.handle === "star-point-band")!;
    const ids: Array<[string, string, string]> = [
      ["50709664333986", "Gold", "5"], ["47501788774562", "Gold", "6"], ["50709664366754", "Gold", "7"], ["50709664399522", "Gold", "8"],
      ["50709664432290", "Silver", "5"], ["50652105605282", "Silver", "6"], ["50709664465058", "Silver", "7"], ["50709664497826", "Silver", "8"],
    ];
    const live = {
      ...bundled,
      options: [{ name: "Metal", values: ["Gold", "Silver"] }, { name: "Size", values: ["5", "6", "7", "8"] }],
      variants: ids.map(([id, Metal, Size]) => ({ id: `gid://shopify/ProductVariant/${id}`, title: `${Metal} / ${Size}`, availableForSale: true, price: 799, options: { Metal, Size } })),
    };
    const colour = colourOfVariant(live, "50652105605282")?.toLowerCase();
    expect(viewContentParams(live, colour).content_ids).toEqual(["50652105605282"]);
    expect(viewContentParams(live, "silver").content_ids).toEqual(["50652105605282"]);
    expect(viewContentParams(live, null).content_ids).toEqual(["47501788774562"]);
  });

  it("is what the product page sends, once per piece, waiting for Shopify when it must", () => {
    const page = readFileSync(resolve(__dirname, "../pages/JewelDetailNext.tsx"), "utf8");
    expect(page).toMatch(/useViewContent\(piece, colourParam, Boolean\(piece && linkPlaced\(piece, searchParams\)\), isLive \|\| !catalogueLoading\);/);
    expect(page).not.toMatch(/"ViewContent"/);
    expect(page).not.toMatch(/piece\.variantId,\s*name: piece\.name,\s*price: piece\.price,\s*category/);
  });
});
