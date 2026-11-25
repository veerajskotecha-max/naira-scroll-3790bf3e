import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/*
  The redesigned product page keeps the live page's hard-won rules (see
  JewelDetail.test.ts for the measurements behind each), and stays out of
  search while it is in preview.

  20 Nov 2026: the clean redesign (src/components/clean). The rules about
  behaviour, order, tracking and search are unchanged below; the ones that
  pinned the old look now pin the new one: a QUALITY row for the badges, four
  dropdowns for the three fold-downs, the shop's own rating for the bundled
  review count, and nothing invented (no sold count, no "someone bought" card).

  25 Nov 2026: the renewed layer (src/components/pdp, renew.css), on its own
  branch. The behaviour rules stand. What moved: the QUALITY row is three
  ticked benefits, the OFFER row is a panel under the buttons whose line
  fills with the bag, Add to cart carries the price with Buy Now beside it,
  the promise and four reassurances sit right under them, the description
  folds away when its first sentence is already under the price, and
  "Complete the look" is a bundle with one button.
*/
const src = readFileSync(resolve(__dirname, "JewelDetailNext.tsx"), "utf8");
const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "").replace(/\{\s*\}/g, "{}");

describe("redesigned product page", () => {
  it("waits for the catalogue before redirecting a missing handle", () => {
    const redirect = code.match(/if \(!piece\)[\s\S]{0,220}?Navigate to="\/jewellery"/);
    expect(redirect).not.toBeNull();
    expect(redirect![0]).toMatch(/catalogueLoading/);
  });

  it("keeps the square phone photo", () => {
    expect(code).toMatch(/const MOBILE_FRAME = "1\/1"/);
  });

  it("shows the buy bar whenever Add to cart is not fully on screen, never over the price", () => {
    const effect = code.match(/const check = \(\) => \{[\s\S]*?setStickyBarVisible\([\s\S]*?\);/)![0];
    expect(effect).toMatch(/stickyBarRef/);
    expect(effect).toMatch(/querySelector\("#product-actions > button"\)/); // the button, not the gift line under it
    expect(effect).toMatch(/getElementById\("product-price"\)/);
    expect(effect).toMatch(/const notFullyShown = r\.bottom < 0 \|\| r\.bottom > window\.innerHeight/);
    expect(effect).toMatch(/const next = notFullyShown && priceClear && offerClear/);
    /* ...nor over the offer's rungs while they are fully on screen. */
    expect(effect).toMatch(/querySelector\("\[data-offer-ladder\] ul"\)/);
    expect(effect).toMatch(/const offerClear = !rungs \|\| rungs\.bottom > window\.innerHeight \|\| rungs\.bottom < window\.innerHeight - barHeight/);
    /* 20 Nov 2026: the offer became a row of the table, and the gap between
       the rungs' foot and the button's grew past the bar's own height. On a
       360x640 phone the bar left for the rungs, came back for 40px of scroll
       and left again as the button arrived: on, off, on, off in the first
       180px. A bar that is away stays away while the button is already
       coming in at the bottom edge; one that is up stays up, as before. */
    expect(effect).toMatch(/const arriving = r\.top < window\.innerHeight && r\.bottom > window\.innerHeight/);
    expect(effect).toMatch(/offerClear && !\(arriving && barShown\.current === false\)/);
    expect(effect).toMatch(/barShown\.current = next/);
    expect(code).toMatch(/barShown\.current = null;\s*const check = /);
    /* The observer used to call check() from its own callback, so the bar's
       state was written inside the browser's layout pass. When the size guide's
       chart changed the page height, Chromium threw "ResizeObserver loop
       completed with undelivered notifications" and the page went blank. The
       write must wait for the next frame, and must not render at all when
       nothing changed. */
    expect(effect).toMatch(/setStickyBarVisible\(\(cur\) => \(cur === next \? cur : next\)\)/);
    expect(code).not.toMatch(/new ResizeObserver\(check\)/);
    const observer = code.match(/new ResizeObserver\([\s\S]*?ro\.observe\(document\.body\)/)![0];
    expect(observer).toMatch(/requestAnimationFrame/);
    expect(observer).toMatch(/check\(\)/);
  });

  /* The head used to say "4.9 · 50 reviews" on every piece: the average and
     count of one bundled list, most of it dealt to each product by a hash of
     its name. It now carries the shop's own figures (lib/trust), the ones the
     bag shows, and still jumps to the reviews. */
  it("shows the shop's own rating and client count in the head, not a bundled review count", () => {
    expect(code).toMatch(/import \{ SHOP_RATING, clientsLabel \} from "@\/lib\/trust"/);
    const link = code.match(/<a\s+href="#customer-reviews"[\s\S]*?<\/a>/)![0];
    expect(link).toMatch(/\{SHOP_RATING\}/);
    expect(link).toMatch(/\{clientsLabel\} clients/);
    expect(link).toMatch(/aria-label=\{`Rated \$\{SHOP_RATING\} out of 5\. Trusted by \$\{clientsLabel\} clients\. Jump to reviews\.`\}/);
    expect(code).not.toMatch(/reviewSummary|reviewWall|rating\.count/);
    /* The embedded piece keeps its shape; the rating it carried is gone. */
    expect(code).toMatch(/JSON\.stringify\(\{ piece, rating: null \}\)/);
  });

  it("chooses ring size with buttons", () => {
    expect(code).not.toMatch(/<Select[\s>]/);
    expect(code).toMatch(/role="radiogroup"/);
    expect(code).toMatch(/aria-checked=\{active\}/);
  });

  it("keeps the first screen to price, ring size and Add to cart, the details folded away below", () => {
    const price = code.indexOf('id="product-price"');
    const size = code.indexOf('aria-label="Ring size, US"');
    const actions = code.indexOf('id="product-actions"');
    const details = code.indexOf('id="pdp-panel-details"');
    expect(price).toBeGreaterThan(-1);
    expect(size).toBeGreaterThan(price);
    expect(actions).toBeGreaterThan(size);
    expect(details).toBeGreaterThan(actions);
    expect(code).not.toMatch(/id="product-facts"/);
    expect(code).not.toMatch(/role="tablist"/);
  });

  /* The owner, 20 Nov 2026: "see how to put drop downs and remove clutter".
     Four native <details> rows (CleanDropdown), named and ordered as the spec
     has them; the paragraph that sells the piece is open, the rest closed.
     Every panel stays in the page, so all of it is in the HTML. */
  it("folds the rest into four dropdowns, the description open only when no sentence of it is under the price", () => {
    const rows = [...code.matchAll(/<CleanDropdown title="([^"]+)" id="([^"]+)"( defaultOpen=\{!lede\})?(?: onToggle=\{[^\n]*?\})?>\n/g)].map((m) => [m[1], m[2], Boolean(m[3])]);
    expect(rows).toEqual([
      ["Description", "pdp-panel-description", true],
      ["Details and size", "pdp-panel-details", false],
      ["Care and plating", "pdp-panel-care", false],
      ["Delivery and returns", "pdp-panel-delivery", false],
    ]);
    expect(code.match(/<CleanDropdown\s/g)).toHaveLength(4);
    /* The size guide's photograph under "Details and size" waits for that row
       to be opened: folded away, it was downloaded on every visit (65 KB). */
    expect(code).toMatch(/id="pdp-panel-details" onToggle=\{\(open\) => open && setDetailsSeen\(true\)\}/);
    expect(code).toMatch(/\{piece\.sizeGuide && detailsSeen && \(/);
    expect(code.match(/<CleanDropdowns\s/g)).toHaveLength(1);
    expect(code).not.toMatch(/<details/);
    /* The description leads with the piece's own paragraph, whole: the
       sentence lifted to sit under the price is still in it. */
    const description = code.slice(code.indexOf('id="pdp-panel-description"'), code.indexOf('id="pdp-panel-details"'));
    expect(description).toMatch(/\{piece\.blurb\}/);
    expect(description).toMatch(/\{piece\.stylingTip && <p>\{piece\.stylingTip\}<\/p>\}/);
    expect(code).toMatch(/const lede = setLede\(specs\.find\(\(spec\) => \/\^set\$\/i\.test\(spec\.label\)\)\?\.value\) \?\? ledeOf\(piece\.blurb\);/);
    expect(code).toMatch(/\{lede && <p className="nc-text rn-lede">\{lede\}<\/p>\}/);
    expect(code.indexOf("rn-lede")).toBeGreaterThan(code.indexOf('id="product-price"'));
    expect(code.indexOf("rn-lede")).toBeLessThan(code.indexOf('id="product-actions"'));
  });

  /* The owner (2 Nov 2026): the offer on the product page, priced for the
     piece. 25 Nov 2026: a padded panel whose line fills with the bag, under
     the buttons and their reassurance (so Add to cart stays on a tall
     phone's first screen) and before the dropdowns. Once, priced from the
     chosen variant; a piece sold out altogether is reserved on WhatsApp,
     outside the bag, and is offered nothing. */
  it("puts the buy-more offer in a panel under the buttons and reassurance, before the dropdowns", () => {
    const offer = code.indexOf("<PdpOfferTracker");
    expect(offer).toBeGreaterThan(code.indexOf('id="product-actions"'));
    expect(offer).toBeGreaterThan(code.indexOf("<PdpTrust"));
    expect(offer).toBeLessThan(code.indexOf("<CleanDropdowns"));
    expect(code.match(/<PdpOfferTracker/g)).toHaveLength(1);
    expect(code).toMatch(/\{!soldOut && <PdpOfferTracker price=\{shown\.price\} preorder=\{sizePreorder \|\| variantSoldOut\} \/>\}/);
    expect(code).not.toMatch(/PdpOfferLadder/);
  });

  it("keeps the shoppable reels in the page, after the press strip", () => {
    const press = code.indexOf("<PressMarquee />");
    const reels = code.indexOf("<ReelShopNext");
    expect(press).toBeGreaterThan(-1);
    expect(reels).toBeGreaterThan(press);
    expect(code).not.toMatch(/<ReelPeek/);
  });

  it("stays out of search while in preview and names the live page as canonical", () => {
    expect(code).toMatch(/<meta name="robots" content=\{inPreview \? "noindex, nofollow" : "index, follow, max-image-preview:large"\} \/>/);
    expect(code).toMatch(/const inPreview = isPreviewPath\(pathname\)/);
    expect(code).toMatch(/<link rel="canonical" href=\{canonical\} \/>/);
    // `src`, not `code`: stripping line comments would cut the URL at "//".
    expect(src).toMatch(/const canonical = `https:\/\/nairaflore\.com\/jewellery\/\$\{piece\.handle\}`/);
  });

  it("keeps what the pre-built page needs: embedded piece, product and breadcrumb data", () => {
    expect(code).toMatch(/id="nf-piece"/);
    expect(code).toMatch(/"@type": "BreadcrumbList"/);
    // The questions live in the Care tab now, not as an FAQ section.
    expect(code).not.toMatch(/"@type": "FAQPage"/);
  });

  it("keeps quantity changes in the bag", () => {
    expect(code).not.toMatch(/aria-label="Decrease quantity"/);
  });

  it("opens an ad's ?variant= link on its variant, a colour picked here winning over it", () => {
    expect(code).toMatch(/const variantLink = colourLink \? null : searchParams\.get\("variant"\)/);
    expect(code).toMatch(/const opening = \(p: JewelPiece\) => variantChoice\(p, variantLink\) \?\? openingChoice\(p, colourParam\)/);
    expect(code).toMatch(/useState<Record<string, string>>\(\(\) => \(piece \? opening\(piece\) : \{\}\)\)/);
    expect(code).toMatch(/\[piece\?\.handle, variantKey, colourParam, variantLink\]/);
  });

  it("routes Buy Now through checkout with the chosen variant, but reserves pre-orders on WhatsApp", () => {
    const handler = code.match(/const handleBuyNow = async \(\) => \{[\s\S]*?\n {2}\};/)?.[0] ?? "";
    expect(handler).toContain("if (isPreorder) return handlePreOrder();");
    expect(handler).toContain("await buyNow(cartItem());");
    expect(handler).toContain("if (buying || cartLoading) return;");
  });

  it("suggests a second piece before the reviews", () => {
    const look = code.indexOf('id="complete-the-look"');
    const reviews = code.indexOf("<PdpReviews");
    expect(look).toBeGreaterThan(-1);
    expect(reviews).toBeGreaterThan(look);
  });

  it("switches the palette on for its own lifetime only", () => {
    expect(code).toMatch(/root\.classList\.add\("nf-next"\)/);
    expect(code).toMatch(/return \(\) => root\.classList\.remove\("nf-next"\)/);
  });

  it("steps back only inside Naira: a shopper from Google, WhatsApp, an ad or a new tab goes to the jewellery", () => {
    const back = code.match(/const goBack = \(\) => \{[\s\S]*?\n {2}\};/)![0];
    expect(back).not.toMatch(/history\.length > 1\) navigate\(-1\)/); // every page the tab showed, other sites included
    expect(back).toMatch(/history\.state[\s\S]*?\.idx/);
    expect(back).toMatch(/document\.referrer/);
    expect(back).toMatch(/navigate\("\/jewellery"\)/);
  });

  it("lets the phone's back close the photo zoom and the size guide, not leave the piece", () => {
    expect(code).toMatch(/useBackToClose\("nfZoom", lightboxOpen, setLightboxOpen\)/);
    expect(code).toMatch(/useBackToClose\("nfSizeGuide", sizeGuideOpen, setSizeGuideOpen\)/);
    expect(code).toMatch(/<RingSizeGuideModal[^>]*onClose=\{guide\.requestClose\}/);
    expect(code).toMatch(/onOpenChange=\{\(open\) => \(open \? setLightboxOpen\(true\) : zoom\.requestClose\(\)\)\}/);
  });

  it("scrolls to the reviews without a history step, so back still goes where the shopper came from", () => {
    expect(code).toMatch(/href="#customer-reviews"\s+onClick=\{toReviews\}/);
    expect(code).toMatch(/const toReviews = [\s\S]*?e\.preventDefault\(\);[\s\S]*?scrollIntoView/);
  });

  /* Three bordered badges with icons became one row of plain words, and
     then three ticked benefits: the same values, in the same order, with the
     stone only where the listing has one. */
  it("says anti-tarnish, skin-friendly and the piece's own plating as ticked benefits under the price, before Add to bag", () => {
    const benefits = code.indexOf("<PdpAssurances");
    expect(benefits).toBeGreaterThan(code.indexOf('id="product-price"'));
    expect(benefits).toBeLessThan(code.indexOf('id="product-actions"'));
    expect(code.slice(benefits, benefits + 300)).toMatch(/items=\{\["Anti-tarnish", "Skin-friendly", platingBadge\(finish\), hasZirconeStone\(piece\) && "Zircone stone"\]\}/);
    expect(code.match(/<PdpAssurances/g)).toHaveLength(1);
    expect(code).not.toMatch(/<CleanDots/);
  });

  /* What the code map showed to be made up is not carried into the new page:
     the "sold in the last 48 hours" count is a number from the handle's
     letters (lib/dailySold), the "someone bought" card picks names, cities and
     minutes at random (FomoPopup). */
  it("carries nothing invented: no sold count, no bought card", () => {
    expect(src).not.toMatch(/pieces sold in the last 48 hours/);
    expect(code).not.toMatch(/recentSoldCount|dailySold/);
    expect(code).not.toMatch(/FomoPopup/);
    expect(code).not.toMatch(/sold in the last|bought the/i);
  });

  /* The preview's title switch is CSS only; these are its hooks. */
  it("marks the title and the eyebrow for the preview's title switch", () => {
    expect(code).toMatch(/<h1 data-pdp="title" className="nc-title[^"]*">\s*\{piece\.name\}\s*<\/h1>/);
    expect(code.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(code).toMatch(/<Link to="\/jewellery" data-pdp="eyebrow" className="nc-label nc-label--gold nc-tap">\s*\{piece\.category\}\s*<\/Link>/);
  });

  /* The wishlist heart sits beside the name. Two small marks may sit on the
     first photograph and leave with it when it is swiped: "Popular", only
     where the shop's own view counts earn it (the listing's "Bestseller"
     set, read from what is already cached: no request is made for it), and
     "Video", the way to the piece's reel at the far end of the photos. Over
     every slide, "Popular" covered the size guide's note and the reel's
     caption (the conversion review, 25 Nov 2026). The laptop's grid also
     keeps "+N photos". */
  it("lays its marks over the first photograph only, and the count of more", () => {
    const phone = code.slice(code.indexOf("const MobileGallery"), code.indexOf("const DesktopGallery"));
    expect(phone).not.toMatch(/\babsolute\b/);
    expect(phone).toMatch(/\{i === 0 && popular && \(\s*<span className="rn-tag" aria-hidden="true">\s*Popular\s*<\/span>\s*\)\}/);
    expect(phone).toMatch(/\{i === 0 && galleryReel && \(\s*<button type="button" onClick=\{toReel\} className="rn-tag rn-tag--video"/);
    /* Each mark is a sibling of the photo's button, never inside it: a
       button's label hid the word from a screen reader, and a button cannot
       hold another. */
    expect(phone).toMatch(/<\/button>\s*\{i === 0 && popular/);
    expect(phone.match(/className="rn-tag/g)).toHaveLength(2);
    expect(code).toMatch(/const toReel = \(\) => \{\s*const el = scrollRef\.current;\s*if \(el\) el\.scrollTo\(\{ left: el\.offsetWidth \* images\.length, behavior: "smooth" \}\);/);
    /* Said once to a reader who cannot see the photograph. */
    expect(code).toMatch(/\{popular && <span className="nc-sr">Popular piece\.<\/span>\}/);
    expect(phone).toMatch(/className="nc-segs"/);
    /* The frame that gives up height on a short screen: every slide, the
       reel's, and the loading shape, so nothing jumps when the page arrives. */
    expect(code.match(/rn-frame/g)?.length).toBeGreaterThanOrEqual(3);
    const laptop = code.slice(code.indexOf("const DesktopGallery"), code.indexOf("const sizeGuideLink"));
    expect(laptop.match(/\babsolute\b/g)).toHaveLength(1);
    expect(laptop).toMatch(/\{popular && i === 0 && \(\s*<span className="rn-tag" aria-hidden="true">\s*Popular\s*<\/span>\s*\)\}/);
    expect(laptop).toMatch(/\+\{more\} \{more === 1 \? "photo" : "photos"\}/);
    expect(code.match(/onClick=\{handleWishlist\}/g)).toHaveLength(1);
    /* Views, not sales, and never for a piece that cannot be bought. */
    expect(code).toMatch(/piece\.availableForSale !== false && bestsellerHandles\(jewellery, readCachedVisits\(\)\)\.has\(piece\.handle\)/);
    expect(code).not.toMatch(/usePieceVisits|fetchVisits/);
    expect(code).not.toMatch(/>\s*Bestseller\s*</i);
  });

  /* Buy now, narrower, then the one filled button with the price in it: the
     same order as the phone's bar, where the price comes first (the page had
     them one way and the bar the other). The words are the bag's own ("Add
     to bag": the offer line, the drawer and "View bag" all say bag). No
     payment discs in a button. The bar's watcher is a direct child of
     #product-actions. */
  it("keeps the buttons as #product-actions' own children, the price in the one that adds, the promise right under them", () => {
    const actions = code.slice(code.indexOf('id="product-actions"'), code.indexOf("<PdpTrust"));
    expect(actions).toMatch(/Add to bag\s*<span className="rn-price-in">\{shown\.priceLabel\}<\/span>/);
    expect(actions).toMatch(/\{buying \? "Opening…" : "Buy now"\}/);
    /* A piece that cannot ship now has one button, and it says where it leads. */
    expect(actions).toMatch(/"Pre-order on WhatsApp"/);
    expect(code).not.toMatch(/Reserve now|Add to cart"|Buy Now/);
    expect(actions).not.toMatch(/<div/);
    /* Buy now first, as in the bar; both are the box's own children. */
    expect(actions.indexOf("handleBuyNow")).toBeLessThan(actions.indexOf("handleAddToCart"));
    /* Once this piece is in the bag the filled button opens the bag, and
       nothing is added a second time. */
    expect(actions).toMatch(/inBag \? \(\s*"View bag"\s*\)/);
    expect(code).toMatch(/const inBag = !isPreorder && items\.some\(\(item\) => cartKeyOf\(item\) === cartKeyOf\(cartItem\(\)\)\);/);
    expect(code).toMatch(/setDrawerOpen\(true\);\s*if \(inBag\) return;\s*await addItem\(cartItem\(\)\);/);
    /* What adding it does to a bag that holds pieces is said just above. */
    expect(code.indexOf("data-offer-note")).toBeLessThan(code.indexOf('id="product-actions"'));
    expect(code).toMatch(/const offerNote = !isPreorder && totalItems > 0 \? offerLine\(\{ subtotal, totalItems, promoCode \}, shown\.price, inBag\) : "";/);
    /* In stock, the date a visitor is quoted and the way to a pincode check;
       a piece that cannot ship now says its one lead time instead. */
    const promise = actions.slice(actions.indexOf('className="rn-ship"'));
    expect(promise).toMatch(/`\$\{SOLD_OUT_LEAD\}, gift-boxed`/);
    expect(promise).toMatch(/<strong>\{sizeInStock \? `\$\{sizeInStock\} in stock` : "In stock"\}<\/strong>/);
    expect(promise).toMatch(/arrivesBy && <span>Arrives \{arrivesBy\}<\/span>/);
    /* A pincode checked before gets its own date in place of the range. */
    expect(promise).toMatch(/To \{shipTo\.pincode\} by \{shipTo\.eta\}/);
    expect(promise).toMatch(/onClick=\{toDelivery\}/);
    /* A pre-order's line no longer repeats the shipping the grid under it says. */
    expect(promise).toMatch(/"Pre-orders are arranged on WhatsApp, with the delivery date\."/);
    expect(code).not.toMatch(/"Free insured shipping", !isPreorder/);
    expect(code).toMatch(/<PdpTrust reserved=\{isPreorder\} \/>/);
    /* The bar: the price, then the same two buttons. */
    const bar = code.slice(code.indexOf('className="rn-bar"'));
    expect(bar).toMatch(/<b>\{shown\.priceLabel\}<\/b>/);
    expect(bar).toMatch(/\{buying \? "Opening…" : "Buy now"\}/);
    expect(bar).toMatch(/\{isPreorder \? "Pre-order" : inBag \? "View bag" : "Add to bag"\}/);
    /* While the page's own price is on screen the bar does not print it again. */
    expect(bar).toMatch(/data-price-shown=\{priceOnScreen \? "" : undefined\}/);
    /* A ring says the size it is about to add. */
    expect(bar).toMatch(/isRing && !isPreorder && sizeInStock \? \(\s*<span>Size \{sizeInStock\}<\/span>/);
  });

  /* "Complete the look" as a bundle: the piece as chosen and the pairings
     one tap can add, ticked, totalled by the bag's own arithmetic, added
     with one button. A piece that is pre-ordered on WhatsApp cannot go in
     the bag with them, so it keeps the cards; so does a piece none of whose
     pairings can be ticked. */
  it("offers the pairings as a bundle for a piece that ships now, as cards for one that is pre-ordered", () => {
    const bundle = code.slice(code.indexOf("<PdpBundle"), code.indexOf("<PdpBundle") + 700);
    expect(code).toMatch(/\{bundlePieces\.length > 0 && !isPreorder && \(\s*<PdpBundle/);
    expect(bundle).toMatch(/line: cartItem\(\)/);
    expect(bundle).toMatch(/price: shown\.price/);
    expect(bundle).toMatch(/pieces=\{bundlePieces\}/);
    /* It is told when the bag already holds this piece, so it never adds it twice. */
    expect(bundle).toMatch(/anchorInBag=\{inBag\}/);
    expect(code).toMatch(/const bundlePieces = useMemo\(\(\) => pairingPool\.filter\(\(p\) => !choiceNeeded\(p\)\)\.slice\(0, 3\), \[pairingPool\]\);/);
    expect(code).toMatch(/\{pairings\.length > 0 && \(isPreorder \|\| bundlePieces\.length === 0\) && \(/);
    expect(code.indexOf("<PdpBundle")).toBeGreaterThan(code.indexOf("<CleanDropdowns"));
    expect(code.indexOf("<PdpBundle")).toBeLessThan(code.indexOf("<PdpReviews"));
  });

  /* Sections below the buy area rise in as they are reached. Only wrappers
     the page itself renders carry the class: what a lazy part draws later is
     inside one, so nothing can arrive hidden with no one watching for it. */
  it("lets the lower sections rise in, each inside a wrapper the page renders itself", () => {
    expect(code).toMatch(/useReveal\(rootRef, /);
    expect(code).toMatch(/<NearView className="rn-reveal" minHeight=\{520\} slot="reviews">\s*<Suspense fallback=\{[^}]*\}>\s*<PdpReviews/);
    /* The page loads its own reviews by themselves, not through the shared
       component, whose chunk also carries the outfit page's list and bank. */
    expect(code).toMatch(/const PdpReviews = lazy\(\(\) => import\("@\/components\/pdp\/PdpReviews"\)\);/);
    expect(code).not.toMatch(/CustomerReviews/);
    expect(code).toMatch(/<NearView className="rn-reveal" minHeight=\{144\}>\s*<PressMarquee \/>/);
    expect(code).toMatch(/<NearView className="rn-reveal" minHeight=\{0\}>\s*<Suspense fallback=\{[^}]*\}>\s*<ReelShopNext/);
    /* The rating's link can reach the reviews before they are drawn. */
    expect(code).toMatch(/getElementById\("customer-reviews"\) \?\? document\.querySelector\('\[data-slot="reviews"\]'\)/);
    const above = code.slice(code.indexOf("<main"), code.indexOf("<CleanDropdowns"));
    expect(above).not.toMatch(/rn-reveal/);
  });

  /* Type and colour come from the clean system's classes and tokens and from
     nowhere else (SPEC section 2); Tailwind is for layout. The swatch list,
     which pictures metals and stones, is the one place a raw colour stays. */
  it("draws its type and colour from the clean system only", () => {
    expect(code).toMatch(/<div className="nf-clean min-h-screen">\s*<CleanStyles \/>/);
    /* The page's own root adds the renewed layer's class and stylesheet. */
    expect(code).toMatch(/<div ref=\{rootRef\} className="nf-clean rn-page min-h-screen">\s*<CleanStyles \/>\s*<PdpStyles \/>\s*<RenewStyles \/>/);
    for (const banned of [/font-cormorant/, /font-nf-/, /text-nf-/, /bg-nf-/, /border-nf-/, /\btracking-/, /\btext-\[/, /--nf-/, /UpiBadges/, /\brounded/, /\bshadow-/, /backdrop-blur/, /\bfont-(?:light|normal|medium|semibold|bold)\b/, /\bitalic\b/, /\buppercase\b/]) {
      expect(code).not.toMatch(banned);
    }
    const hexes = code.replace(/const SWATCHES[\s\S]*?\];/, "").match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
    expect(hexes).toEqual([]);
    expect(code).not.toMatch(/@\/components\/ui\/button/);
  });
});

/* "sku": "" is invalid structured data, and 115 product pages served it. A
   piece without a code leaves the key out. */
describe("product structured data", () => {
  for (const file of ["JewelDetailNext.tsx", "JewelDetail.tsx"]) {
    it(`${file} never emits an empty sku`, () => {
      const page = readFileSync(resolve(__dirname, file), "utf8").replace(/\/\/.*$/gm, "");
      expect(page).not.toMatch(/^\s*sku: piece\.sku,/m);
      expect(page).toMatch(/\.\.\.\(piece\.sku \? \{ sku: piece\.sku \} : \{\}\)/);
    });
  }
});

/* Descriptions were cut at a fixed count and ended mid-word in search
   results and link previews ("…each s"); they go through clipText now. */
describe("meta and social descriptions", () => {
  for (const file of ["JewelDetailNext.tsx", "JewelDetail.tsx", "ProductDetail.tsx"]) {
    it(`${file} cuts its descriptions between words`, () => {
      const page = readFileSync(resolve(__dirname, file), "utf8");
      expect(page).not.toMatch(/(?:blurb|description)\.slice\(0, \d+\)/);
      expect(page.match(/clipText\(/g)?.length).toBe(3);
    });
  }
});

/* The page sold an open-back ring Shopify had sold out: Add to cart, "US 6
   ships now" and a delivery date, while its card on the listing said SOLD
   OUT. Adjustability is fit, not inventory. */
describe("stock on the product page and reel cards", () => {
  it("takes Shopify's sold-out for every piece, adjustable rings included", () => {
    expect(code).toMatch(/const soldOut = piece\.availableForSale === false;/);
  });

  it("does the same on both reel cards", () => {
    for (const file of ["../components/reels/ReelShopNext.tsx", "../components/reels/MobileReelShop.tsx"]) {
      const reel = readFileSync(resolve(__dirname, file), "utf8");
      expect(reel).toMatch(/const soldOut = live\?\.availableForSale === false;/);
      expect(reel).not.toMatch(/isAdjustableRing/);
    }
  });

  /* Three lead times sat on one page: 2 weeks under the button, 3–5 working
     days in Delivery & returns and a dated pincode promise. */
  it("says one lead time for a piece it cannot ship now", () => {
    expect(code).toMatch(/const leadTime = preorderLead\(\{ soldOut, variantSoldOut, sizePreorder, size: selectedSize \}\);/);
    /* "arrives by 30 Nov – 2 Dec": "by" cannot take a range. */
    expect(code).toMatch(/\{leadSaid \? `\$\{leadSaid\} ` : arrivesBy \? `Order today and it arrives \$\{arrivesBy\}\. `/);
    expect(code).toMatch(/<PincodeChecker preorder=\{isPreorder\} look="clean" onChecked=\{noteShipTo\} \/>/);
    expect(code).not.toMatch(/45 days|within 2 weeks/);
  });
});

/* The pairing name's 44px target was padding on the clamped box itself. A
   clamp clips at the padding edge, so a three-line name ("Serpentine Whisper
   Chain — Silver") showed the top of its hidden third line over the price.
   The padding stays on the link and the clamp goes inside it. */
describe("pairing card names", () => {
  it("clamp the name inside its 44px link, not on it", () => {
    const card = code.match(/const PairingCard = [\s\S]*?\n};\n/)![0];
    const name = card.match(/<Link to=\{to\} className="([^"]*)">\s*<span className="([^"]*)">\{piece\.name\}<\/span>/);
    expect(name).not.toBeNull();
    const [, link, clamp] = name!;
    expect(link).toMatch(/min-h-\[44px\]/);
    expect(link).not.toMatch(/line-clamp/);
    expect(clamp).toMatch(/\bline-clamp-2\b/);
    expect(clamp).not.toMatch(/(?:^|\s)-?(?:p|py|pt|pb)-|min-h-|\bh-/);
  });
});
