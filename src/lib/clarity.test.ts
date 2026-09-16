import { beforeEach, describe, expect, it, vi } from "vitest";
import { campaignTags, parseFbclid, resetClarityForTest, setClarityTag } from "./clarity";

describe("parseFbclid", () => {
  it("pulls the click id out of Meta's _fbc cookie", () => {
    expect(parseFbclid("fb.1.1789518734099.IwAR3xk")).toBe("IwAR3xk");
  });

  it("keeps a click id that itself contains dots", () => {
    // Real fbclid values are not guaranteed dot-free, so everything past the
    // third segment belongs to the click id.
    expect(parseFbclid("fb.1.1789518734099.IwAR3.xk.9")).toBe("IwAR3.xk.9");
  });

  it("returns undefined for a malformed or missing cookie", () => {
    expect(parseFbclid("fb.1.1789518734099")).toBeUndefined();
    expect(parseFbclid("garbage")).toBeUndefined();
    expect(parseFbclid("")).toBeUndefined();
    expect(parseFbclid(null)).toBeUndefined();
    expect(parseFbclid(undefined)).toBeUndefined();
  });
});

describe("campaignTags", () => {
  it("picks up the utm parameters that are present", () => {
    expect(campaignTags("?utm_source=ig&utm_campaign=diwali_rings&utm_medium=paid")).toEqual({
      utm_source: "ig",
      utm_campaign: "diwali_rings",
      utm_medium: "paid",
    });
  });

  it("ignores unrelated and empty parameters", () => {
    expect(campaignTags("?fbclid=abc&utm_source=&page=2")).toEqual({});
    expect(campaignTags("")).toEqual({});
    expect(campaignTags(undefined)).toEqual({});
  });
});

describe("setClarityTag", () => {
  beforeEach(() => {
    resetClarityForTest();
    delete (window as { clarity?: unknown }).clarity;
    vi.useRealTimers();
  });

  it("forwards a tag to Clarity when it is loaded", () => {
    const clarity = vi.fn();
    (window as { clarity?: unknown }).clarity = clarity;
    setClarityTag("utm_campaign", "diwali_rings");
    expect(clarity).toHaveBeenCalledWith("set", "utm_campaign", "diwali_rings");
  });

  it("holds tags set before Clarity loads, then replays them", () => {
    vi.useFakeTimers();
    // Snippet not installed yet — this must not throw and must not be lost.
    setClarityTag("meta_vid", "abc-123");

    const clarity = vi.fn();
    (window as { clarity?: unknown }).clarity = clarity;
    vi.advanceTimersByTime(600);

    expect(clarity).toHaveBeenCalledWith("set", "meta_vid", "abc-123");
    vi.useRealTimers();
  });

  it("never throws when Clarity is absent", () => {
    expect(() => setClarityTag("meta_vid", "abc-123")).not.toThrow();
  });

  it("skips empty values rather than tagging a blank", () => {
    const clarity = vi.fn();
    (window as { clarity?: unknown }).clarity = clarity;
    setClarityTag("fbclid", undefined);
    setClarityTag("fbclid", "   ");
    setClarityTag("", "x");
    expect(clarity).not.toHaveBeenCalled();
  });
});
