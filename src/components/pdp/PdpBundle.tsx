import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { cleanButton, percent, rupees } from "@/components/clean";
import { cardCover } from "@/lib/cardCover";
import { colourOption, variantPhoto } from "@/lib/colourCards";
import { QUANTITY_OFFERS, resolveCartDiscount } from "@/lib/promo";
import { shopifyImage } from "@/lib/shopifyImage";
import { cartLineFor, choiceNeeded, oneTapVariant, variantLabel } from "@/lib/variants";
import type { JewelPiece } from "@/data/jewellery";
import { Tick } from "./PdpAssurances";
import { bundleEffect, oneOf } from "./renew";
import { usePromoCode } from "./usePromoCode";

/*
  "Complete the look" as a bundle: this piece and the pieces that go with it,
  each with a box to tick, the total for what is ticked, and one button that
  adds them together. The reel's cart ("complete your setup and save") with
  the shop's real offer: two pieces take 10% off both, three or more 15%
  (the rates are promo.ts's; these are the ones of 25 Nov 2026).

  The pieces are the page's own pairings (lib/pairings `completeTheLook`), in
  its order; the best match starts ticked, so the saving is on the page before
  anything is tapped. Nothing reaches the bag until the button is pressed, and
  the button says how many pieces it adds.

  The figures are the bag's: `bundleEffect` runs promo.ts's resolver and
  rounding over the bag as it stands with these pieces in it, so the total
  here is the change the bag then shows. With pieces already in the bag it
  says what these add, not a price for them alone.

  Only pieces one tap can add are listed: one that needs a size or a month
  chosen cannot be ticked, so it is left to the cards below the page.

  Once this piece is in the bag the list stops adding it: its row says "In
  your bag" and the total is for the ticked pieces alone. (The conversion
  review of 25 Nov 2026 found the button adding it a second time.)
*/
type CartLine = Parameters<ReturnType<typeof useCart>["addItem"]>[0];
type Props = {
  title: string;
  /** This piece as chosen: what Add to bag would put in the bag. */
  anchor: { name: string; image: string; price: number; note?: string; line: CartLine };
  /** This piece, as chosen, is already a line of the bag. */
  anchorInBag?: boolean;
  /** "This piece", or "This set" for a piece sold as a set. */
  anchorNoun?: string;
  pieces: JewelPiece[];
  hrefFor: (handle: string) => string;
  /** The anchor's own metal or stone, so a paired piece is offered in the same. */
  prefer?: Record<string, string>;
};

const COUNT_WORD = ["", "one", "two", "three", "four", "five", "six"];

