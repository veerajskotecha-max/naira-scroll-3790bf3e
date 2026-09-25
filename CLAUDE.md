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
- Shopify ALSO bounces its shop-scoped pages here: the "View your order" link in
  every order confirmation is `/<shop id>/orders/<token>/authenticate?key=…`
  (shop id 68096065698). These used to fall through to "Coming Soon" — paying
  customers, many of them COD, could not see their order. The `*` route is now
  `src/pages/CatchAll.tsx`, which sends any path whose first segment is a 6+
  digit number to `CHECKOUT_DOMAIN` unchanged (`src/lib/shopifyForward.ts`).
  Every other unknown path still renders Coming Soon. Verified with a FAKE token
  only — never probe with a real customer's order link.

## Design system

`docs/design-tokens.md` is authoritative; values live in `src/index.css` under
`NAIRA FLORE DESIGN TOKENS`. Three layers: primitive → semantic → component.

Two rules that get broken most often:
1. Never reintroduce a raw hex / `hsl()` / arbitrary `tracking-[...]` for a value
   that already has a token.
2. **Radius stays 0**, with ONE deliberate exception. Sharp corners are the
   brand, and the global `--radius` is `0px` — do not change it. The checkout
   button in the cart is the exception, at `--nf-checkout-radius: 10px`: it is a
   soft tappable target rather than an editorial edge, and it already carries
   round payment marks. The exception is a component token so it stays visible
   and lives in one place. Do not add a second exception without being asked.

The cart is now fully tokenised (`CartDrawer.tsx`, `cart/CartExtras.tsx`,
`cart/OfferProgress.tsx`). The teal `hsl(186 35% 28%)` that used to carry the CTA
and every price is gone; Secure Checkout leads in `--nf-accent-strong`, the same
brand gold as Add to Cart on the product page, so one colour runs from choosing a
piece to paying for it. Do not reintroduce a second accent here.

**Never nest interactive content inside a link.** `JewelCard.tsx` had the
wishlist `<button>` inside the card's `<a>` — invalid HTML, and on a phone the
tap landed in the anchor's activation path as well as the button's, so it took a
`preventDefault` to stop the card navigating and the card still played its
`active:scale` press as though the tile had been tapped. The heart is now a
SIBLING of the link inside a shared `relative` wrapper; `JewelCard.test.tsx`
asserts `a button` and `a a` are both empty. `/jewellery` carries 96% of the
site's rage clicks and 63% of its dead clicks, so an ambiguous control on this
card is expensive.

Known debt, same shape as the cart's old teal: `WishlistDrawer.tsx` still uses
`hsl(186 35% 28%)` on its CTA and prices (lines ~50 and ~88). Off-palette, and
it is the panel the heart opens.

**The PDP's first screen is budgeted for the Instagram in-app browser** — half of
all sessions, ~640px of visible page on a 360px Android. Rating, price, the
multi-buy ladder and a delivery + COD line (`jewellery/PdpBuyFacts.tsx`) must all
fit in it; measured 21–24 Sep, 76% of product-page visits saw no second page.
Each fact is ONE line at 360px — adding a clause wraps it and pushes COD off the
screen. The sticky buy bar waits until `#product-facts` is clear so it can never
cover them. The PDP says only "COD available" — the owner's call. The fee is
stated in the BAG instead, as its own line in rupees ("COD fee · none if paid
online"): Fastrr adds 5% of the post-discount total to COD orders (verified on
live orders) and books it as shipping. The rate lives in `src/lib/payment.ts`
with a literal test — change it there if the checkout setting changes.

Known debt: `JewelTrustStrip.tsx` shows "Last 24 hours: N pieces sold", where N
is a hash of the product handle, not a sales figure.

