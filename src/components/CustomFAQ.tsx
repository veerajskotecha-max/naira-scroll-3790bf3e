import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import floralPatternBg from "@/assets/floral-pattern-bg.webp";

/* ── FAQ data ── */
const faqCategories = [
  {
    label: "Custom Designs",
    items: [
      {
        q: "How does the customization process work?",
        a: "Our customization process begins when you share your design inspiration — a photo, sketch, or idea — via WhatsApp. Our design team then creates tailored suggestions including fabric options, color palettes, and embroidery styles. After a consultation call to finalize measurements and details, our artisans handcraft your outfit with care.",
      },
      {
        q: "Can I customize an existing design from your collection?",
        a: "Absolutely! You can choose any piece from our collection and customize it to your preferences — whether it's a different color, fabric, neckline, length, or embroidery pattern. Our team will guide you through all the options.",
      },
      {
        q: "Can I send my own design inspiration?",
        a: "Yes, we encourage it! You can share reference images, Pinterest boards, sketches, or even a verbal description of what you envision. Our designers will work with you to bring your vision to life.",
      },
      {
        q: "How long does a customized outfit take to create?",
        a: "Depending on the complexity of the design, most custom outfits take 4–8 weeks to complete. Heavily embroidered bridal pieces may take up to 10–12 weeks. We recommend starting early, especially for weddings and special occasions.",
      },
      {
        q: "Can I select my own fabrics and embroidery styles?",
        a: "Yes! We offer a curated selection of premium fabrics including silk, organza, georgette, velvet, and more. You can also choose from various embroidery techniques such as zardosi, thread work, sequin work, and mirror work.",
      },
      {
        q: "Do you offer virtual consultations?",
        a: "Yes, we offer virtual consultations via video call for clients who are unable to visit in person. Our design team will walk you through fabric swatches, color options, and design details to ensure your outfit is exactly as you envisioned.",
      },
    ],
  },
  {
    label: "B2B Orders",
    items: [
      {
        q: "Do you accept bulk custom orders for boutiques or events?",
        a: "Yes, we work with boutiques, event planners, and designers for bulk custom orders. Whether it's a wedding trousseau, a boutique collection, or coordinated outfits for an event, our team can handle large-scale customization.",
      },
      {
        q: "What is the minimum order quantity for B2B customization?",
        a: "Our minimum order quantity varies depending on the design complexity and customization level. Generally, we accept B2B orders starting from 10 pieces. Contact us for specific requirements and pricing.",
      },
      {
        q: "Can boutiques collaborate with Naira for exclusive designs?",
        a: "Absolutely! We welcome collaborations with boutiques looking for exclusive collections. Our design team can work with you to create unique pieces that align with your brand identity and customer preferences.",
      },
      {
        q: "Do you provide wholesale pricing for bulk orders?",
        a: "Yes, we offer competitive wholesale pricing for bulk orders. Pricing depends on factors such as design complexity, fabric choice, and order volume. Reach out to our B2B team for a customized quote.",
      },
    ],
  },
];

/* ── Component ── */
const CustomFAQ = () => {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) =>
    setOpenIndex((prev) => (prev === key ? null : key));

  return (
    <section
      className="relative w-full overflow-hidden py-[70px] md:py-[100px] lg:py-[130px]"
      style={{ backgroundColor: "hsl(0 0% 100%)" }}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${floralPatternBg})`,
          backgroundSize: "700px",
          backgroundRepeat: "repeat",
          opacity: 0.04,
        }}
      />

      <div className="relative z-10 max-w-[1100px] mx-auto px-5 md:px-8 lg:px-10">
        {/* Section heading */}
        <div className="text-center mb-12 md:mb-16">
          <p
            className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.15em] mb-3"
            style={{ color: "hsl(160 15% 45%)" }}
          >
            HELP CENTER
          </p>
          <h2
            className="font-cormorant text-[28px] md:text-[36px] lg:text-[46px] font-medium leading-tight"
            style={{ color: "hsl(0 0% 18%)" }}
          >
            Frequently Asked{" "}
            <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
              Questions
            </span>
          </h2>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(160 12% 72%)" }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(160 15% 55%)" }} />
            <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(160 12% 72%)" }} />
          </div>
        </div>

        {/* FAQ categories in 2-col on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
          {faqCategories.map((cat) => (
            <div key={cat.label}>
              {/* Category label */}
              <h3
                className="font-cormorant text-[18px] md:text-[20px] font-semibold mb-5 pb-3"
                style={{
                  color: "hsl(0 0% 18%)",
                  borderBottom: "1px solid hsl(0 0% 90%)",
                }}
              >
                {cat.label}
              </h3>

              {/* Accordion items */}
              <div className="flex flex-col gap-0">
                {cat.items.map((item, i) => {
                  const key = `${cat.label}-${i}`;
                  const isOpen = openIndex === key;

                  return (
                    <div
                      key={key}
                      style={{ borderBottom: "1px solid hsl(0 0% 92%)" }}
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-start justify-between gap-4 py-4 text-left transition-colors duration-200 group"
                      >
                        <span
                          className="font-cormorant text-[15px] md:text-[16px] font-medium leading-snug"
                          style={{
                            color: isOpen
                              ? "hsl(0 0% 10%)"
                              : "hsl(0 0% 30%)",
                          }}
                        >
                          {item.q}
                        </span>
                        <span
                          className="shrink-0 mt-0.5 transition-colors duration-200"
                          style={{
                            color: isOpen
                              ? "hsl(160 15% 42%)"
                              : "hsl(0 0% 60%)",
                          }}
                        >
                          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                        </span>
                      </button>

                      {/* Answer */}
                      <div
                        className="overflow-hidden transition-all duration-300 ease-out"
                        style={{
                          maxHeight: isOpen ? "300px" : "0px",
                          opacity: isOpen ? 1 : 0,
                        }}
                      >
                        <p
                          className="font-cormorant text-[13px] md:text-[14px] leading-relaxed pb-4"
                          style={{ color: "hsl(0 0% 48%)" }}
                        >
                          {item.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomFAQ;
