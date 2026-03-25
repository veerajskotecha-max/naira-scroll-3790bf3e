import { PenLine, Scissors, Flower } from "lucide-react";

const pillars = [
  { icon: PenLine, title: "Personalised" },
  { icon: Scissors, title: "Handcrafted" },
  { icon: Flower, title: "Floral-Inspired" },
];

const ItemRow = () => (
  <>
    {pillars.map((pillar, i) => (
      <div key={i} className="flex items-center gap-2 md:gap-3 flex-shrink-0 px-6 md:px-10">
        <pillar.icon
          size={18}
          strokeWidth={1.2}
          style={{ color: "hsl(160 15% 45%)" }}
          className="flex-shrink-0 md:[&]:w-6 md:[&]:h-6"
        />
        <span
          className="font-cormorant text-[13px] md:text-[16px] font-medium uppercase tracking-[0.12em] whitespace-nowrap"
          style={{ color: "hsl(0 0% 25%)" }}
        >
          {pillar.title}
        </span>
        <span
          className="ml-6 md:ml-10 text-[10px]"
          style={{ color: "hsl(0 0% 75% / 0.6)" }}
        >
          •
        </span>
      </div>
    ))}
  </>
);

const BrandEthos = () => (
  <section
    className="w-full py-8 md:py-8 overflow-hidden"
    style={{ backgroundColor: "hsl(30 25% 96%)" }}
  >
    <div
      className="flex items-center w-max animate-[marquee-ethos_30s_linear_infinite] hover:[animation-play-state:paused]"
    >
      <ItemRow />
      <ItemRow />
      <ItemRow />
    </div>

    <style>{`
      @keyframes marquee-ethos {
        0% { transform: translateX(-33.333%); }
        100% { transform: translateX(0); }
      }
    `}</style>
  </section>
);

export default BrandEthos;
