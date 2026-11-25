/* The LIVE site after a Publish: does it show the corrected offer (Buy 2 = extra 10%, Buy 3 = extra 20%, no Buy 4)
   and total the bag to the rupee? Reads only: the bag is filled in this browser's own storage (no Shopify cart),
   no write leaves, no tracking request leaves, no checkout or WhatsApp link is followed. */
const { chromium } = require("playwright");
const path = require("node:path"); const fs = require("node:fs");
const BASE = process.argv[2] || "https://nairaflore.com";
const OUT = path.join(__dirname, "live"); fs.mkdirSync(OUT, { recursive: true });
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
const fails = []; const notes = []; const ok = (c, w) => { if (!c) fails.push(w); return c; };
(async () => {
  const browser = await chromium.launch({ args: ["--disable-blink-features=AutomationControlled"] });
  let refused = 0, aborted = 0;
  const open = async (url, seed) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await context.route("**/*", (route) => {
      const req = route.request(); const u = req.url();
      if (!u.startsWith(BASE) && /(facebook\.(net|com)|clarity\.ms|googletagmanager|google-analytics|doubleclick|pickrr|fastrr|shiprocket|wigzo|cloudflareinsights|wa\.me|whatsapp)/.test(u)) { aborted++; return route.abort(); }
      if (/\/functions\/v1\//.test(u)) { aborted++; return route.abort(); }
      if (req.method() !== "GET" && /supabase\.co\/rest/.test(u)) { aborted++; return route.abort(); }
      if (req.method() === "POST" && /graphql/.test(u) && /mutation/.test(req.postData() || "")) { refused++; return route.abort(); }
      if (req.method() !== "GET" && !/graphql/.test(u)) { aborted++; return route.abort(); }
      return route.continue();
    });
    await context.addInitScript((data) => { try { if (data) localStorage.setItem("naira-shopify-cart", JSON.stringify(data)); localStorage.setItem("naira-promo-popup-seen", "1"); } catch {} }, seed || null);
    const page = await context.newPage();
    await page.goto(BASE + url + (url.includes("?") ? "&" : "?") + "t=" + Date.now(), { waitUntil: "load", timeout: 60000 });
    return { page, context };
  };
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  // the product page
  let o = await open("/jewellery/woven-gold-hoops/");
  await o.page.waitForSelector("#root h1", { timeout: 45000 }); await sleep(4500);
  const pdp = await o.page.evaluate(() => { const t = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim(); return { strip: t(document.querySelector("[data-announcement] span")), rungs: [...document.querySelectorAll("[data-offer-ladder] li")].map((li) => [...li.children].map((c) => t(c)).join(" | ")), panel: t(document.querySelector("[data-offer-ladder]")) }; });
  ok(/^BUY 2 GET EXTRA 10% OFF · BUY 3 GET EXTRA 20% OFF/.test(pdp.strip), `strip: "${pdp.strip.slice(0, 80)}"`);
  ok(pdp.rungs.length === 2 && pdp.rungs[0] === "Buy 2 | Extra 10% off | ₹944 each" && pdp.rungs[1] === "Buy 3 | Extra 20% off | ₹839 each", `product page steps: ${JSON.stringify(pdp.rungs)}`);
  ok(!/Buy 4|30% off|15% off/i.test(pdp.panel), `product page panel still names an old step: ${pdp.panel.slice(0, 120)}`);
  notes.push(`strip: "${pdp.strip}"`); notes.push(`product page: ${JSON.stringify(pdp.rungs)}`);
  await o.page.evaluate(() => document.querySelector("[data-offer-ladder]")?.scrollIntoView({ block: "center" })); await sleep(1200);
  await o.page.screenshot({ path: path.join(OUT, "live-product-page-offer.png") });
  await o.context.close();
  // the home line
  o = await open("/");
  await o.page.waitForSelector("[data-hero-offer]", { timeout: 45000 }); await sleep(2500);
  const home = clean(await o.page.evaluate(() => { const s = document.querySelector("[data-hero-offer-short]"); return (getComputedStyle(s).display !== "none" ? s : document.querySelector("[data-hero-offer-ladder]")).textContent; }));
  ok(home === "Up to extra 20% off when you buy more", `home line: "${home}"`); notes.push(`home: "${home}"`);
  await o.context.close();
  // the bag at two, three and four pieces
  for (const n of [2, 3, 4]) {
    const items = PIECES.slice(0, n); const sum = items.reduce((a, c) => a + c.price, 0); const want = inr(sum * (1 - RATE[n]));
    o = await open("/jewellery/", { items, cartId: null, checkoutUrl: null });
    await o.page.waitForSelector("#root header", { timeout: 45000 }); await sleep(3500);
    await o.page.locator('header [aria-label*="cart" i], header [aria-label*="bag" i]').locator("visible=true").first().click();
    await o.page.waitForSelector("[data-bag-foot]", { timeout: 20000 }); await sleep(3000);
    const b = await o.page.evaluate(() => { const t = (s) => (document.querySelector(s)?.textContent || "").replace(/\s+/g, " ").trim(); return { total: t("[data-total]"), save: t("[data-you-save]"), ladder: [...document.querySelectorAll("[data-ladder] .nc-rung__name")].map((x) => x.textContent.replace(/\s+/g, " ").trim()) }; });
    ok(b.total === want, `bag of ${n}: total ${b.total}, expected ${want}`);
    ok(JSON.stringify(b.ladder) === JSON.stringify(["Buy 2 · extra 10% off", "Buy 3 · extra 20% off"]), `bag of ${n}: strip ${JSON.stringify(b.ladder)}`);
    ok(new RegExp(`extra ${RATE[n] * 100}% off ${n} pieces$`).test(b.save), `bag of ${n}: saving line "${b.save}"`);
    notes.push(`bag of ${n}: ${b.total} · "${b.save}"`);
    await o.page.screenshot({ path: path.join(OUT, `live-bag-${n}-pieces.png`) });
    await o.context.close();
  }
  await browser.close();
  console.log(notes.map((x) => "  · " + x).join("\n"));
  console.log(`writes refused: ${refused} · tracking requests stopped: ${aborted}`);
  console.log(fails.length ? "NOT RIGHT YET\n" + fails.map((f) => "  x " + f).join("\n") : "LIVE AND CORRECT: strip, product page, home line, and the bag at 2, 3 and 4 pieces");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
