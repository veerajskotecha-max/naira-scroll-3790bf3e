# Mobile CRO and Smoothness Audit Plan

## Executive rating

**Overall: 6.4/10**

| Journey stage | Score | What is working | Main risk |
|---|---:|---|---|
| Product discovery | 7.1/10 | Clear jewellery categories, stable square tiles, useful filtering and sorting | Long two-column grid, limited comparison information, two purchase buttons per tile add visual weight |
| Product page | 6.3/10 | Strong photos, visible price/rating, size buttons, clear purchase actions, delivery and returns accordions | All gallery images can load eagerly at original size; dots replace thumbnails; multiple overlays compete for attention |
| Cart | 7.3/10 | ₹150 delivery and total are explicit, quantity editing is clear, checkout action stays visible | Promo, membership opt-in, upsells and trust content compete at the final decision point |
| Checkout handoff | 6.1/10 | Shopify cart and branded payment URL are integrated; campaign and Meta identifiers are retained | Redirect screen has no manual fallback or timeout; payment experience itself still needs device-level verification |
| Mobile smoothness | 5.9/10 | Listing images use responsive sizes; reels are delayed and cached; desktop-only effects are mostly guarded | PDP gallery lacks responsive sizing/priority control; several fixed layers and a video preview can coexist |
| Trust and persuasion | 5.6/10 | Real photo reviews, returns, delivery estimate, contact details and plating assurance are available | Random “just bought” identities/times are synthetic and risk undermining luxury trust |
| Accessibility | 6.8/10 | Most primary controls are 40–48px; key dialogs use accessible foundations | Some header/filter controls are below the preferred 44px target; overlay focus and collision states need testing |
| Measurement | 7.8/10 | Browser and server Meta events share event IDs; campaign parameters survive redirects | `AddPaymentInfo` can fire before checkout validity is confirmed; no audited funnel report was available here |

This is a heuristic score, not an A/B-test result. It is based on the current code, published-page response, project analytics, and established ecommerce research.

## Evidence and diagnosis

