/* The production build, walked in a real browser before it goes to main.
   node walk.cjs <port>   (dist served by: python3 -m http.server <port> --bind 127.0.0.1)
   Reads are real (the Storefront catalogue). NOTHING is written anywhere: every Storefront mutation is refused
   before it leaves, every reporting host is aborted, and no checkout or WhatsApp link is followed. */
const { chromium } = require("playwright");
const path = require("node:path");
const PORT = process.argv[2] || "4199";
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(__dirname, "out");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const VP = {
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
  small: { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
  laptop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const fails = []; const notes = [];
const ok = (cond, what) => { if (!cond) fails.push(what); return cond; };
let refused = 0, aborted = 0;
(async () => {
  const browser = await chromium.launch({ args: ["--disable-blink-features=AutomationControlled"] });
  const open = async (vp, url, seed) => {
    const context = await browser.newContext({ ...VP[vp] });
    await context.route("**/*", (route) => {
      const req = route.request(); const u = req.url();
      const local = /^https?:\/\/127\.0\.0\.1/.test(u);
      if (!local && /(facebook\.(net|com)|clarity\.ms|googletagmanager|google-analytics|doubleclick|pickrr|fastrr|shiprocket|wigzo|cloudflareinsights|wa\.me|whatsapp)/.test(u)) { aborted++; return route.abort(); }
      if (/\/functions\/v1\//.test(u)) { aborted++; return route.abort(); }
      if (req.method() !== "GET" && /supabase\.co\/rest/.test(u)) { aborted++; return route.abort(); }
      if (req.method() === "POST" && /graphql/.test(u) && /mutation/.test(req.postData() || "")) { refused++; return route.abort(); }
      return route.continue();
    });
    if (seed) await context.addInitScript((data) => { try { localStorage.setItem("naira-shopify-cart", JSON.stringify(data)); } catch {} }, seed);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 220)));
    page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|net::ERR|ERR_FAILED|ERR_ABORTED|favicon|Failed to add Shopify item TypeError: Failed to fetch/.test(m.text())) errors.push("console: " + m.text().slice(0, 220)); });
    await page.goto(BASE + url, { waitUntil: "load" });
    return { page, context, errors };
  };
  const settle = async (page) => { await page.waitForSelector("#root h1", { timeout: 30000 }); await page.evaluate(() => document.fonts.ready); await sleep(2800); };

  // 1. product pages, three screens
  const pieces = [["woven-gold-hoops", "plain"], ["baguette-eternity-band", "ring, sizes"], ["clover-trio-edit", "a set"], ["prism-riviere-bracelet", "bestseller"], ["molten-bloom-hoops", "sold out"]];
  for (const [handle, kind] of pieces) for (const vp of ["phone", "small", "laptop"]) {
    const tag = `${handle} (${kind}) on ${vp}`;
    const o = await open(vp, `/jewellery/${handle}/`);
    try {
      await settle(o.page);
      const m = await o.page.evaluate(() => {
        const txt = (sel) => document.querySelector(sel)?.textContent?.replace(/\s+/g, " ").trim() ?? null;
        const root = document.querySelector(".nf-clean.rn-page");
        const btn = document.querySelector("#product-actions .nc-btn--ink");
        return {
          h1: txt("#root h1"), root: !!root, face: root ? getComputedStyle(root).fontFamily.split(",")[0].replace(/"/g, "") : null,
          btnBg: btn ? getComputedStyle(btn).backgroundColor : null, actions: [...document.querySelectorAll("#product-actions button")].map((b) => b.textContent.replace(/\s+/g, " ").trim()),
          ship: txt("[data-ship]"), trust: document.querySelectorAll(".rn-trust li").length, offer: !!document.querySelector("[data-offer-ladder]"), rungs: [...document.querySelectorAll("[data-offer-ladder] li")].map((li) => li.textContent.replace(/\s+/g, " ").trim()),
          price: txt("#product-price"), rating: txt('a[href="#customer-reviews"]'), overflowX: document.documentElement.scrollWidth - innerWidth, styles: document.querySelectorAll("style[data-nf-clean], style[data-nf-renew]").length,
          grain: (() => { const g = document.querySelector(".film-grain"); return g ? getComputedStyle(g).display : "absent"; })(), ld: document.querySelectorAll('script[type="application/ld+json"]').length, canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
        };
      });
      ok(m.root, `${tag}: the renewed root is missing`);
      ok(m.face === "Jost", `${tag}: face is ${m.face}`);
      ok(m.overflowX <= 0, `${tag}: the page scrolls sideways by ${m.overflowX}px`);
      ok(m.ld >= 2, `${tag}: structured data blocks ${m.ld}`);
      ok(/nairaflore\.com\/jewellery\//.test(m.canonical || ""), `${tag}: canonical ${m.canonical}`);
      ok(/4\.5\/5 ?· ?Trusted by 5,000\+ clients/.test(m.rating || ""), `${tag}: rating reads "${m.rating}"`);
      if (kind === "sold out") {
        ok(m.actions.length === 1 && m.actions[0] === "Pre-order on WhatsApp", `${tag}: buttons ${JSON.stringify(m.actions)}`);
        ok(!m.offer, `${tag}: a sold-out piece shows the offer`);
        ok(m.trust === 3, `${tag}: ${m.trust} promises`);
      } else {
        ok(m.actions.length === 2 && /^Buy now$/i.test(m.actions[0]) && /^Add to bag ?₹[\d,]+$/.test(m.actions[1]), `${tag}: buttons ${JSON.stringify(m.actions)}`);
        ok(m.btnBg === "rgb(26, 22, 20)", `${tag}: the filled button is ${m.btnBg}`);
        ok(/in stock/i.test(m.ship || ""), `${tag}: promise line "${m.ship}"`);
        ok(m.trust === 4, `${tag}: ${m.trust} promises`);
        ok(m.offer && m.rungs.length === 3 && /^Buy 210% off₹[\d,]+ each$/.test(m.rungs[0]), `${tag}: offer steps ${JSON.stringify(m.rungs)}`);
      }
      if (vp === "laptop") ok(m.grain === "none", `${tag}: film grain is ${m.grain}`);
      // the lower page arrives as it is reached
      const h = await o.page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h + 2500; y += 600) { await o.page.evaluate((yy) => window.scrollTo(0, yy), y); await sleep(200); }
      await sleep(1500);
      const low = await o.page.evaluate(() => ({ reviews: !!document.getElementById("customer-reviews"), more: !!document.getElementById("more-like-this"), bundle: !!document.querySelector("[data-bundle-add]"), cards: document.querySelectorAll('[data-slot="more"] article').length, footer: !!document.querySelector("footer") }));
      ok(low.reviews, `${tag}: the reviews never arrived`);
      ok(low.footer, `${tag}: no footer`);
      if (vp === "phone" && handle === "woven-gold-hoops") {
        await o.page.evaluate(() => window.scrollTo(0, 0)); await sleep(600);
        await o.page.screenshot({ path: path.join(OUT, "prod-hoops-phone.png") });
        notes.push(`hoops on a phone: price "${m.price}" · buttons ${JSON.stringify(m.actions)} · "${m.ship}" · bundle ${low.bundle} · more cards ${low.cards}`);
      }
      ok(o.errors.length === 0, `${tag}: ${o.errors.length} error(s) ${JSON.stringify(o.errors.slice(0, 2))}`);
    } catch (e) { fails.push(`${tag}: ${String(e).split("\n")[0].slice(0, 200)}`); }
    await o.context.close();
  }

  // 2. Add to bag on the real build: the mutation is refused before it leaves; the bag opens at the tap and says it could not add
  {
    const o = await open("phone", "/jewellery/woven-gold-hoops/");
    try {
      await settle(o.page);
      const before = refused;
      await o.page.locator('#product-actions button:has-text("Add to bag")').click();
      await o.page.waitForSelector('[role="dialog"][data-state="open"]', { timeout: 15000 });
      await sleep(3500);
      const said = await o.page.evaluate(() => [...document.querySelectorAll("[data-add-error], [data-bag-list], [data-undo]")].map((el) => el.textContent.replace(/\s+/g, " ").trim()).join(" | ").slice(0, 260) || document.querySelector(".nf-clean[role=dialog]")?.textContent?.replace(/\s+/g, " ").slice(0, 260));
      ok(refused > before, "Add to bag: no mutation was attempted (nothing to refuse)");
      notes.push(`Add to bag with Shopify writes refused: ${refused - before} mutation(s) refused; the bag says: "${(said || "").slice(0, 150)}"`);
      ok(o.errors.length === 0, `Add to bag: ${JSON.stringify(o.errors.slice(0, 2))}`);
    } catch (e) { fails.push(`Add to bag: ${String(e).split("\n")[0].slice(0, 200)}`); }
    await o.context.close();
  }

  // 3. the bag, seeded locally, opened from the product page and from two other pages (it is shared by every page)
  const items = [
    { id: "woven-gold-hoops", variantId: "gid://shopify/ProductVariant/47501786906786", lineId: "l1", name: "Woven Gold Hoops", price: 1049, priceLabel: "₹1,049", currencyCode: "INR", image: "", quantity: 1 },
    { id: "prism-riviere-bracelet", variantId: "gid://shopify/ProductVariant/12", lineId: "l2", name: "Prism Rivière Bracelet", price: 2399, priceLabel: "₹2,399", currencyCode: "INR", image: "", quantity: 1 },
  ];
  for (const [url, vp, name] of [["/jewellery/woven-gold-hoops/", "small", "product page"], ["/jewellery/", "phone", "jewellery listing"], ["/", "laptop", "home"]]) {
    const o = await open(vp, url, { items, cartId: null, checkoutUrl: null });
    try {
      await o.page.waitForSelector("#root header", { timeout: 30000 }); await sleep(3000);
      await o.page.locator('header [aria-label*="cart" i], header [aria-label*="bag" i]').locator("visible=true").first().click();
      await o.page.waitForSelector("[data-bag-foot]", { timeout: 15000 }); await sleep(2200);
      const b = await o.page.evaluate(() => {
        const t = (sel) => document.querySelector(sel)?.textContent?.replace(/\s+/g, " ").trim() ?? null;
        const sheet = document.querySelector("[data-bag-foot]")?.closest('[role="dialog"]');
        const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const x = e.getBoundingClientRect(); return [Math.round(x.top), Math.round(x.bottom)]; };
        return { total: t("[data-total]"), was: t("[data-total-was]"), save: t("[data-you-save]"), terms: t("[data-bag-terms]"), returns: t("[data-returns]"), addon: t("[data-bag-addon]"), addonBox: r("[data-bag-addon]"), checkout: r("[data-checkout]"), vh: innerHeight,
          face: sheet ? getComputedStyle(sheet).fontFamily.split(",")[0].replace(/"/g, "") : null, lines: document.querySelectorAll("[data-line]").length, styles: sheet ? sheet.querySelectorAll("style").length : 0, stops: document.querySelectorAll(".rn-bagsteps i[data-reached]").length };
      });
      ok(b.total === "₹3,103", `bag on ${name}: total ${b.total}`);
      ok(/^You save ₹[\d,]+/.test(b.save || ""), `bag on ${name}: saving line "${b.save}"`);
      ok(b.returns === "7-day returns policy", `bag on ${name}: returns link "${b.returns}"`);
      ok(b.lines === 2 && b.styles === 2 && b.face === "Jost", `bag on ${name}: lines ${b.lines}, styles ${b.styles}, face ${b.face}`);
      ok(b.stops === 1, `bag on ${name}: ${b.stops} reached stop(s) at two pieces`);
      ok(b.checkout && b.checkout[1] <= b.vh, `bag on ${name}: Checkout ends at ${b.checkout && b.checkout[1]} of ${b.vh}`);
      ok(!b.addonBox || (b.addonBox[0] >= 0 && b.addonBox[1] <= b.vh), `bag on ${name}: the suggestion is cut (${b.addonBox})`);
      if (name === "product page") { await o.page.screenshot({ path: path.join(OUT, "prod-bag-small.png") }); notes.push(`bag on a 360x640 phone: total ${b.total} (${b.was}) · "${b.save}" · suggestion "${(b.addon || "none").slice(0, 80)}"`); }
      // on its own page the hoops are in the bag: the page must say so
      if (name === "product page") {
        await o.page.keyboard.press("Escape"); await sleep(900);
        const s = await o.page.evaluate(() => ({ note: document.querySelector("[data-offer-note]")?.textContent, btn: [...document.querySelectorAll("#product-actions button")].pop()?.textContent?.trim() }));
        ok(s.btn === "View bag" && /^This piece is in your bag\./.test(s.note || ""), `in-bag state: button "${s.btn}", note "${s.note}"`);
        notes.push(`a piece already in the bag: "${s.note}" · button "${s.btn}"`);
      }
      ok(o.errors.length === 0, `bag on ${name}: ${JSON.stringify(o.errors.slice(0, 2))}`);
    } catch (e) { fails.push(`bag on ${name}: ${String(e).split("\n")[0].slice(0, 200)}`); }
    await o.context.close();
  }

  // 4. an ad's link still hops to the jewellery page with its query kept
  {
    const o = await open("phone", "/products/woven-gold-hoops/?utm_source=test&fbclid=abc");
    try {
      await settle(o.page);
      const at = await o.page.evaluate(() => location.pathname + location.search);
      ok(/^\/jewellery\/woven-gold-hoops\/?\?utm_source=test&fbclid=abc$/.test(at), `ad link landed on ${at}`);
      notes.push(`/products/woven-gold-hoops?utm… lands on ${at}`);
    } catch (e) { fails.push(`ad link: ${String(e).split("\n")[0].slice(0, 200)}`); }
    await o.context.close();
  }
  await browser.close();
  console.log(notes.map((n) => "  · " + n).join("\n"));
  console.log(`\nwrites refused: ${refused} · reporting requests aborted: ${aborted}`);
  console.log(fails.length ? `\nFAILED (${fails.length})\n` + fails.map((f) => "  x " + f).join("\n") : "\nPASSED: 15 product pages, add to bag, the bag on three pages, the ad-link hop");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
