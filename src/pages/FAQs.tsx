import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";

const faqSections = [
  {
    id: "orders-customization",
    title: "Orders & Customization",
    items: [
      {
        q: "How does the customization process work?",
        a: "Our customization process begins with a consultation on WhatsApp, where you share your vision — reference images, preferred fabrics, colours, and embroidery styles. Our design team then creates a sketch and detailed plan for your approval before we begin handcrafting your piece.",
      },
      {
        q: "How long do custom orders take?",
        a: "Custom orders typically take 4–8 weeks depending on the complexity of the design, embroidery work, and fabric sourcing. We'll provide a more specific timeline during your consultation.",
      },
      {
        q: "Can I modify my order after placing it?",
        a: "Minor modifications can be accommodated within the first 48 hours of placing your order. Once production begins, changes may not be possible as materials are already cut and work has started. Please reach out to us on WhatsApp as soon as possible if you need any changes.",
      },
    ],
  },
  {
    id: "shipping-delivery",
    title: "Shipping & Delivery",
    items: [
      {
        q: "What are the delivery timelines?",
        a: "Standard (ready-to-ship) orders are delivered within 3–7 working days. Custom orders are delivered within 45–60 days, depending on the complexity of the piece.",
      },
      {
        q: "Do you offer express shipping?",
        a: "Currently, we do not offer express shipping for custom orders due to the handcrafted nature of our pieces. For standard orders, expedited shipping may be available — please contact us on WhatsApp for options.",
      },
      {
        q: "How can I track my order?",
        a: "Once your order is dispatched, you will receive a tracking link via WhatsApp and email. You can use this link to monitor your shipment in real time.",
      },
    ],
  },
  {
    id: "returns-exchanges",
    title: "Returns & Exchanges",
    items: [
      {
        q: "What is your return policy?",
        a: "Standard orders with manufacturing defects (damaged embroidery, incorrect stitching, fabric flaws, or staining) may be returned within 48 hours of delivery. After review, we offer repair, replacement, or store credit. Refunds to the original payment method are considered case-by-case.",
      },
      {
        q: "Are custom orders returnable?",
        a: "No. All custom-designed pieces are made to your unique specifications and are therefore non-returnable and non-exchangeable. Since each garment is crafted exclusively for you, we cannot accept returns, exchanges, or offer refunds on custom orders.",
      },
      {
        q: "What if I receive a defective product?",
        a: "Contact us via WhatsApp within 48 hours of delivery with your order number, photos of the defect, and a brief description of the issue. Our team will review and resolve the matter promptly.",
      },
    ],
  },
  {
    id: "product-care",
    title: "Product & Care",
    items: [
      {
        q: "How should I care for the product?",
        a: "We recommend dry cleaning only for all Naira garments. Store your pieces in a cool, dry place away from direct sunlight. Use muslin or cotton garment bags to protect the fabric and embroidery.",
      },
      {
        q: "Will the color match exactly what I see online?",
        a: "While we strive for accurate colour representation, slight variations may occur due to photographic lighting, screen settings, and display calibration. These are not considered defects.",
      },
      {
        q: "Are there slight variations in handcrafted pieces?",
        a: "Yes. Each piece is individually handcrafted by skilled artisans, so minor variations in embroidery, texture, or pattern placement are inherent to the artisanal process. These subtle differences make each piece truly one-of-a-kind.",
      },
    ],
  },
  {
    id: "contact-support",
    title: "Contact & Support",
    items: [
      {
        q: "How can I contact you?",
        a: "You can reach us via WhatsApp at +91 9561557935, or email us. Our team is available Monday to Saturday, 10 AM – 7 PM IST.",
      },
      {
        q: "Do you offer styling or customization assistance?",
        a: "Absolutely. Our design team is available for one-on-one styling consultations to help you choose the right silhouette, fabric, and embroidery for your occasion. Simply reach out on WhatsApp to schedule a session.",
      },
    ],
  },
];

