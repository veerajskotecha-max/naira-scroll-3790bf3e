import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { track } = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("@/lib/pixel", async (importActual) => ({ ...(await importActual<typeof import("@/lib/pixel")>()), trackPixel: track }));

import { useWishlist, WishlistProvider, type WishlistItem } from "./WishlistContext";

/*
  The heart sent AddToWishlist with the handle as its content id
  (["molten-bloom-hoops"]), which matches no item in the Meta catalogue (it
  keys on the numeric variant id, 47501786841250 here), and with no value or
  currency, in both the browser and the server copy. ViewContent and
  AddToCart on the same page sent the catalogue id.
*/
const wrapper = ({ children }: { children: ReactNode }) => <WishlistProvider>{children}</WishlistProvider>;
const hoops: WishlistItem = {
  id: "molten-bloom-hoops",
  name: "Molten Bloom Hoops",
  price: "₹1,300",
  image: "https://cdn.shopify.com/x.jpg",
  kind: "jewellery",
  variantId: "gid://shopify/ProductVariant/47501786841250",
  amount: 1300,
};
const wishlistEvents = () => track.mock.calls.filter(([event]) => event === "AddToWishlist").map(([, params]) => params);

beforeEach(() => {
  track.mockClear();
  localStorage.clear();
});
afterEach(() => localStorage.clear());

describe("AddToWishlist", () => {
  it("names the catalogue item and carries its value, as AddToCart does", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    act(() => result.current.toggleItem(hoops));
    expect(wishlistEvents()).toEqual([
      expect.objectContaining({
        content_ids: ["47501786841250"],
        content_name: "Molten Bloom Hoops",
        content_type: "product",
        contents: [{ id: "47501786841250", quantity: 1, item_price: 1300 }],
        value: 1300,
        currency: "INR",
      }),
    ]);
  });

  it("fires once per add and never on a remove", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    act(() => result.current.toggleItem(hoops));
    act(() => result.current.toggleItem(hoops));
    act(() => result.current.toggleItem(hoops));
    act(() => result.current.addItem(hoops));
    expect(wishlistEvents()).toHaveLength(2);
  });

  it("still keeps the shown price label for the wishlist itself", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    act(() => result.current.addItem(hoops));
    expect(result.current.items[0].price).toBe("₹1,300");
  });

  it("falls back to the handle, with a currency, when no variant is known", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    act(() => result.current.addItem({ id: "x", name: "X", price: "", image: "" }));
    expect(wishlistEvents()[0]).toEqual(expect.objectContaining({ content_ids: ["x"], currency: "INR" }));
    expect(wishlistEvents()[0]).not.toHaveProperty("value");
  });
});

describe("every heart hands the wishlist the variant and price it shows", () => {
  const src = (file: string) => readFileSync(resolve(__dirname, "..", file), "utf8");
  it.each([
    ["the product page", "pages/JewelDetailNext.tsx", /toggleItem\(\{[^}]*variantId: variant\?\.id \?\? piece\.variantId, amount: shown\.price \}\)/],
    ["the shop card", "components/jewellery/JewelCard.tsx", /toggleItem\(\{[^}]*variantId: piece\.variantId, amount: piece\.price \}\)/],
    ["the recommendation card", "components/ProductCard.tsx", /variantId: product\.variantId,\s*amount: product\.numericPrice,\s*\}\)/],
    ["the outfit page gallery", "components/product/ProductGallery.tsx", /toggleItem\(\{[^}]*variantId: lead\?\.node\.id, amount:/],
  ])("%s", (_where, file, call) => {
    expect(src(file)).toMatch(call);
  });
});
