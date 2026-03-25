import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, MessageCircle, HelpCircle, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import floralPatternBg from "@/assets/floral-pattern-bg.webp";

const contactCards = [
  {
    icon: MapPin,
    title: "Visit Us",
    lines: ["Naira Design Studio", "123 Couture Lane, Bandra West", "Mumbai, Maharashtra 400050"],
  },
  {
    icon: Phone,
    title: "Call or WhatsApp",
    lines: ["+91 98765 43210", "Mon – Sat, 10 AM – 7 PM IST"],
  },
  {
    icon: Mail,
    title: "Email Support",
    lines: ["hello@naira.in", "orders@naira.in"],
  },
];

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const sectionPadding = "py-[60px] md:py-[80px] lg:py-[100px]";
  const maxW = "max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20";

  const floralBg = (opacity = 0.06) => ({
    backgroundImage: `url(${floralPatternBg})`,
    backgroundSize: "600px",
    backgroundRepeat: "repeat" as const,
    opacity,
  });

  return (
    <div className="pt-[94px] md:pt-[100px] lg:pt-[116px]">
      {/* ── SECTION 1 — Hero ── */}
      <section className={`relative ${sectionPadding} overflow-hidden`} style={{ backgroundColor: "hsl(30 30% 97%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={floralBg(0.06)} />
        <div className={`relative z-10 ${maxW} text-center`}>
          <p
            className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.2em] mb-4"
            style={{ color: "hsl(160 15% 45%)" }}
          >
            GET IN TOUCH
          </p>
          <h1
            className="font-cormorant text-[32px] md:text-[42px] lg:text-[52px] font-medium leading-[1.15] mb-6"
            style={{ color: "hsl(0 0% 15%)" }}
          >
            Contact{" "}
            <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
              Us
            </span>
          </h1>
          <p
            className="font-cormorant text-[15px] md:text-[16px] lg:text-[17px] leading-[1.8] max-w-[560px] mx-auto"
            style={{ color: "hsl(0 0% 45%)" }}
          >
            We'd love to hear from you. Whether you have questions about our collections, custom designs, or orders, our
            team is here to help.
          </p>
        </div>
      </section>

      {/* ── SECTION 2 — Contact Cards ── */}
      <section className={sectionPadding} style={{ backgroundColor: "hsl(0 0% 100%)" }}>
        <div className={maxW}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {contactCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl p-8 text-center transition-shadow duration-300 hover:shadow-lg"
                style={{
                  backgroundColor: "hsl(30 30% 98%)",
                  border: "1px solid hsl(30 20% 92%)",
                }}
              >
                <div
                  className="w-9 h-9 flex items-center justify-center mx-auto mb-4"
                  style={{ borderRadius: '50%', backgroundColor: "hsl(143 14% 93%)" }}
                >
                  <card.icon size={16} style={{ color: "hsl(143 14% 50%)" }} />
                </div>
                <h3
                  className="font-cormorant text-[20px] md:text-[22px] font-semibold mb-3"
                  style={{ color: "hsl(0 0% 15%)" }}
                >
                  {card.title}
                </h3>
                {card.lines.map((line, i) => (
                  <p
                    key={i}
                    className="font-cormorant text-[14px] md:text-[15px] leading-[1.7]"
                    style={{ color: "hsl(0 0% 45%)" }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — Contact Form ── */}
      <section className={`relative ${sectionPadding} overflow-hidden`} style={{ backgroundColor: "hsl(30 30% 97%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={floralBg(0.05)} />
        <div className={`relative z-10 ${maxW}`}>
          <div className="text-center mb-10 md:mb-14">
            <p
              className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.2em] mb-4"
              style={{ color: "hsl(160 15% 45%)" }}
            >
              SEND A MESSAGE
            </p>
            <h2
              className="font-cormorant text-[28px] md:text-[36px] lg:text-[42px] font-medium leading-[1.15]"
              style={{ color: "hsl(0 0% 15%)" }}
            >
              We're Here to{" "}
              <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
                Help
              </span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="max-w-[640px] mx-auto space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
                className="border-[hsl(30_20%_88%)] bg-[hsl(0_0%_100%)] py-3 h-12 font-cormorant text-[15px] placeholder:text-[hsl(0_0%_60%)] focus-visible:ring-[hsl(143_14%_55%)]"
              />
              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
                className="rounded-xl border-[hsl(30_20%_88%)] bg-[hsl(0_0%_100%)] py-3 h-12 font-cormorant text-[15px] placeholder:text-[hsl(0_0%_60%)] focus-visible:ring-[hsl(143_14%_55%)]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="rounded-xl border-[hsl(30_20%_88%)] bg-[hsl(0_0%_100%)] py-3 h-12 font-cormorant text-[15px] placeholder:text-[hsl(0_0%_60%)] focus-visible:ring-[hsl(143_14%_55%)]"
              />
              <Input
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
                required
                className="rounded-xl border-[hsl(30_20%_88%)] bg-[hsl(0_0%_100%)] py-3 h-12 font-cormorant text-[15px] placeholder:text-[hsl(0_0%_60%)] focus-visible:ring-[hsl(143_14%_55%)]"
              />
            </div>
            <Textarea
              name="message"
              placeholder="Your Message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className="rounded-xl border-[hsl(30_20%_88%)] bg-[hsl(0_0%_100%)] py-3 font-cormorant text-[15px] placeholder:text-[hsl(0_0%_60%)] focus-visible:ring-[hsl(143_14%_55%)]"
            />

            <div className="text-center pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.1em] px-10 py-3.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ backgroundColor: "hsl(143 14% 63%)", color: "hsl(0 0% 100%)" }}
              >
                <Send size={15} />
                Submit Message
              </button>
            </div>

            {submitted && (
              <p className="text-center font-cormorant text-[15px]" style={{ color: "hsl(143 14% 50%)" }}>
                Thank you! Your message has been sent.
              </p>
            )}

            <p className="text-center font-cormorant text-[13px] md:text-[14px]" style={{ color: "hsl(0 0% 55%)" }}>
              Our team usually responds within 24–48 hours.
            </p>
          </form>
        </div>
      </section>

      {/* ── SECTION 4 — WhatsApp ── */}
      <section className={sectionPadding} style={{ backgroundColor: "hsl(0 0% 100%)" }}>
        <div className={`${maxW} text-center`}>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "hsl(143 14% 90%)" }}
          >
            <MessageCircle size={24} style={{ color: "hsl(143 14% 50%)" }} />
          </div>
          <h2
            className="font-cormorant text-[26px] md:text-[34px] lg:text-[40px] font-medium leading-[1.2] mb-4"
            style={{ color: "hsl(0 0% 15%)" }}
          >
            Need a quick{" "}
            <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
              answer?
            </span>
          </h2>
          <p
            className="font-cormorant text-[15px] md:text-[16px] leading-[1.8] max-w-[440px] mx-auto mb-8"
            style={{ color: "hsl(0 0% 45%)" }}
          >
            Chat with our team on WhatsApp for faster support.
          </p>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.1em] px-10 py-3.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ backgroundColor: "hsl(143 14% 63%)", color: "hsl(0 0% 100%)" }}
          >
            <MessageCircle size={16} />
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* ── SECTION 5 — FAQ Shortcut ── */}
      <section className={`relative ${sectionPadding} overflow-hidden`} style={{ backgroundColor: "hsl(30 30% 97%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={floralBg(0.05)} />
        <div className={`relative z-10 ${maxW} text-center`}>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "hsl(16 50% 92%)" }}
          >
            <HelpCircle size={24} style={{ color: "hsl(16 50% 60%)" }} />
          </div>
          <h2
            className="font-cormorant text-[26px] md:text-[34px] lg:text-[40px] font-medium leading-[1.2] mb-4"
            style={{ color: "hsl(0 0% 15%)" }}
          >
            Looking for quick{" "}
            <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
              answers?
            </span>
          </h2>
          <p
            className="font-cormorant text-[15px] md:text-[16px] leading-[1.8] max-w-[440px] mx-auto mb-8"
            style={{ color: "hsl(0 0% 45%)" }}
          >
            Visit our FAQ page to find answers to common questions.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.1em] px-10 py-3.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              border: "1.5px solid hsl(143 14% 63%)",
              color: "hsl(143 14% 50%)",
              backgroundColor: "transparent",
            }}
          >
            View FAQs
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
