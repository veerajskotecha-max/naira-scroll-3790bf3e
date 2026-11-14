import { Link } from "react-router-dom";
import { Gift, PackageCheck, ShieldCheck, ShoppingBag } from "lucide-react";
import UpiBadges from "@/components/checkout/UpiBadges";

/*
  When it arrives, how it can be paid and what happens if it arrives faulty,
  under Add to bag: the reference page's Ordered → Delivered line, drawn in
  the brand's hairlines.

  The window is serviceability.ts's (3 working days covers Maharashtra, 5 the
  rest of India), the same arithmetic as the courier's quote; it is an
  estimate and reads as one ("est."). A pre-built page and automated captures
  get no date (`arrivesBy` is null there), so the line never freezes a date
  into the HTML. A piece that cannot ship now says its lead time instead.

  COD is stated, never priced, on the product page (the owner's call); the
  bag prices it in rupees. The faulty-piece line says what the policy says
  (/exchange-return-policy: a defect reported within 7 days of delivery is
  repaired, replaced or credited) and no more: it never says "returns".
*/

type Props = {
  arrivesBy: string | null;
  leadTime?: string | null;
};

const PdpDeliveryTimeline = ({ arrivesBy, leadTime }: Props) => (
  <div className="mt-4" data-delivery-timeline>
    {leadTime ? (
      <p className="text-[12.5px] leading-[1.55] text-nf-ink/80">{leadTime}</p>
    ) : (
      <ol className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-x-2 text-nf-ink" aria-label="Delivery">
        <li className="flex flex-col items-center gap-1 text-center">
          <ShoppingBag size={16} strokeWidth={1.5} aria-hidden="true" className="text-nf-gold-deep" />
          <span className="text-[11.5px] leading-tight text-nf-ink/80">
            Ordered
            <br />
            <span className="font-medium text-nf-ink">Today</span>
          </span>
        </li>
        <li aria-hidden="true" className="mt-2 h-px w-full self-start bg-nf-gold/40" />
        <li className="flex flex-col items-center gap-1 text-center">
          <Gift size={16} strokeWidth={1.5} aria-hidden="true" className="text-nf-gold-deep" />
          <span className="text-[11.5px] leading-tight text-nf-ink/80">
            Packed in
            <br />
            <span className="font-medium text-nf-ink">the gift box</span>
          </span>
        </li>
        <li aria-hidden="true" className="mt-2 h-px w-full self-start bg-nf-gold/40" />
        <li className="flex flex-col items-center gap-1 text-center">
          <PackageCheck size={16} strokeWidth={1.5} aria-hidden="true" className="text-nf-gold-deep" />
          <span className="text-[11.5px] leading-tight text-nf-ink/80">
            Delivered free
            <br />
            <span className="font-medium text-nf-ink">{arrivesBy ? `est. ${arrivesBy}` : "in 3–5 working days"}</span>
          </span>
        </li>
      </ol>
    )}
    <p className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-nf-gold/20 pt-3 text-center text-[12px] text-nf-ink/80">
      <span className="font-medium text-nf-ink">COD available</span>
      <span aria-hidden="true" className="text-nf-gold-deep">·</span>
      <span className="inline-flex items-center gap-1.5">
        UPI &amp; cards <UpiBadges size={14} />
      </span>
    </p>
    <p className="mt-2 flex items-start justify-center gap-1.5 text-center text-[12px] leading-[1.5] text-nf-ink/75">
      <ShieldCheck size={14} strokeWidth={1.6} aria-hidden="true" className="mt-[2px] shrink-0 text-nf-gold-deep" />
      <span>
        Faulty piece? Repaired, replaced or credited if you tell us within 7 days of delivery.{" "}
        <Link to="/exchange-return-policy" className="text-nf-ink underline decoration-nf-gold underline-offset-4">
          Policy
        </Link>
      </span>
    </p>
  </div>
);

export default PdpDeliveryTimeline;
