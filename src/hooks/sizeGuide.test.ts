import { describe, expect, it } from "vitest";
import { fromShopify } from "./useLiveJewellery";
import { cardCover } from "@/lib/cardCover";
import type { ShopifyProductNode } from "@/lib/shopify";

const photo = (file: string, altText: string | null = null) => ({ node: { url: `https://cdn.shopify.com/s/files/${file}`, altText } });

const node = (handle: string, images: ReturnType<typeof photo>[]): ShopifyProductNode => ({
  id: `gid://shopify/Product/${handle}`,
  title: "Pearl Point Studs",
  description: "Pearl studs.",
  handle,
  productType: "Earrings",
  vendor: "Naira Petite",
  tags: [],
  availableForSale: true,
  priceRange: { minVariantPrice: { amount: "1299.0", currencyCode: "INR" } },
  images: { edges: images },
  variants: {
    edges: [{ node: { id: "gid://shopify/ProductVariant/1", title: "Default Title", availableForSale: true, price: { amount: "1299.0", currencyCode: "INR" }, selectedOptions: [] } }],
  },
  options: [],
});

describe("the size guide photo", () => {
  it("comes last in the gallery, after the product shots and the box, wherever Shopify puts it", () => {
    const piece = fromShopify(
      node("pearl-point-studs", [
        photo("pearl-point-studs-size-guide.jpg", "Size guide — Pearl Point Studs"),
        photo("naira-packaging.jpg"),
        photo("pearl-point-studs-1.jpg"),
        photo("pearl-point-studs-2.jpg"),
      ]),
      0
    );
    expect(piece.gallery?.map((url) => url.split("/").pop())).toEqual([
      "pearl-point-studs-1.jpg",
      "pearl-point-studs-2.jpg",
      "naira-packaging.jpg",
      "pearl-point-studs-size-guide.jpg",
    ]);
    expect(piece.sizeGuide).toMatch(/size-guide\.jpg$/);
  });

  it("is found by its alt text when the file name doesn't say so", () => {
    const piece = fromShopify(node("pearl-point-studs", [photo("IMG_0042.jpg", "Size guide — Pearl Point Studs"), photo("pearl-point-studs-1.jpg")]), 0);
    expect(piece.gallery?.at(-1)).toMatch(/IMG_0042\.jpg$/);
    expect(piece.sizeGuide).toMatch(/IMG_0042\.jpg$/);
  });

  it("is never a card cover, even when it's the only other photo", () => {
    const piece = fromShopify(node("pearl-point-studs", [photo("pearl-point-studs-1.jpg"), photo("IMG_0042.jpg", "Size guide")]), 0);
    expect(cardCover(piece)).toMatch(/pearl-point-studs-1\.jpg$/);
  });

  it("is absent when a listing has none", () => {
    expect(fromShopify(node("pearl-point-studs", [photo("pearl-point-studs-1.jpg")]), 0).sizeGuide).toBeUndefined();
  });
});
