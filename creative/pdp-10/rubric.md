# Rubric for a 10/10 Naira jewellery product page

Version 1, 13 Nov 2026. Scope: the Prism Rivière Bracelet page (₹2,399) as the model for every Naira jewellery PDP. The shopper is on a ~360x640 Android phone, half the time inside the Instagram in-app browser, arriving from a Meta ad, and 45% of orders are COD.

Inputs: `FACTS.md` (the only allowed facts), `research_audit.md` (the live page), `research_data.md` (funnel and orders), `research_bench.md` (8 brands), plus the web sources listed at the end. In the text, `[S#]` is a web source and `[N]` is Naira's own data.

---

## 1. Scoring method

**Scale.** Score each criterion from 0 to 10 against its anchors:
- **10:** the 10/10 description is fully met.
- **8:** one small gap.
- **6:** the 6/10 description.
- **4:** present, but flawed in a way that costs sales.
- **2:** missing.
- **0:** harmful or dishonest.

Multiply each score by its weight and add them up, then divide by 10. That gives a page score out of 100; divide by 10 again for "x/10".

**score_now.** This is what the page would deliver if it shipped today with only true content.
- Score from the rendered prototype and its HTML, never from intent or notes.
- Any shopper-visible statement not supported by `FACTS.md` counts as a defect (see gates). It earns no credit for the criterion it was trying to serve.
- A proposal may appear only in notes outside the page frame, labelled PROPOSED, never on the page. The live example is "extra 5% off when you pay online".

**Criteria that need real-world inputs.** Some criteria depend on reviews, a video shoot, a policy change, a courier API, hi-res photos, an ad-to-page map or an owner decision. For each of these:
- The criterion carries two 10/10 anchors: **"10 today"**, the best honest design with today's inputs, and **"10 with input"**.
- score_now uses the "10 today" anchor, so a page is not punished for a review count it cannot honestly have.
- These criteria are listed together in section 4. Report a second figure, **score_with_inputs**, by re-scoring them against "10 with input", but only once the input exists.

**Gates (applied before adding up):**
- **G1, honesty.** The gate trips on either of these:
  - any shopper-visible text (alt text, JSON-LD and meta tags included) that contradicts `FACTS.md`;
  - anything from its "Never on this page" list, in any wording. For example, "does not turn your skin" is a skin claim just as "skin-friendly" is.

  If it trips, C3 = 0 and **the page total is capped at 60**. Two good reasons: India's CCPA dark-patterns guidelines name false urgency, drip pricing and disguised advertisement as prohibited [S29], and invented proof is what the live page is being replaced for [N].

  A claim that is merely outside `FACTS.md` but does not contradict it costs 2 points per instance on C3 (floor 0). An example is a comparative such as "far harder than regular plating".
- **G2, buy reach.** If Add to bag or Buy now cannot be tapped on the first screen at 360x640, C1 is at most 3.
- **G3, fresh renders.** Score only renders made by `render.sh` after the last HTML change. If a render and the HTML disagree, re-render before scoring.

  On 13 Nov they already disagreed: `fold.png` shows a trust row reading "7 day exchange & returns", while the HTML reads "Faulty? Sorted within 7 days". Whichever version ships, the word "exchange" or "returns" without "manufacturing fault/defect" trips G1, because the policy covers defects only.

**Evidence rule.** Every score cites its evidence: a file plus a y coordinate (`fold.png` is 2x, so halve its pixel values for CSS px), a `measure.json` key, or an HTML line. Use two scorers where possible and average them. If the scorers are more than 2 points apart on any criterion, they discuss it and re-score.

