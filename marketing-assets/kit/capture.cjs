/* Naira Flore brand kit capture script.
   Renders each HTML file at its exact pixel size and saves a PNG next to it.
   Run from repo root:  node marketing-assets/kit/capture.cjs
*/
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");

const KIT = __dirname;

const PAGES = [
  { file: "ig-profile-1000x1000.html", w: 1000, h: 1000 },
  { file: "whatsapp-business-profile-1000x1000.html", w: 1000, h: 1000 },
  { file: "ig-highlight-rings-1080x1920.html", w: 1080, h: 1920 },
  { file: "ig-highlight-bracelets-1080x1920.html", w: 1080, h: 1920 },
  { file: "ig-highlight-earrings-1080x1920.html", w: 1080, h: 1920 },
  { file: "ig-highlight-necklaces-1080x1920.html", w: 1080, h: 1920 },
  { file: "ig-highlight-the-journal-1080x1920.html", w: 1080, h: 1920 },
  { file: "email-signature-600x200.html", w: 600, h: 200 },
  { file: "packaging-insert-1200x1800.html", w: 1200, h: 1800 },
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 1 });

  // 1) Crop the wordmark out of public/logo.png once (transparent background).
  const logoSrc = path.resolve(KIT, "..", "..", "public", "logo.png");
  const cropPage = await ctx.newPage();
  await cropPage.setViewportSize({ width: 1920, height: 1080 });
  await cropPage.goto(
    pathToFileURL(path.join(KIT, "_logo-stage.html")).href + "?" + Date.now()
  );
  await cropPage.evaluate(async () => {
    await Promise.all(
      Array.from(document.images).map((i) =>
        i.complete ? null : new Promise((r) => (i.onload = r))
      )
    );
  });
  await cropPage.screenshot({
    path: path.join(KIT, "logo-wordmark.png"),
    omitBackground: true,
    clip: { x: 560, y: 445, width: 800, height: 190 },
  });
  await cropPage.close();
  void logoSrc;

  // 2) Render every kit page.
  for (const p of PAGES) {
    const page = await ctx.newPage();
    await page.setViewportSize({ width: p.w, height: p.h });
    await page.goto(pathToFileURL(path.join(KIT, p.file)).href, {
      waitUntil: "networkidle",
    });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    const out = path.join(KIT, p.file.replace(/\.html$/, ".png"));
    await page.screenshot({ path: out });
    console.log("captured", path.basename(out));
    await page.close();
  }

  await browser.close();
})();