- **Mobile is the business-critical experience:** 9,346 of 9,920 visitors in the last 30 days were on mobile (94.2%). The same period recorded 72% bounce, 1.91 pages per visit and 71 seconds average session duration. Recent daily bounce frequently reached 80%+. These figures show friction, but do not by themselves prove which interface element caused it.
- **Product pages deserve first priority:** Baymard’s 2026 benchmark reports only 38% of mobile product pages as decent or better, and identifies resolvable product-page issues as a direct cause of abandonment. [Baymard](https://baymard.com/blog/current-state-ecommerce-product-page-ux)
- **The largest confirmed speed issue is the PDP gallery:** the current jewellery page renders every gallery image without responsive `srcSet`, explicit dimensions, lazy loading for later images, or high priority for only image one. That can make a phone download multiple full Shopify originals immediately while the catalogue, fonts and tracking also initialize.
- **Gallery discoverability is weaker than the imagery:** the page uses dots plus “1/6”. Baymard found mobile users overlook important images when only dots/text represent additional views; visible thumbnails perform better. [Baymard](https://baymard.com/blog/always-use-thumbnails-additional-images)
- **The purchase core is comparatively strong:** title, price, rating, size buttons and two purchase actions appear early; size choices use visible buttons rather than a hidden dropdown, consistent with Baymard’s sizing guidance. [Baymard](https://baymard.com/blog/use-buttons-for-size-selection)
- **The PDP has attention competition:** sticky purchase bar, FOMO popup, reel preview, header, toast layer and full-screen viewers have separate fixed positioning and z-index rules. The reel and sticky purchase bar are independently positioned near the lower mobile viewport.
- **The FOMO popup is a trust risk:** names, cities, products and “minutes ago” values are randomly assembled rather than order-backed. NN/g advises avoiding deceptive patterns that improve short-term business outcomes at the user’s expense, and notes that poorly timed overlays interrupt critical tasks. [Deceptive patterns](https://www.nngroup.com/articles/deceptive-patterns/) · [Popups](https://www.nngroup.com/articles/popups/)
- **Cart cost transparency is good:** ₹150 insured delivery is shown before payment and included in the total. This is important because unexpected extra costs are a major abandonment driver. [Baymard](https://baymard.com/checkout-usability/benchmark/step-type/delivery-options)
- **Cart is too busy for its purpose:** cross-sells, promo entry, optional Inner Circle email capture and payment reassurance all sit close to checkout. Each is defensible alone, but together they increase decision load just before payment.
- **Checkout needs a recovery route:** the floral redirect screen calls the external payment URL once and can remain indefinitely if an in-app browser blocks or delays the navigation. It has no “Continue to secure checkout” fallback.
- **The published collection response is healthy at the server level:** the live `/jewellery` HTML returned successfully in about 0.49 seconds and contained the intended content. This does not measure phone LCP/INP after scripts and images execute.
- **Research target:** keep LCP at or below 2.5s, INP below 200ms and CLS below 0.1 at the 75th percentile. Faster mobile experiences have repeatedly correlated with improved conversion, but exact uplift should not be promised before testing. [Google](https://developers.google.com/search/docs/appearance/core-web-vitals)

## Recommended implementation order

### 1. Protect first paint and interaction — highest priority

- Make only the first PDP image eager and high priority.
- Give all PDP images responsive Shopify widths, `srcSet`, `sizes`, dimensions and asynchronous decoding.
- Lazy-load every gallery image after the first and prefetch only the adjacent image after the page settles.
- Replace dot-only navigation with a compact horizontal thumbnail strip without making the page taller.
- Lazy-load the full reviews implementation and its large review data below the purchase section.
- Keep reel metadata deferred; change the preview video from unconditional `preload="auto"` to metadata/poster-first loading, promoting to video only when the preview is actually visible.

**Success check:** cold-load an in-stock and sold-out PDP on a throttled mobile profile; record LCP, INP, CLS, transferred image bytes and long tasks.

### 2. Simplify the mobile buying surface

- Preserve the current order: image → name/rating → price → size → Add to Cart / Shop Now.
- Keep one persistent purchase bar after the inline buttons leave view.
- Coordinate all fixed elements through one shared safe-area and layer system.
- Never show the reel preview and FOMO popup together; suppress both while cart, menu, image viewer or size guide is open.
- Anchor the reel preview above the measured sticky-bar height instead of a fixed pixel offset.
- Remove the duplicate reel minimise control and ensure the remaining control is at least 44px.

**Success check:** test at 360×800, 390×844 and 430×932 with browser text enlarged; verify no overlap, hidden price, accidental taps or blocked controls.

### 3. Replace synthetic persuasion with credible proof

- Remove random buyer identities, cities and invented purchase times.
- Preferred replacement: show anonymized, delayed, real order activity only when a genuine order event exists.
- If real order activity is not available, use a small static trust cue tied to verifiable facts: real review count, 2-year plating assurance, 7-day returns or delivery date.
- Keep the real, product-relevant photo reviews first and clearly separate verified submissions from curated copy.

**Success check:** no urgency statement appears unless its source and timing are truthful; dismissals persist for the full session.

### 4. Reduce cart decision load

- Keep item, quantity, price, ₹150 shipping, discount and final total in the first cart view.
- Keep the promo field collapsed.
- Move “Complete the look” below the essential order summary or remove it from the drawer for an initial test.
- Move Inner Circle signup after purchase, or at minimum below checkout with no visual competition against the payment action.
- Track checkout only after a valid checkout URL is confirmed; do not count `AddPaymentInfo` before payment details are actually reached.

**Success check:** a shopper can verify item, size, delivery charge and final payable amount, then start checkout without scrolling through optional content.

### 5. Make payment handoff failure-proof

- Add a visible “Continue to secure checkout” link using the exact generated payment URL.
- Reveal it automatically after approximately three seconds; add a clear retry/back-to-cart state after a longer timeout.
- Preserve all discount, campaign and anonymous matching parameters.
- Verify guest checkout, UPI/cards/wallets, address entry, validation, back navigation and order review in Instagram and Facebook in-app browsers plus Chrome and Safari.
- Confirm the payment page keeps order summary and total accessible; Baymard identifies a visible/easily accessible summary as essential confidence at payment. [Baymard](https://baymard.com/learn/payment-ux)

### 6. Validate with a controlled measurement plan

- Establish a seven-day baseline: product view → Add to Cart → checkout start → purchase, segmented by mobile browser, landing page and campaign.
- Release performance fixes first, then simplification, then trust-message changes; do not ship all persuasion changes as one experiment.
- Track: mobile product-view-to-cart rate, cart-to-checkout rate, checkout-to-purchase rate, revenue per session, PDP exits, image interactions and reel opens.
- Use median and 75th-percentile Core Web Vitals, not a single laboratory run.
- Review after enough traffic for directional stability; avoid claiming an uplift from the current 72% bounce alone.

## Keep unchanged

- Current transparent ₹150 delivery charge.
- 7-day return messaging.
- Two-year plating assurance.
- Visible ring-size buttons and adjustable-fit wording.
- Sold-out labels on collection tiles and preorder/reservation options only on the PDP.
- Direct Shopify checkout, Meta browser/server deduplication and campaign-parameter preservation.

## Expected outcome

The first release should target **7.5–8/10** by making product pages materially lighter, keeping the buying controls unobstructed, reducing cart distractions and making checkout recoverable. A score above 8 should only be claimed after real-device Core Web Vitals and funnel data confirm improvement.
