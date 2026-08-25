import { describe, it, expect } from "vitest";
import { getLineForVariant, sizeAttributes, SIZE_ATTRIBUTE } from "./shopify";

/*
  Every ring in the catalogue is a single "Default Title" variant, so the only
  thing telling two ring sizes apart is the line attribute.

  Matching a cart line on merchandise id alone handed both sizes the same
  lineId. The drawer then held two rows pointing at one Shopify line, syncCart
  wrote the server quantity onto both, and the subtotal shown was exactly
  double what Shopify would charge. The size also never reached the order.
*/
const line = (id: string, variantId: string, size?: string, quantity = 1) => ({
  node: {
    id,
    quantity,
    attributes: size ? [{ key: SIZE_ATTRIBUTE, value: size }] : [],
    merchandise: { id: variantId },
  },
});

const RING = "gid://shopify/ProductVariant/1";

describe("size travels to Shopify as a line attribute", () => {
  it("sends the chosen size", () => {
    expect(sizeAttributes("US 6")).toEqual([{ key: "Size", value: "US 6" }]);
  });

  it("sends nothing for an unsized piece, rather than an empty attribute", () => {
    expect(sizeAttributes(undefined)).toEqual([]);
    expect(sizeAttributes("   ")).toEqual([]);
  });
});

describe("cart lines are matched on variant AND size", () => {
  const lines = [line("line-a", RING, "US 6"), line("line-b", RING, "US 5")];

  it("gives each ring size its own line", () => {
    expect(getLineForVariant(lines, RING, "US 6")?.id).toBe("line-a");
    expect(getLineForVariant(lines, RING, "US 5")?.id).toBe("line-b");
  });

  it("never returns one line for two different sizes", () => {
    const six = getLineForVariant(lines, RING, "US 6")?.id;
    const five = getLineForVariant(lines, RING, "US 5")?.id;
    expect(six).not.toBe(five);
  });

  it("still resolves an unsized product with no attributes", () => {
    const plain = [line("line-c", RING)];
    expect(getLineForVariant(plain, RING)?.id).toBe("line-c");
  });

  it("falls back to the variant's line when the size is not found", () => {
    expect(getLineForVariant(lines, RING, "US 9")?.id).toBe("line-a");
  });
});
