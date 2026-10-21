import { render, act, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import ShopperPerformance from "./ShopperPerformance";
const report = vi.hoisted(() => vi.fn());
vi.mock("@/lib/shopperPerformance", () => ({
  productionShop: () => true, safePerformancePath: (p: string) => p,
  initPerformanceLanding: vi.fn(), reportShopperPerformance: report,
}));
afterEach(() => { cleanup(); vi.useRealTimers(); report.mockClear(); });
describe("shopper timing observer", () => {
  it("reports a route that never becomes ready after 15 seconds", () => {
    vi.useFakeTimers();
    render(<MemoryRouter initialEntries={["/jewellery/broken"]}><ShopperPerformance /></MemoryRouter>);
    act(() => vi.advanceTimersByTime(15000));
    expect(report).toHaveBeenCalledWith("route_timeout", { path: "/jewellery/broken" });
  });
  it("reports one readiness sample without blocking the page", () => {
    vi.useFakeTimers();
    const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ height: 30 } as DOMRect);
    render(<MemoryRouter initialEntries={["/jewellery/woven-gold-hoops"]}><h1>Woven Gold Hoops</h1><ShopperPerformance /></MemoryRouter>);
    act(() => vi.advanceTimersByTime(16000));
    expect(report).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenCalledWith("timing", expect.objectContaining({ path: "/jewellery/woven-gold-hoops", navigation: "document", ready_ms: expect.any(Number) }));
    rect.mockRestore();
  });
});