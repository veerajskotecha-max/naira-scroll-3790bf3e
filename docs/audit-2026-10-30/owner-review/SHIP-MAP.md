# Owner-review patches: what each approval card ships

Base: main `ddb72b7`. Branches are in `owner-patches.bundle` (`git fetch owner-patches.bundle "own-*:own-*"`).
Approving a card means cherry-picking its commits, in this order, onto main. Ship the approved cards of a group in the order they are listed (the branch order): some cards only apply after an earlier one. Nothing here is on main or live.

## Buy Now, bag and checkout (`own-checkout` at `c54113c`)

Check: The final check found 1 more problem; fixed, and not checked again. Earlier checks found 6 problems; all were fixed.

| Card | Commits (in order) | Optional / option | Needs |
|---|---|---|---|
| Buy Now on a piece already in the bag hands off that line | `2b702d9` `d8a943d` `eb25b43` `4f3b3df` `c54113c` |  | Buy Now with a picked quantity raises a bag line to it before checkout |
| Buy Now with a picked quantity raises a bag line to it before checkout | `3e6cff9` |  | Buy Now on a piece already in the bag hands off that line |
| Bag Undo waits for an in-flight removal | `39ccbce` `5bbc08c` |  | Removing a bag line Shopify no longer has drops it without an error |
| Removing a bag line Shopify no longer has drops it without an error | `f2b05f4` |  | Bag Undo waits for an in-flight removal |
| The ring size picked reaches a Fastrr order | `8b0b4ff` |  |  |
| The ad campaign a shopper landed with reaches both checkouts | `930306e` |  |  |
| Shopify's checkout opens straight, not through two bounces and a reload | `d4ac0c0` |  |  |
| A one-piece checkout takes the old Buy 2 / Buy 3 code off the Shopify cart | `b87f67a` |  |  |
| Buy Now checks out only the piece being viewed | `98ca8cb` | optional | Buy Now on a piece already in the bag hands off that line; Buy Now with a picked quantity raises a bag line to it before checkout |

## What Meta is told (`own-tracking` at `ac7de45`)

Check: The final check found 1 more problem; fixed, and not checked again. Earlier checks found 4 problems; all were fixed.

| Card | Commits (in order) | Optional / option | Needs |
|---|---|---|---|
| Publish builds stop sending product views to the Meta relay | `d2c5e87` |  |  |
| Meta's server copy only reports from the real shop | `29a482a` |  |  |
| Meta relay forwards only events from nairaflore.com pages | `2690b7c` |  |  |
| Meta relay takes posts only from the shop's pages, and only the shop's events | `459d528` |  | Meta relay forwards only events from nairaflore.com pages |
| Product views report the colour and size the page opens on | `773e02f` `972d264` |  |  |
| Wishlist hearts tell Meta which catalogue item and its price | `51f4f4b` |  |  |
| Every search a shopper settles on reaches Meta, once | `c63c96c` |  |  |
| Meta's browser id is set before the first product view | `2ad2699` |  |  |
| Visitor and ad-click ids are readable on the shop's checkout domain | `5753a88` |  |  |
| Privacy policy and consent boxes say the phone number is shared too | `4465eee` |  |  |
| Bag's Checkout tap no longer reports payment details | `3d6dfaa` |  |  |
| Checkout-started value is the bag's Total, after its discount | `baa72ac` | optional |  |
| Product structured data carries Shopify's SKU again | `f7d43e9` |  |  |
| A product view that waited for Shopify keeps the piece's own page address | `ac7de45` | optional; a fixup: if approved, squash it into the "Product views report the colour and size the page opens on" commit | Product views report the colour and size the page opens on; Meta's server copy only reports from the real shop |

Left out on purpose:

