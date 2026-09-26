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
