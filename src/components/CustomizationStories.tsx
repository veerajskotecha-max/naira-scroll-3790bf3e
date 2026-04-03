import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

const reels = [
  {
    embedUrl: "https://www.instagram.com/p/DVGbqSIjIQ3/embed/",
    link: "https://www.instagram.com/p/DVGbqSIjIQ3/",
    caption: "Bride receiving her custom lehenga",
  },
  {
    embedUrl: "https://www.instagram.com/reel/DSSQu51EjKS/embed/",
    link: "https://www.instagram.com/reel/DSSQu51EjKS/",
    caption: "Hand embroidery in progress",
  },
  {
    embedUrl: "https://www.instagram.com/p/DWHDChcDNOK/embed/",
    link: "https://www.instagram.com/p/DWHDChcDNOK/",
    caption: "Final outfit reveal",
  },
];

const CustomizationStories = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden py-[30px] md:py-[40px] lg:py-[56px]"
      style={{ backgroundColor: "hsl(0 0% 100%)" }}
    >
      <div ref={sectionRef} className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20">
        {/* Section heading */}
        <div
          className={`text-center mb-6 md:mb-8 transition-all ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
          style={{ transitionDuration: "0.6s" }}
        >
          <p
            className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.15em] mb-2"
            style={{ color: "hsl(160 15% 45%)" }}
          >
            CUSTOMER STORIES
          </p>
          <h2
            className="font-cormorant text-[28px] md:text-[36px] lg:text-[46px] font-medium leading-tight mb-3"
            style={{ color: "hsl(0 0% 18%)" }}
          >
            Where ideas become{" "}
            <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
              Outfits
            </span>
          </h2>
          <p
            className="font-cormorant text-[14px] md:text-[16px] leading-relaxed max-w-[520px] mx-auto"
            style={{ color: "hsl(0 0% 48%)" }}
          >
            See how each design comes to life, guided by our clients and
            crafted by Naira.
          </p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(160 12% 72%)" }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(160 15% 55%)" }} />
            <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(160 12% 72%)" }} />
          </div>
        </div>

        {/* Reels Grid — desktop: 3col, tablet: 2col, mobile: horizontal scroll */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {reels.map((reel, i) => (
            <ReelCard key={i} reel={reel} index={i} visible={visible} />
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="flex md:hidden gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
          {reels.map((reel, i) => (
            <div key={i} className="snap-start shrink-0 w-[80%]">
              <ReelCard reel={reel} index={i} visible={visible} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ReelCard = ({
  reel,
  index,
  visible,
}: {
  reel: (typeof reels)[0];
  index: number;
  visible: boolean;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);

  // Lazy load: only render iframe when card is near viewport
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    if (cardRef.current) obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-xl overflow-hidden transition-all ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{
        boxShadow: "0 4px 20px -6px hsla(0,0%,0%,0.12)",
        transitionDuration: "0.6s",
        transitionDelay: visible ? `${index * 0.12 + 0.2}s` : "0s",
        aspectRatio: "9/16",
        backgroundColor: "hsl(0 0% 8%)",
      }}
    >
      {inView && (
        <iframe
          src={reel.embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          title={reel.caption}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          style={{ borderRadius: "inherit" }}
        />
      )}

      {/* Loading placeholder */}
      {(!inView || !loaded) && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ backgroundColor: "hsl(0 0% 8%)" }}
        >
          <div
            className="w-11 h-11 md:w-12 md:h-12 flex items-center justify-center"
            style={{
              borderRadius: "50%",
              backgroundColor: "hsla(0,0%,100%,0.25)",
              backdropFilter: "blur(4px)",
              border: "1px solid hsla(0,0%,100%,0.35)",
            }}
          >
            <Play
              size={22}
              fill="hsl(0 0% 100%)"
              style={{ color: "hsl(0 0% 100%)", marginLeft: "2px" }}
            />
          </div>
        </div>
      )}

      {/* Caption overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 py-3 pointer-events-none z-10"
        style={{
          background: "linear-gradient(to top, hsla(0,0%,0%,0.5), transparent)",
        }}
      >
        <p
          className="font-cormorant text-[13px] md:text-[14px]"
          style={{ color: "hsl(0 0% 95%)" }}
        >
          {reel.caption}
        </p>
      </div>
    </div>
  );
};

export default CustomizationStories;