- C19-fixup-leave-page-address, option 1 (owner lines only, no commit): Option 1 needs no code. Its sentence is in 972d264's forMeta and risk lines, as corrected. It has no commit because an empty commit cannot have a test that fails before and passes after. Choosing option 1 means leaving out ac7de45. Choosing option 2 means keeping ac7de45, which fixes what that sentence describes, and then also taking 29a482a.
- C19-fixup-published-site and C19-published-star-point-band-lines (no new commit): I agree with the reviewer: the code is correct and only the owner lines were wrong. My own builds of ddb72b7, f7d43e9 and 972d264 reproduce every number used here. I made no commit: there is nothing to fix in code, and an empty commit could not have a test that fails before and passes after. The corrected lines for 773e02f and 972d264 are in this report.
- C14 (extra hardening beyond origin and event list): I did not add these: a body-size cap, limits on value and currency, removing test_event_code, or preferring cf-connecting-ip. The task asked for an origin check and an event allowlist only. Each item would change more of what the relay accepts, so the owner should ask for them separately.
- C20 (merging our InitiateCheckout with Shiprocket's): This cannot be done in code: Shiprocket never receives our event id, so Meta cannot merge the two. Ending the duplicate needs either a Shiprocket dashboard setting or dropping ours, which goes against the Fastrr plan. I left it as the owner question on commit 3d6dfaa.
- C19 / C20 / C58 legacy files: src/pages/JewelDetail.tsx (not routed) and src/components/CartDrawer.tsx (not mounted) still contain the old ViewContent and AddPaymentInfo code. I left them alone on purpose, so nothing outside these findings changes.
- C58 (trackPixel inside the wishlist state updater): I kept the call where it is and changed only the parameters. The app has no StrictMode, and production fires exactly once per add (measured), so moving the call would only add risk.

## Prices and stock (`own-prices` at `cda5d47`)

Check: Passed the final check. It corrected the wording of 10 lines; the corrected wording is shown here. Earlier checks found 6 problems; all were fixed.

| Card | Commits (in order) | Optional / option | Needs |
|---|---|---|---|
| Bag lines take Shopify's current price on every cart answer | `834e4be` `780534a` |  |  |
| First paint shows Shopify's prices and sold-out state | `41e1a06` `0750c46` `cda5d47` |  |  |
| Add to cart tells Meta only what Shopify really added | `1491b11` |  |  |
| Raising a piece's quantity in the bag counts as an Add to cart | `0fde095` |  |  |
| Adjustable rings follow Shopify's sold-out on the product page and reels | `16a210e` `89076f1` | optional |  |

## Where ads and old links land (`own-landings` at `68f1dcb`)

Check: Passed the final check. It corrected the wording of 14 lines; the corrected wording is shown here. Earlier checks found 2 problems; all were fixed.

| Card | Commits (in order) | Optional / option | Needs |
|---|---|---|---|
| Old Shopify addresses land on their real pages, query kept | `2a0f307` `4e1c19e` |  |  |
| The error panel's Browse link and Back leave the panel | `ba6f429` |  |  |
| The page reached from the error panel gets its Meta PageView | `63318c5` |  | The error panel's Browse link and Back leave the panel |
| A catalogue ad's link opens on the metal, stone or month it names | `25611e3` `5536ec8` `8054e38` |  |  |
| /index.html opens the homepage, query kept | `f3bbff9` |  |  |
| A new piece's ivory outline holds until the app takes over | `ce1ca1d` |  |  |
| An ad for a piece's second colour shows that colour from the first paint | `590059c` `68f1dcb` |  | A catalogue ad's link opens on the metal, stone or month it names |
| Product results carry the shipping and return terms the site states | `9477921` |  |  |
| Shopify customer-account links open Track Order | `ca79b89` | Option 1, pick one |  |
| Shopify customer-account links go straight to Shopify's sign-in | `f56804f` | Option 2, pick one |  |
| A ring ad's ?variant= link opens on the ad's size too | `dd89fe9` | optional | A catalogue ad's link opens on the metal, stone or month it names |

Left out on purpose:

- C70 (part): one offer per variant for multi-variant pieces: Not done, because it cannot be done cleanly here. Google's merchant listings do not accept a price-range offer (AggregateOffer). The form they support is a product group with one product per variant. That changes the top-level product data on the 21 multi-variant product pages, and the Meta pixel's automatic Microdata event reads exactly that data. The effect on what Meta receives cannot be measured, because Meta's script cannot be loaded in tests. Each variant should also carry its Shopify SKU, and SKUs in this data are themselves held for the owner (de55688). Best done together with that SKU decision, after C11, so that each variant's ?variant= address really opens that variant.
- OPTIONAL dd89fe9 (and 25611e3's original rule): a ring ad can open on a size Shopify has sold out since the last Publish: Measured, not fixed; recorded in dd89fe9's owner lines. The page opens on the stock it carries and, by design, does not re-open when Shopify's live stock arrives (that would undo a shopper's own pick). A fix has to change the page's opening effect, whose lines belong to the C29 commit, so it would tie option A to C29. Only option A is affected: the C11 base opens US 6 as main does. Today (31 Oct) every Roman Numeral size is sold out, so a page published with today's stock carries no first-paint script for it and every Roman Numeral link opens as a plain link (US 6, sold out). The cause (stock dating from the last Publish) is the one the prices area's held first-paint stock commit deals with; I did not test the two together.
- WITHDRAWN, approve neither this nor its fixup: Shopify customer-account links open Track Order: Withdrawn: an earlier version of this change, cancelled by its own reverse commit and replaced by the two options below. It will not be shipped.

## Text colours (`own-contrast` at `4c9f220`)

Check: Passed the final check. It corrected the wording of 2 lines; the corrected wording is shown here. Earlier checks found 6 problems; all were fixed.

| Card | Commits (in order) | Optional / option | Needs |
|---|---|---|---|
| Dark lettering on the sage footer and the announcement strip | `108a8d0` `9b8d8d5` |  |  |
| Keep white capitals, deepen the announcement strip | `9a1c33c` `7eccb73` | optional | Dark lettering on the sage footer and the announcement strip |
| Darker small lettering on the Shop All cards | `f46b992` `0cf8780` `0707d20` `4c9f220` |  |  |
| Deeper gold behind the "% OFF" badge on card photos | `61cb3f9` | optional | Darker small lettering on the Shop All cards |

Left out on purpose:

- R2 optional part: point RingAtelierBackdrop.tsx's raw #AEBDB6 at --nf-sage-mist: The reviewer marked it optional. That file is the ring atelier's animated backdrop, which neither C05 nor this fix names. Its colours sit in a JS palette array next to two other raw sage hexes that have no tokens, so converting one would only widen the commit. The 9a1c33c risk line records that the backdrop still uses the hex.
- Desktop scroll counter (the small number on the right edge at 1440px; it reads '100' at the bottom of a page): Not part of C84 or C05. It is a separate desktop-only decoration on every page (src/components/wow/ScrollBloom.tsx), hidden from screen readers, in ink at 45% at 9px: 2.34:1 over the sage footer and 2.87:1 over ivory. It floats over different grounds, so one fixed colour cannot be checked on all of them; it needs its own decision. Disclosed in the shopper lines of f46b992 and 0707d20. It is the only axe problem left on Shop All at 1440px, and one of the 16 left on the home page at 1440px.
- 'Tap to open' hint on the gift box (src/components/NairaBox3D.tsx): Not named by C84, and axe does not flag it (it is hidden from screen readers). Measured in Chromium at 2.85:1 (#928B85 on #F4EBE2, 10px) while it shows. It belongs to the 3D gift box, not to the band's lettering. If the owner wants it darker it is a one-class change (ink 45% to 65%). Disclosed in 0707d20's shopper line.
- NEW / BESTSELLER tag on the card photo (JewelCard.tsx, umbral gold at 8.5-9px): No card on the site shows it: the card's tag is never set from Shopify, so shoppers never see the tag. It would read about 3.6-3.8:1 if it ever showed. Left for when tags are introduced.
- 'The edit.' beside SHOP BY CATEGORY (mid gold #B0843A): Large text (27px and up). 3.08:1 meets WCAG's 3:1 for large text, so it is correct as it is.
- Review option: give the 'large text only' notes their own definition: Done once in the doc, in the paragraph right under the semantic table, which defines 'large text only' for both tables. The two matching notes in src/index.css are left as they are, which keeps the fix docs-only and the build byte-identical. The doc is the reference CLAUDE.md names.
- The other 15-16 axe items on the home page at the branch head (15 on Pixel 7, 16 at the other sizes): The outfit steps (01-05 and their lines), the campaign block (FEATURED IN THIS CAMPAIGN, WATCH ON INSTAGRAM, its prices and 'Own it.'), and at 1440px the '100' scroll counter (see its own item). They are outside C84 and C05, so they are not changed. The collection page's three numbered steps and the gift page's THE GIFT EDIT / EXPLORE are likewise outside these findings.
- The collection pages' own top line, for example 'NAIRA PETITE · EARRINGS' (src/pages/JewelleryCategory.tsx:139, umbral gold #9A7634): Outside C84, which names Shop All (/jewellery) only; 0707d20 darkens Shop All's NAIRA PETITE, not this one. Measured at 3.82:1 on the earrings collection page at every screen size, on main and at the head (/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad/owner-oct30/contrast/final/measure-head.log). Recorded so the owner knows the collection pages' heading line is unchanged; the same one-class change as Shop All's would fix it if wanted.
