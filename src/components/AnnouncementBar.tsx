const strip1 =
  "HANDMADE EMBROIDERY \u2726 PREMIUM FABRICS \u2726 MADE TO ORDER \u2726 ARTISAN CRAFTED";
const strip2 =
  "CUSTOM DESIGN AVAILABLE \u2726 FREE SHIPPING ABOVE \u20B92999 \u2726 EASY RETURNS \u2726 SECURE PAYMENTS";

const MarqueeRow = ({
  text,
  reverse = false,
}: {
  text: string;
  reverse?: boolean;
}) => (
  <div className="pause-animation w-full overflow-hidden flex items-center" style={{ height: "50%" }}>
    <div
      className="flex shrink-0 items-center whitespace-nowrap"
      style={{
        animation: `marquee-${reverse ? "reverse" : "forward"} 38s linear infinite`,
      }}
    >
      {[...Array(6)].map((_, i) => (
        <span
          key={i}
          className="font-cormorant text-[10.5px] md:text-[11.5px] lg:text-[12.5px] font-medium uppercase tracking-[0.18em] px-10"
          style={{ color: "#FFFFFF" }}
        >
          {text}
        </span>
      ))}
    </div>
  </div>
);

const AnnouncementBar = () => (
  <div
    className="w-full overflow-hidden flex flex-col"
    style={{ backgroundColor: "#AEBDB6", height: "var(--announcement-h)" }}
  >
    <style>{`
      @keyframes marquee-forward {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes marquee-reverse {
        0% { transform: translateX(-50%); }
        100% { transform: translateX(0); }
      }
    `}</style>
    <MarqueeRow text={strip1} />
    <MarqueeRow text={strip2} reverse />
  </div>
);

export default AnnouncementBar;
