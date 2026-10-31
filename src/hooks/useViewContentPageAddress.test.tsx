import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jewellery } from "@/data/jewellery";
import { jewellerySnapshot } from "@/data/jewellerySnapshot";
import type { JewelPiece } from "@/data/jewellery";
import { colourOfVariant } from "@/lib/colourCards";
import { linkPlaced } from "@/lib/viewContent";
import { useViewContent, VIEW_WAIT_MS } from "./useViewContent";

/*
  A product view the piece as first drawn cannot place waits for Shopify (Star
  Point Band's Silver ad, opened without its pre-drawn copy). A shopper who taps
  through to another page of the shop during that wait has the view sent at that
  moment, but its server copy read the address bar at send time, so Meta was
  told the view happened on the new page. Checker, built site served as
  nairaflore.com, Shopify held 6 s, iPhone 13 and Pixel 7: landing on
  /jewellery/star-point-band?utm_source=facebook&utm_medium=paid&variant=50652105605282&fbclid=FINleave
  and tapping /jewellery/woven-gold-hoops at 1.2 s sent ViewContent
  47501788774562 / 999 with event_source_url
  https://nairaflore.com/jewellery/woven-gold-hoops. Before the fixup that view
  went out at first paint with its own address.

  This drives the real trackPixel and reads the relay post, as Meta would.
*/
const fetchMock = vi.fn((..._args: unknown[]) => Promise.resolve(new Response("{}")));
const relayViews = () =>
  fetchMock.mock.calls
    .filter(([url]) => String(url).endsWith("/functions/v1/meta-capi"))
    .map(([, init]) => JSON.parse(String((init as RequestInit).body)))
    .filter((body) => body.event_name === "ViewContent")
    .map((body) => ({ id: body.custom_data.content_ids[0], page: body.event_source_url, eventId: body.event_id }));
const browserViews = () =>
  (window.fbq as ReturnType<typeof vi.fn>).mock.calls
    .filter(([, event]) => event === "ViewContent")
    .map(([, , params, options]) => ({ id: params.content_ids[0], eventId: options.eventID }));

const starPointBand = jewellery.find((p) => p.handle === "star-point-band")!;
const at = (path: string) => `${window.location.origin}${path}`;
const AD = "/jewellery/star-point-band?utm_source=facebook&utm_medium=paid&variant=50652105605282&fbclid=FINleave";

/* As the page reads its link (JewelDetailNext): ?colour= first, else the ad's ?variant=. */
const view = (piece: JewelPiece) => {
  const q = new URLSearchParams(window.location.search);
  const colour = q.get("colour") ?? colourOfVariant(piece, q.get("variant"))?.toLowerCase() ?? null;
  return [piece, colour, linkPlaced(piece, q)] as const;
};
type Props = { piece: JewelPiece; settled: boolean };
const page = (initial: Props) =>
  renderHook(({ piece, settled }: Props) => useViewContent(...view(piece), settled), { initialProps: initial });

beforeEach(() => {
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
  window.fbq = vi.fn();
  window.__nairaProd = true;
  vi.useFakeTimers();
  window.history.replaceState({}, "", AD);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete window.__nairaProd;
  delete window.fbq;
  window.history.replaceState({}, "", "/");
});

describe("a held product view's server copy names the page it was opened on", () => {
  it.each([
    ["a tap on Woven Gold Hoops", jewellery.find((p) => p.handle === "woven-gold-hoops")!, "47501786906786"],
    ["an in-app move to Prism Rivière Bracelet", jewellerySnapshot.find((p) => p.handle === "prism-riviere-bracelet")!, "47501788348578"],
  ])("when the shopper moves to another piece before Shopify answers (%s)", (_move, other, otherId) => {
    const { rerender } = page({ piece: starPointBand, settled: false });
    expect(linkPlaced(starPointBand, new URLSearchParams(window.location.search))).toBe(false);
    expect(relayViews()).toEqual([]);

    window.history.pushState({}, "", `/jewellery/${other.handle}`);
    rerender({ piece: other, settled: false });

    const sent = relayViews();
    expect(sent.map(({ id, page: where }) => [id, where])).toEqual([
      ["47501788774562", at(AD)],
      [otherId, at(`/jewellery/${other.handle}`)],
    ]);
    // Still one view per piece, and each server copy pairs with its browser copy.
    expect(browserViews().map(({ id }) => id)).toEqual(["47501788774562", otherId]);
    expect(sent.map(({ eventId }) => eventId)).toEqual(browserViews().map(({ eventId }) => eventId));
  });

  it("when the shopper moves to a page that is not a piece before Shopify answers", () => {
    const { unmount } = page({ piece: starPointBand, settled: false });
    window.history.pushState({}, "", "/jewellery");
    unmount();
    expect(relayViews().map(({ id, page: where }) => [id, where])).toEqual([["47501788774562", at(AD)]]);
  });

  it("when Shopify answers, or the wait runs out, on the piece's own page", () => {
    const answered = page({ piece: starPointBand, settled: false });
    answered.rerender({ piece: starPointBand, settled: true });
    answered.unmount();
    window.history.replaceState({}, "", AD);
    page({ piece: starPointBand, settled: false });
    vi.advanceTimersByTime(VIEW_WAIT_MS);
    expect(relayViews().map(({ page: where }) => where)).toEqual([at(AD), at(AD)]);
  });

  it("for a view sent at first paint, as before", () => {
    window.history.replaceState({}, "", "/jewellery/star-point-band");
    const { rerender } = page({ piece: starPointBand, settled: false });
    window.history.pushState({}, "", "/jewellery/woven-gold-hoops");
    rerender({ piece: jewellery.find((p) => p.handle === "woven-gold-hoops")!, settled: false });
    expect(relayViews().map(({ id, page: where }) => [id, where])).toEqual([
      ["47501788774562", at("/jewellery/star-point-band")],
      ["47501786906786", at("/jewellery/woven-gold-hoops")],
    ]);
  });
});
