/* Three versions of the store, same piece, same phone: pictures and plain measurements for a CRO comparison.
   Store 1 = the site as built on 16 Nov (what was live a week ago), Store 2 = nairaflore.com as it is live now,
   Store 3 = the build with the two-step "extra" offer. Reads only: no write leaves, no tracking request leaves. */
const { chromium } = require("playwright");
const path = require("node:path"); const fs = require("node:fs");
const OUT = path.join(__dirname, "out"); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STORES = [
  { key: "store1", name: "Store 1 · a week ago", base: "http://127.0.0.1:4301" },
  { key: "store2", name: "Store 2 · live today (as it went live 3 hours ago)", base: "http://127.0.0.1:4302" },
  { key: "store3", name: "Store 3 · new offer", base: "http://127.0.0.1:4198" },
];
const img = (file, v) => `https://cdn.shopify.com/s/files/1/0680/9606/5698/files/${file}?v=${v}`;
const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const BAG = [
  { id: "woven-gold-hoops", variantId: "gid://shopify/ProductVariant/47501786906786", name: "Woven Gold Hoops", price: 1049, image: img("woven-gold-hoops-2.jpg", 1787277440) },
  { id: "prism-riviere-bracelet", variantId: "gid://shopify/ProductVariant/47501788348578", name: "Prism Rivière Bracelet", price: 2399, image: img("prism-riviere-bracelet-1.jpg", 1787277602) },
  { id: "toggle-link-chain", variantId: "gid://shopify/ProductVariant/47501786742946", name: "Toggle Link Chain", price: 999, image: img("toggle-link-chain-1.jpg", 1787277342) },
].map((p, i) => ({ ...p, lineId: `l${i + 1}`, priceLabel: inr(p.price), currencyCode: "INR", quantity: 1 }));
(async () => {
  const browser = await chromium.launch({ args: ["--disable-blink-features=AutomationControlled"] });
  const results = {};
  for (const store of STORES) {
    const R = (results[store.key] = { name: store.name });
    const open = async (vp, url, seed) => {
      const context = await browser.newContext({ viewport: vp, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
      const net = { requests: 0, img: 0, js: 0, bytes: 0 };
      await context.route("**/*", (route) => {
        const req = route.request(); const u = req.url();
        const own = u.startsWith(store.base) || /^https?:\/\/127\.0\.0\.1/.test(u);
        if (!own && /(facebook\.(net|com)|clarity\.ms|googletagmanager|google-analytics|doubleclick|pickrr|fastrr|shiprocket|wigzo|cloudflareinsights|wa\.me|whatsapp)/.test(u)) return route.abort();
        if (/\/functions\/v1\//.test(u)) return route.abort();
        if (req.method() !== "GET" && /supabase\.co\/rest/.test(u)) return route.abort();
        if (req.method() === "POST" && /graphql/.test(u) && /mutation/.test(req.postData() || "")) return route.abort();
        if (req.method() !== "GET" && !/graphql/.test(u)) return route.abort();
        net.requests++; const t = req.resourceType(); if (t === "image") net.img++; if (t === "script") net.js++;
        return route.continue();
      });
      await context.addInitScript((data) => { try { if (data) localStorage.setItem("naira-shopify-cart", JSON.stringify(data)); localStorage.setItem("naira-promo-popup-seen", "1"); } catch {} }, seed || null);
      const page = await context.newPage();
      page.on("response", async (res) => { try { const len = Number(res.headers()["content-length"] || 0); net.bytes += len; } catch {} });
      await page.goto(store.base + url, { waitUntil: "load", timeout: 60000 });
      return { page, context, net };
    };
    try {
      // the product page on a 390x844 phone
      const o = await open({ width: 390, height: 844 }, "/jewellery/woven-gold-hoops/");
      await o.page.waitForSelector("#root h1", { timeout: 45000 }); await o.page.evaluate(() => document.fonts.ready); await sleep(4500);
      // close any popup that covers the page (a first-visit offer popup)
      for (const sel of ['[role="dialog"] button[aria-label*="close" i]', 'button[aria-label="Close"]']) { const b = o.page.locator(sel).first(); if (await b.count() && await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); await sleep(600); } }
      await o.page.screenshot({ path: path.join(OUT, `${store.key}-1-first-screen.png`) });
      R.first = await o.page.evaluate(() => {
        const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0.05; };
        const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
        const all = [...document.querySelectorAll("button, a")].filter(vis);
        const find = (re) => all.filter((b) => re.test(clean(b.textContent))).map((b) => { const r = b.getBoundingClientRect(); return { text: clean(b.textContent).slice(0, 40), top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY), h: Math.round(r.height), w: Math.round(r.width), fixed: (() => { let e = b; while (e && e !== document.body) { const p = getComputedStyle(e).position; if (p === "fixed" || p === "sticky") return p; e = e.parentElement; } return ""; })(), bg: getComputedStyle(b).backgroundColor, color: getComputedStyle(b).color }; });
        const h1 = document.querySelector("#root h1");
        // every text-bearing element whose box starts in the first screen
        const texts = [...document.querySelectorAll("#root *")].filter((el) => vis(el) && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1)).map((el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { top: r.top, size: parseFloat(cs.fontSize), fam: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), text: clean(el.textContent).slice(0, 50), color: cs.color, words: clean([...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ")).split(" ").filter(Boolean).length }; });
        const inFirst = texts.filter((t) => t.top >= 0 && t.top < innerHeight);
        const sizes = {}; inFirst.forEach((t) => { sizes[t.size] = (sizes[t.size] || 0) + 1; });
        const fams = {}; inFirst.forEach((t) => { fams[t.fam] = (fams[t.fam] || 0) + 1; });
        const colors = new Set(inFirst.map((t) => t.color));
        const imgs = [...document.querySelectorAll("#root img")].filter(vis).filter((i) => { const r = i.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && r.width > 60; });
        const hero = imgs.sort((a, b) => b.getBoundingClientRect().width * b.getBoundingClientRect().height - a.getBoundingClientRect().width * a.getBoundingClientRect().height)[0];
        const hr = hero ? hero.getBoundingClientRect() : null;
        const price = texts.find((t) => /^₹[\d,]+$/.test(t.text) && t.size >= 15);
        return {
          h1: clean(h1?.textContent).slice(0, 60), h1Top: h1 ? Math.round(h1.getBoundingClientRect().top + scrollY) : null, h1Size: h1 ? getComputedStyle(h1).fontSize : null, h1Font: h1 ? getComputedStyle(h1).fontFamily.split(",")[0] : null,
          priceTop: price ? Math.round(price.top + scrollY) : null, priceSize: price ? price.size : null,
          addToBag: find(/^add to (cart|bag)/i), buyNow: find(/^buy now/i), preorder: find(/pre-?order/i).slice(0, 1),
          photo: hr ? { top: Math.round(hr.top), h: Math.round(hr.height), w: Math.round(hr.width) } : null,
          firstScreen: { elementsWithText: inFirst.length, words: inFirst.reduce((a, t) => a + t.words, 0), fontSizes: Object.keys(sizes).map(Number).sort((a, b) => a - b), smallestText: Math.min(...inFirst.map((t) => t.size)), under12px: inFirst.filter((t) => t.size < 12).length, families: fams, colours: colors.size },
          pageHeight: document.documentElement.scrollHeight, screens: +(document.documentElement.scrollHeight / innerHeight).toFixed(1), overflowX: document.documentElement.scrollWidth - innerWidth,
          strip: clean(document.querySelector("[data-announcement]")?.textContent).slice(0, 90),
        };
      });
      // the buying area: centre the main Add button
      const add = o.page.locator('button:has-text("Add to bag"), button:has-text("Add to cart"), button:has-text("ADD TO CART"), button:has-text("Add to Cart")').locator("visible=true").first();
      if (await add.count()) { await add.evaluate((el) => el.scrollIntoView({ block: "center" })); await sleep(1500); }
      await o.page.screenshot({ path: path.join(OUT, `${store.key}-2-buy-area.png`) });
      // the offer block, wherever this version keeps it
      const offer = o.page.locator('[data-offer-ladder], [data-offer-note], [data-pdp-offer]').locator("visible=true").first();
      if (await offer.count()) { await offer.evaluate((el) => el.scrollIntoView({ block: "center" })); await sleep(1200); R.offerText = (await offer.evaluate((el) => el.textContent.replace(/\s+/g, " ").trim())).slice(0, 220); }
      await o.page.screenshot({ path: path.join(OUT, `${store.key}-3-offer.png`) });
      // the whole page, walked, so its sections can be listed
      const h = await o.page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h + 2400; y += 700) { await o.page.evaluate((yy) => window.scrollTo(0, yy), y); await sleep(170); }
      await sleep(1200);
      R.sections = await o.page.evaluate(() => [...document.querySelectorAll("#root h2, #root h3, #root summary, #root [role=button][aria-expanded]")].filter((el) => el.getBoundingClientRect().width > 0).map((el) => `${Math.round(el.getBoundingClientRect().top + scrollY)}: ${el.textContent.replace(/\s+/g, " ").trim().slice(0, 44)}`).slice(0, 40));
      R.fullHeight = await o.page.evaluate(() => document.documentElement.scrollHeight);
      R.net = { ...o.net, kb: Math.round(o.net.bytes / 1024) };
      await o.context.close();

      // the same first screen on a short phone
      const s = await open({ width: 360, height: 640 }, "/jewellery/woven-gold-hoops/");
      await s.page.waitForSelector("#root h1", { timeout: 45000 }); await sleep(4000);
      R.small = await s.page.evaluate(() => { const clean = (t) => (t || "").replace(/\s+/g, " ").trim(); const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).display !== "none" && getComputedStyle(el).visibility !== "hidden"; }; const b = [...document.querySelectorAll("button, a")].filter(vis).filter((x) => /^(add to (cart|bag)|buy now)/i.test(clean(x.textContent))).map((x) => { const r = x.getBoundingClientRect(); return { text: clean(x.textContent).slice(0, 30), top: Math.round(r.top), bottom: Math.round(r.bottom) }; }); return { buttons: b, vh: innerHeight, overflowX: document.documentElement.scrollWidth - innerWidth }; });
      await s.page.screenshot({ path: path.join(OUT, `${store.key}-5-short-phone.png`) });
      await s.context.close();

      // the bag with three pieces
      const sum = BAG.reduce((a, c) => a + c.price, 0);
      const b = await open({ width: 390, height: 844 }, "/jewellery/", { items: BAG, cartId: null, checkoutUrl: null });
      await b.page.waitForSelector("#root header", { timeout: 45000 }); await sleep(3500);
      await b.page.locator('header [aria-label*="cart" i], header [aria-label*="bag" i]').locator("visible=true").first().click();
      await sleep(4000);
      R.bag = await b.page.evaluate(() => { const clean = (t) => (t || "").replace(/\s+/g, " ").trim(); const d = document.querySelector('[role="dialog"]'); const t = (sel) => clean(document.querySelector(sel)?.textContent); const co = [...document.querySelectorAll("button, a")].find((x) => /checkout/i.test(x.textContent) && x.getBoundingClientRect().height > 0); const r = co?.getBoundingClientRect(); return { open: !!d, total: t("[data-total]"), save: t("[data-you-save]"), ladder: t("[data-ladder]").slice(0, 120), text: clean(d?.textContent).slice(0, 900), checkout: r ? { text: clean(co.textContent).slice(0, 40), top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) } : null, vh: innerHeight }; });
      R.bag.subtotal = sum;
      await b.page.screenshot({ path: path.join(OUT, `${store.key}-4-bag.png`) });
      await b.context.close();
    } catch (e) { R.error = String(e).split("\n")[0].slice(0, 240); }
    console.log(`${store.name}: ${R.error ? "ERROR " + R.error : "ok"}`);
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, "measurements.json"), JSON.stringify(results, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
