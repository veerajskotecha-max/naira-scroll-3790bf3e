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
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync } from "fs";
import { resolve, join } from "path";
import { chromium, type Browser } from "playwright";
import { resolveSiteRoutes, type SiteRoute } from "./routes";

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
    .replace(/\sdata-prerender-transient="[^"]*"/g, "")
    /*
      The pixel runs inside the capture browser, which lives on 127.0.0.1, and
      fbevents.js injects its own <script src=".../signals/config/<id>?...
      &domain=127.0.0.1&hme=..."> into the head. Captured verbatim, every
      visitor then downloaded a signals config bound to localhost with a stale
      integrity hash — the served HTML claimed the wrong domain for the pixel.
      The static bootstrap in index.html re-fetches the correct config at
      runtime, so these injected tags must never reach disk.
    */
    .replace(/<script[^>]+src="[^"]*(?:facebook\.net|facebook\.com|fbcdn\.net)[^"]*"[^>]*><\/script>/gi, "")
    .replace(/<link[^>]+href="[^"]*(?:facebook\.net|facebook\.com|fbcdn\.net)[^"]*"[^>]*\/?>/gi, "")
    .replace(/<img[^>]+src="[^"]*facebook\.com\/tr[^"]*"[^>]*\/?>/gi, "");

const routeToFile = (routePath: string) =>
  routePath === "/" ? join(DIST, "index.html") : join(DIST, routePath, "index.html");

/*
  dist/index.html is two things at once: the homepage's own file, and what the
  preview server — and the live host — hands out for any path that has no file
  of its own. Writing the captured homepage over it mid-run meant every route
  captured afterwards started from the homepage's HTML, <head> included, and
  kept it whenever the capture beat Helmet to the head. Live, after rendering
  four routes at a time: 47 of 136 pages, products and journal alike, declaring
  the homepage as their canonical. So the shell stays untouched until the last
  capture is done, and the homepage is written in main() afterwards.
*/
const SHELL_FILE = join(DIST, "index.html");
let capturedHome: string | undefined;

/* The host kills a build that runs too long, and a killed build publishes
   nothing. Stop starting new routes after this budget; unrendered routes fall
   back to the SPA shell, which is degraded rather than broken. */
const BUDGET_MS = Number(process.env.PRERENDER_BUDGET_MS ?? 6 * 60_000);
const STARTED = Date.now();
const CONCURRENCY = Number(process.env.PRERENDER_CONCURRENCY ?? 4);

async function renderAll(browser: Browser, routes: SiteRoute[]) {
  const queue = [...routes];
  const results = await Promise.all(
    Array.from({ length: CONCURRENCY }, () => renderWorker(browser, queue)),
  );
  return {
    written: results.reduce((n, r) => n + r.written, 0),
    failures: results.flatMap((r) => r.failures),
    skipped: results.reduce((n, r) => n + r.skipped, 0),
  };
}

