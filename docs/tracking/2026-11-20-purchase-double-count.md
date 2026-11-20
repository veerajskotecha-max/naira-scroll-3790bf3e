# Meta counts each order as about two purchases (checked 20 Nov 2026, 16:10 IST)

Pixel `1232524215695667`, ad account `903466039148509` (time zone Asia/Kolkata, so Meta's days are IST days).

## Shopify against Meta

| IST day | Shopify orders | Shopify pieces | Meta purchases (all campaigns, default attribution) | Meta purchase value | Shopify value |
|---|---|---|---|---|---|
| 19 Nov | 9 (#1360-#1368) | 22 | 15 | ₹19,713.78 | ₹21,080.07 |
| 20 Nov, to 14:08 | 7 (#1369-#1375) | 10 | 13 | ₹10,449.69 | ₹10,449.69 |
| 16 Nov | 7 | | 14 | | |
| 17 Nov | 8 | | 13 | | |
| 18 Nov | 7 | | 14 | | |

- Meta's purchase value is exactly right. On 20 Nov it equals the 7 orders to the paisa. On 19 Nov it equals the 8 orders that came from an ad; #1364 came without an ad click.
- Meta's purchase count is about twice the orders, every day since at least 16 Nov.
- So the second purchase Meta counts for each order carries no value: ROAS and revenue are right; "purchases" and "cost per purchase" are off by about 2x (cost per purchase looks half what it is).

## Why

Every Purchase comes from Fastrr (Shiprocket Checkout)'s own Meta connection. The site sends no Purchase (src/lib/pixel.ts sends none), and the pixel has no Purchase rule in the Event Setup Tool (only the three rules switched off on 12 Nov, still INACTIVE).

What Meta received from 19 Nov 00:00 to 20 Nov 16:00 IST:
- 68 Purchase events for 16 orders: per order about 2 from the browser (Fastrr's checkout window, reported as https://nairaflore.com/) and 3 from the server;
- 26 cod_purchase and 15 prepaid_purchase events for the same 16 orders (2 server + 1 browser per order).

Meta merges a browser event with its server copy when they share an event ID, and that now works (98.6% of browser Purchase events deduplicated; match quality 9.3 of 10). But Fastrr sends two different Purchase events per order (two event IDs), one with the order value and one without, so after merging Meta still has two.

## The fix (Shiprocket's side)

Only Shiprocket can change what Fastrr sends. Ask Shiprocket Checkout support:

> For our store nairaflore.com, Fastrr sends two Purchase events to our Meta pixel 1232524215695667 for every order (both browser and Conversions API), with different event IDs; one carries the order value and one does not. Meta therefore counts each order twice. Please send exactly one Purchase per order, with the same event_id (ideally the order ID) on the pixel and on the Conversions API event, and the same for cod_purchase and prepaid_purchase.

After the fix, Meta's purchases per day should match the ad-driven Shopify orders, and the values stay as they are.

## Until then, read the numbers like this

- Purchase value and ROAS in Ads Manager: correct as shown.
- Purchases: divide by about 2, or count Shopify orders.
- Cost per purchase: multiply by about 2.
- Comparing ads with each other still works, since every order is doubled the same way.
- Meta's purchase totals include only orders it can tie to an ad (7-day click, 1-day view; some campaigns also 1-day engaged view). Orders from organic Instagram, link in bio or direct visits are in Shopify but not in Meta's ad purchases.
