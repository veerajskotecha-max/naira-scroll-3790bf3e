import { useEffect, useRef, useState } from "react";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import floralPatternBg from "@/assets/floral-pattern-bg.webp";

import reelPoster1 from "@/assets/reel-poster-1.jpg";
import reelPoster2 from "@/assets/reel-poster-2.jpg";
import reelPoster3 from "@/assets/reel-poster-3.jpg";

import carouselBride1 from "@/assets/carousel-bride-1.jpg";
import carouselBride2 from "@/assets/carousel-bride-2.jpg";
import carouselFestive1 from "@/assets/carousel-festive-1.jpg";
import carouselFestive2 from "@/assets/carousel-festive-2.jpg";
import carouselFusion1 from "@/assets/carousel-fusion-1.jpg";
import carouselFusion2 from "@/assets/carousel-fusion-2.jpg";

/* ── data ── */
const reels = [
  { poster: reelPoster1, caption: "Bride receiving her custom lehenga" },
  { poster: reelPoster2, caption: "Hand embroidery in progress" },
  { poster: reelPoster3, caption: "Final outfit reveal" },
];

const carousels = [
  {
    title: "Bride Custom Designs",
    items: [
      { image: carouselBride1, caption: "Royal red bridal lehenga with zardosi embroidery" },
      { image: carouselBride2, caption: "Ivory & gold bridal ensemble with intricate beadwork" },
      { image: carouselBride1, caption: "Classic crimson bridal set with dupatta" },
    ],
  },
  {
    title: "Festive & Wedding Guest Outfits",
    items: [
      { image: carouselFestive1, caption: "Pastel embroidered kurta set for celebrations" },
      { image: carouselFestive2, caption: "Mauve designer anarkali with gold accents" },
      { image: carouselFestive1, caption: "Blush pink festive co-ord set" },
    ],
  },
  {
    title: "Modern Custom Sarees & Fusion Wear",
    items: [
      { image: carouselFusion1, caption: "Contemporary draped saree in neutral tones" },
      { image: carouselFusion2, caption: "Metallic gold tissue saree with contrast border" },
      { image: carouselFusion1, caption: "Modern minimalist saree with structured blouse" },
    ],
  },
];

/* ── Carousel sub-component ── */
const ImageCarousel = ({
  title,
  items,
}: {
  title: string;
  items: { image: string; caption: string }[];
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.7;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="mb-14 md:mb-18 last:mb-0">
      {/* Carousel header */}
      <div className="flex items-center justify-between mb-5">
        <h3
          className="font-cormorant text-[20px] md:text-[24px] font-semibold"
          style={{ color: "hsl(0 0% 18%)" }}
        >
          {title}
        </h3>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
            style={{
              border: "1px solid hsl(0 0% 80%)",
              color: "hsl(0 0% 40%)",
            }}
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
            style={{
              border: "1px solid hsl(0 0% 80%)",
              color: "hsl(0 0% 40%)",
            }}
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="snap-start shrink-0 w-[80%] md:w-[45%] lg:w-[34%]"
          >
            <div className="rounded-xl overflow-hidden" style={{ boxShadow: "0 2px 14px -4px hsla(0,0%,0%,0.08)" }}>
              <img
                src={item.image}
                alt={item.caption}
                className="w-full aspect-[3/2] object-cover"
                loading="lazy"
              />
            </div>
            <p
              className="font-cormorant text-[13px] md:text-[14px] mt-3 leading-relaxed"
              style={{ color: "hsl(0 0% 45%)" }}
            >
              {item.caption}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Main section ── */
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
      className="relative w-full overflow-hidden py-[70px] md:py-[100px] lg:py-[130px]"
      style={{ backgroundColor: "hsl(30 25% 96%)" }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${floralPatternBg})`,
          backgroundSize: "600px",
          backgroundRepeat: "repeat",
          opacity: 0.05,
        }}
      />

      <div ref={sectionRef} className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10">
        {/* Section heading */}
        <div
          className={`text-center mb-14 md:mb-18 transition-all ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
          style={{ transitionDuration: "0.6s" }}
        >
          <p
            className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.15em] mb-3"
            style={{ color: "hsl(160 15% 45%)" }}
          >
            CUSTOMER STORIES
          </p>
          <h2
            className="font-cormorant text-[28px] md:text-[36px] lg:text-[46px] font-medium leading-tight mb-4"
            style={{ color: "hsl(0 0% 18%)" }}
          >
            Real Custom{" "}
            <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
              Creations
            </span>
          </h2>
          <p
            className="font-cormorant text-[14px] md:text-[16px] leading-relaxed max-w-[520px] mx-auto"
            style={{ color: "hsl(0 0% 48%)" }}
          >
            See how our clients bring their dream outfits to life through
            Naira's customization process.
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(160 12% 72%)" }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(160 15% 55%)" }} />
            <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(160 12% 72%)" }} />
          </div>
        </div>

        {/* ── Reels Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-16 md:mb-20">
          {reels.map((reel, i) => (
            <div
              key={i}
              className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all ease-out ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{
                boxShadow: "0 4px 20px -6px hsla(0,0%,0%,0.12)",
                transitionDuration: "0.6s",
                transitionDelay: visible ? `${i * 0.12 + 0.2}s` : "0s",
              }}
            >
              <img
                src={reel.poster}
                alt={reel.caption}
                className="w-full aspect-[9/16] object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Overlay */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300"
                style={{ backgroundColor: "hsla(0,0%,0%,0.2)" }}
              >
                {/* Play button */}
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
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

              {/* Caption */}
              <div
                className="absolute bottom-0 left-0 right-0 px-4 py-3"
                style={{
                  background:
                    "linear-gradient(to top, hsla(0,0%,0%,0.5), transparent)",
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
          ))}
        </div>

        {/* ── Image Carousels ── */}
        {carousels.map((carousel, i) => (
          <ImageCarousel key={i} title={carousel.title} items={carousel.items} />
        ))}
      </div>
    </section>
  );
};

export default CustomizationStories;
