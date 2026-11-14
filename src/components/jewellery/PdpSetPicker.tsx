import { onRadioGroupKeyDown, rovingTabIndex } from "@/lib/radioGroup";
import { shopifyImage } from "@/lib/shopifyImage";
import { cardCover } from "@/lib/cardCover";
import { variantPhoto } from "@/lib/colourCards";
import { variantDisplay } from "@/lib/variants";
import type { SetOption, SetTier } from "@/lib/setTiers";
import type { JewelPiece } from "@/data/jewellery";

/*
  "Make it a set": the product page's bundle choice, right above Add to bag
  (the owner's reference of 14 Nov 2026, a 5%-converting page with
  Single / Duo / Trio cards over its button). For jewellery a set is this
  piece with the pieces that go with it (lib/pairings, completeTheLook), not
  two of the same, and the saving is the bag's own ladder: the set price is
  what the bag charges for those pieces together, by promo.ts's resolver and
  rounding (a typed code included, on "Just this piece" too), so no card
  quotes a total the checkout will not honour.

  The tier is a choice, never a default: the page opens on "Just this piece",
  and the bigger sets are offered beside it with their price and saving in
  rupees. Nothing is added that the shopper did not pick.

  Each card names every piece it adds, one to a line under the title and the
  full width of the card: cut to one line beside the thumbnails, "+ Prism
  Emerald-Cut Hoops & Prism Pear Drop Necklace" showed 127px of its 309 at
  360px and a 3-piece set never named its third piece.
*/

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

type Props = {
  piece: JewelPiece;
  tiers: SetTier[];
  selected: number;
  onSelect: (index: number) => void;
  /** False until the live catalogue has settled the pairings: a set chosen
      from the bundled catalogue had its pieces swapped under it. */
  ready: boolean;
};

/* What goes in the bag, named as the bag names it: "Prism Emerald-Cut Hoops
   (Gold)" when the piece comes in more than one way, its plain name when not. */
const optionName = ({ piece, variant }: SetOption) =>
  variant && (piece.variants?.length ?? 0) > 1 ? `${piece.name} (${variantDisplay(variant)})` : piece.name;

const PdpSetPicker = ({ piece, tiers, selected, onSelect, ready }: Props) => {
  if (tiers.length < 2) return null;
  const best = tiers.length - 1;
  return (
    <section className="mt-6" aria-labelledby="complete-the-look" data-set-picker>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="complete-the-look" className="font-cormorant text-[19px] leading-none text-nf-ink">
          Make it a set
        </h2>
        {/* "Saved in your bag" read as if the pieces were already in it. */}
        <p className="font-nf-label text-[11px] uppercase tracking-nf-8 text-nf-gold-text">No code needed</p>
      </div>
      <div
        role="radiogroup"
        aria-label="Choose a set"
        aria-busy={!ready}
        onKeyDown={ready ? onRadioGroupKeyDown : undefined}
        className={`mt-3 grid gap-2 transition-opacity duration-200 motion-reduce:transition-none ${ready ? "" : "opacity-60"}`}
      >
        {tiers.map((tier, i) => {
          const active = selected === i;
          const count = tier.extras.length + 1;
          const title = i === 0 ? "Just this piece" : `Set of ${count} · ${Math.round(tier.rate * 100)}% off`;
          const saving = tier.full - tier.total;
          const names = tier.extras.map(optionName);
          /* Only what a set adds: listing this piece in every card made
              the picker 483px tall for nothing the shopper did not know. */
          const lines = tier.extras.map((o, n) => ({
            key: o.piece.handle,
            src: variantPhoto(o.piece, o.variant) ?? cardCover(o.piece),
            name: names[n],
            price: o.price,
          }));
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={active}
              aria-disabled={!ready}
              tabIndex={rovingTabIndex(selected, i)}
              onClick={() => ready && onSelect(i)}
              aria-label={`${title}: ${i === 0 ? piece.name : names.join(" and ")}, ${inr(tier.total)}${saving > 0 ? `, you save ${inr(saving)}` : ""}${i === best ? ", best value" : ""}`}
              className={`relative grid min-h-[52px] w-full grid-cols-[auto_1fr_auto] items-start gap-x-3 gap-y-1.5 border px-3 py-2.5 text-left transition-colors duration-150 ${
                active ? "border-nf-ink bg-nf-ivory-deep/70" : "border-nf-ink/35 bg-transparent hover:border-nf-ink/60"
              }`}
            >
              {/* 4:1 on ivory unselected: at /40 the box that marks these as
                  choices measured 2.5:1, under WCAG's 3:1 for controls. */}
              {/* One of three, so not a checkbox's square tick: a diamond,
                  square-cornered as the brand is. */}
              <span aria-hidden="true" className={`mt-[1px] flex h-[18px] w-[18px] items-center justify-center border ${active ? "border-nf-ink" : "border-nf-ink/60"}`}>
                {active && <span className="h-[8px] w-[8px] rotate-45 bg-nf-ink" />}
              </span>
              <span className="min-w-0">
                {i === best && <span className="block font-nf-label text-[11px] uppercase tracking-nf-8 text-nf-gold-text">Best value</span>}
                <span className="block text-[13.5px] font-medium leading-[1.3] text-nf-ink">{title}</span>
              </span>
              <span className="text-right">
                {/* The display face has no ₹ of its own: the sign is set in the
                    label face, as on the price above. */}
                <span className="block font-cormorant text-[19px] font-semibold leading-none text-nf-ink">
                  <span className="mr-[1px] font-nf-label text-[0.8em] font-normal">₹</span>
                  {Math.round(tier.total).toLocaleString("en-IN")}
                </span>
                {saving > 0 && <span className="mt-1 block whitespace-nowrap text-[11.5px] font-medium text-nf-gold-text">save {inr(saving)}</span>}
              </span>
              {/* What the card puts in the bag: every piece, its photo, its
                  own price. Overlapped 30px thumbnails showed 18px of each
                  extra, and nothing said what one cost on its own. */}
              {lines.length > 0 && (
                <span className="col-span-2 col-start-2 -mt-0.5 grid gap-1">
                  {lines.map((l) => (
                    <span key={l.key} className="flex min-w-0 items-center gap-2 text-[12px] leading-[1.3] text-nf-ink/80">
                      <img
                        src={shopifyImage(l.src, 96)}
                        alt=""
                        width={32}
                        height={32}
                        loading="lazy"
                        decoding="async"
                        className="h-8 w-8 shrink-0 border border-nf-gold/20 bg-nf-ivory-deep object-cover"
                      />
                      <span className="min-w-0 truncate">+ {l.name}</span>
                      <span className="ml-auto shrink-0 tabular-nums text-nf-ink/60">{inr(l.price)}</span>
                    </span>
                  ))}
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