**Measurement gaps to close before scoring speed.** `measure.json` has no LCP and no "bytes before first scroll". Its `imageKB` (651) is the whole `proto/i` folder, not what loads first. Add to `shoot.js`:
- a PerformanceObserver LCP reading under CDP throttling (150 ms RTT, 1.6 Mbps, 4x CPU; the audit's run E);
- the bytes transferred and image requests before any scroll;
- the size of the hero as fetched.

---

## 2. Weights at a glance

The weights follow where Naira loses shoppers [N]:
- PDP view to add to cart is 8.5%, so **91% of views end without an add**. The first screen, media, speed and message match carry 37 points.
- Add to cart to checkout is about 20%, flat across every top ad. After-add and price certainty carry 8, and the offer carries 14.
- COD is 45% of orders, with 21% RTO against about 1% prepaid. This sits in the payment line (C8).
- AOV is ₹1,511 against ₹979 of ad cost per order. This sits in the ladder and the set (C6, C7).
- Trust carries 16, because every proof signal on the live page is invented.

| # | Group | Criterion | Weight | Needs real-world input? | Live page, rough, for calibration only |
|---|---|---|---|---|---|
| C1 | First screen | The decision set fits in 640px | 10 | Partly (courier API for a precise date) | 4 |
| C2 | First screen | Clean first screen: the hero shows the piece, nothing covers or half-cuts content | 5 | No | 2 |
| C3 | Trust and proof | Honesty: zero invented proof or urgency, every claim traceable (gate G1) | 8 | Partly (owner confirms the compare-at basis) | 0 |
| C4 | Trust and proof | Real proof, shown with confidence | 5 | **Yes (reviews)** | 1 |
| C5 | Trust and proof | Policy truth at the point of decision | 3 | Partly (policy improvement, courier API) | 1 |
| C6 | Offer and AOV | Ladder as rupee outcomes, automatic, one offer | 5 | No | 7 |
| C7 | Offer and AOV | Complete the set: one tap, running total | 5 | No | 6 |
| C8 | Offer and AOV | Payment line: COD stated, prepaid nudged honestly | 4 | **Yes (owner confirms the prepaid incentive)** | 3 |
| C9 | Product truth | Measurable specs in correct material wording | 4 | No | 4 |
| C10 | Product truth | Fit and scale certainty | 3 | Partly (wrist-scale photo) | 4 |
| C11 | Product truth | Care and objection answers | 3 | No | 1 |
| C12 | Media | Gallery: complete, swipeable, sharp, light | 5 | Partly (hi-res originals) | 6 |
| C13 | Media | Video and creator content | 3 | **Yes (video shoot, more creator clips)** | 4 |
| C14 | Mobile UX and a11y | Tap targets, contrast, type size, semantics | 5 | No | n/m |
| C15 | Mobile UX and a11y | A buy control is always reachable; structure stays scannable | 4 | No | 3 |
| C16 | Speed | Speed budget in the Instagram webview | 8 | Partly (field data to confirm) | 5 |
| C17 | Ad message match | The landing echoes the ad that was tapped | 6 | **Yes (ad-to-asset map, kept current)** | 1 |
| C18 | Brand and elegance | Visual restraint on brand tokens | 4 | No | 5 |
| C19 | Brand and elegance | Copy voice: specific, quiet, correct | 2 | No | 4 |
| C20 | After add-to-bag | Add feedback and the next step | 4 | No | n/m |
| C21 | After add-to-bag | Price certainty all the way to paying | 4 | Partly (owner wording for the COD fee) | 5 |
| | | **Total** | **100** | | |

Group totals:

| Group | Points |
|---|---|
| First screen | 15 |
| Trust and proof | 16 |
| Offer and AOV | 14 |
| Product truth and detail | 10 |
| Media | 8 |
| Mobile UX and accessibility | 9 |
| Speed | 8 |
| Ad message match | 6 |
| Brand and elegance | 6 |
| After add-to-bag | 8 |

n/m means the audit did not measure it.

---

## 3. Criteria

### First screen (15)

#### C1 · The decision set fits in 640px · weight 10

**10/10.** At 360x640, with the 77px header and the sticky bar in place, one screen shows all of these, each fully legible and none under the bar:
- The piece itself, worn, so it is in scale.
- The name.
- The price, with GST noted.
- The ladder as per-piece rupees: ₹2,159 / ₹1,919 / ₹1,679.
- One line with free insured delivery, the date window marked as an estimate (e.g. "est. 18–20 Nov") and "COD available".
- Add to bag with the price on the button, plus Buy now.

Every fact is one line and nothing wraps. The delivery and COD line ends at or above the bar's top edge (`measure.json firstScreen.factsClearOfBar = true`).

**6/10.** Image, name, price and a buy button are visible, but one of these is missing or sits under the bar: the ladder, the delivery date, COD. Or the date reads as a courier promise ("by 18–20 Nov" with no estimate wording).

**How to check.**
- `fold.png` at 2x: read off the y of each item.
- `measure.json firstScreen` (h1, facts, barTop).
- Confirm on `fold.png` that no fact line wraps.
- Grep the HTML for the delivery string and its estimate wording.

**Evidence.**
- Meta and Branding Brand ("Stick the Landing", 500 landing experiences) recommend critical product information "within the first two viewports" and a sticky CTA [S23].
- Baymard: 64% of users looked for shipping cost on the product page before adding to cart, and 21% of US shoppers abandoned because they could not see the total cost upfront [S2]. 67% of sites give no total-cost estimate near the buy section [S1].
- In the bench, only Ana Luisa and GIVA put name, price, rating and a buy button inside 640px. Only Palmonas states COD on the PDP, and it is not on the first screen [N bench].
- Naira: 91% of PDP views end without an add, and the live first screen lacks the ladder, the in-page add, delivery and COD [N].

**Input.** Design alone gives "10 today" with the estimate wording. "10 with input" adds a courier-API date checked against the pincode, which needs a courier API.

#### C2 · Clean first screen · weight 5

**10/10.**
- The hero is the piece being worn, in its true aspect ratio or a deliberate crop that keeps the whole bracelet.
- Stones and halo are visible at phone size.
- No popup, toast, cookie banner, FOMO card or chat bubble ever covers the first screen.
- No text line is half-cut by the sticky bar: everything is either fully above it or fully below the fold.
- The gallery position indicator is visible but quiet.

**6/10.** The hero is right, but a strip of content peeks out cut under the bar. Or a transient overlay appears over secondary content (not the name or price) within the first 10 s.

**How to check.**
- `fold.png`, bottom 130px (2x): any glyphs clipped by the bar?
- Load the page, wait 10 s and screenshot again.
- Grep for setTimeout-driven overlays.

**Evidence.**
- The live page's FOMO card covers the H1 at 7.4 s, and the hero is a 3:4 photo cropped 1:1 [N audit].
- In the bench, Missoma's cookie dialog, A&M's modals, Salty's toast over the name and GIVA's bar over the price are the "avoid" list [N bench].
- Meta recommends making chat and promotional elements non-sticky [S23].
- Baymard: mobile designs make users "completely overlook important product images" or entire sections [S1 mobile benchmark page].

**Input.** Design alone.

### Trust and proof (16)

#### C3 · Honesty (gate G1) · weight 8

**10/10.** Every shopper-visible claim, including alt text, JSON-LD, the title tag and accordions, maps to a line in `FACTS.md`.

There is none of the following:
- reviews, ratings or star glyphs;
- "verified";
- sold counts, visitor counts, timers or "sale live today";
- press logos;
- hypoallergenic, skin or nickel claims in any wording;
- "real silver", "diamond", bare "18K gold" or NAIRA10;
- "returns" or "exchange" promises beyond defect cover;
- comparatives the sheet does not support.

"Only N left" appears only where stock is 5 or fewer and true (the Pear Drop Necklace at 3). The strike price ₹3,999 is small and grey, with no "% OFF" badge.

**6/10.** No Never-list item and no contradiction, but two outside-the-sheet claims. These are plausible yet unsupported, for example a process description or a comparative.

**How to check.**
- `grep -niE "review|rating|★|verified|sold|left|hurry|timer|today only|featured|press|hypoallergenic|skin|nickel|real silver|sterling|diamond|18k|naira10|return|exchange|refund|lifetime|warranty|assurance|atelier|mumbai|harder|stronger|premium quality|guarantee" proto/prototype.html`
- Then read every hit in context against `FACTS.md`.
- Check that JSON-LD `material` and `<title>` say "PVD rhodium coated surgical stainless steel", not "Demi-Gold".

**Evidence.**
- India's CCPA Guidelines for Prevention and Regulation of Dark Patterns (30 Nov 2023) list as specified dark patterns:
  - false urgency, "falsely stating or implying a sense of urgency or scarcity";
  - drip pricing;
  - disguised advertisement [S29].
- Mathur et al. crawled ~53K product pages on ~11K shopping sites. They found 1,818 dark-pattern instances, including 313 activity messages, 632 low-stock messages and 393 countdown timers, and 234 outright deceptive instances [S30].
- PowerReviews (n=6,538 US, vendor survey): 46% are suspicious of a perfect 5.0 average [S17].
- Spiegel: purchase likelihood peaks at ratings of 4.0–4.7 and falls as they approach 5.0 [S16].
- The live 4.9/51 is authored and identical on every PDP [N audit].

**Input.** Design alone, plus one owner confirmation: whether ₹3,999 was ever a real selling price or MRP. Until then, keep it unbadged; do not remove it, since it is a live Shopify fact.

#### C4 · Real proof, shown with confidence · weight 5 · needs reviews

**10 today (zero reviews).** The page earns trust without a rating:
- Riya's video, labelled as a creator video ("@riya · creator"; paid or barter, per CCPA's disguised-advertisement pattern).
- Real photos of the piece from several angles.
- The Naira gift box.
- A human contact on WhatsApp (+91 95615 57935).
- The Instagram handle, with no follower count.
- An honest review empty state with **no star glyphs**, saying how reviews are collected (asked 7 days after delivery, all shown as written).

These sit where a shopper looks for reviews, not buried. No store-level order counts appear unless the owner approves them: the Never list bars sold counts, and this rubric reads it strictly.

