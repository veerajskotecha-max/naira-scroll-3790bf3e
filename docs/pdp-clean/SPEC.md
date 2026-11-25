# Naira product page and bag: the clean redesign (spec)

Written 20 Nov 2026 by the design director. Builds on branch `pdp-clean` (worktree `/tmp/pdp-clean`); the branch is the preview and nothing goes live without the owner's yes.
All paths in this document that start with `pdp/` are under `/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/`.

Read with it: `pdp/code-map.md` (how today's page and bag are built), `pdp/audit/AUDIT.md` (today measured), `pdp/ref/HIMSCIENCE.md` (the level to reach, rubric in its section 8), `pdp/ref/REFERENCE.md` (Palmonas).
Look at before building: the mock-ups in `pdp/design/mock/` (HTML, drawn with the shipped `clean.css`) and their screenshots in `pdp/design/mock/out/`:

| What | File |
|---|---|
| New beside today, first screen at 360x640 and 390x844 | `out/m1-before-after.png` |
| First screen 360x640 (title A, title B, long name) | `out/m2.png`, `out/p-hoops-left-p360.png` |
| Whole buy box, phone, with a ring's sizes and with a bag of two | `out/m10.png`, `out/p-ring-left-p360-full.png`, `out/p-ring-bag2-p360-full.png` |
| First screen 390x844 | `out/m3.png` |
| A dropdown open (Description, Details and size, Delivery and returns) | `out/m5.png` |
| Below the buy area | `out/m9.png` (right column) |
| Laptop buy column, title A over title B | `out/m7.png`; 1280x720 with sizes: `out/m11.png` (left) |
| Bag: empty, 1, 2, 3 pieces at 360x640, beside today's | `out/m8.png`; laptop drawer and 390x844: `out/m11.png` |

In the mock-ups the pinned bar is always drawn and the 390 header is scaled 9px too tall; the real page hides the bar by today's rule and keeps the 107px header.

The shared parts are already in the branch: `src/components/clean/` (commits `69918bfb` and `5b863019`). Section 9 says who owns which file.

---

## 0. The four angles, and what each decided

**(a) Graphic designer and typographer.**
- One face on the page and in the bag: Jost, in the three weights the site loads (300, 400, 500). No Velista and no Cormorant Garamond inside the page or the bag (Velista stays the header's wordmark and menu; Cormorant is title B only). The phone's own sans disappears: every text has a named style.
- Six colours, one hue: ivory, linen, ink, one muted ink, one rule colour, gold. Sage is the header's and footer's (the bookends) and appears nowhere inside the page or the bag: the deep-sage chips, "Add" buttons and links become ink.
- Eight type styles in five sizes (26, 20, 14, 13, 11 on a phone, plus 22 for section headings and 15 for dropdown rows). The buy box uses 26, 20, 13 and the 11px caps label only.
- Hierarchy by weight and by two inks, not by boxes: the price is the only medium-weight figure in the buy box; the filled button is the only filled shape.
- The three badges, the sold band and the offer box become one quiet two-row table (himscience's spec table): QUALITY and OFFER, a caps label at the left, values at the right, one hairline between rows. No border round anything, no fills, no icons.
- One hairline (1px `#DCD4CE`), one 2px line (the gallery's position and the bag's offer progress), radius 0, shadow 0.
- One button family: a square 52px button, one label style, filled ink for the one action in view, a 1px ink outline for everything else.
- The bag is drawn from the same parts: the same rungs as words, the same 2px line, the same price figure for the total, the same button.

**(b) Conversion lead.**
- First screen at 360x640, in order: photo, category and shop rating, name, price with MRP and "% off", and the two buttons pinned at the bottom. Nothing is laid over the photo or over the price.
- First screen at 390x844 holds the whole decision for a piece without choices: photo, name, price, qualities, the Buy 2 / 3 / 4 offer priced for this piece and both buttons in the page (they end at y 832); the delivery promise is the next line. The pinned bar is absent there because the buttons are on screen.
- Always visible, never in a dropdown: price, MRP and discount, the offer with this piece's price at each rung, size or colour, the arrival date (new on the first view: today it is inside a closed fold-down), the shop's rating.
- In dropdowns: the description, specifications and size chart, care, delivery terms with the pincode check. Description is open by default (the one paragraph that sells the piece is read without a tap); the other three are closed.
- Buttons: "Buy Now" (outline, left) and "Add to cart" (ink, right), 52px, in the page under the choices; the same pair, 48px, in the pinned bar whenever the page's pair is not fully on screen. The bar never covers the price or the offer (today's rule, kept).
- Photo to button on a phone: 283px for a piece without choices (today 294, through three boxed blocks).
- Bag: what she bought (name, choice, price), what she saves (the reached rung in gold, "% off" on each line, one "You save" sentence), the next offer (the rungs and the 2px line above the list), the total, one loud button. At 360x640 two pieces show in full with the total and the button on screen (today: 1.6 pieces).

**(c) Phone designer.**
- 360x640: header 107, photo 360, position line 2, then 14 + 20 (category row) + 2 + 32 (name) + 6 + 24 (price) = price ends at y 567; bar starts at 575. A two-line name pushes the price to y 599: the bar then stays away until the first scroll (today's "never over the price" rule), so name and price are inside the first 640px on every piece.
- Every control is at least 44px: chips 44, buttons 52 / 48 / 44, dropdown rows 52, the stepper's cells 40 drawn with a 44px target, text links carry a 44px target without adding height (`nc-tap`).
- No text under 13px except the 11px caps label (weight 500, wide tracking). Reading text is 13 or 14px.
- Contrast: ink 16.4:1, muted ink 5.9:1 on ivory and 5.5:1 on linen, gold text 4.8:1 on ivory and 4.5:1 on linen, ivory on ink 16.4:1. The brighter gold `#C99A4C` (2.3:1) is used only for the 2px line and the star glyph, never for words.
- No shift when Jost arrives: a fallback face sized to Jost at each weight (`clean.css`), fixed line heights, and the stylesheet written into the page so the pre-built page paints styled.
- Safe areas: the pinned bar and the bag's foot add `env(safe-area-inset-bottom)`.
- The bag is a full-height sheet: header, offer strip and foot are fixed; only the list scrolls; the total and Checkout never leave the screen.

**(d) The keeper.**
- Every element of today's page and bag has a verdict in sections 3 and 8. Nothing that sells, informs or is legally needed is lost: the tax note, MRP, discount, offer arithmetic, sizes and their stock sentences, pre-order and sold-out paths, arrival date, COD, returns policy link, pincode check, WhatsApp link, care answers, the seller's delivery terms.
- Removed because the code shows they are invented: the "pieces sold in the last 48 hours" line, the "someone bought" card, the "4.9 · 50 reviews" figure and the dealt review list behind it, and "Sitewide sale live today" in the bag (section 4).
- Every state in the code map's tables 1.8 and 2.4 keeps working; section 5 and section 8 list them with their new look.
- Tracking, SEO markup, the pre-built page and the ids other code depends on are untouched (section 9).

---

## 1. What stays identical (the non-goals)

1. Products, prices, MRPs, variants, stock, the Buy 2 / 3 / 4 rungs and every rupee they produce (`src/lib/promo.ts`, `src/lib/cartPricing.ts`, `src/lib/variants.ts` are read, never edited).
2. What a tap does: Add to cart (opens the bag, adds), Buy Now (straight to checkout), Reserve now (WhatsApp), wishlist, size guide, photo zoom, pincode check, Undo, quantity, Checkout (Fastrr, then Shopify).
3. Tracking: every Meta and Clarity event keeps its name, parameters and moment (section 9.1).
4. SEO: `<Helmet>` tags, canonical, robots, both JSON-LD blocks, the embedded `#nf-piece`, the `<h1>`, the pre-built page (section 9.2).
5. The header (announcement strip and menu bar), the footer, listing pages, product cards, the wishlist drawer, the lightbox, the write-a-review dialog, toasts, the apparel product page, the old unrouted `JewelDetail.tsx` and `CartDrawer.tsx`.
6. The words that matter: product names, "Add to cart", "Buy Now", "Reserve now", "Checkout", the offer wording ("Buy 2", "10% off", "₹944 each"), every status sentence from `pdpOfferStatus` and `ladderHeadline`, the stock and pre-order sentences, the delivery and returns sentences, the care answers, "Rated 4.5/5 · Trusted by 5,000+ clients", "Easy 7-day exchange & returns".
7. The route, the file name `src/pages/JewelDetailNext.tsx`, the `html.nf-next` class, layering (bar z-40, header and bag z-50, size guide z-60, lightbox z-70), the header offsets `pt-[107px] md:pt-[126px] lg:pt-[136px]`.
8. No new dependency, no new font file or weight, no edit to `index.html`, `main.tsx`, `tailwind.config.ts`, `vite.config.ts`, `package.json`, `bun.lock`, `src/contexts/*`, `src/lib/shopify.ts`, `src/lib/promo.ts`, `src/lib/pixel.ts`, or any global rule in `src/index.css`.

---

## 2. The design system (`src/components/clean/`)

Root class `nf-clean` on the page's outer element and on the bag's sheet. `<CleanStyles />` is rendered once inside each root (it writes `clean.css` into the page as a `<style>`, so the pre-built page carries it). Every rule in `clean.css` is scoped under `.nf-clean`.

**Rule for both engineers:** inside the page file and the bag file, type and colour come only from the `nc-` classes and `--nc-` tokens. Tailwind utilities are for layout (flex, grid, gap, margin, padding, width, position, `line-clamp-2`, `sr-only`, `md:hidden` and the like). No `font-*`, `text-[Npx]`, `text-nf-*`, `tracking-*`, `bg-nf-*`, `border-nf-*`, `rounded-*`, `shadow-*`, `[var(--nf-cta)]` or raw hex remains in those files (the `SWATCHES` list, which pictures metals and stones, is the one exception). Each engineer's source test asserts this.

### 2.1 Palette: six colours, one hue

| Token | Hex | Role | Where it may appear |
|---|---|---|---|
| `--nc-ivory` | `#FBF3EC` | ground | the page, the bag's sheet, the pinned bar, text on the filled button |
| `--nc-linen` | `#F4EBE2` | the one tint | behind photographs (gallery, cards, bag thumbnails), notices (Undo, an error), loading skeletons. Never behind text that sells |
| `--nc-ink` | `#1A1614` | text and action | names, prices, labels, the filled button, outlined buttons, the chosen chip's 2px outline, the active gallery segment, focus ring |
| `--nc-muted` | `#625D59` | second text colour | values, MRP (struck), notes, prose in dropdowns, counts, links at rest. The only grey: no ink at 60 / 65 / 70 / 75 / 80% |
| `--nc-rule` | `#DCD4CE` | every hairline | table rules, dropdown rules, idle chip borders, stepper box, field box, bag line rules, the empty part of a 2px line |
| `--nc-gold` | `#876629` | the accent, as text | exactly four things: (1) the eyebrow (category); (2) a saving in words ("40% off", "20% off" on a bag line, "You save …", the next-rung line, "2 pieces · 10% off"); (3) the rung the bag sits on; (4) "Adding to your bag…" |
| `--nc-gold-line` | `#C99A4C` | the same accent, as a mark | the fill of the bag's 2px offer line and the ★ glyph. Never text, never a border, never a fill of a box or button |

Counted as the rubric counts: 2 grounds, ink, 1 muted ink, 1 rule, 1 accent = 6. Chromatic hues: 1.
Not allowed anywhere inside `.nf-clean`: sage or any green, blush, red, blue, payment-brand colours, white `#FFFFFF`, a second grey, ink at an opacity, gold as a border or fill, gradients, shadows.
The swatch squares beside metal and stone names keep their own colours: they picture the piece, like a photograph.

### 2.2 Type: one face, eight styles

Face: `"Jost", "Jost Fallback", "Inter", system-ui, sans-serif` (`--nc-font`). Weights 300, 400, 500 only (600 is not loaded). Lining numerals. No italic. No capitals except the label and the button.

| Style (class) | Phone 360 / 390 | Laptop 1280 / 1440 (from 1024px) | Weight | Tracking | Case | Colour | Used for |
|---|---|---|---|---|---|---|---|
| Title `nc-title` | 26 / 32 | 34 / 40 | 300 | -0.005em | mixed | ink | the `<h1>` only (title A) |
| Heading `nc-heading` | 22 / 28 | 28 / 34 | 300 | -0.005em | mixed | ink | section headings below the buy area |
| Sheet heading `nc-heading nc-heading--sheet` | 20 / 28 | 20 / 28 | 300 | -0.005em | mixed | ink | "Your bag", "Your bag is empty", size guide headings |
| Price `nc-price__now` | 20 / 24 | 22 / 28 | 500 | 0 | - | ink | the price; the bag's total |
| Text `nc-text` (+`--strong`, `--muted`) | 14 / 22 | same | 400 (500 strong) | 0 | mixed | ink (muted in dropdown prose) | dropdown prose, bag line names, "Total", review text |
| Row `nc-drop > summary` | 15 / 20 | same | 400 | 0 | sentence | ink | dropdown row names only |
| Small `nc-small` (+`--ink`, `nc-gold`) | 13 / 20 | same | 400 | 0 | mixed | muted (ink or gold by role) | everything supporting: MRP, "% off", tax note, table values, rungs, status lines, chips, card names and prices, bag meta |
| Label `nc-label` (+`--gold`, `--muted`) | 11 / 16 | same | 500 | 0.18em | CAPS | ink (gold for the eyebrow and a saving) | eyebrow, table labels, picker labels, "Most loved", "As featured in", "Check" |
| Button `nc-btn` | 13 / 16 (12 in `--sm`) | same | 500 | 0.14em (0.12em sm) | CAPS | ink or ivory | every button |

Sizes on a phone: 11, 12, 13, 14, 15, 16 (the pincode input, to stop iOS zooming), 20, 22, 26 = 9. Buy box (title to buttons): 26, 20, 13, 11 = 4 sizes, 5 styles (title, price, small, label, button) plus the chip's "PRE-ORDER" note (11px caps, 0.08em) in pre-order states.
Title B (preview switch only) is section 3.6.

Fallback while Jost loads: three `@font-face "Jost Fallback"` rules map the phone's sans to Jost's width at each weight (`size-adjust` 91.8% at 300, 94.8% at 400, 99% at 500, measured on the real product names). The title keeps its line count across the swap.

### 2.3 Spacing

Scale (8 steps): 4, 8, 12, 16, 24, 32, 48, 64 (`--nc-1` to `--nc-8`). Inside the buy box three smaller optical gaps are fixed by this spec and nowhere else: 2 (category row to name), 6 (name to price), 14 (photo to category row at 360, so the price clears the bar).
Gutter: 16px on phones (`--nc-gutter`), 24px page padding from 768px, as today.
Rhythm in the buy box: 16 between blocks (price to table, table to picker, picker to picker), 20 above the buttons, 12 under them, 24 above the dropdowns.
Section padding below the buy area: 48 top on phones, 64 on laptop. One value per viewport.

### 2.4 Rules and shapes

One hairline: `1px solid var(--nc-rule)`. One strong line: `1px solid var(--nc-ink)` (outlined buttons) and `2px solid var(--nc-ink)` (the chosen chip). One 2px line (`nc-track`, `nc-segs`). Radius 0 everywhere. No shadow on the page or in the bag (the sheet's own dimmed overlay from `ui/sheet` stays). No filled box behind text except the notice band (linen) and the filled button.

### 2.5 Buttons (one family)

| Variant | Class (`cleanButton(...)`) | Height | Look | Used for |
|---|---|---|---|---|
| Filled | `nc-btn nc-btn--ink` | 52 | ink ground, ivory label | Add to cart, Reserve now, Checkout, Explore jewellery (empty bag). At most one in view per surface |
| Outline | `nc-btn` | 52 | 1px ink, ink label, ivory ground; on hover (pointer devices) fills ink | Buy Now |
| Bar | `+ nc-btn--bar` | 48 | same two fills | the phone's pinned bar |
| Small | `nc-btn nc-btn--sm` | 44 | outline, 12px label | Add / Choose size on cards, Add in the empty bag, View all, Write a review |
| Text | `nc-link` (+`nc-tap` for a 44px target) | text | muted or ink, 1px rule-colour underline 4px below | View bag, Size guide, Remove, Undo, read the policy, WhatsApp, returns |

Pressed: opacity 0.8. Disabled or busy: opacity 0.55, label swaps to the busy words ("Opening checkout…", "Adding…"). The existing `press-scale` class may stay on buttons. No payment discs inside any button (owner question 2).
`ui/button.tsx` is not used inside the page or the bag any more (plain `<button className={cleanButton(...)}>`): it brings its own height, radius ring and svg sizing.

### 2.6 Icons

lucide only, `strokeWidth={1.25}`, colour ink: `Heart` 20 (wishlist, beside the title; filled ink when saved), `X` 18 (close the bag), `Minus` / `Plus` 14 (stepper, inside `CleanStepper`), `ArrowLeft` 14 (laptop "Back"), `Loader2` 14 (busy). The dropdown's plus is drawn by CSS (12px, 1px). The ★ is a text glyph in `--nc-gold-line`, `aria-hidden`.
Gone: the three badge icons and their peach tiles, the four-point star, the gift icon, the three UPI discs, Visa and Mastercard marks, the banknote, the returns arrow, the WhatsApp bubble, the map pin and the pincode result icons, the back arrow on the photo, "▶".
Icons in the buy box: 1 (the heart).

### 2.7 Motion

| What | Duration | Easing |
|---|---|---|
| Hover, press, chip border, gallery segment | 150ms (`--nc-fast`) | ease |
| Dropdown: plus to minus, contents rise 4px and fade in, height where the browser can animate to auto (`::details-content`; Chrome and Android WebView 131+) | 220ms (`--nc-slow`) | `cubic-bezier(0.22, 1, 0.36, 1)` |
| The 2px offer line filling | 400ms | same curve |
| Pinned bar sliding in and out | 300ms ease-out (today's, kept) | |
| Bag sheet in 400ms / out 250ms (`ui/sheet`, unchanged) | | |

Nothing else moves: no shimmer, pulse, marquee, count-up or pop inside `.nf-clean` (the `heart-pop` on saving a piece stays; the header's marquee is the header's). `prefers-reduced-motion: reduce` sets every animation and transition inside `.nf-clean` to nothing. Do not use Tailwind `duration-[…]`, `delay-[…]` or `ease-[…]` (a repo test forbids them).

### 2.8 Focus

`:focus-visible` inside `.nf-clean`: `outline: 2px solid ink; outline-offset: 2px`. The pincode input draws it inside its box (`outline-offset: -2px`). Radio groups keep `role="radiogroup"`, `aria-checked`, `onRadioGroupKeyDown` and `rovingTabIndex`.

### 2.9 The parts (import from `@/components/clean`)

| Part | What it is |
|---|---|
| `CleanStyles` | the `<style>`; render once per root |
| `CLEAN_ROOT`, `cleanButton()`, `cleanType` | the class names |
| `CleanPrice` | price row: price, struck MRP, "N% off", note; MRP and saving only when there is a saving |
| `CleanFacts`, `CleanFact`, `CleanDots` | the label/value table and a dotted line of values that wraps cleanly |
| `CleanRungs` | the offer's rungs as words; `each` adds a second line per rung; `centered` for the bag; `muted` for pre-order; marks `data-rung`, `data-reached`, `data-current`, `data-passed` |
| `CleanTrack` | the 2px progress line (`role="progressbar"`) |
| `CleanDropdown`, `CleanDropdowns` | a native `<details>` row and its group |
| `CleanStepper` | minus, number, plus |
| `rupees()`, `percent()`, `rungStates()` | formatting and the ladder's state rule |

These files are frozen for both engineers (section 9.4). If a part is missing, build it in your own folder from the same classes; if a token must change, ask the lead: the spec changes first.

---

## 3. The product page, block by block

Root: `<div className="nf-clean min-h-screen">` with `<CleanStyles />` as its first child. `html.nf-next` is still set on mount (shared dialogs and toasts rely on it). One `<main>`; the footer and the pinned bar stay outside it.

### 3.1 Phone (360 and 390 wide), top to bottom

y values are for Woven Gold Hoops at 360x640 (measured on the mock; at 390 the photo is 30px taller, so add 30 below it).

| # | Block | y at 360 | Height | Spec |
|---|---|---|---|---|
| 1 | Header (announcement strip + menu bar) | 0 | 107 | untouched; the page keeps `pt-[107px] md:pt-[126px] lg:pt-[136px]` |
| 2 | Photo | 107 | 360 | square, edge to edge, ground `--nc-linen`, swipe with snap as today, tap opens the zoom. **Nothing is laid over it**: no back arrow, no heart, no "1 / 8" chip, no "▶ Video" chip. Image attributes unchanged (section 9.2) |
| 3 | Position line | 467 | 2 | `nc-segs`: one segment per slide (photos plus the reel when there is one), 2px gap, the current one ink (`data-on`), the rest rule colour; `aria-hidden`; not drawn for a single slide. Follows `selectedImage` |
| 4 | Category row | 483 | 20 | gap above: 14. Left: the eyebrow, `<Link to="/jewellery" data-pdp="eyebrow" className="nc-label nc-label--gold nc-tap">{piece.category}</Link>` (it replaces the back arrow as the way to the collection). Right: the shop's rating, `<a href="#customer-reviews" onClick={toReviews} className="nc-small nc-tap">`: `★` (`nc-star`, `aria-hidden`) + `4.5` in ink + ` · ` + `5,000+ clients` underlined (`nc-link`). Figures from `src/lib/trust.ts` (`SHOP_RATING`, `clientsLabel`). `aria-label="Rated 4.5 out of 5. Trusted by 5,000+ clients. Jump to reviews."` |
| 5 | Name | 505 | 32 (64 on two lines) | gap 2. `<h1 data-pdp="title" className="nc-title">{piece.name}</h1>` in a flex row with the wishlist button at the right: `nc-iconbtn`, lucide `Heart` 20, `margin: -6px -12px -6px 0` so the glyph ends on the gutter; filled ink when saved; `aria-label` as today; calls `handleWishlist` (the pinned `toggleItem` call unchanged) |
| 6 | Price row `#product-price` | 543 | 24 | gap 6. `<CleanPrice id="product-price" price={shown.priceLabel} compareAt={saving > 0 ? shown.compareAtLabel : null} percentOff={saving > 0 ? discountPercent(shown) : null} note={`incl. ${GST_LABEL}`} />`. Reads: **₹1,049** ~~₹1,749~~ 40% off incl. 3% GST |
| 7 | Facts table | 583 | 147 | gap 16. `<CleanFacts>` with two rows (one when the piece is sold out). Label column 72px (96 on laptop), 12px gap, 11px row padding, hairline above, between and below. Row 1 **QUALITY**: `<CleanDots items={["Anti-tarnish", "Skin-friendly", platingBadge(finish), hasZirconeStone(piece) && "Zircone Stone"]} />` (the same four values as today's badges; wraps to "Anti-tarnish · Skin-friendly" / "PVD 18K gold coated" at 360). Row 2 **OFFER**: section 4.3 |
| 8 | Choices (only when the piece has them) | 778 | 62 to 176 | gap 16 above each group. Section 5.1 |
| 9 | Buttons `#product-actions` | 750 (no choices) | 52 | gap 20. `nc-btnrow`: "Buy Now" (outline, left), "Add to cart" (filled, right). Section 5.3 |
| 10 | Delivery line (inside `#product-actions`) | 814 | 20 | gap 12, centred, `nc-small`. Section 4.4 |
| 11 | Dropdowns | 858 | 4 x 53 closed | gap 24. Section 6 |
| 12 | Complete the look | | | gap 48. Section 7.1 |
| 13 | Reviews, Press, Reel, More, Footer | | | section 7 |
| - | Pinned bar | 575 | 65 | section 5.4 |

Photo to buttons: 283px. Blocks between photo and buttons: 4 (category and name, price, facts table, choices when present). Boxes between photo and buttons: 0 (chips are the only boxes, and only on pieces with choices). Rules: 3. Icons: 1.
At 390x844 (no choices): name 535, price 573, table 613, buttons 780 to 832, all on the first screen; the bar is hidden at load.

### 3.2 Laptop (1280 and 1440 wide)

Same blocks, same order, same parts. Differences only:

| Block | Spec |
|---|---|
| Breadcrumb row | stays above the two columns: `Home / Jewellery / {name}` in `nc-small` (current page ink) and "Back" (`nc-small nc-link`, `ArrowLeft` 14) calling `goBack` |
| Gallery (left half, sticky as today) | the 2x2 grid of the first four photos, 4px gaps, ground linen, hover zoom as today. No heart on it. "+N photos" stays as the one mark on a photograph: bottom right, 12px in, ivory ground, `nc-label`, padding 6px 10px |
| Buy column (right half) | left padding 48px at 1280, 64px at 1440; content max-width 520px (today 580): the column is narrower so the lines of the table and the buttons stay short. `HERO_SIZES` unchanged (the photo column's share is unchanged) |
| Type | title 34/40, section headings 28/34, price 22/28; everything else as on the phone |
| Facts table | label column 96px, row padding 12px. " off" is drawn after each rung's rate ("Buy 2 · 10% off") |
| Buttons | the same pair, 52px, in the column. No pinned bar |
| Measured on the mock | 1440x900: name y 198, price 244, table 288 to 419, buttons 439 to 491. 1280x720 with a ring's sizes: buttons 544 to 596. Buttons are on the first screen in every state |

From 768 to 1023px the page keeps today's stacked layout (desktop gallery above, one column) with the phone's type sizes.

### 3.3 Verdicts: every element of today's page

| Today (code map 1.1) | Verdict | What happens |
|---|---|---|
| Announcement strip, menu bar | keep | untouched (header is out of scope) |
| Breadcrumb + Back (laptop) | restyle | `nc-small`, same links, same `goBack` |
| Back arrow on the photo (phone) | remove | the eyebrow links to `/jewellery`; the menu, logo and the phone's own back remain |
| Heart on the photo (phone and laptop) | move | beside the name; same handler |
| "1 / 8" counter chip | restyle | the 2px position line under the photo |
| "▶ Video" chip | remove | the reel is the last segment of the position line; nothing is promised on the photo |
| Photo, swipe, zoom, reel slide, variant photo first | keep | identical behaviour and image attributes |
| "+N photos" (laptop) | restyle | ivory, label style |
| Eyebrow (category) | restyle | 11px caps gold (was 9.5px), now a link |
| "★ 4.9 · 50 reviews" | replace | the shop's own "★ 4.5 · 5,000+ clients" (section 4.5); same jump to the reviews |
| Title in Velista capitals, 22 / 30px, weight 600 | restyle | Jost 300, mixed case, 26 / 34px (title A); `data-pdp="title"` |
| Price in Velista | restyle | Jost 500, 20 / 22px |
| MRP, "40% OFF", "incl. 3% GST" | restyle | one 13px style; "40% off" in gold words, no caps |
| Three or four bordered badges with icons | merge | one row of the facts table, plain words, middle dots |
| "N pieces sold in the last 48 hours" band | remove | invented (section 4.2) |
| Offer ladder box | merge | the OFFER row of the facts table (section 4.3); same rungs, same per-piece prices, same status sentences, same "View bag" |
| Variant pickers, ring-size list, stock sentences | restyle | section 5.1 |
| Size guide link and sheet | restyle | section 5.2 |
| Buy Now + UPI discs, Add to cart | restyle | one button family, no discs (section 5.3) |
| "Reserve on WhatsApp" link behind `{false && …}` | keep | still switched off, still in the file (it was kept on purpose); its classes become `cleanButton({ size: "sm", block: true })` so the file's palette rule holds |
| Gift line with gift icon | merge | into the delivery line under the buttons, "Gift-boxed" (section 4.4) |
| Details / Care / Delivery & returns fold-downs | dropdown | four rows: Description, Details and size, Care and plating, Delivery and returns (section 6) |
| Styling tip (italic serif, gold side rule) | restyle | a plain muted paragraph at the end of Description |
| Pincode checker (grey, black, green, amber, red, icons) | restyle | `look="clean"` (section 6) |
| "Questions? Chat with us on WhatsApp" | keep | text link in Delivery and returns; still an `<a href>` so `Contact` fires |
| Complete the look / Complete the set | restyle | section 7.1 |
| Customer reviews | restyle + honest list | section 7.2 |
| As featured in | restyle | section 7.3 |
| Shop the reel (phone) | restyle | section 7.4 |
| More {category} | restyle | section 7.5 |
| "Someone bought" card (FomoPopup) | remove | invented (section 4.6) |
| Footer `compact slim` | keep | untouched |
| Pinned bar: heart + Buy Now + Add to cart | restyle | two buttons, no heart (section 5.4) |
| Lightbox, toasts, write-a-review dialog | keep | untouched shared parts |
| Skeleton while loading | restyle | same shapes on linen, inside `.nf-clean` |

### 3.4 Exact words on the page (in stock, no choices)

```
EARRINGS                                   ★ 4.5 · 5,000+ clients
Woven Gold Hoops                                               ♡
₹1,049  ₹1,749  40% off  incl. 3% GST
────────────────────────────────────────────────────────────────
QUALITY   Anti-tarnish · Skin-friendly · PVD 18K gold coated
────────────────────────────────────────────────────────────────
OFFER     Buy 2 · 10%      Buy 3 · 20%      Buy 4 · 30%
          ₹944 each        ₹839 each        ₹734 each
          Applied in your bag. No code needed.
────────────────────────────────────────────────────────────────
[ BUY NOW ]                              [ ADD TO CART ]
   Free insured shipping · Arrives 25–27 Nov · Gift-boxed
────────────────────────────────────────────────────────────────
Description                                                    −
  {piece.blurb}
Details and size                                               +
Care and plating                                               +
Delivery and returns                                           +
```

### 3.5 Title A (default) and the eyebrow

- Title A: `nc-title`: Jost 300, 26px / 32px on phones, 34px / 40px from 1024px, letter-spacing -0.005em, mixed case as the name is written, ink, `text-wrap: balance`, left aligned. Two lines for names over about 26 characters at 360 (the longest, "Serpentine Whisper Chain — Silver", is two lines on phones and one on laptop).
- Eyebrow: `nc-label nc-label--gold`: Jost 500, 11px / 16px, 0.18em, caps, gold `#876629`.
- Both carry the preview's hooks: `data-pdp="title"` on the `<h1>`, `data-pdp="eyebrow"` on the eyebrow link.
- Left aligned, not centred as in the owner's screenshot: the rating and the wishlist share the two lines, and the table, choices and dropdowns below all start on the same left edge (owner question 4).

### 3.6 Title B (preview switch only)

The preview sets `data-pdp-title="b"` on `<html>`. B is CSS only; nothing in the page's code knows about it. The exact rules (also saved as `pdp/design/title-b.css`, to copy into `pdp/preview-kit/title-b.css`):

```css
html[data-pdp-title="b"] .nf-clean [data-pdp="title"] {
  font-family: "Cormorant Garamond", Georgia, serif;
  font-weight: 500;
  font-size: 31px;
  line-height: 34px;
  letter-spacing: 0;
}
html[data-pdp-title="b"] .nf-clean [data-pdp="eyebrow"] {
  letter-spacing: 0.24em;
}
@media (min-width: 1024px) {
  html[data-pdp-title="b"] .nf-clean [data-pdp="title"] {
    font-size: 42px;
    line-height: 46px;
  }
}
```

B is a mixed-case serif (Cormorant Garamond 500, already loaded): warmer and more "jewellery house", less plain than A. It is 2px taller per line; the price still clears the bar at 360x640 (y 569). These rules are not in `clean.css`: nothing of B ships.

---

## 4. Qualities, sold count, offer, gift line, pop-ups, announcement

### 4.1 Qualities

One row of the facts table, label QUALITY, values as plain words joined by middle dots: Anti-tarnish · Skin-friendly · {the piece's own plating from `coatingOf`} · Zircone Stone (stone pieces only). 13px, muted ink, no chips, no borders, no fills, no icons. All values are readable without a swipe; they wrap between values, never inside one, and a wrapped line starts without a dot. Height 42px on one line, 62px on two.

### 4.2 The sold-count line: removed

"6 pieces sold in the last 48 hours" is a number worked out from the letters of the product's handle (`src/lib/dailySold.ts`: 3 to 7, the same on every visit, shown on sold-out pieces too). It is not carried over. The page no longer imports `recentSoldCount`. `dailySold.ts` itself is left alone (the unrouted old page still imports it). The source test's anchor on that string becomes an assertion that the string is absent.

### 4.3 The offer (Buy 2 / 3 / 4)

Same data and arithmetic as today, in `src/components/jewellery/PdpOfferLadder.tsx`, rewritten by the page engineer to return the whole OFFER row (`<CleanFact label="Offer">` around the markup below). The page renders it inside `<CleanFacts>` with the line a test pins, unchanged: `{!soldOut && <PdpOfferLadder price={shown.price} preorder={sizePreorder || variantSoldOut} />}`.

```
<div data-offer-ladder data-state={min(totalItems, top)} role="group" aria-label="Buy more, pay less">
  <CleanRungs offers={QUANTITY_OFFERS} totalItems={totalItems} muted={preorder}
              each={preorder ? undefined : (offer) => `${rupees(pieceAtRung(price, offer))} each`} />
  <div aria-live="polite" class="flex items-start justify-between gap-3">
    <p class="nc-small">{line}</p>
    {totalItems > 0 && !preorder && <button class="nc-small nc-link nc-link--ink nc-tap">View bag</button>}
  </div>
</div>
```

| State | Rungs | The line under them |
|---|---|---|
| Bag empty, no code | ink names, muted "₹944 each" | "Applied in your bag. No code needed." (what `pdpOfferStatus` returns for an empty bag; also the fallback whenever it returns nothing) |
| Bag has pieces | the rung the bag sits on is gold (name and price); rungs below it are muted | the sentence from `pdpOfferStatus`, unchanged ("Add to bag for 20% off everything: it adds ₹580, not ₹999."), with "View bag" at the right. The line keeps room for two lines (min-height 40px) while the bag holds pieces |
| A typed code | as above | `pdpOfferStatus`'s code sentences, unchanged |
| Pre-order choice | all three muted, no prices (the blank second line keeps the height, so the sizes below do not jump) | "Not on pre-orders. In-stock pieces only." |
| Piece sold out | the row is not drawn | |
| `price <= 0` | nothing | |

No box, no legend on a border, no serif numerals, no divider rules between rungs, no literal percentage or rupee in the file (rates from `QUANTITY_OFFERS`, prices from `pieceAtRung`, formatting from `clean/format`). " off" after each rate is read out on every screen and drawn from 430px wide. `[data-offer-ladder] ul` still exists (the rungs' list), so the pinned bar's rule works unchanged.
The offer is now said in three places on the page instead of four: the header strip, this row, and the label beside Complete the look.

### 4.4 The gift line becomes the delivery line

One centred `nc-small` line inside `#product-actions`, under the buttons, no icon:

| State | Words |
|---|---|
| In stock, visitor (date known) | "Free insured shipping · Arrives {arrivesBy} · Gift-boxed" (`arrivesBy` is today's `deliveryRangeFromNow()`, e.g. "25–27 Nov") |
| In stock, pre-built page and automated browsers (no date) | "Free insured shipping · Gift-boxed" |
| Pre-order choice (a size or metal reserved on WhatsApp) | "Free insured shipping · Gift-boxed" (the lead time is the sentence under the choices) |
| Piece sold out | `${SOLD_OUT_LEAD}, gift-boxed` (today's sentence, unchanged) |

"Gift-ready: every piece arrives in the Naira gift box" is shortened to "Gift-boxed". The arrival date is new on the first view; it used to be read only inside the closed Delivery fold-down.

### 4.5 The rating in the head

Today every piece shows "★ 4.9 · 50 reviews" (51 on some). The code map shows where it comes from: one bundled list of 46 reviews shown on every jewellery page plus 4 or 5 dealt to each product from a bank of 260 by a hash of its name. Only 7 of them are marked as genuine photographed customer reviews. The figure is not this product's rating, so it is not carried over.
In its place: the shop's own figures the owner gave on 16 Nov 2026 (`src/lib/trust.ts`): "★ 4.5 · 5,000+ clients", the same line the bag shows. The page and the bag now agree.
The embedded `#nf-piece` keeps its shape `{ piece, rating }` with `rating: null`; the page no longer loads `@/data/reviewWall` for a summary.

### 4.6 Pop-ups

`FomoPopup` ("{name}, {city} · 5 min ago / bought the {piece}") makes up the name, the city, the minutes and the piece. The page stops rendering it; its lazy import and the `mobileStickyVisible` plumbing go. `FomoPopup.tsx` is left alone (the unrouted old page imports it). No other pop-up exists on the page; none is added.

### 4.7 The announcement strip on the product page

Untouched: it is the header's, on every page, and `AnnouncementBar.test.tsx` requires it to keep running on the product page. Two of its four lines are flagged for the owner, not changed: "Sitewide sale live today!" (the Buy 2 / 3 / 4 offer is permanent) and "Made in limited batches" (owner question 5).

---

## 5. Choices and every state, the size guide, the buttons, the pinned bar

### 5.1 Choices

One pattern for every option (metal, stone, colour, size, month) and for the fixed ring-size list:

- Label row (min-height 24): `nc-label` with the option's name ("METAL", "SIZE · US", "RING SIZE · US"), then the chosen value in `nc-small nc-small--ink` 8px to its right. For ring sizes, "Size guide" at the right end of the same row (`nc-small nc-link nc-link--ink nc-tap`).
- Chips 8px under it (`nc-chips`, `role="radiogroup"`, `aria-label` as today): each `nc-chip`, 44px high, at least 52px wide, 14px side padding, 13px ink, 1px rule-colour border. Chosen: 2px ink border, nothing filled. A 12px swatch square before metal and stone names (kept). A value that cannot be bought with the other choices carries "PRE-ORDER" under it (`nc-chip__note`).
- More than six values: a native select (`nc-select`, 44px), unbuyable values reading "X · pre-order" (as today).
- The stock sentence 8px under the chips, `nc-small`, today's exact words.

| State (code map 1.8) | What shows | Buttons |
|---|---|---|
| No choice | no picker | Buy Now + Add to cart |
| Metal, stone or colour | label + chips with swatches | both |
| More than 6 values | label + select | both |
| Ring sold in sizes | "SIZE · US 6" + Size guide; chips; "US 6 is in stock and ships now." | both |
| Ring from the fixed list | "RING SIZE · US" + Size guide; chips 5 (PRE-ORDER), 6, 7 (PRE-ORDER); "US 6 is in stock and ships now." or "US 5 is a pre-order, {SIZE_PREORDER_LEAD}." | both, or Reserve now on 5 and 7 |
| Adjustable ring | chips 5 to 9, all available; "US 6 ships now. {adjustableFitNote}" | both |
| Metal + size | two groups, 16px apart | both |
| Size pre-order / variant sold out | the chosen chip says PRE-ORDER; sentence "{Choice} is sold out for now. {VARIANT_SOLD_OUT_LEAD}"; OFFER row muted ("Not on pre-orders. In-stock pieces only.") | one full-width filled "Reserve now" |
| Piece sold out | no OFFER row, no pickers beyond what Shopify lists | one "Reserve now"; delivery line = `${SOLD_OUT_LEAD}, gift-boxed`; JSON-LD OutOfStock |
| Set | heading "Complete the set" | as its own state |
| Loading | skeleton | none |
| Missing piece | redirect to `/jewellery` | |

Choosing never moves what is under the finger: the OFFER row keeps its height across in-stock and pre-order choices; the stock sentence is always one block under the chips.

### 5.2 Size guide

Same trigger, same `RingSizeGuideModal` (bottom sheet on phones, centred dialog from 768px), same content and `useBackToClose("nfSizeGuide")`. Restyled inside the two files (they are the product page's own): the dialog's content carries `nf-clean`; headings in the sheet-heading style (no Velista); the chart as hairline rows (label style for the column heads, 14px text, the highlighted size in medium ink, no fill); how-to lists in 14px muted text; close as `nc-iconbtn` with `X`. The same chart inside "Details and size" for rings uses the same look.

### 5.3 The buttons (`#product-actions`)

- In stock: `nc-btnrow` (two equal columns, 8px gap). Left "Buy Now" (`cleanButton()`), right "Add to cart" (`cleanButton({ fill: "ink" })`). Buy Now reads "Opening checkout…" while busy. Both disabled while `cartLoading || buying`.
- Pre-order: one full-width filled "Reserve now" (the only `<button>` in `#product-actions`, as `soldOutPageFirstPaint.test.tsx` requires).
- The delivery line (4.4) is the last child of `#product-actions`.
- No payment discs in Buy Now. No wishlist button here (it would be a second `<button>` in `#product-actions`).
- Handlers are today's, untouched: `handleAddToCart`, `handleBuyNow`, `handlePreOrder`, `cartItem()`.

### 5.4 The pinned bar (phones)

- Wrapper as today (fixed, bottom, z-40, `md:hidden`, `ref={stickyBarRef}`, hidden by inline `transform: translateY(110%)` + `visibility: hidden` + `pointer-events: none`, `aria-hidden` when hidden). Inside it `nc-bar`: ivory, solid (no blur, no translucency), 1px rule on top, no shadow, padding 8px 16px plus the bottom safe area.
- Contents: "Buy Now" (outline) and "Add to cart" (filled), `size: "bar"` (48px), equal widths. Pre-order: one filled "Reserve now". The heart leaves the bar.
- Height 65px plus the safe area (under the 72px `--pdp-sticky-bar-h` the toasts assume).
- When it shows: today's three conditions, the effect's lines unchanged (they are pinned by a test and each has a history): the page's Add to cart is not fully on screen, and the bar would not cover the price, and it would not cover the offer's rungs (`[data-offer-ladder] ul`, which is now the `CleanRungs` list). So, as today, the bar steps away for a moment while the rungs pass the bottom edge and returns after them. At load at 360x640 it is shown on a one-line name (price ends 567, rungs start below 640) and held back on a two-line name until the first scroll.

---

## 6. The dropdowns

Four rows in one group (`<CleanDropdowns>`), 24px under the delivery line, each a `<CleanDropdown>` (a native `<details>`: contents stay in the HTML for search engines and the pre-built page, find-in-page and the keyboard work, several can be open at once).

| # | Name (exact) | Panel id | Open at load | Contents, mapped from today |
|---|---|---|---|---|
| 1 | Description | `pdp-panel-description` | **yes** | `piece.blurb` (was the first paragraph of Details); then `piece.stylingTip` as a second plain paragraph when the piece has one |
| 2 | Details and size | `pdp-panel-details` | no | the specification list from `specsOf(piece)` as `<CleanFacts bare>` rows (label = the listing's own label, "Detail" when it has none; value in muted 13px); the "Stone" row from `stoneOf` when not already listed; the `piece.materials` line only when there are no specs; for rings the `RingSizeGuide` chart; the size-guide photograph (`piece.sizeGuide`, max-width 420px, on linen, no border) |
| 3 | Care and plating | `pdp-panel-care` | no | `piece.care ?? listedCare ??` the default sentence; then the two answers built today ("Will it tarnish?", "Sensitive skin?"), question in `<strong>` (medium ink), answer muted |
| 4 | Delivery and returns | `pdp-panel-delivery` | no | the delivery sentence, template unchanged (`leadTime`, or "Order today and it arrives by {arrivesBy}.", or `PREORDER_NOTE`, then "Free insured shipping across India, dispatched from our Mumbai atelier."); "Cash on delivery available. 7-day returns — read the policy." (link to `/exchange-return-policy`, `nc-link nc-link--ink`); `<PincodeChecker preorder={isPreorder} look="clean" />`; "Questions? Chat with us on WhatsApp" as a text link (`<a href>` to the same URL as today) |

Look (all from `clean.css`):
- Row: 52px minimum, name at the left in Jost 400 15px / 20px ink, sentence case, no icon at the left; a 12px plus at the right drawn with two 1px ink lines. One hairline above the first row and one under every row. No box, no fill.
- Open: the plus's upright line turns flat (plus becomes minus) in 220ms; the contents rise 4px and fade in over 220ms; where the browser supports it the row's height animates over the same 220ms. Closed again: instant on browsers without height animation.
- Panel: padding 0 24px 20px 0; prose 14px / 22px muted; 12px between paragraphs and blocks; links ink with the hairline underline.
- Reduced motion: no animation.

Pincode check, `look="clean"` (a new optional prop on the shared `product/PincodeChecker.tsx`; without it the component renders exactly as today for the apparel page):
- No "Delivery" label row and no map pin (the dropdown names it); a visually hidden label "Pincode".
- `nc-field`: one 44px hairline box; the input (16px, placeholder "Enter pincode") with a text button "CHECK" inside it at the right (label style).
- Results in today's exact words, as `nc-small` lines with no icons and no green, amber or red: the delivery line and the COD line in ink, the "can't confirm" note in muted, the error "Enter a valid 6-digit pincode." in ink with `role="alert"`.

---

## 7. Below the buy area

Order unchanged: Complete the look, Reviews, Press, Reel (phones), More {category}, Footer. Five sections and the footer. Each has one idea, sits on ivory, and opens with the same device: a left-aligned `nc-heading` (Press uses a centred label instead, because it is a credit line, not a section to read). 48px above each on phones, 64px on laptop. No eyebrow above any heading, no section-wide rules or bands, no Velista.

### 7.1 Complete the look (`#complete-the-look`)

Stays where it is: after the dropdowns on phones, inside the buy column on laptop.
- Head row: `nc-heading` "Complete the look" ("Complete the set" by `isSetRow`), and at the right the gold label "{n} pieces · {rate} off" read from `QUANTITY_OFFERS[0]` as today (`nc-label nc-label--gold`).
- Three cards in a 3-column grid, 12px gap (`PairingCard compact`): square photo on linen; the name in `nc-small nc-small--ink`, two-line clamp, inside the 44px link exactly as the source test pins it (`<Link … min-h-[44px] …><span className="…line-clamp-2…">{piece.name}</span></Link>`); price in `nc-small` (with "· Gold" when a variant is added); then `cleanButton({ size: "sm", block: true })`: "Add" (one tap: opens the bag, adds) or "Choose size" / "Choose month" (a link to that page). "Adding…" while busy.
- Ink outline, not sage. Names in Jost, not Velista.

### 7.2 Reviews (`#customer-reviews`)

A new optional prop on the shared `CustomerReviews.tsx`: `look="clean"` (without it the component is exactly today's, for the apparel page). With it:
- **Which reviews:** only the ones the code can vouch for: `orderedRealReviews(productName)` (the 7 photographed customer reviews, this piece's first) and the approved reviews customers submitted for this product (Supabase `customer_reviews`, as today). The dealt bank (`getProductReviews`), `jewelleryReviews` and `jewelleryOneLiners` are not shown on the product page (owner question 1).
- Head row: `nc-heading` "Reviews"; at the right `nc-small`: ★ (`nc-star`) "4.5/5" in ink "· Trusted by 5,000+ clients" (the shop's figures, the same as the head of the page and the bag). No "Kind words" eyebrow, no large average, no row of five big stars.
- List: one review per row between hairlines, no boxes, no avatars, no initials tile. Name `nc-text nc-text--strong`; under it `nc-small`: the review's own stars as ★ glyphs in `nc-star` (with `aria-label="5 out of 5"`) and "· Verified buyer" only where the data says so; the text in `nc-text nc-text--muted` (mixed case, upright); the customer's photographs as 72px squares on linen (tap opens them as today). Three reviews shown; one column on phones, two columns (48px gap) on laptop.
- Under the list: two small outline buttons side by side: "View all" (shows the rest in place; hidden when there are three or fewer) and "Write a review" (opens the existing `WriteReviewModal`, untouched).
- Gone: the featured quote in italic capitals, the photo strip above the list, the filter chips, the green "Verified buyer" label.

### 7.3 Press (`PressMarquee.tsx`, the product page's own)

- A centred `nc-label` "As featured in" (the heading's undefined `tracking-nf-15` class goes).
- The same five logos, grey (`grayscale`, 70% opacity, multiplied onto ivory as today), no colour on hover, no dots between them, no rules above and below the band.
- Phones: the existing marquee (still under `motion-reduce:animate-none`). Laptop: a still row of five, evenly spaced, no movement.
- Padding 32px above and below. Nothing else: no links, no quotes (owner question 6).

### 7.4 Shop the reel (`ReelShopNext.tsx`, phones only, the product page's own)

- `nc-heading` "Shop the reel"; the "Seen on Naira" eyebrow goes.
- The video rail as today (the reel's own title over the video stays, it is part of the film).
- Under it: `nc-label` "In this reel"; piece rows between hairlines: name `nc-small nc-small--ink`, price `nc-small`, and `cleanButton({ size: "sm" })` "Add" / "Reserve". Ink, not sage; Jost, not Velista.
- Must stay after `<PressMarquee />` (source test).

### 7.5 More {category}

- `nc-heading` "More earrings" (today's words).
- Cards without buttons: square photo on linen, name (two-line clamp) and price as in 7.1. Phones: the sideways rail, 42vw cards, 12px gap, next card peeking, no arrows. Laptop: 4-column grid, 12px column gap, 32px row gap.

### 7.6 Footer

`<Footer compact slim />`, untouched.

---

## 8. The bag, block by block

File: `src/components/CartDrawerNext.tsx`. `SheetContent` carries `nf-clean` (and keeps `nf-palette`); `<CleanStyles />` is its first child, because the bag opens on every page. Same sheet, same open and close, same swipe and back handling.

### 8.1 Phone (full-screen sheet) and laptop (right drawer, 420px wide, hairline at its left)

One layout for both. y values at 360x640 with two pieces (measured on the mock).

| # | Part | y | Height | Spec |
|---|---|---|---|---|
| 1 | Header | 0 | 57 | padding 6px 4px 6px 16px, hairline under it. Left: `SheetTitle` "Your bag" in the sheet-heading style with the count 10px to its right in `nc-small` ("1 piece" / "3 pieces"; nothing when empty). Right: one close button for every width, `nc-iconbtn` with `X` 18, `aria-label="Close bag"` (`requestClose`). The phone's chevron and the sheet's own corner X go (`closeClassName="hidden"`) |
| 2 | Offer strip `[data-ladder]` (only with pieces) | 57 | 42 | `<CleanRungs centered offers={QUANTITY_OFFERS} totalItems={lineCount} />` with padding 10px 16px ("Buy 2 · 10% off", "Buy 3 · 20% off", "Buy 4 · 30% off"; the rung the bag sits on gold, rungs passed muted, rungs ahead ink), then `<CleanTrack value={quantityOfferProgress(lineCount)} now={lineCount} max={TOP_QUANTITY_OFFER.minQuantity} label="{n} of {top} pieces" />` flush under it as the strip's bottom edge. No "Sitewide sale live today" line, no square marks, no second row of labels |
| 3 | Notices (when present) | under 2 | 40 | Undo `[data-undo]` (`role="status"`): `nc-notice`, "{name} removed" (truncated) and "Undo" (`nc-link nc-link--ink nc-tap`, a `<button>`). Error `[data-add-error]` (`role="alert"`): `nc-notice` with `addError` |
| 4 | List `[data-bag-list]` (the only part that scrolls) | 99 | 310 | one `<li data-line>` per line, 16px padding, hairline under each. Section 8.2 |
| 5 | Foot `[data-bag-foot]` (pinned) | 409 | 231 | hairline above; padding 12px 16px and the larger of 12px or the bottom safe area. Section 8.3 |

At 360x640: fixed parts 330px, list 310px (48% of the screen; today 219px, 34%). A line is 127px, or 147px with a choice line: two pieces show in full; a third scrolls. The bag still opens scrolled to the arriving line.

### 8.2 A line

```
[photo 72x90]  Woven Gold Hoops                         ₹944
               Size: US 7                (only when the line has choices)
               ₹1,049  10% off           (struck, then gold)
               [ − 1 + ]                              Remove
```

- Photo 72x90 on linen, a link to the piece (as today).
- Name `[data-line-name]`: link, `nc-text` (14 / 20), two-line clamp. Line total `[data-line-total]` at the right: `nc-text nc-text--strong`, tabular.
- Choices: `lineOptions(item)` in `nc-small`.
- "Adding to your bag…" (`role="status"`, `nc-small nc-gold`, `Loader2` 14) on the arriving line.
- Price row `[data-line-price]`, `nc-small`:
  - a discount applies, one piece: `<del>₹1,049</del>` then "10% off" in gold (the discounted price is the line total at the right; today it was printed twice);
  - a discount applies, two or more: `<del>₹1,049</del>` "₹734 each" (ink) "30% off" (gold): today's text, pinned by `bagBuy4.test.tsx`;
  - no discount, one piece: no price row (the total at the right is the price);
  - no discount, two or more: "₹1,049 each".
- Controls, 8px under: `<CleanStepper>` at the left (minus at one piece removes the line and is named "Remove {name}", as today; plus adds one; both disabled while `isLoading`); "Remove" at the right (`nc-small nc-link nc-tap`, `aria-label="Remove {name}"`). No X icon.

### 8.3 The foot

```
Total                                              ₹2,023     nc-text--strong / nc-price__now [data-total]
You save ₹225 · 10% for 2 pieces                              nc-small nc-gold  [data-you-save] or [data-next-rung]
Incl. 3% GST. Free insured shipping · arrives 25–27 Nov.      nc-small
        ★ Rated 4.5/5 · Trusted by 5,000+ clients             nc-small, centred [data-bag-trust] [data-rating-line]
              UPI · Cards · Cash on delivery                  nc-small, centred [data-pay-line]
[                     CHECKOUT                     ]          cleanButton({ fill: "ink", block: true }) [data-checkout]
           Easy 7-day exchange & returns                      nc-small nc-link nc-tap, centred [data-returns]
```

- Gaps: 0 between the first three lines; 10 above the trust lines; 10 above the button; 10 above the returns link.
- The saving line is today's: "You save {amount} · {rate} for {n} pieces" (or "… with your code"), else `ladderHeadline` ("A second piece takes 10% off your bag").
- Trust (`cart/BagTrust.tsx`, the owner's ask of 16 Nov, kept directly above Checkout): the same sentence, one ★ glyph instead of five drawn stars, no hairlines beside it; the ways to pay as three words, no Visa, Mastercard or banknote marks. Nothing in it is pressable.
- Checkout: label "Checkout"; while the bag is busy a `Loader2` before the label; after the tap "Opening checkout…". No payment discs in the button (owner question 2).
- Returns: the same link to `/exchange-return-policy`, no icon; `BagReturns` stays an export of the file.
- Height 231px (today 259).

### 8.4 Empty bag

No strip, no foot. Centred in the sheet, 16px gutters: "Your bag is empty" (sheet-heading style, centred); 32px; `nc-label` "Most loved"; the two best-sellers as rows between hairlines (photo 48x60 on linen; name `nc-text`; price `nc-small`; `cleanButton({ size: "sm" })` "Add" at the right, `[data-piece-card]` kept); 24px; a filled full-width button "Explore jewellery" (a link to `/jewellery` through `leave`). No gold boxes, no green link.

### 8.5 Verdicts: every element of today's bag

| Today (code map 2.1) | Verdict | What happens |
|---|---|---|
| Sheet, overlay, slide, swipe to close, phone back | keep | untouched |
| Chevron "Back to shopping" (phone) / corner X (laptop) | merge | one X at the right, "Close bag" |
| "Your bag" in Cormorant, count in 9.5px caps | restyle | Jost 300 20px; count in 13px muted, sentence case |
| "✦ Sitewide sale live today · up to 30% off" | remove | section 4 of the removed list: the offer is permanent; the rungs say the offer |
| 3px track, three 16px square marks, two-line labels (107px) | restyle | rungs as one line of words over the 2px line (42px) |
| Undo notice, add-error band | restyle | `nc-notice` |
| Line: photo, name, total, choices | restyle | one text size for names (14), one for the rest (13) |
| Line: struck price + price + "% off" | restyle | the repeated figure goes on single pieces; "% off" stays gold |
| Stepper (32px, ink/40 box) | restyle | `CleanStepper`: 40px, hairline, 44px targets |
| Remove X (icon; word only on laptop) | restyle | the word "Remove" on every screen |
| "Adding to your bag…" | restyle | 13px gold with the spinner |
| Total, saving / next-rung line, tax and shipping line | restyle | same words, three styles |
| Rating between hairlines with five drawn stars | restyle | same words, one ★ glyph |
| Visa, Mastercard, banknote + "Cards · Cash on delivery" | restyle | "UPI · Cards · Cash on delivery" in words |
| Checkout + three UPI discs | restyle | label only |
| "Easy 7-day exchange & returns" with arrow icon | restyle | text link |
| Empty: gold-bordered cards, black ADD, green "EXPLORE JEWELLERY" link | restyle | hairline rows, outline "Add", one filled "Explore jewellery" |
| `mrpOf` / `mrpTotal` / `youSave`, `whatsappHref` (computed, never drawn) | keep | left as they are, not drawn |
| Gift box row, promo field, upsell row | none today | not added |

### 8.6 States

| State | Look |
|---|---|
| Empty | 8.4 |
| One piece | strip with no rung gold and the line 8% filled; no struck price; gold line names the next rung ("A second piece takes 10% off your bag") |
| 2, 3, 4+ pieces | the reached rung gold, the line filled to 17%, 50%, 100% (`quantityOfferProgress`); each line struck + "% off"; "You save …" |
| A typed code | "You save … with your code"; rungs follow the pieces as today |
| Line with choices | the `nc-small` choice line; row 20px taller |
| Quantity above one | "₹734 each" in the price row; the total is the line's |
| Adding | the line appears at once (`[data-adding]`) with "Adding to your bag…"; Checkout disabled (opacity 0.55) with the spinner |
| Busy (loading or syncing) | stepper and Remove disabled; Checkout disabled |
| Removed | the Undo notice for 6 seconds under the strip |
| Error | the alert notice under the strip |
| Opening checkout | "Opening checkout…" on the button, disabled |
| Long bag (5+ lines) | only the list scrolls; header, strip and foot stay; Checkout always on screen |
| Laptop | the same sheet at 420px; the page dimmed behind it |

---

## 9. What must hold, the tests, and who owns which file

### 9.1 Tracking (unchanged: name, parameters, moment)

| Event | Fired by (never edited) | Keep in the page or bag |
|---|---|---|
| `ViewContent` | `useViewContent` | the call `useViewContent(piece, colourParam, Boolean(piece && linkPlaced(piece, searchParams)), isLive \|\| !catalogueLoading)` exactly as it is |
| `AddToCart` | `CartContext.addItem` / `updateQuantity` | `cartItem()`, `handleAddToCart`, `handleBuyNow`, `PairingCard`'s `add`, the bag's `addPiece`, `undo`, and plus calling `updateQuantity(…, quantity + 1, …)` |
| `InitiateCheckout` | `CartContext.openCheckout` | `handleBuyNow` (three pinned lines) and the bag's `handleCheckout` untouched, including `clarityEvent("bag_checkout_tapped")`, `releaseEntry()` and the `member_orders` insert |
| `AddToWishlist` | `WishlistContext` | the page's `toggleItem({ …, variantId: variant?.id ?? piece.variantId, amount: shown.price })` verbatim (now behind the heart beside the title) |
| `Contact` | `PixelEvents` (any click on an `<a>` to `wa.me`) | "Questions? Chat with us on WhatsApp" stays an `<a href>`; "Reserve now" stays `window.open` (sends none, as today) |
| Clarity `bag_opened`, `bag_closed`, `bag_empty_added`, `bag_checkout_tapped` | the bag file | same calls, same moments |
| `AddPaymentInfo` | not sent | must not reappear (`checkoutTapEvents.test.tsx`) |

UTM and click ids: `useSearchParams` handling and `pick()` unchanged; no new link drops the query.

### 9.2 SEO and the pre-built page

- `<Helmet>` block, both `<JsonLd>` blocks, `<script id="nf-piece">` (shape `{ piece, rating }`, `rating` now `null`), the canonical and robots lines: untouched. No `AggregateRating`, no FAQPage.
- Exactly one `<h1>` containing the name; one `<main>`; the footer and the bar outside it.
- The pre-built page is captured at 1280x900 with reduced motion and `navigator.webdriver` true: the page must be complete there. Description is open, so its text is in the capture; the other dropdowns' contents are in the HTML (`<details>`).
- The capture strips inline `opacity: 0` and `visibility: hidden` from style attributes: hide nothing in the first paint with them (the bar's `transform` is what keeps it off screen in the capture; keep it).
- The first client render must match the capture: no layout decided in JavaScript by screen size (both galleries stay in the DOM, CSS shows one); the arrival date still appears only after mount.
- `<CleanStyles />` puts the stylesheet in the captured HTML: check that the pre-built product page contains `<style data-nf-clean>` and paints styled with JavaScript off.
- Image attributes of photo 1 in both galleries (eager, `fetchPriority="high"`, `decoding="sync"`, `HERO_WIDTHS`, `HERO_SIZES`, 900x1200 / 1000x1000), the `<picture>` trick for laptop photos 2 to 4, `MOBILE_FRAME = "1/1"`: untouched.
- Header offsets, `html.nf-next` on mount and off on unmount, `goBack`, `useBackToClose("nfZoom")` and `("nfSizeGuide")`, the variant-link lines, `soldOut`, `leadTime`, the delivery sentence template, `<PincodeChecker preorder={isPreorder}` (now with `look="clean"` after it), the sku spread, three `clipText(`: all stay as the source test pins them.

### 9.3 Tests

Rule: a test that pinned the old look is rewritten to pin the new one; none is deleted to get green. `src/hooks/useReels.test.ts` has one failure that predates this work (seen again today: 1 failed of 1,033). Run `npx vitest run --maxWorkers=2`.

Page engineer updates:

| Test | Change |
|---|---|
| `src/pages/JewelDetailNext.test.ts` | keep every order and verbatim-line assertion that still holds (ids, pinned handlers, sticky-bar lines, robots, canonical, `nf-piece`, back-to-close, variant links, `PressMarquee` before `ReelShopNext`, `complete-the-look` before `CustomerReviews`, pairing name markup). Change: the badge anchor becomes the QUALITY row (`"Anti-tarnish"`, `"Skin-friendly"`, `platingBadge(finish)` inside a `<CleanDots` after the price and before the actions); the string `pieces sold in the last 48 hours` and `recentSoldCount` must be **absent**; `<FomoPopup` must be absent; `<PdpOfferLadder` stays once with its pinned line; the three `<details className="group` become four `<CleanDropdown` with the ids `pdp-panel-description`, `pdp-panel-details`, `pdp-panel-care`, `pdp-panel-delivery` in that order and `defaultOpen` on the first only; the rating block is `SHOP_RATING` and `clientsLabel` with `href="#customer-reviews"` followed by `onClick={toReviews}`; add: `data-pdp="title"` on the `<h1>`, `data-pdp="eyebrow"`; add the palette rule of section 2 (no `font-cormorant`, `font-nf-`, `text-nf-`, `bg-nf-`, `border-nf-`, `tracking-`, `text-[`, `--nf-cta`, `UpiBadges` in the file) |
| `src/pages/soldOutPageFirstPaint.test.tsx` | should pass unchanged (h1, `["Reserve now"]`, price then MRP, the lead-time sentence inside `#product-actions`, OutOfStock); if the `#product-price` text assertion expects the tax note's old place, pin the new order: price, MRP, "N% off", "incl. 3% GST" |
| `src/components/jewellery/PdpOfferLadder.test.tsx` | rewrite for the row: rung texts "Buy 2 · 10% off" + "₹899 each" (for a ₹999 piece) and so on; the default line "Applied in your bag. No code needed."; no links or buttons with an empty bag; `data-state`; the status sentences verbatim; "View bag" is an `nc-tap` button; pre-order: no prices, "Not on pre-orders. In-stock pieces only."; `[data-offer-ladder] ul` exists; `data-current` on the reached rung; still no literal percentage or rupee in the file; the page file still contains `document.querySelector("[data-offer-ladder] ul")` |
| `RingSizeGuide.test.tsx`, `RingSizeGuideModal.test.tsx` | copy, roles and keyboard unchanged; update only class-based assertions if any |
| `product/PincodeChecker.test.tsx` | existing cases untouched (default look); add cases for `look="clean"`: same words, no svg, one `role="alert"` on error |
| `CustomerReviews.test.tsx` | existing cases untouched (default); add `look="clean"`: only `realReviews` and approved live reviews are listed, the head shows "4.5/5" and "5,000+", no review from the dealt bank appears |
| new `src/components/pdp/*.test.tsx` | any new part with logic |

Bag engineer updates:

| Test | Change |
|---|---|
| `src/components/CartDrawerNext.test.tsx` | `SimpleLadder` (keep the export name) now pins: `[data-ladder]` holds three `[data-rung]` items reading "Buy 2 · 10% off", "Buy 3 · 20% off", "Buy 4 · 30% off"; `data-current` follows the pieces (none at 1; rung 2 at 2; rung 3 at 3; rung 4 at 4 and above); the progress bar's width is `quantityOfferProgress` (8.33%, 16.67%, 50%, 100%) and its `aria-valuenow`; the text "Sitewide sale" is **absent**. `BagReturns`: same text and href. Source: the `formatUnitPrice` line and no `maximumFractionDigits: 2`, as today; add the palette rule of section 2 |
| `src/components/bagBuy4.test.tsx` | `[data-total]`, `[data-you-save]` text, `[data-line-total]`, `[data-line]` unchanged; `[data-line-price]` for the line of two stays `₹1,499₹1,049 each30% off`; replace `[data-rung-mark]` assertions with `[data-rung][data-current]` and the progress bar's width; replace `[data-ladder] > p` with the absence of the sale line |
| `src/components/bagTrust.test.tsx` | `[data-bag-foot] [data-bag-trust]` exists and its next sibling is still `[data-checkout]`; **no** `[data-upi-badges]` anywhere in the bag |
| `src/components/cart/BagTrust.test.tsx` | text "Rated 4.5/5 · Trusted by 5,000+ clients" and not "Rated … by 5,000"; one decorative ★ (`aria-hidden`), no `[data-star-fill]`; first child `[data-rating-line]`; `[data-pay-line]` reads "UPI · Cards · Cash on delivery" with no `[data-mark]`, no svg; no `button` or `a` |
| `bagUndoPrice.test.tsx`, `checkoutTapEvents.test.tsx` | should pass unchanged (a button named "Undo"; `[data-checkout]` clicked once calls `checkout` once; no AddPaymentInfo) |
| `checkout/UpiBadges.test.tsx`, `cart/OfferProgress.test.tsx`, `giftbox/BagGiftRow.test.tsx`, `lib/trust.test.ts`, `lib/promoQuantity.test.ts` | untouched; those files are not edited |

Neither engineer touches: `Header.test.ts`, `AnnouncementBar.test.tsx`, `landmarks.test.ts`, `wishlistEvent.test.tsx`, `useViewContent*.test.tsx`, `tailwind-classes.test.ts`, `older-phones.test.ts`, route tests. They must stay green as they are.

### 9.4 The file split (no file is in both lists)

**PAGE engineer owns**

- `src/pages/JewelDetailNext.tsx`, `src/pages/JewelDetailNext.test.ts`, `src/pages/soldOutPageFirstPaint.test.tsx`
- `src/components/jewellery/PdpOfferLadder.tsx` and its test
- `src/components/jewellery/RingSizeGuide.tsx`, `RingSizeGuideModal.tsx` and their tests
- `src/components/jewellery/PressMarquee.tsx`
- `src/components/reels/ReelShopNext.tsx`, `src/components/reels/GalleryReel.tsx`
- `src/components/CustomerReviews.tsx` and its test (add `look="clean"`; the default stays byte-for-byte what the apparel page renders today)
- `src/components/product/PincodeChecker.tsx` and its test (add `look="clean"`; default unchanged)
- new files under `src/components/pdp/`

**BAG engineer owns**

- `src/components/CartDrawerNext.tsx`, `src/components/CartDrawerNext.test.tsx`
- `src/components/bagBuy4.test.tsx`, `bagTrust.test.tsx`, `bagUndoPrice.test.tsx`, `checkoutTapEvents.test.tsx`
- `src/components/cart/BagTrust.tsx` and its test
- new files under `src/components/cart/` with new names (for example `BagLine.tsx`, `BagOffer.tsx`, `BagEmpty.tsx`)

**Frozen for both** (read, import, never edit): `src/components/clean/*`; `src/components/checkout/UpiBadges.tsx` and `src/components/cart/PayMarks.tsx` (no longer imported by the page or the bag; left for the old unrouted files and their tests); `src/components/ui/*`; `src/components/FomoPopup.tsx`; `src/lib/*` (including `dailySold.ts`, `trust.ts`, `promo.ts`); `src/data/*`; `src/contexts/*`; `src/hooks/*`; `Header.tsx`, `Navbar.tsx`, `AnnouncementBar.tsx`, `Footer.tsx`; `src/App.tsx`, `src/pageCode.ts`; `src/index.css`, `index.html`, `main.tsx`, the config and lock files; `pages/JewelDetail.tsx`, `components/CartDrawer.tsx`, `cart/CartExtras.tsx`, `cart/LadderBand.tsx`, `cart/OfferProgress.tsx`, `giftbox/*`.

Contracts across the split: the page opens the bag only through `useCart().setDrawerOpen(true)` and `addItem`; the bag needs nothing from the page. Both render `<CleanStyles />` in their own root. Neither depends on the other's class names.

Before each commit: `npx tsc --noEmit -p tsconfig.app.json`; `npx vitest run --maxWorkers=2`; `npx vite build`, then `git checkout -- supabase/functions/mcp/index.ts` if the build touched it. Never push, never deploy. In the browser, answer Storefront cart calls locally and abort trackers, as `pdp/audit/lib.cjs` does; never open a WhatsApp link.

---

## 10. Acceptance checks (measured, not judged)

Viewports: 360x640 (Instagram Android in-app user agent, touch), 390x844 (iPhone), 1280x720, 1440x900, device scale 1. Pieces: `woven-gold-hoops` (plain), `serpentine-whisper-chain-silver` (33-character name), `crystal-baguette-eternity-ring` (sizes), `cushion-halo-ring` (fixed list), `star-point-band` (metal + size), `bougainvillea-vine-bracelet` (colour, opens on a sold-out value), `first-light-set` (sold out). "Inside the page" means inside `main .nf-clean` (the header and footer are not counted; they are untouched). Rubric rows refer to `pdp/ref/HIMSCIENCE.md` section 8.

**Colour and type (first two screens, and the whole page)**

| # | Check | Pass |
|---|---|---|
| 1 | Computed text colours inside the page (rubric 1, 2) | only `#1A1614`, `#625D59`, `#876629`, `#FBF3EC` (on the filled button) and `#C99A4C` (★ glyphs only). 5 values; today 14 |
| 2 | Computed fills and borders inside the page | fills: ivory, linen, ink (filled button, active segment), transparent, swatch squares. Borders: `#DCD4CE` and `#1A1614` only. No green, no blush, no white, no rgba ink |
| 3 | Elements in gold text on any buy-box screen (rubric 3, 4) | at most 4 (eyebrow, "% off", the reached rung, a status); no gold border, fill or icon anywhere |
| 4 | Filled (ink) buttons visible at once (rubric 5) | 1 in the page (the in-page pair and the bar are never both on screen), 1 in the bag |
| 5 | Font families inside the page and the bag after fonts load (rubric 7) | Jost only. 0 text runs in Velista, Cormorant Garamond or a system face |
| 6 | Type styles (family, size, weight, line height, tracking, case) in the first two screens at 390 (rubric 8) | at most 12 (himscience 14; today 33) |
| 7 | Type styles and sizes in the buy box, title to buttons (rubric 9) | at most 6 styles, in the 4 sizes 26, 20, 13, 11 (34, 22, 13, 11 on laptop) |
| 8 | Text sizes on the whole page per viewport (rubric 10) | at most 9 |
| 9 | Text under 13px | only the 11px caps label (weight 500) and the 12px small-button label; no reading text under 13px; nothing under 11px (today 26 of 90 runs under 11px) |
| 10 | Contrast of every text against its ground (rubric 30) | at least 4.5:1 (★ glyphs excepted: decorative, `aria-hidden`) |

**Layout**

| # | Check | Pass |
|---|---|---|
| 11 | 360x640 first screen (rubric 30) | the `<h1>` and `#product-price` end above y 640 on every piece; on a one-line name the price ends at or above y 567 and the bar starts at 575 without touching it; on a two-line name the bar is hidden at load |
| 12 | 390x844 first screen, piece without choices | the in-page buttons end at or above y 844 and the bar is hidden at load |
| 13 | Photo bottom to the top of the in-page buttons, piece without choices (rubric 11) | at most 300px at 360 and 390 (mock: 283); at most 4 blocks between them |
| 14 | Pinned bar at 360x640 and 390x844, at rest at every 20px of scroll from 0 to the reviews, on the plain piece and on a ring | whenever it is shown it overlaps neither `#product-price` nor `[data-offer-ladder] ul`; it is hidden whenever the in-page Add to cart is fully on screen; it is shown from the dropdowns to the end of the page |
| 15 | Boxes (a border on 3 or 4 sides, or a fill) between the photo and the buttons (rubric 12) | 0 on a piece without choices; only chips on a piece with choices. Rules there: 3 |
| 16 | Icons in the buy box (rubric 13) | 1 (the heart) |
| 17 | Elements positioned over the phone photo (rubric 19) | 0. Laptop: only "+N photos" |
| 18 | Radius and shadow inside the page and the bag (rubric 15, 16) | every computed `border-radius` 0px, every `box-shadow` none |
| 19 | Tap targets: every `a`, `button`, `summary`, chip and stepper cell inside the page and the bag | at least 44px on both sides, by its box or its `::before` target; links inside a sentence ("read the policy") excepted |
| 20 | Horizontal scroll | `document.documentElement.scrollWidth <= innerWidth` at all four viewports, with the bag closed and open, with every dropdown open |
| 21 | Layout shift from first paint to fonts ready | the `<h1>`'s height is the same before and after Jost loads on the three test names at 360 and 390; cumulative layout shift at most 0.02 |
| 22 | Laptop | buttons on the first screen in every state at 1280x720 and 1440x900; buy column content at most 520px wide |

**Dropdowns and sections**

| # | Check | Pass |
|---|---|---|
| 23 | Dropdowns (rubric 23) | 4 rows named exactly as section 6, each at least 52px; the first open at load, the rest closed; several can be open; all contents present in the HTML with JavaScript off (pre-built page) |
| 24 | Opening a dropdown | finishes within 250ms; instant under reduced motion; opening never scrolls the page |
| 25 | Sections after the buy area (rubric 24) | at most 6 including the footer; every heading is `nc-heading` (Press: a label); 0 Velista |

**Honesty**

| # | Check | Pass |
|---|---|---|
| 26 | The page's text | does not contain "sold in the last", "bought the", "Sitewide sale" (outside the header strip), or a review count; the head reads "4.5" and "5,000+ clients" |
| 27 | After 70 seconds on the page | no pop-up card has appeared |
| 28 | Reviews listed | every one is in `realReviews` or came from the approved live table |

**Bag** (360x640 and 390x844, with 0, 1, 2, 3 and 6 pieces; 1440x900 with 3)

| # | Check | Pass |
|---|---|---|
| 29 | Colours (rubric 25) | text: ink, muted, gold, ivory on the button, ★ gold; fills: ivory, linen, ink; borders: rule colour only (and none in ink). At most 6 |
| 30 | Type styles and sizes (rubric 26) | at most 8 styles; text sizes 13, 14, 20 only, plus the 11px label in the empty bag |
| 31 | Gold (rubric 27) | only the reached rung, the 2px line, "% off" on a line, the saving or next-rung sentence, "Adding…", the ★ |
| 32 | Logos, marks, badges, coupon field, timers (rubric 28) | 0 |
| 33 | One and two pieces at 360x640 (rubric 29) | every line fully visible, the list does not scroll, `[data-total]` and `[data-checkout]` on screen |
| 34 | Any number of pieces, any viewport | `[data-checkout]`'s bottom is inside the viewport; only `[data-bag-list]` scrolls |
| 35 | Fixed parts at 360x640 | header at most 57px, strip at most 44px, foot at most 232px; the list gets at least 305px |
| 36 | States | each state of 8.6 reached and screenshotted (adding, busy, undo, error, opening checkout through a locally answered cart) |

**Unchanged behaviour**

| # | Check | Pass |
|---|---|---|
| 37 | Pixel calls recorded (stubbed `fbq`) for: page view, Add to cart, Buy Now, pairing Add, wishlist, bag plus, Undo, Checkout | same event names, same parameters, same count as on `/tmp/pdp-base` for the same taps |
| 38 | Head and structured data | the `<head>` tags and both JSON-LD blocks of the product page are identical to `/tmp/pdp-base`, piece for piece |
| 39 | Other pages | screenshots of `/`, `/jewellery`, an apparel product page and the wishlist drawer are pixel-identical to `/tmp/pdp-base` (nothing outside `.nf-clean` changed); the bag opened from `/jewellery` looks the same as from a product page |
| 40 | Checks | `tsc` clean; vitest: only the one `useReels` failure that predates this work; `vite build` succeeds |

---

## 11. For the owner

**Removed because it was invented (code map 1.6, 1.13, 1.17)**

1. "6 pieces sold in the last 48 hours": a number made from the letters of the product's name, the same on every visit, shown even on sold-out pieces.
2. The "someone just bought" card: made-up names, cities and minutes, about a random piece.
3. "★ 4.9 · 50 reviews" at the top of every product, and the written reviews dealt to each product from one shared list: replaced by the shop's own "★ 4.5 · 5,000+ clients" and the seven photographed customer reviews (plus any a customer submits for that piece).
4. "Sitewide sale live today" inside the bag (the Buy 2 / 3 / 4 offer is permanent). The same line in the moving strip at the top of the site is outside this job and was left.

**Questions (each with what happens if nobody answers)**

1. Reviews. If the written reviews in the shared list are real customers' words, say so and they return as shop reviews. Default: only the photographed ones and submitted ones show.
2. Payment logos. GPay, PhonePe, Paytm, Visa and Mastercard marks are replaced by the words "UPI · Cards · Cash on delivery" (they were the only foreign colours left). Default: words. They can come back on the Checkout button alone.
3. First photograph. Some pieces lead with the dark burgundy campaign photo with "NAIRA" printed on it; the page is calmest when the light photo on the stone block leads. That order is set in Shopify. Default: order unchanged.
4. Title position. Your screenshot centres the category and the name; the page keeps them at the left so the rating and the heart sit beside them and everything below starts on one edge. Default: left.
5. The top strip. "Sitewide sale live today!" and "Made in limited batches" run on every page. Default: left as they are (not part of this job).
6. Press logos. Please confirm the five publications featured Naira. Default: kept, in grey.
