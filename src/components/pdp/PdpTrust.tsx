import { BadgeCheck, Banknote, RotateCcw, Truck } from "lucide-react";
import PayRow from "./PayRow";

/*
  Reassurance right under the buttons, where the reel's pages put it: four
  things the shop already promises elsewhere on the site, said once and
  plainly, and the ways to pay as their own marks.

    Free shipping           insured and gift-boxed: the delivery terms
    7-day returns           "On eligible pieces", the footer's own words
    3-year assurance        the plating assurance (Care, and the footer)
    Cash on delivery        on most pincodes: lib/serviceability refuses it
                            in some regions, so the line does not promise all

  Nothing here is new, and nothing says more than its source does. The
  returns line said "Exchange or return" until the copy review of 25 Nov
  2026: the published policy covers a piece that arrives faulty, so the line
  keeps to the words the footer already uses and the dropdown below links
  the policy itself.
*/
const ITEMS = [
  { icon: Truck, title: "Free shipping", detail: "Insured, gift-boxed" },
  { icon: RotateCcw, title: "7-day returns", detail: "On eligible pieces" },
  { icon: BadgeCheck, title: "3-year assurance", detail: "On the plating" },
  { icon: Banknote, title: "Cash on delivery", detail: "On most pincodes" },
] as const;

/* A piece pre-ordered on WhatsApp is paid for there, not at checkout: it keeps
   the three promises about the piece and leaves the ways to pay out.
   `questionHref` is a WhatsApp link about this piece: a first-time visitor's
   question, asked where she is deciding, at the right end of the pay marks'
   row (the conversion review, 25 Nov 2026: the link was only inside the
   Delivery dropdown). */
const PdpTrust = ({ reserved = false, questionHref }: { reserved?: boolean; questionHref?: string }) => (
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
      <PayRow>
        {questionHref && (
          <a href={questionHref} target="_blank" rel="noopener noreferrer" className="rn-pay__ask nc-link nc-link--ink nc-tap" data-ask>
            Questions? WhatsApp us
          </a>
        )}
      </PayRow>
    )}
  </>
);

export default PdpTrust;
