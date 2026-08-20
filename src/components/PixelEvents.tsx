import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView, trackPixel } from "@/lib/pixel";

/**
 * Global Meta Pixel wiring:
 * - PageView on every client-side route change (the base pixel only fires once).
 * - Contact on any WhatsApp / phone / email click, anywhere in the app.
 * - CustomizeProduct when that contact happens from the customisation journey.
 * - FindLocation when the shopper opens the studio map link.
 */
const PixelEvents = () => {
  const { pathname, search } = useLocation();

  // The very first PageView is fired by the inline snippet in index.html.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    trackPageView();
  }, [pathname, search]);


  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href") ?? "";
      if (!href) return;

      if (href.includes("google.com/maps") || href.startsWith("geo:")) {
        trackPixel("FindLocation");
        return;
      }

      const isContact =
        href.includes("wa.me") ||
        href.includes("api.whatsapp.com") ||
        href.startsWith("tel:") ||
        href.startsWith("mailto:");
      if (!isContact) return;

      trackPixel("Contact", { source: window.location.pathname });
      if (/customi[sz]e|made-for-you/.test(window.location.pathname)) {
        trackPixel("CustomizeProduct");
      }
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
};

export default PixelEvents;
