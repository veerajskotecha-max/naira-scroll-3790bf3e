# Bag review

Branch `pdp-clean-bag` in `/tmp/pdp-bag`. Reviewed from head `982b0643`; after the fixes the head is `f878a643` (three commits by the reviewer).
Viewports: 360x640 (Instagram Android in-app user agent, touch), 390x844 (iPhone), 1440x900, 1280x720, device scale 1.
Every Storefront cart call was answered locally (0 without a local answer in every run), trackers and checkout hosts were aborted, no WhatsApp link was opened, nothing was pushed or deployed.

Evidence, all under `review/bagrev/`:

| What | Where |
|---|---|
| Scripts | `states.cjs`, `flows.cjs`, `align.cjs`, `a11y.cjs`, `swap.cjs`, `emptyslow.cjs`, `rm.cjs`, `track.cjs`, `other.cjs`, `other2.cjs`, `today.cjs`, `edge.cjs`, `short.cjs`, `swipe.cjs`, `warm.cjs` |
| Every seeded state, final | `sheets/fin-p360.png`, `sheets/fin-p390.png`, `sheets/fin-d1440.png` (single screens `shots/fin-*.png`) |
| Every moving state, final | `sheets/flows-p360.png`, `sheets/flows-p390.png`, `sheets/flows-d1440.png` (single screens `shots/flow-*.png`) |
| Beside himscience, Palmonas and today's bag | `sheets/compare-p390.png`, `sheets/compare-p360.png`, `sheets/compare-d1440.png` |
| Narrow phones, long names, large totals; a phone on its side | `sheets/edge.png`, `sheets/short-screens.png` |
| Font swap, early and late | `sheets/swap.png` |
| Empty bag while the catalogue is slow | `sheets/empty-slow.png` |
| The bag opened from five pages | `sheets/bag-from-pages-p390.png` |
| Numbers | `data/fin.json`, `data/flows.json`, `data/track.json`, `data/*.log` |

Verdict before the fixes: the engineer's bag was already calmer than Palmonas's and close to himscience's. It was not yet at their level in five places a designer sees at once (D1 to D5) and four a phone or keyboard user meets (A1 to A3, A6). All nine are fixed. Nothing that sells went quiet, and tracking is identical.

---

## 1. Graphic designer

Held beside `ref/hims/cart-1item-p390.png` and `ref/palmonas/shots/cart-390-s01.png` (`sheets/compare-p390.png`).

| # | Found | Measured before | Fix | Measured after |
|---|---|---|---|---|
| D1 | Two rules met above the foot: every line closed with a hairline and the foot opened with one | 390x844, four pieces: hairlines at y 611 and y 613, 2px apart. 360x640, two pieces: an empty band 44px high boxed between two rules (24px with two rings). A long bag scrolled to its end: one 2px rule. 1440x900, four pieces: a 58px boxed band | Rules sit between lines only (`border-t`, none on the first); the foot's hairline closes the list | One rule above the foot in every state. First line 122px, the others 123px (138px with a choice line) |
| D2 | The 2px gold line did not stop under the rung it marks: the rungs sat inside 16px of side padding, the line runs edge to edge | 390: middle of "Buy 2" at x 75.7, line ends at x 65. 360: 70.7 against 60. ("Buy 3" was exact.) | The rungs' columns run the full width of the sheet | 390: 65 / 65, 195 / 195 (Buy 3). 360: 60 / 60, 180 / 180. 1440 drawer: the same by construction |
| D3 | The close cross hung inside the right edge that prices, "Remove" and Checkout share | cross's right end 21.5px from the sheet's edge; everything else 16px | The 44px target is flush with the edge and the cross is set 1px right inside it | 16.5px to the stroke's centre line, 16.0px to its round end. Nothing overflows the sheet (`scrollWidth` equals `clientWidth` at 280 to 1440) |
| D4 | A name's capitals started 5px below the top of its photograph | photo top y 115, capital top y 120 | The name's row gives back the 5px of air above a 14px capital in a 20px line; the stepper stays on the photo's foot | capital top y 115 to 116, stepper bottom equals photo bottom (y 205) |
| D5 | "Serpentine Whisper Chain — Silver" broke after the dash at 360, leaving "Silver" alone | 360x640 | Two-line names are balanced | "Serpentine Whisper / Chain — Silver" |
| D6 | The foot's gaps were 10 / 10 / 10, off the system's 4-8-12 scale | spec 8.3 | 8 over the trust lines, 8 over Checkout, 12 over the returns link (also A1) | foot 229px (was 231; today 259) |

