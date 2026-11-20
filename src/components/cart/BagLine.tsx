import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { CleanStepper } from "@/components/clean";
import { shopifyImage } from "@/lib/shopifyImage";

/*
  One piece in the bag:

    [photo 72x90]  Woven Gold Hoops                         ₹944
                   Size: US 7                (only when the line has choices)
                   ₹1,049  10% off           (struck, then gold)
                   [ − 1 + ]                              Remove

  Rules sit between lines only: the foot's own hairline closes the list, so
  the two never meet (they used to, 2px apart, whenever the lines filled the
  list, and boxed an empty band when they did not).

  The figure at the right is what the line costs. The row under the name only
  explains it: the price it replaces and the rate taken off, and "each" once
  the line holds two or more. A single piece at full price needs no row at
  all, so it has none. Every figure is handed in by the bag, which works them
  out with the checkout's own resolver; nothing is priced here.
*/
export type BagLineItem = {
  id: string;
  variantId?: string;
  name: string;
  image: string;
  quantity: number;
};

type Props = {
  item: BagLineItem;
  /** The piece's own page. */
  href: string;
  /** Closes the bag on the way out, so the phone's back returns to it. */
  onLeave: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** "Metal: Silver · Size: US 7", or nothing. */
  options: string;
  /** What the line costs, e.g. "₹944". */
  total: string;
  /** The price a discount replaces, e.g. "₹1,049"; nothing when nothing is off. */
  was?: string | null;
  /** One piece's price on a line of two or more, e.g. "₹734 each". */
  each?: string | null;
  /** The rate taken off, e.g. "10% off". */
  off?: string | null;
  /** On its way in: listed and counted from the tap, before Shopify answers. */
  adding: boolean;
  /** The bag is talking to Shopify: quantity and Remove wait. */
  busy: boolean;
  /** Load the photo at once (the first lines) rather than on scroll. */
  eager: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
};

const RULE = "border-[color:var(--nc-rule)]";

const BagLine = ({ item, href, onLeave, options, total, was, each, off, adding, busy, eager, onDecrease, onIncrease, onRemove }: Props) => (
  <li data-line={item.id} data-variant={item.variantId} data-adding={adding ? "" : undefined} className={`flex gap-3 border-t ${RULE} p-4 first:border-t-0`}>
    <Link to={href} onClick={onLeave} tabIndex={-1} aria-hidden="true" className="shrink-0">
      <img
        src={shopifyImage(item.image, 200) || item.image}
        alt={item.name}
        className="h-[90px] w-[72px] bg-[var(--nc-linen)] object-cover max-[319px]:h-[80px] max-[319px]:w-[64px]"
        width={72}
        height={90}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </Link>
    <div className="flex min-w-0 flex-1 flex-col">
      {/* The name's capitals start where the photograph does: its line is
          lifted by the 5px of air a 14px capital has above it in a 20px line. */}
      <div className="-mt-[5px] flex items-start justify-between gap-3">
        {/* A 44px target round a 20px name, taken from the space above and
            below it; the clamp sits inside, so it cannot cut the target off.
            A name of two lines is broken evenly, never down to a last word. */}
        <Link
          to={href}
          onClick={onLeave}
          data-line-name
          className="nc-text relative block min-w-0 !leading-5 before:absolute before:inset-x-0 before:-inset-y-3 before:content-['']"
        >
          <span className="line-clamp-2 text-balance">{item.name}</span>
        </Link>
        <span data-line-total className="nc-text nc-text--strong shrink-0 tabular-nums !leading-5">
          {total}
        </span>
      </div>
      {options ? <p className="nc-small truncate">{options}</p> : null}
      {adding && (
        <p role="status" className="nc-small nc-gold flex items-center gap-1.5">
          <Loader2 size={14} strokeWidth={1.25} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Adding to your bag…
        </p>
      )}
      {(was || each) && (
        <p data-line-price className="nc-small mt-0.5 flex flex-wrap items-baseline gap-x-2 tabular-nums">
          {was ? <del>{was}</del> : null}
          {each ? <span className="nc-small nc-small--ink">{each}</span> : null}
          {off ? <span className="nc-small nc-gold">{off}</span> : null}
        </p>
      )}
      {/* The controls keep to the foot of the photograph, whatever sits above
          them. Under 320px the photo gives up 8px and Remove its lead-in, so
          the stepper and the word still share the row. */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <CleanStepper
          quantity={item.quantity}
          onDecrease={onDecrease}
          onIncrease={onIncrease}
          disabled={busy}
          decreaseLabel={item.quantity <= 1 ? `Remove ${item.name}` : "Decrease quantity"}
        />
        <button type="button" onClick={onRemove} disabled={busy} aria-label={`Remove ${item.name}`} className="nc-small nc-link nc-tap pl-3 disabled:opacity-40 max-[319px]:pl-0">
          Remove
        </button>
      </div>
    </div>
  </li>
);

export default BagLine;
