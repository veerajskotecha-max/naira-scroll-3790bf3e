# Why catalogue clicks don't land

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

The product page carried **19 preload links pulling 1.8 MB of JavaScript**,
including:

| chunk | kB | why it is on a product page |
| --- | ---: | --- |
| `RoomEnvironment-*.js` | 559 | three.js, reached only by the animated wordmark |
| `index-*.js` | 441 | main bundle |
| `supabase-*.js` | 215 | needed for cart writes, not for rendering a product |
| `JewelDetail-*.js` | 150 | the only one this route actually needs first |
| `MobileReelShop`, `useReels`, `reelCovers` | — | the reels feature |
| `ringFit`, `PincodeChecker`, `accordion` | — | below the fold or rings-only |

**The source is already correct** — both three.js scenes are behind
`import("@/lib/nairaBox/scene")` and `import("@/lib/nairaFlower/scene")`. The
build is what un-lazies them.

**Fix.** Vite's build-time preloads (the entry's own static graph, written into
`index.html`) carry no `as` attribute; every runtime-injected one sets
`as="script"`. `clean()` now strips only the latter. Verified against the live
HTML: **18 preload links → 5**, entry script untouched.

The router still `import()`s the route chunk the moment it resolves. That costs
one round trip for `JewelDetail`; it saves downloading the entire application.

## Cause 2 — 930 kB of eager thumbnails nobody sees

13 images are rendered 9–19× larger than their box. The worst:

| box | image served | kB |
| --- | --- | ---: |
| 48 × 48 | 1,097 px | 226 |
| 48 × 48 | 1,179 px | 225 |
| 32 × 32 | 1,097 px | 226 |
| 88 × 20 | 1,644 px | 101 |

The six 48 px review thumbnails in `CustomerReviews.tsx` had **no `loading`
attribute**, so they were fetched eagerly — 930 kB, below the fold, none of it
on screen. They are now `loading="lazy" decoding="async"`.

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
and never touches the first render. But the prerender promoted it to an eager
`modulepreload` on **every page**, so every visitor paid 559 kB up front. At
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
landed:

```sh
test "$(grep -c 'rel="modulepreload"' dist/jewellery/*/index.html | head -1)" -le 6
```

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

**6. Sweep the scaffold.** `recharts` sits in `dependencies` for
`src/components/ui/chart.tsx`, which nothing imports. Tree-shaking keeps it out
of the bundle, so it costs nothing today — but a shadcn scaffold ships a lot
that is never used, and it is worth a periodic look at what is declared versus
what is reached.
