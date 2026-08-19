import { ShieldCheck, Droplets, Gem, MapPin } from "lucide-react";

const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const items = [
  { icon: ShieldCheck, label: "Anti-tarnish coating" },
  { icon: Droplets, label: "Waterproof sealed" },
  { icon: Gem, label: "18k gold / rhodium finish" },
] as const;

/**
 * Four assurance chips for the jewellery PDP, mounted under the
 * pre-order CTA block. Gold icons, Jost letterspaced labels,
 * hairline borders, sharp corners.
 */
const JewelTrustStrip = () => (
  <ul
    className="mt-4 grid list-none grid-cols-2 gap-px bg-[#1A1614]/10 p-px md:grid-cols-4"
    aria-label="Naira Flore jewellery assurances"
  >
    {items.map(({ icon: Icon, label }) => (
      <li
        key={label}
        className="flex flex-col items-center justify-center gap-2 bg-white px-2 py-4 text-center"
      >
        <Icon size={16} strokeWidth={1.4} aria-hidden="true" style={{ color: "#B0843A" }} />
        <span
          className="text-[10px] uppercase leading-[1.5] tracking-[0.14em] text-[#1A1614]/70 md:text-[11px]"
          style={jost}
        >
          {label}
        </span>
      </li>
    ))}
  </ul>
);

export default JewelTrustStrip;
