import { afterEach, describe, expect, it, vi } from "vitest";
import { captureLandingUtm, resetLandingUtmForTest, sessionUtm, sessionUtmParams, withSessionUtm } from "./landingUtm";

afterEach(() => {
  vi.restoreAllMocks();
  resetLandingUtmForTest();
});

describe("the session's landing campaign", () => {
  it("keeps the first campaign the session landed with", () => {
    captureLandingUtm("?utm_source=facebook&utm_campaign=first&fbclid=x");
    captureLandingUtm("?utm_source=instagram&utm_campaign=second");
    expect(sessionUtm()).toEqual({ utm_source: "facebook", utm_campaign: "first" });
    expect(sessionUtmParams()).toBe("utm_source=facebook&utm_campaign=first");
  });

  it("notes nothing for a landing without a campaign, and takes a later one", () => {
    captureLandingUtm("?fbclid=x");
    expect(sessionUtmParams()).toBe("");
    captureLandingUtm("?utm_source=facebook");
    expect(sessionUtm()).toEqual({ utm_source: "facebook" });
  });

  it("still holds the campaign when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    captureLandingUtm("?utm_source=facebook&utm_medium=paid");
    expect(sessionUtmParams()).toBe("utm_source=facebook&utm_medium=paid");
  });

  it("puts the campaign on a checkout address, keeping its own query", () => {
    captureLandingUtm("?utm_source=facebook&utm_campaign=a b");
    const url = new URL(withSessionUtm("https://payments.nairaflore.com/checkouts/cn/T?key=K&discount=BUY2"));
    expect(Object.fromEntries(url.searchParams)).toEqual({ key: "K", discount: "BUY2", utm_source: "facebook", utm_campaign: "a b" });
  });

  it("leaves an address alone when there is no campaign or it has its own", () => {
    expect(withSessionUtm("https://x.test/c?key=K")).toBe("https://x.test/c?key=K");
    captureLandingUtm("?utm_source=facebook");
    expect(withSessionUtm("https://x.test/c?utm_source=email")).toBe("https://x.test/c?utm_source=email");
  });
});
