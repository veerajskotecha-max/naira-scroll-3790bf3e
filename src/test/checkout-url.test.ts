import { describe, expect, it } from "vitest";

import { CHECKOUT_DOMAIN, formatCheckoutUrl } from "@/lib/shopify";

// Shopify hands back a cart permalink on the store's primary domain. The key
// query param is not decoration — checkout rejects the token without it.
const SHOPIFY_URL =
  "https://www.nairaflore.com/cart/c/hWNFOlrnzQwOvbTWcteXtE2s?key=IAsthlWKA3wBxoN8XUO9";

describe("formatCheckoutUrl", () => {
  it("moves checkout onto the configured checkout domain", () => {
    expect(new URL(formatCheckoutUrl(SHOPIFY_URL)).host).toBe(CHECKOUT_DOMAIN);
  });

  it("keeps the key, without which the checkout token is refused", () => {
    const url = new URL(formatCheckoutUrl(SHOPIFY_URL));
    expect(url.searchParams.get("key")).toBe("IAsthlWKA3wBxoN8XUO9");
  });

  it("tags the sale to the online store channel", () => {
    const url = new URL(formatCheckoutUrl(SHOPIFY_URL));
    expect(url.searchParams.get("channel")).toBe("online_store");
  });

  it("always uses https, whatever it was handed", () => {
    expect(formatCheckoutUrl(SHOPIFY_URL.replace("https:", "http:"))).toMatch(/^https:/);
  });

  // While checkout is on the permanent domain, /cart/c is bounced to the
  // store's primary domain — which Lovable serves, so the customer never
  // reaches checkout. /checkouts/cn is answered directly.
  it("routes around the primary-domain bounce while off a nairaflore subdomain", () => {
    const path = new URL(formatCheckoutUrl(SHOPIFY_URL)).pathname;
    expect(path).toBe(
      CHECKOUT_DOMAIN.endsWith(".nairaflore.com")
        ? "/cart/c/hWNFOlrnzQwOvbTWcteXtE2s"
        : "/checkouts/cn/hWNFOlrnzQwOvbTWcteXtE2s"
    );
  });

  it("leaves an already-rewritten checkout URL alone", () => {
    const once = formatCheckoutUrl(SHOPIFY_URL);
    expect(formatCheckoutUrl(once)).toBe(once);
  });

  it("hands back garbage unchanged rather than throwing mid-checkout", () => {
    expect(formatCheckoutUrl("not a url")).toBe("not a url");
  });
});
