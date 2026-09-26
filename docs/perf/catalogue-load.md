# Why catalogue clicks don't land

> **Status, 26 Sep (evening).** Verified end to end on full production
> builds before anything went to `main`.
>
> | | |
> | --- | --- |
> | on `main` since `0fe9e31` (live) | review photos genuinely lazy (needed an attribute-order fix, see Cause 2) |
> | on `main` since `5d18202` (**publish to go live**) | the prerender captures with reduced motion, so the 3D wordmark never loads during capture and its three.js preload is no longer baked into **129 of 131** pages. Modelled slow 4G, catalogue landing page: add-to-cart usable **11.5 s → 8.6 s**, hero **19.6 s → 15.0 s**. It was fixing a different bug — see *Why the pages lost their heads* below — and delivered most of Cause 1 on the way |
> | optional | `catalogue-load.patch` — tags preloads added from idle or intersection callbacks and drops them. After `5d18202` it only still matters on `/innercircle` and `/track-order` (the 3D gift box is near the fold there) and for the reels' idle warm-up chunks |
> | rejected | the first version of Cause 1, which stripped *every* runtime preload — it made the page usable **1.2 s later** |

Measured on a throttled phone, one product page
(`/jewellery/prism-riviere-bracelet`):

| | time to product visible |
| --- | --- |
| Good 4G (9 Mbit) | 3.3 s |
| Slow 4G (1.6 Mbit) | 20.5 s |

## It is bandwidth, not latency

The page ships **3,672 kB across 47 files**. Divide that by each profile's
throughput and the measured times fall out almost exactly:

```
slow 4G   1.6 Mbit ≈  200 kB/s   →  3672 / 200  = 18.4 s   (measured 20.5)
good 4G   9.0 Mbit ≈ 1125 kB/s   →  3672 / 1125 =  3.3 s   (measured  3.3)
```

The ratio between the two profiles (6.2×) tracks the throughput ratio (5.6×),
not the RTT ratio. So no amount of connection tuning, preconnect or HTTP/2
will move this. The only lever is **fewer bytes before the product renders.**

Where the 3,672 kB goes:

| type | files | kB |
| --- | ---: | ---: |
| script | 20 | 1,810 |
| image | 20 | 1,402 |
| document | 1 | 170 |
| stylesheet | 2 | 156 |
| font | 4 | 133 |

## Cause 1 — the prerender bakes lazy chunks into eager preloads

`scripts/prerender.ts` captures `await page.content()`, which serialises the
**live DOM after the app has mounted and run**. By then Vite's runtime preload
helper has injected

```html
<link rel="modulepreload" as="script" href="/assets/<chunk>.js">
```

into `<head>` for every chunk a dynamic `import()` reached during the capture.
Those injections get written to disk. Every real visitor then downloads the
whole set eagerly, at high priority, before anything renders — which is the
exact opposite of what `import()` was written to do.

The product page carried **18 preload links**. The first version of this fix
assumed nearly all of them were waste. Measuring what the page actually needs
before add-to-cart works showed otherwise — of the 13 injected at runtime:

| chunk | kB | on a product page because |
| --- | ---: | --- |
| `RoomEnvironment-*.js` | **559** | three.js — the 3D wordmark, which waits for load **and** idle on purpose |
| `scene-*.js` | 1 | the 3D scene wrapper, same |
| `index-*.js` | 440 | the entry itself (already loaded by its own `<script>`) |
| `JewelDetail-*.js` | 149 | the product page |
| `PincodeChecker-*.js` | 109 | rendered on the product page |
| `MobileReelShop`, `useReels`, `reelCovers` | 11 | "Shop the Reel" is rendered on the product page |
| `accordion`, `atelier-skeleton`, `ringFit`, `JewelPriceTag`, `index` | 6 | rendered on the product page |

So the waste is essentially **one chunk: 560 kB of three.js**, pulled ahead of
the page by a preload the component itself never asked for. `NairaWordmark`
says so in its own comment — the scene *"must not compete with the page for
the first load"*, and it imports three.js only after the `load` event and an
idle callback. The prerender undid that on 131 of 136 routes. Measured on the
product page: three.js requested at **104 ms**, the load event at **839 ms**.

### The first fix was wrong

It stripped every runtime (`as="script"`) preload. That removed three.js — and
also the product page's own chunks. Those are then requested only after the
entry has downloaded and run, so they queue behind everything the HTML already
asked for, and a parallel download becomes a waterfall.

Modelled slow 4G (one shared 1.6 Mbit/s pipe, 150 ms per request, 4× CPU
throttle, cache pre-warmed so real network jitter does not leak in — a model
for comparing builds, not a phone), same product page, identical over two
alternated runs:

| | add to cart usable | hero image |
| --- | ---: | ---: |
| `main` before today | 11.5 s | 19.6 s |
| strip every runtime preload *(first fix)* | 12.7 s | 19.6 s |
| strip only three.js + scene *(hand-edited HTML)* | **8.7 s** | **16.8 s** |

### The fix

