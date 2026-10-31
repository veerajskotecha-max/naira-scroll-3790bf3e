# Site audit, 30 Oct 2026

Eight auditors (pages, buttons, code, tracking, SEO, commerce, speed, content) checked nairaflore.com and origin/main 6a4593e. Every finding was reproduced by an independent verifier and challenged by a skeptic: 101 distinct findings, 91 confirmed, 10 rejected. Full evidence: audit-result.json in this folder.

## Status after the 30 Oct ship (main ddb72b7)

The safe fixes went to main on 30 Oct as 6a4593e..ddb72b7. Before shipping, three rounds of independent review ran: a code review plus a phone browser test against the old build on Pixel 7, iPhone 13 and 1440. Results: 643 tests pass, the type check is clean, and lint shows its one documented warning. Buy Now payloads are identical to the old build. pixel.ts, PixelEvents, fastrr.ts, promo.ts, index.html, the theme files and supabase/ are unchanged. **Nothing is live until the owner presses Publish in Lovable.**

- **Fixed (41):** C03 C04 C07 C08 C12 C13 C16 C18 C22 C28 C31 C32 C33 C34 C36 C39 C40 C42 C43 C44 C46 C48 C49 C50 C51 C52 C53 C54 C56 C67 C68 C71 C72 C77 C78 C79 C80 C81 C85 C86 C90.
- **Partly fixed (5):**
  - C23: pages that are not real pages now say noindex in the browser. A true 404 status needs the host.
  - C24: Minimal and Office Wear list only their own pieces. The 8 duplicate topic landings now name the broader page as canonical.
  - C30: the bag was measured but is still slow to open, because of the dialog library's cost.
  - C41: the footer and secondary links are now 44px. The announcement-bar link is still 34px.
  - C73: invalid and Army Postal Service pincodes are now refused. There is still no per-region delivery table.
- **Skipped (1):** C69. Shop All's pre-built HTML shows 30 cards, because the grid renders 30.
- **Built, tested, then held for the owner (reverted on main; each one can come back with `git revert <hold commit>`):**

| Finding | What the fix does | Why it waits | Hold commit |
|---|---|---|---|
| C00 | Buy Now on a piece already in the bag checks out that line instead of adding a second unit | Changes the Fastrr hand-off (quantity and coupon) and skips an AddToCart event | 8d85e6d |
| C01 (build side) | The publish-time capture browser stops sending fake ViewContent to Meta | Changes what CAPI receives | 63ed576 |
| C02 | Bag lines take Shopify's current price | Changes InitiateCheckout value | 0cdea53 |
| C09, C38 | Old Shopify addresses land on their real pages, with the query kept | Changes ad and landing URLs and the PageView URL | 55857e9 |
| C17 | The error panel's "Browse the collection" link recovers the app | The page reached from the panel loses its PageView | 258ff12 |
| C25 | First paint shows Shopify's prices and sold-out state; sold-out adds count as not added | Changes the AddToCart and ViewContent values (overlaps C57) | 0e0ed4b |
| C27 | Adjustable rings follow Shopify's sold-out flag | Decides whether checkout is offered; contradicts the 25 Oct ring rule | a550bd9 (the C28 lead-time copy stays) |
| C47 | Bag Undo waits for an in-flight removal | Changes which lines reach InitiateCheckout and the Buy Now path | bc8b6fd |
| C65 | Product structured data carries Shopify's SKU | The Pixel's automatic Microdata event reads it | de55688 |

Already on the old build too, found by the final review, not changed:
- A piece listed after the last Publish, opened on a slow phone, shows the homepage for about 5 s. The cause is that the guard's 10 s timer and main.tsx's 8 s start limit don't line up. This can be fixed in code; it is a follow-up.
- /index.html shows "Coming soon".
- src/pages/ShopAll.tsx is dead code.

Evidence: fixes/fix-workflow-result.json (the fix round), fixes/final-review-result.json and fixes/final-review-result-r3.json (the three review rounds), and fixes/ship-main.bundle.

## Original findings

C01 is split: the build-side part (the prerender capture browser posting to meta-capi) is in the fix-now batch; the in-browser gate and the server host check wait for owner review. C00 is split the same way: the duplicate unit is fixed now; whether Buy Now should hand off only the viewed piece is an owner question.

## Fixing now (safe code fix, shipping to main after tests)

