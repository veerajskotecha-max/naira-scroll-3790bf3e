# himscience.com — PDP and cart, taken apart

Studied 2026-11-20 with Playwright (Chromium, iPhone Safari UA). Pages: `/products/him-redensyl-hair-growth-serum-for-men-40-ml` (in stock) and `/products/him-niacinamide-face-cream-for-men-50-ml` (sold out), at 390x844 and 360x640, one at 1440x900. Cart: the slide-in drawer (with 0, 1 and 2 units) and `/cart`. One serum was added to see the cart; the cart was emptied afterwards; checkout was never opened.
Theme: Shopify "Impact" 7.2.0, heavily restyled. All numbers below are `getComputedStyle` / `getBoundingClientRect` at 390 wide unless marked.
Screenshots and crops: `ref/hims/` (list at the end). Scripts: `ref/himscience/`.

**The one-paragraph answer.** The page feels clean because it has almost nothing to decide between. Six colours, of which exactly one has any hue, and that hue is the colour of the product in the photograph. Two grounds. Two typefaces doing three jobs (display heading, tiny caps label, grey body). No radius, no shadow, one hairline. Between the photo and the buy button there are five blocks and zero boxes. And, just as important, they have less to say than Naira does: no discount, no variants, no rating, no offer ladder, no delivery promise in the buy box. Half of the calm is design discipline (copyable), half is omission (a business choice).

---

## 1. Palette

### Every colour, with its role

| # | Hex | Role | Where | Share of screen |
|---|-----|------|-------|-----------------|
| 1 | `#FFFFFF` | Ground (page) | body, buy box, sticky bar, cards inside the cart | 30% of screen 1, 54% of screen 2, 35% of whole page |
| 2 | `#F5F7F8` | Surface (second ground) | gallery, product cards, FAQ block, cart drawer; also the text on orange buttons | 58% of screen 1 (the gallery), 14% of screen 2, 24% of page |
| 3 | `#201F24` | Ink | labels, product names, questions, announcement bar and footer grounds, small "add" buttons | 4.5% of screen 1, 22% of page (footer) |
| 4 | `#787878` | Muted text | title (!), description, spec values, prices in cards, captions | 1.5-2.3% |
| 5 | `#C1C1C1` | Ghost text and rule | eyebrows, the big ghost statement, inactive dots, disabled button; at 30-50% alpha it is every hairline | 1% screen 1, 17% screen 2 (ghost heading) |
| 6 | `#DC440A` | Accent | price, Add to cart, "+" quick add, one tilted band, key numerals, checkout | 4.8% of screen 1 (incl. the product itself), 9.2% of screen 2 (the band), 7% of page |

Strays (not part of the system, each a leak): `#000000` (text and border of the injected GoKwik "Buy it now" button), `#484848` (active gallery dot), `#E3E3E3` (ingredient list rule), `#DB440B` (GoKwik checkout button, one step off the accent). Theme defines an on-sale red `#F83A3A` but it never appears: nothing in the catalogue has a compare-at price.

**Count: 6 system colours (2 grounds, 3 greys/ink, 1 accent) + 4 strays = 10 raw values.** Perceived: 6. Text colours perceived: 5 (ink, grey, ghost grey, white, orange). Coverage figures are from the screenshots, each pixel snapped to the nearest of the six.

Borders: `1px #C1C1C1@0.4` (31 uses), plus `@0.3`, `@0.5`, `#201F24@0.12` and `#E3E3E3`, which all render as the same pale grey line. Strong lines: `1px #000` (Buy it now), `1px #787878` (View all).

### How the accent is rationed
On the PDP orange is allowed on exactly five things: **the price** (18px text), **the primary button** (185x52), **the "+" quick-add square** (32x31), **one tilted band per page** (52px), **key numerals / one brand word** (40px stats, "IN-XT"). In the cart: the 2px free-shipping line and the checkout button. Empty cart: the Shop now button. It is never used for body text, links, borders, icons, backgrounds of information, badges of quality, or headings.
- Screen 1 at 390: 2 accent elements (price, Add to cart).
- Accent-filled buttons visible at once: 1 (plus the tiny "+" on range cards).
- Orange area from the DOM: 8.2% of the page, 3.4% if the footer block is excluded.

