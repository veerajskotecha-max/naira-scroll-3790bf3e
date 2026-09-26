import { useCallback, useEffect, useRef, type MouseEvent } from "react";

/*
  Gives a full-screen overlay (the bag, the wishlist) its own entry in the
  browser's history while it is open, so the phone's back button — Android's
  button or gesture, iOS's swipe — closes the overlay and nothing else.

  The bag used to live only in React state, so back went past it. A shopper
  browsing collection → product saw nothing happen: the page behind the
  full-screen bag changed and the bag stayed put, and a second press left the
  site. A shopper who arrived from an ad straight onto a product left the site
  with a single press.

  Opening adds one entry with the same URL. Every other way of closing — the
  back arrow, the cross, a tap outside, a swipe, Escape — steps back through
  that same entry instead of leaving it behind, so the next press of back still
  goes where the shopper expects rather than onto a copy of the page they are
  already on.
*/

const hasEntry = (key: string) => {
  const state = window.history.state as Record<string, unknown> | null;
  return !!state && state[key] === true;
};

/**
 * onClick for a <Link> inside an overlay: leave the overlay's entry first, then
 * navigate — so back from the next page returns to the page, not to the overlay
 * that was just left. Letting the link navigate while the close is still
 * stepping back would undo the navigation. Modified clicks (new tab, new
 * window) keep the browser's own behaviour.
 */
export const followOut =
  (closeThen: (next: () => void) => void, navigate: (to: string) => void) =>
  (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const to = e.currentTarget.getAttribute("href");
    if (!to) return;
    e.preventDefault();
    closeThen(() => navigate(to));
  };

export function useBackToClose(key: string, open: boolean, setOpen: (open: boolean) => void) {
  // Set while stepping back without closing — see releaseEntry.
  const quiet = useRef(false);

  // Opening adds the entry: once, and not when a reload has landed on it.
  useEffect(() => {
    if (open && !hasEntry(key)) {
      window.history.pushState({ ...(window.history.state ?? {}), [key]: true }, "");
    }
  }, [key, open]);

  // Leaving the entry — back, or any other step through history — closes.
  useEffect(() => {
    const onPop = () => {
      if (!quiet.current && !hasEntry(key)) setOpen(false);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [key, setOpen]);

  // A reload while the overlay was open lands on its entry again: show it,
  // so the next back press has something to close instead of doing nothing.
  useEffect(() => {
    if (hasEntry(key)) setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepBack = useCallback(
    (keepOpen: boolean) =>
      new Promise<void>((resolve) => {
        if (!hasEntry(key)) {
          if (!keepOpen) setOpen(false);
          resolve();
          return;
        }
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          window.removeEventListener("popstate", finish);
          window.clearTimeout(timer);
          quiet.current = false;
          resolve();
        };
        quiet.current = keepOpen;
        window.addEventListener("popstate", finish);
        // Never leave a close or a checkout waiting on an event that is late.
        const timer = window.setTimeout(() => {
          if (!keepOpen) setOpen(false);
          finish();
        }, 600);
        window.history.back();
      }),
    [key, setOpen],
  );

  /** Close the way back would, leaving no entry behind. */
  const requestClose = useCallback(() => {
    void stepBack(false);
  }, [stepBack]);

  /** Close, then run `next` once the entry is gone — for links out of the overlay. */
  const closeThen = useCallback(
    (next: () => void) => {
      void stepBack(false).then(next);
    },
    [stepBack],
  );

  /**
   * Remove the entry but keep the overlay on screen — for handing off to a
   * checkout that manages history itself. Shiprocket's checkout pushes its own
   * entry and listens for back to offer its exit prompt; with ours still
   * underneath, a back press inside checkout would reopen the bag behind it.
   */
  const releaseEntry = useCallback(() => stepBack(true), [stepBack]);

  return { requestClose, closeThen, releaseEntry };
}