| Id | Severity | Area | Finding |
|---|---|---|---|
| C00 | high | product page / checkout hand-off (Buy Now) | PDP Buy Now adds another unit and checks out the whole bag, so a shopper who taps Add to cart and then Buy Now is sent to checkout with 2 of the piece (and anything else already in the bag) |
| C01 | high | tracking / build | Server-side Meta CAPI mirror ignores the production gate, so localhost, Lovable previews and every prerender build send ViewContent to Meta |
| C02 | high | commerce / bag pricing | The bag never updates a line's price from Shopify, so the bag Total can differ from what Shopify charges |
| C03 | medium | accessibility / keyboard | Mobile menu is not keyboard/AT accessible: focus not moved in, no focus trap, Escape does not close, focus dropped to <body> on close |
| C04 | medium | accessibility / keyboard | Ring size guide modal (all 28 ring PDPs): focus not moved in, not trapped, Escape does not close |
| C07 | medium | collections / sitemap / thin content | Evil Eye Bracelets collection page is empty but indexed, in the sitemap, linked from Shop All, and its copy describes stock the store does not have |
| C08 | medium | links / buttons (footer) | The 8 "Popular Searches" links in the footer do not filter: all open the same unfiltered Shop All |
| C09 | medium | legacy Shopify URLs | Shopify-style product URLs inside a collection, and 9 published Shopify pages, show Coming Soon |
| C12 | medium | product page / lightbox | Phone full-screen photo viewer cannot be swiped; only the small arrow buttons move it |
| C13 | low | forms / track order | Track Order form ignores the order number and email it asks for and opens Shopify's account login, even when both fields are empty |
| C16 | medium | performance / main-thread work | liveCatalogue rebuilds the whole catalogue on every render of every useLiveJewellery user (no memo): 18 runs while a PDP loads, 13 more after Add, and 120-250 ms long tasks per gallery swipe on a 4x-throttled phone |
| C17 | medium | runtime / error handling | Error panel's 'Browse the collection' link is dead: ChunkErrorBoundary never resets, so the panel stays while only the URL changes |
| C18 | medium | runtime / telemetry | Missing crypto.randomUUID crashes the whole site on the first in-site tap (old iOS/Android browsers) |
| C22 | medium | SEO / crawl control | robots.txt Disallow rules do not apply to Googlebot, Bingbot, Twitterbot or facebookexternalhit |
| C23 | low | SEO / soft-404 / canonicalisation | Every URL without a prerendered file returns 200 with the homepage's HTML (canonical '/', index, follow): soft 404s, and raw canonicals that conflict with the rendered ones |
| C24 | medium | SEO / duplicate content / collection membership | Many keyword landing pages list the exact same product grid; the minimal and office-wear filters are defeated by store-wide tags |
| C25 | medium | commerce / first-paint data | Before the live catalogue loads, the listing switches to 21 old bundled pieces with outdated prices, and 5 sold-out pieces show ADD TO CART |
| C27 | medium | commerce / sold-out handling | Product page and reel cards ignore Shopify's sold-out status for adjustable rings (latent: Rose Verdant Band has 1 left) |
| C28 | medium | commerce / delivery messaging | Delivery messages contradict sold-out and pre-order states (three different lead times on one page) |
| C30 | medium | speed / bag open | Opening the bag is slow on a mid-range phone: about 1.4–1.8 s to slide in after Add, 2.1–2.5 s from the header icon; tap response (INP proxy) 1.06–1.95 s |
| C31 | medium | speed / image bytes | Home page downloads about 1.5 MB of far-below-the-fold 'lazy' outfit and testimonial photos at 2.5–3.1 s without any scroll |
| C32 | medium | accessibility / keyboard | Focus is lost to <body> after closing the bag, wishlist, photo lightbox and search |
| C33 | medium | accessibility / keyboard | Search overlay (aria-modal) does not trap focus |
| C34 | medium | accessibility / keyboard | Collapsed reviews panel is aria-hidden yet keyboard-focusable (invisible Tab stops on every PDP) |
| C36 | medium | accessibility / alt text | Gallery photos all get generic alt '<name> view N' (842/847), including size-guide and gift-box slides; Shopify's descriptive alts are discarded |
| C38 | low | legacy Shopify URLs | Other Shopify paths (/cart, /search, /account/login, /policies/shipping-policy and more) show Coming Soon; the outfit collection opens the jewellery grid |
| C39 | low | robots / private routes | Hidden pages left indexable: the OAuth consent page has no noindex and robots.txt does not block it |
| C40 | low | product page / sticky bar | Toasts cover the phone sticky buy bar (Wishlist / Buy Now / Add to cart) for about 4 s |
| C41 | low | tap targets (Pixel 7 / iPhone 13) | Small tap targets on phones (under 44px) in the full footer and on secondary links |
| C42 | low | product page / reviews | Console error on every PDP when a customer review photo is opened (Radix: DialogContent requires a DialogTitle) |
| C43 | low | wishlist drawer | Wishlist drawer nests the Remove <button> inside the item <a> and links pieces to /product/<handle> |
| C44 | low | header search | Search: 'ear ring' finds nothing |
| C46 | low | runtime | Blocked browser storage gives a blank white page site-wide (prerendered content wiped) |
| C47 | medium | cart | Bag 'Undo' is silently lost if tapped while the removal is still in flight |
| C48 | low | performance / data cost | Full catalogue (~70 KB gzip, ~430 KB JSON) is re-downloaded every 60 s on any open page that uses it |
| C49 | low | routing / performance | /shop/indo-western preloads the unreachable ShopAll page, then redirects to /customize |
| C50 | low | performance / bundle | Apparel product route exceeds the 250 kB gzip JS budget (265.8 kB) |
| C51 | low | runtime / auth | Crafted /auth?next=/\host crashes the auth page into the site-wide error panel |
| C52 | low | build / UI | Tailwind class duration-[600ms] generates no CSS, so product-card hover zoom runs at 150 ms |
| C53 | low | code health | Lint fails: 34 errors / 26 warnings against the documented baseline of one warning |
| C54 | low | dependencies | npm audit (prod): 26 vulnerabilities; react-router in the shopper bundle is pinned to vulnerable 6.30.1 / @remix-run/router 1.23.0 |
| C56 | low | admin | Admin reel delete is one tap, no confirmation, and deletes the storage files even if the row delete failed |
| C65 | low | SEO / structured data | Product JSON-LD has an empty sku on 133 of 154 pages, although Shopify has SKUs |
| C67 | low | SEO / metadata | Meta and OG descriptions on product pages are cut mid-word at a fixed character count |
| C68 | low | SEO / structured data / internal links | Apparel product breadcrumbs point at redirecting URLs, and the JSON-LD and visible breadcrumb disagree |
| C69 | low | SEO / crawlability | Shop All's raw HTML links only 28 of 136 products (the rest sit behind a 'SHOW MORE' button); 14 sitemap URLs have no inbound link |
| C71 | low | SEO / internal linking | Site navigation and PDP category tiles link to ?category= URLs instead of the indexable category landings |
| C72 | low | SEO / metadata hygiene | Long titles, a sitemap without product lastmod, and generic journal images |
| C73 | low | commerce / serviceability | Pincode checker promises delivery for any 6 digits, including invalid PINs |
| C77 | low | commerce / data completeness | Latent: catalogue query limits would silently drop products and variants |
| C78 | low | resilience / slow chunk | A slow product-page code download (>8 s) wipes the visible pre-built page to a blank body |
| C79 | low | speed / image bytes | Footer logo is a 103 KB SVG wrapping a base64 raster, downloaded on every page at 2–3 s |
| C80 | low | resilience / error reporting | After the one reload is used up, the stale-chunk listener still calls preventDefault, so the real chunk error becomes 'TypeError: Cannot read properties of undefined (reading "default")' |
| C81 | low | speed / data use | The reel's 'MIME recovery' fallback re-downloads the entire video (3.3 MB) on any video error |
| C85 | low | accessibility / keyboard | Variant pickers use role=radio but do not support arrow keys; every option is a separate Tab stop |
| C86 | low | accessibility / structure | No <main> landmark on home, Shop All or PDP; Shop All has a second <header> (duplicate banner); heading levels skip |
| C90 | low | docs vs content | CLAUDE.md says the announcement strip carries NAIRA10; the live code removed it |

