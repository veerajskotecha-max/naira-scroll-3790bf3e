import { Link } from "react-router-dom";

/**
 * Clickable strip — the marquee doubles as the entry point to the jewellery,
 * so the line in the copy has somewhere to land.
 *
 * Three promises, in the order the owner asked for: the sale, the shipping,
 * the small run. NAIRA10 used to alternate here too, but the code was asked
 * off the header — it still exists in Shopify and the resolver still accepts
 * it, it is simply no longer advertised here.
 *
 * The run is separated by a flower rather than a comma so the three read as
 * one sentence the eye keeps meeting, not as three unrelated notices.
 */
const MESSAGES = [
  "SITEWIDE SALE",
  "FREE INSURED SHIPPING ON ALL ORDERS",
  "MADE IN LIMITED BATCHES",
];

/*
  The shared marquee animates translateX(0) → translateX(-50%) in 22s, so the
  run must be exactly two identical halves or it visibly jumps on loop. Each
  half carries the sequence CYCLES times — the owner asked for the three lines
  to come round three times — and the duration is scaled by the same number,
  so a line still crosses the screen at the pace it did with one cycle.
*/
const CYCLES = 3;
const SHARED_MARQUEE_S = 22;

const AnnouncementBar = () => (
  <div
    data-announcement
    className="pause-animation w-full overflow-hidden"
    style={{ backgroundColor: "#AEBDB6", height: "var(--announcement-h)" }}
  >
    <Link
      to="/jewellery"
      aria-label="Shop the jewellery — sitewide sale, free insured shipping on all orders, made in limited batches"
      className="flex items-center h-full"
    >
      <div
        className="animate-marquee flex shrink-0 items-center whitespace-nowrap"
        style={{ animationDuration: `${SHARED_MARQUEE_S * CYCLES}s` }}
      >
        {Array.from({ length: CYCLES * 2 }, (_, i) => MESSAGES[i % MESSAGES.length]).map((text, i) => (
          <span
            key={i}
            className="font-sans text-[11px] md:text-[12px] lg:text-[13px] font-medium uppercase tracking-[0.18em] px-8"
            style={{ color: "#FFFFFF" }}
          >
            <span aria-hidden="true">&#10022;</span>
            {text}
          </span>
        ))}
      </div>
    </Link>
  </div>
);

export default AnnouncementBar;