const FAQs = () => {
  return (
    <>
      {/* Hero header */}
      <section
        className="w-full flex flex-col items-center justify-center text-center"
        style={{
          paddingTop: "clamp(100px, 12vw, 160px)",
          paddingBottom: "clamp(48px, 6vw, 80px)",
          backgroundColor: "#F4F1ED",
        }}
      >
        <h1
          className="font-cormorant font-semibold tracking-[0.04em]"
          style={{ fontSize: "clamp(32px, 4vw, 48px)", color: "hsl(0 0% 12%)" }}
        >
          Frequently Asked Questions
        </h1>
        <p
          className="font-cormorant mt-4 max-w-[520px] mx-auto px-6 leading-relaxed"
          style={{ fontSize: "clamp(15px, 1.4vw, 17px)", color: "hsl(0 0% 40%)" }}
        >
          Everything you need to know before placing your order
        </p>
      </section>

      {/* Anchor navigation */}
      <nav
        className="w-full flex flex-wrap justify-center gap-4 md:gap-8 py-5 px-4"
        style={{ borderBottom: "1px solid hsl(0 0% 88%)" }}
      >
        {faqSections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="font-cormorant text-[13px] md:text-[14px] tracking-[0.04em] transition-colors duration-200"
            style={{ color: "hsl(0 0% 40%)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 0% 12%)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(0 0% 40%)")}
          >
            {s.title}
          </a>
        ))}
      </nav>

      {/* Content */}
      <section
        className="w-full"
        style={{
          paddingTop: "clamp(48px, 6vw, 80px)",
          paddingBottom: "clamp(40px, 5vw, 60px)",
        }}
      >
        <div className="max-w-[760px] mx-auto px-6">
          {faqSections.map((section, i) => (
            <div
              key={section.id}
              id={section.id}
              className="scroll-mt-24"
              style={{
                paddingBottom: i < faqSections.length - 1 ? "clamp(32px, 4vw, 48px)" : 0,
                marginBottom: i < faqSections.length - 1 ? "clamp(32px, 4vw, 48px)" : 0,
                borderBottom: i < faqSections.length - 1 ? "1px solid hsl(0 0% 88%)" : "none",
              }}
            >
              <h2
                className="font-cormorant font-semibold tracking-[0.02em] mb-5"
                style={{ fontSize: "clamp(20px, 2.2vw, 26px)", color: "hsl(0 0% 12%)" }}
              >
                {section.title}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {section.items.map((item, j) => (
                  <AccordionItem
                    key={j}
                    value={`${section.id}-${j}`}
                    className="border-b"
                    style={{ borderColor: "hsl(0 0% 90%)" }}
                  >
                    <AccordionTrigger
                      className="py-4 text-left text-[14px] md:text-[15px] font-cormorant font-medium tracking-[0.01em] hover:no-underline"
                      style={{ color: "hsl(0 0% 20%)" }}
                    >
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p
                        className="font-cormorant text-[14px] md:text-[15px] leading-[1.8] pb-2"
                        style={{ color: "hsl(0 0% 40%)" }}
                      >
                        {item.a}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* Need Help CTA */}
      <section
        className="w-full flex flex-col items-center text-center"
        style={{
          paddingTop: "clamp(32px, 4vw, 56px)",
          paddingBottom: "clamp(48px, 6vw, 80px)",
        }}
      >
        <div
          className="w-full max-w-[760px] mx-auto px-6 pt-8"
          style={{ borderTop: "1px solid hsl(0 0% 88%)" }}
        >
          <h2
            className="font-cormorant font-semibold tracking-[0.02em]"
            style={{ fontSize: "clamp(20px, 2.2vw, 26px)", color: "hsl(0 0% 12%)", marginBottom: "12px" }}
          >
            Need Help?
          </h2>
          <p
            className="font-cormorant leading-relaxed mb-6"
            style={{ fontSize: "clamp(14px, 1.2vw, 16px)", color: "hsl(0 0% 40%)" }}
          >
            Can't find what you're looking for? Reach out to us directly on WhatsApp.
          </p>
          <a
            href="https://wa.me/919561557935"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 font-cormorant text-[13px] font-medium uppercase tracking-[0.12em] transition-colors duration-200"
            style={{
              backgroundColor: "hsl(0 0% 12%)",
              color: "hsl(0 0% 100%)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(0 0% 20%)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(0 0% 12%)")}
          >
            Contact on WhatsApp
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default FAQs;