Counted on the final build, 390x844 with two pieces (rubric rows 25 to 29 of `ref/HIMSCIENCE.md`; himscience's figures from its section 5, Palmonas's from `ref/REFERENCE.md` section 9, today's from `code-map.md` 4.3 and the audit):

| Rubric | himscience | Palmonas | Naira today | Naira new | Pass |
|---|---|---|---|---|---|
| 25 Colours | 6 (3 text colours) | 14 text colours | 10 text colours (ink, gold, seven strengths of ink, ivory), plus sage on two links and the card marks' own | 6: ivory, linen, ink, one muted ink, one rule, gold (the text gold and the brighter gold of the line and the star) | at most 6: yes |
| 26 Type styles / sizes | 8 in 3 sizes | 20 in 9 sizes | 13 sizes (9.5 to 20px), two faces | 7 styles in 3 sizes (13, 14, 20), one face; the empty bag adds the 11px label and the 12px small-button label | at most 8 in 3: yes |
| 27 Accent uses | 2 | green on the offer card, "FREE" and the savings | gold on the saving, "% off" and the stars | the reached rung, the 2px line, "% off" on each line, the saving sentence, the star ("Adding…" while a piece arrives): the spec's own list (check 31), more than himscience's 2 | spec's rule: yes |
| 28 Logos, marks, badges, coupon field, timers | 0 | coupon carousel, pay logos | Visa, Mastercard, banknote, 3 UPI discs | 0; svgs are the cross and the stepper's minus and plus only | 0: yes |
| 29 One piece fits 360x640 | yes (476 of 640) | no (the total is below the first screen) | yes; of two pieces, 1.6 show | two pieces fit with the total and Checkout on screen | yes |
| Radius / shadow | 0 / 1 | 6 radii, 1 shadow | 0 / 1 (the sheet's own) | 0 / 0 | yes |
| One filled button | 1 | 1 | 1 | 1 | yes |

Left as they are, on purpose:
- The trust lines are centred over the button while the total block is left-aligned. Two axes in one foot is a designer's flag; they are the owner's ask of 16 Nov, centred today, and read as part of the button group (trust, button, returns link all on the centre line). Kept.
- "% off" in gold on every line repeats one fact (six times in a six-piece bag). The spec keeps it gold so the bag's line reads like the product page's price row. Kept; it is the first thing to quieten if the owner finds the bag too gold.
- Check 29 says no border in ink. Two exist by the spec's own parts: the filled Checkout carries the button family's 1px ink border (the colour of its fill, invisible) and the empty bag's outlined "Add" (spec 8.4). Check 30 lists sizes 13, 14, 20 and the 11px label; the small button's 12px label (spec 2.5) is the fifth in the empty bag.

## 2. Conversion (360x640)

| Question | Today | New |
|---|---|---|
| First screen, two pieces | header, the sale line, the track with marks and labels, 1.6 lines, total, saving, terms, rating, card marks, Checkout | header with the count, the offer in one line, both lines whole, total, saving, terms, rating, ways to pay, Checkout, returns |
| Room for the lines | 219px (34% of the screen) | 312px (49%) |
| Checkout's top | y 545 | y 544 |
| Seen without a tap | price, discount, offer, choice, arrival date | the same: line total, struck price and "% off", the three rungs with the reached one gold, "Size: US 7", "arrives 25–27 Nov" |
| Taps to check out | 1 | 1 |
| Any added tap | - | none |
| What went quiet | - | "Sitewide sale live today · up to 30% off" (removed as untrue: the offer is permanent); the three UPI discs on the button and the Visa, Mastercard and banknote marks (now the words "UPI · Cards · Cash on delivery" directly above the button; owner question 2); the discounted price printed twice on a one-piece line (it is the figure at the right) |
| What got louder | - | the total (20px medium against 17px), the offer (words a shopper reads in one line instead of marks and two rows of labels), "Remove" as a word on phones |

Notes for the lead, no change made:
- On every opening the bag checks itself against Shopify and Checkout waits for the answer, as today. Today the waiting button is at 80% strength; the clean system's waiting state is 55% with a spinner, so the wait is more visible. It lasts as long as Shopify's `query Cart` (locally answered here, so no real figure). If the owner notices a grey flash on opening, the fix is in `clean.css` (frozen): a lighter waiting state for the filled button.
- With two or three pieces neither bag says what one more piece would take off; the rungs say it ("Buy 3 · 20% off" in ink beside the gold "Buy 2"). `ladderHeadline` only speaks while nothing is off. Left as today.

## 3. Phone and accessibility

| # | Found | Measured before | Fix | Measured after |
|---|---|---|---|---|
| A1 | The returns link's 44px target ran 2px under Checkout, and its line is 20px in a block, so only 41px answered to it | hit-test down the centre column: 41px | 12px above the link (to the button's edge and no further), its 20px line, 12px under it; Checkout needs no layer of its own | target y 596 to 640, button ends y 596: 44px, none of it under the button |
| A2 | With "reduce motion" on the sheet still slid in over 400ms (the clean system stills what is inside the sheet, not the sheet; same on origin/main) | computed animation `enter 0.4s`, sheet at x 58 mid-slide | `motion-reduce:!animate-none` on the sheet | animation `none`, x 0 at 50ms; X, Escape and the phone's back each close it within 120ms and focus returns to the bag button (`rm.cjs`) |
| A3 | Keyboard: pressing + or − disables the pressed button while Shopify answers, the browser drops focus, and the next Tab starts again at the close button (same on origin/main) | active element after +: the page's body, then the sheet | `cart/useKeptFocus.ts`: after a press from the keyboard, focus returns to the same button on the same line when the bag stops being busy; never after a tap, never if the shopper moved focus meanwhile, never to another line after a Remove | after +: "Increase quantity"; after − at two: the same button (now named "Remove …"); after Remove: the sheet, not the next line (`flows.cjs` keys, all three viewports) |
| A4 | ₹ and ★ are not in Google's Jost: both are drawn by the stand-in face, as on every price on the site today | width of ₹ in "Jost, monospace" equals monospace (12.04 = 12.04) | none (no new font file allowed) | - |
| A5 | The heading is Jost 300, a weight a listing page draws nothing in: it was fetched only when the bag first opened, so the heading began in the stand-in face | on `/jewellery`: 300 not loaded before the tap, 1 font file requested on opening | `cart/useBagFaces.ts`: the bag asks for its three weights when its code arrives (the faces index.html already lists) | 300, 400, 500 loaded before the tap on `/`, `/jewellery` and a product page; 0 font files requested by the bag on opening from `/jewellery` |
| A6 | The empty bag jumped when Shopify's catalogue arrived: the bundled catalogue cannot sell the first best-seller (no variant in it), so the second was drawn alone and dropped one place when the first came. A finger reaching for the hoops' Add met the bracelet's (same on origin/main) | catalogue held 4s: sentence y 226 then 183, button y 420 then 462, the hoops row one place lower; layout shift 0.029 at 360, 0.017 at 390 | Each best-seller keeps its own place from the first frame: a quiet block the size of its photograph holds a row that cannot be drawn yet | sentence y 183 / 183, button y 462 / 462, hoops row does not move; layout shift 0.0000 at both sizes (`sheets/empty-slow.png`) |

Measured on the final build, no change needed:

| Check | Result |
|---|---|
| Tap targets (every `a` and `button`, by box or pseudo-element, and hit-tested at four corners and the centre) | none under 44x44: cross 44x44, name links 44 high, stepper cells 44x44, "Remove" 55x44, Add 55x44, Checkout and Explore 52 high, returns 167x44 |
| Text under 13px | none with pieces in the bag; the empty bag has the 11px caps label (weight 500) and the 12px "ADD" |
| Contrast, computed for every text run against its ground | ink 16.37:1, muted 5.92:1, gold 4.83:1 on ivory, ivory on the ink button 16.37:1; the notices' ink on linen 15.25:1. Nothing under 4.5:1 but the ★ (2.33:1, decorative, hidden from screen readers) |
| Focus order | close, then per line: name, minus, plus, Remove; then Checkout, the returns link; Tab wraps inside the sheet. Focus lands on the close button on opening and returns to the bag button on closing |
| Visible focus | 2px ink, 2px off, on every stop (screens `flow-16-focus-*`) |
| Screen-reader names | dialog "Your bag 2 pieces"; rungs read "Buy 2 · 10% off, in your bag"; progress bar "2 of 4 pieces"; "Quantity 1" is a live status; the struck price is a `<del>`; Undo is a status, the add error an alert; photo links are hidden duplicates of the name links |
| Font swap, Jost held back 3.5s, with a stand-in as wide as Jost (what a phone has through "Jost Fallback": Roboto or Helvetica Neue) | layout shift 0.0064 at 360x640, 0.0027 at 390x844: the foot is 1px taller in the stand-in, nothing re-wraps (`sheets/swap.png`) |
| The same with no stand-in at all (this sandbox has no Roboto, Helvetica or Arial, so Inter draws 9% wider) | 0.067 at 360x640 (the ring's name and the terms line wrap until Jost arrives), 0.009 at 390x844. A device without any of the three faces would see this once per first opening on a slow line |
| Photos | every `<img>` has its width and height; a slow photo moves nothing |
| Horizontal scroll | none at 280, 320, 360, 390, 1280, 1440 with the bag open |
| Safe areas | header `max(6px, env(safe-area-inset-top))`, foot `max(12px, env(safe-area-inset-bottom))` |
| A phone on its side (under 480px high) | the sheet scrolls as one piece and reaches Checkout (today: no lines shown and the button cut off) |
| Slow network | the arriving piece is listed at once with "Adding to your bag…"; Checkout waits with a spinner; steppers and Remove wait; the Undo notice stays 6s |

Not fixed, with the reason:
- Swipe-to-close does not work on either build: `useSwipeDismiss` never attaches its listeners to the sheet (0 touch listeners on the sheet on :5310 and :5321, a 240px rightward swipe leaves both bags open; `swipe.cjs`). The hook is frozen, and switching on a gesture the shop has never had is the owner's decision.
- Two buttons on a one-piece line are both named "Remove {name}" (the minus at one, and the word), and "Increase quantity" does not name its piece. Today's names, pinned by tests; left.

## 4. The keeper

| Check | Result |
|---|---|
| States of spec 8.6 | all reached and looked at, at three viewports: empty, one piece, two (Buy 2 reached), three, four, six (long bag), a ring with a size chosen on its page and added from there ("Size: 7"), a fixed-list ring ("Size: US 6"), metal and size, two of one piece ("₹734 each"), a typed code, adding into an empty and a filled bag, busy, syncing, error with pieces and in an empty bag, Undo after Remove, Undo after removing the last piece, opening checkout, laptop |
| A pre-order line | cannot occur: "Reserve now" opens WhatsApp (`JewelDetailNext.tsx` line 668 on origin/main) and never calls `addItem` |
| The gift box | origin/main's bag does not draw one (0 imports of `giftbox` in its `CartDrawerNext.tsx`); spec 8.5 says not added |
| Opening and closing | opens from the header and after Add to cart; closes by the X, Escape, the phone's back, a tap on the dimmed page (laptop), and before following a name link (back then returns to the page, bag closed) |
| Tracking | the same taps on :5310 and :5321 give identical records: every `fbq` call (all arguments), every request body to `meta-capi` (the shop's production gate held open, the request aborted before leaving), every Clarity event. Open: `bag_opened`. Close with pieces (X, Escape, name link): `bag_closed`; empty: nothing. Plus: 1 AddToCart (browser and server copy). Minus, Remove, minus at one: nothing. Undo: 1 AddToCart. Empty bag's Add: 1 AddToCart and `bag_empty_added`. Checkout tapped twice: `bag_checkout_tapped` once, 1 InitiateCheckout (value 2518, 3 items). No AddPaymentInfo |
| SEO | the bag carries none; no page's head changed |
| Other pages | `/`, `/jewellery`, a jewellery product page, an apparel product page (`/products/royal-enigma`), the returns policy and the wishlist drawer: 0 pixels differ from origin/main at 390x844 and 1440x900 once the page has settled (6s). The laptop home and product page differ between two runs of the same build while photos arrive (0 to 94,870 pixels, origin/main against itself), so they were repeated until main and branch matched at 0 |
| One bag everywhere | the bag opened from home, listing, product page, apparel page and policy: 0 pixels differ between them |
| Outside the lane | `git diff --stat pdp-clean`: the bag file and its tests, files under `cart/`, and 4 added lines in `src/components/clean/clean.css` (the engineer's `nc-price__now--sheet`; see the merge note) |
| Tests honest | none deleted; the engineer's tests read as real assertions. The reviewer's keyboard tests were first vacuous (jsdom does not drop focus from a disabled button): rewritten to drop it by hand and checked by breaking the hook, which fails two of them |

---

## What the reviewer changed (three commits on `pdp-clean-bag`)

1. `c2182d32`: D1 to D6, A1 to A3. Files: `CartDrawerNext.tsx`, `cart/BagLine.tsx`, `cart/BagOffer.tsx`, `cart/BagTrust.tsx`, new `cart/useKeptFocus.ts`; tests in `CartDrawerNext.test.tsx`, `cart/BagLine.test.tsx`, `cart/bagSheet.test.tsx`.
2. `7c088b73`: A5. New `cart/useBagFaces.ts` and its test.
3. `f878a643`: A6. `cart/BagEmpty.tsx`, `CartDrawerNext.tsx`; tests in `cart/BagEmpty.test.tsx`, `cart/bagSheet.test.tsx`.

## Final numbers

| Check | Result |
|---|---|
| 33. One and two pieces at 360x640 | lines 122 and 138 (with a choice line), both whole, the list does not scroll; total and Checkout on screen (Checkout y 544 to 596 of 640) |
| 34. Any number of pieces | Checkout's bottom inside the viewport: 596 / 640, 800 / 844, 676 / 720, 856 / 900; only `[data-bag-list]` scrolls |
| 35. Fixed parts at 360x640 | header 57, strip 42, foot 229, list 312 (limits 57, 44, 232, at least 305; today 55, 107, 259, 219) |
| 29. Colours | text ink, muted, gold, ivory on the button, the ★; fills ivory, linen, ink and the 2px line; borders the rule colour (and the buttons' own ink) |
| 30. Type | 7 styles; sizes 13, 14, 20 (11 and 12 added in the empty bag); one face |
| 31. Gold | the reached rung, the 2px line, "% off" on a line, the saving or next-rung sentence, "Adding…", the ★ |
| 32. Logos, marks, badges, coupon field, timers | 0 |
| 19. Tap targets | none under 44px |
| 10. Contrast | none under 4.5:1 but the decorative ★ |
| 18. Radius, shadow | 0, 0 |
| 20. Horizontal scroll | none |
| 21. Layout shift | font swap 0.0064 (360) and 0.0027 (390) with a width-matched stand-in; empty bag with a slow catalogue 0.0000 |
| 37. Tracking | identical to origin/main, browser and server copies |
| 39. Other pages | 0 pixels differ |
| 40. Checks | `tsc` clean; vitest 1,104 of 1,105 (the one failure is `src/hooks/useReels.test.ts`, which predates this work); `vite build` succeeds, `supabase/functions/mcp/index.ts` untouched; eslint clean on the lane's files; bag chunk 27.59 kB (8.70 kB gzip) |
