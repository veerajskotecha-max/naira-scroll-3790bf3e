import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { cleanButton, percent, rupees } from "@/components/clean";
import { cardCover } from "@/lib/cardCover";
import { colourOption, variantPhoto } from "@/lib/colourCards";
import { getPromoCode, PROMO_EVENT, QUANTITY_OFFERS } from "@/lib/promo";
import { shopifyImage } from "@/lib/shopifyImage";
import { cartLineFor, choiceNeeded, oneTapVariant, variantLabel } from "@/lib/variants";
import type { JewelPiece } from "@/data/jewellery";
import { Tick } from "./PdpAssurances";
import { bundleEffect } from "./renew";

/*
  "Complete the look" as a bundle: this piece and the pieces that go with it,
  each with a box to tick, the total for what is ticked, and one button that
  adds them together. The reel's cart ("complete your setup and save") with
  the shop's real offer: two pieces take 10% off both, three 20%, four 30%.

  The pieces are the page's own pairings (lib/pairings `completeTheLook`), in
  its order; the best match starts ticked, so the saving is on the page before
  anything is tapped. Nothing reaches the bag until the button is pressed, and
  the button says how many pieces it adds.

  The figures are the bag's: `bundleEffect` runs promo.ts's resolver and
  rounding over the bag as it stands with these pieces in it, so the total
  here is the change the bag then shows. With pieces already in the bag it
  says what these add, not a price for them alone.

  A piece that needs a size or a month chosen has no box: it links to its own
  page, as its card always has.
*/
type CartLine = Parameters<ReturnType<typeof useCart>["addItem"]>[0];
type Props = {
  title: string;
  /** This piece as chosen: what Add to cart would put in the bag. */
  anchor: { name: string; image: string; price: number; note?: string; line: CartLine };
  pieces: JewelPiece[];
  hrefFor: (handle: string) => string;
  /** The anchor's own metal or stone, so a paired piece is offered in the same. */
  prefer?: Record<string, string>;
};

const PdpBundle = ({ title, anchor, pieces, hrefFor, prefer }: Props) => {
  const { addItem, setDrawerOpen, isLoading, totalItems, subtotal } = useCart();
  const [promoCode, setCode] = useState<string | null>(() => getPromoCode());
  useEffect(() => {
    const sync = () => setCode(getPromoCode());
    window.addEventListener(PROMO_EVENT, sync);
    return () => window.removeEventListener(PROMO_EVENT, sync);
  }, []);

  const rows = useMemo(
    () =>
      pieces.map((piece) => {
        const need = choiceNeeded(piece);
        const variant = oneTapVariant(piece, prefer);
        const colour = variant ? variant.options[colourOption(piece)?.name ?? ""] : undefined;
        const href = hrefFor(piece.handle);
        return {
          piece,
          need,
          variant,
          image: variantPhoto(piece, variant) ?? cardCover(piece),
          price: variant?.price ?? piece.price,
          to: colour ? `${href}${href.includes("?") ? "&" : "?"}colour=${encodeURIComponent(colour.toLowerCase())}` : href,
        };
      }),
    [pieces, prefer, hrefFor],
  );
  const firstOpen = rows.find((row) => !row.need)?.piece.handle;
  const listKey = rows.map((row) => row.piece.handle).join(" ");
  const [picked, setPicked] = useState<ReadonlySet<string>>(() => new Set(firstOpen ? [firstOpen] : []));
  /* A new list of pairings (another piece, or the live catalogue's order)
     starts from its own best match. */
  useEffect(() => {
    setPicked(new Set(firstOpen ? [firstOpen] : []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listKey]);
  const [adding, setAdding] = useState(false);

  const chosen = rows.filter((row) => !row.need && picked.has(row.piece.handle));
  const count = 1 + chosen.length;
  const effect = bundleEffect({ subtotal, totalItems, promoCode }, [anchor.price, ...chosen.map((row) => row.price)]);
  const inBag = totalItems > 0;
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
      await addItem(anchor.line);
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

  return (
    <section className="rn-panel rn-reveal mt-10 lg:mt-12" aria-labelledby="complete-the-look">
      <div className="rn-panel__head">
        <h2 id="complete-the-look" className="nc-heading nc-heading--sheet">
          {title}
        </h2>
        <p className="nc-label nc-label--gold shrink-0">
          {QUANTITY_OFFERS[0].minQuantity} pieces · {percent(QUANTITY_OFFERS[0].rate)} off
        </p>
      </div>
      <ul className="rn-bundle">
        <li>
          <span className="rn-check" data-on="" data-fixed="">
            <Tick className="" />
          </span>
          <img src={shopifyImage(anchor.image, 160)} alt="" width={56} height={56} loading="lazy" decoding="async" />
          <span className="min-w-0">
            <span className="rn-bundle__name">{anchor.name}</span>
            <span className="rn-bundle__note">This piece{anchor.note ? ` · ${anchor.note}` : ""}</span>
          </span>
          <span className="rn-bundle__price">{rupees(anchor.price)}</span>
        </li>
        {rows.map(({ piece, need, variant, image, price, to }) => {
          const on = !need && picked.has(piece.handle);
          return (
            <li key={piece.handle} data-bundle-piece={piece.handle}>
              {need ? (
                <span aria-hidden="true" className="block w-[22px]" />
              ) : (
                <span className="rn-check" data-on={on ? "" : undefined}>
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(piece.handle)}
                    aria-label={`Add ${piece.name}${variant ? ` in ${variantLabel(variant)}` : ""}, ${rupees(price)}`}
                  />
                  <Tick className="" />
                </span>
              )}
              <Link to={to} tabIndex={-1} aria-hidden="true">
                <img src={shopifyImage(image, 160)} alt="" width={56} height={56} loading="lazy" decoding="async" />
              </Link>
              <span className="min-w-0">
                <Link to={to} className="rn-bundle__name">
                  {piece.name}
                </Link>
                <span className="rn-bundle__note">
                  {need ? (
                    <Link to={to} className="nc-link nc-link--ink">
                      Choose {need}
                    </Link>
                  ) : variant ? (
                    variantLabel(variant)
                  ) : (
                    piece.category
                  )}
                </span>
              </span>
              <span className="rn-bundle__price">{rupees(price)}</span>
            </li>
          );
        })}
      </ul>
      <div className="rn-bundle__sum" aria-live="polite">
        {chosen.length === 0 ? (
          <p className="nc-small">Tick a piece to see what the two cost together.</p>
        ) : (
          <>
            <p key={`${count}-${effect.adds}`} className="rn-bundle__total rn-tick-in">
              <span className="nc-sr">{inBag ? "Adds to your bag: " : `${count} pieces together: `}</span>
              {inBag && <span className="nc-small nc-small--ink" aria-hidden="true">Adds</span>}
              {rupees(Math.max(0, effect.adds))}
              {effect.saves > 0 && <del>{rupees(effect.sum)}</del>}
            </p>
            {effect.saves > 0 && (
              <p className="nc-small nc-gold">
                You save {rupees(effect.saves)} · {percent(effect.rate)} off {inBag ? "your bag" : `${count} pieces`}
              </p>
            )}
          </>
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
          "Tick a piece to pair"
        ) : (
          <>
            Add {count} pieces
            {effect.adds > 0 && <span className="rn-price-in">{rupees(effect.adds)}</span>}
          </>
        )}
      </button>
    </section>
  );
};

export default PdpBundle;
