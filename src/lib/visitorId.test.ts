import { beforeEach, describe, expect, it, vi } from "vitest";
import { getVisitorId, resetVisitorIdCache, VISITOR_COOKIE } from "./visitorId";

/**
 * `external_id` is the only match key a logged-out shopper has, and the browser
 * copy of an event only joins its server twin when both carry the SAME one.
 * These tests pin the two ways that used to break.
 */
describe("getVisitorId", () => {
  beforeEach(() => {
    resetVisitorIdCache();
    delete (window as { __nairaVid?: string }).__nairaVid;
    // Clear any cookie a previous test wrote.
    document.cookie = `${VISITOR_COOKIE}=; path=/; max-age=0`;
  });

  it("prefers the id the pixel was initialised with", () => {
    document.cookie = `${VISITOR_COOKIE}=from-cookie; path=/`;
    (window as { __nairaVid?: string }).__nairaVid = "from-snippet";
    expect(getVisitorId()).toBe("from-snippet");
  });

  it("falls back to the cookie when the snippet left nothing", () => {
    document.cookie = `${VISITOR_COOKIE}=from-cookie; path=/`;
    expect(getVisitorId()).toBe("from-cookie");
  });

  it("returns the SAME id on every call when cookies cannot be written", () => {
    // A browser that refuses the write: reads always come back empty.
    const jar = vi.spyOn(document, "cookie", "get").mockReturnValue("");
    try {
      const first = getVisitorId();
      const second = getVisitorId();
      const third = getVisitorId();
      expect(first).toBeTruthy();
      // Previously each call minted a fresh id, so every event went out under a
      // different external_id and no server copy matched its browser twin.
      expect(second).toBe(first);
      expect(third).toBe(first);
    } finally {
      jar.mockRestore();
    }
  });

  it("persists a newly minted id to the cookie", () => {
    const minted = getVisitorId();
    expect(minted).toBeTruthy();
    expect(document.cookie).toContain(`${VISITOR_COOKIE}=${minted}`);
  });
});
