import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JewelPiece } from "@/data/jewellery";

/*
  Adjustability is fit, not inventory. A reel card kept Add for an open-back
  ring Shopify had sold out, while the same ring's listing card said SOLD OUT
  (audit C27). With Shopify as the stock authority it is reserved on WhatsApp
  like any other sold-out piece, and never sent to the bag.
*/
const addItem = vi.fn();
const ring = {
  handle: "cushion-halo-ring",
  name: "Cushion Halo Ring",
  category: "Rings",
  price: 1199,
  priceLabel: "₹1,199",
  variantId: "gid://shopify/ProductVariant/1",
  availableForSale: false,
  image: "https://cdn.shopify.com/r.jpg",
} as unknown as JewelPiece;
const reel = {
  id: "reel-1", title: null, caption: null, video_path: "r.mp4", poster_path: null, sort_order: 0, published: true,
  videoUrl: "https://x/r.mp4", posterUrl: null,
  products: [{ id: "p1", handle: ring.handle, title: ring.name, price_label: "₹1,199", image_url: null, variant_id: "gid://shopify/ProductVariant/1", position: 0 }],
};
vi.mock("@/contexts/CartContext", () => ({ useCart: () => ({ addItem, setDrawerOpen: vi.fn(), isLoading: false }) }));
vi.mock("@/hooks/useLiveJewellery", () => ({ useLiveJewellery: () => ({ jewellery: [ring], isLive: true }) }));
vi.mock("@/hooks/useReels", () => ({ useReels: () => ({ data: [reel], isLoading: false, isError: false, isSuccess: true, refetch: vi.fn() }), readStaleReelCache: () => null }));

import ReelShopNext from "./ReelShopNext";
import MobileReelShop from "./MobileReelShop";

class NoObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}

describe("a sold-out adjustable ring in a reel", () => {
  const open = vi.fn();
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("IntersectionObserver", NoObserver);
    vi.stubGlobal("open", open);
    addItem.mockClear();
    open.mockClear();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  for (const [where, Shop] of [["the product page's reel list", ReelShopNext], ["the reel viewer's cards", MobileReelShop]] as const) {
    it(`is reserved on WhatsApp from ${where}, never added`, () => {
      render(<MemoryRouter><Shop /></MemoryRouter>);
      act(() => void vi.advanceTimersByTime(700));
      expect(screen.queryByRole("button", { name: "Add" })).toBeNull();
      expect(screen.getByText("Pre-order")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Reserve" }));
      expect(open).toHaveBeenCalledWith(expect.stringContaining("https://wa.me/"), "_blank", "noopener");
      expect(addItem).not.toHaveBeenCalled();
    });
  }
});
