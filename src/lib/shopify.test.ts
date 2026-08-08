import { describe, it, expect } from "vitest";
import { wornFirst } from "./shopify";
import type { ShopifyProductNode } from "./shopify";

const CDN = "https://cdn.shopify.com/s/files/1/0/files";

/** Minimal product stub — only `images` matters to wornFirst. */
const productWith = (files: string[]) =>
  ({
    images: { edges: files.map((f) => ({ node: { url: `${CDN}/${f}`, altText: null } })) },
  }) as unknown as ShopifyProductNode;

const filesOf = (p: ShopifyProductNode | null) =>
  p!.images.edges.map((e) => e.node.url.split("/").pop());

describe("wornFirst", () => {
  it("promotes the worn shot to the hero position", () => {
    const out = wornFirst(productWith(["YF3952_1_main.png", "YF3952_2_worn.png", "YF3952_3_alt.png"]));
    expect(filesOf(out)).toEqual(["YF3952_2_worn.png", "YF3952_1_main.png", "YF3952_3_alt.png"]);
  });

  it("preserves the relative order of the remaining images", () => {
    const out = wornFirst(
      productWith(["a_1_main.png", "a_2_worn.png", "a_3_alt.png", "a_4_alt.png", "a_5_alt.png"]),
    );
    expect(filesOf(out)).toEqual([
      "a_2_worn.png",
      "a_1_main.png",
      "a_3_alt.png",
      "a_4_alt.png",
      "a_5_alt.png",
    ]);
  });

  it("leaves products without a worn shot untouched", () => {
    const input = productWith(["x_1_main.png", "x_3_alt.png"]);
    expect(filesOf(wornFirst(input))).toEqual(["x_1_main.png", "x_3_alt.png"]);
  });

  it("is a no-op when the worn shot already leads", () => {
    const input = productWith(["x_2_worn.png", "x_1_main.png"]);
    expect(wornFirst(input)).toBe(input);
  });

  it("does not match 'worn' appearing elsewhere in the path", () => {
    const input = productWith(["worn-out-collection/y_1_main.png", "worn-out-collection/y_3_alt.png"]);
    expect(filesOf(wornFirst(input))).toEqual(["y_1_main.png", "y_3_alt.png"]);
  });

  it("handles null, empty and single-image products", () => {
    expect(wornFirst(null)).toBeNull();
    expect(filesOf(wornFirst(productWith([])) ?? productWith([]))).toEqual([]);
    expect(filesOf(wornFirst(productWith(["solo_2_worn.png"])))).toEqual(["solo_2_worn.png"]);
  });
});