## Owner review first (Meta tracking, checkout hand-off, ad landings, colours, policy text)

**Status 31 Oct:** approval page published (private to the owner): https://claude.ai/artifact/JBnQzz1ozfj1Ef2NLrpWqd . Every item below is built as its own commit on five local branches off ddb72b7 (`own-tracking`, `own-checkout`, `own-prices`, `own-landings`, `own-contrast`; 60 commits, 42 approval cards once fixups sit with their parent). They are saved in [`owner-review/owner-patches.bundle`](owner-review/owner-patches.bundle). Each branch had two rounds of independent review and repair; a final check of the last fixes and every owner line is running. [`owner-review/SHIP-MAP.md`](owner-review/SHIP-MAP.md) lists which commits each card ships. Nothing is on main or live; the owner approves card by card on the approval page, then writes "ship".

| Id | Severity | Area | Finding |
|---|---|---|---|
| C05 | medium | accessibility / contrast | Footer and announcement bar text fail WCAG AA contrast on every page (1.67-2.27:1 and 1.95:1) |
| C11 | medium | product page / variant selection | Catalogue/ad links with ?variant= keep only the metal/stone; the size and month are dropped (Silver/7 opens Silver/6, May opens January) |
| C14 | medium | edge functions / security / CAPI relay | meta-capi edge function relays any event from any caller (no origin check, no event allowlist, Purchase accepted) |
| C15 | medium | tracking / order attribution (Shopify and Fastrr) | UTMs drop out of the Shiprocket/Fastrr hand-off after any in-app navigation; the Shopify fallback checkout never carries them |
| C19 | medium | tracking / catalogue match (dynamic ads) | ViewContent reports the first variant, not the variant the page opened on (catalogue ad ?variant=, colour card ?colour=) |
| C20 | medium | tracking / Meta funnel events | Checkout tap fires AddPaymentInfo and InitiateCheckout together; Shiprocket sends both events again under its own event ids |
| C26 | medium | commerce / checkout hand-off | Fastrr checkout drops the ring size note, so rings sold one way (adjustable rings, Droplet Open Ring) reach orders with no size |
| C29 | medium | speed / ad landing first paint | A catalogue ad for the Silver variant first shows the Gold bangle with Gold selected, then swaps to silver about 1.6–2 s later; LCP is the wrong colour |
| C57 | low | tracking | AddToCart pixel fires even when Shopify capped the quantity and added nothing |
| C58 | low | tracking / AddToWishlist | AddToWishlist sends the product handle as content_id (matches no catalogue item) and has no value or currency |
| C59 | low | tracking / Search | Searches with no results, or typed and not followed, never send a Search event |
| C60 | low | tracking / CAPI match keys | The server copy of the landing ViewContent has no fbp for new visitors |
| C61 | low | tracking / cookies and Purchase match on the Shopify-checkout fallback | _fbc and naira_vid are host-only cookies on nairaflore.com, invisible to the payments.nairaflore.com checkout |
| C62 | low | tracking / consent and disclosure | The privacy policy discloses hashed email only, but consented members' hashed phone is also sent |
| C63 | low | tracking / AddToCart coverage | Increasing quantity in the bag is not tracked as AddToCart |
| C70 | low | SEO / structured data | Product rich-result data is incomplete: no shippingDetails or return policy, and a single Offer for multi-variant pieces |
| C74 | low | commerce / checkout hand-off | The Shopify-checkout fallback goes through /cart/c on payments.nairaflore.com: 3 redirects plus a full app boot before checkout |
| C75 | low | commerce / discount ladder | Removing a piece leaves the old rung's code on the Shopify cart; a 1-piece checkout never clears it |
| C83 | low | speed / CLS | Shop All layout shift 0.035–0.037 when the live catalogue re-renders the grid (known, task #64) |
| C84 | low | accessibility / contrast | Shop All card text below AA contrast: category label, struck MRP, '% OFF', 'MOST LOVED' |

## Shopify data (needs the owner's word)

| Id | Severity | Area | Finding |
|---|---|---|---|
| C06 | medium | content / colour vs photo (Shopify data) | Tubogas Dome Ring: choosing Silver shows only gold photos (no silver photo exists; all variants point at the gold on-hand shot) |
| C35 | low | content / size guide | Triple Dawn Cuff has no size information at all (no size-guide photo, no measurement in copy) |
| C76 | low | commerce / catalogue data / price consistency | Shopify catalogue data inconsistencies visible on the site: Roman Numeral Trio Ring US 9 priced ₹1,900 vs ₹1,899, and 19 active pieces have no compare-at price |
| C87 | low | content / size guide | Measurements only inside the size-guide image for 10 pieces (none in description/Details text) |
| C88 | low | content consistency | Plating badge copy inconsistent with Details: Rose Verdant badge drops 'rose'; 3 new pieces lack the PVD line and badge says '18K gold coated' while Details say 'Polished gold coated' |
| C89 | low | content / Shopify data | Shopify image alt data: 77 images with no alt across 36 listings; 'catalog-square' alt on 7 listings; SKU code as alt on golden-duet-ring; Heartbead tagged 'Rhodium Plated' but copy says gold-coated clasp on steel |

## Owner decision or owner action (no code)

| Id | Severity | Area | Finding |
|---|---|---|---|
| C21 | medium | SEO / structured data / prerender freshness | Prerendered product pages, their JSON-LD and visible first-paint price stay at the last Publish (27 Oct build): 4 pieces are already stale (2 wrong prices, missing variants, sold-out sizes shown available) |
| C37 | low | redirect chain / canonical host / ad landing speed | www to apex is a temporary 302, and Shopify's primary domain is www, so every Shopify-made link (catalogue/ad feeds, onlineStoreUrl, emails) takes an extra uncached hop |
| C45 | low | performance / forms responsiveness (guess) | Possible: /auth and /innercircle (3D gift-box band on screen at load) leave the main thread saturated (unverified, sandbox software WebGL) |
| C55 | low | cart / totals vs orders / owner decisions | COD fee code/doc drift: the bag no longer shows the COD fee line, add-on or gift row that CLAUDE.md describes, COD orders now carry no fee, and prepaid orders get an extra 5% the bag does not show |
| C64 | low | SEO / local NAP consistency | Three different business addresses across the structured data, the Contact page and Shopify |
| C66 | low | SEO / structured data consistency | Product JSON-LD brand is 'Naira Flore' on every product, while the Shopify vendor (the feed brand) is 'Naira Petite' |

## Test harness (fixed in shopify/harness/noreport.mjs)

| Id | Severity | Area | Finding |
|---|---|---|---|
| C10 | medium | audit harness / live data hygiene | Harness gap: NO_REPORT does not block the host's own visitor tracking (/__l5e/trackevents, ~flock.js/tinybird), so audit page loads sent it events |

## Recorded, no fix this round

| Id | Severity | Area | Finding |
|---|---|---|---|
| C82 | low | speed / TBT | Main-thread cost at boot: React's first render, which replaces the pre-built page, is a single 0.65–1.17 s task; TBT 1.2–2.5 s at 4x CPU (React's first render replacing the prerendered page; needs a larger change such as partial hydration) |