**10 with input.** At least 5 real reviews for this piece from a review app (Judge.me or Shopify Product Reviews):
- the average and count shown next to the title;
- a distribution bar, with photos navigable across reviews;
- negative reviews easy to find, with brand replies;
- a "verified purchase" label only where the app checks the order.

**6/10.** The empty state is honest but shows five grey stars or "0 reviews" next to the title. Or the creator video is unlabelled, or placed where no one finds it.

**How to check.** Read `screens_*.jpg` for the reviews block and the gallery's creator slide, look for star glyphs in the HTML, and check the label text on the creator media.

**Evidence.**
- Spiegel: a product with 5 reviews has 270% greater purchase likelihood than one with none; the lift is 380% for higher-priced products against 190% for lower-priced ones; verified-buyer badges improve the odds of purchase by 15% [S16].
- Baymard: 95% of users relied on reviews, and 53% specifically sought out negative ones. 37% factor a brand's replies to negative reviews into their view [S9]. 89% of sites do not respond to negative reviews, and 63% do not let users navigate reviewer images [S1].
- PowerReviews: 44% will not buy a product with no ratings or reviews (vendor survey) [S17].
- NN/g: indicate verified reviews, and let users find negative reviews quickly [S13].

**Input.** Real-world: install a review app and send post-delivery requests. This is the single largest gap between score_now and score_with_inputs.

#### C5 · Policy truth at the point of decision · weight 3

**10 today.** Within one tap of the buy buttons, in the shopper's words:
- "Faulty piece? Tell us on WhatsApp within 7 days of delivery for a repair, replacement or store credit." (the real policy);
- free insured shipping;
- that the delivery window is an estimate;
- that COD is available.

The policy link opens the actual policy. Nothing implies a change-of-mind return.

**10 with input.** The owner adopts a stronger policy (a recommendation only), for example a 7-day exchange on unworn pieces, and the page states it exactly. Delivery dates are courier-backed.

**6/10.** The policy is correct but sits only in the footer or in a fold far below the buttons. Or the trust-row label is ambiguous ("7-day returns", "Easy exchange").

**How to check.** Read the trust row on `fold.png` and `screens_1.jpg` (re-render first, per G3), read the "Delivery, COD & returns" fold in the HTML, and compare word for word with FACTS "Returns".

**Evidence.**
- Baymard: 60% of users look for return-policy information on the product page; 15% abandoned an order in the last quarter over an unsatisfactory policy; 44% of sites do not show or link it from the main product content [S1].
- Users read a stated delivery date as a promise. This finding is attributed to Baymard but I only saw it second-hand, so treat it as unverified.
- The live page promises "return it within 7 days if it does not suit you", which contradicts the policy [N audit].

**Input.** Partly: a policy change and a courier API raise the ceiling. Design gives "10 today".

### Offer and AOV (14)

#### C6 · Ladder as rupee outcomes · weight 5

**10/10.**
- The ladder appears once, on the first screen: any 2 pieces 10%, 3 at 20%, 4 at 30%.
- Each rung shows this piece's per-piece price in rupees (₹2,159 / ₹1,919 / ₹1,679).
- It says the discount applies automatically in the bag, with no code.
- Exactly one offer is visible: no NAIRA10, no stacked codes, no "up to X%".
- The rates match `promo.ts` and the BUY2/BUY3/BUY4 codes Fastrr receives.
- Rupee figures round the way the bag rounds.

**6/10.** The ladder is correct but shows percentages only, or sits below the fold. Or a second offer competes with it, such as an announcement strip with another code.

**How to check.**
- `fold.png` ladder block.
- Recompute: 2,399 × 0.9 = 2,159.1, × 0.8 = 1,919.2, × 0.7 = 1,679.3.
- Grep for NAIRA10 and other codes.

**Evidence.**
- Naira [N]:
  - 33 of 38 two-piece orders carried BUY2, and 17 of 17 three-piece orders carried BUY3.
  - The offer changed 4–5 times in 30 days, and the share of orders with 2+ items swung between 23% and 42%.
  - Fastrr carries exactly one coupon (CLAUDE.md).
- In the bench, GIVA's "Final price = ₹1,954" and Palmonas' "Get it for ₹750" show the offer as a rupee result. Inflated MRPs and stacked codes are on the avoid list [N bench].
- Berger's "Rule of 100" holds that above 100 (in a currency like the dollar), an absolute discount feels larger than a percentage. It is a heuristic with no published data [S31]; it supports showing rupees beside the percentage, not instead of it.

**Input.** Design alone.

#### C7 · Complete the set: one tap, running total · weight 5

**10/10.**
- A "make it a set" rail sits directly below the buy area or the first-screen trust row, showing 2–3 live pieces that genuinely pair with the bracelet: the Prism Hoops ₹1,299, the Pear Drop Necklace ₹999 (stock 3, "Only 3 left" allowed) and the Cushion Halo Ring ₹999.
- Each card has a full untruncated name, a real image, a price and a 44px "Add" button that adds without leaving the page.
- A running total updates in place: subtotal, rung reached, saving in rupees and the next rung.
- An "Add the set" button adds all of them.
- Section headings describe their contents truthfully: no "More bracelets" heading over a necklace and hoops.

**6/10.** The rail exists but its add buttons are under 40px, or titles are truncated, or there is no running total. Or the rail sits more than three screens down.

**How to check.**
- `screens_1.jpg`, second panel: the set rail.
- `measure.json smallTapTargets`: "+ Add" appears 3 times, which means the buttons are under 40px.
- In a browser, tap Add and confirm the total updates.

**Evidence.**
- Baymard: cross-sells need an adequately sized thumbnail, a fully visible title (55% of sites truncate), the price (15% omit it) and, where available, the rating and count. Users ignore suggestions that lack details [S10].
- Baymard's jewellery research lists "goes well together" merchandising [S12].
- In the bench, Missoma's matching pieces each have their own Add to Bag, GIVA has "Buy all 3", and Salty has "Best paired with" with a running total [N bench].
- Naira: 68–74% of orders are a single piece, and AOV ₹1,511 sits against ₹979 of ad cost per order [N].

**Input.** Design alone.

#### C8 · Payment line: COD stated, prepaid nudged honestly · weight 4 · needs an owner decision

**10 today.**
- "COD available" sits on the first-screen fact line, the owner's wording.
- Buy now shows the payment marks for UPI and cards.
- No prepaid discount is stated as fact.
- The proposed "extra 5% off when you pay online" appears only in the prototype notes, labelled PROPOSED.
- The COD fee is never hidden at the point of payment (see C21).

**10 with input.** Once the owner confirms the prepaid incentive (55 of ~105 prepaid orders already carried an exact 5% PrepaidDiscount at Fastrr), the line reads like "COD available · extra 5% off when you pay online", in rupees for this piece. COD keeps equal visual weight: the nudge is not confirm-shaming and COD is not hidden.

