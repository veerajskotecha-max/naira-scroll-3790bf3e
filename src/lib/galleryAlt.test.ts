import { describe, expect, it } from "vitest";
import { fromShopify } from "@/hooks/useLiveJewellery";
import type { ShopifyProductNode } from "@/lib/shopify";
import { galleryAlt } from "./galleryAlt";

const cdn = (file: string) => `https://cdn.shopify.com/s/files/1/0680/9606/5698/files/${file}?v=1787277624`;

/* Star Point Band as Shopify lists it: two described photos, one whose alt
   only repeats the title, the gift box and the size guide placed FIRST — the
   gallery moves them last, so the alts must follow the photo, not the slot. */
const starPoint: ShopifyProductNode = {
  id: "1", handle: "star-point-band", title: "Star Point Band", vendor: "Naira Petite", productType: "Rings",
  description: "", tags: [], availableForSale: true,
  priceRange: { minVariantPrice: { amount: "799", currencyCode: "INR" } },
  images: {
    edges: [
      { node: { url: cdn("star-point-band-size-guide.jpg"), altText: "Size guide — Star Point Band" } },
      { node: { url: cdn("naira-packaging-b7.jpg"), altText: null } },
      { node: { url: cdn("star-point-band-1.jpg"), altText: "Star Point Band, Gold — macro of one four-point star set with four stones" } },
      { node: { url: cdn("star-point-band-2.jpg"), altText: "Star Point Band" } },
      { node: { url: cdn("star-point-band-3.jpg"), altText: "catalog-square" } },
      { node: { url: cdn("star-point-band-4.jpg"), altText: "Star Point Band — worn on the hand" } },
    ],
  },
  variants: { edges: [{ node: { id: "gid://shopify/ProductVariant/1", title: "Default Title", availableForSale: true, price: { amount: "799", currencyCode: "INR" }, selectedOptions: [] } }] },
  options: [],
};

/* 842 of 847 gallery photos were announced as "<name> view N", the size
   guide and the gift box included, while Shopify held a description for
   nine in ten of them. */
describe("galleryAlt", () => {
  const piece = fromShopify(starPoint, 0);
  const alts = (piece.gallery ?? []).map((url, i) => galleryAlt(piece, url, i));

  it("uses Shopify's description, wherever the photo lands in the gallery", () => {
    expect(alts[0]).toBe("Star Point Band, Gold — macro of one four-point star set with four stones");
    expect(alts).toContain("Star Point Band — worn on the hand");
  });

  it("keeps '<name> view N' where Shopify says only the name, or nothing useful", () => {
    expect(alts[1]).toBe("Star Point Band view 2");
    expect(alts[2]).toBe("Star Point Band view 3");
  });

  it("says what the gift box and the size guide are", () => {
    expect(alts.slice(-2)).toEqual(["The Naira gift box Star Point Band arrives in", "Size guide — Star Point Band"]);
    // Without any Shopify alt (first paint), the file name still tells.
    const bare = { name: "Star Point Band" };
    expect(galleryAlt(bare, cdn("star-point-band-size-guide.jpg"), 5)).toBe("Size guide — Star Point Band");
    expect(galleryAlt(bare, cdn("naira-packaging-b7.jpg"), 4)).toBe("The Naira gift box Star Point Band arrives in");
    expect(galleryAlt(bare, cdn("star-point-band-1.jpg"), 0)).toBe("Star Point Band view 1");
  });

  it("matches a photo whatever its cache-busting query", () => {
    expect(galleryAlt(piece, cdn("star-point-band-4.jpg").replace(/\?v=\d+/, "?v=1&width=900"), 3)).toBe("Star Point Band — worn on the hand");
  });
});