### Why it feels cohesive (the part the owner admires)
1. **One hue, total.** Everything that is not orange is a neutral: white, a cool off-white, two greys, a near-black. There is no second accent, no "success green", no "sale red", no gold stars, no coloured icons, no payment logos. Any colour on screen is either the accent or the product.
2. **The accent is the product's own colour.** The bottle and jar sample at `#AD4521` / `#924838`; the accent is `#DC440A`. The UI appears to grow out of the object. (Naira's equivalent: gold UI accent = the gold of the piece.)
3. **The photograph sits on the UI's surface colour.** The product image and the gallery ground render as the same colour (pixels sample `#F5F7F9`, the CSS ground is `#F5F7F8`), so the image has no edge. The same ground is the product card and the cart drawer. Photo and interface are one surface.
4. **Supporting photography is desaturated.** Ingredient macros, the FAQ image and the proof video are black-and-white or near it. The palette rule extends into the art direction, so scrolling never introduces a foreign colour.
5. **Grey does the hierarchy, not colour.** Rank is expressed in three greys: ink for names and labels, `#787878` for values and prose, `#C1C1C1` for eyebrows. Orange is left free to mean only "money / act".
6. **Two grounds, alternating, with dark bookends.** White and `#F5F7F8` for content; ink for the announcement bar (top) and footer (bottom). No section invents a third tint.
7. **Nothing else competes:** 0 radii, 0 shadows, 0 gradients, 1 line weight. So colour is the only variable, and it is held to six values.

---

## 2. Type system

Faces (2): **Funnel Display** (variable, used at 700, always uppercase, tight) for headings; **Mozilla Text** (variable, 400/500/600/700) for everything else. Both self-hosted TTFs. No italic anywhere. No serif.

| Size / line-height | Weight | Tracking | Case | Colour | Use |
|---|---|---|---|---|---|
| Funnel 32/32 (35.2 in FAQ) | 700 | -0.96px (-0.03em) | UPPER | ink / white on photo | section headings ("Explore more", FAQ) |
| Funnel 24/24 | 700 | -0.96px (-0.04em) | UPPER | `#787878` | **product title (H1)** |
| Funnel 24/24 | 700 | -0.48px | UPPER | `#C1C1C1` + one orange word | ghost statement |
| Funnel 14/14 | 700 | -0.14px | UPPER | ink | product-card name |
| Mozilla 40/40 | 600 | -1.6px | - | orange | stat numerals |
| Mozilla 24/24 | 500 | -0.96px | Mixed | ink | the one sentence-case statement |
| Mozilla 18/18 | 700 | 0 | - | orange | **price** |
| Mozilla 14/14 | 600 | +0.56px | UPPER | ink | ingredient name |
| Mozilla 14/14 | 500 | 0 | - | ink | card price |
| Mozilla 13/20.8 | 600 | 0 / +0.26 | UPPER | `#C1C1C1` | eyebrow above a statement |
| Mozilla 13/16.9 | 400 | 0 | Mixed | `#787878` | ingredient text, FAQ answers |
| Mozilla 12/16.8 | 400 | 0 | Mixed | `#787878` | **product description** |
| Mozilla 12/15.6 | 600 | +0.24px | UPPER | ink / grey | FAQ question, stat caption, cart title, cart header |
| Mozilla 12/14.4 | 700 | +0.24px | UPPER | ink | range-card name, cart price |
| Mozilla 12/12 | 700 / 400 | +0.24px (+0.02em) | UPPER | on fill | **every button label** |
| Mozilla 11/11 | 400-600 | +0.22 / +0.44 | UPPER | white | announcement bar, footer links |
| Mozilla 10/10 | 700 | +0.5px (+0.05em) | UPPER | ink (label) / `#787878` (value) | **size, spec-table labels and values, block labels** |
| Mozilla 10/10 | 600 | +0.4px | UPPER | `#787878` | "(incl. of all taxes)", cart note |

Counts (a "style" = family + size + weight + line-height + tracking + case, colour ignored):
- **First two screens, 390x844: 14 styles** (serum and cream alike); 360x640: 13. Sizes used: 10, 11, 12, 13, 18, 24 (+ a 22px "+" glyph). Weights: 400, 600, 700.
- **Buy box only (title to buttons): 7 styles in 4 sizes (24, 18, 12, 10).**
- Whole page: 29 styles, 11 sizes (10, 11, 12, 13, 14, 16, 18, 22, 24, 32, 40).