**6/10.** COD appears only inside an accordion. Or a prepaid discount is stated as fact without confirmation, which is a G1 risk.

**How to check.** Read the fact line on `fold.png`, and grep for "prepaid", "online" and "5%".

**Evidence.**
- Naira: COD is 44.7% of orders; matured COD RTO is 21.4% against 1 of 104 prepaid; prepaid orders are more often multi-piece (38% vs 25%) [N].
- Razorpay (updated Jun 2026) cites ET Prime Research (2024): 60–65% of Indian e-commerce orders are COD. It puts COD RTO at 25–30% and prepaid at 2–3%, without a source for those two figures [S28].
- In the bench, only Palmonas among the four Indian brands states COD on the PDP [N bench].
- NN/g: show the price including product-specific extra charges [S13].

**Input.** An owner decision for the prepaid line. Design gives "10 today".

### Product truth and detail (10)

#### C9 · Measurable specs in correct material wording · weight 4

**10/10.** One scannable spec block, open by default or one tap away, reads exactly:
- Length 18 cm; fits wrists 15–19 cm.
- Stones: cushion-cut pastel cubic zirconia, about 5 mm, in aqua blue, soft pink and pale yellow, repeating, each in a clear pavé halo.
- Fold-over clasp.
- Metal: surgical stainless steel with PVD rhodium coating.

The same wording runs through the page title, H1 area, alt text and JSON-LD. Nothing says "Demi-Gold", "silver" or "diamond".

**6/10.** The specs are correct but scattered through prose. Or one spec is missing (stone size, for example). Or the title/meta still carries a template word ("Demi-Gold").

**How to check.** Read the Details fold in `screens_1.jpg` (fourth panel) and `screens_2.jpg`, and grep `<title>`, `og:` and `ld+json`.

**Evidence.**
- Baymard's jewellery research: describe materials, dimensions and features in text so shoppers do not infer them from images [S12].
- In the bench, Mejuri (2.5 micron, 3.6 x 1.6 mm), Missoma (3.9 mm band, 2.5 mm stones, 3.6 g) and A&M (16.3 mm, 1.33 g) give measurable claims [N bench].
- NN/g: be complete without being wordy, key points first, explain unfamiliar terms [S13].
- The live page titles a rhodium piece "Demi-Gold Jewellery" [N audit].

**Input.** Design alone.

#### C10 · Fit and scale certainty · weight 3

**10 today.**
- The first image shows the bracelet on a wrist.
- A gallery or detail image or caption states "18 cm · fits wrists 15–19 cm".
- A one-line "how to measure" appears ("measure where you wear a watch; add 1–2 cm for ease" only if FACTS supports it, otherwise just "measure where you wear a watch").
- The size-guide image is reachable from the spec line.

**10 with input.** A dimension-marked photo (the bracelet beside a ruler or on a marked wrist) and a stone-scale macro with a mm marker.

**6/10.** Fit is stated only in the spec table, with no on-wrist reference near it.

**How to check.** Read the hero on `fold.png`, the "Fits wrists of 15 to 19 cm" card in `screens_1.jpg` (third panel) and the size-guide link.

**Evidence.**
- Baymard: 42% of users try to judge size from product images; at least one in-scale image is needed [S3]. 37% of sites lack one, and 23% lack human-model images for worn products [S1]. Use real models, with at least one unstyled on-model image [S4].
- Dimension markups in images help: one tester said "I like the dimension picture" [S5].
- Naira: the weakest PDPs with traffic are multi-size rings at 16–19% ATC/LPV. Fit help is a hypothesis to test [N].

**Input.** Partly: a dimension photo shoot. Design gives "10 today".

#### C11 · Care and objection answers · weight 3

**10/10.**
- Care in the listing's own words: waterproof and tarnish free, so daily wear and water are fine; keep away from perfume and harsh chemicals.
- 3–5 questions a shopper actually has, answered only from FACTS:
  - "Is it real silver?" No: surgical steel with a PVD rhodium coating.
  - "Shower?"
  - "Will it fit?"
  - "Is the offer automatic?"
  - "What if it arrives faulty?"
- No answer adds a claim (skin, durability comparatives, lifetime).

**6/10.** The answers are useful but one adds an unsupported claim. Or the care text is generic and not from the listing.

**How to check.** Read the Questions and Care folds in the HTML.

**Evidence.**
- Meta's landing-page guide names "answers to common questions" as one of three key elements [S23].
- The live page's generated Q&A invented a "3-year plating assurance" and skin-safety [N audit].

**Input.** Design alone.

### Media (8)

#### C12 · Gallery: complete, swipeable, sharp, light · weight 5

**10 today.**
- 6–9 real images in a swipe gallery with a position indicator: worn on the wrist (first), on the plaster block, over velvet, a stone macro, from above, the gift box, and the creator video as a poster frame.
- Each image is served at the needed DPR from a responsive srcset, never upscaled.
- Pinch or tap zoom fetches a larger image.
- An image caption or alt text says what each image proves.

**10 with input.** Originals at least 1,440px wide, so DPR 3 phones (1,080 device px) get a sharp image; Shopify currently returns at most 896x1200 [N audit].

**6/10.** Good set and swipe, but the hero is cropped, there is no zoom, or below-the-fold slides download eagerly.

**How to check.**
- Count the dots on `fold.png` (8 dots) and walk through the gallery images.
- Check `srcset`/`sizes`/`loading` attributes in the HTML.
- Measure the hero bytes in the network log.

**Evidence.**
- Baymard: 56% of users' first action on a product page is exploring images [S5][S7]. 25% of sites have images too small or with too little zoom; low-quality images "can be worse than no images"; fetch a higher-resolution image when users zoom [S7].
- On mobile, swiping is mandatory. Dots are acceptable, though some users misread them as colour swatches; 34% of mobile sites use thumbnails [S6].
- Meta recommends photos "from different angles or in lifestyle shots" [S23].

**Input.** Partly: hi-res originals. Design gives "10 today".

#### C13 · Video and creator content · weight 3 · needs a shoot

**10 today.**
- Riya's video sits in the gallery, as Baymard places all video, with a clear "Video" marker.
- It is a poster image until tapped, so no MP4 bytes load before a tap.
- It is muted with captions if autoplayed in view.
- It is labelled as a creator video, and repeated in a "Worn by" section with the creator credited.
- Any second clip is also labelled.

