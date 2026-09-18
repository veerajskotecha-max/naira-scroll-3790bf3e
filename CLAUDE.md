# Naira Flore — working notes

Read this first. It is the context a fresh session does not otherwise have.

## What this is

The **frontend** for nairaflore.com: a Lovable-generated Vite + React + TypeScript +
Tailwind + shadcn app. The **backend is Shopify** (store "Naira", permanent domain
`nc5eti-gp.myshopify.com`, currency INR, India). Supabase holds members, the Inner
Circle list and edge functions. High-end demi-fine jewellery, pieces at ₹24,000–44,000,
mostly mobile traffic from India.

Lovable commits to `main` automatically and often. Expect `main` to have moved
since you last looked — **always `git fetch` and rebase/merge before starting**.
Committing to GitHub is NOT deploying: the live site only updates when someone
presses **Publish** in Lovable.

## Hard constraints — do not re-litigate these

- **The Shopify store is on the Basic plan.** The Checkout Branding API
  (`checkoutBranding` / `checkoutBrandingUpsert`) is hard-blocked — verified live,
  it returns *"the shop must be on a Plus plan or a Development store plan"*.
  Shopify's hosted payment page cannot be restyled through the API. Style changes
  there are manual, via Admin → Settings → Checkout → Customize.
- **Checkout happens off our domain.** The shopper leaves for Shopify at the
  "Secure Checkout" button. Anything after that point we cannot instrument,
  style, or observe. Client-side analytics go blind there.
- Shopify bounces `/cart/c/<token>` to the primary domain, which this app serves —
  `src/pages/CartCheckoutRedirect.tsx` exists to catch that and is load-bearing.

## Design system

`docs/design-tokens.md` is authoritative; values live in `src/index.css` under
`NAIRA FLORE DESIGN TOKENS`. Three layers: primitive → semantic → component.

Two rules that get broken most often:
1. Never reintroduce a raw hex / `hsl()` / arbitrary `tracking-[...]` for a value
   that already has a token.
2. **Radius stays 0.** Sharp corners are a brand rule. Never add rounded corners.

The cart is now fully tokenised (`CartDrawer.tsx`, `cart/CartExtras.tsx`,
`cart/OfferProgress.tsx`). The teal `hsl(186 35% 28%)` that used to carry the CTA
and every price is gone; Secure Checkout leads in `--nf-accent-strong`, the same
brand gold as Add to Cart on the product page, so one colour runs from choosing a
piece to paying for it. Do not reintroduce a second accent here.

Decorative fixed overlays must stay BELOW `z-50`. `wow/ScrollBloom.tsx` sat at
`z-[8000]` on the right edge and painted straight through the open cart drawer on
desktop; it is now `z-30`.

## Measurement stack

See `docs/measurement-playbook.md` for the full picture. The essentials:

- **Meta Pixel** (`1232524215695667`) fires from `src/lib/pixel.ts`, mirrored
  server-side by `supabase/functions/meta-capi/index.ts`. Both copies share an
  `event_id` so Meta dedupes them.
- **Microsoft Clarity** (`yizcbmxyht`), snippet in `index.html`.
- **They never exchange data.** There is no integration between Clarity and Meta
  and nothing flows in either direction. What links them is a shared identifier:
  `naira_vid` (a first-party cookie) is sent to Meta as `external_id` AND set as
  Clarity's `meta_vid` tag. That is a manual join key for investigation, not an
  integration. Do not tell anyone Clarity feeds the pixel.
- **Both only report from the real shop.** `window.__nairaProd` in `index.html`
  is an explicit hostname allowlist (`nairaflore.com` / `www.nairaflore.com`);
  off it, the Clarity tag is never inserted and fbevents.js is never fetched.
  Neither was gated before, so every localhost run and Lovable preview reported
  into the live project and the live pixel — 40% of one day's Clarity sessions
  were our own machines, and those sessions also fired PageView and ViewContent
  into Meta, where they cannot be told apart from shoppers and are optimised
  against. Both STUBS stay defined either way: `src/lib/clarity.ts` queues tags
  until `window.clarity` exists, and app code calls `fbq()` directly. Do not
  loosen the allowlist to a substring match — a preview host can carry the name.
