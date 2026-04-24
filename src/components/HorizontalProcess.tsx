import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import step01 from "@/assets/step-01-dream.jpg";
import step02 from "@/assets/step-02-design.jpg";
import step03 from "@/assets/step-03-consultation.jpg";
import step04 from "@/assets/7da639b9-dbe2-483c-a607-0c8381819967.webp";

const steps = [
  {
    label: "STEP 01",
    title: "Share Your Vision",
    desc: "Send a photo, sketch, or idea on WhatsApp — we'll take it from there.",
    image: step01,
    layout: "image-top" as const,
  },
  {
    label: "STEP 02",
    title: "Curated Design Options",
    desc: "Receive design directions, colour palettes, and fabric swatches handpicked for you.",
    image: step02,
    layout: "text-top" as const,
  },
  {
    label: "STEP 03",
    title: "Consultation Call",
    desc: "Refine measurements and finishing details on a quick call with our design team.",
    image: step03,
    layout: "image-top" as const,
  },
  {
    label: "STEP 04",
    title: "Delivered To You",
    desc: "Handcrafted with care, quality-checked, and delivered to your doorstep.",
    image: step04,
    layout: "text-top" as const,
  },
];

const HorizontalProcess = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const w = card ? card.offsetWidth + 24 : 320;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const w = card ? card.offsetWidth + 24 : 320;
    setActiveIdx(Math.round(el.scrollLeft / w));
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden py-16 md:py-20 lg:py-24"
      style={{ backgroundColor: "hsl(30 22% 96%)" }}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-16">
        {/* Heading */}
        <div
          className={`text-center mb-10 md:mb-14 transition-all duration-700 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          <p
            className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.18em] mb-3"
            style={{ color: "hsl(160 15% 45%)" }}
          >
            HOW IT WORKS
          </p>
          <h2
            className="font-cormorant text-[28px] md:text-[40px] lg:text-[48px] font-medium leading-tight"
            style={{ color: "hsl(0 0% 12%)" }}
          >
            Your Journey to Custom{" "}
            <span className="italic" style={{ color: "hsl(16 50% 68%)" }}>
              Perfection
            </span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(160 12% 72%)" }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(160 15% 55%)" }} />
            <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(160 12% 72%)" }} />
          </div>
        </div>

        {/* Scroll controls (desktop) */}
        <div className="hidden md:flex justify-end gap-2 mb-4">
          <button
            aria-label="Previous step"
            onClick={() => scrollByCard(-1)}
            className="w-10 h-10 flex items-center justify-center transition-all hover:-translate-y-0.5"
            style={{
              border: "1px solid hsl(160 12% 72%)",
              backgroundColor: "hsl(0 0% 100%)",
              color: "hsl(0 0% 18%)",
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Next step"
            onClick={() => scrollByCard(1)}
            className="w-10 h-10 flex items-center justify-center transition-all hover:-translate-y-0.5"
            style={{
              border: "1px solid hsl(160 12% 72%)",
              backgroundColor: "hsl(0 0% 100%)",
              color: "hsl(0 0% 18%)",
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Horizontal scroller */}
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="flex gap-5 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-6 px-6 md:mx-0 md:px-0"
          style={{ scrollPaddingLeft: "0px" }}
        >
          {steps.map((s, i) => (
            <article
              key={s.label}
              data-card
              className={`snap-start shrink-0 w-[78%] sm:w-[55%] md:w-[calc((100%-72px)/4)] flex flex-col transition-all ease-out hover:-translate-y-1 hover:shadow-xl ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(0 0% 92%)",
                boxShadow: "0 2px 14px -6px hsla(0,0%,0%,0.08)",
                transitionDuration: "0.6s",
                transitionDelay: visible ? `${i * 0.1 + 0.15}s` : "0s",
              }}
            >
              {s.layout === "image-top" ? (
                <>
                  <ImageBlock src={s.image} alt={s.title} />
                  <TextBlock {...s} />
                </>
              ) : (
                <>
                  <TextBlock {...s} />
                  <ImageBlock src={s.image} alt={s.title} />
                </>
              )}
            </article>
          ))}
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <span
              key={i}
              className="transition-all duration-300"
              style={{
                width: activeIdx === i ? 22 : 6,
                height: 6,
                borderRadius: 999,
                backgroundColor:
                  activeIdx === i ? "hsl(160 15% 45%)" : "hsl(160 12% 78%)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const ImageBlock = ({ src, alt }: { src: string; alt: string }) => (
  <div className="overflow-hidden" style={{ aspectRatio: "4/3" }}>
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
    />
  </div>
);

const TextBlock = ({
  label,
  title,
  desc,
}: {
  label: string;
  title: string;
  desc: string;
}) => (
  <div className="px-6 py-6 md:px-7 md:py-7 flex flex-col flex-1">
    <span
      className="text-[10.5px] font-semibold tracking-[0.18em] uppercase mb-2"
      style={{ color: "hsl(160 15% 45%)" }}
    >
      {label}
    </span>
    <h3
      className="font-cormorant text-[20px] md:text-[22px] font-semibold leading-snug mb-2"
      style={{ color: "hsl(0 0% 14%)" }}
    >
      {title}
    </h3>
    <p
      className="text-[13.5px] md:text-[14px] leading-[1.6]"
      style={{ color: "hsl(0 0% 38%)" }}
    >
      {desc}
    </p>
  </div>
);

export default HorizontalProcess;
