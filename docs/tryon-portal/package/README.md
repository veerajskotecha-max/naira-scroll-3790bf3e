# Naira try-on portal: package for safekeeping

Built 30 Oct 2026 on the local branch `tryon-portal`, on top of `6a4593e`
(origin/main that day). NOT shipped: nothing went to `main` or to any
remote, and the branch lives only in a temporary container: copy this
folder somewhere safe.

- `tryon-portal.bundle`: the branch as a git bundle, merges and all (needs `6a4593e`)
- `patches-linear/`: the same 10 commits made linear; `git am` applies them cleanly
- `patches/`: `git format-patch 6a4593e..tryon-portal` as asked; it skips the
  two merge commits, so `git am` stops once (see "How to apply")
- `e2e-results.txt`: every check of the last full end-to-end run (518)
- `e2e-rerun-iphone13-fold.txt`: the rerun after the e2e's own timing fix

All three give the same tree (`dfe9ea1`) as the branch tip `c633a5f`,
checked in a throwaway clone. The contact sheet of every screen
(`build/repair-resume/journey.jpg` in the session scratchpad) is NOT in this
folder: it uses one of the shop's own on-model photos as the stand-in
customer, which stays on the build machine. Re-run the e2e with its
synthetic face to make a shareable one.

## What it is

A shopper opens `/try-on` (unlisted, noindex), picks one of 20 pieces, adds
ONE photo (a face photo for 15 earrings, ear cuffs and necklaces; a hand
photo for 5 rings and bracelets), ticks an unticked consent box, and gets a
photoreal "AI preview" of that piece on herself from Nano Banana Pro
(`google/gemini-3-pro-image`) through the Lovable AI gateway. The real
listing photo of the same stone and the piece's millimetre size sit beside
the preview, and one tap adds the exact variant shown to the bag (or Buy
now through the shop's own checkout handoff). Add and Buy now are live for
the whole 20 to 50 s wait.

A new Lovable Cloud edge function, `tryon`, holds the 20 references and
builds every prompt server-side (the browser sends only enums). It runs a
Flash pre-check, the render, a Flash fidelity verdict with at most one
retry, enforces device, IP and global daily caps, stores no photo anywhere,
and sends nothing to Meta. The photo is cut and re-encoded on the phone
(EXIF and GPS gone), shown only as `blob:` URLs inside Clarity-masked
containers, and cleared on Delete, on leaving the page and after 30
minutes idle.

The design is the judge's winning spec (scratchpad
`portal-oct30/spec/SPEC.md`); where the shop's rules and the spec
disagreed, the shop's rules won (listed under "Differences from the spec").
The repo's `CLAUDE.md` has a "Try-on" section with the rules that are the
point, not details.

## Commits

- `30de8fb` Try-on server: edge function, piece manifests and migration
- `3f8f557` Try-on browser libraries: photo prep, session, client, copy and one-tap line
- `83dae40` Merge branch 'tryon-p1' into tryon-portal
- `fd591cf` Merge branch 'tryon-p2' into tryon-portal
- `70fce2f` Try-on screens: hub, studio, result and buying, wired into the shop
- `d7e2803` Try-on: 'The real piece' link is a 44px tap target
- `4de0e11` Try-on: Delete photo shows its confirmation instead of the footer
- `5db2958` Try-on end to end: real handler, fake gateway, phones
- `5149140` Try-on server: close the abuse and privacy gaps from the security review
- `8b2f096` Try-on screens: fix what the shopper review found on phones
- `6fe7521` Try-on e2e: read the crop and the preview where the scroll comes to rest
- `c633a5f` Try-on tests: give the longest studio walk room on a busy machine

The first two were built in parallel (server and browser libraries) and
merged; the bundle keeps those two merge commits, `format-patch` leaves them out.

## How to apply

Onto a checkout of the shop repo that has `6a4593e` (origin/main of 30 Oct):

