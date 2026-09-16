import { describe, expect, it } from "vitest";
import { normalizeEmail, normalizePhone, productParams, shopifyNumericId } from "./pixel";

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

/**
 * Meta only matches `em` / `ph` if they are normalised its way before hashing.
 * A hash of "+91 98765 43210" matches nothing; a hash of "919876543210" does.
 * These two functions are the only place that normalisation happens.
 */
describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Shopatnaira@Gmail.COM ")).toBe("shopatnaira@gmail.com");
  });

  it("rejects anything that is not an address", () => {
    expect(normalizeEmail("not an email")).toBeUndefined();
    expect(normalizeEmail("nope@")).toBeUndefined();
    expect(normalizeEmail("@nope.com")).toBeUndefined();
    expect(normalizeEmail("")).toBeUndefined();
    expect(normalizeEmail(null)).toBeUndefined();
    expect(normalizeEmail(undefined)).toBeUndefined();
  });
});

describe("normalizePhone", () => {
  it("adds the India country code to a bare ten-digit mobile", () => {
    expect(normalizePhone("9876543210")).toBe("919876543210");
  });

  it("strips punctuation, spaces and a leading +", () => {
    expect(normalizePhone("+91 98765 43210")).toBe("919876543210");
    expect(normalizePhone("(+91)-98765-43210")).toBe("919876543210");
  });

  it("drops the domestic trunk prefix", () => {
    expect(normalizePhone("09876543210")).toBe("919876543210");
  });

  it("drops the international access prefix", () => {
    expect(normalizePhone("00919876543210")).toBe("919876543210");
  });

  it("leaves a number that already carries a country code alone", () => {
    expect(normalizePhone("919876543210")).toBe("919876543210");
    expect(normalizePhone("+1 415 555 0132")).toBe("14155550132");
  });

  it("returns undefined rather than hashing junk", () => {
    expect(normalizePhone("12345")).toBeUndefined();
    expect(normalizePhone("call me")).toBeUndefined();
    expect(normalizePhone("")).toBeUndefined();
    expect(normalizePhone(null)).toBeUndefined();
    expect(normalizePhone(undefined)).toBeUndefined();
  });

  it("does not mistake a five-digit landline for an Indian mobile", () => {
    // Starts with 6-9 but is not ten digits, so no 91 is prepended.
    expect(normalizePhone("98765")).toBeUndefined();
  });
});
