import { describe, expect, it } from "vitest";
import { campaignLabels, isSlowPage, productionShop, safePerformancePath } from "./shopperPerformance";
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