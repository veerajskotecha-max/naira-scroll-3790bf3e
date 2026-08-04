import { useEffect, useRef, useState, type ReactNode } from "react";
import { armRevealFallback, isInViewport } from "@/lib/revealFallback";

/* ───────────────────────────────────────────────────────────────
   REVEAL
   A light IntersectionObserver fade-and-rise used by the editorial
   pages (Journal, collection landings). Fires once, staggers via the
   delay prop, and renders instantly for reduced-motion readers.
   ─────────────────────────────────────────────────────────────── */

const Reveal = ({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  /** stagger delay in ms */
  delay?: number;
  as?: "div" | "section" | "li" | "header" | "article";
  className?: string;
}) => {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      // Any sliver of the element entering the viewport reveals it; a ratio
      // threshold can strand tall blocks invisible on short screens.
      { threshold: 0.01 }
    );
    io.observe(el);
    // Observers can miss their initial record around route transitions and
    // image-settling layout shifts; never leave in-view content invisible.
    const dispose = armRevealFallback(() => {
      if (isInViewport(ref.current)) setShown(true);
    });
    return () => {
      io.disconnect();
      dispose();
    };
  }, [shown]);

  return (
    <Tag
      // @ts-expect-error ref type narrows per tag; all are HTMLElements
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(var(--nf-reveal-rise))",
        // Motion tokens (src/index.css): 0.6s rise on the shared reveal curve.
        transition: `opacity var(--nf-reveal-duration) ease ${delay}ms, transform var(--nf-reveal-duration) var(--nf-ease-reveal) ${delay}ms`,
        willChange: shown ? undefined : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
