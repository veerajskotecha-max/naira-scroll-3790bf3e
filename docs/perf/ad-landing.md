# What a catalogue-ad click costs the shopper

> **Status, 27 Sep.** Analysis only — nothing here is on `main` yet. The
> fixes at the bottom are measured on live (fix 1, simulated) and on a local
> production build (fixes 2–3); none ships without an explicit go-ahead.

The question was: *"The PDP load for catalogue links is 8 s? Average is 3 s.
Why is ours slow, what did we fix, is it OK now?"*

## Where "8 s" came from — and why it was wrong

`catalogue-load.md` reported **add-to-cart usable 11.5 s → 8.6 s on slow 4G**
for `/jewellery/prism-riviere-bracelet`. Two things about that number:

1. **It was not the ad link.** Catalogue ads open
   `https://www.nairaflore.com/products/<handle>?utm_…&variant=…`, which is
   served very differently from `/jewellery/<handle>` (below).
2. **The model was too pessimistic.** It counted bytes uncompressed (JS, CSS
   and HTML travel gzipped, 3–4× smaller) and pushed every file through one
   first-come-first-served queue, where a phone actually gets the files
   Chrome ranks most important first. "It is bandwidth, not latency" in that
   doc holds only for that model.

The same page, re-measured with the corrected model, is usable in
**4.3 s on slow 4G** — and the ad link, which nobody had measured,
is the one that is slow.

## How it is measured now

`shopify/harness/adtrace.mjs` — live site, phone viewport, 4× CPU slowdown,
and a network model with:

- wire sizes as served (text re-gzipped; images as-is)
- 3 round trips to open each domain, started early for `<link rel=preconnect>`
- one round trip before each response's first byte
- bandwidth shared fairly between domains; inside one domain the file
  Chrome ranks highest goes first (Chrome's own priorities, read over CDP,
  including its in-viewport image boosts)

Times come from the browser's paint records (Element Timing on every `<h1>`
and `<img>`, plus LCP), not from polling or screenshots — both run late on a
throttled CPU. Facebook, Clarity and Google tags are blocked so test runs
never reach the live ad and analytics accounts. Each figure is the median of
3 runs; each run uses a fresh browser (a shared one let the warm-up pass's 3D
work leak into the timed pass).