How it reads as "one voice": every heading is the same heavy, tight, uppercase display at line-height 1.0; every label is the same tiny wide-tracked caps; all prose is the same grey 12-13px at 1.3-1.4. Negative tracking on big type, positive tracking on small type, nothing in between. Product names are two words ("THE SERUM"); the long descriptive name lives only in the browser title.

---

## 3. Shape and spacing

- **Radii: 0 everywhere** (theme tokens `--rounded-*` are all 0). Exceptions: gallery dots 1px, and two invisible pills (cart count, 2px progress bar).
- **Shadows: 0 on the PDP** (theme shadow tokens have alpha 0). One in the whole experience: the cart footer lift, `3px -3px 18px rgba(0,0,0,.25)`.
- **Borders versus fills:** information is separated by 1px hairlines, never by filled boxes. Fills are reserved for (a) surfaces that hold a photo (`#F5F7F8`), (b) buttons, (c) the bookends. Outlined rectangles: only buttons, range cards, the stats list and the quantity stepper.
- **Gradients: none** in the UI.
- **Spacing scale (base 10):** 5, 8, 10, 16, 20, 24, 30, 40, 60. Page gutter 10px (tight; it is their boxy look). Buy-box rhythm: gallery to info 20+25; title to price 11; then 20, 20, 20; to buttons 30; rule 20/20. Card padding 10. Carousel gap 8-10.
- **Section padding:** 40px 10px (statement, explore more), 60px 10px (proof section), 24px 10px (FAQ list). Ingredients run edge to edge with no padding, bounded by hairlines.
- **Cards:** range card 227x132, 1px hairline, `#F5F7F8`, image 104x130 on white. Product card 267x347, `#F5F7F8`, image 267x267 (1:1), info padding 10, full-width 36px ink button.
- **Buttons (one family):** square, 12px uppercase +0.02em. Heights: 52 (buy), 45 (checkout), 44 (view all), 36 (card), 30 (mini add). Fills: orange = buy / checkout / subscribe; ink = add in lists; 1px outline = alternate or navigate; grey = disabled. Hover transition 0.15s ease-in-out.
- **Icons:** hamburger and bag, 24px, 1.2px stroke, ink; plus / close, 12px, 2px stroke. That is the whole icon set on the PDP. No icons in the buy box, no trust icons, no payment marks.
- **Images:** gallery 4:5 (390x513 visible, full-bleed, `#F5F7F8`), product a small centred cut-out (about 28% of the width) with a lot of air; first slide is a muted looping video; 8 slides, scroll-snap, 2px gap; dots only (8 dots 5x5 `#C1C1C1`, active 30x5 `#484848`), no arrows, counter, zoom, heart or overlay badges. Proof video 3:4. FAQ image 390x220.
- **Header:** 48px, sticky, `#F5F7F8` at 10% + `blur(18px)`; 2 icons and the logo on phone (no search, account or wishlist). Announcement bar 31px ink, one line, not sticky.

---

## 4. The PDP, screen by screen (serum, 390x844; page is 4724px = 5.6 screens)

