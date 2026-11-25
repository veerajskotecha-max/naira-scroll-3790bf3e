/* The two-step offer (Buy 2 = 10%, Buy 3 = 15%, no Buy 4) on the production build, in a real browser.
   node walk.cjs <port>   (dist served by: python3 -m http.server <port> --bind 127.0.0.1)
   Reads are real (the Storefront catalogue). NOTHING is written anywhere: every Storefront mutation is refused
   before it leaves, every reporting host is aborted, and no checkout or WhatsApp link is followed.
   The rates below are typed here, not read from the site's code: this is the owner's offer, checked from outside. */
const { chromium } = require("playwright");
const path = require("node:path");
const PORT = process.argv[2] || "4198";
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(__dirname, "out");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const VP = {
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  small: { viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
  laptop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
const RATE = [0, 0, 0.1, 0.15, 0.15, 0.15];           // by number of pieces
const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const fails = []; const notes = [];
const ok = (cond, what) => { if (!cond) fails.push(what); return cond; };
let refused = 0, aborted = 0;
const PIECES = [
  { id: "woven-gold-hoops", variantId: "gid://shopify/ProductVariant/47501786906786", name: "Woven Gold Hoops", price: 1049 },
  { id: "prism-riviere-bracelet", variantId: "gid://shopify/ProductVariant/12", name: "Prism Rivière Bracelet", price: 2399 },
  { id: "toggle-link-chain", variantId: "gid://shopify/ProductVariant/13", name: "Toggle Link Chain", price: 999 },
  { id: "brushed-gold-huggies", variantId: "gid://shopify/ProductVariant/14", name: "Brushed Gold Huggies", price: 999 },
  { id: "tile-stone-bangle", variantId: "gid://shopify/ProductVariant/15", name: "Tile Stone Bangle", price: 1499 },
].map((p, i) => ({ ...p, lineId: `l${i + 1}`, priceLabel: inr(p.price), currencyCode: "INR", image: "", quantity: 1 }));

(async () => {
  const browser = await chromium.launch({ args: ["--disable-blink-features=AutomationControlled"] });
  const open = async (vp, url, seed, promo) => {
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
    await context.addInitScript(([data, code]) => {
      try {
        if (data) localStorage.setItem("naira-shopify-cart", JSON.stringify(data));
        if (code) localStorage.setItem("naira-promo-code", code);
        localStorage.setItem("naira-promo-popup-seen", "1");
      } catch {}
    }, [seed || null, promo || null]);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 220)));
    page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|net::ERR|ERR_FAILED|ERR_ABORTED|favicon|Failed to add Shopify item TypeError: Failed to fetch/.test(m.text())) errors.push("console: " + m.text().slice(0, 220)); });
    await page.goto(BASE + url, { waitUntil: "load" });
    return { page, context, errors };
  };
  const settle = async (page) => { await page.waitForSelector("#root h1", { timeout: 30000 }); await page.evaluate(() => document.fonts.ready); await sleep(2800); };
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  const OLD = /Buy 4|BUY 4|\b20% off\b|\b30% off\b|GET 20%|GET 30%|fourth piece|up to 30%|up to 20%/i;

  // 1. the product page, empty bag: the panel, the strip, the bundle
  for (const vp of ["phone", "small", "laptop"]) {
    const tag = `product page on ${vp}`;
    const o = await open(vp, "/jewellery/woven-gold-hoops/");
    try {
      await settle(o.page);
      const h = await o.page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h + 2500; y += 600) { await o.page.evaluate((yy) => window.scrollTo(0, yy), y); await sleep(180); }
      await sleep(1200);
      const m = await o.page.evaluate(() => {
        const t = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
        return {
          rungs: [...document.querySelectorAll("[data-offer-ladder] li")].map((li) => [...li.children].map((c) => t(c)).join(" | ")),
          panel: t(document.querySelector("[data-offer-ladder]")),
          stops: [...document.querySelectorAll("[data-offer-ladder] .rn-steps__stop")].map((s) => s.style.left),
          strip: t(document.querySelector("[data-announcement] span")),
          stripAll: t(document.querySelector("[data-announcement]")),
          bundleLabel: t(document.querySelector("[data-bundle-label]")), nudge: t(document.querySelector("[data-bundle-nudge]")), bundleTotal: t(document.querySelector("[data-bundle-total]")), bundleBtn: t(document.querySelector("[data-bundle-add]")),
          overflowX: document.documentElement.scrollWidth - innerWidth,
          rungBoxes: [...document.querySelectorAll("[data-offer-ladder] li")].map((li) => { const r = li.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.right)]; }),
        };
      });
      ok(m.rungs.length === 2, `${tag}: ${m.rungs.length} offer steps ${JSON.stringify(m.rungs)}`);
      ok(m.rungs[0] === "Buy 2 | 10% off | ₹944 each", `${tag}: first step "${m.rungs[0]}"`);
      ok(m.rungs[1] === "Buy 3 | 15% off | ₹892 each", `${tag}: second step "${m.rungs[1]}"`);
      ok(!OLD.test(m.panel), `${tag}: the panel still names an old step: "${m.panel.slice(0, 160)}"`);
      ok(m.stops.join(",") === "25%,75%", `${tag}: stops at ${m.stops.join(",")}`);
      ok(/^BUY 2 GET 10% OFF · BUY 3 GET 15% OFF/.test(m.strip), `${tag}: the strip leads with "${m.strip.slice(0, 80)}"`);
      ok(!OLD.test(m.stripAll), `${tag}: the strip still names an old step`);
      ok(m.overflowX <= 0, `${tag}: the page scrolls sideways by ${m.overflowX}px`);
      ok(m.rungBoxes.length === 2 && m.rungBoxes[0][1] <= m.rungBoxes[1][0] + 1, `${tag}: the two steps overlap ${JSON.stringify(m.rungBoxes)}`);
      if (m.bundleLabel) {
        ok(m.bundleLabel === "2 pieces · 10% off", `${tag}: bundle label "${m.bundleLabel}"`);
        ok(m.nudge === "" || m.nudge === "Tick one more for 15% off all three.", `${tag}: bundle nudge "${m.nudge}"`);
      }
      if (vp === "phone") {
        notes.push(`product page, empty bag: steps ${JSON.stringify(m.rungs)} · strip "${m.strip}" · bundle "${m.bundleLabel}" / "${m.nudge}" / ${m.bundleTotal} / button "${m.bundleBtn}"`);
        await o.page.evaluate(() => document.querySelector("[data-offer-ladder]")?.scrollIntoView({ block: "center" })); await sleep(900);
        await o.page.screenshot({ path: path.join(OUT, "pdp-offer-phone.png") });
        // tick a third piece in the bundle: the label and total follow at 15%
        const boxes = o.page.locator("[data-bundle-piece] input[type=checkbox]");
        if (await boxes.count() >= 2) {
          await o.page.evaluate(() => document.querySelector("[data-bundle-add]")?.scrollIntoView({ block: "center" })); await sleep(500);
          await boxes.nth(1).check({ force: true }); await sleep(600);
          const b = await o.page.evaluate(() => { const t = (s) => (document.querySelector(s)?.textContent || "").replace(/\s+/g, " ").trim(); return { label: t("[data-bundle-label]"), total: t("[data-bundle-total]"), btn: t("[data-bundle-add]"), nudge: t("[data-bundle-nudge]"), prices: [...document.querySelectorAll(".rn-bundle li")].filter((li) => li.querySelector("[data-fixed], input:checked")).map((li) => Number((li.querySelector(".rn-bundle__price")?.textContent || "").replace(/[^\d]/g, ""))) }; });
          const sum = b.prices.reduce((a, c) => a + c, 0);
          ok(b.label === "3 pieces · 15% off", `${tag}: three ticked, label "${b.label}"`);
          ok(b.prices.length === 3 && b.btn === `Add 3 pieces${inr(sum * 0.85)}`, `${tag}: three ticked (${b.prices.join("+")}=${sum}), button "${b.btn}", expected ${inr(sum * 0.85)}`);
          ok(!OLD.test(b.label + b.total + b.nudge), `${tag}: the bundle names an old step`);
          notes.push(`bundle with three ticked: "${b.label}" · ${b.total} · button "${b.btn}" (${b.prices.join(" + ")} = ${inr(sum)}, at 15% ${inr(sum * 0.85)})`);
          await o.page.screenshot({ path: path.join(OUT, "pdp-bundle-three-phone.png") });
        }
      }
      ok(o.errors.length === 0, `${tag}: ${JSON.stringify(o.errors.slice(0, 2))}`);
    } catch (e) { fails.push(`${tag}: ${String(e).split("\n")[0].slice(0, 200)}`); }
    await o.context.close();
  }

  // 2. the home page: the strip and the line under the headline
  for (const vp of ["phone", "laptop"]) {
    const o = await open(vp, "/");
    try {
      await o.page.waitForSelector("[data-hero-offer]", { timeout: 30000 }); await sleep(2500);
      const m = await o.page.evaluate(() => { const vis = (el) => el && getComputedStyle(el).display !== "none"; const t = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim(); const s = document.querySelector("[data-hero-offer-short]"), l = document.querySelector("[data-hero-offer-ladder]"); return { shown: vis(s) ? t(s) : t(l), strip: t(document.querySelector("[data-announcement] span")) }; });
      ok(m.shown === (vp === "phone" ? "Up to 15% off when you buy more" : "Buy 2, 10% off · Buy 3, 15% off"), `home on ${vp}: the line under the headline reads "${m.shown}"`);
      ok(/^BUY 2 GET 10% OFF · BUY 3 GET 15% OFF/.test(m.strip), `home on ${vp}: strip "${m.strip.slice(0, 70)}"`);
      notes.push(`home on ${vp}: "${m.shown}"`);
    } catch (e) { fails.push(`home on ${vp}: ${String(e).split("\n")[0].slice(0, 200)}`); }
    await o.context.close();
  }

  // 3. the bag at one to five pieces, opened from the jewellery listing (so no product page sits behind it)
  for (let n = 1; n <= 5; n++) for (const vp of n === 3 || n === 4 ? ["phone", "small"] : ["phone"]) {
    const tag = `bag of ${n} on ${vp}`;
    const items = PIECES.slice(0, n);
    const sum = items.reduce((a, c) => a + c.price, 0);
    const want = inr(sum * (1 - RATE[n]));
    const o = await open(vp, "/jewellery/", { items, cartId: null, checkoutUrl: null });
    try {
      await o.page.waitForSelector("#root header", { timeout: 30000 }); await sleep(3000);
      await o.page.locator('header [aria-label*="cart" i], header [aria-label*="bag" i]').locator("visible=true").first().click();
      await o.page.waitForSelector("[data-bag-foot]", { timeout: 15000 }); await sleep(2200);
      const b = await o.page.evaluate(() => {
        const t = (sel) => (document.querySelector(sel)?.textContent || "").replace(/\s+/g, " ").trim();
        const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const x = e.getBoundingClientRect(); return [Math.round(x.top), Math.round(x.bottom)]; };
        const bar = document.querySelector('[data-ladder] [role="progressbar"]');
        return { total: t("[data-total]"), was: t("[data-total-was]"), save: t("[data-you-save]"), ladder: t("[data-ladder]"),
          rungs: [...document.querySelectorAll("[data-ladder] [data-rung]")].map((li) => [...li.childNodes].filter((c) => !(c.classList && c.classList.contains("nc-sr"))).map((c) => c.textContent).join("").replace(/\s+/g, " ").trim()),
          current: [...document.querySelectorAll("[data-ladder] [data-rung][data-current]")].map((li) => li.getAttribute("data-rung")),
          stops: [...document.querySelectorAll(".rn-bagsteps i")].map((i) => `${i.style.left}${i.hasAttribute("data-reached") ? "*" : ""}`),
          fill: bar?.querySelector("span")?.style.width, aria: bar?.getAttribute("aria-label"),
          addonHead: t(".rn-addon__head"), addon: t("[data-bag-addon]"), addonEffect: t("[data-addon-effect]"),
          lines: [...document.querySelectorAll("[data-line]")].map((l) => ({ total: (l.querySelector("[data-line-total]")?.textContent || "").trim(), price: (l.querySelector("[data-line-price]")?.textContent || "").replace(/\s+/g, " ").trim() })),
          checkout: r("[data-checkout]"), vh: innerHeight, heading: t('[role="dialog"] h2'),
        };
      });
      ok(b.total === want, `${tag}: total ${b.total}, expected ${want} (${inr(sum)} at ${RATE[n] * 100}%)`);
      const lineSum = b.lines.reduce((a, l) => a + Number(l.total.replace(/[^\d]/g, "")), 0);
      ok(b.lines.length === n && inr(lineSum) === want, `${tag}: the ${b.lines.length} lines add up to ${inr(lineSum)}, the total is ${want}`);
      ok(JSON.stringify(b.rungs) === JSON.stringify(["Buy 2 · 10% off", "Buy 3 · 15% off"]), `${tag}: the strip reads ${JSON.stringify(b.rungs)}`);
      ok(!OLD.test(b.ladder) && !OLD.test(b.save) && !OLD.test(b.addon), `${tag}: an old step is still named: strip "${b.ladder}" · save "${b.save}" · add-on "${b.addon.slice(0, 60)}"`);
      ok(JSON.stringify(b.current) === JSON.stringify(n >= 3 ? ["3"] : n === 2 ? ["2"] : []), `${tag}: the bag's step is marked ${JSON.stringify(b.current)}`);
      ok(b.stops.join(" ") === (n >= 3 ? "25%* 75%*" : n === 2 ? "25%* 75%" : "25% 75%"), `${tag}: stops ${b.stops.join(" ")}`);
      ok(b.fill === (n >= 3 ? "100%" : n === 2 ? "25%" : "12.5%"), `${tag}: the line is filled ${b.fill}`);
      ok(b.aria === `${Math.min(n, 3)} of 3 pieces`, `${tag}: the line is read as "${b.aria}"`);
      if (n >= 2) ok(new RegExp(`${RATE[n] * 100}% off ${n} pieces$`).test(b.save), `${tag}: saving line "${b.save}"`);
      else ok(!/% off \d+ piece/.test(b.save), `${tag}: a one-piece bag claims an offer: "${b.save}"`);
      if (n === 1) ok(b.addonHead === "" || b.addonHead === "A second piece takes 10% off your bag", `${tag}: suggestion heading "${b.addonHead}"`);
      if (n === 2) ok(b.addonHead === "" || b.addonHead === "A third piece takes 15% off your bag", `${tag}: suggestion heading "${b.addonHead}"`);
      if (n >= 3) ok(b.addon === "", `${tag}: the bag still suggests another piece: "${b.addon.slice(0, 80)}"`);
      ok(b.checkout && b.checkout[1] <= b.vh, `${tag}: Checkout ends at ${b.checkout && b.checkout[1]} of ${b.vh}`);
      notes.push(`${tag}: ${b.heading} · total ${b.total}${b.was ? ` (was ${b.was})` : ""} · "${b.save}" · strip ${JSON.stringify(b.rungs)} on ${JSON.stringify(b.current)} · line ${b.fill} · ${b.addonHead ? `suggests: "${b.addonHead}", ${b.addonEffect}` : b.addon ? `suggestion: ${b.addon.slice(0, 70)}` : "no suggestion"}`);
      if (vp === "phone") await o.page.screenshot({ path: path.join(OUT, `bag-${n}-phone.png`) });
      if (vp === "small" && n === 4) await o.page.screenshot({ path: path.join(OUT, `bag-${n}-small.png`) });
      ok(o.errors.length === 0, `${tag}: ${JSON.stringify(o.errors.slice(0, 2))}`);
    } catch (e) { fails.push(`${tag}: ${String(e).split("\n")[0].slice(0, 200)}`); }
    await o.context.close();
  }

  // 4. the product page's sentence above the buttons, with other pieces already in the bag
  for (const n of [1, 2, 3, 4]) {
    const items = PIECES.slice(1, 1 + n);            // never the hoops themselves
    const sum = items.reduce((a, c) => a + c.price, 0);
    const o = await open("phone", "/jewellery/woven-gold-hoops/", { items, cartId: null, checkoutUrl: null });
    try {
      await settle(o.page);
      const s = await o.page.evaluate(() => ({ note: (document.querySelector("[data-offer-note]")?.textContent || "").replace(/\s+/g, " ").trim(), fill: document.querySelector(".rn-steps__fill")?.style.width, ghost: document.querySelector(".rn-steps__ghost")?.style.width, cur: [...document.querySelectorAll("[data-offer-ladder] [data-rung][data-current]")].map((li) => li.getAttribute("data-rung")) }));
      const now = Math.round(sum * (1 - RATE[n])), after = Math.round((sum + 1049) * (1 - RATE[n + 1]));
      const want = RATE[n + 1] > RATE[n]
        ? `Add to bag and everything in it gets ${RATE[n + 1] * 100}% off. Your total goes up by ${inr(after - now)}, not ₹1,049.`
        : `Your bag already has ${RATE[n] * 100}% off. This piece gets it too.`;
      ok(s.note === want, `product page with ${n} other piece(s) in the bag: "${s.note}", expected "${want}"`);
      ok(!OLD.test(s.note), `product page with ${n} in the bag: the sentence names an old step`);
      notes.push(`product page, ${n} other piece(s) in the bag: "${s.note}" · line ${s.fill} (paler to ${s.ghost}) · step ${JSON.stringify(s.cur)}`);
      if (n === 2) { await o.page.evaluate(() => document.querySelector("[data-offer-note]")?.scrollIntoView({ block: "center" })); await sleep(700); await o.page.screenshot({ path: path.join(OUT, "pdp-two-in-bag-phone.png") }); }
    } catch (e) { fails.push(`product page with ${n} in the bag: ${String(e).split("\n")[0].slice(0, 200)}`); }
    await o.context.close();
  }

  // 5. typed codes in the bag: the 10% code under the steps, the 20% code over them, and a stale BUY4
  for (const [code, n, rate, words] of [["NAIRA10", 1, 0.1, "one piece with NAIRA10"], ["NAIRA10", 3, 0.15, "three with NAIRA10"], ["FRIENDSANDFAMILY", 3, 0.2, "three with FRIENDSANDFAMILY"], ["BUY4", 4, 0.15, "four with BUY4 left in storage"], ["BUY4", 1, 0, "one with BUY4 left in storage"]]) {
    const items = PIECES.slice(0, n); const sum = items.reduce((a, c) => a + c.price, 0); const want = inr(sum * (1 - rate));
    const o = await open("phone", "/jewellery/", { items, cartId: null, checkoutUrl: null }, code);
    try {
      await o.page.waitForSelector("#root header", { timeout: 30000 }); await sleep(3000);
      await o.page.locator('header [aria-label*="cart" i], header [aria-label*="bag" i]').locator("visible=true").first().click();
      await o.page.waitForSelector("[data-bag-foot]", { timeout: 15000 }); await sleep(2000);
      const b = await o.page.evaluate(() => { const t = (sel) => (document.querySelector(sel)?.textContent || "").replace(/\s+/g, " ").trim(); return { total: t("[data-total]"), save: t("[data-you-save]") }; });
      ok(b.total === want, `bag, ${words}: total ${b.total}, expected ${want}`);
      ok(!/30%/.test(b.save), `bag, ${words}: the saving line says 30%: "${b.save}"`);
      notes.push(`bag, ${words}: total ${b.total} · "${b.save}"`);
    } catch (e) { fails.push(`bag, ${words}: ${String(e).split("\n")[0].slice(0, 200)}`); }
    await o.context.close();
  }

  await browser.close();
  console.log(notes.map((n) => "  · " + n).join("\n"));
  console.log(`\nwrites refused: ${refused} · reporting requests aborted: ${aborted}`);
  console.log(fails.length ? `\nFAILED (${fails.length})\n` + fails.map((f) => "  x " + f).join("\n") : "\nPASSED: the product page on three screens, the home page, the bag at one to five pieces, the page's sentence at four bag sizes, typed codes");
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
