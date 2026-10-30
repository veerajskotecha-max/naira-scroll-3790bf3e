import { createElement, type ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { liveCatalogue, useLiveJewellery } from "./useLiveJewellery";
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
/* Every render of every user of the hook rebuilt the whole catalogue (16 times
   while a product page loaded, again on each gallery swipe), and the new array
   each time undid the memos downstream. One answer from Shopify, one mapping. */
describe("useLiveJewellery mapping", () => {
  it("hands every user the same catalogue until Shopify's answer changes", async () => {
    const client = new QueryClient();
    const key = ["shopify-products", "jewellery-catalogue"];
    client.setQueryData(key, [node("brand-new-studs")]);
    const wrapper = ({ children }: { children: ReactNode }) => createElement(QueryClientProvider, { client }, children);
    const first = renderHook(() => useLiveJewellery(false), { wrapper });
    const second = renderHook(() => useLiveJewellery(false), { wrapper });
    const before = first.result.current.jewellery;
    first.rerender();
    expect(first.result.current.isLive).toBe(true);
    expect(first.result.current.jewellery).toBe(before);
    expect(second.result.current.jewellery).toBe(before);

    act(() => {
      client.setQueryData(key, [node("brand-new-studs"), node("newer-hoops")]);
    });
    await waitFor(() => expect(first.result.current.jewellery.map((p) => p.handle)).toEqual(["brand-new-studs", "newer-hoops"]));
    expect(second.result.current.jewellery).toBe(first.result.current.jewellery);
  });
});
