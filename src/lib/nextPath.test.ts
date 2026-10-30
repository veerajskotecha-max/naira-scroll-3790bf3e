import { describe, expect, it } from "vitest";
import { safeNextPath } from "./nextPath";

/* A crafted /auth?next=/\host crashed a signed-in member into the error panel:
   the old check let it through and the browser read it as another site. */
const ORIGIN = "https://nairaflore.com";

describe("safeNextPath", () => {
  it("keeps a page on this site, query and fragment included", () => {
    expect(safeNextPath("/account", ORIGIN)).toBe("/account");
    expect(safeNextPath("/account?tab=orders#recent", ORIGIN)).toBe("/account?tab=orders#recent");
    expect(safeNextPath("/.lovable/oauth/consent?authorization_id=abc-123", ORIGIN)).toBe(
      "/.lovable/oauth/consent?authorization_id=abc-123",
    );
  });

  it.each(["/\\evil.example", "/\\evil.example/x?y=1", "/\t/evil.example", "//evil.example", "/\\\\evil.example"])(
    "refuses %j, which the browser reads as another site",
    (raw) => {
      expect(safeNextPath(raw, ORIGIN)).toBe("/account");
    },
  );

  it("refuses anything that is not a path", () => {
    expect(safeNextPath("", ORIGIN)).toBe("/account");
    expect(safeNextPath("https://evil.example/", ORIGIN)).toBe("/account");
    expect(safeNextPath("javascript:alert(1)", ORIGIN)).toBe("/account");
  });
});
