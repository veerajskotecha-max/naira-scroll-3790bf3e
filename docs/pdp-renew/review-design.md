## Visual design review: renewed product page and bag

Nothing under `/tmp/pdp-renew` was edited. I read the reel screens, the boards and raw pictures, then measured the live preview at 360x640, 390x844 and 1440x900. The main changes below were tried as injected CSS on the live preview to confirm they fit; trial pictures are listed at the end. No change needs a new fact from the shop.

### Findings, most important first

**1. Bag on a small phone: the suggested piece is cut off under a foot that takes 40% of the screen.**
- **Where:** 360x640, two pieces; `[data-bag-foot]`, `[data-bag-addon]`. The foot is 253px, the list 288px, two lines 245px, so 43 of the suggestion's 108px show: its eyebrow and a sliver of photo, no name, no Add.
- **Why:** the bag's one new selling row looks broken on the screen half the shoppers have, and seven stacked 13px rows above Checkout read as small print.
- **Change:**
  - Move "Incl. 3% GST" to the right end of the "You save…" row (13px, `--nc-muted`). The terms line keeps only "Free insured shipping · arrives 30 Nov – 2 Dec." on one line; the foot drops to 233px.
  - Under 700px of height, draw the suggestion as one 66px row: no eyebrow line, photo 40x50, second line "Adds ₹615 · 20% off everything" with the last three words in `--nc-gold`, struck price dropped, padding 8px 16px.
  - Under 700px of height, give `[data-line]` 12px top and bottom padding (16 now).
  - Tried: both lines plus the whole suggestion take 295px of a 308px list; total and Checkout are untouched.

**2. First screen on a small phone: the price is printed twice, 24px apart.**
- **Where:** 360x640 on load. The price row ends at y=567 and the buy bar's "₹1,049 / ₹1,749" starts at y=591. At 390x844 the bar is hidden on load, so it does not happen there.
- **Why:** the same two figures in the same form, stacked, on the screen every small-phone visitor sees first.
- **Change:** while `#product-price` is on screen, hide `.rn-bar__price` and set the bar's columns to `minmax(0,1fr) minmax(0,1.25fr)`. The price cell returns once the price row has scrolled away.

**3. Two centred rows break the page's one left edge.**
- **Where:** every size; `.rn-ship` and the page's `.rn-pay`. At 390 they start at x=49 and x=44, at 360 at x=34 and x=29; every other row starts at 16.
- **Why:** both are nearly full width, so centring reads as an unexplained indent and the block under the buttons floats.
- **Change:**
  - `.rn-ship { justify-content: flex-start }`, with "Check pincode" pushed right (`margin-left: auto`) to end on Buy Now's edge.
  - `.rn-pay { justify-content: flex-start }` on the page only; the bag's stays centred.
  - The dot then sits at x=16, in line with the ticks above and the trust icons below.
  - Cut the dot's pulse from scale 3.2 to 2. In stills it reads as a pale box round the dot (visible on the 390 board), and at the left edge it would overhang the gutter.

**4. The offer is the quietest block on the page, and the bag draws it differently.**
- **Where:** `[data-offer-ladder]` and the bag's `[data-ladder]`.
- **Why:** "the offers" is what she asked for, yet every line in the panel is 13px or smaller. In the bag the same offer is three labels over an underline, which reads as tabs.
- **Change:**
  - Set each step on three lines: "BUY 2" (`.nc-label`, 11px, `--nc-muted`), "10% off" (500 16px/22px ink; 18px/24px from 1024px), "₹944 each" (13px/20px muted). The reached step stays gold. It fits a 100px column at 360.
  - `.rn-offer__line { text-wrap: balance; margin-top: 12px }`; the sentence now leaves "₹1,049." alone on its second line.
  - Hide the pale 27px stub while the bag is empty; it ends at nothing.
  - In the bag, draw the page's own stops on the 2px line (`.rn-steps`: 8px diamonds at 1/6, 1/2, 5/6, gold once reached).

**5. Cash on delivery, UPI and cards are said twice, 12px apart.**
- **Where:** the fourth `.rn-trust` cell ("Cash on delivery / UPI and cards too") and the row under it ("UPI … Cards … Cash on delivery").
- **Why:** it is busier than it needs to be, right under the buttons.
- **Change:**
  - The page's pay row keeps its marks and loses its three words; the screen-reader sentence stays. The bag's row keeps its words, since it has no grid above it.
  - In the grid, titles go to 14px/20px (500) and details stay 13px/18px muted, so the pair has two levels instead of two 13px lines. This fits at 360.

**6. The ticked row wraps raggedly.**
- **Where:** `.rn-sure`. Three ticks need 332px: one row at 390, "2 + 1" at 360. Pieces with a stone (prism-riviere-bracelet, clover-trio-edit, cushion-halo-ring) wrap "3 + 1" at 390 and leave "Zircone Stone" alone.
- **Why:** an orphan under a row of three, directly above the main button, looks accidental.
- **Change:**
  - Keep one row only for three ticks totalling 44 characters or fewer on a screen 375px or wider.
  - Otherwise use `display: grid; grid-template-columns: repeat(2, max-content); gap: 6px 24px`, so the second row starts under the first.
  - Set "Zircone Stone" in sentence case like the other three.

**7. The stretch under the buttons is packed.**
- **Where:** phone. Gaps run 12, 16, 12, 16, 24, 40px (stock line, trust grid, pay row, offer, dropdowns, bundle); four blocks sit in 350px.
- **Why:** this is where the page is furthest from the reel's "padded".
- **Change:** make the gaps 12, 20, 12, 24, 32, 48. That is `.rn-trust` margin-top 20, offer panel `mt-6`, dropdowns `mt-8`, bundle `mt-12`. It adds 28px of length; the first 390x844 screen still ends inside the trust grid's first row.

