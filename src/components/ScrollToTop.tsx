import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Scroll the window to the top on every navigation — including clicks
 * that push the same path (e.g. clicking "Home" from the homepage).
 * In-page state written to the URL (filter chips using `replace`, such as
 * /jewellery?category=Rings) must NOT jump the shopper back to the top,
 * so replace-navigations on the same path are ignored.
 */
const ScrollToTop = () => {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "REPLACE") return;
    // Disable any CSS smooth-scroll for the jump, then restore.
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    html.style.scrollBehavior = prev;
  }, [pathname, key, navigationType]);

  return null;
};


export default ScrollToTop;
