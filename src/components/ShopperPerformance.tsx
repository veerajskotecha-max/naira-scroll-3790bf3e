import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { initPerformanceLanding, productionShop, reportShopperPerformance, safePerformancePath } from "@/lib/shopperPerformance";

export default function ShopperPerformance() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (!productionShop(window.location.hostname) || !safePerformancePath(pathname)) return;
    initPerformanceLanding();
    const documentVisit = first.current;
    first.current = false;
    const start = documentVisit ? 0 : performance.now();
    let ready: number | null = null;
    let lcp: number | null = null;
    let sent = false;
    let frame = 0;
    const ms = (value: number) => Math.min(120000, Math.max(0, Math.round(value)));
    const send = () => {
      if (sent || ready === null) return;
      sent = true;
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      reportShopperPerformance("timing", {
        path: pathname, navigation: documentVisit ? "document" : "client", ready_ms: ready,
        load_ms: documentVisit && nav?.loadEventEnd ? ms(nav.loadEventEnd) : null,
        lcp_ms: documentVisit ? lcp : null,
      });
    };
    const check = () => {
      const heading = document.querySelector("h1");
      const loading = [...document.querySelectorAll('[role="status"]')].some(el => /loading (piece|product)/i.test(el.textContent ?? ""));
      if (!heading || !heading.getBoundingClientRect().height || loading || ready !== null) return;
      frame = requestAnimationFrame(() => { ready = ms(performance.now() - start); observer.disconnect(); });
    };
    const observer = new MutationObserver(check);
    observer.observe(document.getElementById("root") ?? document.body, { childList: true, subtree: true });
    let paint: PerformanceObserver | undefined;
    if (documentVisit) {
      try {
        paint = new PerformanceObserver(list => {
          const entry = list.getEntries().at(-1);
          if (entry) lcp = ms(entry.startTime);
        });
        paint.observe({ type: "largest-contentful-paint", buffered: true });
      } catch { /* Older in-app browsers still report page readiness. */ }
    }
    check();
    const flush = window.setTimeout(send, 5000);
    const timeout = window.setTimeout(() => {
      if (ready === null) reportShopperPerformance("route_timeout", { path: pathname });
      else send();
    }, 15000);
    const hidden = () => { if (document.visibilityState === "hidden") send(); };
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", send);
    return () => {
      send(); observer.disconnect(); paint?.disconnect(); cancelAnimationFrame(frame);
      clearTimeout(flush); clearTimeout(timeout);
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", send);
    };
  }, [pathname]);
  return null;
}