/*
  The shop's own trust figures, as the owner gave them on 16 Nov 2026:
  "trusted by 5,000 plus clients. We've already served 5,000 clients offline
  at exhibitions. 4.5 star rating."

  The bag says the clients TRUSTED the shop, not that they rated it: 5,000 is
  how many people have bought, 4.5 is the owner's rating, and "rated 4.5 by
  5,000+" would claim 5,000 ratings. Change the figures here and nowhere else;
  trust.test.ts pins both literals so a change is a decision, not an accident.
*/
export const SHOP_RATING = 4.5;
export const CLIENTS_SERVED = 5000;

/** "5,000+" — Indian grouping, as every price on the site. */
export const clientsLabel = `${CLIENTS_SERVED.toLocaleString("en-IN")}+`;