```sh
# Option 1: the bundle (the branch exactly, merge commits included)
git bundle verify /path/to/package/tryon-portal.bundle
git fetch /path/to/package/tryon-portal.bundle tryon-portal:tryon-portal
git switch tryon-portal

# Option 2: the linear patches (same tree, no merges)
git switch -c tryon-portal 6a4593e
git am /path/to/package/patches-linear/*.patch

# Option 3: the format-patch series as asked. Both parallel branches added
# src/data/tryOnHandles.ts and the skipped merge kept the first one, so
# git am stops at 0002; finish it without that file, then carry on:
git switch -c tryon-portal 6a4593e
git am /path/to/package/patches/*.patch        # stops at 0002
git apply --index --exclude=src/data/tryOnHandles.ts .git/rebase-apply/patch
git am --continue
```

If `main` has moved on, rebase the branch onto it and re-run the checks
below. The branch changes ten existing files (`CLAUDE.md`, `src/App.tsx`,
`src/components/Navbar.tsx`, `src/lib/optionalChunk.ts`,
`src/lib/routeCode.ts`, `src/lib/shopify.ts`, `src/pageCode.ts`,
`src/pages/JewelDetailNext.tsx`, `src/pages/PrivacyPolicy.tsx`,
`vitest.config.ts`); everything else is new files under `src/**/tryon`,
`src/data/tryOn*.ts`, `src/pages/TryOn.tsx`, `src/lib/oneTapLine.ts`,
`supabase/functions/tryon`,
`supabase/migrations`, `scripts/tryon` and `tests/edge/tryon`.

Checks (never `npm run build` or the prerenderer):

```sh
npx vitest run
npx tsc --noEmit -p tsconfig.app.json
npx vite build
```

Publishing the branch is inert by design: the function answers 503
"resting" until `TRYON_ENABLED=on`, and the product page shows no "Try on"
chip while `TRY_ON_ENTRY_LIVE` is false. `/try-on` itself is reachable by
URL once published, so publish only together with the privacy section.

## Flags and secrets

Client constants (`src/data/tryOnHandles.ts`, `src/data/tryOnPieces.ts`):
- `TRY_ON_ENTRY_LIVE = false`: the product page's "Try on" chip under the heart.
- `TRY_ON_LIVE_HANDLES`: the certified pieces; empty today. Each piece also
  carries `certified: 'YYYY-MM-DD' | null` in BOTH manifests (tests keep the
  three equal). Off the real shop, uncertified pieces show, labelled.
- `SCENE_GUARD_MODE = 'log'`.

Edge function secrets (Lovable Cloud):
| Secret | Value |
|---|---|
| `TRYON_ENABLED` | `on` enables; anything else answers 503 paused "off" |
| `LOVABLE_API_KEY` | exists only once Lovable AI is enabled |
| `TRYON_SALT` | 32+ random characters (else 503 not_configured) |
| `TRYON_DEVICE_DAILY` | 5 (the 429 message takes its number from this) |
| `TRYON_IP_DAILY` | 30 (loose for carrier NAT; keyed on the LAST public X-Forwarded-For hop) |
| `TRYON_DAILY_CAP` | 100 attempts a day, never refunded |
| `TRYON_VERIFY` | `strict` (default), `log` or `off` |
| `TRYON_RENDER_ID` | allow-list only: the two Nano Banana Pro ids |
| `TRYON_EXTRA_ORIGINS` | the Lovable preview origin for the smoke; never in production |
| `TRYON_ALLOW_UNCERTIFIED` | `1` in serve-local only |
| `TRYON_GATEWAY_URL` | tests only (loopback) |
| `TURNSTILE_SECRET` | keep UNSET: the page sends no Turnstile token, so setting it refuses every render |

Existing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are used for the
quota and ledger. The migration `supabase/migrations/20261101000000_tryon.sql`
must be applied by Lovable; until then the function fails closed (503
not_configured).

## Owner launch blockers (cannot be done from a session)

