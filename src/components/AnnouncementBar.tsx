import { Link } from "react-router-dom";

/**
 * Clickable strip — the marquee doubles as the entry point to the jewellery,
 * so the line in the copy has somewhere to land.
 *
 * It carries scarcity rather than a discount code: the buy-more ladder lives in
 * the bag, where the shopper can act on it, and a code in the header would only
 * compete with the one the bag applies by itself.
 */
const AnnouncementBar = () => {
  const text = "LIMITED PIECES IN STOCK \u2726 EACH STYLE MADE IN A SMALL RUN";

  return (
    <div
      className="pause-animation w-full overflow-hidden"
      style={{ backgroundColor: "#AEBDB6", height: "var(--announcement-h)" }}
    >
      <Link
        to="/jewellery"
        aria-label="Shop the jewellery — limited pieces in stock"
        className="flex items-center h-full"
      >
        <div className="animate-marquee flex shrink-0 items-center whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
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
};

export default AnnouncementBar;
