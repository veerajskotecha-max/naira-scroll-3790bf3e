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

const StepCard = ({
  step,
  index,
  isVisible,
}: {
  step: (typeof steps)[0];
  index: number;
  isVisible: boolean;
}) => {
  const StepIcon = step.icon;
  const textFirst = index % 2 === 0;

  const textBlock = (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-5 py-8 text-center md:min-h-[300px] md:px-8 lg:px-10">
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center"
        style={{
          borderRadius: "50%",
          backgroundColor: "hsl(160 12% 91%)",
        }}
      >
        <StepIcon size={20} style={{ color: "hsl(160 15% 42%)" }} />
      </div>
      <span
        className="mb-2 font-cormorant text-[13px] font-semibold uppercase tracking-[0.15em]"
        style={{ color: "hsl(160 15% 45%)" }}
      >
        Step {step.number}
      </span>
      <h3
        className="mb-4 font-cormorant text-[26px] font-semibold leading-tight md:text-[30px] lg:text-[34px]"
        style={{ color: "hsl(0 0% 12%)" }}
      >
        {step.title}
      </h3>
      <p
        className="max-w-[420px] text-[15px] leading-[1.75] md:text-[16px]"
        style={{ color: "hsl(0 0% 28%)" }}
      >
        {step.description}
      </p>
    </div>
  );

  const imageBlock = (
    <div className="flex min-h-[260px] items-center justify-center overflow-hidden md:min-h-[360px]">
      <img
        src={step.image}
        alt={step.title}
        loading="lazy"
        width={640}
        height={800}
        className="h-full max-h-[420px] w-full object-contain transition-transform duration-700 hover:scale-[1.03]"
      />
    </div>
  );

  return (
    <article
      className="grid h-full min-h-[520px] overflow-hidden transition-all duration-700 md:min-h-[680px]"
      style={{
        backgroundColor: "hsl(30 20% 98%)",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
      }}
    >
      {textFirst ? (
        <>
          {textBlock}
          {imageBlock}
        </>
      ) : (
        <>
          {imageBlock}
          {textBlock}
        </>
      )}
    </article>
  );
};

const desktopFrames = [steps.slice(0, 2), steps.slice(2, 4)];

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
        <div className="scrollbar-hide -mx-6 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden px-6 pb-4 md:-mx-10 md:px-10 lg:-mx-16 lg:px-16">
          <div className="hidden w-full shrink-0 snap-start md:grid md:grid-cols-2 md:gap-10 lg:gap-16">
            {desktopFrames[0].map((step, i) => (
              <div
                key={step.number}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
              >
                <StepCard step={step} index={i} isVisible={visibleSteps.has(i)} />
              </div>
            ))}
          </div>

          <div className="hidden w-full shrink-0 snap-start md:grid md:grid-cols-2 md:gap-10 lg:gap-16">
            {desktopFrames[1].map((step, i) => {
              const stepIndex = i + 2;
              return (
                <div
                  key={step.number}
                  ref={(el) => {
                    stepRefs.current[stepIndex] = el;
                  }}
                >
                  <StepCard step={step} index={stepIndex} isVisible={visibleSteps.has(stepIndex)} />
                </div>
              );
            })}
          </div>

          <div className="flex w-full shrink-0 snap-start md:hidden">
            <div
              className="w-full"
              ref={(el) => {
                stepRefs.current[0] = el;
              }}
            >
              <StepCard step={steps[0]} index={0} isVisible={visibleSteps.has(0)} />
            </div>
          </div>
          {steps.slice(1).map((step, i) => {
            const stepIndex = i + 1;
            return (
              <div key={step.number} className="flex w-full shrink-0 snap-start md:hidden">
                <div
                  className="w-full"
                  ref={(el) => {
                    stepRefs.current[stepIndex] = el;
                  }}
                >
                  <StepCard step={step} index={stepIndex} isVisible={visibleSteps.has(stepIndex)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ScrollSteps;
