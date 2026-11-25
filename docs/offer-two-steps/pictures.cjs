/* Owner-facing pictures of the built site with the two-step offer: the bag at 2, 3 and 4 pieces (real photos and
   prices) and the product page's panel. Same guards as walk.cjs: no write leaves, no tracking request leaves. */
const { chromium } = require("playwright");
const path = require("node:path");
const BASE = `http://127.0.0.1:${process.argv[2] || "4198"}`;
const OUT = path.join(__dirname, "pictures");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const img = (file, v) => `https://cdn.shopify.com/s/files/1/0680/9606/5698/files/${file}?v=${v}`;
const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const PIECES = [
  { id: "woven-gold-hoops", variantId: "gid://shopify/ProductVariant/47501786906786", name: "Woven Gold Hoops", price: 1049, image: img("woven-gold-hoops-2.jpg", 1787277440) },
  { id: "prism-riviere-bracelet", variantId: "gid://shopify/ProductVariant/47501788348578", name: "Prism Rivière Bracelet", price: 2399, image: img("prism-riviere-bracelet-1.jpg", 1787277602) },
  { id: "toggle-link-chain", variantId: "gid://shopify/ProductVariant/47501786742946", name: "Toggle Link Chain", price: 999, image: img("toggle-link-chain-1.jpg", 1787277342) },
  { id: "brushed-gold-huggies", variantId: "gid://shopify/ProductVariant/47501787594914", name: "Brushed Gold Huggies", price: 699, image: img("brushed-gold-huggies-1.jpg", 1787277497) },
].map((p, i) => ({ ...p, lineId: `l${i + 1}`, priceLabel: inr(p.price), currencyCode: "INR", quantity: 1 }));
const RATE = [0, 0, 0.1, 0.2, 0.2];
(async () => {
  require("node:fs").mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ["--disable-blink-features=AutomationControlled"] });
  let refused = 0;
  const open = async (url, seed) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await context.route("**/*", (route) => {
      const req = route.request(); const u = req.url();
      const local = /^https?:\/\/127\.0\.0\.1/.test(u);
      if (!local && /(facebook\.(net|com)|clarity\.ms|googletagmanager|google-analytics|doubleclick|pickrr|fastrr|shiprocket|wigzo|cloudflareinsights|wa\.me|whatsapp)/.test(u)) return route.abort();
      if (/\/functions\/v1\//.test(u)) return route.abort();
      if (req.method() !== "GET" && /supabase\.co\/rest/.test(u)) return route.abort();
      if (req.method() === "POST" && /graphql/.test(u) && /mutation/.test(req.postData() || "")) { refused++; return route.abort(); }
      return route.continue();
    });
    await context.addInitScript((data) => { try { if (data) localStorage.setItem("naira-shopify-cart", JSON.stringify(data)); localStorage.setItem("naira-promo-popup-seen", "1"); } catch {} }, seed || null);
    const page = await context.newPage();
    await page.goto(BASE + url, { waitUntil: "load" });
    return { page, context };
  };
  for (const n of [2, 3, 4]) {
    const items = PIECES.slice(0, n); const sum = items.reduce((a, c) => a + c.price, 0);
    const o = await open("/jewellery/", { items, cartId: null, checkoutUrl: null });
    await o.page.waitForSelector("#root header", { timeout: 30000 }); await sleep(3000);
    await o.page.locator('header [aria-label*="cart" i], header [aria-label*="bag" i]').locator("visible=true").first().click();
    await o.page.waitForSelector("[data-bag-foot]", { timeout: 15000 }); await sleep(3500);
    const b = await o.page.evaluate(() => { const t = (s) => (document.querySelector(s)?.textContent || "").replace(/\s+/g, " ").trim(); return { total: t("[data-total]"), save: t("[data-you-save]"), photos: [...document.querySelectorAll("[data-line] img")].map((i) => i.complete && i.naturalWidth > 0) }; });
    const want = inr(sum * (1 - RATE[n]));
    console.log(`bag of ${n}: total ${b.total} (expected ${want}, ${inr(sum)} at ${RATE[n] * 100}%) · "${b.save}" · photos loaded ${JSON.stringify(b.photos)}`);
    if (b.total !== want) process.exitCode = 1;
    await o.page.screenshot({ path: path.join(OUT, `bag-${n}-pieces.png`) });
    await o.context.close();
  }
  const o = await open("/jewellery/woven-gold-hoops/");
  await o.page.waitForSelector("#root h1", { timeout: 30000 }); await sleep(3000);
  await o.page.evaluate(() => document.querySelector("[data-offer-ladder]")?.scrollIntoView({ block: "center" })); await sleep(1500);
  await o.page.screenshot({ path: path.join(OUT, "product-page-offer.png") });
  await o.page.evaluate(() => window.scrollTo(0, 0)); await sleep(800);
  await o.page.screenshot({ path: path.join(OUT, "product-page-top.png") });
  await o.context.close();
  await browser.close();
  console.log(`writes refused: ${refused}`);
})().catch((e) => { console.error(e); process.exit(1); });
