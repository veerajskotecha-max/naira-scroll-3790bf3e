import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchShopifyProducts } from "./shopify";

/*
  Shopify answers at most 250 products, and 20 variants a product in the
  catalogue query, without any error past that: a 251st listing, or a ring's
  21st variant, simply vanished from the site. The catalogue pages to the end.
*/
const variant = (n: number) => ({
  node: { id: `v${n}`, title: `V${n}`, availableForSale: true, price: { amount: "999", currencyCode: "INR" }, compareAtPrice: null, selectedOptions: [], image: null },
});
const product = (handle: string, variants: number[], more = false) => ({
  node: {
    id: `gid://shopify/Product/${handle}`, handle, title: handle, description: "", productType: "Rings", vendor: "Naira Petite", tags: [], availableForSale: true,
    priceRange: { minVariantPrice: { amount: "999", currencyCode: "INR" } }, images: { edges: [] }, options: [],
    variants: { pageInfo: { hasNextPage: more, endCursor: more ? `${handle}-v` : null }, edges: variants.map(variant) },
  },
});
const answer = (data: unknown) => ({ ok: true, status: 200, json: async () => ({ data }) });

afterEach(() => vi.unstubAllGlobals());

describe("the catalogue query", () => {
  it("follows every page of products and every held-back variant", async () => {
    const calls: Array<{ query: string; variables: Record<string, unknown> }> = [];
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init: { body: string }) => {
      const body = JSON.parse(init.body);
      calls.push(body);
      if (/ProductVariants/.test(body.query)) {
        return answer({ product: { variants: { pageInfo: { hasNextPage: false, endCursor: null }, edges: [variant(21)] } } });
      }
      return body.variables.after
        ? answer({ products: { pageInfo: { hasNextPage: false, endCursor: null }, edges: [product("newest-ring", [1])] } })
        : answer({ products: { pageInfo: { hasNextPage: true, endCursor: "page-1" }, edges: [product("tubogas-dome-ring", Array.from({ length: 20 }, (_, i) => i + 1), true)] } });
    }));

    const nodes = await fetchShopifyProducts();
    expect(nodes.map((n) => n.handle)).toEqual(["tubogas-dome-ring", "newest-ring"]);
    expect(nodes[0].variants.edges.map((e) => e.node.id)).toContain("v21");
    expect(nodes[0].variants.edges).toHaveLength(21);
    expect(calls.filter((c) => /GetProducts/.test(c.query)).map((c) => c.variables.after)).toEqual([null, "page-1"]);
    expect(calls.find((c) => /ProductVariants/.test(c.query))?.variables).toEqual({ id: "gid://shopify/Product/tubogas-dome-ring", after: "tubogas-dome-ring-v" });
  });

  it("asks for no more than a short row wants", async () => {
    const fetchMock = vi.fn(async () => answer({ products: { pageInfo: { hasNextPage: true, endCursor: "next" }, edges: [product("a", [1]), product("b", [2])] } }));
    vi.stubGlobal("fetch", fetchMock);
    const nodes = await fetchShopifyProducts(2);
    expect(nodes).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