**The 3D Naira box** (`components/NairaBoxShowcase.tsx` → `NairaBox3D.tsx`, scene
in `lib/nairaBox/`) sits on its own packshot band (`--nf-surface-raised`) just
above BOTH footers — the full one and the compact one every product page uses —
like the bag on bluorng.com, with the brand line under it. The band is a
`data-quiet-zone`: `useQuietZone` hides the reel bubble while it is on screen,
because the bubble sat over the copy on every PDP. It is the closed box from the real packaging (sleeve, lighter rim, drawer
front and pull tab, lid print from the logo with the flower as the I), turns
at the Bluorng bag's pace, ~35 s a turn (owner's brief after a 4 s turn was sent back; pinned in `config.test.ts`), hovers, spins on
drag. It turns a FULL 360 uninterrupted: an automatic reveal every 9 s pulled
it back to the front before it could finish a turn, and the owner asked for the
opening to be the shopper's. A TAP on the box (or Enter/Space) brings it round
to face the viewer, the drawer slides out and the homepage's solitaire render
(`ring-cut-34.webp`, `RING_SIZE` 0.78 after the owner asked for it smaller)
rises from a velvet cushion and stays, glinting, until the next tap; then it
sinks, the drawer closes and the turn resumes. A tap is under `TAP_PX`/`TAP_MS`
in `config.ts`; anything longer is a drag. "Tap to open" shows under the box
until the first open. `config.test.ts` fails if a timer starts a reveal again.
The ring is hidden by two clipping planes updated per frame — the cushion's slot
and the sleeve's front opening — never by fading: a fade left a ghost of the
ring over the lid while the drawer slid home. The drawer body is drawn only
while it is out; shut, its walls showed through near edge-on sides. Reduced
motion gets a still box, but a tap still opens it — it only runs when asked
for. Dragging an open box closes it. The copy says
"18K gold tone & rhodium plated", the listings' own words: "18K gold" alone would
claim gold content, and materials are left out because some pieces are copper
alloy. three.js (~146 KB gzip) must only arrive via the dynamic import in
NairaBox3D — the test fails on any other static import. The sleeve is ONE
extruded mesh and the drawer front sits in the rim's plane under a
polygonOffset rim: every version built from butted panels or with a recessed
front flickered as dotted lines mid-turn. Keep the camera's near/far tight
(1–15); at 0.1–30 inner faces bled through.

