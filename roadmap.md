# Roadmap
- [x] Show individual discounted bag prices as quantity offers change; verified totals, two-/three-piece transitions and removal back to original prices.

- [x] Audit price-filter boundaries and variant prices against Shopify; correct mismatches and verify browsing/back flow.
- [x] Audit collection membership and homepage/navigation sections; fix concrete mismatches and check jewellery-only scope.

- [x] Run the top strip on product pages too: the sale, shipping and small-run lines all move there, not just on the rest of the site


- [x] Re-apply the menu change the repository overwrite removed: one Customised Apparel entry in the desktop and phone menus

- [x] Re-apply the product-page fix the repository overwrite removed: the buy-bar check waits a frame and skips no-change writes, so the size guide cannot blank the page

- [x] Add a shared US 5–9 centimetre chart and measuring instructions to all ring PDP Details and size guides; verify ring and non-ring pages

- [x] Add production-only shopper timing and broken-link reporting
- [x] Add an admin-only performance dashboard and verify permissions and reporting

- [x] Make the bag's background the site's own page ground instead of white, keeping its edges and offer track readable

- [x] Check ad landings and bag speed; reduce closed-bag loading and prevent checkout after a failed product add

- [x] Remove bag promo entry and restore Buy Now on PDP and sticky purchase bars; verify the purchase flow

- [x] Update all jewellery PDP coating wording and add product-specific zircone feature blocks

- [x] Smooth the bag gift-box reveal, add tap-to-open wording and a Back control, and verify lightweight loading

- [x] Repair signed-in reel access, Golden Hour filters, reel touch handling, and member order recording

- [x] Shoppable reels: floating mini-reel on product pages, full-screen swipe gallery, product tags with Add to cart, admin upload at /admin/reels
- [x] Keep the reel feature light on PDP (lazy-loaded viewer, no fetch/video until scrolled, compressed media) and smooth on desktop
- [x] Remove product counts from jewellery scrolling tabs
- [x] Shorten jewellery PDP by consolidating repeated product, trust, delivery, and recommendation sections
- [x] Pin Prism Rivière bracelet and Woven Gold Hoops at the top of /jewellery
- [x] Mobile CRO first release: responsive PDP gallery, calm overlays, simplified cart, recoverable checkout handoff
- [x] Match the compact Shopify-style mobile PDP: square image slides, overlay dots, quantity beside Add to Cart, full-width Shop Now
- [x] Shorten the review section with a featured review, rating stars, expandable review wall, photo submission, and live updates
- [x] Simplify jewellery PDP footer and page length: compact Naira/contact/policies footer, one recommendation row, no duplicate help or recently viewed section
- [x] Prevent packaging or gift-box photos from becoming product covers when a listing has only two images
- [x] Add a continuous press wordmark line below PDP reviews for Times of India, Maharashtra Times, Lokmat, Times Now, and Fashionista
- [x] Redesign PDP recommendations as a five-piece editorial showcase with one featured piece and four supporting picks
- [x] Replace mobile PDP recommendations and floating reel with an embedded swipeable Shop the Reel section and three products per reel
- [x] Reintroduce mobile-only You May Also Like as a compact five-piece asymmetric broken-grid edit below the reels
- [x] Restore the PDP-only FOMO notice for 2.3 seconds and simplify the mobile cart
- [x] Restore the floating mobile reel preview and open the existing two-reel shopping grid in a bottom drawer
- [x] Remove Molten Bloom Hoops from the pinned favourites and repair reel playback for Instagram on iOS
- [x] Make the floating reel tab respond reliably to touch in Instagram and iPhone browsers
- [x] Repair the mobile bag for two and three items with a compact offer, scrollable products, and stable checkout summary
- [x] Refine the mobile checkout CTA with contrast-safe gold, deliberate top spacing, tactile feedback, and adjacent trust copy
- [x] Remove category-card product counts and adopt a deep green Secure Checkout treatment
- [x] Route general shopping and bag continuation to the main jewellery collection, never the Festive Edit
- [x] Match the cart checkout action to the black reference treatment with payment marks and Shiprocket attribution
- [x] Refresh Golden Hour with available bestsellers, led by the multicolour bracelet and Woven Gold Hoops
- [x] Add compact anti-tarnish, skin-safe, and 18K gold-tone assurances to every jewellery product page
- [x] Fit all three jewellery assurances within mobile PDP width and add a truthful sales-momentum cue
- [x] Restore the full mobile Shop the Reel section below the PDP press strip and remove its floating popup
- [x] Recover from a page whose code never arrives: one-shot stale-build reload and a branded panel instead of a blank screen

- Keep the bag offer explanation on TOP of the track: "✦ Sitewide sale live today · up to 30% off" (the figure is the top rung, read from promo.ts; 30% since Buy 4 joined on 7 Nov 2026, 20% from 3 Nov) — the owner's own wording, saving named.
- Header strip leads with the offer, "BUY 3 GET 20% OFF · BUY 4 GET 30% OFF" (rates read from promo.ts; the owner, 2 Nov 2026, rates set back to 10%/20% on 3 Nov, Buy 4 at 30% added 7 Nov, Buy 2 taken away the same day), then "SITEWIDE SALE LIVE TODAY!", "FREE INSURED SHIPPING", "MADE IN LIMITED BATCHES".
- Bag offer line stays small and quiet on top of the track — do not let it clutter the bag. It is 11px since 7 Nov 2026 (it was 8.5px, under what a phone can read), quiet in colour, and wraps to two balanced lines under 360px.
- [x] Buy 4 = 30% off (BUY4 in Shopify, BUY3's twin): the ladder in promo.ts, the bag's three-rung track, the announcement strip, the home line ("Up to 30% off when you buy more" on a phone, every rung wider), and the product page's offer box redesigned in three columns; the bag still hands Fastrr one code, BUY4 from four pieces.
- [x] Buy 2 (10%) removed, the owner's ask of 7 Nov 2026 ("we need only buy 3 20% off and buy 4 30% off"): the ladder is two rungs, Buy 3 = 20% (BUY3) and Buy 4 = 30% (BUY4), in the bag, its track and labels, the product page's offer box (two columns, `RUNG_GRID_COLS`), the announcement strip and the home line. One or two pieces take no rung and hand Fastrr no code; the bag says "A third piece takes 20% off your bag" where the saving would be. A typed BUY2 is worth nothing and never reaches Fastrr. NAIRA10 (10%) and FRIENDSANDFAMILY (20%, jewellery only) still apply as typed. Tests brought up to date in the follow-up commit.
- [ ] Switch BUY2 off in Shopify once the two-rung bag is live (the lead, never before, so the live bag never promises more than checkout gives).
- [x] Jewellery-only site: apparel removed from menu, footer, search and home/about wording; only the made-to-measure custom outfits section (/customize) remains; /shop/indo-western now opens /customize.
- [x] State "Easy 7-day exchange & returns" in the bag, one quiet line under the checkout button linking to the policy; verified on phone and tablet.

- [x] Add soft popularity-based bestseller badges to Shop All and menu category cards; cap mixed sold-out cards at one per 20 and put the rest last. Verified live cards on phone/tablet/desktop and 19 browsing tests.
