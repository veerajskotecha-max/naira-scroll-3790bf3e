import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const sections = [
  {
    id: "custom-orders",
    title: "Custom Orders (Made for You)",
    content: (
      <>
        <ul>
          <li>All custom-designed pieces are made to your unique specifications and are therefore <strong>non-returnable and non-exchangeable</strong>.</li>
          <li>Since each garment is crafted exclusively for you, we cannot accept returns, exchanges, or offer refunds on custom orders.</li>
        </ul>
      </>
    ),
  },
  {
    id: "standard-orders",
    title: "Standard (Ready-to-Ship) Orders",
    content: (
      <>
        <p>If you receive a standard product with a manufacturing defect (such as damaged embroidery, incorrect stitching, fabric flaws, or staining), you may request a return <strong>within 48 hours of delivery</strong>.</p>
        <p>To initiate a return, contact us via WhatsApp with:</p>
        <ul>
          <li>Order number</li>
          <li>Photos of the defect</li>
          <li>Brief description of the issue</li>
        </ul>
        <p>After review, we will offer either:</p>
        <ul>
          <li>Repair</li>
          <li>Replacement</li>
          <li>Store credit</li>
        </ul>
        <p>Refunds to the original payment method may be considered on a case-by-case basis.</p>
      </>
    ),
  },
  {
    id: "not-eligible",
    title: "Not Eligible for Returns",
    content: (
      <>
        <p>Items that have been:</p>
        <ul>
          <li>Worn</li>
          <li>Washed</li>
          <li>Altered</li>
          <li>Damaged by the customer</li>
        </ul>
        <p>Products where the issue is:</p>
        <ul>
          <li>Slight colour variations due to screen differences</li>
          <li>Minor irregularities inherent to handcrafted/artisanal work</li>
        </ul>
      </>
    ),
  },
];

const ExchangeReturnPolicy = () => {
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
          Exchange &amp; Return Policy
        </h1>
        <p
          className="font-cormorant mt-4 max-w-[520px] mx-auto px-6 leading-relaxed"
          style={{ fontSize: "clamp(15px, 1.4vw, 17px)", color: "hsl(0 0% 40%)" }}
        >
          Please review our policy carefully before making a purchase.
        </p>
      </section>

      {/* Anchor navigation */}
      <nav
        className="w-full flex justify-center gap-6 md:gap-10 py-5"
        style={{ borderBottom: "1px solid hsl(0 0% 88%)" }}
      >
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="font-cormorant text-[13px] md:text-[14px] tracking-[0.04em] transition-colors duration-200"
            style={{ color: "hsl(0 0% 40%)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 0% 12%)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(0 0% 40%)")}
          >
            {s.title.split("(")[0].trim()}
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
          {sections.map((section, i) => (
            <div
              key={section.id}
              id={section.id}
              className="scroll-mt-24"
              style={{
                paddingBottom: i < sections.length - 1 ? "clamp(32px, 4vw, 48px)" : 0,
                marginBottom: i < sections.length - 1 ? "clamp(32px, 4vw, 48px)" : 0,
                borderBottom: i < sections.length - 1 ? "1px solid hsl(0 0% 88%)" : "none",
              }}
            >
              <h2
                className="font-cormorant font-semibold tracking-[0.02em]"
                style={{ fontSize: "clamp(20px, 2.2vw, 26px)", color: "hsl(0 0% 12%)", marginBottom: "16px" }}
              >
                {section.title}
              </h2>
              <div
                className="font-cormorant leading-[1.8] space-y-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:leading-[1.7]"
                style={{ fontSize: "clamp(14px, 1.2vw, 16px)", color: "hsl(0 0% 30%)" }}
              >
                {section.content}
              </div>
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
            For any queries regarding exchanges or returns, reach out to us directly on WhatsApp.
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

export default ExchangeReturnPolicy;