```
y 0     ANNOUNCEMENT 31px  ink ground, white 11px, one line: free-shipping threshold
y 31    HEADER 48px        menu | logo | bag           frosted, sticky
y 79    GALLERY 513px      #F5F7F8, 4:5, cut-out product, video first, 8 dots at y567
y 637   TITLE              Funnel 24/24 700 caps, #787878, two words
y 672   PRICE              18px 700 orange  +  10px caps grey tax note (gap 10). No strike, no % off, no rating.
y 710   SIZE               "40 ML" 10px 700 caps ink
y 740   DESCRIPTION        one paragraph, 3 lines, 12/16.8 grey
y 810   SPEC TABLE 57px    2 rows, label col 74px ink caps / value col grey caps, 9px row padding,
                           1px hairline BETWEEN rows only, no outer box. Row 2 = three benefits split by bullets.
-- first fold at 844; sticky bar (72px) covers 772-844 ------------------------------------------
y 897   BUTTONS 52px       [BUY IT NOW outline 185] [ADD TO CART orange 185], no gap, full width
y 969   HAIRLINE
y 990   "THE ENTIRE RANGE" 10px label + horizontal cards 227x132 with orange "+" (6 cards, peeking)
y 1146  TILTED BAND        orange, -2.4deg, auto-scrolling ingredient names, 12px caps
y 1240  STATEMENT          pad 40. eyebrow 13px ghost grey + 24px Funnel ghost-grey sentence, one orange word
y 1505  INGREDIENTS        edge-to-edge strip, 250px columns split by 1px rules: B/W macro 229x211, 14px caps name, 13px grey line
y 1835  PROOF              pad 60. eyebrow + 24px sentence-case statement (ink) + 3:4 video + 3 stat rows (40px orange numeral, 12px caps caption) in hairline cells
y 2919  FAQ                #F5F7F8 ground. B/W image 220px with white 32px heading. 7 accordion rows.
y 3442  EXPLORE MORE       pad 40. 32px heading, product-card carousel, outline "VIEW ALL"
y 3985  FOOTER             ink texture, orange link block, newsletter, giant logo
```

- **Gallery:** described in section 3. Nothing is laid over the photograph.
- **Title:** quiet on purpose: mid-grey, not black. The price is the loudest thing in the buy box.
- **Rating:** none. Judge.me is installed but nothing is rendered; the theme's rating slot is reused for the "40 ML" line.
- **Price and discount:** price only. All 8 products have no compare-at price, so there is no strike-through, no percent-off and no savings line to learn from.
- **Variants / packs:** none (every product is single-variant). The pack is its own product ("Pack of 3").
- **Offers:** one, and it is outside the buy box: the announcement line. In the cart it becomes a 10px line plus a 2px bar.
- **Benefits and qualities without badges (the key pattern):** a two-column definition table. Left: an ink label ("Application", "Benefits"). Right: grey values in the same 10px caps, benefits joined by small bullets, wrapping to a second line at 360. One hairline between rows. No chips, no icons, no borders around items, no fills. It reads as a specification, not as stickers. See `ref/hims/crop-spec-table.png`.
- **Buttons:** labels "Buy it now" / "Add to cart". In-flow pair at y897; an identical pair in a fixed white bar (10px padding, no border, no shadow). The bar is visible on first paint (the in-flow pair is 53px below the fold), hides while the in-flow pair is on screen (about y200-900), returns from about y1055 to y2950, and leaves at the FAQ. Fade 0.15s with a 10px rise. Sold out: grey fill, grey label, plus a small grey "Sold out" tag beside the price.
- **Delivery and returns:** not on the PDP at all. Only the announcement line and a footer link.
- **Dropdowns / accordions:** exactly one group, the FAQ, low on the page. 7 `<details>` rows, all closed by default. Row 36px (10px padding), question 12/15.6 600 caps ink, 12px plus at the right edge, 1px hairline under each row except the last, no boxes, no icons on the left. Open: height 37 to 162 in about 240ms, answer fades in with a 4px rise, plus turns to a cross; answer 13/16.9 grey with 24px right inset, margins 6 / 18. There are no accordions in the buy box (the spec table does that job). For "how to put dropdowns" the Palmonas study is the reference; from HIM take the row look.
- **Sections below:** each has one idea, one ground, one heading device. Statement (white, eyebrow + ghost sentence). Ingredients (white, hairline strip, no heading). Proof (white, eyebrow + sentence + video + numerals). FAQ (`#F5F7F8`, photo heading). Explore more (white, 32px display heading). Footer (ink). Six sections after the buy box; no reviews wall, no UGC, no trust-badge row, no "as seen in".
- **1440x900 glance (the sold-out cream):** 47 / 53 split, gallery left on `#F5F7F8`, buy box right at the same type sizes, the range carousel under the buttons; nothing new appears and nothing gets bigger. `ref/hims/l1440-s01-half.png`.

---

## 5. The cart (slide-in drawer; `/cart` exists but the bag icon opens the drawer)

Drawer: full height, 330 of 390 wide (300 of 360), `#F5F7F8`, the page stays visible in a 60px strip under a 40% black scrim.