- Clarity's `totalSessionCount` already excludes what it classifies as bots
  (`totalBotSessionCount` is separate and has been running ~4x the real count).
  It does NOT exclude our own dev traffic; that is what the gate above is for.
- Match keys (`em`, `ph`) are SHA-256'd **in the browser** and gated on
  `profile.ad_matching_consent`. Raw values never reach Meta or our own function.
  Do not widen that gate without the owner's explicit say-so — in particular the
  Inner Circle checkout email was given for a newsletter, not for ad matching.

## Discounts — two rules that cost money if broken

`src/lib/promo.ts` resolves the ONE discount an order gets. The bag's total and
the total Fastrr charges both come from it, so a rate or code that drifts from
Shopify quotes a total the shopper is never charged.

1. **Fastrr ignores Shopify AUTOMATIC discounts.** Verified live: an active
   "2 or more, 10% off" automatic discount left a two-item bag at
   totalPrice 2398.00, totalDiscount 0.00, empty discountDetail. Every offer
   must therefore be a discount CODE.
2. **Fastrr carries exactly ONE coupon.** `buyDirect` reduces `couponCode` to a
   single value. Joining two with a comma is worse than sending one — it read
   "BUY2,NAIRA10" as a single unknown code and applied NEITHER. So the resolver
   returns one code, never a pair, and nothing stacks.

Live codes: `BUY2` (20%, min qty 2) and `BUY3` (30%, min qty 3), both PRODUCT
class scoped to the hidden auto-updating collection `discount-scope-all` — do
not delete it or both stop working.

`NAIRA10` (10%) is LIVE again. It was retired, then brought back because two
thirds of orders are a single piece, which the ladder gives nothing — before it
came back, the most common order carried no discount at all. Despite its old
title it was never restricted to first orders: verified live, `allCustomers:
true`, `appliesOncePerCustomer: false`, no usage limit, no minimum, so the bag
can offer it to anyone without quoting a discount the checkout would reject.

NAIRA10 is the FLOOR, not a rung. It is typed; the rungs are earned. The
resolver returns the richer of the two, so a two-piece bag correctly shows BUY2
at 20% and ignores a stored NAIRA10 — verified in the browser: 1 piece +
NAIRA10 = -₹250 on ₹2,499; adding a second piece switches to BUY2, -₹860 on
₹4,298. It is NOT auto-applied: a shopper has to type it, which is why the
announcement strip carries it (`AnnouncementBar.tsx` alternates scarcity with
the code). Deciding to auto-apply it is a margin call for the owner, not a
code change to make unprompted.

`FRIENDSANDFAMILY` (20%) still exists and is now WORTH LESS than the top rung.
The resolver hands back the richer of earned and typed, so a three-piece bag
correctly ignores it — but anyone handing that code out should know it no longer
buys the holder anything a two-piece bag does not already get.

3. **The rates live in two places and must be changed together.** `QUANTITY_OFFERS`
   in `promo.ts` and the Shopify codes. `OfferProgress.test.tsx` asserts the
   percentages as literals on purpose, so a one-sided change fails the suite
   instead of silently quoting a discount the checkout will not honour.

The ladder is applied by the bag, never typed. `src/components/cart/OfferProgress.tsx`
renders it as a filling bar at the top of the cart.

## Verification expected before any push

```
npx vitest run                          # currently 162 tests
npx tsc --noEmit -p tsconfig.app.json
npx vite build
```

Pre-existing lint warning in `CartContext.tsx` (react-refresh) — baseline, not yours.

For anything touching `index.html` or runtime browser behaviour, unit tests are not
enough: build, serve `dist/` (`python3 -m http.server 4173 --bind 127.0.0.1` — note
`vite preview` fails in this container on IPv6), and drive it with Playwright
(`executablePath: '/opt/pw-browsers/chromium'`). That is how the pixel and Clarity
work was actually confirmed.

