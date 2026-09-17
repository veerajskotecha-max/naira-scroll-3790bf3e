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

Known debt: `src/components/CartDrawer.tsx` is built almost entirely from hardcoded
inline `hsl()` values that are off-palette — the CTA and every price use
`hsl(186 35% 28%)`, a teal that appears nowhere in the brand palette. It is the last
screen before payment and does not look like the rest of the site. Not yet fixed.

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
not delete it or both stop working. `FRIENDSANDFAMILY` (20%) still exists.
`NAIRA10` was retired and is EXPIRED in Shopify; the app no longer accepts it.

The ladder is applied by the bag, never typed. `src/components/cart/OfferProgress.tsx`
renders it as a filling bar at the top of the cart.

## Verification expected before any push

```
npx vitest run                          # currently 95 tests
npx tsc --noEmit -p tsconfig.app.json
npx vite build
```

Pre-existing lint warning in `CartContext.tsx` (react-refresh) — baseline, not yours.

For anything touching `index.html` or runtime browser behaviour, unit tests are not
enough: build, serve `dist/` (`python3 -m http.server 4173 --bind 127.0.0.1` — note
`vite preview` fails in this container on IPv6), and drive it with Playwright
(`executablePath: '/opt/pw-browsers/chromium'`). That is how the pixel and Clarity
work was actually confirmed.

## Conventions

- Comments explain *why*, never *what*. Match the density already in the file.
- Tests pin the bug, with a comment naming the failure the test prevents.
- Work on the branch you were assigned; never push to `main` without being asked.
