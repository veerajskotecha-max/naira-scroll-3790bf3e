# Prototype changelog

## Round 1 (13 Nov 2026): the four critiques applied

Backup of round 0: `rounds/prototype_v0.html`; its images are in `rounds/v0_i/`.

### Honesty (G1 cleared)
- Removed "does not tarnish or turn your skin", "in a vacuum", "far harder than regular plating", "sweat", "keeps the line flat" and "store it flat in its pouch". Care, Up close and Questions now use the FACTS listing words only.
- Removed "Faulty? Sorted within 7 days": the 7 days is the window for reporting a fault, not a promise to fix it. The policy now reads as written: manufacturing faults only, WhatsApp, 7 days, photos, repair/replacement/store credit, refunds case by case, worn or damaged pieces not covered. Fold renamed "Delivery, COD & faulty pieces", with a 44px link to the full policy.
- Reviews: the ★★★★★ and the untrue "we ask every customer…" line are gone. The block now says "No reviews for this piece yet", with WhatsApp (number written out) and @naira.flore as 48px buttons.
- Creator: "@riya" (a handle we have not verified) and "in her own video" are gone. Both tiles and the gallery slide read "Creator collaboration · Riya".
- **Riya's full reel carries "Two years plating guarantee" (~26 s) and calls the stones "zircon" (~22 s).** FACTS supports neither. The page plays only 18.5–21.8 s ("and this bracelet is the one" plus the Prism card): `v/riya-prism.mp4`, 142 KB, loaded only on tap. The live product video should get the same cut.
- Set-rail strike prices (20/10/40% ratios) removed. The hero ₹3,999 stays small and unbadged, with a hidden "Compare at" for screen readers, until the owner confirms its basis.

