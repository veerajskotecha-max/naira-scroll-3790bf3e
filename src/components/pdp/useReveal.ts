import { useEffect } from "react";

/*
  Sections rise in as they are reached: every element carrying `rn-reveal`
  inside the root starts 14px low and clear, and settles when it comes into
  view, once. The root is armed (`rn-armed`) only here, in a real browser that
  has not asked for less motion: the pre-built page (captured by an automated
  browser) and a page whose script never runs show everything at once.
  What is already on screen when the page arms is marked in the same frame,
  so nothing that could be seen ever blinks out.
*/
export const useReveal = (root: React.RefObject<HTMLElement>, key: string) => {
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (typeof navigator !== "undefined" && navigator.webdriver) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const targets = Array.from(el.querySelectorAll<HTMLElement>(".rn-reveal"));
    if (!targets.length) return;
    const show = (target: Element) => target.setAttribute("data-in", "");
    const height = window.innerHeight;
    for (const target of targets) if (target.getBoundingClientRect().top < height) show(target);
    el.classList.add("rn-armed");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const target of targets) if (!target.hasAttribute("data-in")) observer.observe(target);
    return () => {
      observer.disconnect();
      el.classList.remove("rn-armed");
      for (const target of targets) target.removeAttribute("data-in");
    };
  }, [root, key]);
};