const PdpBundle = ({ title, anchor, anchorInBag = false, anchorNoun = "This piece", pieces, hrefFor, prefer }: Props) => {
  const { addItem, setDrawerOpen, isLoading, totalItems, subtotal } = useCart();
  const promoCode = usePromoCode();

  const rows = useMemo(
    () =>
      pieces
        .filter((piece) => !choiceNeeded(piece))
        .map((piece) => {
          const variant = oneTapVariant(piece, prefer);
          const colour = variant ? variant.options[colourOption(piece)?.name ?? ""] : undefined;
          const href = hrefFor(piece.handle);
          return {
            piece,
            variant,
            image: variantPhoto(piece, variant) ?? cardCover(piece),
            price: variant?.price ?? piece.price,
            to: colour ? `${href}${href.includes("?") ? "&" : "?"}colour=${encodeURIComponent(colour.toLowerCase())}` : href,
          };
        }),
    [pieces, prefer, hrefFor],
  );
  const firstOpen = rows[0]?.piece.handle;
  const listKey = rows.map((row) => row.piece.handle).join(" ");
  const [picked, setPicked] = useState<ReadonlySet<string>>(() => new Set(firstOpen ? [firstOpen] : []));
  /* A new list of pairings (another piece, or the live catalogue's order)
     starts from its own best match. */
  useEffect(() => {
    setPicked(new Set(firstOpen ? [firstOpen] : []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listKey]);
  const [adding, setAdding] = useState(false);

  const chosen = rows.filter((row) => picked.has(row.piece.handle));
  /* What the button adds: the ticked pieces, and this one unless the bag
     already holds it. */
  const prices = [...(anchorInBag ? [] : [anchor.price]), ...chosen.map((row) => row.price)];
  const count = prices.length;
  const effect = bundleEffect({ subtotal, totalItems, promoCode }, prices);
  const bagHasPieces = totalItems > 0;
  /* One more tick, when it would reach a richer step. */
  const oneMore = chosen.length > 0 && chosen.length < rows.length ? resolveCartDiscount({ totalItems: totalItems + count + 1, promoCode }).rate : 0;
  const toggle = (handle: string) =>
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(handle)) next.delete(handle);
      else next.add(handle);
      return next;
    });

  const add = async () => {
    if (adding || isLoading || chosen.length === 0) return;
    setAdding(true);
    setDrawerOpen(true);
    try {
      if (!anchorInBag) await addItem(anchor.line);
      for (const row of chosen) {
        await addItem({
          ...cartLineFor(row.piece, row.variant),
          // an adjustable ring sold one way goes in as US 6, the size its page opens on
          ...(row.piece.category === "Rings" && !row.variant ? { size: "US 6" } : {}),
        });
      }
    } finally {
      setAdding(false);
    }
  };

  if (!rows.length) return null;
  /* The gold label follows the ticks: the step these pieces reach. Before
     anything is ticked it is the offer's first step. */
  const label =
    chosen.length === 0 || !(effect.rate > 0)
      ? `${QUANTITY_OFFERS[0].minQuantity} pieces · ${percent(QUANTITY_OFFERS[0].rate)} off`
      : bagHasPieces
        ? `${percent(effect.rate)} off your whole bag`
        : `${count} pieces · ${percent(effect.rate)} off`;
  const total =
    effect.adds > 0 ? rupees(effect.adds) : effect.adds < 0 ? `Your total drops by ${rupees(-effect.adds)}` : "Your total stays the same";

  return (
    <section className="rn-panel rn-panel--bundle rn-reveal mt-12 lg:mt-14" aria-labelledby="complete-the-look">
      <div className="rn-panel__head">
        <h2 id="complete-the-look" className="nc-heading nc-heading--sheet whitespace-nowrap">
          {title}
        </h2>
        <p key={label} className="nc-label nc-label--gold rn-tick-in shrink-0" data-bundle-label>
          {label}
        </p>
      </div>
      <ul className="rn-bundle">
        <li data-bundle-anchor={anchorInBag ? "in-bag" : ""}>
          <span className="rn-check" data-on="" data-fixed="">
            <Tick className="" />
          </span>
          <img src={shopifyImage(anchor.image, 160)} alt="" width={56} height={56} loading="lazy" decoding="async" />
          <span className="min-w-0">
            <span className="rn-bundle__name">{anchor.name}</span>
            <span className="rn-bundle__note">
              {anchorInBag ? "In your bag" : anchorNoun}
              {anchor.note ? ` · ${anchor.note}` : ""}
            </span>
          </span>
          <span className="rn-bundle__price" data-muted={anchorInBag ? "" : undefined}>
            {rupees(anchor.price)}
          </span>
        </li>
        {rows.map(({ piece, variant, image, price, to }) => {
          const on = picked.has(piece.handle);
          return (
            <li key={piece.handle} data-bundle-piece={piece.handle}>
              {/* A label, so a tap anywhere on the box reaches the input:
                  the drawn tick sits over its middle. */}
              <label className="rn-check" data-on={on ? "" : undefined}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(piece.handle)}
                  aria-label={`Add ${piece.name}${variant ? ` in ${variantLabel(variant)}` : ""}, ${rupees(price)}`}
                />
                <Tick className="" />
              </label>
              <Link to={to} tabIndex={-1} aria-hidden="true">
                <img src={shopifyImage(image, 160)} alt="" width={56} height={56} loading="lazy" decoding="async" />
              </Link>
              <span className="min-w-0">
                <Link to={to} className="rn-bundle__name">
                  {piece.name}
                </Link>
                <span className="rn-bundle__note">{variant ? variantLabel(variant) : oneOf(piece.category)}</span>
              </span>
              <span className="rn-bundle__price">{rupees(price)}</span>
            </li>
          );
        })}
      </ul>
      <div className="rn-bundle__sum" aria-live="polite">
        {chosen.length === 0 ? (
          <p className="nc-small">{anchorInBag ? "Tick a piece to add it to your bag." : "Tick a piece to add it with this one."}</p>
        ) : bagHasPieces ? (
          /* With pieces in the bag the figure is the change to its total,
             and says so: on its own it read as a price for these pieces. */
          <p key={`${count}-${effect.adds}`} className="rn-bundle__total rn-tick-in" data-bundle-total>
            {effect.adds > 0 ? (
              <>
                <span className="nc-small nc-small--ink">Adds</span>
                {total}
                <span className="nc-small nc-small--ink">to your total</span>
              </>
            ) : (
              <span className="nc-text nc-text--strong">{total}</span>
            )}
          </p>
        ) : (
          <p key={`${count}-${effect.adds}`} className="rn-bundle__total rn-tick-in" data-bundle-total>
            <span className="nc-sr">{count} pieces together: </span>
            {total}
            {effect.saves > 0 && (
              <del>
                <span className="nc-sr">was </span>
                {rupees(effect.sum)}
              </del>
            )}
          </p>
        )}
        {chosen.length > 0 && effect.saves > 0 && <p className="nc-small nc-gold">You save {rupees(effect.saves)}</p>}
        {oneMore > effect.rate && (
          <p className="nc-small rn-bundle__nudge" data-bundle-nudge>
            Tick one more for {percent(oneMore)} off {bagHasPieces ? "your whole bag" : `all ${COUNT_WORD[count + 1] ?? count + 1}`}.
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={add}
        disabled={adding || isLoading || chosen.length === 0}
        className={`${cleanButton({ fill: "ink", block: true })} mt-3`}
        data-bundle-add
      >
        {adding ? (
          "Adding…"
        ) : chosen.length === 0 ? (
          "Add together"
        ) : (
          <>
            {count === 1 ? "Add 1 piece" : `Add ${count} pieces`}
            {/* The figure rides in the button only when it is a price for
                these pieces: with a bag behind it, it is a change in a total. */}
            {!bagHasPieces && effect.adds > 0 && <span className="rn-price-in">{rupees(effect.adds)}</span>}
          </>
        )}
      </button>
    </section>
  );
};

export default PdpBundle;