async function renderWorker(browser: Browser, queue: SiteRoute[]) {
  /*
    Captured with reduced motion on. The header's 3D wordmark skips three.js
    for reduced-motion visitors and keeps its flat flower — which is all the
    captured HTML can hold anyway, since a live canvas does not serialise. With
    motion on, every captured page set up a WebGL scene on the software GPU a
    headless build has, and blocked its main thread for seconds: headings came
    up to 11 s late and Helmet's <head> another 11 s after that, which is how
    captures ended up with the wrong <head>. With it off, the same pages render
    in about a second and write their <head> within 100 ms.
  */
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  let skipped = 0;

  /* Never let the capture browser talk to Meta: its events would be attributed
     to 127.0.0.1 and its injected config tags would be captured into the HTML.
     Belt and braces with the strip in clean(). */
  await page.route(/(facebook\.net|facebook\.com|fbcdn\.net)/i, (r) => r.abort());
  const failures: { path: string; reason: string }[] = [];
  let written = 0;

  /* A single slow Shopify response is enough to leave one route short of its
     <h1> at capture time, which failed the whole build for a page that renders
     perfectly on a second look. Give each route up to three attempts, with a
     longer settle each time, before calling it a real defect. */
  const ATTEMPTS = 2;

  for (let route = queue.shift(); route; route = queue.shift()) {
   if (Date.now() - STARTED > BUDGET_MS) { skipped += 1; continue; }
   let lastError: unknown;
   for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
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
      await page.waitForTimeout(900 * attempt);
      // The <h1> is the marker asserted below; wait for it rather than racing
      // a fixed delay against a slow catalogue response.
      await page
        .waitForSelector("h1", { state: "attached", timeout: 10_000 * attempt })
        .catch(() => {
          /* the assertion below reports it properly */
        });

      // A route that fell through to the catch-all redirect is not a real page.
      // Advertising it in the sitemap while it bounces is the exact defect this
      // pipeline is meant to make impossible, so fail loudly instead.
      const landed = new URL(page.url()).pathname;
      if (landed !== route.path) {
        throw new Error(`redirected to ${landed} — route does not resolve`);
      }

      /* Wait for the page to actually resolve rather than trusting a fixed
         delay. A PDP whose Shopify query is still in flight renders a loading
         skeleton that carries robots=noindex — and the word floor below is
         satisfied by the shared header and footer alone, so the skeleton used
         to pass silently. That shipped 47 of 65 product pages as noindex
         "Loading…" HTML while the build reported success. */
      await page
        .waitForFunction(
          () => !document.querySelector('meta[name="robots"][content*="noindex"]'),
          undefined,
          { timeout: 10_000 }
        )
        .catch(() => {
          /* fall through — the assertion below reports it properly */
        });

      /* The <h1> can land before Helmet has written the page's <head>, which it
         does on an animation frame. Wait until the canonical names this route —
         until then the head is still the shell's. Polled on a timer, not on
         frames: a headless page can go seconds without one. */
      await page
        .waitForFunction(
          (path) => {
            const href = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
            if (!href) return false;
            try {
              return new URL(href, location.origin).pathname.replace(/\/+$/, "") === path.replace(/\/+$/, "");
            } catch {
              return false;
            }
          },
          route.path,
          { timeout: 10_000 * attempt, polling: 100 },
        )
        .catch(() => {
          /* the assertion below reports it properly */
        });

      const html = clean(await page.content());
      const words = await page.evaluate(() => (document.body.innerText || "").trim().split(/\s+/).filter(Boolean).length);
      if (words < 20) throw new Error(`only ${words} words rendered`);

      /* Assert on real markers, not a word count. A page that still declares
         noindex, or has no h1, is a skeleton we must not write to disk. */
      const shape = await page.evaluate(() => ({
        noindex: !!document.querySelector('meta[name="robots"][content*="noindex"]'),
        h1: document.querySelectorAll("h1").length,
        title: document.title,
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
      }));
      if (shape.noindex) {
        throw new Error(`still noindex after load — captured a skeleton ("${shape.title}")`);
      }
      if (shape.h1 === 0) {
        throw new Error(`no <h1> rendered ("${shape.title}")`);
      }
      const canonicalPath = shape.canonical
        ? new URL(shape.canonical, ORIGIN).pathname.replace(/\/+$/, "")
        : null;
      if (canonicalPath !== route.path.replace(/\/+$/, "")) {
        throw new Error(
          shape.canonical
            ? `canonical is ${shape.canonical}, not this page — captured before its <head> was written`
            : `no canonical — captured before the page's <head> was written ("${shape.title}")`,
        );
      }

      const file = routeToFile(route.path);
      if (file === SHELL_FILE) {
        capturedHome = html; // written after the run — see SHELL_FILE
      } else {
        mkdirSync(resolve(file, ".."), { recursive: true });
        writeFileSync(file, html, "utf8");
      }
      written += 1;
      lastError = undefined;
      break;
    } catch (err) {
      lastError = err;
    }
   }
   if (lastError) {
     failures.push({
       path: route.path,
       reason: lastError instanceof Error ? lastError.message : String(lastError),
     });
   }
  }

  await page.close();
  return { written, failures, skipped };
}

async function main() {
  if (!existsSync(join(DIST, "index.html"))) {
    throw new Error("dist/index.html not found — run `vite build` first");
  }

  const server = spawn(
    "npx",
    ["vite", "preview", "--port", String(PORT), "--host", "127.0.0.1", "--strictPort"],
    // Own process group, so the whole npx -> vite tree can be killed; killing
    // only npx left vite running and the build never exited.
    { stdio: "ignore", detached: true },
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
    const routes = await resolveSiteRoutes();
    const { written, failures, skipped } = await renderAll(browser, routes);
    if (skipped) console.warn(`prerender: time budget reached, ${skipped} route(s) left as SPA shell`);
    await browser.close();

    /* A route with no file of its own would be answered with SHELL_FILE, which
       is about to become the homepage — its title, description and canonical.
       Give every such route (skipped by the budget, or failed) a copy of the
       untouched shell instead: degraded, but never claiming to be the homepage. */
    const shell = readFileSync(SHELL_FILE, "utf8");
    let shelled = 0;
    for (const route of routes) {
      const file = routeToFile(route.path);
      if (file === SHELL_FILE || existsSync(file)) continue;
      mkdirSync(resolve(file, ".."), { recursive: true });
      writeFileSync(file, shell, "utf8");
      shelled += 1;
    }
    if (shelled) console.warn(`prerender: ${shelled} route(s) had no capture and were given the SPA shell`);
    if (capturedHome) writeFileSync(SHELL_FILE, capturedHome, "utf8");

    console.log(`prerendered ${written}/${routes.length} routes`);
    if (failures.length) {
      console.error(`\n${failures.length} route(s) failed:`);
      for (const f of failures) console.error(`  ${f.path} — ${f.reason}`);
      // A silently half-prerendered deploy is worse than an obvious failure:
      // the missed routes fall back to the empty shell without anyone noticing.
      process.exitCode = 1;
    }
  } finally {
    try { if (server.pid) process.kill(-server.pid, "SIGKILL"); } catch { server.kill("SIGKILL"); }
  }
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
