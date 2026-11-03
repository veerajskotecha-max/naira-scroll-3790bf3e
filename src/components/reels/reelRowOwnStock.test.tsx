import { act, cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JewelPiece } from "@/data/jewellery";

/*
  A reel row follows the stock of its own piece and nothing else (audit C27).
  Two open-back rings side by side: Shopify has sold out Rose Verdant Band and
  still holds Cushion Halo Ring. Only Rose Verdant's row turns to "Pre-order"
  and Reserve; Cushion Halo keeps its price and Add. (Today Rose Verdant is in
  no reel and Cushion Halo, the one adjustable ring in a reel, has stock, so
  the live reels look the same with or without this rule.)
*/
const piece = (handle: string, name: string, price: number, availableForSale: boolean) =>
  ({
    handle,
    name,
    category: "Rings",
    price,
    priceLabel: `₹${price.toLocaleString("en-IN")}`,
    variantId: `gid://shopify/ProductVariant/${handle}`,
    availableForSale,
    image: `https://cdn.shopify.com/${handle}.jpg`,
  }) as unknown as JewelPiece;
const cushion = piece("cushion-halo-ring", "Cushion Halo Ring", 1199, true);
const rose = piece("rose-verdant-band", "Rose Verdant Band", 1599, false);
const product = (p: JewelPiece, position: number) => ({
  id: `p-${p.handle}`, handle: p.handle, title: p.name, price_label: p.priceLabel, image_url: null, variant_id: p.variantId, position,
});
const reel = {
  id: "reel-1", title: null, caption: null, video_path: "r.mp4", poster_path: null, sort_order: 0, published: true,
  videoUrl: "https://x/r.mp4", posterUrl: null,
  products: [product(cushion, 0), product(rose, 1)],
};
vi.mock("@/contexts/CartContext", () => ({ useCart: () => ({ addItem: vi.fn(), setDrawerOpen: vi.fn(), isLoading: false }) }));
vi.mock("@/hooks/useLiveJewellery", () => ({ useLiveJewellery: () => ({ jewellery: [cushion, rose], isLive: true }) }));
vi.mock("@/hooks/useReels", () => ({ useReels: () => ({ data: [reel], isLoading: false, isError: false, isSuccess: true, refetch: vi.fn() }), readStaleReelCache: () => null }));

import ReelShopNext from "./ReelShopNext";
import MobileReelShop from "./MobileReelShop";

class NoObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}

/* "Add" in the viewer's cards, "Add Cushion Halo Ring to bag" in the list. */
const ADD = /^Add( |$)/;
const rowOf = (name: string) => screen.getByText(name).closest("li, article") as HTMLElement;

describe("a reel row and its own ring's stock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("IntersectionObserver", NoObserver);
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  for (const [where, Shop] of [["the product page's reel list", ReelShopNext], ["the reel viewer's cards", MobileReelShop]] as const) {
    it(`changes only for the ring Shopify sold out, in ${where}`, () => {
      render(<MemoryRouter><Shop /></MemoryRouter>);
      act(() => void vi.advanceTimersByTime(700));

      const kept = within(rowOf("Cushion Halo Ring"));
      expect(kept.getByText("₹1,199")).toBeInTheDocument();
      expect(kept.getByRole("button", { name: ADD })).toBeInTheDocument();
      expect(kept.queryByText("Pre-order")).toBeNull();

      const soldOut = within(rowOf("Rose Verdant Band"));
      expect(soldOut.getByText("Pre-order")).toBeInTheDocument();
      expect(soldOut.getByRole("button", { name: "Reserve" })).toBeInTheDocument();
      expect(soldOut.queryByRole("button", { name: ADD })).toBeNull();
    });
  }
});
