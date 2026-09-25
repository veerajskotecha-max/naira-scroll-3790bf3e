import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

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
  e.preventDefault();
  reloadForStaleChunk();
});
window.addEventListener("unhandledrejection", (e) => {
  const msg = String((e.reason as Error | undefined)?.message ?? e.reason ?? "");
  if (/Importing a module script failed|Failed to fetch dynamically imported module|error loading dynamically imported module/i.test(msg)) {
    reloadForStaleChunk();
  }
});
window.addEventListener("load", () => {
  setTimeout(() => sessionStorage.removeItem(RELOAD_KEY), 10_000);
});

createRoot(document.getElementById("root")!).render(<App />);
