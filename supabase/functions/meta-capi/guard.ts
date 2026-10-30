/*
  The relay's checks on who and what it forwards to Meta.

  Kept free of Deno globals and npm: imports so the shop's own test runner can
  import it (src/lib/metaCapiGuard.test.ts); index.ts imports it as ./guard.ts.
*/

/** The only pages a shopper's event can come from (the same allowlist as
    window.__nairaProd in index.html). An exact host, never a pattern: a
    preview host can carry the shop's name. */
export const SHOP_HOSTS: readonly string[] = ["nairaflore.com", "www.nairaflore.com"];

/** True only for an https page on the real shop, on the default port. */
export const isShopPage = (url?: string | null): boolean => {
  if (!url) return false;
  try {
    const page = new URL(url);
    return page.protocol === "https:" && SHOP_HOSTS.includes(page.host);
  } catch {
    return false;
  }
};

/** The pages' own origins: a shopper's browser always sends one of these with
    its post. This stops other sites' pages from using the relay; a script
    can still forge it, which is what the event list below and the page check
    above are for. */
export const SHOP_ORIGINS: readonly string[] = SHOP_HOSTS.map((host) => `https://${host}`);

export const isShopOrigin = (origin?: string | null): boolean => SHOP_ORIGINS.includes(origin ?? "");

/** The events the shop's pages send to the relay (SERVER_EVENTS in
    src/lib/pixel.ts; a test keeps the two lists equal). Purchase is not one:
    it comes from Shopify and Shiprocket with the real order, so a Purchase
    here can only be forged. */
export const RELAYED_EVENTS: readonly string[] = [
  "ViewContent",
  "AddToCart",
  "AddToWishlist",
  "InitiateCheckout",
  "AddPaymentInfo",
  "CompleteRegistration",
  "Search",
  "Lead",
  "Contact",
];

export const isRelayedEvent = (name?: string | null): boolean => RELAYED_EVENTS.includes(name ?? "");
