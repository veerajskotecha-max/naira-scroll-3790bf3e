import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jewellery } from "@/data/jewellery";
import { jewellerySnapshot } from "@/data/jewellerySnapshot";
import type { JewelPiece, JewelVariant } from "@/data/jewellery";
import { colourOfVariant } from "@/lib/colourCards";
import { linkPlaced } from "@/lib/viewContent";

const { track } = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("@/lib/pixel", async (importActual) => ({ ...(await importActual<typeof import("@/lib/pixel")>()), trackPixel: track }));

import { useViewContent, VIEW_WAIT_MS } from "./useViewContent";

/*
  Star Point Band is hand-authored in jewellery.ts with no colours or sizes, and
  it is not in the snapshot. Its Silver catalogue ad
  (?utm_source=facebook&variant=50652105605282&fbclid=…) and Silver card link
  (?colour=silver) opened on Silver / US 6 once Shopify answered, and the Add to
  cart sent 50652105605282, but ViewContent had already gone out at first paint
  naming Gold / US 6 (47501788774562, value 999), in the browser and the server
  copy alike (reviewer, built site, iPhone 13 and Pixel 7).
*/
/* The first-paint view carries the bundled price, whatever the last price
   refresh wrote there (999 when this was written, 799 since 30 Oct's). */
const bundled = jewellery.find((p) => p.handle === "star-point-band")!;
const gid = (n: string) => `gid://shopify/ProductVariant/${n}`;
/* Shopify's listing, read-only Storefront query, 31 Oct 2026: Gold and Silver,
   US 5–8, every one ₹799 (MRP ₹1,500) and in stock. */
const SHOPIFY: Array<[string, string, string]> = [
  ["50709664333986", "Gold", "5"], ["47501788774562", "Gold", "6"], ["50709664366754", "Gold", "7"], ["50709664399522", "Gold", "8"],
  ["50709664432290", "Silver", "5"], ["50652105605282", "Silver", "6"], ["50709664465058", "Silver", "7"], ["50709664497826", "Silver", "8"],
];
const variants: JewelVariant[] = SHOPIFY.map(([id, metal, size]) => ({
  id: gid(id), title: `${metal} / ${size}`, availableForSale: true, price: 799, compareAtPrice: 1500, options: { Metal: metal, Size: size },
}));
/* The piece once Shopify has answered: its lead is the first buyable variant. */
const live: JewelPiece = {
  ...bundled, price: 799, priceLabel: "₹799", compareAtPrice: 1500, variantId: gid("50709664333986"),
  options: [{ name: "Metal", values: ["Gold", "Silver"] }, { name: "Size", values: ["5", "6", "7", "8"] }], variants,
};

/* As the page reads its link (JewelDetailNext): ?colour= first, else the ad's ?variant=. */
const colourOf = (piece: JewelPiece, search: string) => {
  const q = new URLSearchParams(search);
  return q.get("colour") ?? colourOfVariant(piece, q.get("variant"))?.toLowerCase() ?? null;
};
type Props = { piece: JewelPiece | null; search: string; settled: boolean };
const page = (initial: Props) =>
  renderHook(
    ({ piece, search, settled }: Props) =>
      useViewContent(piece, piece ? colourOf(piece, search) : null, Boolean(piece && linkPlaced(piece, new URLSearchParams(search))), settled),
    { initialProps: initial },
  );
const views = () => track.mock.calls.filter(([event]) => event === "ViewContent").map(([, params]) => [params.content_ids[0], params.value]);

