import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { cleanButton, percent, rupees } from "@/components/clean";
import { nextPieceLine } from "@/components/pdp/renew";
import { cardCover } from "@/lib/cardCover";
import { shopifyImage } from "@/lib/shopifyImage";
import type { JewelPiece } from "@/data/jewellery";

/*
  One suggestion at the foot of the bag's list, while a richer step of the
  offer is still ahead: the piece that goes with the one added last
  (lib/pairings `bagAddOns`, the shop's own pairing), one tap from the bag.
  The reel's cart ("complete your setup and save 30%") with the shop's real
  offer and the bag's real arithmetic.

  The heading is what the next piece does, in the words the bag's foot has
  always used ("A third piece takes 15% off your bag"). The line under the
  name is what this piece does to THIS bag (promo.ts `addOnEffect`, the
  bag's resolver and rounding), and says whose figure it is: "Adds ₹355 to
  your total". On its own, beside the piece's struck price, "Adds ₹355" read
  as a sale price the bag then broke (the copy review, 25 Nov 2026), so the
  struck price is gone. A cheap piece that lifts a dear bag to the next step
  can lower the total; that is said as a drop, never as a negative sum.

  It stays at the foot of the list while the lines scroll under it, and on a
  short screen it is one row (renew.css `.rn-addon`): the heading is kept for
  a screen reader and the step it reaches rides after the figure instead.

  A row on the one tint, like a notice: no card, no shadow. The photo and
  the name open the piece's page, so it can be seen first.
*/
type Props = {
  piece: JewelPiece;
  /** What adding it does to the bag as it stands. */
  effect: { adds: number; saves: number; rate: number };
  /** The rate the bag has now, to know whether this piece reaches a new step. */
  rate: number;
  /** Pieces in the bag, the one on its way in included. */
  totalItems: number;
  adding: boolean;
  disabled: boolean;
  onAdd: () => void;
  /** Closes the bag before following a link out of it. */
  onLeave: (event: MouseEvent<HTMLAnchorElement>) => void;
};

const BagAddOn = ({ piece, effect, rate, totalItems, adding, disabled, onAdd, onLeave }: Props) => {
  const href = `/jewellery/${piece.handle}`;
  const lifts = effect.rate > rate;
  return (
    <aside data-bag-addon={piece.handle} className="rn-addon rn-tick-in" aria-label="Goes with your bag">
      <p className="nc-label nc-label--gold rn-addon__head">{nextPieceLine(totalItems, rate, effect.rate) || "Goes with your bag"}</p>
      <div className="rn-addon__row">
        <Link to={href} onClick={onLeave} tabIndex={-1} aria-hidden="true" className="shrink-0">
          <img src={shopifyImage(cardCover(piece), 120) || cardCover(piece)} alt="" className="rn-addon__photo" width={48} height={60} loading="lazy" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            to={href}
            onClick={onLeave}
            className="nc-text relative block !leading-5 before:absolute before:inset-x-0 before:-inset-y-3 before:content-['']"
          >
            <span className="block truncate">{piece.name}</span>
          </Link>
          <p className="nc-small truncate" data-addon-effect>
            {effect.adds > 0 ? (
              <span className="nc-small nc-small--ink">
                Adds {rupees(effect.adds)}
                <span className="rn-addon__long"> to your total</span>
              </span>
            ) : (
              <span className="nc-small nc-small--ink">{effect.adds < 0 ? `Your total drops by ${rupees(-effect.adds)}` : "Your total stays the same"}</span>
            )}
            {lifts && effect.adds > 0 && (
              <span className="rn-addon__rate nc-gold" aria-hidden="true">
                {" "}
                · {percent(effect.rate)} off your bag
              </span>
            )}
          </p>
        </div>
        <button type="button" onClick={onAdd} disabled={disabled} aria-label={`Add ${piece.name} to bag`} className={`${cleanButton({ size: "sm" })} shrink-0`}>
          {adding ? <Loader2 size={14} strokeWidth={1.25} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : "Add"}
        </button>
      </div>
    </aside>
  );
};

export default BagAddOn;
