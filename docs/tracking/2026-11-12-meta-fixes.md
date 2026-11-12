# Meta tracking fixes, 12 Nov 2026

Pixel `1232524215695667` ("nairaflore.meta's pixel"), catalogue `890180200517979` (Shopify Product Catalog).

## Double add-to-cart: fixed

Cause: three click rules made in Meta's Event Setup Tool (created about 15 Sep 2026) fired on top of the site's own events.
They sent no product ID, so Meta counted every add twice and could match only about a third of add-to-cart events to the catalogue.

| Rule ID | Event | Fired when a button's text contained | Now |
|---|---|---|---|
| 4554320884782559 | AddToCart | "add to cart" | INACTIVE |
| 1553103606844555 | AddToCart | "shop now" | INACTIVE |
| 1106502225107449 | InitiateCheckout | "shop now→" (garbled arrow) | INACTIVE |

Checked on the live site afterwards (Pixel 7, Woven Gold Hoops, every request to Meta recorded and blocked).
One tap now sends one AddToCart: the browser copy and its server copy share one event ID, so Meta merges them.
Before the change the same tap also sent a second AddToCart with no product and no value.

To undo: set the three rules back to ACTIVE (Events Manager > pixel > Settings > Event Setup Tool, or the Meta Ads connector).

## Dead catalogue pixel: removed

"naira lovable pixel dead" (`1470484131554912`, last event 20 Aug 2026) was connected to the catalogue next to the live pixel.
That raised must-fix "no AddToCart / Purchase / ViewContent received" warnings.
It is now disconnected; the live pixel stays connected (96% match rate).
To undo: connect `1470484131554912` to catalogue `890180200517979` again.

## 1.33 purchases per order: not fixable from here

The site sends no Purchase event. Purchase, cod_purchase and prepaid_purchase come from Fastrr (Shiprocket Checkout)'s own Meta connection:
- a browser pixel inside its checkout window (reported as https://nairaflore.com/);
- server events carrying the shopper's email and phone.

On 9 to 11 Nov (Meta's US Pacific days) there were 27 Fastrr orders. Meta received:
- 59 server-side Purchase events;
- 28 browser-side Purchase events;
- 46 server-side cod_purchase/prepaid_purchase events.

Meta merges copies only when they carry the same event ID, and Shiprocket controls that.
The fix belongs in Shiprocket's Meta pixel and Conversions API settings, or with Shiprocket support.

All 7 active ad sets optimise for Purchase on this pixel, so switching off the add-to-cart rules does not change what they optimise for.
Expect Ads Manager's "adds to cart" to roughly halve from 12 Nov; that is the correction, not fewer shoppers.
