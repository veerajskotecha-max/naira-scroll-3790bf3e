import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { preloadRouteFor } from "./pageCode";
import "./index.css";
import { isOptionalChunkFailure } from "./lib/optionalChunk";

/* A page loaded before a rebuild or publish still points at the old chunk
   files, so the next lazy route fails with "Importing a module script failed"
   and the screen goes blank. Reload once to pick up the new build; the
   session flag stops a genuinely missing file from reloading forever. */
const RELOAD_KEY = "naira:chunk-reload";
const reloadForStaleChunk = () => {
  if (sessionStorage.getItem(RELOAD_KEY)) return;
  sessionStorage.setItem(RELOAD_KEY, "1");
  window.location.reload();
};
window.addEventListener("vite:preloadError", (e) => {
  // The 3D decorations fall back to flat art on their own; never reload for them.
  if (isOptionalChunkFailure((e as Event & { payload?: unknown }).payload)) return;
  e.preventDefault();
  reloadForStaleChunk();
});
window.addEventListener("unhandledrejection", (e) => {
  const msg = String((e.reason as Error | undefined)?.message ?? e.reason ?? "");
  if (isOptionalChunkFailure(e.reason)) return;
  if (/Importing a module script failed|Failed to fetch dynamically imported module|error loading dynamically imported module/i.test(msg)) {
    reloadForStaleChunk();
  }
});
window.addEventListener("load", () => {
  setTimeout(() => sessionStorage.removeItem(RELOAD_KEY), 10_000);
});

/* The page is pre-built, so the shopper is already looking at it; React takes
   over once this page's code is here, and its first render is the same page
   rather than a blank one (see lib/lazyRoute.ts). A download that stalls or
   fails must never keep the app from starting: after 8 s it starts anyway,
   and a real failure is handled by the stale-chunk reload above. */
const APP_START_TIMEOUT_MS = 8_000;
Promise.race([
  preloadRouteFor(window.location.pathname).catch(() => undefined),
  new Promise((resolve) => window.setTimeout(resolve, APP_START_TIMEOUT_MS)),
]).then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
  // The editorial fonts wait for the page's own code (see index.html).
  document.getElementById("nf-fonts")?.setAttribute("media", "all");
});
