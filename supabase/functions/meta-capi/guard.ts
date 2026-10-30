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