| Part | Measured |
|---|---|
| Header | "YOUR CART (1)" 12/15.6 600 caps ink, 24px close cross; padding 10 |
| Offer / progress | one centred line, 10/14 600 caps ("eligible for free shipping"), then a **2px** bar, orange when reached; 1px hairline closes the header block (95px total) |
| Line item | white card 310x120, padding 10, on the `#F5F7F8` drawer. Image 80x100 (4:5). Title 12px 600 caps ink and price 12px 700 on one line. Stepper 98x34: three 32px cells, 1px `#C1C1C1@0.5` border, 18px glyphs. "Remove" 10px 600 caps with a 1px underline, beside the stepper. No variant line, no strike price, no savings. |
| Upsell | label "Complete your routine" 10px 700 caps; white cards 234x90, image 70x70, name 12px caps, ink button 30px "Add - Rs 499"; horizontal scroll, next card peeking |
| Totals (pinned footer, 147px) | "Estimated total" 12px 600 caps, amount 12px 700 right-aligned; one 10px caps grey note; the only shadow on the site lifts this footer |
| Checkout | 310x45, orange, white 15/24 400 caps "Checkout" |
| Trust / pay marks | none. No coupon field, no order note, no payment logos, no timers, no "you saved" |
| Empty state | "Your cart (0)"; centred 12px caps sentence; orange "Shop now" button; recommendations pinned at the bottom |

- **Colours in the cart: 6** (`#F5F7F8`, `#FFFFFF`, ink, `#787878` once, hairline grey, orange). Text colours: 3.
- **Type styles: 8** (7 text styles in 3 sizes: 10, 12, 15; plus the 18px stepper glyphs). One family.
- **Accent uses: 2** (progress line, checkout).
- At 360x640 with one item everything fits with no scrolling: 95 + 120 + 114 + 147 = 476 of 640.
- `/cart` page: 32px display heading, the same free-shipping line with a 4px ink bar, an unboxed line item, one "Estimate shipping" accordion, a 1px-outlined totals box with an order-note field, the same orange checkout. Plainer than the drawer and typographically weaker (11px sentence case throughout).

**Why it is calm:** one decision per zone (what is in it, one suggestion, the total, go). The item is the only white object on a grey sheet, so the eye lands on it. Offer and progress are one line and a 2px rule, not a banner. The only saturated shape is the checkout button, at the bottom where the thumb is. Nothing asks for trust, so nothing looks like it needs to.

---

## 6. Repeated patterns that create the cohesion

| Pattern | Recurs |
|---|---|
| Tiny label: 10px 700 caps +0.05em ink | size, spec labels, "The entire range", cart "Complete your routine" |
| Name style: 12px 600-700 caps +0.02em ink | range cards, FAQ questions, stat captions, cart title, cart header, totals |
| Grey prose: 12-13px 400, 1.3-1.4, `#787878` | description, ingredient lines, FAQ answers |
| Eyebrow + statement pair (13px ghost-grey caps over a 24px sentence) | twice, identically built |
| The hairline (1px pale grey) | spec rows, separator, range-card edge, ingredient dividers, stat cells, FAQ rows, cart header, stepper |
| Photo-on-surface card (`#F5F7F8`, cut-out, 10px padding) | gallery, range card, product card; inverted (white on grey) in the cart |
| Square orange button, 12px caps | Add to cart, "+", Subscribe, Checkout, Shop now |
| Square ink button, same label style | card "Add to cart", cart "Add" |
| Peeking horizontal carousel, no arrows | range, ingredients, explore more, cart upsell |
| The -2.4 degree tilt | the band and the sold-out tag (a brand gesture, used twice, nowhere else) |
| Orange for numbers that matter | the price and the stat numerals, nothing else |

Ten devices build the whole page. No section has a component the others do not.

---

## 7. What is still clutter or pushy, and what is category-bound

