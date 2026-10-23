import { describe, expect, it } from "vitest";
import { liveCatalogue } from "./useLiveJewellery";
import { jewellery } from "@/data/jewellery";
import type { ShopifyProductNode } from "@/lib/shopify";

const node = (handle: string, vendor = "Naira Petite", productType = "Earrings"): ShopifyProductNode => ({
  id: handle, handle, title: "Updated piece", vendor, productType, description: "", tags: [], availableForSale: true,
  priceRange: { minVariantPrice: { amount: "999", currencyCode: "INR" } }, images: { edges: [] },
  variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/1", title: "Default Title", availableForSale: true, price: { amount: "999", currencyCode: "INR" }, selectedOptions: [] } }] }, options: [],
});

describe("live catalogue authority", () => {
  it("uses Shopify’s current category and price for a known piece", () => {
    const known = jewellery[0];
    const result = liveCatalogue([node(known.handle)]);
    expect(result[0]?.category).toBe("Earrings");
    expect(result[0]?.price).toBe(999);
    expect(result[0]?.tags).toEqual([]);
  });
  it("does not resurrect removed jewellery when the live feed contains only apparel", () => {
    expect(liveCatalogue([node("dress", "Naira Flore", "Dress")])).toEqual([]);
  });
  it("includes new Shopify jewellery without a bundled entry", () => {
    expect(liveCatalogue([node("brand-new-studs")]).map((p) => p.handle)).toEqual(["brand-new-studs"]);
  });
});