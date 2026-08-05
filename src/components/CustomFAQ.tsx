import { useState } from "react";
import { Plus, Minus } from "lucide-react";

/* ── FAQ data ── */
const faqCategories = [
  {
    label: "Custom Designs",
    items: [
      {
        q: "How does the customisation process work?",
        a: "It begins on WhatsApp, with whatever you have: a photograph, a sketch, an idea. Our design team responds with fabric options, colour palettes and embroidery styles suited to it. A consultation call settles measurements and details, and then our artisans begin.",
      },
      {
        q: "Can I customise an existing design from your collection?",
        a: "Yes. Choose any piece from our collection and adjust it to your preference: a different colour, fabric, neckline, length or embroidery pattern. Our team walks you through each option.",
      },
      {
        q: "Can I send my own design inspiration?",
        a: "Please do. Reference images, Pinterest boards, sketches, or simply a description of what you envision. Our designers work from whatever you bring.",
      },
      {
        q: "How long does a customised outfit take to create?",
        a: "Depending on the complexity of the design, most custom outfits take 4–8 weeks to complete. Heavily embroidered bridal pieces may take up to 10–12 weeks. We recommend starting early, especially for weddings and special occasions.",
      },
      {
        q: "Can I select my own fabrics and embroidery styles?",
        a: "Yes. We keep a curated selection of fabrics, silk, organza, georgette and velvet among them, alongside embroidery techniques such as zardosi, thread work, sequin work and mirror work.",
      },
      {
        q: "Do you offer virtual consultations?",
        a: "Yes. For clients who cannot visit in person, we hold consultations over video call. Our design team walks you through fabric swatches, colour options and design details until the outfit is exactly as you envisioned.",
      },
    ],
  },
  {
    label: "B2B Orders",
    items: [
      {
        q: "Do you accept bulk made-to-measure pieces for boutiques or events?",
        a: "Yes. We work with boutiques, event planners and designers on bulk made-to-measure pieces, from a wedding trousseau to a boutique collection to coordinated outfits for an event.",
      },
      {
        q: "What is the minimum order quantity for B2B customisation?",
        a: "It varies with the design and the level of customisation. As a rule, B2B orders begin at 10 pieces. Write to us with your requirements and we will share pricing.",
      },
      {
        q: "Can boutiques collaborate with Naira for exclusive designs?",
        a: "Yes. We welcome collaborations with boutiques seeking exclusive collections. Our design team works with you on pieces that sit well with your brand and your clientele.",
      },
      {
        q: "Do you provide wholesale pricing for bulk orders?",
        a: "Yes. Wholesale pricing depends on design complexity, fabric choice and order volume. Write to our B2B team for a quote made to your order.",
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
      className="relative w-full overflow-hidden py-[60px] md:py-[80px] lg:py-[120px]"
      style={{ backgroundColor: "#FAF8F6" }}
    >

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20">
        {/* Section heading */}
        <div className="text-center mb-12 md:mb-16">
          <p
            className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.15em] mb-3"
            style={{ color: "hsl(160 15% 45%)" }}
          >
            HELP CENTRE
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