Profiles: **good 4G** 9 Mbit/s, 60 ms; **weak 4G** 1.6 Mbit/s, 150 ms
(Lighthouse's mobile preset — the slow end of real visits).

## Results

Seconds after the tap. "Name" and "photo" are when they are painted on
screen; "works" is when Add to cart responds.

| | on screen first | name | photo | Add to cart works |
| --- | --- | ---: | ---: | ---: |
| **Good 4G** | | | | |
| Ad tap today (`/products/…`) | the homepage, 0.7 | 2.1 | 2.4 | 2.1 |
| Same product at `/jewellery/…` today | the product, 0.7 | 0.7 | 1.9 | 1.6 |
| Fix 1 — ad link gets the pre-built page (simulated on live) | the product, 0.7 | 0.7 | 1.9 | 1.6 |
| Fixes 1–3 (prototype build) | the product **with its photo**, 0.7 | 0.7 | **0.7** | 1.4 |
| **Weak 4G** | | | | |
| Ad tap today (`/products/…`) | the homepage, 1.9 | 7.3 | 8.2 | 7.3 |
| Same product at `/jewellery/…` today | the product, 1.8 | 1.8 | 5.3 | 4.3 |
| Fix 1 — ad link gets the pre-built page (simulated on live) | the product, 1.8 | 1.8 | 5.2 | 4.3 |
| Fixes 1–3 (prototype build) | the product **with its photo**, 1.5 | 1.5 | **1.9** | 4.4 |

Plus the `www` redirect on real ad links: +0.1–0.25 s on good 4G, +0.3–0.6 s
on weak 4G (not in the table — see Cause 2).

The three runs behind each median agree to within ±0.2 s. The prototype
builds were served locally; the same local build with fix 1 alone reproduces
the live fix-1 simulation to within 0.1 s, so the two are comparable.

**For reference, other jewellery stores on the same test** (one run each,
their own analytics blocked like ours): Salty's product photo at 1.5 s good
4G / 5.6 s weak 4G, GIVA's at 1.6 s / 4.2 s, Palmonas' largest paint at
6.8 s / 15.5 s. Ad taps today are slower than Salty and GIVA; fix 1 alone
brings us close to them; fixes 1–3 put the photo on screen well ahead of both.

## Why the ad link is slow

**1. `/products/<handle>` has no page of its own, so the host sends the
homepage.** The homepage's HTML (207 KB, 34 KB compressed), and the phone starts on everything the
homepage needs: the hero paper wash, seven lookbook images, four product
cards, the Instagram reel embed (128 KB compressed, before its own scripts) that the
shopper never sees, six font files — **1,240 KB of images** before the product photo. An inline
script fixes the address bar to `/jewellery/<handle>`, the app boots, and
only then does it ask for the product page's code.

What the shopper sees (filmstrips: `docs/perf/ad-landing-good-4g.jpg`,
`docs/perf/ad-landing-weak-4g.jpg`): the **homepage hero** (0.7 s on good
4G, 3 s on weak 4G), then a **blank page under the header** (0.7 s / 2.2 s),
then the product.

Worse for us, Google's own speed metric (LCP) scores that load on the
homepage hero at 0.7 s on good 4G — real-visitor reports will call ad
landings fast while the shopper waits 2.4 s for the product.

**2. `www` → apex redirect.** The catalogue links carry `www.`; the host
answers `302` to `nairaflore.com`. One extra round trip at least, a full new
connection at worst: **+0.1–0.25 s on good 4G, +0.3–0.6 s on weak 4G**
(both names resolve to the same address, so Chrome may reuse the
connection; the sandbox cannot see the real certificate to tell).

## Why even the pre-built page is slower than it should be

**3. On a phone, the pre-built HTML has no product photo.** The prerender
captures pages at desktop width, and the PDP decides mobile vs desktop
gallery in JavaScript (`useIsMobile` starts `false`). So the phone gets the
desktop gallery (hidden by CSS) and waits for the app to draw the mobile one.
It even downloads the photo twice — 800 px for the hidden desktop gallery,
900 px for the mobile one.

**4. The app wipes the pre-built page before it can replace it.** `main.tsx`
uses `createRoot`, which empties `#root` on the first render; the PDP is a
lazy route with `Suspense fallback={null}`. For **0.35 s** the shopper sees
the header over a blank page.

**5. Everything else competes for the same connection.** Four full-size
customer photos in the review strip (**593 KB** of JPEG shown as small tiles),
the Instagram embed on the homepage path, and ~290 KB of gzipped JavaScript
every page loads first (including Supabase and GSAP, which first paint does
not need).

**6. The 3D flower in the header.** three.js (141 KB gzipped) loads on every
page once it is idle. It does not delay the product in these runs, but its
first frame blocks the page for ~3 s in the lab. That figure is inflated —
the sandbox has no graphics chip — a phone should spend a few hundred ms, but
it lands in the seconds when a shopper reaches for Add to cart.

It also carries a real bug: if either 3D file fails to download (a flaky
mobile connection, an ad blocker), `main.tsx`'s stale-chunk handler reloads
the **whole page**. A decorative flower should never cost the shopper their
page.

## What the 26 Sep fixes changed

| fix | effect on ad landings |
| --- | --- |
| `5d18202` pages keep their own `<head>` | SEO: product pages declare themselves, not the homepage. Also dropped three.js from the pre-built HTML — ad visitors (who get the homepage HTML) no longer download it before the product |
| `0fe9e31` review photos lazy | fewer downloads on the PDP; the four strip photos still load early (they sit inside Chrome's lazy-load distance) |
| `c55c45f` back button closes the bag | an ad visitor who opens the bag and presses Back stays on the product instead of leaving the site |
| `f894533` cart button layout | none on load |

None of them touched the `/products/` path itself, so **ad clicks are not OK
yet** — they are the slow path.

## Fixes, ranked

| # | change | where | ad tap, good 4G | ad tap, weak 4G |
| --- | --- | --- | --- | --- |
| 1 | Copy each pre-built product page to `/products/<handle>` (canonical stays `/jewellery/…`; clothing: copy `/product/<h>` too) | `scripts/prerender.ts`, ~15 lines | name 2.1 → 0.7 s, photo 2.4 → 1.9 s | name 7.3 → 1.8 s, photo 8.2 → 5.2 s |
| 2 | Put the phone gallery's first photo in the pre-built HTML: render both galleries and let CSS choose, same image URL in both so it downloads once; only the first photo in the pre-built copy | `JewelDetail.tsx` | photo 1.9 → 0.7 s | photo 5.2 → 1.9 s |
| 3 | Load the landing route's code before React's first render, so the first render already is the page — no blank flash | `App.tsx`, `main.tsx`, a 12-line helper | blank 0.35 s → none | blank 0.35 s → none |
| 4 | Don't let optional code reload the page: `vite:preloadError` should reload only for route chunks, never for the 3D flower | `main.tsx` | bug fix | bug fix |
| 5 | Start the 3D flower later (after the first scroll or tap, or ~5 s after load) and skip it on low-memory phones | `NairaWordmark.tsx` | smoother first seconds | smoother first seconds |
| 6 | Trim what every page loads first: Supabase and GSAP out of the entry bundle, PincodeChecker on demand, review-strip photos resized (593 KB → ~60 KB) | several | small | Add to cart ~0.4–0.6 s sooner (estimate) |
| 7 | Remove the `www` hop for catalogue links (Meta feed rule or Shopify's primary domain) | live settings — needs your approval | +0.1–0.25 s | +0.3–0.6 s |

Fixes 1–3 together are what the prototype rows measure
([`ad-landing-prototype.patch`](ad-landing-prototype.patch), applies to `main`
at `c55c45f`; a measuring prototype, not a release — no tests, and the lines
are marked PROTOTYPE). Fixes 4–7 are not prototyped; their gains are
estimates.

One trade-off found on the way and designed out: with *every* gallery photo
in the pre-built HTML, photos 2–4 started downloading at once and pushed Add
to cart on weak 4G from 4.4 s to 5.2 s. The pre-built copy now carries only
the first photo (the app already treats `navigator.webdriver` as "this is the
prerenderer"); the shopper's browser still gets the full gallery.

## Checking it with real shoppers

Meta counts a *landing page view* only once the page has loaded far enough to
run the pixel. In Ads Manager, add the columns **Link clicks** and **Landing
page views** for the catalogue campaigns: the gap between them is shoppers who
left before the page appeared. Note it before fix 1 ships and compare a week
after — it is the real-world version of the tables above.

## Re-running

```bash
cd shopify/harness
node adtrace.mjs "https://nairaflore.com/products/<handle>?utm_source=facebook" fast4g
SUBST="https://nairaflore.com/jewellery/<handle>" node adtrace.mjs "<ad url>" fast4g   # fix 1, simulated
NO3D=1 node adtrace.mjs "<url>" fast4g                                                # without the 3D flower
FILM=/tmp/frames node adtrace.mjs "<url>" fast4g                                      # frames every 0.5 s
node filmsheet.mjs out.jpg "label|/tmp/frames" "label|/tmp/frames2"                   # frames side by side
node adsuite.mjs /tmp/out.jsonl 3 fast4g,slow4g                                       # all variants, medians
SCOPE=body WAIT_S=12 node adtrace.mjs "<another store's product URL>" fast4g          # any non-React page
```
