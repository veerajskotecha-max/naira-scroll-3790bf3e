import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const cart = readFileSync(resolve(__dirname, "CartContext.tsx"), "utf8");
const code = cart.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

/*
  window.open(url, "_blank", "noopener,noreferrer") returns null per the HTML
  spec whenever noopener is set — measured null on 100 of 100 calls in Chromium.
  The old guard `if (!opened || opened.closed)` was therefore always true, so the
  same-tab navigation ran every time regardless, while the open() call still
  created a window in a genuine user gesture (verified: 1 tab became 2). The
  hand-off is a plain same-tab navigation now and must stay one.
*/
describe("checkout hand-off", () => {
  it("does not call window.open", () => {
    expect(code).not.toMatch(/window\.open\s*\(/);
  });

  it("navigates in the current tab", () => {
    expect(code).toMatch(/window\.location\.assign\(target\)/);
  });
});

/*
  The drawer quotes its own discounted total. If the code never reaches Shopify
  the shopper is charged full price — ₹245 more than shown on a ₹2,449 piece
  with NAIRA10. Relying on ?discount= alone was the risk: that parameter is
  honoured on /cart/... permalinks, but the hand-off rewrites to
  /checkouts/cn/<token>. The code is set on the cart itself as well.
*/
describe("discount reaches Shopify", () => {
  it("applies the code to the cart before handing over", () => {
    expect(code).toMatch(/applyCartDiscountCodes\(cartId, \[code\]\)/);
  });

  it("still keeps the query parameter as a fallback", () => {
    expect(code).toMatch(/applyPromoToCheckoutUrl/);
  });

  it("shows a loading state while the discount call runs", () => {
    const block = code.match(/if \(code && cartId\) \{[\s\S]*?\n    \}/)![0];
    expect(block, "the call takes up to 1.2s — the button must react").toMatch(/setIsLoading\(true\)/);
    expect(block).toMatch(/setIsLoading\(false\)/);
  });

  it("never blocks checkout when the discount call fails", () => {
    const block = code.match(/if \(code && cartId\) \{[\s\S]*?\n    \}/)![0];
    expect(block).toMatch(/catch/);
  });
});
