import { Link } from "react-router-dom";

/**
 * Clickable strip — the marquee doubles as the entry point to the jewellery,
 * so the line in the copy has somewhere to land.
 *
 * It carries two messages, alternating: scarcity, and the welcome code.
 *
 * The code earns its place back here. Two thirds of orders are a single piece,
 * which the buy-more ladder in the bag gives nothing, and the ladder is applied
 * by the bag rather than typed — so without a line telling shoppers NAIRA10
 * exists, the most common order carries no discount at all. The ladder stays
 * out of this strip: it belongs in the bag, where it can be acted on.
 *
 * The marquee animates to translateX(-50%), so the run must be exactly two
 * identical halves or it visibly jumps on loop. Repeating the PAIR twice keeps
 * that true — do not add a third message without making it four.
 */
const MESSAGES = [
  "LIMITED PIECES IN STOCK ✦ EACH STYLE MADE IN A SMALL RUN",
  "10% OFF YOUR ORDER WITH CODE NAIRA10",
];

const AnnouncementBar = () => (
  <div
    className="pause-animation w-full overflow-hidden"
    style={{ backgroundColor: "#AEBDB6", height: "var(--announcement-h)" }}
  >
    <Link
      to="/jewellery"
      aria-label="Shop the jewellery — limited pieces in stock, 10% off with code NAIRA10"
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
