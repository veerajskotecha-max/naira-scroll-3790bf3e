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

    // Track viewport width so the ring geometry (card size + radius) can be
    // recomputed for phones, where a fixed radius made the 3D read flat.
    const [vw, setVw] = useState(
      typeof window === "undefined" ? 1280 : window.innerWidth,
    );
    useEffect(() => {
      const onResize = () => setVw(window.innerWidth);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, []);

    const isPhone = vw < 640;
    const cardW = Math.round(
      Math.max(126, Math.min(isPhone ? vw * 0.42 : vw * 0.16, 220)),
    );
    const cardH = Math.round(cardW * (4 / 3));
    const textBlock = isPhone ? 46 : 54;
    // Radius derived from the circumference the cards need, so they never
    // overlap regardless of how many items are passed in.
    const autoRadius = Math.round((items.length * cardW * 1.12) / (2 * Math.PI));
    const ringRadius = Math.max(isPhone ? 190 : 300, Math.min(autoRadius, radius));
    const stageH = cardH + textBlock + (isPhone ? 90 : 140);

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
          className="relative mx-auto w-full"
          style={{ height: stageH, perspective: isPhone ? "700px" : "1300px" }}
        >
          <div
            className="absolute left-1/2 top-1/2 h-0 w-0"
            style={{
              transformStyle: "preserve-3d",
              transform: `translate(-50%, -50%) rotateX(${isPhone ? -4 : -6}deg) rotateY(${rotation}deg)`,
            }}
          >
            {items.map((item, i) => {
              const itemAngle = i * anglePerItem;
              const relative = (itemAngle + (rotation % 360) + 360) % 360;
              const normalized = relative > 180 ? 360 - relative : relative;
              const opacity = Math.max(0.18, 1 - normalized / 130);
              const Tag = item.href ? "a" : "div";

              return (
                <Tag
                  key={`${item.common}-${i}`}
                  {...(item.href ? { href: item.href } : {})}
                  className="absolute block"
                  style={{
                    width: cardW,
                    marginLeft: -cardW / 2,
                    marginTop: -(cardH + textBlock) / 2,
                    transform: `rotateY(${itemAngle}deg) translateZ(${ringRadius}px)`,
                    opacity,
                    transition: "opacity 200ms linear",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <div
                    className="overflow-hidden"
                    style={{ backgroundColor: "#F4EBE2", height: cardH, width: cardW }}
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
                  <div
                    className="pt-2 text-center"
                    style={{ height: textBlock, overflow: "hidden" }}
                  >
                    <p
                      className="font-cormorant leading-tight"
                      style={{ color: "#1A1614", fontSize: isPhone ? 14 : 17 }}
                    >
                      {item.common}
                    </p>
                    <p
                      className="mt-1 uppercase leading-none"
                      style={{
                        color: "#9A7634",
                        fontSize: isPhone ? 8 : 9,
                        letterSpacing: "0.22em",
                      }}
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
