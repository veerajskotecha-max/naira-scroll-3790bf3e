import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import type { ReactNode } from "react";
import type { JewelPiece } from "@/data/jewellery";

const live = vi.hoisted(() => ({ jewellery: [] as JewelPiece[], isLive: true, isLoading: false }));
vi.mock("@/hooks/useLiveJewellery", () => ({ useLiveJewellery: () => live }));
vi.mock("@/lib/shopperPerformance", () => ({ reportShopperPerformance: () => undefined }));
vi.mock("@/components/Footer", () => ({ default: () => null }));
vi.mock("@/components/jewellery/RingAtelierBackdrop", () => ({ default: () => null }));
vi.mock("@/components/jewellery/JewelCard", () => ({ default: ({ piece }: { piece: JewelPiece }) => <a href={`/jewellery/${piece.handle}`}>{piece.name}</a> }));
vi.mock("@/components/wow/Reveal", () => ({
  default: ({ as: Tag = "div", children, className }: { as?: "div" | "section"; children: ReactNode; className?: string }) => <Tag className={className}>{children}</Tag>,
}));

import JewelleryCategory from "./JewelleryCategory";

afterEach(() => {
  cleanup();
  document.head.innerHTML = "";
});

const bracelet = {
  handle: "heartbead-bracelet", name: "Heartbead Bracelet", category: "Bracelets", tags: ["Charm"],
  blurb: "", materials: "", price: 1299, priceLabel: "₹1,299", image: "x.jpg", gallery: [], variantId: "v", sku: "", number: "01",
} as unknown as JewelPiece;

const open = (slug: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/jewellery/collections/${slug}`]}>
        <Routes>
          <Route path="/jewellery/collections/:slug" element={<JewelleryCategory />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
const robots = () => document.head.querySelector('meta[name="robots"]')?.getAttribute("content");

describe("an empty collection landing", () => {
  /* Evil Eye has no piece in Shopify. It served "index, follow" under copy
     describing metal-set evil-eye bracelets the shop does not sell. */
  it("says so, links the whole collection, drops its copy and asks not to be indexed", async () => {
    Object.assign(live, { jewellery: [bracelet], isLive: true, isLoading: false });
    open("evil-eye-bracelets");
    expect(screen.getByText(/Nothing in this collection right now/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /View all jewellery/i })).toHaveAttribute("href", "/jewellery");
    expect(document.body.textContent).not.toMatch(/set the motif in metal/);
    expect(screen.queryByText(/Questions we get asked/)).toBeNull();
    await waitFor(() => expect(robots()).toBe("noindex, follow"));
  });

  it("leaves empty collections out of its links to other collections", () => {
    Object.assign(live, { jewellery: [bracelet], isLive: true, isLoading: false });
    open("charm-bracelets");
    const others = screen.getByRole("navigation", { name: "Other jewellery collections" });
    expect(others.querySelector('a[href="/jewellery/collections/evil-eye-bracelets"]')).toBeNull();
    expect(others.querySelector('a[href="/jewellery/collections/bracelets"]')).not.toBeNull();
  });

  /* The bundled first paint holds 21 pieces and no charm bracelet; until
     Shopify answers the page must not call a stocked collection empty. */
  it("does not judge a collection before the live catalogue arrives", async () => {
    Object.assign(live, { jewellery: [], isLive: false, isLoading: true });
    open("charm-bracelets");
    expect(screen.queryByText(/Nothing in this collection right now/)).toBeNull();
    expect(screen.getByText(/Questions we get asked/)).toBeTruthy();
    await waitFor(() => expect(robots()).toBe("index, follow, max-image-preview:large"));
  });

  it("keeps a stocked collection indexed with its copy", async () => {
    Object.assign(live, { jewellery: [bracelet], isLive: true, isLoading: false });
    open("charm-bracelets");
    expect(screen.getByText("Heartbead Bracelet")).toBeTruthy();
    expect(screen.getByText(/Questions we get asked/)).toBeTruthy();
    await waitFor(() => expect(robots()).toBe("index, follow, max-image-preview:large"));
  });
});
