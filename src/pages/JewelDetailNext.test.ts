import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/*
  The redesigned product page keeps the live page's hard-won rules (see
  JewelDetail.test.ts for the measurements behind each), and stays out of
  search while it is in preview.
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
    expect(effect).toMatch(/const next = notFullyShown && priceClear/);
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

  it("shows the rating only with its count", () => {
    const block = code.match(/\{rating && \([\s\S]*?\)\}/)![0];
    expect(block).toMatch(/rating\.rating/);
    expect(block).toMatch(/rating\.count/);
    expect(code).toMatch(/href="#customer-reviews"/);
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
    expect(code.match(/<details className="group/g)?.length).toBe(3);
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

  it("routes Buy Now through checkout with the chosen variant, but reserves pre-orders on WhatsApp", () => {
    const handler = code.match(/const handleBuyNow = async \(\) => \{[\s\S]*?\n {2}\};/)?.[0] ?? "";
    expect(handler).toContain("if (isPreorder) return handlePreOrder();");
    expect(handler).toContain("await buyNow(cartItem());");
    expect(handler).toContain("if (buying || cartLoading) return;");
  });

  it("suggests a second piece before the reviews", () => {
    const look = code.indexOf('id="complete-the-look"');
    const reviews = code.indexOf("<CustomerReviews");
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

  it("badges anti-tarnish, skin-friendly and the piece's own plating under the price, before Add to cart", () => {
    const badges = code.indexOf('aria-label="Made to last"');
    expect(badges).toBeGreaterThan(code.indexOf('id="product-price"'));
    expect(badges).toBeLessThan(code.indexOf('id="product-actions"'));
    const row = code.slice(badges, badges + 900);
    expect(row).toMatch(/"Anti-tarnish"/);
    expect(row).toMatch(/"Skin-friendly"/);
    expect(row).toMatch(/platingBadge\(finish\)/);
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
    expect(code).toMatch(/\{leadTime \? `\$\{leadTime\} ` : arrivesBy \? `Order today and it arrives by \$\{arrivesBy\}\. `/);
    expect(code).toMatch(/<PincodeChecker preorder=\{isPreorder\} \/>/);
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
