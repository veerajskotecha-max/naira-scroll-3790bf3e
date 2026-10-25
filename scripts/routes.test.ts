import { describe, expect, it } from "vitest";
import { siteRoutes } from "./routes";

describe("discoverable pages", () => {
  it("keeps About Us out of published page lists while it is withdrawn", () => {
    // Editing only sitemap.xml let regeneration restore the withdrawn page.
    expect(siteRoutes.some(({ path }) => path === "/about")).toBe(false);
    expect(siteRoutes.some(({ path }) => path === "/customize")).toBe(true);
  });
});