## Reel media in Supabase storage

Storage serves back whatever content type it was given at upload and there is no
way to edit it in place — the bytes have to be written again at the same path.
Both seeded reels (`seed/reel-1.mp4`, `seed/reel-2.mp4`) are stored as
`application/octet-stream`, which iOS Safari will not decode.

Writing to the `reels` bucket needs an authenticated user with the `admin` role
(`storage.objects` policies). The repo carries only the publishable key, so a
session working from the checkout **cannot** repair these objects — verified: both
`upload` and `update` return "new row violates row-level security policy".

The fix is a button. `/admin/reels` shows each reel's stored content type and, when
it is not a `video/*`, offers **Fix video type**: it downloads the object and puts
the same bytes back at the same path with the right type and a cache lifetime. It
refuses to write if the download size does not match what storage reports, because
an overwrite is destructive and there is no second copy. Do not tell the owner to
re-upload through the form instead — that writes a NEW path and inserts a SECOND
reel row.

`src/lib/mediaType.ts` decides the type. It ignores `file.type` unless it really
names a video: several Android pickers report `application/octet-stream` for an
ordinary .mp4, which is most likely how the seeded files ended up this way.

## There is ONE jewellery PDP, and /products hops to it

Ads and the Shopify catalogue link to `/products/<handle>`; the site links to
`/jewellery/<handle>`. These are different components — `ProductDetail` (apparel
template) and `JewelDetail` (the real jewellery page, which carries the offer
ladder and the reel). `ProductDetail` redirects jewellery to `JewelDetail`,
**keeping the query string**, because ad clicks arrive with `?fbclid=` and
`utm_*` and dropping them blinds the pixel on the page that fires ViewContent.

Do not "fix" this by adding a second redirect — one already exists and is
correct. Apparel must KEEP rendering on `/products/<handle>`: `JewelDetail`
cannot render it and bounces it to the listing.

Which line a product belongs to is decided in one place, `isJewelleryProduct`:
vendor `Naira Petite` (or a jewellery-ish productType). Verified against the
live store — all 19 apparel products are vendor `Naira Flore`, all jewellery is
`Naira Petite`, so nothing is misrouted.

The hop now happens BEFORE React boots. `index.html` carries a tiny inline
rewrite (marker `<!--NAIRA_JEWELLERY_REDIRECT-->`, injected at build time by the
`naira-jewellery-redirect` plugin in `vite.config.ts` from
`src/data/jewelleryHandles.ts`, so there is one source of truth). It sits ahead
of the pixel and Clarity snippets on purpose: those used to record
`/products/...` as the page, which is why Clarity shows rows for pages nobody
stayed on. It uses `replaceState`, so Back returns to the ad rather than to a
URL that only redirects again. The plugin FAILS THE BUILD if it parses fewer
than 20 handles — a reformat of the generated file must not silently ship an
empty map. The ProductDetail redirect stays as the fallback for a handle not in
the list.

**This host does not honour `public/_headers` or `_redirects`** — verified live,
nairaflore.com returns no CSP and no X-Frame-Options despite `_headers` setting
both. So a server-side 301 is not available, and the security headers in that
file are NOT in effect.

`src/data/jewelleryHandles.ts` also lets ProductDetail's own hop happen on the
first render instead of after a Shopify lookup. The bundled catalogue knows only 21 of 56 pieces, so
35 — including most handles the catalogue ads point at — used to mount the
apparel page and fetch before redirecting. Measured: 2 round trips and 396 ms
down to 1 and 256 ms. A handle missing from that list costs a round trip, never
correctness, so it going stale is a slowdown rather than a broken page.

## Conventions

- Comments explain *why*, never *what*. Match the density already in the file.
- Tests pin the bug, with a comment naming the failure the test prevents.
- Work on the branch you were assigned; never push to `main` without being asked.