In the capture browser, before any page script runs, count whenever the page
is inside a `requestIdleCallback` or `IntersectionObserver` callback — the two
APIs that exist to defer work — and tag any `modulepreload` added meanwhile.
`clean()` drops exactly the tagged links. Vite's helper appends its links
synchronously inside `import()`, so the attribution is exact, not a race on
timing; the route's own chunks are imported while the page renders itself and
are never tagged.

Two traps found on the way, both of which would have shipped a silent no-op:

- The script must go to `addInitScript` as a **string**. Passed as a function,
  `tsx` wraps its named inner functions in a `__name()` helper that exists only
  in Node, so it throws on its first line in the page and tags nothing — while
  the build still passes.
- It must be tested against a plain SPA build. Prerendered HTML already
  contains the baked links, and Vite's helper skips any href already in the
  document, so a probe against it shows nothing being tagged.

Verified on a full production build (`vite build` + prerender, 136/136
routes):

- three.js and its scene chunk gone from **every** route; no preload **added**
  anywhere; build-time preloads unchanged (680 → 680); no tag attribute left in
  the HTML
- the product page keeps all 11 of its own chunks
- the 3D wordmark still loads and draws — now *after* load, as designed:
  requested at 530 ms with the load event at **402 ms** (was 104 ms and 839 ms)
- modelled slow 4G: add to cart usable **8.7 s** (was 11.5), hero image
  **15.1 s** (was 19.6; this build also carries the lazy review photos)
- headings, client-side navigation, console output and the cart at six phone
  widths match the baseline

## Cause 2 — review photos that were never actually lazy

13 images are rendered 9–19× larger than their box. The worst:

| box | image served | kB |
| --- | --- | ---: |
| 48 × 48 | 1,097 px | 226 |
| 48 × 48 | 1,179 px | 225 |
| 32 × 32 | 1,097 px | 226 |
| 88 × 20 | 1,644 px | 101 |

The 48 px review thumbnails in `CustomerReviews.tsx` had no `loading`
attribute. Adding `loading="lazy"` **changed nothing**: the app mounts with
`createRoot`, so React builds these `<img>`s itself, and React 18 sets
attributes in the order they are written. With `src` first, the browser starts
the fetch the moment `src` lands, before it learns the image is lazy. Measured:
every photo fetched the instant React mounted, 1,600 px below the fold.

With `loading` written before `src` (on `main` in `0fe9e31`), the photos
unique to the list now wait until the visitor scrolls to them. The saving is
smaller than first claimed: four of the six files are also shown in the
32 px "customer photos" strip higher up, and that strip sits inside Chrome's
lazy-load window at first render — before the product above it loads and
pushes it down — so those four still load early. The strip had the same
attribute-order bug and got the same fix, which makes no measurable
difference on today's pages.

## What is left, and what it is worth

Not fixed here, in order of remaining value:

1. **Serve the thumbnails at thumbnail size.** They are bundled webp imports,
   so `shopifyImage()` (which only rewrites `cdn.shopify.com` URLs) is a no-op
   on them. They need build-time variants — a 96 px and a 180 px copy — or an
   image loader. Worth roughly **1.2 MB**.
2. **`supabase` (215 kB) and `gsap` are in `manualChunks`**, which makes them
   static dependencies of the entry and therefore legitimately preloaded. A
   product page needs neither before first paint.
3. **The document is 170 kB** because the prerender inlines the rendered body.
   That is the price of the SEO that prerendering buys, and it is the one large
   item here that earns its place.

## Reproducing

```
node shopify/harness/perf.mjs  <url> slow4g     # byte census + marks
node shopify/harness/imgaudit.mjs <url>         # per-image overdraw and loading
```

`perf.mjs` proxies every request through Node because Chromium in this
container has no direct network access. That proxying **bypasses the CDP
throttle**, so its own timings run optimistic — trust its byte counts, not its
clock. The timings at the top of this page are the ones measured on a real
throttled phone.

The verification behind the status table used these, all in `shopify/harness/`:

| script | what it answers |
| --- | --- |
| `mkverify.mjs` | makes an untracked copy of `prerender.ts` whose capture browser fetches through Node — Chromium here cannot complete TLS through the sandbox proxy. `clean()` is untouched |
| `distserve.mjs` | serves a built `dist/` like a prerender-aware host |
| `slowpipe.mjs` | the modelled slow-4G comparison above |
| `distcompare.mjs`, `diffclass.mjs` | route-by-route HTML diff against a baseline, and where each residual difference falls — run a control (same code built twice) first, because capture timing alone changes about two thirds of routes |
| `livetitles.mjs` | which live pages ship the generic fallback `<title>` or a homepage canonical (pass a sitemap.xml path) |
| `preloaddelta.mjs` | which runtime preloads a build drops or adds, per chunk |
| `tagprobe.mjs` | which preloads the deferred-import tagging marks on a live page |
| `wordmark3d.mjs` | when three.js is requested relative to the load event, and whether the canvas draws |
| `lazyprobe.mjs`, `whouses.mjs` | when each review photo is fetched, and which other elements share its file |
| `smoke.mjs`, `cartrow.mjs` | headings, client-side navigation, console, lazy photos; the cart at six widths |

