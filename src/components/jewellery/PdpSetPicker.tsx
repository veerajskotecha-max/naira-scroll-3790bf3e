import { onRadioGroupKeyDown, rovingTabIndex } from "@/lib/radioGroup";
import { shopifyImage } from "@/lib/shopifyImage";
import { cardCover } from "@/lib/cardCover";
import type { SetTier } from "@/lib/setTiers";
import type { JewelPiece } from "@/data/jewellery";

/*
  "Make it a set": the product page's bundle choice, right above Add to bag
  (the owner's reference of 14 Nov 2026, a 5%-converting page with
  Single / Duo / Trio cards over its button). For jewellery a set is this
  piece with the pieces that go with it (lib/pairings, completeTheLook), not
  two of the same, and the saving is the bag's own ladder: the set price is
  what the bag charges for those pieces together, by promo.ts's resolver and
  rounding, so the card never quotes a total the checkout will not honour.

  The tier is a choice, never a default: the page opens on "Just this piece",
  and the bigger sets are offered beside it with their price and saving in
  rupees. Nothing is added that the shopper did not pick.
*/

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

type Props = {
  piece: JewelPiece;
  price: number;
  tiers: SetTier[];
  selected: number;
  onSelect: (index: number) => void;
};

const PdpSetPicker = ({ piece, price, tiers, selected, onSelect }: Props) => {
  if (tiers.length < 2) return null;
  const best = tiers.length - 1;
  return (
    <section className="mt-6" aria-labelledby="complete-the-look" data-set-picker>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="complete-the-look" className="font-cormorant text-[19px] leading-none text-nf-ink">
          Make it a set
        </h2>
        <p className="font-nf-label text-[11px] uppercase tracking-nf-8 text-nf-gold-text">Saved in your bag</p>
      </div>
      <div role="radiogroup" aria-label="Choose a set" onKeyDown={onRadioGroupKeyDown} className="mt-3 grid gap-2">
        {tiers.map((tier, i) => {
          const active = selected === i;
          const count = tier.extras.length + 1;
          /* Two short lines, so three sets fit in about 200px: the set and
             its rung (the same 10% / 20% as the ladder above), then what
             joins this piece, cut to one line (the thumbnails show it too).
             Written out in full, the names wrapped to four lines and the
             cards ran 337px tall. The saving is in rupees, under the price. */
          const title = i === 0 ? "Just this piece" : `Set of ${count} · ${Math.round(tier.rate * 100)}% off`;
          const saving = tier.full - tier.total;
          const detail = i === 0 ? piece.name : `+ ${tier.extras.map((p) => p.name).join(" & ")}`;
          const thumbs = [piece, ...tier.extras];
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={rovingTabIndex(selected, i)}
              onClick={() => onSelect(i)}
              aria-label={`${title}: ${i === 0 ? piece.name : tier.extras.map((p) => p.name).join(" and ")}, ${inr(i === 0 ? price : tier.total)}${i > 0 ? `, you save ${inr(saving)}` : ""}${i === best ? ", best value" : ""}`}
              className={`relative grid min-h-[58px] w-full grid-cols-[auto_1fr_auto] items-center gap-3 border px-3 py-2 text-left transition-colors duration-150 ${
                active ? "border-nf-ink bg-nf-ivory-deep/70" : "border-nf-ink/20 bg-transparent hover:border-nf-ink/45"
              }`}
            >
              <span aria-hidden="true" className={`flex h-[18px] w-[18px] items-center justify-center border ${active ? "border-nf-ink" : "border-nf-ink/40"}`}>
                {active && <span className="h-[10px] w-[10px] bg-nf-ink" />}
              </span>
              <span className="flex min-w-0 items-center gap-2.5">
                {/* One width for every row, so the titles line up. */}
                <span aria-hidden="true" className="flex w-[66px] shrink-0 -space-x-3">
                  {thumbs.map((p) => (
                    <img
                      key={p.handle}
                      src={shopifyImage(p === piece ? piece.image : cardCover(p), 120)}
                      alt=""
                      width={30}
                      height={30}
                      loading="lazy"
                      decoding="async"
                      className="h-[30px] w-[30px] border border-nf-ivory bg-nf-ivory-deep object-cover"
                    />
                  ))}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium leading-[1.3] text-nf-ink">{title}</span>
                  <span className="mt-0.5 block truncate text-[11.5px] leading-[1.3] text-nf-ink/70">{detail}</span>
                </span>
              </span>
              <span className="text-right">
                <span className="block font-cormorant text-[19px] font-semibold leading-none text-nf-ink">{inr(i === 0 ? price : tier.total)}</span>
                {i > 0 && <span className="mt-1 block whitespace-nowrap text-[11.5px] font-medium text-nf-gold-text">save {inr(saving)}</span>}
              </span>
              {i === best && (
                /* On the left edge: on the right it sat over the price. */
                <span className="absolute -top-[9px] left-3 bg-nf-ink px-2 py-[2px] font-nf-label text-[10px] uppercase tracking-nf-8 text-nf-ivory">
                  Best value
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default PdpSetPicker;
