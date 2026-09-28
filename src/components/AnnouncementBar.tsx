import { Link } from "react-router-dom";

/**
 * Clickable strip — the marquee doubles as the entry point to the jewellery,
 * so the line in the copy has somewhere to land.
 *
 * It carries ONE message now. NAIRA10 used to alternate here, but the owner
 * asked for the strip to carry only the shipping promise — on a narrow phone
 * the two-line marquee crowded the header. The code still exists in Shopify
 * and the resolver still accepts it; it is simply no longer advertised here.
 *
 * The marquee animates to translateX(-50%), so the run must be exactly two
 * identical halves or it visibly jumps on loop.
 */
const MESSAGES = ["FREE INSURED SHIPPING ON ALL ORDERS"];

const AnnouncementBar = () => (
  <div
    className="pause-animation w-full overflow-hidden"
    style={{ backgroundColor: "#AEBDB6", height: "var(--announcement-h)" }}
  >
    <Link
      to="/jewellery"
      aria-label="Shop the jewellery — free insured shipping on all orders"
      className="flex items-center h-full"
    >
      <div className="animate-marquee flex shrink-0 items-center whitespace-nowrap">
        {[...MESSAGES, ...MESSAGES].map((text, i) => (
          <span
            key={i}
            className="font-sans text-[11px] md:text-[12px] lg:text-[13px] font-medium uppercase tracking-[0.18em] px-8"
            style={{ color: "#FFFFFF" }}
          >
            {text}
          </span>
        ))}
      </div>
    </Link>
  </div>
);

export default AnnouncementBar;
