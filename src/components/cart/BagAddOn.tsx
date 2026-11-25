import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { cleanButton, percent, rupees } from "@/components/clean";
import { cardCover } from "@/lib/cardCover";
import { shopifyImage } from "@/lib/shopifyImage";
import type { JewelPiece } from "@/data/jewellery";

/*
  One suggestion at the foot of the bag's list, while a richer step of the
  offer is still ahead: the piece that goes with the one added last
  (lib/pairings `bagAddOns`, the shop's own pairing), one tap from the bag.
  The reel's cart ("complete your setup and save 30%") with the shop's real
  offer and the bag's real arithmetic.

  The line under the name is what the piece does to THIS bag (promo.ts
  `addOnEffect`, the bag's resolver and rounding): what it adds to the total,
  with its own price struck beside it when the step it reaches makes that
  less. A cheap piece that lifts a dear bag to the next step can lower the
  total; that is said as a drop, never as a negative sum.

  A row between hairlines on the one tint, like a notice: no card, no shadow.
  The photo and the name open the piece's page, so it can be seen first.
*/
type Props = {
  piece: JewelPiece;
  /** What adding it does to the bag as it stands. */
  effect: { adds: number; saves: number; rate: number };
  /** The rate the bag has now, to know whether this piece reaches a new step. */
  rate: number;
  adding: boolean;
  disabled: boolean;
  onAdd: () => void;
  /** Closes the bag before following a link out of it. */
  onLeave: (event: MouseEvent<HTMLAnchorElement>) => void;
};

const BagAddOn = ({ piece, effect, rate, adding, disabled, onAdd, onLeave }: Props) => {
  const href = `/jewellery/${piece.handle}`;
  const lifts = effect.rate > rate;
  const adds =
    effect.adds > 0 ? `Adds ${rupees(effect.adds)}` : effect.adds < 0 ? `Your total drops ${rupees(-effect.adds)}` : "Your total stays the same";
  return (
    <aside data-bag-addon={piece.handle} className="bg-[var(--nc-linen)] px-4 pb-3 pt-3" aria-label="Goes with your bag">
      <p className="nc-label nc-label--gold">{lifts ? `One more piece · ${percent(effect.rate)} off everything` : "Goes with your bag"}</p>
      <div className="mt-2 flex items-center gap-3">
        <Link to={href} onClick={onLeave} tabIndex={-1} aria-hidden="true" className="shrink-0">
          <img
            src={shopifyImage(cardCover(piece), 120) || cardCover(piece)}
            alt=""
            className="h-[60px] w-[48px] bg-[var(--nc-ivory)] object-cover"
            width={48}
            height={60}
            loading="lazy"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            to={href}
            onClick={onLeave}
            className="nc-text relative block !leading-5 before:absolute before:inset-x-0 before:-inset-y-3 before:content-['']"
          >
            <span className="block truncate">{piece.name}</span>
          </Link>
          <p className="nc-small">
            <span className="nc-small nc-small--ink">{adds}</span>
            {effect.adds > 0 && effect.adds < piece.price && <del className="ml-2">{piece.priceLabel}</del>}
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
