import { Tag } from "lucide-react";
import { QUANTITY_OFFERS } from "@/lib/promo";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Each piece's price once a rung applies — read from promo.ts so the PDP
 *  never quotes a rate the bag and checkout do not honour. */
export const offerPerPiece = (price: number, rate: number) => Math.round(price * (1 - rate));

/** The bag ladder, shown under Buy Now so the shopper sees what this piece
 *  drops to before adding a second. Applied in the bag, no code to type. */
const PdpOffers = ({ price }: { price: number }) => {
  if (!(price > 0)) return null;
  return (
    <section aria-labelledby="pdp-offers" className="col-span-2 mt-4 border border-nf-gold/30 bg-nf-ivory">
      <div className="flex items-center justify-between gap-3 border-b border-nf-gold/20 px-4 py-3">
        <h2 id="pdp-offers" className="flex items-center gap-2 font-cormorant text-[17px] leading-none text-nf-ink">
          <Tag size={14} strokeWidth={1.5} className="text-nf-gold-deep" aria-hidden="true" />
          The Naira bundle
        </h2>
        <span className="font-nf-label text-[9px] uppercase tracking-nf-16 text-nf-gold-text">
          {QUANTITY_OFFERS.length} offers
        </span>
      </div>
      <ul className="divide-y divide-nf-gold/15">
        {QUANTITY_OFFERS.map((o, i) => (
          <li key={o.code} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="font-nf-label text-[9.5px] uppercase tracking-nf-10 text-nf-gold-text">
                Any {o.minQuantity} pieces{i === QUANTITY_OFFERS.length - 1 ? " · Best value" : ""}
              </p>
              <p className="mt-1 text-[13px] text-nf-ink">
                <span className="font-semibold">{Math.round(o.rate * 100)}% off</span>
                <span className="text-nf-ink/70"> — this piece at </span>
                <span className="font-semibold">{inr(offerPerPiece(price, o.rate))}</span>
              </p>
            </div>
            <span className="shrink-0 text-[11px] text-nf-ink/55 line-through">{inr(price)}</span>
          </li>
        ))}
      </ul>
      <p className="border-t border-nf-gold/15 px-4 py-2 text-center text-[10.5px] tracking-nf-4 text-nf-ink/65">
        Applied in your bag automatically — no code needed
      </p>
    </section>
  );
};

export default PdpOffers;
