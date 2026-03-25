import { Shirt, RotateCcw, Hand, ShieldCheck } from "lucide-react";

const items = [
  { icon: Shirt, label: "Customised Dresses" },
  { icon: RotateCcw, label: "Easy Returns" },
  { icon: Hand, label: "Authentic Handwork" },
  { icon: ShieldCheck, label: "Secure Payments" },
];

const TrustStrip = () => (
  <section
    className="w-full py-5 md:py-6"
    style={{ backgroundColor: "hsl(30 25% 96%)" }}
  >
    <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:flex md:flex-nowrap items-center justify-center md:justify-between gap-y-4 gap-x-4 md:gap-x-6">
      {items.map((item, i) => (
        <div key={i} className="flex items-center">
          <div className="flex items-center gap-2 md:gap-3 cursor-default">
            <item.icon
              size={16}
              strokeWidth={1.3}
              style={{ color: "hsl(20 30% 45%)" }}
              className="flex-shrink-0 md:[&]:w-5 md:[&]:h-5"
            />
            <span
              className="font-cormorant text-[11.5px] md:text-[14px] font-medium uppercase tracking-[0.1em] md:tracking-[0.14em]"
              style={{ color: "hsl(0 0% 35%)" }}
            >
              {item.label}
            </span>
          </div>
          {i < items.length - 1 && (
            <div
              className="hidden md:block ml-6 h-4 w-px"
              style={{ backgroundColor: "hsl(0 0% 75% / 0.4)" }}
            />
          )}
        </div>
      ))}
    </div>
  </section>
);

export default TrustStrip;
