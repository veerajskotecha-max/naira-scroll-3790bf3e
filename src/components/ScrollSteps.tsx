import { useEffect, useRef, useState, useCallback } from "react";
import { MessageSquare, Palette, Phone, Package } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    number: "01",
    title: "Send Us Your Dream Outfit",
    description:
      "Share your inspiration with us on WhatsApp — a photo, sketch, or even just an idea.",
  },
  {
    icon: Palette,
    number: "02",
    title: "Explore Design Options",
    description:
      "Our team will send you design suggestions, color palettes, and fabric options tailored to your idea.",
  },
  {
    icon: Phone,
    number: "03",
    title: "Consultation Call",
    description:
      "We align on measurements, finishing details, and final design choices during a quick consultation.",
  },
  {
    icon: Package,
    number: "04",
    title: "Delivered To You",
    description:
      "Your dream outfit is handcrafted, quality-checked, and delivered to your doorstep.",
  },
];

const TRANSITION_MS = 500;

const ScrollSteps = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState<"enter" | "exit">("enter");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const lockRef = useRef(false);
  const activeRef = useRef(0);

  const goTo = useCallback(
    (next: number) => {
      if (isAnimating || next < 0 || next >= steps.length || next === activeRef.current) return;
      setIsAnimating(true);
      setDirection("exit");

      setTimeout(() => {
        activeRef.current = next;
        setActiveStep(next);
        setDirection("enter");
        setTimeout(() => setIsAnimating(false), TRANSITION_MS);
      }, TRANSITION_MS);
    },
    [isAnimating]
  );

  /* wheel-driven step navigation while section is in view */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onIntersect: IntersectionObserverCallback = ([entry]) => {
      const inView = entry.isIntersecting && entry.intersectionRatio > 0.4;
      lockRef.current = inView;
      setIsLocked(inView);
    };

    const obs = new IntersectionObserver(onIntersect, { threshold: [0, 0.4, 0.6, 1] });
    obs.observe(section);

    const handleWheel = (e: WheelEvent) => {
      if (!lockRef.current) return;

      const down = e.deltaY > 0;
      const cur = activeRef.current;

      // Allow normal scroll if at boundaries
      if (down && cur >= steps.length - 1) {
        lockRef.current = false;
        setIsLocked(false);
        return;
      }
      if (!down && cur <= 0) {
        lockRef.current = false;
        setIsLocked(false);
        return;
      }

      e.preventDefault();
      goTo(down ? cur + 1 : cur - 1);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      obs.disconnect();
      window.removeEventListener("wheel", handleWheel);
    };
  }, [goTo]);

  /* Touch swipe support */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let startY = 0;

    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!lockRef.current) return;
      const diff = startY - e.changedTouches[0].clientY;
      const cur = activeRef.current;

      if (Math.abs(diff) < 40) return;

      const down = diff > 0;
      if (down && cur >= steps.length - 1) {
        lockRef.current = false;
        setIsLocked(false);
        return;
      }
      if (!down && cur <= 0) {
        lockRef.current = false;
        setIsLocked(false);
        return;
      }

      goTo(down ? cur + 1 : cur - 1);
    };

    section.addEventListener("touchstart", onTouchStart, { passive: true });
    section.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      section.removeEventListener("touchstart", onTouchStart);
      section.removeEventListener("touchend", onTouchEnd);
    };
  }, [goTo]);

  /* Re-lock when scrolling back into section */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reLockObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          const cur = activeRef.current;
          if (cur > 0 && cur < steps.length - 1) {
            lockRef.current = true;
            setIsLocked(true);
          }
        }
      },
      { threshold: 0.6 }
    );
    reLockObs.observe(section);
    return () => reLockObs.disconnect();
  }, []);

  const step = steps[activeStep];
  const StepIcon = step.icon;

  const cardStyle: React.CSSProperties =
    direction === "enter"
      ? {
          opacity: 1,
          transform: "translateX(0)",
          transition: `all ${TRANSITION_MS}ms ease-out`,
        }
      : {
          opacity: 0,
          transform: "translateX(-40px)",
          transition: `all ${TRANSITION_MS}ms ease-out`,
        };

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden py-[60px] md:py-[80px] lg:py-[120px]"
      style={{ backgroundColor: "hsl(30 20% 95%)", minHeight: "80vh" }}
    >
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20">
        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <p
            className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.15em] mb-3"
            style={{ color: "hsl(160 15% 45%)" }}
          >
            HOW IT WORKS
          </p>
          <h2
            className="font-cormorant text-[28px] md:text-[36px] lg:text-[46px] font-medium leading-tight"
            style={{ color: "hsl(0 0% 18%)" }}
          >
            Your Journey to Custom{" "}
            <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
              Perfection
            </span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(160 12% 72%)" }} />
            <div className="w-2 h-2" style={{ backgroundColor: "hsl(160 15% 55%)" }} />
            <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(160 12% 72%)" }} />
          </div>
        </div>

        {/* Single card area */}
        <div className="flex justify-center items-center" style={{ minHeight: "260px" }}>
          <div
            key={activeStep}
            className="flex flex-col items-center text-center px-8 py-10 w-full max-w-[380px]"
            style={{
              backgroundColor: "hsl(30 25% 96%)",
              boxShadow: "0 2px 14px -4px hsla(0,0%,0%,0.07)",
              border: "1px solid hsl(30 15% 90%)",
              ...cardStyle,
            }}
          >
            <div
              className="w-11 h-11 flex items-center justify-center mb-4"
              style={{ borderRadius: "50%", backgroundColor: "hsl(160 12% 91%)" }}
            >
              <StepIcon size={18} style={{ color: "hsl(160 15% 42%)" }} />
            </div>
            <span
              className="font-cormorant text-[12px] font-semibold tracking-[0.1em] mb-1"
              style={{ color: "hsl(160 15% 55%)" }}
            >
              STEP {step.number}
            </span>
            <h3
              className="font-cormorant text-[18px] md:text-[19px] font-semibold mb-2"
              style={{ color: "hsl(0 0% 18%)" }}
            >
              {step.title}
            </h3>
            <p
              className="font-cormorant text-[13px] md:text-[14px] leading-relaxed max-w-[260px]"
              style={{ color: "hsl(0 0% 48%)" }}
            >
              {step.description}
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-3 mt-10">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="flex flex-col items-center gap-1.5 transition-all duration-300 group"
              aria-label={`Go to step ${s.number}`}
            >
              <span
                className="font-cormorant text-[11px] font-semibold tracking-[0.08em] transition-colors duration-300"
                style={{
                  color: i === activeStep ? "hsl(160 15% 42%)" : "hsl(0 0% 72%)",
                }}
              >
                {s.number}
              </span>
              <div
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === activeStep ? "10px" : "6px",
                  height: i === activeStep ? "10px" : "6px",
                  backgroundColor:
                    i === activeStep ? "hsl(160 15% 45%)" : "hsl(0 0% 80%)",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollSteps;
