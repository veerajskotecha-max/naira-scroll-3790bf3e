# Clean up the second Meta dataset

Your Shopify channel already sends to the same pixel as the website
(1232524215695667), so purchases, product views and add-to-carts all land in
one dataset. Nothing on the site needs changing.

The only thing left is the empty second dataset, "naira lovable pixel"
(1470484131554912). It is attached to your ad account as an offline event set
and nothing ever uploads to it, which is what produces the warning triangle and
the catalogue error. Detaching it is done inside Meta — no code change here.

## Steps to detach it (about 3 minutes, in Meta)

1. Open the campaign or ad set that shows it, or go to Ads Manager, select the
   ad set, and press Edit.
2. Scroll to the **Tracking** section (the one in your screenshot).
3. Under **Offline events**, click **Edit tracked offline event sets**.
4. Untick "naira lovable pixel" (1470484131554912), then Save.
5. Repeat for any other active ad set that still lists it. The tick box was set
   automatically ("AUTO"), so it can reappear on newly created ad sets — check
   Tracking each time you build a new one.
6. Leave **Website events** ticked with nairaflore.meta's pixel
   (1232524215695667). That is the one doing all the work.

Optional, once no ad set references it: in Events Manager, open
**Manage Events Manager data sets**, select the 1470... set and remove it, so it
stops appearing in diagnostics and in the catalogue check.

## What to expect afterwards

- Reporting numbers do not change — the offline set was contributing nothing.
- The catalogue error (`catalog_has_event_source_with_missing_events`) clears
  once no ad or catalogue references the empty set.
- Match quality on product view and add-to-cart should climb on its own from
  the server-side events now live on the published site; read it about two days
  after the publish, not before.

## No code work

This plan involves no changes to the website. Approve it only if you want it
kept on record; otherwise just follow the steps above.
