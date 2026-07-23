import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scroll the window to the top on every navigation — including clicks
 * that push the same path (e.g. clicking "Home" from the homepage).
 * Uses `location.key` so repeat navigations still fire, and jumps
 * instantly so users don't see the page mid-scroll during a transition.
 */
const ScrollToTop = () => {
  const { pathname, key } = useLocation();

  useEffect(() => {
    // Disable any CSS smooth-scroll for the jump, then restore.
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    html.style.scrollBehavior = prev;
  }, [pathname, key]);

  return null;
};

export default ScrollToTop;
