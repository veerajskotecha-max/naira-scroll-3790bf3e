import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "The quality is unmatched. I felt like a queen wearing the Midnight Silk Saree.",
    name: "Ananya S.",
    location: "Mumbai",
  },
  {
    quote:
      "Finally, a brand that understands fusion wear without compromising on elegance.",
    name: "Priya M.",
    location: "London",
  },
  {
    quote:
      "Customer service was exceptional, and the fit was perfect straight out of the box.",
    name: "Sarah K.",
    location: "Dubai",
  },
];

const Testimonials = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full py-[70px] md:py-[80px] lg:py-[100px]"
      style={{ backgroundColor: "hsl(0 0% 97%)" }}
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10">
        {/* Heading */}
        <div
          className={`text-center mb-10 md:mb-14 transition-all ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
          style={{ transitionDuration: "0.6s" }}
        >
          <h2
            className="font-cormorant text-[28px] md:text-[36px] lg:text-[46px] font-medium italic"
            style={{ color: "hsl(0 0% 18%)" }}
          >
            Loved by Women Everywhere
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center rounded-xl px-7 py-9 md:px-8 md:py-10 cursor-default transition-all ease-out hover:-translate-y-1 hover:shadow-lg ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{
                backgroundColor: "hsl(0 0% 100%)",
                boxShadow: "0 2px 14px -4px hsla(0,0%,0%,0.07)",
                transitionDuration: "0.5s",
                transitionDelay: visible ? `${i * 0.12 + 0.15}s` : "0s",
              }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    size={16}
                    fill="hsl(40 90% 55%)"
                    style={{ color: "hsl(40 90% 55%)" }}
                  />
                ))}
              </div>

              <p
                className="font-cormorant text-[15px] md:text-[16px] italic leading-relaxed mb-6"
                style={{ color: "hsl(0 0% 30%)" }}
              >
                "{t.quote}"
              </p>

              <p
                className="font-cormorant text-[15px] font-semibold"
                style={{ color: "hsl(0 0% 18%)" }}
              >
                {t.name}
              </p>
              <p
                className="font-cormorant text-[13px] mt-1"
                style={{ color: "hsl(0 0% 50%)" }}
              >
                {t.location}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
