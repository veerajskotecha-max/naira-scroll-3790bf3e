import { createElement, useCallback } from "react";
import { isStandInPage } from "./fallbackGuard";

/*
  main.tsx starts the app after 8 s even when the page's own code is still on
  its way, so a stalled download never keeps the header and bag from working.
  But createRoot empties #root on its first commit, and the page's route then
  suspended to an empty fallback: a product page that had been readable for
  8 s became the header over a blank body until the code arrived (20 s held,
  measured on the live site).

  So in that one case the pre-built page is kept: its nodes are taken before
  createRoot runs and put back as the route's Suspense fallback, in the same
  commit that removed them, so they never leave the screen. Everything under
  the header is the page (see the live HTML: overlays, header, page). Its links
  are plain links and still work; its buttons wait for the code like the rest.
*/
let kept: Element[] = [];

/** Takes the pre-built page under the header, to be shown until its code arrives. */
export const keepPrebuiltPage = (root: Element): void => {
  // The homepage file standing in for an address it has no page for: that is
  // not this page, and the guard hides it on purpose (lib/fallbackGuard.ts).
  // Asked of the guard's script, not only its mark: the mark comes off after
  // 10 s, and a slow start reaches here later than that.
  if (isStandInPage()) return;
  const header = root.querySelector(":scope > header");
  for (let el = header?.nextElementSibling; el; el = el.nextElementSibling) kept.push(el);
};

/**
 * Forgets the kept page once the app's first commit is done. Only that commit
 * may show it: when the route's code landed between the 8 s start and React's
 * first render, the page rendered itself and the fallback never mounted (or
 * the first render failed to the error panel), and the next route that waited
 * for its code showed the old pre-built page under the live header.
 */
export const dropPrebuiltPage = (): void => {
  kept = [];
};

/** The routes' Suspense fallback: the kept page the first time, nothing after. */
export const PrebuiltPage = () => {
  const ref = useCallback((el: HTMLDivElement | null) => {
    if (!el || !kept.length) return;
    el.append(...kept);
    kept = [];
  }, []);
  return createElement("div", { ref, style: { display: "contents" } });
};
