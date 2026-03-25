import { Shirt, RotateCcw, Hand, ShieldCheck } from "lucide-react";

const items = [
  { icon: Shirt, label: "Customised Dresses" },
  { icon: RotateCcw, label: "Easy Returns" },
  { icon: Hand, label: "Authentic Handwork" },
  { icon: ShieldCheck, label: "Secure Payments" },
];

const ItemRow = () => (
  <>
    {items.map((item, i) => (
      <div key={i} className="flex items-center gap-2 md:gap-3 flex-shrink-0 px-6 md:px-8">
        <item.icon
          size={16}
          strokeWidth={1.3}
          style={{ color: "hsl(20 30% 45%)" }}
          className="flex-shrink-0 md:[&]:w-5 md:[&]:h-5"
        />
        <span
          className="font-cormorant text-[11.5px] md:text-[14px] font-medium uppercase tracking-[0.1em] md:tracking-[0.14em] whitespace-nowrap"
          style={{ color: "hsl(0 0% 35%)" }}
        >
          {item.label}
        </span>
        <span
          className="ml-6 md:ml-8 text-[10px]"
          style={{ color: "hsl(0 0% 75% / 0.6)" }}
        >
          •
        </span>
      </div>
    ))}
  </>
);

const TrustStrip = () => (
  <section
    className="w-full py-5 md:py-6 overflow-hidden"
    style={{ backgroundColor: "hsl(30 25% 96%)" }}
  >
    <div
      className="flex items-center w-max animate-[marquee-trust_25s_linear_infinite] hover:[animation-play-state:paused]"
    >
      <ItemRow />
      <ItemRow />
      <ItemRow />
    </div>

    <style>{`
      @keyframes marquee-trust {
        0% { transform: translateX(0); }
        100% { transform: translateX(-33.333%); }
      }
    `}</style>
  </section>
);

export default TrustStrip;
