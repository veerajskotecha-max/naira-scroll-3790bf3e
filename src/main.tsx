import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { preloadRouteFor } from "./pageCode";
import "./index.css";
import { isOptionalChunkFailure } from "./lib/optionalChunk";
import { clearChunkReloadFlag, handlePreloadError, isChunkImportFailure, reloadForStaleChunk } from "./lib/chunkFailure";

/* A page loaded before a rebuild or publish still points at the old chunk
   files, so the next lazy route fails with "Importing a module script failed"
   and the screen goes blank. Reload once to pick up the new build; the
   session flag stops a genuinely missing file from reloading forever.

   These two listeners only catch a download that fails on its own. When React
   throws the same failure while rendering a route, nothing here sees it — that
   path is ChunkErrorBoundary's. */
window.addEventListener("vite:preloadError", handlePreloadError);
window.addEventListener("unhandledrejection", (e) => {
  if (isOptionalChunkFailure(e.reason)) return;
  if (isChunkImportFailure(e.reason)) reloadForStaleChunk();
});
window.addEventListener("load", () => {
  setTimeout(clearChunkReloadFlag, 10_000);
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
