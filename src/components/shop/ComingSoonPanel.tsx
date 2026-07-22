import { MessageCircle } from "lucide-react";

interface ComingSoonPanelProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  whatsappNumber?: string; // digits only, no +
  whatsappMessage?: string;
}

const ComingSoonPanel = ({
  eyebrow = "Launching Soon",
  title = "Coming Soon",
  description = "Our jewellery atelier is being hand-finished. Leave your name on the waitlist and be the first to preview each piece.",
  whatsappNumber = "919561557935",
  whatsappMessage = "Hi Naira Flore, I'd love to be notified when the jewellery collection launches.",
}: ComingSoonPanelProps) => {
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div
      className="w-full flex flex-col items-center justify-center text-center px-6 py-16 md:py-24"
      style={{
        minHeight: "420px",
        backgroundColor: "hsl(0 0% 99%)",
        border: "1px solid hsl(0 0% 90%)",
      }}
    >
      {/* Eyebrow */}
      <span
        className="text-[10px] md:text-[11px] uppercase tracking-[0.32em] font-medium"
        style={{ color: "hsl(186 35% 28%)" }}
      >
        {eyebrow}
      </span>

      {/* Sage divider */}
      <div
        className="mt-5 mb-6"
        style={{
          width: "48px",
          height: "1px",
          backgroundColor: "hsl(150 12% 71%)",
        }}
      />

      {/* Title */}
      <h3
        className="font-cormorant text-[32px] md:text-[44px] lg:text-[52px] font-semibold leading-[1.05] tracking-[-0.01em]"
        style={{ color: "hsl(0 0% 15%)" }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="mt-4 max-w-[440px] text-[13px] md:text-[14px] leading-[1.7]"
        style={{ color: "hsl(0 0% 45%)" }}
      >
        {description}
      </p>

      {/* WhatsApp CTA */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 text-[11px] uppercase tracking-[0.18em] font-medium transition-colors duration-200"
        style={{
          backgroundColor: "hsl(186 35% 28%)",
          color: "hsl(0 0% 100%)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 22%)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(186 35% 28%)")}
      >
        <MessageCircle size={14} strokeWidth={1.6} />
        Notify me on WhatsApp
      </a>
    </div>
  );
};

export default ComingSoonPanel;
