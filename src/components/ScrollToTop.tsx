import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Scroll management on navigation.
 * - PUSH: jump to the top of the new page.
 * - REPLACE (filter chips writing to the URL): leave the scroll alone.
 * - POP (browser back / navigate(-1)): restore the scroll position the
 *   shopper had on that entry, so coming back from a product page lands
 *   on the card they clicked instead of the top of the grid.
 */
const positions = new Map<string, number>();

const ScrollToTop = () => {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();

  // Continuously record the scroll position for this history entry.
  useEffect(() => {
    const save = () => { positions.set(key, window.scrollY); (window as any).__pos = Object.fromEntries(positions); };
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      save();
      window.removeEventListener("scroll", save);
    };
  }, [key]);

  useEffect(() => {
    if (navigationType === "REPLACE") return;

    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    if (navigationType === "POP") {
      const target = positions.get(key);
      console.log("[scroll-restore]", key, target, Object.fromEntries(positions));
      if (target != null && target > 0) {
        // Content (grids, images) may still be mounting — keep re-applying
        // the offset for a short window so late layout shifts can't win.
        const until = performance.now() + 900;
        let raf = 0;
        const restore = () => {
          window.scrollTo(0, target);
          if (performance.now() < until) {
            raf = requestAnimationFrame(restore);
          } else {
            html.style.scrollBehavior = prev;
          }
        };
        restore();
        return () => {
          cancelAnimationFrame(raf);
          html.style.scrollBehavior = prev;
        };
      }
    }


    window.scrollTo(0, 0);
    html.style.scrollBehavior = prev;
  }, [pathname, key, navigationType]);

  return null;
};

export default ScrollToTop;