beforeEach(() => {
  track.mockClear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("Star Point Band's Silver links, landed on cold", () => {
  it.each([
    ["the Silver catalogue ad", "?utm_source=facebook&variant=50652105605282&fbclid=x"],
    ["the Silver variant link", "?variant=50652105605282"],
    ["the Silver card link", "?colour=silver"],
  ])("%s names Silver / US 6 once Shopify answers, once", (_link, search) => {
    const { rerender } = page({ piece: bundled, search, settled: false });
    expect(views()).toEqual([]);
    rerender({ piece: live, search, settled: true });
    expect(views()).toEqual([["50652105605282", 799]]);
    vi.advanceTimersByTime(VIEW_WAIT_MS * 2);
    rerender({ piece: { ...live }, search, settled: true });
    expect(views()).toEqual([["50652105605282", 799]]);
  });

  it("sends the first-paint view after the wait if Shopify does not answer", () => {
    page({ piece: bundled, search: "?variant=50652105605282", settled: false });
    vi.advanceTimersByTime(VIEW_WAIT_MS - 1);
    expect(views()).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(views()).toEqual([["47501788774562", bundled.price]]);
  });

  it("sends at once when the shopper leaves or hides the page first, and only once", () => {
    page({ piece: bundled, search: "?colour=silver", settled: false });
    window.dispatchEvent(new Event("pagehide"));
    vi.advanceTimersByTime(VIEW_WAIT_MS);
    expect(views()).toEqual([["47501788774562", bundled.price]]);

    track.mockClear();
    page({ piece: bundled, search: "?colour=silver", settled: false });
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
    expect(views()).toEqual([["47501788774562", bundled.price]]);
  });

  it("still counts the view when the shopper moves to another piece or page before Shopify answers", () => {
    const other = jewellerySnapshot.find((p) => p.handle === "triple-coil-wrap-bangle")!;
    const { rerender, unmount } = page({ piece: bundled, search: "?colour=silver", settled: false });
    rerender({ piece: other, search: "", settled: false });
    expect(views()).toEqual([["47501788774562", bundled.price], ["50651931639970", other.price]]);

    track.mockClear();
    const second = page({ piece: bundled, search: "?colour=silver", settled: false });
    second.unmount();
    unmount();
    expect(views()).toEqual([["47501788774562", bundled.price]]);
  });

  it("does not wait once Shopify has answered (a tap on the shop's Silver card)", () => {
    page({ piece: live, search: "?colour=silver", settled: true });
    expect(views()).toEqual([["50652105605282", 799]]);
  });
});

describe("links the piece as first drawn can place go out at first paint, as before", () => {
  const snap = (handle: string) => jewellerySnapshot.find((p) => p.handle === handle)!;
  const authored = (handle: string) => jewellery.find((p) => p.handle === handle)!;
  it.each([
    ["Star Point Band, plain", authored("star-point-band"), "", "47501788774562"],
    ["Star Point Band's own lead (Gold / 6)", authored("star-point-band"), "?variant=47501788774562", "47501788774562"],
    ["a one-way piece's catalogue ad", authored("heartline-paperclip-necklace"), "?utm_source=facebook&variant=47501786513570", "47501786513570"],
    ["the Silver Triple Coil ad", snap("triple-coil-wrap-bangle"), "?utm_source=facebook&variant=50651931672738&fbclid=x", "50651931672738"],
    ["the Emerald tennis card", snap("baguette-tennis-bracelet"), "?colour=emerald", "50651931803810"],
  ])("%s", (_link, piece, search, id) => {
    page({ piece, search, settled: false });
    expect(views().map(([sent]) => sent)).toEqual([id]);
  });
});

describe("linkPlaced", () => {
  const placed = (piece: JewelPiece, search: string) => linkPlaced(piece, new URLSearchParams(search));
  const coil = jewellerySnapshot.find((p) => p.handle === "triple-coil-wrap-bangle")!;
  it("cannot place a colour or another variant on a piece drawn without its variants", () => {
    expect(placed(bundled, "?colour=silver")).toBe(false);
    expect(placed(bundled, "?colour=gold")).toBe(false);
    expect(placed(bundled, "?variant=50652105605282")).toBe(false);
  });
  it("places a plain link, the piece's own lead, and anything once its variants are in", () => {
    expect(placed(bundled, "")).toBe(true);
    expect(placed(bundled, "?utm_source=facebook&fbclid=x")).toBe(true);
    expect(placed(bundled, "?variant=47501788774562")).toBe(true);
    expect(placed(live, "?colour=silver")).toBe(true);
    expect(placed(live, "?variant=50709664465058")).toBe(true);
  });
  it("reads ?colour= ahead of ?variant=, as the page does, and ignores what names nothing", () => {
    expect(placed(coil, "?colour=silver&variant=1")).toBe(true);
    expect(placed(coil, "?colour=&variant=1")).toBe(true);
    expect(placed(coil, "?variant=abc")).toBe(true);
    expect(placed(coil, "?colour=rose")).toBe(false);
    expect(placed(coil, "?variant=999")).toBe(false);
  });
});
