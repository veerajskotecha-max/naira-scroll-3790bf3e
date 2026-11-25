import { BadgeCheck, Banknote, RotateCcw, Truck } from "lucide-react";
import UpiBadges from "@/components/checkout/UpiBadges";
import { MastercardMark, VisaMark } from "@/components/cart/PayMarks";

/*
  Reassurance right under the buttons, where the reel's pages put it: four
  things the shop already promises elsewhere on the site, said once and
  plainly, and the ways to pay as their own marks.

    Free shipping           insured and gift-boxed: the delivery terms
    7-day returns           the returns policy the bag links to
    3-year assurance        the plating assurance (Care, and the footer)
    Cash on delivery        the delivery terms

  Nothing here is new: each line is a promise the site makes today.
*/
const ITEMS = [
  { icon: Truck, title: "Free shipping", detail: "Insured, gift-boxed" },
  { icon: RotateCcw, title: "7-day returns", detail: "Exchange or return" },
  { icon: BadgeCheck, title: "3-year assurance", detail: "On the plating" },
  { icon: Banknote, title: "Cash on delivery", detail: "UPI and cards too" },
] as const;

/* A piece reserved on WhatsApp is paid for there, not at checkout: it keeps
   the three promises about the piece and leaves the ways to pay out. */
const PdpTrust = ({ reserved = false }: { reserved?: boolean }) => (
  <>
    <ul className="rn-trust" data-count={reserved ? 3 : 4} aria-label="What comes with every piece">
      {ITEMS.filter((item) => !reserved || item.icon !== Banknote).map(({ icon: Icon, title, detail }) => (
        <li key={title}>
          <Icon size={18} strokeWidth={1.25} aria-hidden="true" />
          <span>
            <b>{title}</b>
            <span>{detail}</span>
          </span>
        </li>
      ))}
    </ul>
    {!reserved && (
      <p className="rn-pay">
        <span className="nc-sr">Pay by UPI, Visa, Mastercard or cash on delivery.</span>
        <span aria-hidden="true">
          <UpiBadges size={20} />
          UPI
        </span>
        <span aria-hidden="true">
          <VisaMark height={10} />
          <MastercardMark height={15} />
          Cards
        </span>
        <span aria-hidden="true">Cash on delivery</span>
      </p>
    )}
  </>
);

export default PdpTrust;
