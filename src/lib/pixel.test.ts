import { describe, expect, it } from "vitest";
import { productParams, shopifyNumericId } from "./pixel";

/**
 * Meta matches pixel events to catalogue rows on `retailer_id`, which the
 * Shopify Facebook & Instagram channel sets to the bare numeric variant ID
 * (verified against catalogue 890180200517979, e.g. "45794971222178").
 * If these ever drift back to handles, dynamic ads stop matching entirely.
 */
describe("shopifyNumericId", () => {
  it("strips a variant GID down to the catalogue retailer_id", () => {
    expect(shopifyNumericId("gid://shopify/ProductVariant/45794971222178")).toBe("45794971222178");
  });

  it("handles a product GID too", () => {
    expect(shopifyNumericId("gid://shopify/Product/8754987401378")).toBe("8754987401378");
  });

  it("passes through an already-numeric id", () => {
    expect(shopifyNumericId("45794971222178")).toBe("45794971222178");
  });

  it("returns undefined for missing or non-numeric input", () => {
    expect(shopifyNumericId(undefined)).toBeUndefined();
    expect(shopifyNumericId(null)).toBeUndefined();
    expect(shopifyNumericId("")).toBeUndefined();
    expect(shopifyNumericId("blush-of-dawn")).toBeUndefined();
  });
});

describe("productParams", () => {
  it("keys content_ids on the numeric variant id, not the handle", () => {
    const params = productParams({
      id: "blush-of-dawn",
      variantId: "gid://shopify/ProductVariant/45794971222178",
      name: "Blush of Dawn",
      price: 44000,
    });
    expect(params.content_ids).toEqual(["45794971222178"]);
    expect(params.contents[0].id).toBe("45794971222178");
    expect(params.content_name).toBe("Blush of Dawn");
    expect(params.content_type).toBe("product");
  });

  it("falls back to the handle when no variant is known", () => {
    const params = productParams({ id: "blush-of-dawn", name: "Blush of Dawn" });
    expect(params.content_ids).toEqual(["blush-of-dawn"]);
  });

  it("multiplies value by quantity and keeps item_price per unit", () => {
    const params = productParams({
      id: "x",
      variantId: "gid://shopify/ProductVariant/99",
      name: "X",
      price: 1000,
      quantity: 3,
    });
    expect(params.value).toBe(3000);
    expect(params.contents[0].item_price).toBe(1000);
    expect(params.contents[0].quantity).toBe(3);
  });
});