**10 with input.** A 6–10 s product-only macro turn under light (the stones' colour play) and a short on-wrist movement clip, each under 1 MB, plus 2–3 more labelled creator clips.

**6/10.** The video exists but only below the fold, unlabelled, or loading megabytes before it is asked for.

**How to check.** Check the gallery's last slide on `fold.png`, the "Worn by" panel in `screens_1.jpg`, and the network log for .mp4 requests before a tap.

**Evidence.**
- Baymard: 41% of users watched product videos, and those who did said it helped them imagine the product in their own life. Place all videos in the gallery; repeating them lower on the page is fine [S8].
- CCPA "disguised advertisement" means creator content must be labelled [S29].
- The live reel loaded 3.44 MB [N audit].

**Input.** Real-world: a video shoot. Design gives "10 today".

### Mobile UX and accessibility (9)

#### C14 · Tap targets, contrast, type size, semantics · weight 5

**10/10.**
- Targets: every interactive target is at least 44x44 CSS px (none under 24, the WCAG 2.2 AA floor), with at least 8px between neighbours.
- Contrast: body and price text meet 4.5:1 and large text 3:1.
  - Ink #1A1614 on ivory is 16.4:1.
  - Deep sage #50726A on ivory is 4.8:1.
  - Gold #9A7A3E on ivory is only 3.7:1, so gold may carry only large or decorative text.
  - 52%-ink grey on ivory is 3.6:1, so it is not usable for prices or policy text.
- Type: body 15–16px. Uppercase tracked labels are at least 11px and never the only carrier of a price, rate or policy.
- Semantics:
  - one H1 and ordered H2s;
  - buttons named;
  - gallery images with alt text;
  - an aria-live region for bag updates;
  - visible focus;
  - `prefers-reduced-motion` respected;
  - `lang="en-IN"`.

**6/10.** Primary buttons are 48px, but secondary ones (set "+ Add", accordion rows) are 36–40px. Or the ladder labels or strike/GST text fall under 4.5:1 at 10–11px.

**How to check.**
- `measure.json smallTapTargets` (the threshold in `shoot.js` is 40px).
- Compute contrast for each text colour/size pair from the CSS variables.
- Run an axe-core pass in Playwright.
- List any font-size under 11px in the HTML.

**Evidence.**
- WCAG 2.2 SC 2.5.8 (AA): targets at least 24x24 CSS px or spaced so 24px circles do not intersect [S27].
- NN/g: touch targets at least 1 cm x 1 cm [S15].
- Shopify recommends thumb-zone CTAs of about 48px [S26].
- Baymard: 63% of mobile test users abandoned a product or site at least once purely because of preventable usability issues, insufficient hit areas among them [S11].
- WCAG 1.4.3 contrast of 4.5:1 is cited from the standard as known; I did not open it this session.

**Input.** Design alone.

#### C15 · A buy control is always reachable; structure stays scannable · weight 4

**10/10.**
- At every scroll position, a usable Add to bag/Buy now is on screen, whether in the page or in the sticky bar. The sticky bar:
  - hides only while the in-page buttons are fully visible below the header;
  - never covers the facts;
  - hides near the footer.
- The bar carries the price.
- Accordions hold secondary content only: details, care, Q&A, delivery fine print. Their headers are plain words; they open without scroll-jumps, and Back closes them or behaves predictably.
- Nothing a shopper needs to decide (price, offer, delivery, COD, policy summary) is only inside a closed accordion.

**6/10.** The bar is mostly right, but there is a scroll band where no buy control is usable. Or a key fact (COD, policy) lives only in a closed fold.

**How to check.**
- Scroll in 100px steps in Playwright and record whether a visible, enabled buy button exists at each step.
- Read the accordion labels in `screens_2.jpg`.

**Evidence.**
- Meta recommends sticky CTAs and full-width CTA buttons [S23].
- NN/g: accordion headers act as a mini table of contents; avoid scroll-jumps; reserve accordions for secondary content [S14].
- In the bench, Ana Luisa, GIVA, Missoma and A&M hand off between the in-page button and the bar [N bench].
- The live page has a dead zone at scrollY 670–811 [N audit].

**Input.** Design alone.

### Speed (8)

#### C16 · Speed budget in the Instagram webview · weight 8

**10/10.** These are lab figures on the run-E profile (150 ms RTT, 1.6 Mbps, 4x CPU, 360x640, DPR 2–3):
- LCP at or under 2.0 s, with the hero as the LCP element: fetchpriority="high", never lazy, explicit width/height.
- CLS 0.
- Bytes before first scroll at or under 500 KB, excluding Meta and Clarity.
- No more than 6 image requests before scroll.
- All below-the-fold images `loading="lazy"` with sizes set.
- Zero video bytes before a tap.
- Fonts limited to the weights used, `font-display: swap`, with the hero not waiting on fonts.
- No render-blocking third party.

**6/10.** LCP 2.5–3.0 s, or about 1 MB before scroll, or below-the-fold images eager (the live page loads 37 of 38 at once). Or the hero is served larger than needed.

**How to check.** Add the LCP and bytes measurements described in section 1. Today's prototype HTML has no `loading=`, `fetchpriority` or `preload` attributes (grep), so score its design intent at 6 or below until they are added. A static file is not the live stack, so state the profile used.

**Evidence.**
- web.dev Vodafone: an A/B test with 50/50 paid traffic; 31% better LCP gave 8% more sales. The fixes were server rendering, a resized hero and deferred off-screen images [S18].
- Deloitte for Google, 37 brands and 30M+ sessions: a 0.1 s improvement across four speed metrics lifted retail conversions 8.4% and spend 9.2%. Luxury PDP-to-basket progression rose 40.1% [S19].
- web.dev: good LCP is 2.5 s or less at the 75th percentile; poor is over 4.0 s [S21].
- Nuvemshop: LCP pass rate 57% to 96% by loading the first carousel image first with fetchpriority and removing lazy-loading and transitions from first-position images; mobile conversion rose 8.9%. This is observational, not a controlled test [S20].
- Meta's guide recommends loading in under 3 s and deferring out-of-view content [S23]. Facebook said in 2016 it would consider website performance in ad delivery [S24].
- Google/SOASTA 2017: 53% leave a mobile page that takes over 3 s; abandonment likelihood rises 113% from 1 s to 7 s [S22].
- Naira's live page: LCP 2.07 s throttled, 1.00 MB, 37 of 38 images at load, a 3.44 MB reel [N audit].

**Input.** Design and engineering alone. Field data (RUM inside the Instagram webview) is needed to confirm, so report lab figures as lab.

### Ad message match (6)

#### C17 · The landing echoes the ad that was tapped · weight 6 · needs an ad map

**10 today.** The page reads `utm_content` (and the catalogue's `variant`) and, from a small map:
- opens the gallery on the frame the ad showed (Riya's frame for a creator ad, the studio frame for a catalogue ad);
- adds one quiet line echoing the ad's true promise, e.g. "As seen in Riya's reel";
- keeps the offer line identical to the ad's offer.

Price, facts and section order stay the same. An unknown or missing parameter falls back to the default. There is no extra redirect, the query string is kept for the pixel, and Back returns to the ad.

`fold-ad.png` (rendered with `utm_content=prism_sugar_p1`) must differ visibly from `fold.png`.

**10 with input.** A maintained ad-to-asset map covering every live ad (naming convention plus assets), owned by whoever launches ads.

**6/10.** The correct product and variant open with the query kept, but nothing on screen echoes the ad.

**How to check.** Run `cmp fold.png fold-ad.png`. On 13 Nov 2026 they are **byte-identical**, which scores 1–2. Grep the HTML for `URLSearchParams`/`utm_content`.

**Evidence.**
- Meta's guide says visitors should see "the same imagery and messaging from the ad" on the landing page [S23].
- Unbounce and Campaign Monitor swapped one headline verb to match the visitor's search term and got a 31.4% conversion lift: 1,274 visitors, 77 days, more than 100 conversions per variant [S25]. Note that this was search, not Meta.
- Naira's live page is identical across the plain, ad and catalogue URLs [N audit].

**Input.** Design builds the mechanism. Real-world: the map and assets per ad.

### Brand and elegance (6)

#### C18 · Visual restraint on brand tokens · weight 4

**10/10.**
- Fonts: Cormorant Garamond for names, prices and headings; Jost for everything else. `measure.json fontFamilies` must show exactly these two.
- Colours: ivory, ink, sage, deep sage, gold labels and blush only, with no new hex.
- Radius 0 everywhere; only the bag's checkout button may be 10px.
- No emoji, no red "% OFF" badges, no marquee, no flashing.
- The first screen has one dominant action (Add to bag in ink) and one quiet secondary (Buy now outlined).
- Generous whitespace, a consistent 16px gutter and a calm rhythm of section headings.
- It reads like Mejuri or Missoma editorial pages, not a coupon wall.

**6/10.** On-brand fonts and colours, but at least one loud element (a coloured badge, a second accent, a busy strip) or cramped spacing in the buy area.

**How to check.** Use `fold.png`, `screens_*.jpg` and `measure.json fontFamilies`, and grep the HTML for hex values not in the token list and for `border-radius`.

**Evidence.**
- Bench: Mejuri and Missoma pair restraint with full information. Salty, GIVA and Palmonas stack badges and coupons [N bench].
- The brand rules are in FACTS "Brand" and CLAUDE.md (radius 0 with one exception, tokens).
- Baymard: 62% of mobile product pages rate "mediocre or worse", and none of the benchmarked sites is "perfect" [S1]. Elegance is not a substitute for the usability criteria above.

**Input.** Design alone.

#### C19 · Copy voice: specific, quiet, correct · weight 2

**10/10.**
- Short, concrete, sensory lines that describe what the photo proves ("every stone in its own halo").
- Indian English, with ₹ and Indian digit grouping.
- Creators named and labelled.
- Headings that describe their content.
- No clichés ("elevate", "timeless", "must-have"), no exclamation marks, no unverifiable superlatives.
- The fact line and buttons read in under 2 s.

**6/10.** Pleasant but generic. Or one mislabel, such as a "More bracelets" heading over a necklace and hoops.

**How to check.** Read the full HTML text, as extracted for this rubric.

**Evidence.** NN/g: put key points first, because users skim [S13]. Bench copy contrasts are in [N bench].

**Input.** Design alone.

### After add-to-bag (8)

#### C20 · Add feedback and the next step · weight 4

**10/10.** On Add to bag:
- The button changes state ("Added · View bag").
- The bag icon count updates.
- A confirmation appears that does **not** cover the price, ladder or delivery line. It stays until dismissed or for at least 4 s, and is announced to screen readers.
- The confirmation offers both next steps (Checkout / View bag, and keep browsing) and states the ladder progress in rupees: "Add 1 more piece · save ₹X on your bag".
- It points straight at the set rail.

**6/10.** The confirmation exists but is a 2 s toast. Or it covers the ladder or price. Or it offers no path to checkout.

**How to check.** Use `added.png`. The 13 Nov render shows the toast laid over the ladder row and the delivery line, which scores 6 or below. Measure how long the toast stays in the HTML.

**Evidence.**
- NN/g: clear add-to-cart feedback, either a persistent notification or a confirmation screen, which should include "continue shopping" [S13].
- Baymard: small "added" labels are easily overlooked on mobile [Baymard grocery add-to-cart article, seen only as a search snippet].
- Naira: add to cart to checkout is about 20%, the lowest step, and flat across all top ads, which points at the site [N].

**Input.** Design alone.

#### C21 · Price certainty all the way to paying · weight 4

**10/10.**
- Buy now goes straight to Fastrr checkout with this piece, the single-piece path for the 68–74% of orders that are one piece.
- The bag total equals what the PDP led the shopper to expect: the ladder rung reached and free shipping.
- The COD fee (5% at Fastrr) is shown in rupees in the bag before the shopper leaves for checkout.
- Delivery and COD are repeated in the bag.
- No item is pre-added.
- The PDP's own wording never implies "no extra charges".

**6/10.** The bag is correct, but the COD fee first appears inside Fastrr. Or Buy now goes to the bag rather than to checkout.

**How to check.** Check Buy now's target in the HTML. This needs the bag (CartDrawer) render, which the current prototype does not include; score from the bag code or a bag render, and say which.

**Evidence.**
- CCPA "drip pricing" means revealing price elements late in the purchase journey [S29].
- Baymard: 21% abandoned for not seeing the total cost upfront [S2].
- NN/g: show the price including product-specific extra charges [S13].
- Naira: the fee is booked as shipping by Fastrr, and the owner's rule puts it in the bag, not the PDP [N].

**Input.** Partly: the owner decides whether the PDP fold may say "any COD fee shows in your bag before you pay". This is recommended because the drip-pricing risk falls on the PDP-to-bag journey.

---

## 4. Criteria that need real-world inputs (score_now uses "10 today")

| Criterion | Input needed | Owner of the input | What it unlocks |
|---|---|---|---|
| C4 Real proof | Review app plus post-delivery requests (7 days), with photo reviews; reach at least 5 reviews on hero pieces | Owner / ops | A rating and count beside the title. Spiegel's 5-review threshold [S16] |
| C8 Payment line | Confirm "extra 5% off when you pay online" as a standing offer | Owner | The prepaid nudge on the first screen, against 21% COD RTO [N] |
| C13 Video | A 6–10 s macro turn, an on-wrist clip, 2–3 more labelled creator clips | Content | Video in the gallery that sells colour play [S8] |
| C17 Message match | Ad naming convention and an asset map per live ad | Whoever launches ads | Ad-specific hero frame and promise line [S23] |
| C1 / C5 Delivery | Courier API for pincode-backed dates | Ops / dev | A dated promise instead of an estimate |
| C5 Policy | Optional: a better policy, e.g. a 7-day exchange on unworn pieces (a recommendation) | Owner | A stronger trust row [S1: 60% look for the policy on the PDP] |
| C10 / C12 Photos | Originals at least 1,440px wide; a dimension-marked wrist photo | Content | Sharp zoom on DPR 3; scale proof [S3][S7] |
| C3 Compare-at | Confirm the ₹3,999 basis | Owner | Keeping the strike price without legal doubt |
| C21 COD fee wording | Allow "any COD fee shows in your bag" on the PDP fold | Owner | Removes drip-pricing doubt |
| C16 Speed | RUM or field LCP from the Instagram webview | Dev | Replaces lab-only scoring |

---

## 5. Calibration: what the 13 Nov prototype renders already trip

Use these to check that scorers read the anchors the same way. They are not the critique.

- **G1/C3:**
  - "which is why it does not tarnish **or turn your skin**" (HTML, Questions): a skin claim in other words, so the gate trips.
  - "It is **far harder than regular plating**": a comparative outside FACTS, −2.
  - "bonded to surgical steel **in a vacuum**": a process description outside FACTS, −2 unless the owner or supplier confirms it.
- **G3:** the trust row under the bar reads "7 day exchange & returns" in `fold.png`/`screens_1.jpg`, while the HTML says "Faulty? Sorted within 7 days". Re-render. If "exchange" ships, it contradicts the policy.
- **C2:** the trust row's text is half-cut under the sticky bar on the first screen.
- **C4:** the review empty state prints five grey star glyphs (`★★★★★`, aria-hidden), which read as a rating at a glance.
- **C7/C19:** "More bracelets" heads a necklace and hoops. The "+ Add" buttons are 36px tall (`measure.json` lists 3).
- **C14:** the ladder rung labels are 10px gold (3.7:1). "incl. GST" and "each" are 11px, and strike prices 11–13px, all at 52% ink (3.6:1). The footer is white on sage (2.2:1). All of these are under 4.5:1. The page has `lang="en"`, not `en-IN`.
- **C16:** no `loading`, `fetchpriority` or `preload` attributes; `measure.json` has no LCP.
- **C17:** `fold-ad.png` is byte-identical to `fold.png`.
- **C20:** the toast in `added.png` sits over the ladder and the delivery line, and disappears after 2.6 s (`setTimeout` 2600), with no checkout link inside it.
- **C21:** there is no bag render to score.
- **Allowed and true:** "Only 3 left" on the Pear Drop Necklace (stock 3). The ladder prices match: ₹2,159 / ₹1,919 / ₹1,679. Fonts are Jost and Cormorant only. The H1 sits at 418px and the facts end at 573px, just clear of the bar at 575px.

---

## 6. Sources

**Opened this session** (WebFetch, 13 Nov 2026):
- **[S1]** Baymard, "Current state of e-commerce product page UX" (24 Oct 2023, updated 18 Mar 2026). https://baymard.com/research-articles/current-state-ecommerce-product-page-ux
  - 62% of mobile product pages are "mediocre or worse"; only 38% of mobile sites are "decent" or better.
  - 42% of users judge size from images; 37% of sites lack in-scale images; 23% lack human-model images.
  - 67% give no total-cost estimate near the buy section.
  - 44% do not show or link the return policy; 60% of users look for it on the PDP; 15% abandoned over the policy.
  - 78% show no gifting options on the PDP.
  - 89% do not respond to negative reviews; 63% do not let users navigate reviewer images.
  - The mobile product-page benchmark page (https://baymard.com/mcommerce-usability/benchmark/mobile-page-types/product-page) says mobile designs make users "completely overlook" images or whole sections.
- **[S2]** Baymard, "Show shipping costs on product pages" (Holst, 20 Jun 2017). https://baymard.com/research-articles/show-shipping-costs-on-product-pages
  - 64% of users looked for shipping cost on the PDP before adding to cart; 43% of sites do not show it.
  - 21% abandoned for not seeing the total cost upfront.
- **[S3]** Baymard, "All products need at least one In Scale image" (Holst, 30 May 2017). https://baymard.com/research-articles/in-scale-product-images
  - 42% judge size from images.
  - Show wearables on a human model.
- **[S4]** Baymard, "Human model images" (Reeves, 1 Dec 2020). https://baymard.com/research-articles/human-model
  - Without model images users have lower confidence and misjudge size.
  - Use real models and an unstyled on-model image.
- **[S5]** Baymard, "Include descriptive text or graphics for some product images" (Scott, 28 Nov 2018). https://baymard.com/research-articles/product-images-descriptive-text
  - 56% of users explore images first.
  - Captions and dimension markups help.
  - 52% of sites do not provide them.
- **[S6]** Baymard, "Use thumbnails for additional product images" (20 Oct 2020, updated 10 Nov 2026). https://baymard.com/research-articles/always-use-thumbnails-additional-images
  - Mobile users are far less likely to overlook images.
  - Swiping is mandatory; dots are acceptable but can be misread as swatches.
  - 34% of mobile sites use thumbnails.
- **[S7]** Baymard, "25% of sites don't have sufficient image resolution or zoom" (Scott, 2 Apr 2020). https://baymard.com/research-articles/ensure-sufficient-image-resolution-and-zoom
  - Low-quality images can be worse than none.
  - Fetch hi-res on zoom.
- **[S8]** Baymard, "Product page videos: where and how to embed them" (Holst, 14 May 2019). https://baymard.com/research-articles/embedding-product-page-videos
  - 41% watched videos.
  - Put all videos in the gallery.
  - Video helps users imagine the product in their own life.
- **[S9]** Baymard, "Respond to negative user reviews" (Hugo-Terrey, 6 Aug 2019). https://baymard.com/research-articles/respond-to-negative-user-reviews
  - 95% relied on reviews; 53% sought negative reviews.
  - 37% value brand replies.
- **[S10]** Baymard, "6 list item attributes for cross-sell recommendations" (Collins, 23 Mar 2021). https://baymard.com/research-articles/product-page-suggestions-information
  - Cross-sells need a thumbnail, a full title (55% truncate), the price (15% omit) and the rating with count (50% omit).
- **[S11]** Baymard, "Understanding mobile e-commerce UX: 5 overarching issues" (Scott, 26 Jan 2021). https://baymard.com/research-articles/mobile-commerce-design
  - 63% of mobile users abandoned at least once due to preventable usability issues.
  - Insufficient hit areas were seen on all sites.
- **[S12]** Baymard, Jewelry & Watches research topic (undated, © 2026). https://baymard.com/research/jewelry-and-watches
  - Show pieces worn for scale.
  - State materials and dimensions in text.
  - Include fit guides and "goes well together" cross-sells.
- **[S13]** NN/g, Sherwin, "UX guidelines for ecommerce product pages" (24 Nov 2019). https://www.nngroup.com/articles/ecommerce-product-pages/
  - Must-haves include the price with product-specific extra charges, availability, a clear add-to-cart and clear add feedback ("continue shopping").
  - Reviews should surface negative ones and show verified status.
- **[S14]** NN/g, Budiu, "Accordions on mobile" (31 May 2015). https://www.nngroup.com/articles/mobile-accordions/
  - Headers work as a mini table of contents.
  - Avoid scroll-jumps.
  - Use accordions for secondary content.
- **[S15]** NN/g, Harley, "Touch targets on touchscreens" (5 May 2019). https://www.nngroup.com/articles/touch-target-size/
  - Touch targets should be at least 1 cm x 1 cm.
- **[S16]** Spiegel Research Center (Northwestern), "How online reviews influence sales" (page dated 4 Dec 2025; findings from 2017). https://spiegel.medill.northwestern.edu/How-Online-Reviews-Influence-Sales
  - 5 reviews give 270% greater purchase likelihood than none; 380% for higher-priced products against 190% for lower-priced.
  - Ratings peak at 4.0–4.7.
  - Verified badges add 15% to the odds of purchase.
  - Negative reviews add credibility.
- **[S17]** PowerReviews, "Power of reviews" survey 2021 (n=6,538 US; vendor). https://www.powerreviews.com/insights/power-of-reviews-survey-2021/
  - 44% will not buy without reviews.
  - 46% are suspicious of a 5.0 average.
  - 96% seek negative reviews at least sometimes.
- **[S18]** web.dev, Vodafone case study (17 Mar 2021). https://web.dev/case-studies/vodafone
  - A/B test: 31% better LCP gave 8% more sales.
- **[S19]** web.dev / Deloitte, "Milliseconds make millions" (2019 data; 37 brands, 30M+ sessions). https://web.dev/case-studies/milliseconds-make-millions
  - 0.1 s faster gave +8.4% retail conversions and +9.2% spend.
  - Luxury PDP-to-basket rose 40.1%.
- **[S20]** web.dev, Nuvemshop (24 Jun 2026). https://web.dev/case-studies/nuvemshop
  - LCP pass rate went from 57% to 96%.
  - Mobile conversion rose 8.9% (observational).
  - Fixes: fetchpriority on the first carousel image, no lazy-loading at the top, no transitions in first-position sections.
- **[S21]** web.dev, "Largest Contentful Paint". https://web.dev/articles/lcp
  - Good is 2.5 s or less at p75; poor is over 4.0 s.
- **[S22]** Search Engine Journal on Google/SOASTA mobile speed benchmarks (28 Feb 2017). https://www.searchenginejournal.com/google-new-industry-benchmarks-mobile-page-speed/
  - 53% leave a mobile page that takes over 3 s.
  - Abandonment likelihood rises 113% from 1 s to 7 s.
  - 70% of pages are over 1 MB.
- **[S23]** Meta and Branding Brand, "Stick the Landing" (Apr 2022; 500 landing experiences), **via secondary summaries**: https://www.searchenginejournal.com/meta-conversion-whitepaper/447416/ and https://www.socialmediatoday.com/news/meta-publishes-new-guide-on-landing-page-best-practices/622743/
  - Load in under 3 s.
  - Carry the ad's imagery and messaging onto the page.
  - Put critical product information in the first two viewports.
  - Use sticky CTAs; make chat and promos non-sticky.
  - Show products from different angles and in lifestyle shots.
  - Defer out-of-view content.
  - I could not open the PDF itself.
- **[S24]** Social Media Today on Facebook's mobile prefetching post (1 Sep 2016). https://www.socialmediatoday.com/social-networks/facebook-announces-prefetching-prompts-advertisers-improve-mobile-response
  - Facebook would begin "considering website performance and a person's network connection" in ad auction and delivery.
- **[S25]** Unbounce, Campaign Monitor dynamic text test (3 Apr 2018). https://unbounce.com/landing-page-examples/built-using-unbounce/dynamic-text-a-b-test/
  - Matching the headline verb to the search query gave a 31.4% lift (1,274 visitors, 77 days).
- **[S26]** Shopify, "What is PDP in ecommerce" (Keenan, 23 May 2025). https://www.shopify.com/blog/what-is-pdp-in-ecommerce
  - Put shipping timelines and fees on the PDP.
  - Use thumb-zone CTAs of about 48px.
  - 67% of sites lack buyer-generated visuals (citing Baymard).
- **[S27]** W3C, WCAG 2.2 Understanding SC 2.5.8 Target Size (Minimum), Level AA. https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
  - Targets at least 24x24 CSS px, or spaced so the 24px circles do not intersect.
- **[S28]** Razorpay, "Cash on delivery" (updated 10 Jun 2026). https://razorpay.com/blog/cash-on-delivery/
  - COD is 60–65% of Indian e-commerce orders (ET Prime Research 2024).
  - COD RTO is 25–30% against prepaid 2–3%; these RTO figures are unsourced.
  - Suggests incentives and a COD fee.
- **[S29]** King Stubb & Kasiva on India's CCPA Guidelines for Prevention and Regulation of Dark Patterns, 2023 (issued 30 Nov 2023). https://ksandk.com/md/newsletter/safeguarding-consumer-rights-dark-patterns-guidelines-2023/
  - 13 specified patterns, including false urgency, basket sneaking, drip pricing, disguised advertisement, interface interference and nagging.
  - This is a law-firm summary; I did not open the gazette text.
- **[S30]** Mathur et al., "Dark Patterns at Scale" (ACM CSCW 2019). https://webtransparency.cs.princeton.edu/dark-patterns/
  - About 11K shopping sites crawled, with 1,818 instances.
  - 313 activity messages, 632 low-stock messages, 393 countdown timers.
  - 234 instances were deceptive.
- **[S31]** Jonah Berger, "Fuzzy math" / Rule of 100. https://jonahberger.com/fuzzy-math-what-makes-something-seem-like-a-good-deal/
  - Above 100, absolute discounts seem larger than percentages.
  - Illustrative only; no data given.

**Not opened, or not used as evidence:**
- WCAG 1.4.3 contrast (4.5:1 / 3:1) is cited from the standard as known.
- The Baymard "delivery date read as a promise" and "small added-to-cart labels missed on mobile" findings were seen only as search snippets.
- Meta's Help Center page on ad relevance diagnostics returned an empty body.
- Claims that the Instagram in-app browser converts 35–50% worse come from redirect-tool vendors only; not used.
- Award search: no Webby or Awwwards e-commerce award was found for Mejuri, Missoma, Monica Vinader or Ana Luisa. Awwwards lists jewellery product pages (John Hardy, Sova) as inspiration, without confirmed awards. These brands are used as best-in-class references through the bench teardown, not as award winners.
- Monica Vinader and Mia by Tanishq blocked capture in the bench.

**Naira data [N]:**
- `research_data.md`: Meta browser pixel 16 Oct–12 Nov; Shopify orders 14 Oct–13 Nov; ads 30 days.
- `research_audit.md`: live code at origin/main bd412960; Playwright runs A–E.
- `research_bench.md`: 8 brands at 360x640 on 13 Nov.
- `FACTS.md`: verified 13 Nov 2026.
