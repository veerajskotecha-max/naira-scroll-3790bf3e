import { useEffect, useRef, useState, type ReactNode } from "react";

/*
  Draws its children only once the screen is near them. The reviews, the
  press strip, the reels and the "more" rail sit two to five screens down;
  drawn at once, their code, photographs and reel list were fetched while the
  first photograph was still loading, on the same slow connection. Held back
  until the shopper is within about a screen of them, the first screen gets
  the whole line to itself.

  Until then the wrapper keeps a height of its own, so the page's length and
  the scrollbar hardly change when the part arrives, and it arrives while it
  is still off screen, so nothing visible moves.

  The pre-built page (captured by an automated browser) and a browser
  without IntersectionObserver get everything at once: search engines and
  the first paint still carry every word.
*/
type Props = {
  children: ReactNode;
  /** The room kept for the part until it is drawn, e.g. 480. */
  minHeight: number;
  /** How far ahead of the screen's edge to start, in px. */
  ahead?: number;
  className?: string;
  /** Marks the wrapper, so a link to the part can scroll to its place before it is drawn. */
  slot?: string;
};

const NearView = ({ children, minHeight, ahead = 700, className, slot }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(
    () => typeof IntersectionObserver === "undefined" || (typeof navigator !== "undefined" && Boolean(navigator.webdriver)),
  );
  useEffect(() => {
    const el = ref.current;
    if (near || !el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin: `${ahead}px 0px ${ahead}px 0px` },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [near, ahead]);
  return (
    <div ref={ref} className={className} data-slot={slot} style={near ? undefined : { minHeight }}>
      {near ? children : null}
    </div>
  );
};

export default NearView;
