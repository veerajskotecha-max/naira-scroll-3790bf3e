import {
  TOP_QUANTITY_OFFER,
  earnedQuantityOffer,
  itemsToQuantityOffer,
  nextQuantityOffer,
  quantityOfferProgress,
} from "@/lib/promo";

const pct = (rate: number) => `${Math.round(rate * 100)}%`;

/**
 * The buy-more ladder, as a filling bar across the top of the bag.
 *
 * It sits above the items rather than beside the totals because it is a reason
 * to keep shopping, not a line of arithmetic — the shopper should meet it on
 * the way in. The fill is measured across the whole ladder, so adding a piece
 * always moves it forward instead of resetting at each rung.
 */
const OfferProgress = ({ totalItems }: { totalItems: number }) => {
  const earned = earnedQuantityOffer(totalItems);
  const next = nextQuantityOffer(totalItems);
  const away = itemsToQuantityOffer(totalItems);
  const progress = quantityOfferProgress(totalItems);

  return (
    <div className="border-b border-[color:rgb(var(--nf-ink-rgb)/0.08)] bg-[var(--nf-surface-raised)] px-5 py-3">
      <p className="text-[11px] uppercase tracking-[var(--nf-track-16)] text-muted-foreground">
        {next ? (
          <>
            {earned ? (
              <>
                <span className="text-primary">{pct(earned.rate)} off applied</span>
                {" · "}
              </>
            ) : null}
            Add {away === 1 ? "1 more piece" : `${away} more pieces`} for{" "}
            <span className="font-semibold text-primary">{pct(next.rate)} off</span>
          </>
        ) : (
          <span className="text-primary">
            Top offer unlocked — <span className="font-semibold">{pct(TOP_QUANTITY_OFFER.rate)} off</span> your pieces
          </span>
        )}
      </p>

      <div
        className="relative mt-2 h-[3px] w-full bg-[color:rgb(var(--nf-ink-rgb)/0.10)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOP_QUANTITY_OFFER.minQuantity}
        aria-valuenow={Math.min(totalItems, TOP_QUANTITY_OFFER.minQuantity)}
        aria-label={`${TOP_QUANTITY_OFFER.minQuantity} pieces unlock ${pct(TOP_QUANTITY_OFFER.rate)} off`}
      >
        <span
          className="block h-full bg-[var(--nf-accent-strong)] transition-[width] duration-500 ease-reveal motion-reduce:transition-none"
          style={{ width: `${progress * 100}%` }}
        />
        {/* A tick per rung, so the ladder reads as steps rather than one long climb. */}
        {[...Array(TOP_QUANTITY_OFFER.minQuantity - 1)].map((_, i) => {
          const at = (i + 1) / TOP_QUANTITY_OFFER.minQuantity;
          return (
            <span
              key={i}
              aria-hidden="true"
              className="absolute top-0 h-full w-px bg-[var(--nf-surface-raised)]"
              style={{ left: `${at * 100}%` }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default OfferProgress;
