import { CHECKOUT_DOMAIN } from "@/lib/shopify";

/* Paths that belong to Shopify, not to this app.

   nairaflore.com is Shopify's primary domain, so every customer-facing link
   Shopify generates — above all the "View your order" link in the order
   confirmation — points here. This app serves nairaflore.com, and it has no
   route for them, so they fell through to the catch-all and showed a paying
   customer "Coming Soon". Clarity caught 6 of 80 sessions doing exactly that on
   /68096065698/orders/<token>/authenticate.

   It is worse for COD: a buyer who cannot see the order they just placed is a
   buyer more likely to refuse it at the door.

   Shopify prefixes these pages with the store's numeric id. Nothing on this
   site ever begins with a number, so a leading all-digit segment is enough to
   know the path is Shopify's — orders today, and invoices or anything else it
   adds later — without listing them one by one. */
const SHOP_SCOPED = /^\/\d{6,}\//;

/** Where to send a Shopify-owned path, or null if it is one of ours. */
export const shopifyForwardTarget = (pathname: string, search = ""): string | null =>
  SHOP_SCOPED.test(pathname) ? `https://${CHECKOUT_DOMAIN}${pathname}${search}` : null;
