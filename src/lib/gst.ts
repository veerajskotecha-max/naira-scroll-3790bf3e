/* GST on everything Naira sells, as the owner set it on 12 Nov 2026:
   "Make it 3% gst everywhere". Prices are tax-inclusive, so the shopper pays
   the listed price and 3% of it is GST. Shopify's own tax rates must say the
   same (Settings → Taxes and duties → India), or the order and invoice would
   disagree with the page. Change it here and everything on the site follows. */
export const GST_RATE = 0.03;
export const GST_LABEL = "3% GST";