---

# Why the pages lost their heads

The publish that followed Lovable's publish-timeout change (prerender four
pages at once) put **47 of 136 live pages** — products, collections, every
journal article, About, FAQs, Privacy, Terms — under the homepage's title,
description and canonical. Each told search engines it was a duplicate of the
homepage. The publish before it had 1 such page.

Two things combined:

1. `dist/index.html` is both the homepage's file and what the preview server,
   and the live host, hands out for any path without a file of its own. The
   prerender wrote the captured homepage over it mid-run, so every page
   captured afterwards *started from the homepage's HTML*, `<head>` included.
   In a local reproduction, all 71 bad pages had a `<head>` byte-identical to
   the homepage's.
2. Captures beat Helmet to the `<head>`. The 3D wordmark set up a WebGL scene
   on the capture browser's software GPU and blocked each page's main thread
   for seconds — headings up to 11 s late, the `<head>` up to 11 s after
   that, zero animation frames meanwhile. Helmet writes the head on an
   animation frame, and Playwright's `waitForFunction` polls on frames by
   default, so both stalled. Four pages at once turned a rare race into a
   common one.

`5d18202` captures with reduced motion (which the wordmark already honours by
keeping its flat flower), keeps the shell untouched until the last capture,
waits for each page's own canonical on a timer and fails a page whose
canonical still points elsewhere, and gives any page left without a capture
the untouched shell instead of the homepage. Full build: 0 bad heads (71
before), no content lost, prerender **204 s → 54 s**.

`helmetlag.mjs` in the harness is the probe that found it: it times heading
vs `<head>` with four pages sharing one browser, and counts animation frames.

---

# How it got heavy, and what to watch next time

## It was not one change

Sampling `main` back as far as the history goes:

| | 19 Aug | 25 Sep |
| --- | ---: | ---: |
| dependencies | 52 | 56 |
| components | 132 | 151 |
| routes | 30 | 52 |
| committed assets | 7.4 MB | 7.6 MB |

Five weeks added 19 components, 22 routes and 4 dependencies. The components
and routes cost almost nothing — they are lazy, and they split. **One of the
four dependencies cost more than all of that put together.**

## The one change with a real price

`70d47b5` — *"Add the 3D Naira box above the footer sign-off"*, 25 Sep. That
brought in `three`, which is **559 kB**, for a decorative box that sits above
the footer sign-off.

The code was written correctly: it is behind `import("@/lib/nairaBox/scene")`
and never touches the first render (the 3D wordmark that followed is deferred
the same way). But the prerender promoted it to an eager `modulepreload` on
131 of 136 pages, so nearly every visitor paid 559 kB up front. At
1.6 Mbit that is 2.8 seconds of a 20 second wait, spent on an ornament below
the fold that most visitors never scroll to.

## What to keep in mind

**1. A flourish has a price. Quote it before merging.** "3D box above the
footer" is a design decision until you write it as *"+559 kB, +2.8 s on slow
4G, for something below the fold"* — then it is a business decision. Ask for
the number in kB at the point someone proposes the feature, not after.

**2. Lazy in the source is not lazy in production.** Every `import()` here was
written properly and the build undid all of it. The import statement is not
evidence. The built HTML is. One line in CI would have caught this the day it
landed — fail the build if any page preloads the 3D chunks:

```sh
! grep -rlE --include=index.html 'rel="modulepreload"[^>]*/assets/(RoomEnvironment|scene)-' dist
```

(Not a cap on the *number* of preloads: a product page legitimately keeps 16
once the deferred ones are gone, and capping the count is what led to the
first, wrong fix.)

**3. Give the critical path a budget and fail the build on it.** Something
like *"a product page ships ≤ 500 kB before the product is visible"*. A number
in CI is the only thing that survives a busy week.

**4. Weight dependencies far above code.** 19 new components and 22 new routes
were free. One library was not. When reaching for a package, the question is
not "does this work" but "what does it add to the entry graph, and is it
behind an `import()` that the build actually honours".

**5. Every image needs a box.** 1,402 kB of images on one product page, 13 of
them 9–19× larger than the element they render into — a 1,097 px photograph in
a 48 px avatar. Before adding an `<img>`, answer: what size box, what does it
need at 2× DPR, and is it above the fold. Three questions, most of a megabyte.

**6. Check the live site after every publish, not just the build log.**
The publish that shipped 47 pages under the homepage's canonical reported
success. `node shopify/harness/livehealth.mjs` checks every sitemap URL's raw
HTML — status, own content, heading, canonical, noindex — in about a minute.

**7. Sweep the scaffold.** `recharts` sits in `dependencies` for
`src/components/ui/chart.tsx`, which nothing imports. Tree-shaking keeps it out
of the bundle, so it costs nothing today — but a shadcn scaffold ships a lot
that is never used, and it is worth a periodic look at what is declared versus
what is reached.
