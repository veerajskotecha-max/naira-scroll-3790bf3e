import type { ReactNode } from "react";
import { percent } from "./format";
import { rungStates } from "./rungs";

/*
  The buy-more offer as words: "Buy 2 · 10% off" for each rung, in equal
  columns, with no box, rule or icon. The rung the bag sits on is gold; one it
  has climbed past steps back. The product page adds this piece's price at
  each rung under it (`each`); the bag centres the same three over its 2px
  line. The rungs themselves always come from promo.ts.
*/
type Offer = { code: string; minQuantity: number; rate: number };

type Props = {
  offers: readonly Offer[];
  /** Pieces in the bag, the one on its way in included. */
  totalItems: number;
  /** A second line under a rung, e.g. this piece's price there ("₹944 each"). */
  each?: (offer: Offer) => ReactNode;
  /** Centred, with " off" always drawn: the bag's strip. */
  centered?: boolean;
  /** No rung can be earned (a pre-order choice): every rung steps back and none is marked. */
  muted?: boolean;
  className?: string;
};

const CleanRungs = ({ offers, totalItems, each, centered = false, muted = false, className = "" }: Props) => {
  const states = rungStates(muted ? 0 : totalItems, offers.map((offer) => offer.minQuantity));
  return (
    <ul className={`nc-rungs ${centered ? "nc-rungs--center" : ""} ${className}`.trim()} data-muted={muted ? "" : undefined}>
      {offers.map((offer, index) => {
        const state = states[index];
        const reached = state !== "ahead";
        return (
          <li
            key={offer.code}
            className="nc-rung"
            data-rung={offer.minQuantity}
            data-reached={reached ? "" : undefined}
            data-current={state === "current" ? "" : undefined}
            data-passed={state === "passed" ? "" : undefined}
          >
            <span className="nc-rung__name">
              Buy {offer.minQuantity} · {percent(offer.rate)}
              <span className="nc-rung__off"> off</span>
            </span>
            {each ? <span className="nc-rung__each">{each(offer)}</span> : null}
            {state === "current" ? <span className="nc-sr">, in your bag</span> : null}
          </li>
        );
      })}
    </ul>
  );
};

export default CleanRungs;
