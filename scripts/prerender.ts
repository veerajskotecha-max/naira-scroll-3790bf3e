/*
  Prerender every route in the built SPA to static HTML.

  Why this exists: `vite build` emits one index.html whose body is an empty
  <div id="root">. Every URL therefore served byte-identical markup with zero
  words, zero headings, and a canonical pointing at the homepage. Crawlers that
  execute JavaScript eventually recovered; the ones that don't — most AI
  crawlers among them — saw nothing at all on any of the ~100 URLs.

  Approach: serve the finished build, drive a real browser over each route, and
  write the resulting DOM back to disk as <route>/index.html. No change to the
  app, the router, or the components — it runs after `vite build` against the
  output.

  Run: npm run build   (build then prerender)
       npm run prerender   (prerender an existing dist/)
*/

import { spawn } from "child_process";
import { mkdirSync, writeFileSync, existsSync, readdirSync } from "fs";
import { resolve, join } from "path";
import { chromium, type Browser } from "playwright";
import { siteRoutes } from "./routes";

const PORT = Number(process.env.PRERENDER_PORT ?? 4180);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const DIST = resolve("dist");
// Playwright's bundled Chromium is not always on the default lookup path in CI
// images; honour an explicit override when one is provided.
const EXECUTABLE = process.env.PLAYWRIGHT_CHROMIUM_PATH;

/*
  Playwright pins an exact Chromium build number per release, and a prebaked
  image ships whichever build its own Playwright wanted. A patch bump inside a
  caret range is enough to make the two disagree, and then launch() fails
  looking for a directory that was never installed — prerendering silently
  switches off while the build still exits 0.

  So: if the pinned build is missing, use whatever chromium IS installed. A
  build or two apart does not matter for rendering static markup.
*/
const findInstalledChromium = (): string | undefined => {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!root || !existsSync(root)) return undefined;
  const candidates = readdirSync(root)
    .filter((d) => d.startsWith("chromium"))
    // Prefer the full browser over headless_shell, then the newest build.
    .sort((a, b) => Number(a.includes("headless")) - Number(b.includes("headless")) || b.localeCompare(a, undefined, { numeric: true }));
  for (const dir of candidates) {
    for (const bin of ["chrome-linux/chrome", "chrome-linux/headless_shell"]) {
      const full = join(root, dir, bin);
      if (existsSync(full)) return full;
    }
  }
  return undefined;
};

const waitForServer = async (timeoutMs = 60_000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(ORIGIN);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`preview server did not start on ${ORIGIN}`);
};

/*
  The captured DOM is a running app, not a document. Three things have to be
  undone before it is safe to serve as the initial response.
*/
const clean = (html: string) =>
  html
    // GSAP and the reveal animations write inline opacity/visibility as they
    // run. Whatever value they happened to hold at capture time would be baked
    // in — an element mid-fade would ship as permanently invisible, hiding real
    // content from the crawlers this exists to serve.
    .replace(/(<[^>]+style="[^"]*?)opacity:\s*0(\.\d+)?;?/g, "$1")
    .replace(/(<[^>]+style="[^"]*?)visibility:\s*hidden;?/g, "$1")
    // React re-renders into #root on load, so any scroll position or transient
    // UI state captured here is replaced anyway; strip the attribute rather
    // than serve a stale value.
    .replace(/\sdata-prerender-transient="[^"]*"/g, "");

const routeToFile = (routePath: string) =>
  routePath === "/" ? join(DIST, "index.html") : join(DIST, routePath, "index.html");

async function renderAll(browser: Browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const failures: { path: string; reason: string }[] = [];
  let written = 0;

  for (const route of siteRoutes) {
    try {
      /*
        Deliberately not "networkidle". Product imagery comes from Shopify's
        CDN, and on any host that cannot reach it those requests never settle,
        so networkidle burns the full timeout on every catalogue route and
        writes nothing. What matters here is that React has mounted and Helmet
        has committed the head — the settle wait and the word count below
        check that directly.
      */
      const res = await page.goto(`${ORIGIN}${route.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      if (!res || !res.ok()) throw new Error(`HTTP ${res?.status() ?? "no response"}`);

      // Let the router resolve, React mount, and Helmet commit the <head>.
      // state:"attached" on purpose — the default is "visible", and the app's
      // outermost node has no box of its own, so waiting for visibility times
      // out on every route while the DOM underneath is perfectly complete.
      await page.waitForSelector("#root > *", { state: "attached", timeout: 15_000 });
      await page.waitForTimeout(900);

      // A route that fell through to the catch-all redirect is not a real page.
      // Advertising it in the sitemap while it bounces is the exact defect this
      // pipeline is meant to make impossible, so fail loudly instead.
      const landed = new URL(page.url()).pathname;
      if (landed !== route.path) {
        throw new Error(`redirected to ${landed} — route does not resolve`);
      }

      const html = clean(await page.content());
      const words = await page.evaluate(() => (document.body.innerText || "").trim().split(/\s+/).filter(Boolean).length);
      if (words < 20) throw new Error(`only ${words} words rendered`);

      const file = routeToFile(route.path);
      mkdirSync(resolve(file, ".."), { recursive: true });
      writeFileSync(file, html, "utf8");
      written += 1;
    } catch (err) {
      failures.push({ path: route.path, reason: err instanceof Error ? err.message : String(err) });
    }
  }

  await page.close();
  return { written, failures };
}

async function main() {
  if (!existsSync(join(DIST, "index.html"))) {
    throw new Error("dist/index.html not found — run `vite build` first");
  }

  const server = spawn(
    "npx",
    ["vite", "preview", "--port", String(PORT), "--host", "127.0.0.1", "--strictPort"],
    { stdio: "ignore", detached: false },
  );

  try {
    await waitForServer();

    /*
      Two different failures, deliberately treated differently.

      No browser available means this environment cannot prerender at all — a
      build host without Chromium installed, for instance. Failing the build
      there would block every deploy for a step that is an enhancement, so warn
      loudly and ship the SPA exactly as it built. Degraded, not broken.

      A browser that launches but cannot render a route is a real defect, and
      that still fails the build below.
    */
    const launch = (executablePath?: string) =>
      chromium.launch({ ...(executablePath ? { executablePath } : {}), args: ["--no-sandbox"] });

    let browser: Browser;
    try {
      try {
        browser = await launch(EXECUTABLE);
      } catch (first) {
        const found = EXECUTABLE ? undefined : findInstalledChromium();
        if (!found) throw first;
        console.warn(`prerender: pinned Chromium missing, using ${found}`);
        browser = await launch(found);
      }
    } catch (err) {
      console.warn(
        "\nprerender: could not launch a browser, skipping.\n" +
          "  The build is a client-rendered SPA — valid, but crawlers that do not\n" +
          "  execute JavaScript will see an empty shell on every route.\n" +
          "  Install Playwright's Chromium (npx playwright install chromium) or set\n" +
          "  PLAYWRIGHT_CHROMIUM_PATH to enable prerendering here.\n" +
          `  Reason: ${err instanceof Error ? err.message.split("\n")[0] : String(err)}\n`,
      );
      return;
    }
    const { written, failures } = await renderAll(browser);
    await browser.close();

    console.log(`prerendered ${written}/${siteRoutes.length} routes`);
    if (failures.length) {
      console.error(`\n${failures.length} route(s) failed:`);
      for (const f of failures) console.error(`  ${f.path} — ${f.reason}`);
      // A silently half-prerendered deploy is worse than an obvious failure:
      // the missed routes fall back to the empty shell without anyone noticing.
      process.exitCode = 1;
    }
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
