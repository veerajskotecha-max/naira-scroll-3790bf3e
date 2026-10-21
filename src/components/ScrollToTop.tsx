import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Scroll management on navigation.
 * - PUSH: jump to the top of the new page.
 * - REPLACE (filter chips writing to the URL): leave the scroll alone.
 * - POP (browser back / navigate(-1)): restore the scroll position the
 *   shopper had on that entry, so coming back from a product page lands
 *   on the card they clicked instead of the top of the grid. A product page
 *   is the exception: it always opens at its top, on back too. Restoring it
 *   put the shopper on the "more like this" rail at its foot, which read as
 *   the page opening at the bottom.
 *
 * Every jump is instant and lands before the new page paints. Going from one
 * product to the next keeps the page component mounted at the old offset, so
 * a jump after paint showed the new piece's footer first.
 */
const positions = new Map<string, number>();

/** A product page: /jewellery/<handle> or /jewelry/<handle> (not a collection), or /products/<id>. */
export const isProductPath = (pathname: string) =>
  /^\/(jewellery|jewelry|products)\/(?!collections(\/|$))[^/]+\/?$/.test(pathname);

/* index.css gives html `scroll-behavior: smooth`, so a plain scrollTo glides
   from the old offset and the shopper watches the page travel up from the
   bottom. Setting the inline style is not enough on its own: the browser reads
   the scroll behaviour before it restyles, so the style is read back first. */
const jumpTo = (top: number) => {
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  void getComputedStyle(html).scrollBehavior;
  window.scrollTo(0, top);
  html.style.scrollBehavior = prev;
};

const ScrollToTop = () => {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();
  const lastEntry = useRef<string | null>(null);

  // Continuously record the scroll position for this history entry.
  // A sudden programmatic jump to the very top (which happens as the next
  // page mounts) must not overwrite a real position, so it is ignored.
  /* No save on cleanup: cleanup runs after the next page is already in the
     DOM, so a long listing's scrollY has been clamped to the shorter PDP's
     height by then. Saving it there overwrote the real spot, and every back
     from a product landed at that same clamped point. */
  useEffect(() => {
    let lastY = window.scrollY;
    const save = () => {
      const y = window.scrollY;
      if (y === 0 && lastY > 200) return;
      lastY = y;
      positions.set(key, y);
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, [key]);


  useLayoutEffect(() => {
    /* The browser also restores a page's scroll on back, after this has run,
       and with html's smooth scrolling it glided a product page from its top
       down to the rail the shopper had left from. The setting is kept per
       history entry: product pages opt out, the rest keep the browser's
       restore, which agrees with the one below. */
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = isProductPath(pathname) ? "manual" : "auto";
    }

    /* The same entry again: closing the bag or wishlist with back steps onto
       the entry they were opened from. Nothing navigated, so leave the page
       where it is — re-applying the saved offset for 900 ms would fight a
       shopper who starts scrolling straight away. */
    const entry = `${key}|${pathname}`;
    const firstMount = lastEntry.current === null;
    const sameEntry = lastEntry.current === entry;
    lastEntry.current = entry;
    if (sameEntry) return;

    /* The first page is pre-built: the shopper can already be scrolling it
       when the app takes over, seconds in on a slow connection. Jumping them
       to the top then would undo that, and it would also override the
       browser's own scroll restore on a reload. Only navigations scroll. */
    if (firstMount) return;

    if (navigationType === "REPLACE") return;

    if (navigationType === "POP" && !isProductPath(pathname)) {
      const target = positions.get(key);
      if (target != null && target > 0) {
        // Content (grids, images) may still be mounting — keep re-applying
        // the offset for a short window so late layout shifts can't win.
        const until = performance.now() + 900;
        let raf = 0;
        const restore = () => {
          jumpTo(target);
          if (performance.now() < until) raf = requestAnimationFrame(restore);
        };
        restore();
        return () => cancelAnimationFrame(raf);
      }
    }

    jumpTo(0);
  }, [pathname, key, navigationType]);

  return null;
};

export default ScrollToTop;
