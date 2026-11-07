import { Link } from "react-router-dom";
import { QUANTITY_OFFERS } from "@/lib/promo";

/**
 * Clickable strip — the marquee doubles as the entry point to the jewellery,
 * so the line in the copy has somewhere to land.
 *
 * It leads with the buy-more offer (the owner, 2 Nov 2026: "add the offer
 * smartly to ... website headline"), read from promo.ts so it moves with the
 * ladder and always names what the bag takes off: Buy 3 at 20% and Buy 4 at
 * 30% since 7 Nov 2026, when the owner added Buy 4 and then took Buy 2 (10%)
 * away the same day ("we need only buy 3 20% off and buy 4 30% off"). The
 * owner had asked for the percentage to come off the strip on 25 Oct; the
 * later ask puts it back.
 * Then the sale (owner asked for the exclamation mark), the shipping promise
 * and the small-run scarcity line. NAIRA10 used to alternate here too, but the
 * owner asked for the code to come off the header; the code still exists in
 * Shopify and the resolver still accepts it.
 *
 * The marquee animates to translateX(-50%), so the run must be exactly two
 * identical halves or it visibly jumps on loop.
 */
const OFFER_LINE = QUANTITY_OFFERS.map(
  (offer) => `BUY ${offer.minQuantity} GET ${Math.round(offer.rate * 100)}% OFF`,
).join(" · ");

const MESSAGES = [OFFER_LINE, "SITEWIDE SALE LIVE TODAY!", "FREE INSURED SHIPPING", "MADE IN LIMITED BATCHES"];

/* The run keeps the pace it had before the offer led it: 22 s for the three
   older lines, about 108 characters' worth once each line's padding and star
   are counted as 13. The duration grows with the run, so the letters move as
   fast as they did, not faster (about 32 s with two rungs leading). */
const SECONDS_PER_CHARACTER = 22 / 108;
const SEPARATOR_CHARACTERS = 13;
const RUN_SECONDS =
  Math.round(SECONDS_PER_CHARACTER * MESSAGES.reduce((sum, text) => sum + text.length + SEPARATOR_CHARACTERS, 0) * 10) / 10;

const AnnouncementBar = () => (
  <div
    data-announcement
    className="pause-animation w-full overflow-hidden"
    style={{ backgroundColor: "#AEBDB6", height: "var(--announcement-h)" }}
  >
    <Link
      to="/jewellery"
      aria-label={`Shop the jewellery — ${OFFER_LINE.toLowerCase()}, sitewide sale live today, free insured shipping, made in limited batches`}
      className="flex items-center h-full"
    >
      <div className="animate-marquee flex shrink-0 items-center whitespace-nowrap" style={{ animationDuration: `${RUN_SECONDS}s` }}>
        {[...MESSAGES, ...MESSAGES].map((text, i) => (
          <span
            key={i}
            className="font-sans text-[11px] md:text-[12px] lg:text-[13px] font-medium uppercase tracking-[0.18em] px-8"
            style={{ color: "#FFFFFF" }}
          >
            {text}
            <span className="ml-8" aria-hidden="true">
              ✦
            </span>
          </span>
        ))}
      </div>
    </Link>
  </div>
);

export default AnnouncementBar;
