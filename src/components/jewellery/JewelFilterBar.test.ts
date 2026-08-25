import { describe, it, expect } from "vitest";
import { applyJewelFilters, emptyFilters } from "./JewelFilterBar";
import { SHIPPING_CHARGE } from "@/lib/serviceability";
import type { JewelPiece } from "@/data/jewellery";

const piece = (handle: string, price: number, availableForSale: boolean): JewelPiece =>
  ({ handle, name: handle, price, availableForSale, category: "Rings", tags: [] }) as unknown as JewelPiece;

/* A zero-inventory necklace used to sit first on /jewellery, so the first thing
   a shopper could click was something they could not buy. */
describe("sold-out pieces never lead the grid", () => {
  const pieces = [
    piece("sold-out-cheap", 100, false),
    piece("live-mid", 500, true),
    piece("live-cheap", 200, true),
  ];

  it.each(["featured", "best", "newest", "price-asc", "price-desc"] as const)(
    "sinks sold-out pieces under the %s sort",
    (sort) => {
      const out = applyJewelFilters(pieces, { ...emptyFilters, sort });
      expect(out.at(-1)?.handle).toBe("sold-out-cheap");
      expect(out.every((p) => p.availableForSale !== false || p === out.at(-1))).toBe(true);
    }
  );

  it("keeps the chosen order inside the in-stock group", () => {
    const out = applyJewelFilters(pieces, { ...emptyFilters, sort: "price-asc" });
    expect(out.map((p) => p.handle)).toEqual(["live-cheap", "live-mid", "sold-out-cheap"]);
  });
});

/* Shopify's General profile charges a flat ₹150 domestic rate with no free
   threshold. Every shipping figure on the site reads from this one constant, so
   the page can never promise something checkout won't honour. */
describe("shipping charge", () => {
  it("matches the flat rate configured in Shopify", () => {
    expect(SHIPPING_CHARGE).toBe(150);
  });
});
