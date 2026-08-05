import React, { HTMLAttributes, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  common: string;
  binomial: string;
  href?: string;
  photo: {
    url: string;
    text: string;
    pos?: string;
    by?: string;
  };
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** How far the items sit from the centre of the ring (px). */
  radius?: number;
  /** Degrees added per frame while the page is idle. */
  autoRotateSpeed?: number;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius = 520, autoRotateSpeed = 0.03, ...props }, ref) => {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [rotation, setRotation] = useState(0);
    const scrollOffset = useRef(0);
    const drift = useRef(0);
    const isScrolling = useRef(false);
    const scrollTimeout = useRef<number>();
    const frame = useRef<number>();

    useEffect(() => {
      const onScroll = () => {
        const el = wrapperRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const progress =
          (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        scrollOffset.current = Math.max(-0.2, Math.min(1.2, progress)) * 360;
        isScrolling.current = true;
        window.clearTimeout(scrollTimeout.current);
        scrollTimeout.current = window.setTimeout(() => {
          isScrolling.current = false;
        }, 150);
      };

      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.clearTimeout(scrollTimeout.current);
      };
    }, []);

    useEffect(() => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const tick = () => {
        if (!prefersReduced && !isScrolling.current) {
          drift.current += autoRotateSpeed;
        }
        setRotation(scrollOffset.current + drift.current);
        frame.current = requestAnimationFrame(tick);
      };

      frame.current = requestAnimationFrame(tick);
      return () => {
        if (frame.current) cancelAnimationFrame(frame.current);
      };
    }, [autoRotateSpeed]);

    const anglePerItem = items.length ? 360 / items.length : 0;

    return (
      <div
        ref={(node) => {
          wrapperRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn("relative w-full overflow-hidden", className)}
        {...props}
      >
        <div
          className="relative mx-auto h-[420px] w-full md:h-[520px]"
          style={{ perspective: "1400px" }}
        >
          <div
            className="absolute left-1/2 top-1/2 h-0 w-0"
            style={{
              transformStyle: "preserve-3d",
              transform: `translate(-50%, -50%) rotateX(-6deg) rotateY(${rotation}deg)`,
            }}
          >
            {items.map((item, i) => {
              const itemAngle = i * anglePerItem;
              const relative = (itemAngle + (rotation % 360) + 360) % 360;
              const normalized = relative > 180 ? 360 - relative : relative;
              const opacity = Math.max(0.22, 1 - normalized / 150);
              const Tag = item.href ? "a" : "div";

              return (
                <Tag
                  key={`${item.common}-${i}`}
                  {...(item.href ? { href: item.href } : {})}
                  className="absolute block"
                  style={{
                    width: "clamp(150px, 20vw, 230px)",
                    marginLeft: "calc(clamp(150px, 20vw, 230px) / -2)",
                    marginTop: "calc(clamp(200px, 27vw, 306px) / -2)",
                    transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                    opacity,
                    transition: "opacity 200ms linear",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <div
                    className="overflow-hidden"
                    style={{ backgroundColor: "#F4EBE2", aspectRatio: "3 / 4" }}
                  >
                    <img
                      src={item.photo.url}
                      alt={item.photo.text}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: item.photo.pos ?? "50% 50%" }}
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <p
                      className="font-cormorant text-[16px] md:text-[18px]"
                      style={{ color: "#1A1614" }}
                    >
                      {item.common}
                    </p>
                    <p
                      className="mt-1 text-[9px] uppercase tracking-[0.24em]"
                      style={{ color: "#9A7634" }}
                    >
                      {item.binomial}
                    </p>
                  </div>
                </Tag>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);

CircularGallery.displayName = "CircularGallery";

export { CircularGallery };
