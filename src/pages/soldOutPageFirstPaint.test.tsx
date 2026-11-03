import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
  A product page reached inside the site, before the live catalogue answers,
  is drawn from the bundled pieces (audit C25). Those carry Shopify's stock as
  read on 30 Oct, so the five pieces Shopify had sold out get the page every
  sold-out piece gets once the catalogue arrives: only "Reserve now" (the
  WhatsApp pre-order), the two-week lead, and OutOfStock for Google. Before,
  Molten Bloom Hoops offered Add to cart and Buy Now at ₹2,949, and Buy Now
  told Meta of an Add to cart and a checkout start and handed Shiprocket the
  piece at quantity 0. Nothing here reaches Shopify, Meta or WhatsApp.
*/
const mocks = vi.hoisted(() => ({ addItem: vi.fn(), buyNow: vi.fn(), track: vi.fn(), open: vi.fn() }));
vi.mock("@/lib/shopify", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/shopify")>()),
  /* The catalogue has not answered yet. */
  fetchShopifyProducts: () => new Promise(() => {}),
  fetchShopifyProductByHandle: () => new Promise(() => {}),
}));
vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ addItem: mocks.addItem, buyNow: mocks.buyNow, setDrawerOpen: vi.fn(), isDrawerOpen: false, isLoading: false, items: [] }),
}));
vi.mock("@/contexts/WishlistContext", () => ({ useWishlist: () => ({ toggleItem: vi.fn(), isWishlisted: () => false }) }));
vi.mock("@/hooks/useReels", () => ({ useReels: () => ({ data: [] }), reelForPiece: () => null }));
vi.mock("@/lib/pixel", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/pixel")>()), trackPixel: mocks.track }));
vi.mock("@/lib/shopperPerformance", () => ({ reportShopperPerformance: vi.fn() }));
vi.mock("@/components/Footer", () => ({ default: () => null }));
vi.mock("@/components/product/PincodeChecker", () => ({ default: () => null }));
vi.mock("@/components/CustomerReviews", () => ({ default: () => null }));
vi.mock("@/components/FomoPopup", () => ({ default: () => null }));
vi.mock("@/components/reels/ReelShopNext", () => ({ default: () => null }));
vi.mock("@/components/reels/GalleryReel", () => ({ default: () => null }));

import JewelDetailNext from "./JewelDetailNext";

class NoObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

const SOLD_OUT_30_OCT = [
  ["molten-bloom-hoops", "Molten Bloom Hoops", "₹1,300"],
  ["riviere-eternal-necklace", "Rivière Eternal Necklace", "₹1,799"],
  ["solitaire-whisper-studs", "Solitaire Whisper Studs", "₹1,099"],
  ["riviere-of-light-bracelet", "Rivière of Light Bracelet", "₹1,249"],
  ["first-light-set", "First Light Set", "₹1,199"],
] as const;

const openPage = (handle: string) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <HelmetProvider>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[`/jewellery/${handle}`]}>
          <Routes>
            <Route path="/jewellery/:handle" element={<JewelDetailNext />} />
            <Route path="/jewellery" element={<p>listing</p>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );
};
const actions = () => [...document.querySelectorAll("#product-actions button")].map((b) => b.textContent?.trim());
const sentToMeta = () => mocks.track.mock.calls.map(([event, params]) => ({ event, value: params?.value }));

describe("a sold-out piece's product page before the catalogue arrives", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", NoObserver);
    vi.stubGlobal("ResizeObserver", NoObserver);
    vi.stubGlobal("open", mocks.open);
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    Object.values(mocks).forEach((m) => m.mockClear());
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("offers only Reserve now on Molten Bloom Hoops, which opens the WhatsApp pre-order and sends nothing to the bag or checkout", async () => {
    openPage("molten-bloom-hoops");
    await screen.findByRole("heading", { level: 1, name: /Molten Bloom Hoops/ });
    expect(actions()).toEqual(["Reserve now"]);
    expect(screen.queryByRole("button", { name: /Buy Now/i })).toBeNull();
    expect(document.querySelector("#product-price")?.textContent).toMatch(/₹1,300.*₹2,359/);
    expect(document.querySelector("#product-actions")?.textContent).toMatch(/Hand-finished for you and shipped within 2 weeks, gift-boxed/);
    const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? "").join(" ");
    expect(ld).toMatch(/schema\.org\/OutOfStock/);
    expect(ld).not.toMatch(/schema\.org\/InStock/);

    await act(async () => void fireEvent.click(screen.getByRole("button", { name: "Reserve now" })));
    expect(mocks.open).toHaveBeenCalledTimes(1);
    const [url] = mocks.open.mock.calls[0];
    expect(url).toMatch(/^https:\/\/wa\.me\//);
    expect(decodeURIComponent(url)).toContain('pre-order the "Molten Bloom Hoops" (₹1,300)');
    expect(mocks.addItem).not.toHaveBeenCalled();
    expect(mocks.buyNow).not.toHaveBeenCalled();
    expect(sentToMeta()).toEqual([{ event: "ViewContent", value: 1300 }]);
  });

  for (const [handle, name, price] of SOLD_OUT_30_OCT.slice(1)) {
    it(`offers only Reserve now on ${name}`, async () => {
      openPage(handle);
      await screen.findByRole("heading", { level: 1, name: new RegExp(name) });
      expect(actions()).toEqual(["Reserve now"]);
      expect(document.querySelector("#product-price")?.textContent).toContain(price);
    });
  }
});
