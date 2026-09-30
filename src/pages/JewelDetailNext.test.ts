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

  it("shows the buy bar whenever Add to cart is not fully on screen, never over the price and facts", () => {
    const effect = code.match(/const check = \(\) => \{[\s\S]*?setStickyBarVisible\([^)]*\);/)![0];
    expect(effect).toMatch(/stickyBarRef/);
    expect(effect).toMatch(/getElementById\("product-facts"\)/);
    expect(effect).toMatch(/const notFullyShown = r\.bottom < 0 \|\| r\.bottom > window\.innerHeight/);
    expect(effect).toMatch(/setStickyBarVisible\(notFullyShown && priceClear\)/);
    expect(code).toMatch(/new ResizeObserver\(check\)/);
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

  it("puts price, then buy facts, then size, then Add to cart", () => {
    const price = code.indexOf('id="product-price"');
    const facts = code.indexOf('id="product-facts"');
    const size = code.indexOf('aria-label="Ring size, US"');
    const actions = code.indexOf('id="product-actions"');
    expect(price).toBeGreaterThan(-1);
    expect(facts).toBeGreaterThan(price);
    expect(size).toBeGreaterThan(facts);
    expect(actions).toBeGreaterThan(size);
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

  it("keeps what the pre-built page needs: embedded piece, product, breadcrumb and FAQ data", () => {
    expect(code).toMatch(/id="nf-piece"/);
    expect(code).toMatch(/"@type": "BreadcrumbList"/);
    expect(code).toMatch(/"@type": "FAQPage"/);
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
});