**Clutter / weak / pushy on their own page**
- **Sticky bar on first paint.** At 390 it covers the last line of the description; at 360x640 the first screen is only header + photo + bar: no title, no price (title starts at y599, bar at 568).
- **Two equal buttons, twice.** "Buy it now" gets half the width and appears in both the in-flow pair and the fixed bar. It is a third-party (GoKwik) button and it breaks the system: pure `#000`, weight 400 beside 700, and a visible "Loading.." state.
- **Cross-sell before content.** "The entire range" with orange "+" buttons sits directly under the buy buttons, before a word about the product.
- **Contrast.** `#787878` on white is 4.42:1 (under AA) and is used at 10-12px for the description and spec values. `#C1C1C1` on white is 1.80:1 and carries eyebrows and a whole 24px statement. White on orange is 4.31:1. Calm was bought partly with legibility.
- **Type is small:** 10px labels and 12px description are below what a phone audience arriving from Instagram reads comfortably.
- **Frosted header** smears whatever scrolls under it (orange blur behind the logo).
- **Inconsistent disabled state:** sold-out button label is 11px sentence case, every other button 12px caps; the sold-out tag is a filled chip (the one badge on the page).
- **10px gutter** is tight; fine for their blunt look.
- **Missing, not solved:** ratings and reviews, delivery date, returns, care, size help, discount display, variant picker. HIM is calm partly because these are absent. Naira needs most of them, so Naira must solve harder problems than this page does.

**Belongs to men's personal care, wrong for a jewellery house**
- Heavy, tight, all-caps grotesque everywhere; blunt 0.02em-tracked caps buttons at weight 700. (The owner wants a light mixed-case title.)
- Safety orange as accent, tilted bands and tags, grunge-textured black footer with a giant logo, B/W torso photography.
- Ingredient (INCI) marquee, "tested on" proof block, lab-style numerals ("6 plant extracts"), "Application / Benefits" spec, millilitre sizes.
- Tiny cut-out on a clinical grey-white field: right for a bottle, too cold and too small for jewellery, which needs scale, skin and warmth. Keep the principle (image ground = UI ground), not the look.
- Boxy 10px gutters and edge-to-edge hairline grids: engineering mood, not atelier.

**What transfers directly to Naira:** one accent drawn from the product (gold); one hairline; zero boxes in the buy box; qualities as a quiet two-column table or a single bulleted line (Anti-tarnish · Skin-friendly · 18K PVD) instead of three bordered chips; offer as one line; two grounds; one button family with a single accent-filled action; a cart with one white item card, a one-line offer and one coloured button.

---

## 8. The level to reach (rubric, with himscience's own numbers)

Score Naira's PDP and bag at 390x844 and 360x640. "First two screens" = y 0-1688 at 390.

