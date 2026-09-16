# Measurement playbook — Meta Pixel, CAPI and Microsoft Clarity

How the two measurement systems are wired, what each can and cannot see, and how to
turn Clarity data into site changes.

## The one thing people get wrong

**Clarity and Meta never exchange data.** There is no integration between them, none
is available, and nothing flows in either direction. Clarity does not feed the pixel
and the pixel does not feed Clarity.

What connects them is a *shared reference number*. The same anonymous id is sent to
Meta as `external_id` and stamped on the Clarity session as `meta_vid`. A human then
matches them by hand. That is the whole mechanism — like writing one order number on
two separate files.

## What is installed

| Piece | Where | Notes |
| --- | --- | --- |
| Meta Pixel `1232524215695667` | `index.html`, deferred to idle/first interaction | The `fbq` stub queues, so no event is lost while the script waits |
| Visitor id cookie `naira_vid` | `index.html` inline, before `fbq('init')` | Random opaque UUID, 2-year cookie. Also on `window.__nairaVid` |
| `_fbc` click id | `index.html` inline, from `?fbclid=` | Written immediately rather than waiting for the deferred pixel |
| Event layer | `src/lib/pixel.ts` | Browser + server copies share `event_id` so Meta dedupes |
| CAPI relay | `supabase/functions/meta-capi/index.ts` | Needs `META_CAPI_ACCESS_TOKEN`; no-ops safely without it |
| Clarity `yizcbmxyht` | `index.html`, end of `<head>` | Standard snippet; defines `window.clarity` synchronously |
| Clarity tags | `src/lib/clarity.ts` | Inert until the snippet exists; tags are held and replayed |

### Match keys

`em` and `ph` are normalised Meta's way and SHA-256'd **in the browser**
(`normalizeEmail` / `normalizePhone` in `src/lib/pixel.ts`), so no raw address or
number reaches Meta or our own function. Both are gated on
`profile.ad_matching_consent`, and clearing consent re-initialises the pixel without
them.

Phone normalisation assumes India for a bare ten-digit number (the store sells only
into India). Numbers that already carry a country code are left alone.

## Clarity custom tags

Set in `src/lib/clarity.ts`, wired from `PixelEvents.tsx` and `CartContext.tsx`.

| Tag | Value | Use |
| --- | --- | --- |
| `meta_vid` | the `naira_vid` id — identical to Meta's `external_id` | exact lookup of one person across both tools |
| `fbclid` | raw click id parsed out of `_fbc` | every session from one ad click |
| `utm_source` / `utm_medium` / `utm_campaign` / `utm_content` / `utm_term` | landing query params | slice by campaign |
| `signed_in` | `yes` / `no` | member vs guest journeys |
| `reached_checkout` | `yes` | set when the shopper hands off to Shopify |
| `checkout_value` | rounded cart total | isolate expensive abandonment |

UTM params are read from the **landing** URL and captured once. React Router rewrites
the query within a few hundred milliseconds, so reading them later would credit
whatever page the shopper wandered to instead of the ad that brought them in.

## What Clarity cannot see

**Everything after the Secure Checkout tap.** Shopify's checkout is a different
origin and on the Basic plan scripts cannot be injected there. Clarity's view of the
funnel ends at the handoff.

This is exactly why `reached_checkout` exists. Filtering to sessions that had items
but never got the tag is the closest thing to an abandonment report that this setup
can produce.

## Analysing Clarity

Three routes, in order of how much they can be automated.

### 1. Data Export API — scriptable

`scripts/clarity-report.ts` pulls aggregate metrics and writes raw JSON plus a
summary. Needs a token from **Clarity → Settings → Data export**.

```sh
CLARITY_API_TOKEN=<token> npx tsx scripts/clarity-report.ts --days 3 --dimension URL
```

Keep the token in `.env.local` (gitignored via `*.local`) — **never** in `.env`,
which is tracked in this repo.

The API is aggregates only, a short lookback window, and tightly rate-limited, so
treat it as one pull a day, not a live feed. The script always writes the raw
response to `clarity-reports/` so a wrong assumption about field names never loses
the data.

Friction metrics worth reading first: dead clicks, rage clicks, quick backs,
excessive scrolling, script errors — each broken down by page URL and device.

### 2. Recordings — human only

There is no API for session recordings and no Clarity MCP connector. They cannot be
read programmatically. To get them into a Claude session:

- Screenshot them (images are readable), or
- Ask **Clarity Copilot** to summarise and paste its output.

### 3. Heatmaps — human only

Same as recordings: screenshot them.

## Turning insight into change

The loop that has worked here:

1. Pull the export API and/or watch recordings for the worst page.
2. Name the specific friction — element, page, device — not a vague impression.
3. Change the code, with a test pinning the behaviour where one is possible.
4. Verify: `vitest` → `tsc --noEmit` → `vite build` → Playwright against `dist/`.
5. Push, publish, and let Clarity re-measure the same metric.

Step 5 is the part that gets skipped. A change is not validated until the same
friction metric has been re-read after the fix is live.

## Setting expectations on volume

Rage clicks and dead clicks need enough sessions to separate signal from noise. On
thin traffic, 10 days of Clarity produces a handful of sessions — genuinely useful to
*watch*, but not enough to claim a percentage. Say which one you have before quoting
a number.

Funnels and Smart events only capture data **going forward**. Configure them on day
one or that window is lost.