1. Enable Lovable AI so `LOVABLE_API_KEY` exists.
2. Turn OFF "AI app context" (More, then AI, or project settings). It is on
   by default on Free and Pro and keeps full requests and responses, the
   selfie included, for 90 days.
3. Ask Lovable support how long Lovable and Google keep request images on
   this plan (not confirmed anywhere); the privacy copy adds a sentence once known.
4. Set a Lovable AI usage limit with blocking (Workspace settings, Usage
   limits and alerts, credit type AI).
5. Ask Lovable to apply the migration (it creates DB objects itself; not
   confirmed that it pulls migrations from git).
6. Publish the privacy section (`/privacy#try-on`) before `TRYON_ENABLED=on`.
7. Certify each piece: render it with the printed prompts
   (`npx vite-node scripts/tryon/print-prompts.ts`) on synthetic subjects
   (never a real person's photo), approve on an approval page, then set the
   date in both manifests and add the handle to `TRY_ON_LIVE_HANDLES`. No
   piece is certified yet and no Higgsfield proof has been run (it needs
   the owner's approval of about 115 credits).
8. Run `npx vite-node scripts/tryon/check-refs.ts` before every publish.
9. The ship-gate smoke in the Lovable preview (below), then unset
   `TRYON_EXTRA_ORIGINS`, set `TRYON_ENABLED=on`, and keep the route
   noindex for a 1 to 2 week pilot before `TRY_ON_ENTRY_LIVE=true`.

## Questions for the owner

From the spec:
1. Will you enable Lovable AI, and which Lovable plan are you on?
2. Budget: about ₹12 to 14 per try-on (estimate) against pieces at ₹999 to
   2,449; approve the defaults 5 per device, 30 per IP, 100 per day (about
   $16 a day at the cap, $28 worst case) plus a blocking usage limit?
3. Approve about 115 Higgsfield credits for synthetic subjects and certification renders?
4. Will you certify each of the 20 pieces yourself? Is "18 of 20 pass on both subjects" the bar?
5. Bold Nocturne Chain: links 10 mm (size card) or 11.7 mm (description)?
6. Ear cuffs: "middle ridge of the ear" is the helix (outer rim) or the conch (inner ridge)?
7. Returns: the product page says 7-day returns if it does not suit; the
   policy allows only defects. Which is true? The try-on copy says nothing about returns until settled.
8. Launch shape: unlisted pilot first, then the chip, or the chip from day one?
9. Fidelity mode at launch: `strict` (a failed check is never shown, about
   $0.14 still spent) or `log` (shown, labelled, while we measure)?
10. Ask Lovable how long request images are kept, so the privacy copy can say so.
11. If low-stock pieces sell out mid-pilot, may Pearl Nugget Hoops, Molten
    Wave Ear Cuff or Baguette Tennis Necklace replace them after certification?
12. An 80/20 holdout for two weeks to measure lift, or the chip for everyone?

From the 30 Oct reviews:
13. The product page (with the chip off) now fetches two more small JS files
    (`oneTapLine` and `image-lightbox` split out because the try-on shares
    them; +1.2 KB gzip net, 27 to 29 requests). Accept, or pay to keep them in the
    product page's chunk (Rollup does not duplicate modules, so the try-on
    would then fetch the product page's chunk)?
14. The studio's steps have no Back history: Android Back at the crop or the
    wait leaves the site (and a running render still counts). Add history
    entries for the crop and the wait, or a "Leave and lose this preview?" step?
15. Should the e2e (`scripts/tryon/e2e.mjs`, about 650 KB of synthetic
    fixtures) stay in the shop repo, or move to the harness branch as the spec planned?
16. Cushion Halo: the try-on now shows the product page's US 5 to 9 chips
    (US 6 picked) and names the size on the button, instead of the spec's
    silent "US 6". Confirm.
17. "Save photo" opens the press-and-hold view in every in-app browser and
    Android WebView (the spec's uxStates), not only on iOS (its userFlow). Confirm.
18. Turnstile: leave unset (as now), or add an invisible widget to /try-on
    (a CSP change and a script from Cloudflare)?
19. `index.html`'s `preconnect` to cdn.shopify.com carries `crossorigin`,
    which images (no-cors) do not use; a site-wide change, so left alone here.

## Proven here, and what only the Lovable preview can prove

Proven in this container:
- Unit, contract and component tests: 966 vitest tests in 89 files (of which 294 are the edge
  function's own: prompts byte for byte, pinned model ids, the full handler
  contract against a scripted fake gateway, quota semantics and the security fixes).
- `tsc` clean, `vite build` clean; TryOn chunk 24,338 B gzip (budget 24 KB).
- The REAL handler under serve-local with a fake gateway, driven by phones
  (Pixel 7, iPhone 13, a 360x640 Android, desktop) in headless Chromium
  against a served build: every error scenario with its copy and refund
  rule, the consent gate, the request audit (photo bytes only ever go to
  `/functions/v1/tryon/render`, never before consent), the privacy DOM (no
  `data:` image, every photo masked, every blob URL revoked), the storage
  keys, Clarity's allow-list, no Meta event from the try-on path, four
  pieces into REAL Shopify Storefront test carts read back with the exact
  variant or Size attribute (no checkout, no order), and the product page's
  Add to cart box byte-identical to main with the chip flag off and on.
- The migration on PostgreSQL 16 with Supabase-like roles (an earlier
  stage): anon and authenticated get permission denied on both tables and
  both functions; 800 concurrent takes never over-issued; pgbench take plus
  refund failed 7 to 15 of 800 transactions on deadlocks before the lock-order
  fix and 0 of 800 after (3 runs each).

Only provable in the Lovable preview (or on a real phone):
- A real gateway call: the accepted model id, whether `image_config` 3:4 is
  honoured, render and total latency, output bytes, credit cost.
- That `/functions/v1/tryon` accepts the publishable key headers (as meta-capi does).
- Which X-Forwarded-For hop Supabase's proxy adds: send
  `X-Forwarded-For: 192.0.2.1` and read the log line's `xffHops`, `ipHop`
  and `ipTestNet` (true means the client's header passes through and the key must move).
- The migration objects exist once Lovable applies them.
- Photo prep time on a real mid-range Android: the spec's 800 ms at 4x CPU
  is NOT met in headless Chromium (software canvas, a loaded machine; see
  the e2e table). The review's suggested fix (one reduced working copy)
  measured slower here in an interleaved A/B (median 2.15 s against 1.66 s),
  so it was not kept.
- Hub LCP on 4G: 2.7 s measured headless against the 2.5 s target; the
  first two cards now carry `fetchpriority=high`. Re-measure in the preview.
- "Save photo" in the real Instagram and Facebook in-app browsers.
- The proof renders on the owner's model and the owner's certification.

## Differences from the spec, on purpose

- `src/lib/tryon/share.ts` is the spec's `shareImage.ts`.
- PieceStrip resolves stones with its own small helpers, not `colourCards.ts`
  (which would pull colour-card code into the TryOn chunk).
- The e2e lives in this repo (`scripts/tryon/e2e.mjs`), not on the harness
  branch; serve-local listens on 4541 and 4542, not 54321 and 54399.
- Cushion Halo shows its sizes (question 16); Save uses press and hold in
  every in-app browser (question 17); the device-limit message takes its
  number from the server.
- The IP limit keys on the last public X-Forwarded-For hop, not the first
  (the spec's "first entry" is written by the caller); a photo the checks
  refuse refunds the device but not the address.
- Quota keys are swept at the start of every take (`day < d - 1`), so the
  privacy notice's "two days" holds; the notice also names the 90-day
  anonymous ledger, the order attribute and the secret key.

## Review issues (30 Oct) and what was done

| Id | Sev. | Status | What changed |
|---|---|---|---|
| SEC-1 | major | fixed | The IP key is the last public X-Forwarded-For hop (the platform's), not the caller's first entry; a forged leftmost entry opens no new bucket (handler test). The log line records which hop matched (never the address) for the preview smoke. |
| SEC-2 | major | fixed | A photo the checks refuse (pre-check, refusal word, gateway 4xx on the bytes) refunds the device but keeps the address row spent, so one address can spend at most `TRYON_IP_DAILY` of the day's cap (test: the 31st refused photo is `ip_limit`, another shopper still renders). |
| SEC-3 | major | fixed | `tryon_refund` is plpgsql and locks device then ip in `tryon_take`'s order; comment corrected; `search_path = ''` and qualified names. pgbench: 7 to 15 of 800 failed before, 0 of 800 after. |
| SEC-4 | major | fixed | Sweeps run at the start of every take (`day < d - 1`); the notice (and the copy deck, kept equal by a test) names the 90-day anonymous ledger, the pieces noted on an order, and "without our secret key". |
| SEC-5 | minor | fixed (documented) | `TURNSTILE_SECRET` must stay unset: noted in CLAUDE.md and in the function. No widget added (owner question 18). |
| SEC-6 | minor | fixed | An empty or safety-filtered pre-check is `photo_unusable` "blocked" (refunded, no paid render); test. |
| SEC-7 | minor | fixed | `/feedback` writes nothing unless `TRYON_ENABLED=on` and keeps only the first report. |
| SEC-8 | minor | fixed | The ledger insert and refunds are bounded to 2 s each and the 90-day sweep moved into the SQL; a paid image is never swapped for a timeout. |
| SHOP-1 | major | fixed | The result's code is awaited (at most 8 s) before the step changes, so the preview commits with its controls; no Suspense fallback; `overflow-anchor: none` on the studio. e2e at 360x640 and 390x664 with a 4 s render: the frame lands at y 118 (the previous build: -459). |
| SHOP-2 | major | fixed | Same root cause: focus now lands on the preview's own heading (`H2#tryon-step`, "AI preview · <name>"). Component test fails on the old screens with focus on BODY. |
| SHOP-3 | major | fixed | 'The real piece' shows the stone IN the preview (`pieceInStone(live, result.stone)`); component and e2e checks (Emerald). |
| SHOP-4 | major | fixed | On a phone the crop always comes up under the header and the frame is capped to `(100svh - 214px) * 3/4` wide (240 px floor), so "Use this photo" is on screen at 360x640 (576..626) and 390x664 (600..650). |
| SHOP-5 | major | fixed | The open-back Cushion Halo shows the product page's US 5 to 9 chips (US 6 picked) and its fit line; the button reads "Add to bag · US 6" and adds the size picked. |
| SHOP-6 | major | deferred | Not met in headless Chromium (median 2.0 s at 4x CPU). The suggested one-decode working copy measured slower in an interleaved A/B (2.15 s against 1.66 s) and was reverted; needs a real mid-range Android in the preview smoke. |
| SHOP-7 | minor | fixed | The chosen size rides in the link (`&size=7`), so a size picked during the wait stays on the preview. |
| SHOP-8 | minor | fixed | "Add Amethyst · US 7 to bag" after a stone change. |
| SHOP-9 | minor | deferred | Owner's call (question 13). |
| SHOP-10 | minor | fixed | Sold out: "Sold out for now." with Reserve and View the piece lead; no greyed photo buttons. |
| SHOP-11 | minor | fixed | Share labels centred; inset label 9.5 px; rail heading on the page's 16 px line with the cards; Add is outline under an error's own button. |
| SHOP-12 | minor | fixed (partly) | `fetchpriority=high` on the first two cards. The existing `preconnect` is site-wide (owner question 19); LCP to be re-measured in the preview. |
| SHOP-13 | minor | deferred | Owner's call (question 14). |
| SHOP-14 | minor | fixed | The 429 carries the device allowance and the copy uses it ("today's 3 try-ons", "today's try-on", or no number). |
| SHOP-15 | minor | fixed | Press and hold in every in-app browser and Android WebView (`; wv)`), per uxStates (question 17). |
| SHOP-16 | minor | fixed (notes) | PrivacyPolicy comment names `routesAndWeight.test.tsx`; the share.ts, colourCards, ports and e2e-location differences are in CLAUDE.md and above; demos absent until certified. |

## End-to-end results (last run)

Full run of `node scripts/tryon/e2e.mjs` against a served `vite build` of this
branch (port 4540), a flag-on build (chip live, all pieces certified; 4543)
and a `git archive 6a4593e` build of main (4544), with the real handler under
serve-local and the fake gateway (4541/4542). Headless Chromium 1194
(Playwright 1.56.1), launched with no options; reporting hosts aborted;
Fastrr stubbed; real Storefront test carts read back, no checkout, no order.
The machine was shared with another workflow's browser sweeps (load average
15 to 20 on 4 cores), which slows every timing below.

| Group | What it covers | Pass | Fail |
|---|---|---|---|
| routes | hub and studio on Pixel 7, iPhone 13, desktop, 360x640: h1, noindex, title, cards, first screen, tap targets, no overflow, /tryon alias, unknown handle, still logo, no Meta | 77 | 0 |
| prep | 1152x1536, no APP1/GPS, upright for EXIF 1/3/6/8, PNG, HEIC, too small, dark warning, timing | 34 | 1 |
| flows/pixel7 | four pieces end to end: crop fold, consent gate, result on screen with focus, compare, the stone's real-piece inset, Cushion Halo sizes, Add at the tap, Shopify cart read back (variant or Size attribute), Buy now, share, Save, try another, Back, storage, request audit, Delete or pagehide | 124 | 0 |
| flows/iphone13 | two pieces, the same checks | 65 | 1 |
| flows/desktop | two pieces, the same checks | 58 | 0 |
| fold | NEW: 360x640 and 390x664, first preview of a visit with a 4 s render | 6 | 0 |
| errors | every gateway and quota scenario through the real handler, with copy, buttons and the refund rule (incl. the real 75 s timeout, offline, interrupted, cancelled) | 117 | 0 |
| pdp | Add to cart box at 360x640 identical to main with the chip off and on, chip placement, no try-on code on the product page | 21 | 0 |
| prodsim | production gates on: Clarity allow-list and tags, no Meta event from the try-on path, AddToCart exactly once | 7 | 0 |
| journey | upload percentage from real upload events, the four stages, tap targets, request audit | 5 | 0 |
| weight | TryOn chunk 24,338 B gzip (limit 24,576) | 1 | 0 |
| sheet | contact sheet, 31 screens | 1 | 0 |
| **Total** | | **516** | **2** |

The two failures:
- `prep`: photo prep 800 ms or less at 4x CPU. Median 2,009 ms (file chosen
  to crop painted 1,509 ms, Use to sent 500 ms; five runs 1,416 to 2,330 ms).
  The one open item from the reviews (SHOP-6): headless Chromium rasterises
  canvas in software on a loaded machine; time it on a real phone.
- `flows/iphone13`: "Use this photo on screen" read the page 150 ms after the
  crop appeared, while the shop's `scroll-behavior: smooth` was still
  scrolling (scrollY 168 of 212). The check now waits for the scroll to come
  to rest; the rerun of the iPhone 13 flows and the fold group passed 73 of
  73 (`e2e-rerun-iphone13-fold.txt`).

Control: the new fold checks run against the previous build (`5db2958`)
fail all four ways the review described (crop button at 800..850 and
840..890; iPhone 13 preview at y -459..19 with scrollY 789; focus on BODY).

Also run at the branch tip: `npx vitest run` 966 passed, `npx tsc --noEmit
-p tsconfig.app.json` clean, `npx vite build` clean.