## Rejected by verification

| Finding | Why rejected |
|---|---|
| The tracking query (fbclid/utm) is dropped when a missing product, collection or article sends the shopper on to a listing | The redirect does drop the query from the address bar, but nothing that measures the click loses it, so the "medium, blinds attribution" claim does not hold. |
| Verdant Rivière Bracelet is set to Unlisted in Shopify, but its link drops the shopper on Shop All | The facts are right. Calling it a medium site defect is not. |
| Extra Meta PageView on every in-page URL change (colour pick, listing filters, sort, price band) | The finding got the cause and the fix wrong. Meta does get one extra PageView per colour pick or filter tap, but PixelEvents does not send it, and the proposed fix would change nothing Meta receives. |
| Two PageViews for every KeepQuery redirect and every unknown /products/<handle> landing | The doubling comes from the test harness. In normal use Meta receives one PageView for a KeepQuery landing, not two. |
| If one small, optional code file fails to download, the whole product page is replaced by the 'This page didn't load' panel | The mechanism is real and I reproduced it. The headline outcome (the product page replaced by the panel and staying that way) only happens when a file returns 404 on every request. That is a test-harness condition, and I |
| A stalled Shopify cart call locks the bag on 'Adding to your bag…' with Checkout and Add to cart disabled, with no timeout | The code facts are right. src/lib/shopify.ts:300-308 (storefrontApiRequest) calls fetch with no AbortSignal, and nothing under src/ uses AbortController or AbortSignal. CartContext.addItemToCart (src/contexts/CartContext |
| 'N pieces sold in the last 48 hours' is a hash of the handle, shown on all 136 PDPs including 11 sold-out pieces | The facts are right, but this is something the owner already knows about and chose to keep, so it is not a new defect. |
| OAuth consent page can hang forever on a network error (no try/catch in either async path) | I ran the test on the live site, https://nairaflore.com/.lovable/oauth/consent?authorization_id=verify59, using iPhone 13 emulation. A fake signed-in session was seeded in localStorage under sb-xlsejigpjlqfvzfhhntf-auth- |
| three.js (139 KB) and the flower scene load on Shop All and block the main thread for 0.74–1.06 s; product pages are clean | I reproduced the measurements on the live site, but the behaviour is intended. The owner's decision keeps the flower still only on product pages, not on listings. |
| Home 'Loved by Women Everywhere' carousel cannot be scrolled by keyboard | I tested this on the live site, https://nairaflore.com/, using Chromium 141.0.7390.37 through Playwright. I tried two layouts: a Pixel 7 phone at 412px wide, and a 375px-wide window with no touch, which is what a desktop |