**8. "Shop the reel" sits flush against the screen edge.**
- **Where:** phone, lower page. The first card, the "IN THIS REEL" label and the row photos start at x=0; the heading above starts at 16. Today's page has the same fault.
- **Why:** text touching the glass is the reel's "before" look, and her first word was "padded".
- **Change:** add `scroll-padding-inline: 16px` to that rail, as the "More earrings" rail already has. The rail has `px-4`, but mandatory snapping scrolls it away (scrollLeft is 16 on load).

**9. Option buttons are uneven.**
- **Where:** baguette-eternity-band at 390. Sizes are about 95, 52, 95, 52px wide with "9" alone on a second row.
- **Why:** ragged widths and an orphan make the choice look improvised; the reel's size grid runs edge to edge in equal cells.
- **Change:** on the page, `.nc-chips { display: grid; gap: 8px }` with chip `padding: 0 6px; min-width: 0`.
  - Plain sizes: `repeat(5, minmax(0, 1fr))`, one row edge to edge.
  - A group with a swatch or a "Pre-order" note: `repeat(3, minmax(0, 1fr))`, so stones sit three across and five sizes sit 3 + 2.

**10. Bundle panel: three loose ends.**
- **Where:** the `#complete-the-look` panel.
- **Empty box:** the "Choose size" row has no box, so the column has a hole. Draw the same 22px box with a 1px `--nc-rule` border, no fill, not tickable.
- **Bottom padding:** the button sits 12px from the panel's bottom while the heading's capitals sit about 21px from its top. Set `padding-bottom: 20px` on this panel.
- **Head at 360:** the heading and its gold label fit with 2.4px to spare (149 + 12 + 136 in 300). Add `flex-wrap: wrap` to `.rn-panel__head` and `white-space: nowrap` to the heading, so on a narrower phone the label drops under the heading.
- **Do not raise phone panel padding to 16px:** it breaks this head at 360.

**11. Laptop: a narrower column than today's, set in phone-size type.**
- **Where:** 1440x900. The column is 520px against today's 580: margins are 44px left and 136px right, and "Back" hangs 92px outside the column.
- **Why:** every supporting line is 13px Jost, whose x-height is 0.46em. That is 6px, about what 11px Arial has, and small at laptop distance.
- **Change:**
  - `lg:max-w-[520px]` to 600px, which leaves a 56px right margin.
  - From 1024px: ticks, stock line and pay row 14px/22px; trust titles 14px/20px; lede 15px/24px; panel padding 20px all round (18 18 16 now); dropdown paragraphs `max-width: 62ch`.
  - Tried at 1440: nothing wraps.
- **Not ours, but it sets the laptop's colour:** the site shell's `div.film-grain` (opacity .05, in a fixed z-9000 wrapper shown from 1024px) lies over the page, the photographs and the bag. The ground measures #EEE6E0 instead of #FBF3EC and linen #E7DFD6 instead of #F4EBE2; with the layer hidden the ground is #FBF3EC. Today's page has it too. Worth asking whether the product page may switch it off.

**12. Small finish.**
- **Popular mark:** `.rn-tag` left 12 to 16px and bottom 14 to 16px; it sits 4px left of the text edge under it.
- **Headings:** `.nc-heading` 300 to 400 with `letter-spacing: -0.015em`, as the name has. "Complete the look", "Reviews" and "Your bag" then match the title weight she chose, and widths do not change (149.4px against 149.2).
- **Spec rows:** `.nc-drop__panel .nc-facts { margin-right: -24px }`; their hairlines stop 24px short of the dropdown's own.
- **Bag boards:** the heavy box round the close cross is the keyboard focus ring, because the bag was opened by URL. After a tap it does not show (checked). Retake those boards by tapping, and set `outline-offset: -2px` on that button, since the sheet's edge clips the ring on a laptop.

### Right, and must be kept

1. **The buy block.** One filled ink button with the price in it beside a narrower outlined Buy Now (238 and 112px at 390, both 52px high, 13px/500 capitals). On 390x844 the photo, name, price, ticks, both buttons and the delivery promise share the first screen.
2. **The head.** Name 26px/400, price 20px/500, struck price 13px, and "40% OFF" as ink on pale gold, the only filled word near the price. Gold stays words and lines, never a fill.
3. **The reassurance grid.** Hairlines, 18px line icons, two short lines each; two by two on a phone, four across on a laptop; no boxes, no colour.
4. **The offer panel once the bag holds pieces.** The gold line, filled diamonds, the reached step in gold, "View bag", and the sentence with real arithmetic ("it adds ₹495, not ₹1,049").
5. **The bundle rows and the bag's lines.** Square ticks and photos, hairlines, the total with its struck sum and gold saving, one full-width button. Overall the restraint holds: one face, square corners, no shadows, sage as the only second hue.

### Trial pictures

Several changes appear together in each picture. The trial CSS is in one place: /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-design/proto.cjs

- /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-design/out/proto-bag-p360.png (finding 1)
- /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-design/out/proto-p360-woven-gold-hoops-1.png (finding 2)
- /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-design/out/proto-p390-woven-gold-hoops-2.png (findings 3, 4, 5, 7 at 390)
- /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-design/out/proto-p360-woven-gold-hoops-2.png (findings 3, 4, 5, 6, 7 at 360)
- /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-design/out/proto-p390-baguette-eternity-band-2.png (findings 6, 9)
- /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-design/out/proto-p360-woven-gold-hoops-bundle.png (findings 10, 12)
- /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-design/out/proto-d1440-woven-gold-hoops-1.png (finding 11)
- /tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/pdp/review-design/out/reel-p390.png (finding 8, as built)
