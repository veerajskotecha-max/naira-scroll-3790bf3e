import { useEffect, useRef, type CSSProperties } from "react";

/* ───────────────────────────────────────────────────────────────
   SPLIT TEXT
   Kinetic headline reveal — each letter rises, unblurs and fades in
   on a stagger when the line scrolls into view. Spaces are preserved.
   Honours reduced-motion (renders instantly). Decorative only, so the
   full string stays available to screen-readers via aria-label.
   ─────────────────────────────────────────────────────────────── */

type Props = {
  text: string;
  className?: string;
  style?: CSSProperties;
  /** seconds before the stagger begins */
  delay?: number;
  /** per-letter stagger step in seconds */
  step?: number;
  as?: "span" | "div";
};

const SplitText = ({ text, className, style, delay = 0, step = 0.03, as = "span" }: Props) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.classList.add("is-in"); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); clearTimeout(fallback); } },
      { threshold: 0.2 }
    );
    io.observe(el);
    // Safety net: never leave a headline invisible if the observer never fires
    // (e.g. background tab, paused transitions, layout quirk). After a short
    // grace period, force every letter fully visible inline — bypassing the
    // transition entirely so it can't get stuck at opacity 0.
    const fallback = window.setTimeout(() => {
      el.classList.add("is-in");
      el.querySelectorAll<HTMLElement>(".split-l").forEach((l) => {
        l.style.opacity = "1";
        l.style.transform = "none";
        l.style.filter = "none";
      });
      io.disconnect();
    }, 1600);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, []);

  const Tag = as;
  const letters = Array.from(text);

  return (
    <Tag ref={ref as never} className={`split-text ${className ?? ""}`} style={style} aria-label={text}>
      <style>{`
        .split-text { display: inline-block; }
        .split-text .split-l {
          display: inline-block; white-space: pre; opacity: 0;
          transform: translateY(0.6em) rotate(2deg); filter: blur(6px);
          transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1), filter .7s ease;
          transition-delay: var(--d);
        }
        .split-text.is-in .split-l { opacity: 1; transform: translateY(0) rotate(0); filter: blur(0); }
        @media (prefers-reduced-motion: reduce) {
          .split-text .split-l { opacity: 1 !important; transform: none !important; filter: none !important; }
        }
      `}</style>
      {letters.map((ch, i) => (
        <span key={i} aria-hidden className="split-l" style={{ ["--d" as string]: `${delay + i * step}s` }}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </Tag>
  );
};

export default SplitText;
