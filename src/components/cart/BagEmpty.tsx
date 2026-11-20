import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { cleanButton } from "@/components/clean";
import { cardCover } from "@/lib/cardCover";
import { shopifyImage } from "@/lib/shopifyImage";
import type { JewelPiece } from "@/data/jewellery";

/*
  The bag with nothing in it: the sentence, the two pieces most often bought,
  each one tap from the bag, and one way on. The pieces are rows between
  hairlines (photo, name, price, an outlined Add), not cards; the one filled
  button is the way to the jewellery. No offer strip and no foot: there is
  nothing yet for them to describe.

  A row's photo and name open the piece's page, so it can be seen before it
  is added; the bag closes on the way out and the phone's back returns.
*/
type Props = {
  /** The best-sellers that can be bought right now; may be none. */
  pieces: JewelPiece[];
  /** The handle of the piece being added, if any. */
  adding: string | null;
  onAdd: (piece: JewelPiece) => void;
  /** Closes the bag before following a link out of it. */
  onLeave: (event: MouseEvent<HTMLAnchorElement>) => void;
};

const RULE = "border-[color:var(--nc-rule)]";

const BagEmpty = ({ pieces, adding, onAdd, onLeave }: Props) => (
  <div className="flex flex-1 flex-col overflow-y-auto">
    <div className="flex flex-1 flex-col justify-center px-4 py-6">
      <p className="nc-heading nc-heading--sheet text-center">Your bag is empty</p>
      {pieces.length > 0 && (
        <>
          <p className="nc-label mt-8">Most loved</p>
          <ul className={`mt-2 border-t ${RULE}`}>
            {pieces.map((piece) => (
              <li key={piece.handle} data-piece-card={piece.handle} className={`flex items-center gap-3 border-b ${RULE} py-3`}>
                <Link to={`/jewellery/${piece.handle}`} onClick={onLeave} tabIndex={-1} aria-hidden="true" className="shrink-0">
                  <img
                    src={shopifyImage(cardCover(piece), 120) || cardCover(piece)}
                    alt=""
                    className="h-[60px] w-[48px] bg-[var(--nc-linen)] object-cover"
                    width={48}
                    height={60}
                    loading="lazy"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/jewellery/${piece.handle}`}
                    onClick={onLeave}
                    className="nc-text relative block !leading-5 before:absolute before:inset-x-0 before:-inset-y-3 before:content-['']"
                  >
                    <span className="block truncate">{piece.name}</span>
                  </Link>
                  <p className="nc-small">{piece.priceLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onAdd(piece)}
                  disabled={adding === piece.handle}
                  aria-label={`Add ${piece.name} to bag`}
                  className={`${cleanButton({ size: "sm" })} shrink-0`}
                >
                  {adding === piece.handle ? <Loader2 size={14} strokeWidth={1.25} className="animate-spin" aria-hidden="true" /> : "Add"}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <Link to="/jewellery" onClick={onLeave} className={`${cleanButton({ fill: "ink", block: true })} ${pieces.length > 0 ? "mt-6" : "mt-8"}`}>
        Explore jewellery
      </Link>
    </div>
  </div>
);

export default BagEmpty;