| # | Measure | himscience | Pass line for Naira |
|---|---|---|---|
| 1 | UI colours in the first two screens (photos excluded) | 6 (2 grounds, ink, 2 greys, 1 accent) | at most 6: ivory, one surface tint, ink, one muted ink, one rule, one accent |
| 2 | Chromatic hues in the UI | 1 | 1 for action and price (gold). Sage only as a ground or bookend, never as a second accent on text, borders or buttons |
| 3 | Accent coverage | 4.8% of screen 1 incl. product, 9.2% max on any screen, 3.4% of page excl. footer | at most 5% of any buy-box screen |
| 4 | Things the accent is allowed on | 5 (price, primary button, quick add, one band, key numerals) | at most 4, written down; never on borders, icons or chips |
| 5 | Accent-filled buttons visible at once | 1 | 1 |
| 6 | Grounds | 2 content + 1 dark bookend; every section on exactly one | 2 content (ivory + one tint) + 1 bookend |
| 7 | Typefaces | 2 | 2 (Jost, Cormorant Garamond) |
| 8 | Type styles in the first two screens | 14 (13 at 360) | at most 14 |
| 9 | Type styles in the buy box (title to buttons) | 7, in 4 sizes (24, 18, 12, 10) | at most 7, in at most 4 sizes; none under 12px except one caps label size |
| 10 | Text sizes on the whole page | 11 | at most 10 |
| 11 | Blocks between photo and buy button | 5 (title, price, size, description, spec table), 285px tall | at most 6, at most 300px |
| 12 | Bordered or filled boxes between photo and buy button | 0 (one hairline inside the table) | 0 |
| 13 | Icons in the buy box | 0 | 0, or one line-icon family at one stroke weight |
| 14 | Rule weights / colours | 1px / one pale grey | 1px / one colour |
| 15 | Radii | 0 (dots 1px) | 0 |
| 16 | Shadows | 0 on PDP, 1 in cart | 0 on PDP, at most 1 in bag |
| 17 | Spacing | one scale: 5, 8, 10, 16, 20, 24, 30, 40, 60; gutter 10; section padding 40 or 60 | one scale of at most 9 steps; one gutter; at most 2 section paddings |
| 18 | Button family | 1 shape, 1 label style, 3 fills by meaning, heights 52 / 44-45 / 36 / 30 | the same: 1 shape, 1 label style, at most 3 fills |
| 19 | Overlays on the product photo | dots only | dots or a counter only; no logo, badge, heart or video chip on the image |
| 20 | Photo ground vs UI ground | identical (`#F5F7F9` vs `#F5F7F8`) | hero ground within the brand palette (ivory or a tint), not a foreign colour |
| 21 | Qualities / benefits | 1 two-row table, 10px caps, no chips | 1 table or one inline line; 0 chips |
| 22 | Offers in the buy box | 0 (one line in the announcement bar) | at most 1 line of text, no box |
| 23 | Accordion row | 36px, 12px label, 12px plus, hairline, all closed, 240ms | 44-48px rows (tap target), one label style, hairline, all closed, 200-250ms |
| 24 | Sections after the buy box | 6, each one idea / one ground / one heading device | at most 6, same rule |
| 25 | Bag: colours | 6 | at most 6 |
| 26 | Bag: type styles | 8, in 3 text sizes (10, 12, 15) | at most 8, in 3 text sizes |
| 27 | Bag: accent uses | 2 (2px progress line, checkout) | at most 2 |
| 28 | Bag: badges, logos, coupon field, timers | 0 | 0 in the drawer (pay marks belong to checkout) |
| 29 | Bag: one item fits 360x640 without scrolling | yes (476 of 640) | yes |
| 30 | Where Naira should beat HIM | body text 4.42:1 at 12px; title and price off the first screen at 360x640 | body text at least 4.5:1 and at least 13px; title and price inside the first 640px |

For orientation only, today's Naira page by eye from `scout/naira-phone-full.png` (not measured here): the hero photograph is a dark burgundy field with a logo watermark, a back button, a heart, a counter and a video chip laid over it (rows 19 and 20 fail); between photo and buttons there are about 9 blocks including three bordered chips, a "sold in 48 hours" strip and a three-cell offer box (rows 11, 12, 21, 22 fail); sage, gold and a green outline all act as accents (row 2 fails). Those four are the gap.

---

## Files

Montages (start here)
- `ref/hims/pdp-serum-p390-montage.png`, `ref/hims/pdp-cream-p390-montage.png` — whole page, one screen per tile
- `ref/hims/fine-serum-p390-montage.png` — the first two screens in fine steps (buy box, buttons, range, band, statement)
- `ref/hims/lower-serum-p390-montage.png` — proof, FAQ closed and open, explore more, footer
- `ref/hims/top-p360-montage.png` — first screens at 360x640 (serum and sold-out cream)
- `ref/hims/crops-montage.png` — buy box, spec table, buttons, stats, FAQ rows
- `ref/hims/cart-1item-p390.png`, `ref/hims/cart-empty-p390.png`, `ref/hims/cart-p360-montage.png`, `ref/hims/cartpage-p390-top.png`
- `ref/hims/l1440-s01-half.png`, `ref/hims/l1440-full-quarter.png`
- `ref/hims/naira-top2.png` — today's Naira first two screens, for side-by-side

Single crops: `crop-buybox-390.png`, `crop-spec-table.png`, `crop-buttons.png`, `crop-range-card.png`, `crop-stats.png`, `crop-ingredient.png`, `crop-faq-rows.png`, `crop-product-card.png`, `crop-marquee.png`, `crop-inxt-heading.png`.
Per-screen shots: `pdp-{serum,cream}-{p390,p360}-sNN.png`, `pdp-cream-l1440-sNN.png`, and `*-full.png`.
Raw measurements: `ref/himscience/m-serum-p390.txt`, `d-serum-p390.txt`, `d-serum-p360.txt`, `d-cream-p390.txt`, `cart-p390.txt`.

Reference only: none of their images, text or code is to be reused in anything that ships.
