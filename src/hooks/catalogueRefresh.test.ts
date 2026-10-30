import { createElement, type ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, focusManager } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLiveJewellery } from "./useLiveJewellery";

/* The whole catalogue (~70 KB over the wire, ~500 KB of JSON) was downloaded
   again every 60 s on any open page, 4 MB an hour of a shopper's mobile data.
   An open page now re-reads it every 5 minutes, a hidden tab never, and a
   return to the tab reads it at once when it is older than 30 s. */
const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock("@/lib/shopify", async (importOriginal) => ({ ...(await importOriginal<object>()), fetchShopifyProducts: mocks.fetch }));

const node = {
  id: "p1", handle: "brand-new-studs", title: "Studs", vendor: "Naira Petite", productType: "Earrings", description: "", tags: [], availableForSale: true,
  priceRange: { minVariantPrice: { amount: "999", currencyCode: "INR" } }, images: { edges: [] }, options: [],
  variants: { edges: [{ node: { id: "v1", title: "Default Title", availableForSale: true, price: { amount: "999", currencyCode: "INR" }, selectedOptions: [] } }] },
};

const mount = () => {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => createElement(QueryClientProvider, { client }, children);
  return renderHook(() => useLiveJewellery(), { wrapper });
};

describe("catalogue refresh", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mocks.fetch.mockReset();
    mocks.fetch.mockResolvedValue([node]);
  });
  afterEach(() => {
    focusManager.setFocused(undefined);
    vi.useRealTimers();
  });

  it("does not download the catalogue again every minute on an open page", async () => {
    const { result } = mount();
    await waitFor(() => expect(result.current.isLive).toBe(true));
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1000 * 60 * 4);
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1000 * 60 * 1.5);
    expect(mocks.fetch).toHaveBeenCalledTimes(2);
  });

  it("never polls a hidden tab, and reads stock again on the way back", async () => {
    const { result } = mount();
    await waitFor(() => expect(result.current.isLive).toBe(true));
    focusManager.setFocused(false);
    await vi.advanceTimersByTimeAsync(1000 * 60 * 12);
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    focusManager.setFocused(true);
    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledTimes(2));
  });
});
