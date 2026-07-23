import { useEffect, useRef, useState } from "react";
import timeline1 from "@/assets/about-dream-stitched.webp";
import timeline4 from "@/assets/about-founder.webp";
import uniquelyYours from "@/assets/about-uniquely-yours.webp";


const stories = [
  {
    label: "THE BEGINNING",
    title: "A Dream Stitched with Passion",
    text: "Naira grew from a deep love for Indian textiles and the belief that luxury craftsmanship should feel personal, yet accessible. What started as a small workshop with a handful of artisans has grown into a brand that celebrates the art of handmade fashion.",
    image: timeline1,
    alt: "Early Naira workshop",
  },
  {
    label: "B2B ROOTS",
    title: "Trusted by Boutiques Across India",
    text: "Naira initially built its reputation through partnerships with boutiques and retailers who recognized the quality and artistry of our handcrafted pieces.",
    image: null,
    alt: "",
  },
  {
    label: "THE B2C JOURNEY",
    title: "Bringing Couture Directly to You",
    text: "The desire to connect personally with every client led Naira to serve individuals directly — with one-on-one design consultations, custom creations, and a curated experience from first message to final delivery.",
    image: null,
    alt: "",
  },

  {
    label: "CUSTOMIZATION VISION",
    title: "Every Piece, Uniquely Yours",
    text: "We believe every person deserves an outfit that reflects their personality, their celebration, and their story. Over 2,500 custom pieces later, this belief only grows stronger.",
    image: uniquelyYours,
    alt: "Custom outfit creation process",
  },
  {
    label: "THE FOUNDERS",
    title: "A Family Legacy",
    text: "Naira is the shared vision of a mother's lifelong passion for textiles and her son's ambition to bring that artistry to the world. Together, they blend generational wisdom with contemporary design sensibility.",
    image: timeline4,
    alt: "Naira founders",
  },
];

const AboutTimeline = () => {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState<boolean[]>(stories.map(() => false));

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    refs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible((prev) => { const n = [...prev]; n[i] = true; return n; });
            obs.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden py-[60px] md:py-[80px] lg:py-[120px]"
      style={{ backgroundColor: "hsl(0 0% 100%)" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20">
        {/* Section heading */}
        <div className="text-center mb-14 md:mb-20">
          <p
            className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.15em] mb-3"
            style={{ color: "hsl(160 15% 45%)" }}
          >
            OUR JOURNEY
          </p>
          <h2
            className="font-cormorant text-[28px] md:text-[36px] lg:text-[46px] font-medium leading-tight"
            style={{ color: "hsl(0 0% 18%)" }}
          >
            Naira Over{" "}
            <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
              the Years
            </span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(160 12% 72%)" }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(160 15% 55%)" }} />
            <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(160 12% 72%)" }} />
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical timeline line — desktop only */}
          <div
            className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{ backgroundColor: "hsl(0 0% 88%)" }}
          />

          <div className="flex flex-col gap-16 md:gap-20 lg:gap-24">
            {stories.map((story, i) => {
              const isEven = i % 2 === 0;
              return (
                <div
                  key={i}
                  ref={(el) => { refs.current[i] = el; }}
                  className={`relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16 transition-all duration-700 ease-out ${
                    visible[i] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  } ${isEven ? "" : "lg:flex-row-reverse"}`}
                  style={{ transitionDelay: visible[i] ? "0.1s" : "0s" }}
                >
                  {/* Timeline dot — desktop */}
                  <div
                    className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full z-10"
                    style={{
                      backgroundColor: "hsl(160 15% 55%)",
                      boxShadow: "0 0 0 4px hsl(0 0% 100%), 0 0 0 5px hsl(0 0% 88%)",
                    }}
                  />

                  {/* Image */}
                  {story.image && (
                    <div className="w-full lg:w-[45%]">
                      <div
                        className="rounded-xl overflow-hidden"
                        style={{ boxShadow: "0 4px 24px -6px hsla(0,0%,0%,0.1)" }}
                      >
                        <img
                          src={story.image}
                          alt={story.alt}
                          className="w-full aspect-[4/3] object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}

                  {/* Text */}
                  <div className={`w-full text-center ${story.image ? "lg:w-[45%] lg:text-left" : "lg:w-[70%] lg:mx-auto"} ${isEven && story.image ? "lg:text-left" : ""} ${!isEven && story.image ? "lg:text-right" : ""}`}>
                    <p
                      className="text-[11px] font-medium uppercase tracking-[0.15em] mb-2"
                      style={{ color: "hsl(160 15% 45%)" }}
                    >
                      {story.label}
                    </p>
                    <h3
                      className="font-cormorant text-[22px] md:text-[26px] lg:text-[30px] font-semibold leading-snug mb-4"
                      style={{ color: "hsl(0 0% 15%)" }}
                    >
                      {story.title}
                    </h3>
                    <p
                      className={`font-cormorant text-[14px] md:text-[15px] leading-[1.8] ${story.image ? "max-w-[440px] mx-auto lg:mx-0" : "max-w-[560px] mx-auto"}`}
                      style={{ color: "hsl(0 0% 48%)" }}
                    >
                      {story.text}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutTimeline;
