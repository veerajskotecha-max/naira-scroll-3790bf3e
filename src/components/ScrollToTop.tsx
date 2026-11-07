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
 *
 * The browser's own scroll restoring is off on every page (the owner's video,
 * 7 Nov 2026). It runs the moment Back is pressed, while the product page is
 * still on screen for a few frames: with html's smooth scrolling the product
 * page glided down to its foot, chasing the listing's old offset, before the
 * listing appeared. The app restores instead, once the listing is drawn, and
 * keeps the offsets in sessionStorage so a reload still comes back to the spot.
 */
const positions = new Map<string, number>();
const STORE = "nf-scroll:";

/** A product page: /jewellery/<handle> or /jewelry/<handle> (not a collection), or /products/<id>. */
// eslint-disable-next-line react-refresh/only-export-components -- exported for its unit test
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

const keep = (key: string, pathname: string, y: number) => {
  try { sessionStorage.setItem(STORE + key, JSON.stringify({ p: pathname, y })); } catch { /* private mode */ }
};
const kept = (key: string, pathname: string): number => {
  try {
    const v = JSON.parse(sessionStorage.getItem(STORE + key) ?? "null") as { p?: string; y?: number } | null;
    return v && v.p === pathname && typeof v.y === "number" ? v.y : 0;
  } catch {
    return 0;
  }
};
/** How this document was reached: a reload or Back/Forward from another site may come back to a spot; a fresh visit never does. */
const documentReturned = () => {
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return nav?.type === "reload" || nav?.type === "back_forward";
  } catch {
    return false;
  }
};

/* Content (grids, images) may still be mounting, so the offset is re-applied
   for a short window and late layout shifts cannot win. The shopper's own
   touch, wheel or key ends it at once: re-applying the offset under a finger
   that has started to scroll fights her. */
const restoreTo = (target: number) => {
  const until = performance.now() + 900;
  let raf = 0;
  let stopped = false;
  const stop = () => {
    stopped = true;
    cancelAnimationFrame(raf);
  };
  const opts = { passive: true, capture: true } as const;
  window.addEventListener("touchstart", stop, opts);
  window.addEventListener("wheel", stop, opts);
  window.addEventListener("keydown", stop, opts);
  const step = () => {
    if (stopped) return;
    jumpTo(target);
    if (performance.now() < until) raf = requestAnimationFrame(step);
  };
  step();
  return () => {
    stop();
    window.removeEventListener("touchstart", stop, opts);
    window.removeEventListener("wheel", stop, opts);
    window.removeEventListener("keydown", stop, opts);
  };
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
    let pending = 0;
    const save = () => {
      const y = window.scrollY;
      if (y === 0 && lastY > 200) return;
      lastY = y;
      positions.set(key, y);
      if (!pending) pending = window.setTimeout(() => { pending = 0; keep(key, pathname, lastY); }, 200);
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      window.removeEventListener("scroll", save);
      if (pending) window.clearTimeout(pending);
    };
  }, [key, pathname]);


  useLayoutEffect(() => {
    /* Off on every entry (see the note at the top): the setting is kept per
       history entry, so a listing left on "auto" was restored by the browser
       the moment Back was pressed, under the product page still on screen. */
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";

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
    if (firstMount) {
      /* A reload, or Back from another site to a page that was not kept in
         memory: with the browser's restore off, the app brings the listing
         back to the spot itself, unless she is already scrolling it. */
      if (navigationType === "POP" && !isProductPath(pathname) && documentReturned() && window.scrollY < 40) {
        const target = kept(key, pathname);
        if (target > 0) return restoreTo(target);
      }
      return;
    }

    if (navigationType === "REPLACE") return;

    if (navigationType === "POP" && !isProductPath(pathname)) {
      const target = positions.get(key) ?? kept(key, pathname);
      if (target > 0) return restoreTo(target);
    }

    jumpTo(0);
  }, [pathname, key, navigationType]);

  return null;
};

export default ScrollToTop;
