/* Does the word "extra" fit? The built site at 320, 360 and 390px: the product page's panel, the bag's strip and
   saving line, the header strip and the home line. Reads only. */
const { chromium } = require("playwright");
const BASE = "http://127.0.0.1:4198"; const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const BAG = [["woven-gold-hoops", 1049, "Woven Gold Hoops"], ["prism-riviere-bracelet", 2399, "Prism Rivière Bracelet"], ["toggle-link-chain", 999, "Toggle Link Chain"]].map(([id, price, name], i) => ({ id, variantId: `gid://shopify/ProductVariant/9${i}`, lineId: `l${i}`, name, price, priceLabel: inr(price), currencyCode: "INR", image: "", quantity: 1 }));
(async () => {
  const browser = await chromium.launch(); const fails = [];
  for (const w of [320, 360, 390]) {
    const mk = async (url, seed) => { const c = await browser.newContext({ viewport: { width: w, height: 700 }, isMobile: true, hasTouch: true }); await c.route("**/*", (r) => { const u = r.request().url(); if (!/^http:\/\/127\.0\.0\.1/.test(u) && /(facebook|clarity|googletagmanager|google-analytics|doubleclick|fastrr|shiprocket|pickrr|wigzo|whatsapp|wa\.me|functions\/v1)/.test(u)) return r.abort(); if (r.request().method() !== "GET" && !/graphql/.test(u)) return r.abort(); if (/mutation/.test(r.request().postData() || "")) return r.abort(); return r.continue(); }); await c.addInitScript((d) => { try { if (d) localStorage.setItem("naira-shopify-cart", JSON.stringify(d)); localStorage.setItem("naira-promo-popup-seen", "1"); } catch {} }, seed || null); const p = await c.newPage(); await p.goto(BASE + url, { waitUntil: "load" }); return { c, p }; };
    // product page panel
    let o = await mk("/jewellery/woven-gold-hoops/");
    await o.p.waitForSelector("#root h1"); await sleep(3000);
    const pdp = await o.p.evaluate(() => { const box = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), Math.round(r.height)]; }; const lis = [...document.querySelectorAll("[data-offer-ladder] li")]; const rates = [...document.querySelectorAll(".rn-rung__rate")]; const panel = document.querySelector("[data-offer-ladder]")?.getBoundingClientRect(); return { li: lis.map(box), rates: rates.map((r) => ({ t: r.textContent, box: box(r), sw: r.scrollWidth, cw: r.clientWidth })), panel: panel ? [Math.round(panel.left), Math.round(panel.right)] : null, overflowX: document.documentElement.scrollWidth - innerWidth }; });
    const ratesOverlap = pdp.rates.length === 2 && pdp.rates[0].box[1] > pdp.rates[1].box[0];
    const out = pdp.rates.some((r) => r.box[0] < pdp.panel[0] || r.box[1] > pdp.panel[1]);
    if (ratesOverlap || out || pdp.overflowX > 0) fails.push(`${w}px product page: rates ${JSON.stringify(pdp.rates.map((r) => r.box))} panel ${pdp.panel} overflowX ${pdp.overflowX}`);
    console.log(`${w}px product panel: ${pdp.rates.map((r) => `"${r.t}" ${r.box[0]}-${r.box[1]}`).join("  |  ")}  panel ${pdp.panel}  sideways ${pdp.overflowX}`);
    await o.c.close();
    // bag
    o = await mk("/jewellery/", { items: BAG, cartId: null, checkoutUrl: null });
    await o.p.waitForSelector("#root header"); await sleep(2500);
    await o.p.locator('header [aria-label*="cart" i], header [aria-label*="bag" i]').locator("visible=true").first().click(); await o.p.waitForSelector("[data-bag-foot]"); await sleep(1800);
    const bag = await o.p.evaluate(() => { const box = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right), Math.round(r.height)]; }; const names = [...document.querySelectorAll("[data-ladder] .nc-rung__name")]; const save = document.querySelector("[data-you-save]"); const lh = save ? parseFloat(getComputedStyle(save).lineHeight) : 0; const sheet = document.querySelector("[data-bag-foot]").closest('[role="dialog"]').getBoundingClientRect(); return { names: names.map((n) => ({ t: n.textContent, box: box(n) })), save: save ? { t: save.textContent, lines: Math.round(save.getBoundingClientRect().height / lh) } : null, sheet: [Math.round(sheet.left), Math.round(sheet.right)] }; });
    const overlap = bag.names.length === 2 && bag.names[0].box[1] > bag.names[1].box[0];
    const cut = bag.names.some((n) => n.box[0] < bag.sheet[0] || n.box[1] > bag.sheet[1]);
    if (overlap || cut) fails.push(`${w}px bag strip: ${JSON.stringify(bag.names.map((n) => n.box))} sheet ${bag.sheet}`);
    console.log(`${w}px bag strip: ${bag.names.map((n) => `"${n.t}" ${n.box[0]}-${n.box[1]}`).join("  |  ")}  sheet ${bag.sheet}  · saving line "${bag.save?.t}" on ${bag.save?.lines} line(s)`);
    await o.c.close();
    // home line
    o = await mk("/");
    await o.p.waitForSelector("[data-hero-offer]"); await sleep(2500);
    const home = await o.p.evaluate(() => { const el = document.querySelector("[data-hero-offer]"); const s = document.querySelector("[data-hero-offer-short]"); const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.5; const r = el.getBoundingClientRect(); return { text: (getComputedStyle(s).display !== "none" ? s : document.querySelector("[data-hero-offer-ladder]")).textContent.trim(), lines: Math.round(r.height / lh), left: Math.round(r.left), right: Math.round(r.right), overflowX: document.documentElement.scrollWidth - innerWidth }; });
    console.log(`${w}px home line: "${home.text}" on ${home.lines} line(s), ${home.left}-${home.right}, sideways ${home.overflowX}`);
    if (home.overflowX > 0) fails.push(`${w}px home scrolls sideways ${home.overflowX}`);
    await o.c.close();
  }
  await browser.close();
  console.log(fails.length ? "FAILED\n" + fails.join("\n") : "FITS at 320, 360 and 390px");
})().catch((e) => { console.error(e); process.exit(1); });