### First screen (360x640)
- Fact line is now "Free insured delivery, est. 18–20 Nov · COD available". The date is computed at runtime (today + 3–5 working days), so it is never a stale literal. Below 350px, "insured" drops so the line stays on one line.
- Bar is solid ivory; Buy now has an ivory fill. A 10px fade sits above the bar.
- Hero height is `clamp(220px, 100svh − 331px, min(110vw, 473px))`. Facts end 13px above the bar at 360x640, 360x600, 412x732 and 320x568.
- Hero recropped from p1 (art critic's crop B). The crop line is at the jaw, and the bracelet is larger.
- Ladder is a ruled line. Caption "Any pieces · taken off in your bag, no code" in 11px deep sage, labels in 11px ink-2, rupees in 19px Cormorant (Jost has no ₹), "each" in 12px.
- Price row: strike in Cormorant 15px ink-2, "incl. GST" at 12px, and "Arrives gift-boxed" in the free space at no extra height. Every price on the page is now set in Cormorant.
- "VIDEO" span is now a 44px button, "▶ Riya's video", which plays the clip. It shows only on the landing slide. Hero heart deleted.
- Dots replaced by a "1 / 7" counter.

### Buy path
- Add to bag adds exactly one bracelet. The bar then reads [CHECKOUT · bag total] and [BAG · n], and nothing re-adds.
- Buy now has a handler and carries the UPI marks, as the live button does. It sends this piece alone to checkout (prototype hand-off sheet) and fires AddToCart, then InitiateCheckout.
- The toast is gone. In its place is a card over the photo (y 85–325) that never covers price, ladder or delivery, and has no timer. It shows "Added to your bag", the ladder step, the Cushion Halo Ring at "Adds ₹659, not ₹999" with + Add, "Keep browsing" and "See the whole set". It closes on ×, on Keep browsing, or after 150px of scroll. A polite live region announces each change.
- After an add, the ladder caption reads from the bag ("1 in your bag · a second piece takes 10% off") and the rung in play is underlined.
- New bag drawer, the CartDrawer's job:
  - items with 44px −/+ and Remove;
  - subtotal, the single automatic code (BUY2/3/4) and free delivery;
  - total;
  - "COD fee ₹X · none if paid online";
  - Secure checkout with the 10px radius exception.

### Wear it as a set
- The set is a vertical list, all three visible at once, in this order: Cushion Halo Ring (rhodium match), Pear Drop Necklace, Emerald-Cut Hoops.
- Each row has the full name, price and metal line (FACTS wording), plus "Only 3 left" rendered from stock ≤ 5.
- Each row shows a live marginal line computed by promo.ts rules ("With the bracelet it adds ₹659, not ₹999"), and an 88x44 + Add that really adds to or removes from the bag.
- The summary reads only from the bag.
- "Add all four · ₹3,987" (outlined) adds only the pieces that are missing, the bracelet at most once. It names what it adds ("Add the other two · bag ₹3,987").

### Media and speed
- The gallery has 7 slides: worn, macro, plaster, Riya clip, velvet, size guide, gift box.
  - The Riya poster is her mehendi wrist frame.
  - The size guide is a ruler band with live text: "18 cm long · fits wrists 15–19 cm / Measure around your wrist bone." The FAQ matches it.
  - pu09 (blue sculpture) was dropped.
- Tapping a photo opens a full-screen viewer with the store's largest images from the Shopify CDN, a 44px close, Back to close and pinch zoom. The clip plays there.
- Slides 2–7 use data-src: the next one loads at idle and the rest on swipe. All other images are `loading=lazy` with width/height. The hero is preloaded with fetchpriority=high for whichever slide lands first.
- The three set thumbnails are one sprite. Fonts are trimmed to Cormorant 500 and Jost 400/500, loaded without blocking render.
- Lab measurements (http, 150 ms RTT, 1.6 Mbps, 4x CPU, 360x640 DPR 2):
  - LCP 1.79 s (the hero);
  - before scroll: 4 image requests, 155 KB of images, 310 KB in all;
  - all images in `i/` total 490 KB.

### Ad message match
- A head script reads utm_content tokens before paint. Asset tokens (p1/p4/p0/p2/riya…) pick the landing slide; angle tokens set the hero line. `riya`/`reel` land on Riya's slide with "From Riya's reel · creator collaboration". `prism_sugar_p1` opens on the worn photo with "See the pastel stones up close".
- fold-ad.png now differs from fold.png. The "sugar" entry is a placeholder for the ads owner to confirm.

### Structure, type, accessibility
- `lang=en-IN` and `<main>`. The buy bar comes right after the facts in the DOM, so Add to bag is tab stop 6.
- The gallery is a named carousel, the ladder a `<ul>`, and the bag button reports its count. Off-screen slide buttons are taken out of the tab order.
- Body copy is 15px and nothing is under 11px. Gold is used only for hairlines.
- Every target is at least 44px; measure.json lists no small targets. The header icons are 8px apart.
- Sections are spaced 48px apart (`.g` no longer cancels section padding).
- "More bracelets" deleted, along with the closing gift-box image, which repeated slide 7 and the first-screen line.
- Footer is deep sage with ivory text and links to Contact & business address and Returns policy. The bar steps aside at the footer.
- Tap highlight replaced with :active states; touch-action: manipulation on buttons.

### Declined or changed, and why
- **COD fee in rupees in the after-add card (CRO).** Declined on the page: the owner's rule is that the PDP says only "COD available". The rupee fee appears in the bag drawer, which is the live line, and the card line is in the PROPOSED notes.
- **Prepaid "extra 5% off" and the "MRP" label.** These sit in the PROPOSED notes outside the page, per FACTS.
- **Confirmation placement.** CRO wanted the lower gallery; trust and art wanted it under the header; UX wanted it in place only. I chose under the header, over the photo. Two of the three agreed, it never meets the facts at any scroll position, and the in-place caption and underline from UX are kept as well.
- **Trust row as icon trio (CRO, UX, trust) or text list (art).** I chose a text list with small glyphs. It carries the full policy sentence, which C5 asks for, and avoids the template look.
- **Set-rail strikes.** CRO wanted to keep them and trust wanted to remove them. Removed, because C7 needs the price, not a compare-at, and differing ratios read as a second offer.
- **"Only 3 left" or "3 in stock".** Kept "Only 3 left", which FACTS allows at stock ≤ 5, in ink-2 rather than red, rendered from stock.
- **Counter or square bars for gallery position.** Chose the counter (UX, Baymard S6: dots read as swatches).
- **Self-hosted woff2 with ₹.** Declined, because fonts must come from Google Fonts. Prices use Cormorant's own ₹ instead.
- **Changes to shoot.js and render.sh (UX).** Outside proto/, so not made here. I ran the same checks myself (4 viewports, double add, add then Add the set, throttled LCP, tab order).
- **Hoops link.** The handle is not in the repo snapshot, so the hoops thumbnail links to /jewellery until the handle is confirmed.
- **Riya's second tile.** It is a still with no play button, because the honest clip does not show the ring.

## Round 2 (13 Nov 2026): the four round-2 critiques applied

Backups of round 1: `rounds/prototype_v1.html`, images in `rounds/v1_i/`, changelog in `rounds/CHANGELOG_v1.md`.

### Buy path: no accidental actions, and no route off the page skips the COD fee except Buy now
- **Tap guard (CRO 1, UX 2).** Add to bag, each set row's + Add / ✓ In bag, the card's + Add and Add all ignore a second tap for 700 ms. A swallowed tap logs `nf_tap_guarded` and sets the Clarity tag `nf_tap_guarded=1`. Probed with raw touch taps:
  - two taps 120 ms apart give bag 1, no drawer and no checkout;
  - two taps on the ring row 150 ms apart give bag 1 (one AddToCart);
  - a deliberate tap after the guard still works.
- **After the bracelet is added, the bar is one full-width button, "View bag · ₹total" (trust 1, CRO 3's "no" branch).** It never goes straight to Fastrr. For the first 600 ms it reads "✓ Added to bag" (aria-disabled). InitiateCheckout now fires only from the bag's Secure checkout (`nf_checkout:drawer`) and from Buy now (`nf_checkout:buy_now`). Buy now still sends this piece alone. "Bag · n" stays as the second button only while the bag holds set pieces without the bracelet.
- **Bag footer (trust 2).** The COD figure is the line under Secure checkout: "₹3,987 paid online · ₹4,186 with COD (₹199 fee)". It is computed like payment.ts `codFeeFor` and stays in view with 1–4 pieces at 360x640 (y 605–628). The delivery estimate moved into the body ("Insured delivery, est. 18–20 Nov · Free").
- **Back (UX 3).** The bag, the viewer and the checkout hand-off each own one history entry. Moving from the bag to checkout replaces that entry, so Back closes the overlay and stays on the piece. Tab is trapped in the bag and the viewer, and focus returns to the opener.

### After-add card (CRO 2, art 5, UX 6)
- The card confirms the bracelet first: a 40x50 thumbnail, its name in Cormorant 18 and ₹2,399 in 15.
- It then makes one suggestion. Before any rung is reached the offer is on the suggestion itself: "Adds ₹659, not ₹999" / "10% off both". There is no separate ladder line.
- + Add on the card turns into an ink "✓ Added" that cannot remove. Nothing new is swapped in under the finger.
- The bag line reads "2 pieces · 10% off · you save ₹340 · bag ₹3,058". It goes under the suggestion when the photo has room for it. Where it does not, it takes the offer line's slot ("Bag ₹3,058 · you save ₹340").
- The hero chip is hidden while the card is open.
- Fit is measured against the photo:
  - On short viewports the card drops its pictures (compact), then the suggestion (nosug).
  - Added from the bar further down the page, it docks above the bar as two lines.
  - Card bottoms (after the ring is added from the card) at each viewport: 360x640 85–350 (354), 360x600 compact 293 (322), 360x560 compact 293 (294), 320x568 nosug 225, 390/412 333 (362). None reaches the H1.

### First screen
- Price row: "Surgical steel, PVD rhodium" replaces "Arrives gift-boxed" (trust 6, rubric C9). The gift box is now in the delivery fold, the spec list and slide 7.
- Ladder:
  - The caption is "Mix any pieces, no code · this bracelet becomes".
  - The rupees stand alone; "each" is gone because it was false for a bracelet plus ₹999 ring bag.
  - Rung labels are 12px (11px below 350px) and the figures are Cormorant 18.
- The hero is framed on the wrist: the worn slide uses object-position 50% 100%, so the piece is mid-frame at 320–412 wide and 560–846 tall. The cap is now min(125vw, 520px), so tall phones get a larger photo.
- Hero chip: "▶ Creator collaboration · Riya" (trust 5).
- First screen at 360x640: gallery 77–386, H1 398–426, facts end 562, bar 575 (13 px clear). Facts end 13 px above the bar at 360x600, 360x560, 320x568, 390x664 and 412x732, with no horizontal scroll at 320. At 390x844 and 412x846 the larger photo leaves 38 and 13 px.

### Type and art (art 4)
- Tokens: Cormorant 27/24/20/18/15 (500, lining figures) and Jost 15/13/12/11. There are no half pixels, and the census finds exactly these nine sizes (22 text styles, down from 34).
- The ₹1,709 hairline is now 15px, and set names are 500.
- Up close shows the whole macro at 360x396 (the height attribute no longer defeats the crop). It is a button that opens the viewer.
- The spec list (Stones, Setting, Colours, Metal, Length, Fits + "See the size guide", Clasp, Box) sits right under the macro, replacing the paragraph that repeated it and the Details fold. Specs start at y 2035 (they were at 3375).
- Gallery order is now worn, macro, plaster, velvet, Riya, size, box. The play plate sits bottom-left, clear of the stones.
- The size slide is an inline SVG ruler (0–24 cm, 18 cm bracelet, 15–19 cm wrist band). It replaces the bitmap, and `i/size-band.jpg` is deleted.
- Riya's tiles are cropped to 4:5, so the ceiling fan is gone. The second tile plays the clip instead of being a dead tap.
- Reviews' two outlined boxes are now one line of 44px text links.
- The gallery arrows show only for keyboard users (`:has(:focus-visible)` plus a `data-kbd` fallback), so a tap no longer leaves plates on the photo.

### Honesty and copy (trust)
- The ad map names a creator only when utm_content names her. `riya` lands on 5/7 with "From Riya's reel · creator collaboration". `morph_reel_4`, `prism_reel_v2` and `halo_pankti_creator` get the default fold.
- `dpa`, `catalogue`, `catalog` and `carousel` land on image 1 by rule. The unconfirmed "sugar" line is removed.
- The second Riya tile no longer names the ring.
- FAQ: "No. It is surgical stainless steel with a PVD rhodium coating, not silver." The care line keeps the listing's words only; the gift-box storage advice is gone.
- Delivery fold: "Cash on delivery is available; any COD fee is shown in rupees in your bag, and there is none if you pay online."
- The policy link is "Full policy (store-wide)" and goes to `#standard-orders`.
- "Only 3 left" is now "3 in stock" (still shown only at stock ≤5). "30% off the four pieces" replaces "30% off everything".
- WhatsApp links carry a prefilled message naming the piece.
- Set: the sub-line explains the pairing ("matches it in rhodium; … gold tone"). The empty-bag summary is gone (it repeated the ladder). The ring's metal line is split onto two lines, and the hoops thumbnail is no longer a link to /jewellery.

### Measurement
- One tap is one AddToCart. "Add all four" sends one event with `contents`, `num_items` and the rise in the bag total as value.
- Custom events: `nf_card_shown`, `nf_card_add`, `nf_set_add`, `nf_addall`, `nf_checkout{source}`. Every event carries `arm: pdp_b`, and `nf_arm` is set as a Clarity tag.

### Speed
- Fonts are attached after the landing frame loads, or after 1.2 s at most. Lab results (150 ms RTT, 1.6 Mbps, 4x CPU, 360x640 DPR 2, two runs each): round 1 LCP 1.77/1.78 s and round 2 1.38/1.39 s, with CLS 0.0029, 4 image requests and 156 KB before scroll.
- The ₹ in the notes is set in Cormorant, so no extra Jost subset is fetched. `i/` totals 478 KB.
- Riya's clip plays once with sound, then loops muted, and is drawn at full width.

### Declined or decided, and why
- **COD fee line in the card (CRO 3, first branch).** The owner rule keeps the fee off the PDP. I took CRO's other branch, which is also trust's fix: the post-add bar opens the bag, as the live page does.
- **UPI marks on the bar's checkout (CRO 5).** The bar no longer checks out. The marks are on the bag's Secure checkout, one tap later, beside the COD figure.
- **Ladder at Cormorant 20 (CRO) or keeping "each" (art).** Took art's 18 (type scale, a 1.33x step from the price) and CRO's removal of "each". The caption now says whose price it is. Honesty (C3, weight 8) outranks C19.
- **Naming the Cushion Halo Ring on Riya's tile (art), or linking it to the ring (UX).** Declined: FACTS records Riya wearing only the bracelet.
- **Keeping "Arrives gift-boxed" (art keep, CRO test 3).** The material wording takes the slot (trust, rubric C9). The A/B with "Waterproof · tarnish free" stays on the test plan.
- **Up close at 1:1 (UX) or the whole frame (art).** Chose the whole frame: both fix the bug, the difference is 36px, and nothing is cropped. UX's hero 72% rule below 620px is not needed, because 100% keeps the piece whole down to 560.
- **The colour-variation exclusion on the fold (trust).** It is on the live policy page but not in FACTS, and FACTS is outside proto/. It is in the notes for the FACTS owner.
- **"…before you pay" in the fold (trust, CRO).** Dropped, because it is not true for Buy now, which skips the bag.
- **The 896w Shopify original in the hero srcset (UX).** It is a 3:4 frame while the hero is a crop of it, so the framing would change between DPRs. It would also add about 35% to the LCP image on DPR 2.75–3 phones. Originals at 1440 are roadmap.
- **Re-encoding the clip at 540x960 (UX).** The only source is 270x480 (`img/video480.mp4`).
- **role=button on slide figures (UX).** The Riya slide holds a button, so this would nest interactive content. Enter on the focused track opens the viewer instead.
- **fold-ad.png now matches fold.png.** prism_sugar_p1's only confirmed token is p1, which is the default frame, and the guessed "sugar" line is gone at the request of CRO, art and trust. The rubric's C17 `cmp` check wants a visible difference; I chose not to print an unconfirmed ad promise. A creator ad (`prism_riya_reel`) still lands differently.

## Round 3 (13 Nov 2026): the four round-3 critiques applied

Backups of round 2: `rounds/prototype_v2.html`, images in `rounds/v2_i/`, changelog in `rounds/CHANGELOG_v2.md`.

### Buy path (CRO 1, 3, 4, 7, 8; UX 2, 7)
- **The bag's Secure checkout is guarded.** For 700 ms after the bag opens, every bag control except close ignores a tap (`nf_tap_guarded {control: checkout}`). The guard uses the bag's own timestamp, because the foot is rebuilt on every change, and it is re-armed after an add from the bag. Probed with touch taps 120 ms apart on the bar: the bag opens, the second tap is swallowed, and no InitiateCheckout fires. A deliberate tap after the guard still checks out, and Back still returns to the piece.
- **The COD figure sits above the button**, so it is read before the decision: "₹3,058 paid online · ₹3,211 with COD (₹153 fee)". With a rung applied, a deep-sage line above it repeats the saving ("You save ₹340 (10%, automatic) · free insured delivery"), so the saving stays in view at 3–4 pieces (UX P3).
- **Post-add bar: "Bag & checkout · ₹total"** in place of "View bag". The label is true (it opens the bag, whose primary is Secure checkout). It is named by its own text plus a hidden ", n pieces", with no aria-label.
- **One-piece bag:** under the total, a "Wear it with" row in the card's markup: the ring, "PVD rhodium · adjustable, US 5–9", "Adds ₹659, not ₹999 / 10% off both", and an 88x44 + Add (`nf_drawer_add`). If the one piece is a set piece, the row offers the bracelet at its own marginal rupees. Once added, the bag shows the applied line, and nothing new is swapped in under the finger.
- **Bag items** follow the set rows' idiom: name and price on one line, then the metal, then the stepper and "Remove <name>". With two pieces the Cormorant total sits at 450–496, above the foot at 511.
- **Card:** the ring's line reads "PVD rhodium · adjustable, US 5–9", balanced over two lines. Both thumbnails are 48px wide, so the names align. The counter hides while the card is open. "✓ Added" is named "Added: <name>". The card spans 85–360, or 85–364 after the ring is added.
- **No docked card over the set.** If the bar's Add is tapped while the set is on screen, no card is shown (`nf_card_shown {mode: none_set_visible}`); the rows, the summary, the bar's tick, the badge and the live region confirm the add. Elsewhere the dock is unchanged.
- **A set row's "✓ In bag" is inert**, like the card's tick. It is aria-disabled and named "In bag: <name>", and removal lives in the bag. The line beside it is now empty, because the button already says it.
- **The bar is on at every scroll position.** The footer observer is gone, and the footer pads by the bar plus the inset. At the end of the page the bar is at 575 and the footer links end at 545.
- **Instrumentation:**
  - `nf_bag_view {source: bar | bag_n | bag_icon, q, total}` on every open;
  - `nf_bag_exit {q, total}` when the bag closes without checkout;
  - Clarity tags `nf_bag_seen` and `nf_bag_exit`.

### Honesty and law (trust 1, 3, 5, 6, 7, 8)
- **Policy fold:** "Worn or customer-damaged pieces are not eligible, and we cannot take a piece back for a change of mind." These are the facts' own words. "Damaged after delivery" would have excluded a fault that shows after delivery. The FAQ now asks "What if it has a fault?".
- **Fit:**
  - The spec list adds "Ask about your wrist size on WhatsApp", prefilled "my wrist is __ cm".
  - The FAQ answer ends "Not sure? Send us your wrist measurement on WhatsApp."
  - The 18 cm against 19 cm contradiction is a pre-launch item in the notes (owner item 3).
- **Hero chip:** two lines, "▶ Riya's clip / Creator collaboration", with Riya's own mehendi frame inside it. The frame is `i/chip-riya.jpg`, a 2.7 KB crop of `reel1.jpg`. The chip is 170x52 at 10–180 x 324–376, clear of the counter. It no longer reads as a credit on the studio photo, and its name, "Play Riya's clip, Creator collaboration", contains its visible text.
- **The ladder underlines a rung only once it applies.** After one add, nothing is underlined while the bar says ₹2,399.
- **Reassurance list:**
  - New order: Questions (WhatsApp, @naira.flore), then Faulty piece? ("Read the policy"), then "Waterproof and tarnish free. Daily wear and water are fine. Surgical steel under a PVD rhodium coating."
  - Each item has a 500-weight ink lead and 13px ink-2 detail (art 3). The wording is unchanged apart from the material sentence.
- **Notes panel:**
  - New owner items: the COD-by-pincode conflict with `serviceability.ts`, the fit measurement, the meaning of "worn" under r.7(4), and the fold's COD sentence (with the wording recommended for every route).
  - New "Build notes for the live release": ship this bag with this page (delete BagReturns, add the COD line from `codFeeFor`, and tests), no announcement marquee on jewellery PDPs and no "sale live today" or "limited batches", Product JSON-LD from FACTS, the safe-area hero term, and the new events.
- **Product JSON-LD in the head,** built from FACTS fields only, with no aggregateRating and no "adjustable".

### Art (art 1–8)
- **One heading for Up close:** "Every stone in its own halo" is the h2, and the generic "Up close" h3 is gone.
- **Copy:**
  - The ladder caption is "Mix any pieces, no code · the bracelet's price".
  - The set note is "30% off all four · you save ₹1,709".
- **Riya:**
  - Slide 5's plate says only "Play".
  - Both tiles carry a Play plate.
  - The captions are "Her wrist, with mehendi · creator collaboration" and "Riya, with mehendi · creator collaboration".
  - The tile images are alt="" inside their buttons, so the names match the visible "Play" (axe label-in-name).
- **The ruler labels say which mark is which:** "wrist 15–19 cm" over the band and "bracelet 18 cm" at the bar's end, both ink 500 (UX contrast).
- **Below 350px** the rung labels clear the vertical rules.
- **The set's "With the bracelet it adds…" lines** are balanced.

### Mobile, a11y, speed (UX 1–9)
- **The hero height subtracts `var(--safe)`.** With a 24px inset at 360x640 the delivery + COD line ends at 538 against the bar at 551; with 34px at 390x844 it is 732 against 745.
- **Fallback face "Cormorant Fallback"** (local Noto Serif or Georgia at size-adjust 80%), and `.facts` is a minmax(0, 1fr) grid. With fonts blocked and Android faces, the H1 stays on one line at 320 and 360, and the fact line is 14px clear of the bar.
- **The bar's first state is in the HTML,** so it is labelled from the first text paint. The UPI marks exist once, and JS reads them from there.
- **Lining figures on body** ("1 piece", not "I piece"). The `.sum` box is ivory with a hairline, so its deep-sage line is 4.84:1.
- **The drawer is a `<div role=dialog>`.**
- **Loading:**
  - Slide 1 is fetched by the inline script, matching the head preload, so a Riya landing no longer pulls worn-720.
  - The set thumbnails and Up close get their src only after the hero loads (or after 1.2 s), and then lazily.
  - The chip thumbnail is lazy.
- **Lab, 150 ms RTT, 1.6 Mbps, 4x CPU** (fonts from the UX fontconfig):
  - LCP is 1.13 / 1.17 s at DPR 2 and 1.14 s at DPR 3, down from 1.38–1.39 s. CLS is 0.0001–0.0002.
  - A Riya landing reaches LCP at 0.89 s with 124 KB of images.
  - The fonts land at about 2.0 s.
- **axe-core** (wcag2a/aa, 21aa, best-practice, plus label-content-name-mismatch) finds 0 violations on load, after the add, in the one- and two-piece bags, and with a set row in the bag.

### Measured
- **First screen at 360x640:** gallery 77–386, H1 398–426, facts end 562, bar 575 (13px clear).
- **Facts end 13px above the bar** at 320x568, 360x560 and 412x732; at 390x844 the gap is 38px. There is no sideways scroll anywhere.
- **`measure.json`:** factsClearOfBar true, no console errors, only Jost and Cormorant Garamond, no small tap targets. `i/` totals 480 KB.
- **`fold-ad.png` equals `fold.png`.** `prism_sugar_p1` still carries no confirmed angle.

### Decided between critics, or declined
- **Chip:** art's two-line chip with Riya's frame, using trust's words and UX's content naming. All three agree on the words. The thumbnail shows that the label belongs to a different frame (C2, C3, C13).
- **"Bag & checkout" (CRO) over keeping "View bag" (trust's keep).** Trust's concern was that the bar never goes straight to Fastrr, and that still holds; the new label is true and names the next step.
- **Reassurance:** trust's order and material tie-in combined with art's lead-plus-detail type.
- **Bag suggestion row:** placed under the total with a "Wear it with" label, not at the top where the passive line was. At the top it read as a piece already in the bag. It sits in the empty band CRO measured, so the foot does not move.
- **UX's IntersectionObserver at 600px:** replaced by "release after the hero, then native lazy". Observer-only loading left Up close and the hoops thumbnail blank in full-page captures and would on a fast fling. The LCP aim is met either way.
- **CRO's aria-label for the bar:** replaced by UX's label-in-name pattern, with the same words.
- **"COD in most areas" (trust 2, second branch):** not applied. FACTS says "COD available", and the Fastrr test to 800001 and 781001 has to come first. It is a pre-launch item in the notes, with the measured wording.
- **Redrawing the ruler or changing "fits wrists 15–19 cm" (trust 3):** not applied. It waits for ops to measure the bracelet. FACTS states both numbers, and the page shows exactly those.
- **Repo changes (CRO 2, trust 4, UX's live-SPA parts):** outside `proto/`, so they are recorded as build notes. The JSON-LD is demonstrated in this file.
- **"COD +5% fee" on the fact line:** the owner's rule keeps "COD available", so it stays in the notes.
- **Art's roadmap shoots** (matched set, unboxing, 1,440px originals) are out of scope for a code round.

## Round 4 (13 Nov 2026): the four round-4 critiques applied

Backup of round 3: `rounds/prototype_v3.html`; its images are in `rounds/v3_i/`, and its changelog is `rounds/CHANGELOG_v3.md`.

### First screen (UX 1, 2, 7; art 6)
- **The first screen is one column** (`.above`): the visible page less the header, the bar, the inset and 13px. The facts take what they need and the photo takes the rest (180px floor, min(125vw, 520px) cap). The clamp() on `.track` is gone.
- **The facts wrap instead of overflowing:** the price row, the caption, the rung labels (only after the dot) and the fact line. Line heights are unitless and identical at the default size.
  - At 115% text the line ends 13px clear and the document is 360 wide (it was 374, panning sideways).
  - At 130% the photo reaches its 180px floor and the line ends 7px clear (it was 3px under the bar).
  - With WCAG text spacing it ends 11px clear.
  - On tall screens (412x900, 393x900, 360x880) nothing is half-cut under the bar.
- **The bar's buttons wrap their label inside 48px at large text;** the Buy now column is minmax(128px, auto). At the default size it stays 200/128px.
- **Below 350px the bar's tracking drops to .08em.** The rule now sits after `.btn`; in its old place the base rule overrode it. At 320 the label has 8px of air a side (was 2).
- **`html` scroll-padding** clears the header and the bar. Tabbing from the top now lands no stop behind the bar (it was 4), and the per-element scrollMarginTop JS is gone.
- **The chip is in the first paint:** no `hidden`, and its thumbnail is inline. A landing that will not show it adds `nf-nochip` before paint.

### After the add (CRO 1, 2; UX 3; art 5)
- **The ring's suggestion is two lines, "PVD rhodium" and "Adjustable, US 5–9".** The compact card drops the metal line and the "10% off both" line, never the size range. After its + Add, the compact card reads "Bag ₹3,058 · you save ₹340" (85–311 at y 60).
- **The card tests controls, not the section.** The docked card shows only where nothing it would cover can be tapped (`r.right/left` included). Otherwise there is no card, logged as `none_control_under` with `under: set|assure|specs|riya|folds|footer|other`.
- **New two-line form over the photo** (`mini`), used when a strip of photo is left. Adds at scrollY 0–200 at 360x640 now always get a card over the photo: full, compact, nosug, nosug, mini. The dock covers 300–400; there is no card at 250 or over the set. While the set is below the bar, the second line is "A second piece takes 10% off · See the set" (a 44px link).
- **The card's prices are right-aligned**, as in the set and the bag.

### The set, specs, creator (art 1, 2, 4)
- **"With the bracelet in your bag"** (then "With your bag as it is now") is said once, above the rows. It hides once the whole set is in the bag. Each row reads "Adds ₹659, not ₹999": one line at 360, two at 320.
- **Specs:** the label column is 72px, so the dd column starts at x 100 like the set rows. The Fits row is 48px (was 92), with "Size guide" and "Ask on WhatsApp" side by side, both 44px. The list is 357px at 320 and at 360.
- **Riya's tiles:** a 32x32 play mark, clear of the bracelet. The captions are two lines: "Her wrist, with mehendi / Creator collaboration".

### The bag (trust 2; art 3; CRO 4)
- **Each line has one job.**
  - The top line is the next step in rupees: "20% off all three with the necklace, ₹460 more" and "30% off all four with the hoops, ₹469 more", or "The top rung: 30% off your whole bag". It is one line at 320, 360 and 412.
  - The ledger keeps "(BUY2, automatic)", now the only "automatic".
  - The foot reads "You save ₹340 · free insured delivery".
  - "Total" sits on the figure's baseline.
- **Policy line under the total, whatever the bag holds:** "Faulty piece? Tell us on WhatsApp within 7 days of delivery. We cannot take a piece back for a change of mind. Read the policy".
  - At 360x640 with one piece it is at 449–534, clear of the foot at 540, and nothing scrolls.
  - With 2–4 pieces it is the last item in the scrolling body.
  - A tap closes the bag, opens the policy fold at y 85, focuses its summary and logs `nf_bag_policy`. `history.scrollRestoration = 'manual'`; without it, Back's scroll restore cancelled the jump.

### Accessibility (UX 4, 5, 6)
- **Gallery:** the track is `role=group` named "Photos, swipe for more", with a described hint. Each slide is a `role=group` slide named "1 of 7, worn on the wrist" and so on. After a swipe, a polite region says "6 of 7".
- **`inert`** is set on header, main and footer while the bag, the viewer or the hand-off is open. The live region moved out of `main` so it still speaks.
- **The ruler keeps 320px at a 320px screen,** so its labels are 11px (were 9.6).
- **axe-core** (wcag2a/aa, 21aa, 22aa, best-practice) finds 0 violations on load, with the card open, in the one- and two-piece bags, and after a set add.

### Words (trust 5)
- **The reassurance list's third row** reads "**Surgical steel, PVD rhodium coating.** Waterproof and tarnish free, so daily wear and water are fine." The material leads, and the claim keeps the listing's words.

### Instrumentation (CRO 3)
- `nf_contact {channel, place: assure|fit|reviews, q}` plus the Clarity tag.
- `nf_view {i, play}`, `nf_fold {id}` (the folds now have ids policy/care/faq), `nf_size` and `nf_bag_policy`.

### Notes (trust 1, 3, 4, 6, 7; UX 1, 2, 8)
- **Owner list split.** "Launch blockers" holds the fit, COD by pincode, "worn" and the COD fee wording on the Buy now route, each with an "Until answered" line; everything else is under "Owner to confirm". The fee item says nf_bag_view and nf_bag_exit are read against the honest arm A.
- **New build note 1: an honest baseline before any test**, with trust's list of live strings to delete and the test regex.
- **The bag note replaces BagReturns with the policy line;** its test checks "change of mind" in and "7-day exchange" out.
- **New build notes:**
  - "3 in stock" from live quantityAvailable only;
  - the first-screen column;
  - sitewide scroll-padding;
  - the budget test at 1.15/1.3, text spacing and 412x900;
  - WebP/AVIF from the CDN;
  - the events list;
  - the burned-in "Creator collaboration" on the product video.
- **The colour item:** pink against lilac, ops to check in daylight.

### Measured
- **`measure.json`:** gallery 77–387, H1 399–427, facts end 562, bar 575 (13px clear), factsClearOfBar true, no console errors, only Jost and Cormorant Garamond, no small tap targets, `i/` 480 KB.
- **The facts end 13px above the bar** at 360x640, 360x600, 360x560, 320x568, 390x664, 412x732 and 412x846; at 390x844 the gap is 39px. No viewport scrolls sideways.
- **`fold-ad.png` equals `fold.png`** (prism_sugar_p1 still carries no confirmed angle).

### Decided between critics, or declined
- **Ring suggestion (CRO 1 against art 5):** art's split into two spans, with CRO's compact rule (drop the metal and the rung line, keep the size). CRO's single `.ms` line, hidden in full mode, is not needed once the size range is its own line.
- **Dock rule (CRO 2 against UX 3):** UX's "no control under the card" is the general form of CRO's "no + Add under it", and the brief's "nothing covers anything" decides it.
  - The cost is no dock at 150–250 on this layout. The new two-line form over the photo wins most of that band back (0–200 now always has a card).
  - CRO's mode name `none_adds_visible` becomes `none_control_under` with `under: 'set'`.
  - CRO's separate "See the set" row is folded into the card's second line, so the card stays two lines and covers less.
- **The bag's top line (CRO 4 against art 3):** art's "next step only" in CRO's rupees, naming the piece that adds least. CRO's "from ₹460" would have quoted a floor across the whole store, where cheaper pieces may exist.
- **Fit link (art 2):** "Ask on WhatsApp" rather than art's "Ask about your size". The shopper should see that it leaves the page for WhatsApp (trust), and CRO's channel count depends on that difference. The accessible name ends "about your wrist size".
- **Hero as WebP in the prototype (UX 8):** declined. The prototype's JPEGs are already crops of the Shopify originals, so re-encoding them would add generation loss on the hero. The saving belongs in the live build, from the CDN originals with format negotiation (build note 5).
- **The fold's COD sentence (trust C8):** unchanged on the page. Which wording replaces it is the owner's launch blocker 4, and the owner's rule keeps "COD available" until then.
- **Seller identity, origin, review app, set-piece metals (trust roadmap):** these need facts that are not in FACTS.md, so they are not on the page.

## Round 5 (13 Nov 2026): the four round-5 critiques applied

Backup of round 4: `rounds/prototype_v4.html`; its images are in `rounds/v4_i/`.

### First screen and tall phones (UX 1, 4, 7, 9; art 4)
- **`.above` uses `min-height`.** When the facts and the 180px photo floor cannot share the screen, the column grows. Before, the facts painted over "Questions before you buy?". Overlap is now 0 at 360x560, 360x600 and 320x568 at 130% text, and at 640x360, 732x412 and 844x390.
- **Tight mode.** A small script under the facts drops "Surgical steel, PVD rhodium" and "insured" when the facts plus 180px exceed the column. It re-checks on resize and when the fonts land. With token-scaled text the fact line now ends:
  - 13px clear at 360x560 at 115% (was 26px under the bar);
  - 13px clear at 360x640 at 130%;
  - 1px under at 360x600 at 130% (was 33px under);
  - 41px under at 360x560 at 130% (was 73px under).
  No default size trips it.
- **Tall phones (2:1 and taller) get the whole 3:4 worn frame.** This is Shopify p1, 896x1200, as `i/worn-full-896.jpg`, served through a `<picture>` source with its own media-scoped preload. The cap is `min(133.4vw, 560px)`.
  - 412x915: the hero is 77–627 (lips, hand, wrist), and the band under the fact line is 48px (was 83px).
  - 390x844, 360x780 and 412x846: the band is 13px.
  - 360x640 and 412x732 are unchanged, and each screen fetches one hero.
- **Landing placeholder.** The worn frame paints an 18x20 JPEG of its own pixels (451 bytes, inline) until the hero lands.
- **The bar grows with very large text.** `.btn` takes `min-height: 48px` and its labels may wrap inside, and a ResizeObserver sets `--bar` from the real buttons. At default sizes it stays 65px.
  - At 150%: 71px.
  - At 200%: 118px, and the label is no longer cut ("DD TO BA").
  - The chip is capped at 96px less than the slide's width, so it never runs into the counter.

### The after-add card and the dock (CRO 2, 4; UX 5; art 1, 2)
- **'nosug' is replaced by 'slim'.** Slim drops the bracelet's row and keeps the ring with "Adjustable, US 5–9", "Adds ₹659, not ₹999" and + ADD. Its header reads "Added to your bag · 1 piece", not the bracelet's name, so it never repeats the H1.
  - The order is now full → compact → slim → mini → dock.
  - At 360x640 slim covers adds at scrollY 90–120 (85–253), and mini takes over from 130.
  - On a first add at 320x568, slim spans 85–291 against a gallery ending at 318.
- **The dock:**
  - It may sit over the macro photo (`#closeup` is a photo, not a control).
  - It never sits over `#product-facts` (`under: 'facts'`).
  - Its set link is keyed on `#set-h`, offered while that heading is within 84px of the bar's top.
  - When no card can show, "✓ Added to bag" holds for 1.5 s. `aria-disabled` lasts only the 700 ms guard, so a tap after that opens the bag.
  - On the 50px grid (0–2950), positions with no card fell from 40 of 60 to 34 of 60.
- **Inert ticks are text, not ink.** "✓ In bag" and "✓ Added" sit in the same 88x44 box with no fill or border, right-aligned with the price at x 344.

### The bag (CRO 3; trust 8; art C19)
- **The policy line opens in place**, as a `<details>` in the bag, and the bag stays open: "**Faulty piece?** Tell us on WhatsApp within 7 days of delivery for a repair, replacement or store credit. We cannot take a piece back for a change of mind. Read the policy". The remedy comes before the refusal.
  - Opening it logs `nf_bag_policy`, never `nf_bag_exit`.
  - Secure checkout stays at 580–628 (360x640, one piece).
  - In the one-piece bag the summary spans 462–540, wholly above the foot.
- **Short form under Secure checkout:** "Faulty pieces only, within 7 days · no change-of-mind returns", as text, not a link.
  - It shows whenever the body's policy line would not be wholly in view. That covers every 2–4 piece bag, and the one-piece bag at 320x568.
  - It is one line at 320 (11px), 360 and 412 (12px).
  - The foot is now `minmax(0, 1fr)`, so no line can widen it. A first try at 320 pushed Secure checkout to the drawer's edge.
- **The foot's saving line** reads "You save ₹340". The delivery repeat is gone, since the ledger already says "Insured delivery, est. … · Free".

### History and keyboard (UX 2, 3, 6)
- **Scroll restoration is manual only while an overlay owns the entry**, and auto otherwise. Back from another page now returns to 739 (the set), not 0.
- **Every scripted jump owns a history entry**, with no URL change:
  - "Read the policy" (Back: 2925 → 300);
  - the card's and the dock's "See the set" (Back: 739 → 0).
- **"Size guide" opens the ruler in the viewer** instead of scrolling 1,953px to the top. Back closes it at 1957, with focus on Size guide.
- **The viewer pages with ArrowLeft and ArrowRight** and announces the position. `#vtrack` is focusable, with a role and a name.

### Slide 5, captions, type, footer (art 3, 5, 6, 7; trust 2, 7)
- **Slide 5 has one plate**, the chip's two-line form: "▶ Riya's clip / Creator collaboration", 132x52 at (10, 248). A Riya landing reads "▶ From Riya's reel / Creator collaboration". The separate top tag is gone, and the disclosure stays on the frame in the same words.
- **The set caption** names what she can check: "With the bracelet in your bag", "With the ring in your bag", "With the two pieces in your bag".
- **`text-wrap: pretty`** on the sub-lines, fold paragraphs, FAQ answers, reassurance rows, the bag's policy and the hand-off.
- **Footer:**
  - The green ends 12px above the bar's hairline, so the bar's fade no longer smears it grey.
  - Four links: Contact & business address, Faulty-piece policy, Privacy, Terms. Each is at least 44px tall; "Terms" is 45px wide with 7px padding (6px gave 43).
- **Reviews** adds a third link, "Business address" (to /contact), on its own 44px line.

### Notes (CRO 1; trust 1, 3, 4, 5, 6, 7, 9; UX ports)
- **Launch blocker 3** now lists the live policy's other exclusions ("Washed", "Altered", colour variation, handcrafted irregularities).
- **New launch blocker 5:** the ₹3,999 strike, moved from the owner list.
- **New owner items:**
  - the Instagram handle (@naira.flore against instagram.com/nairaflore/);
  - damaged, wrong or missing pieces;
  - seller details (address, hours, GSTIN, grievance officer);
  - the UPI payee and courier sender names.
- **Build note 1** adds arm A's "arrives by", "7-day returns", "15–19 cm adjustable" and the "PVD vs plating" paragraph. The test regex is extended, with an 18 cm Length assertion on both arms.
- **Build note 2** carries the new bag wording, the in-place disclosure and the short foot line.
- **Build note 5** adds:
  - the min-height column and tight mode;
  - the tall-screen picture and the landing placeholder;
  - the bar's min-height;
  - the no-overlap and landscape budget tests;
  - the history rules.
- **Build note 7** gets the new card modes (slim) and the `under` values (facts).
- **New build note 8, the test harness:**
  - the arm comes from `naira_vid` and is read as `window.__nfArm`; the script now reads `var ARM = window.__nfArm || 'pdp_b'`;
  - `nf_arm` goes on Shopify and Fastrr cart attributes;
  - ops place one verification order, with a Supabase fallback;
  - promo.ts is frozen;
  - results are read per visitor.
- **New build note 10:** Instagram from one constant.
- **New build note 11:** a #jewellery section on the policy page and the four-link compact footer.

### Decided between critics, or declined
- **nosug (CRO 2 against art 2): CRO's slim, with art's objection met.**
  - Art's case against nosug was that it repeated the H1 and dropped the next step. Slim keeps the next step, the one-tap ring, and its header no longer names the piece.
  - The ring is the store's joint top seller (7 units in 7 days), and 68–74% of orders are one piece. So the card keeps the pairing where it fits.
  - CRO's header "Added: Prism Rivière Bracelet" is not used.
- **The bag's policy jump (UX 3c): superseded by CRO 3.** The policy opens inside the bag, so there is no jump for Back to undo.
- **Trust 8's "two or more pieces" is generalised** to "whenever the body's policy line is out of view". Art's "drop the foot's delivery repeat once that line lands" is applied.
- **Trust 4's relabel to "Full policy" waits for the #jewellery section.** Until then the link still lands on the store-wide page, so it keeps "(store-wide)" (build note 11).
- **UX 8 (hold the below-the-fold images until the fonts land) is declined.**
  - The gain is inside run-to-run noise: 2.15 s against 2.43 and 2.20 s in UX's two lab runs, with LCP unchanged.
  - It holds the set thumbnails and the macro photo for up to 2.5 s for a shopper who scrolls fast.
  - The live build loads fonts its own way (build note 5).
- **Nothing proposed this round contradicts FACTS.md.** No new claim is stated as fact: the seller details, the transit remedy and the payee names stay in the notes until they are in FACTS.

### Measured
- **`measure.json`:** gallery 77–387, H1 399–427, facts end 562, bar 575 (13px clear), factsClearOfBar true, no console errors, only Jost and Cormorant Garamond, no small tap targets, `i/` 652 KB (worn-full-896 adds 172 KB, served to tall screens only).
- **`fold.png` is byte-identical to round 4** (md5 d4ae18d6…), and `fold-ad.png` equals it.
- **axe-core** (wcag2a/aa, 21aa, 22aa, best-practice) finds 0 violations in all these states:
  - on load and with the card open;
  - in the one-piece bag, closed and with the policy open;
  - after a set add and in the two-piece bag;
  - in the viewer opened from Size guide.
- **No JS errors** after clicking every control three times.
