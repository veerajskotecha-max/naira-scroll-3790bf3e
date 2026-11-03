import { afterEach, describe, expect, it, vi } from "vitest";
import { campaignLabels, eventId, isSlowPage, productionShop, reportShopperPerformance, safePerformancePath } from "./shopperPerformance";
describe("private shopper performance signals", () => {
  it("excludes preview hosts", () => {
    expect(productionShop("nairaflore.com")).toBe(true);
    expect(productionShop("nairaflore.com.preview.app")).toBe(false);
    expect(productionShop("localhost")).toBe(false);
  });
  it("never captures customer order or checkout tokens", () => {
    expect(safePerformancePath("/68096065698/orders/private-token")).toBeNull();
    expect(safePerformancePath("/cart/c/private-token")).toBeNull();
    expect(safePerformancePath("/account")).toBeNull();
    expect(safePerformancePath("/jewellery/woven-gold-hoops")).toBe("/jewellery/woven-gold-hoops");
  });
  it("keeps campaign labels without click identifiers or email", () => {
    expect(campaignLabels("?utm_campaign=October&utm_source=instagram&fbclid=secret")).toEqual({ campaign: "October", source: "instagram" });
    expect(campaignLabels("?utm_campaign=person@example.com").campaign).toBe("");
  });
  it("flags slow readiness or poor document LCP", () => {
    expect(isSlowPage({ ready_p75: 3000, lcp_p75: 4000 })).toBe(false);
    expect(isSlowPage({ ready_p75: 3001, lcp_p75: null })).toBe(true);
    expect(isSlowPage({ ready_p75: 1000, lcp_p75: 4001 })).toBe(true);
  });
});
/* Without crypto.randomUUID (Safari before 15.4, Chrome before 92) the report
   threw inside a page's effect, and the error panel replaced the whole shop on
   the first tap. The id must still pass the function's z.string().uuid(). */
describe("shopper performance on older browsers", () => {
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  const realLocation = window.location;
  afterEach(() => {
    delete (crypto as { randomUUID?: unknown }).randomUUID; // the own copy hid the real one
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Object.defineProperty(window, "location", { value: realLocation, configurable: true, writable: true });
  });
  const onTheShop = () =>
    Object.defineProperty(window, "location", {
      value: { ...realLocation, hostname: "nairaflore.com", pathname: "/jewellery/woven-gold-hoops", search: "" },
      configurable: true, writable: true,
    });

  it("reports with a valid id when randomUUID is missing", () => {
    Object.defineProperty(crypto, "randomUUID", { value: undefined, configurable: true });
    const random = vi.spyOn(crypto, "getRandomValues");
    expect(eventId()).toMatch(UUID);
    expect(random).toHaveBeenCalled();
    onTheShop();
    const send = vi.fn(() => Promise.resolve(new Response()));
    vi.stubGlobal("fetch", send);
    expect(() => reportShopperPerformance("unknown_page")).not.toThrow();
    expect(send).toHaveBeenCalledTimes(1);
    expect(JSON.parse((send.mock.calls[0] as unknown as [string, RequestInit])[1].body as string).id).toMatch(UUID);
  });

  it("never throws, whatever the browser lacks", () => {
    onTheShop();
    vi.stubGlobal("fetch", () => { throw new TypeError("fetch is not a function"); });
    expect(() => reportShopperPerformance("unknown_page")).not.toThrow();
  });
});