**The header wordmark** (`components/NairaWordmark.tsx`, data and scene in
`lib/nairaFlower/`) is NAIRA as vector letters traced from the brand deck's
2710px artwork (`wordmark.ts`), in `--nf-sage`. It replaced a 105x24 bitmap
that was blurred on every phone. The I is rebuilt as a plain letter (the
deck's top serif, mirrored for the bottom) and the flower that stands as the
I is drawn on top from the stand-alone deck flower (`outline.ts`) — the same
drawing, fitted to the deck's I-flower at 97.9% overlap. That flower is flat
blush SVG from the first paint; after `load` + idle three.js arrives, a blush
enamel copy lands face-on exactly over it (checked in the browser: same box
to a pixel, the bevel adds a one-pixel rim) and the two cross-fade. It turns
on the I's STEM, not its own centre, so it circles the letter; edge-on it
lines up with the stem and briefly becomes the I. It turns slowly and steadily, 30% quicker than the box (~27 s a turn) —
its SPIN is the box's constant x `SPEED_OVER_BOX` 1.3, pinned in
`config.test.ts`. A rest-and-quick-turn (3 s face-on, 1.6 s turn) shipped
first and was sent back for the box's pace; the owner then asked for 30%
more. Reduced
motion and Data Saver keep the flat flower and never download three.js. The
canvas is wider than the flower on purpose (`HALF_WIDTH`): the low leaf
swings 0.42 flower-heights out from the stem. Face-on, a frontal key light
mirrored off the flat face and read as cream — the key sits high and to the
side on purpose. The footer and hero still use the old bitmap logos.

**The header bar was made 20% taller** at the owner's ask, with the wordmark
20% wider: `--navbar-h` 77 / 86 / 96px (phone / md / lg), wordmark 96–168px.
Pages clear the fixed header with HARD-CODED top padding (`pt-[..px]`, sticky
`top-[..px]`, `calc(100dvh - ..px)` heroes, `scrollMarginTop`) on ~25 files,
so every one moved by the bar's growth per breakpoint (+13 / +14 / +16).
`Header.test.ts` reads the bar's heights from `Header.tsx` and fails any
page whose `pt`/`md:pt`/`lg:pt` offset falls more than 8px under it — change
the bar and that test tells you which pages to move. Below `lg`, Search sits
on the LEFT beside the menu: with four icons on the right the wordmark sat
off-centre and ran into the search icon at 360px. From 1024–1279px the nav
links are 20px apart (34px from `xl`) so CUSTOMISE clears the wordmark. The
PDP first-screen budget took the 13px: at 360x640 the delivery + COD line
now ends at 636px — 4px spare. Nothing more fits above it.

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

Live codes: `BUY2` (10%, min qty 2) and `BUY3` (20%, min qty 3), both PRODUCT
class scoped to the hidden auto-updating collection `discount-scope-all` — do
not delete it or both stop working.

`NAIRA10` (10%) is LIVE again. It was retired, then brought back because two
thirds of orders are a single piece, which the ladder gives nothing — before it
came back, the most common order carried no discount at all. Despite its old
title it was never restricted to first orders: verified live, `allCustomers:
true`, `appliesOncePerCustomer: false`, no usage limit, no minimum, so the bag
can offer it to anyone without quoting a discount the checkout would reject.

NAIRA10 is typed; the rungs are earned, and the resolver returns the richer of
the two with a TIE going to the typed code. At the current rates NAIRA10 (10%)
exactly ties the two-piece rung, so a two-piece bag holding it names NAIRA10
rather than BUY2 — the charge is identical, so this is cosmetic, but do not
"fix" it by flipping the tie rule without checking `FRIENDSANDFAMILY` too. The
third piece out-earns it and takes over. Verified in the browser at these rates:
2 pieces = BUY2 -₹430 on ₹4,298; 3 pieces = BUY3 -₹1,349 on ₹6,747, total
₹5,548 with shipping. It is NOT auto-applied: a shopper has to type it, which is why the
announcement strip carries it (`AnnouncementBar.tsx` alternates scarcity with
the code). Deciding to auto-apply it is a margin call for the owner, not a
code change to make unprompted.

`FRIENDSANDFAMILY` (20%) now MATCHES the top rung and BEATS the two-piece one.
So it is worth the whole ladder on a SINGLE piece, and a two-piece bag holding
it is charged 20% rather than the rung's 10%. Anyone handing that code out
should know it outranks the offer rather than topping it up. Each time the
ladder moves, re-check this code against it.

3. **The rates live in two places and must be changed together.** `QUANTITY_OFFERS`
   in `promo.ts` and the Shopify codes. `OfferProgress.test.tsx` asserts the
   percentages as literals on purpose, so a one-sided change fails the suite
   instead of silently quoting a discount the checkout will not honour.

The ladder is applied by the bag, never typed. `src/components/cart/OfferProgress.tsx`
renders it as a filling bar at the top of the cart.

## Verification expected before any push

```
npx vitest run                          # currently 231 tests
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
the list. A handle Shopify does not return (a piece unlisted since the ad or
catalogue entry was made), and the bare `/products` / `/product` prefixes, go to
the `/jewellery` listing with the query kept — they used to end on a "Coming
soon" page whose only button led to the apparel line. Verified 24 Sep: all 55
jewellery URLs in the Meta catalogue (`www.nairaflore.com/products/<handle>?…
&variant=…`, 302'd to the apex) reach their `/jewellery/` page with the query
intact; the 18 apparel entries render on `/products/`.

**This host does not honour `public/_headers` or `_redirects`** — verified live,
nairaflore.com returns no CSP and no X-Frame-Options despite `_headers` setting
both. So a server-side 301 is not available, and the security headers in that
file are NOT in effect.

`src/data/jewelleryHandles.ts` also lets ProductDetail's own hop happen on the
first render instead of after a Shopify lookup. The bundled catalogue knows only 21 of 55 pieces, so
35 — including most handles the catalogue ads point at — used to mount the
apparel page and fetch before redirecting. Measured: 2 round trips and 396 ms
down to 1 and 256 ms. A handle missing from that list costs a round trip, never
correctness, so it going stale is a slowdown rather than a broken page.

The PDP has the same gap, and it is closed by `src/data/jewellerySnapshot.ts`:
every live piece the hand-authored `jewellery.ts` does not carry, generated from
the store so the page draws on first paint instead of showing "Loading piece"
until Shopify answers. `prism-riviere-bracelet` — the most-advertised piece —
used to sit on that skeleton for 1.3–4 s; measured after, ~250 ms with Shopify
delayed by 3 s. JewelDetail consults the snapshot ONLY until live data arrives,
so a piece unlisted since the snapshot was taken never stays buyable, and a
snapshot price is replaced by the live one within the same visit. It is
imported only by JewelDetail so it stays out of the main chunk (+17 KB gzip on
that route, main unchanged).

Regenerate both files together from one live query:

```
npx vite-node scripts/generate-jewellery-snapshot.ts
```

`jewellerySnapshot.test.ts` fails if any handle in `jewelleryHandles.ts` has no
first-paint data, so adding a piece in Shopify and regenerating only one file
fails the suite rather than bringing the skeleton back.

## Conventions

- Comments explain *why*, never *what*. Match the density already in the file.
- Tests pin the bug, with a comment naming the failure the test prevents.
- Work on the branch you were assigned; never push to `main` without being asked.
