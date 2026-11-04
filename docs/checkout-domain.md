# Checkout domain — why checkout fails for some people, and the fix

## The symptom

Two complaints, one cause:

1. The payment step shows a `nc5eti-gp.myshopify.com` URL instead of a Naira one.
2. "Buy It Now" and "Secure Checkout" **sometimes** fail — the customer ends up
   back on the homepage with nothing in the bag.

## What is actually going on

The storefront (`nairaflore.com`, `www.nairaflore.com`) is served by Lovable.
Only Shopify can serve checkout. So checkout has to run on some host that
Shopify answers for, and today that is the permanent `*.myshopify.com` domain.

`*.myshopify.com` is a different registrable domain from `nairaflore.com`, so
Shopify's checkout session cookie (`_shopify_essential`) is a **third-party
cookie** for anyone arriving from the site. When a browser refuses to store it,
Shopify cannot establish the session, answers with a fresh token and another
redirect, and does it again, and again.

Measured against the live store, two fresh carts, same URL, the only difference
being whether the client keeps cookies:

| Client | Result |
|---|---|
| Cookies kept (Chrome desktop, default) | `302 → 200`, checkout loads |
| Cookies dropped (Safari/iOS, Firefox, incognito, tracking protection) | `302 → 302 → 302 → …` redirect loop, ending on the storefront homepage |

So it is not intermittent at all. It fails **per browser**, every time, for
roughly the half of Indian mobile traffic that is on Safari/iOS or on a browser
with tracking protection on. It looks random because it depends on who is
looking, not on when.

The `_fd=0` escape hatch does not help — it was tested and still loops, because
the loop is the missing cookie, not the domain redirect.

## The fix

Run checkout on a **subdomain of nairaflore.com**. It shares the storefront's
registrable domain, so the cookie is first-party and every browser keeps it —
and the URL at the payment step stops saying "shopify".

One change fixes both complaints. Three steps:

### 1. DNS (Cloudflare, where nairaflore.com is managed)

```
Type    Name    Target                  Proxy
CNAME   shop    shops.myshopify.com     DNS only  ← grey cloud, NOT proxied
```

The grey cloud matters. If Cloudflare proxies the record, Shopify cannot
complete its TLS challenge and the domain never verifies.

### 2. Shopify admin

Settings → Domains → **Connect existing domain** → `shop.nairaflore.com`.
Wait for it to verify and issue its certificate (usually minutes, up to 48h),
then **Set as primary**.

Checkout always runs on the primary domain, so this step is what actually moves
it. Once it is primary, remove `www.nairaflore.com` from Shopify's domain list:
Shopify does not serve that hostname (its DNS points at Lovable), so leaving it
only causes Shopify to keep redirecting people to a host it does not own.

### 3. This app

```
VITE_CHECKOUT_DOMAIN=shop.nairaflore.com
```

Then redeploy. `formatCheckoutUrl()` in `src/lib/shopify.ts` picks it up.

## After the change, verify

```bash
# should be 200 on the first hop, on shop.nairaflore.com, with no cookie jar
curl -sS -o /dev/null -w '%{http_code} %{num_redirects} %{url_effective}\n' -L \
  "https://shop.nairaflore.com/cart/c/<token>?key=<key>"
```

Get a real `<token>`/`<key>` from a `cartCreate` call against the Storefront
API. One redirect or none, ending on `shop.nairaflore.com`, means it is fixed.
Then buy something on an iPhone, in Safari, to confirm end to end.

## Do not "clean up" the /checkouts/cn rewrite

While checkout is still on the permanent domain, `formatCheckoutUrl()` rewrites
Shopify's `/cart/c/<token>` to `/checkouts/cn/<token>`. That looks like a hack
worth deleting. It is not — measured on the permanent domain, `/cart/c` is
`301 → 302 →` the storefront (Shopify bounces it to the primary domain, which
Lovable serves), while `/checkouts/cn` is answered directly. The rewrite turns
itself off once `VITE_CHECKOUT_DOMAIN` is a `nairaflore.com` subdomain, because
then there is no hop to skip.

## Loose end worth tidying

The store has a third domain attached, `mcgjbaqodrtnnbwernn.myshopify.com`
(`gid://shopify/Domain/122168213666`), with its own market web presence. It
currently just redirects to the primary domain and is harmless, but nothing
points at it and it is not the store's own permanent domain. Worth removing in
Settings → Domains once someone confirms what created it.
