import { useEffect, useRef, useState } from "react";
import { MessageSquare, Palette, Phone, Package } from "lucide-react";
import step01Img from "@/assets/step-01-dream.jpg";
import step02Img from "@/assets/step-02-design.jpg";
import step03Img from "@/assets/step-03-consultation.jpg";
import step04Img from "@/assets/7da639b9-dbe2-483c-a607-0c8381819967.webp";

const steps = [
  {
    icon: MessageSquare,
    number: "01",
    title: "Send Us Your Dream Outfit",
    description:
      "Share your inspiration with us on WhatsApp — a photo, sketch, or even just an idea. We'll take it from there and begin bringing your vision to life.",
    image: step01Img,
  },
  {
    icon: Palette,
    number: "02",
    title: "Explore Design Options",
    description:
      "Our team will send you design suggestions, color palettes, and fabric options tailored to your idea — so you can see the possibilities before we begin.",
    image: step02Img,
  },
  {
    icon: Phone,
    number: "03",
    title: "Consultation Call",
    description:
      "We align on measurements, finishing details, and final design choices during a quick consultation to make sure everything is exactly how you want it.",
    image: step03Img,
  },
  {
    icon: Package,
    number: "04",
    title: "Delivered To You",
    description:
      "Your dream outfit is handcrafted with care, quality-checked to our standards, and delivered to your doorstep — ready to wear.",
    image: step04Img,
  },
];

const StepRow = ({
  step,
  index,
  isVisible,
}: {
  step: (typeof steps)[0];
  index: number;
  isVisible: boolean;
}) => {
  const isEven = index % 2 === 0;
  const StepIcon = step.icon;

  return (
    <div
      className="transition-all duration-700"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${index * 0.1}s`,
      }}
    >
      <div
        className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-12 lg:gap-20`}
      >
        {/* Image */}
        <div className="w-full md:w-1/2">
          <div className="overflow-hidden flex items-center justify-center">
            <img
              src={step.image}
              alt={step.title}
              loading="lazy"
              width={640}
              height={800}
              className="w-full h-auto object-contain transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>

        {/* Text */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
          <div
            className="w-12 h-12 flex items-center justify-center mb-5"
            style={{
              borderRadius: "50%",
              backgroundColor: "hsl(160 12% 91%)",
            }}
          >
            <StepIcon size={20} style={{ color: "hsl(160 15% 42%)" }} />
          </div>

          <span
            className="font-cormorant text-[13px] font-semibold tracking-[0.15em] uppercase mb-2"
            style={{ color: "hsl(160 15% 45%)" }}
          >
            Step {step.number}
          </span>

          <h3
            className="font-cormorant text-[26px] md:text-[30px] lg:text-[34px] font-semibold leading-tight mb-4"
            style={{ color: "hsl(0 0% 12%)" }}
          >
            {step.title}
          </h3>

          <p
            className="text-[15px] md:text-[16px] leading-[1.75] max-w-[440px]"
            style={{ color: "hsl(0 0% 28%)" }}
          >
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
};

const ScrollSteps = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = stepRefs.current.indexOf(
              entry.target as HTMLDivElement
            );
            if (idx !== -1) {
              setVisibleSteps((prev) => new Set(prev).add(idx));
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden py-16 md:py-24 lg:py-32"
      style={{ backgroundColor: "hsl(30 20% 96%)" }}
    >
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        {/* Heading */}
        <div className="text-center mb-16 md:mb-24">
          <p
            className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.15em] mb-3"
            style={{ color: "hsl(160 15% 45%)" }}
          >
            HOW IT WORKS
          </p>
          <h2
            className="font-cormorant text-[30px] md:text-[40px] lg:text-[50px] font-medium leading-tight"
            style={{ color: "hsl(0 0% 12%)" }}
          >
            Your Journey to Custom{" "}
            <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
              Perfection
            </span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div
              className="w-12 md:w-16 h-px"
              style={{ backgroundColor: "hsl(160 12% 72%)" }}
            />
            <div
              className="w-2 h-2"
              style={{ backgroundColor: "hsl(160 15% 55%)" }}
            />
            <div
              className="w-12 md:w-16 h-px"
              style={{ backgroundColor: "hsl(160 12% 72%)" }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-16 md:gap-24 lg:gap-32">
          {steps.map((step, i) => (
            <div
              key={step.number}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
            >
              <StepRow
                step={step}
                index={i}
                isVisible={visibleSteps.has(i)}
              />
              {i < steps.length - 1 && (
                <div className="flex justify-center mt-16 md:mt-24">
                  <div
                    className="w-px h-12 md:h-16"
                    style={{ backgroundColor: "hsl(160 12% 80%)" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollSteps;
