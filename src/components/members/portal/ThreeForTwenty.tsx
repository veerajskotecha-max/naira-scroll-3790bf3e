import { useMemo, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { setPromoCode } from "@/lib/promo";
import { shopifyImage } from "@/lib/shopifyImage";
import { WHATSAPP_NUMBER, type JewelPiece } from "@/data/jewellery";
import { OFFER_MIN_PIECES, formatINR, quoteThreeForTwenty } from "./offers";

/**
 * ThreeForTwenty — the members' offer, built as a live basket.
 *
 * The member picks pieces and watches the figure fall as the third lands. The
 * arithmetic lives in ./offers.ts so the number shown here and the number
 * asserted in __checks__/offers.check.ts are the same number.
 *
 * `code` has no default on purpose. Without a real Shopify discount code there
 * is nothing to promise at checkout, so the panel offers WhatsApp instead of a
 * checkout button. Pass the code only once it exists in Shopify.
 */

const velista = { fontFamily: "var(--nf-font-display), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "var(--nf-font-editorial), 'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "var(--nf-font-label), 'Jost', 'Inter', sans-serif" } as const;

const spelled = ["no", "one", "two", "three", "four", "five", "six"];
const spell = (n: number) => spelled[n] ?? String(n);

const whatsappUrl = (names: string[]) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    names.length
      ? `Hi Naira Flore — I'd like the Inner Circle offer, any 3 pieces at 20% off. I've chosen: ${names.join(", ")}.`
      : "Hi Naira Flore — I'd like to hear about the Inner Circle offer: any 3 pieces, 20% off.",
  )}`;

const Tile = ({
  piece,
  chosen,
  position,
  onToggle,
}: {
  piece: JewelPiece;
  chosen: boolean;
  position: number;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={chosen}
    className={`nf-tile group relative overflow-hidden border text-left transition-[opacity] duration-200 ${
      chosen ? "border-[#B0843A] bg-[#FFFBF7]" : "border-[#1A1614]/10 bg-[#FFFBF7]/60"
    }`}
  >
    <span className="relative block aspect-square overflow-hidden bg-[#F6EADF]">
      {piece.image && (
        <img
          src={shopifyImage(piece.image, 300)}
          alt=""
          loading="lazy"
          className={`nf-tile-img h-full w-full object-cover ${chosen ? "scale-[1.04]" : ""}`}
        />
      )}
      {chosen && (
        <span
          className="nf-pop absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#B0843A] text-[10px] leading-none text-[#FBF3EC]"
          style={jost}
          aria-hidden
        >
          {position}
        </span>
      )}
    </span>
    <span className="block px-2 pb-2 pt-1.5">
      <span className="block truncate text-[11.5px] leading-tight text-[#1A1614]" style={editorial}>
        {piece.name}
      </span>
      <span className="mt-0.5 block text-[10px] tracking-[0.12em] text-[#1A1614]/55" style={jost}>
        {piece.priceLabel}
      </span>
    </span>
  </button>
);

const ThreeForTwenty = ({ code }: { code?: string }) => {
  const { jewellery } = useLiveJewellery();
  const { addItem, setDrawerOpen } = useCart();
  const [handles, setHandles] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  const pieces = useMemo(
    () => jewellery.filter((p) => p.availableForSale && p.variantId),
    [jewellery],
  );

  const chosen = useMemo(
    () => handles.map((h) => pieces.find((p) => p.handle === h)).filter(Boolean) as JewelPiece[],
    [handles, pieces],
  );

  const quote = quoteThreeForTwenty(chosen.map((p) => p.price));

  const toggle = (handle: string) =>
    setHandles((current) =>
      current.includes(handle) ? current.filter((h) => h !== handle) : [...current, handle],
    );

  /* Sequential on purpose: CartContext creates the Shopify cart on the first add
     and reads it back for every add after that. Firing these in parallel makes
     three carts and loses two of the pieces. */
  const addAll = async () => {
    if (!chosen.length || adding) return;
    setAdding(true);
    try {
      if (code && quote.qualifies) setPromoCode(code);
      for (const piece of chosen) {
        await addItem({
          id: piece.handle,
          variantId: piece.variantId,
          name: piece.name,
          price: piece.price,
          priceLabel: piece.priceLabel,
          currencyCode: "INR",
          image: piece.image,
        });
      }
      setHandles([]);
      setDrawerOpen(true);
    } finally {
      setAdding(false);
    }
  };

  const cta = "w-full border border-[#B0843A] bg-[#B0843A] px-4 py-3 text-[10px] tracking-[0.3em] text-[#FBF3EC] transition-opacity duration-200 hover:opacity-85 disabled:opacity-40";

  return (
    <section className="nf-offer relative">
      <style>{`
        @keyframes nf-fall { from { transform: translateY(-9px); opacity: 0; } }
        @keyframes nf-pop { from { transform: scale(.4); opacity: 0; } }
        .nf-fall { animation: nf-fall 240ms ease-out both; }
        .nf-pop { animation: nf-pop 200ms ease-out both; }
        .nf-tile-img { transition: transform 220ms ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .nf-fall, .nf-pop { animation: none; }
          .nf-tile-img { transition: none; }
        }
      `}</style>

      <header>
        <p className="text-[9px] tracking-[0.4em] text-[#B0843A]" style={jost}>
          MEMBERS&rsquo; OFFER
        </p>
        <h2 className="mt-2 text-[22px] leading-tight text-[#1A1614]" style={velista}>
          Any three, twenty less
        </h2>
        <p className="mt-1.5 text-[15px] italic leading-[1.55] text-[#1A1614]/65" style={editorial}>
          Choose any three pieces from Naira Petite and twenty per cent comes off the set.
        </p>
      </header>

      {pieces.length < OFFER_MIN_PIECES ? (
        <p className="mt-5 text-[15px] italic text-[#1A1614]/65" style={editorial}>
          Not enough pieces are in stock for the offer today. Write to us and we&rsquo;ll tell you the
          moment it can be honoured.
        </p>
      ) : (
        <>
          <div
            className="mt-5 grid max-h-[62svh] grid-cols-2 gap-2.5 overflow-y-auto overscroll-contain pr-0.5 sm:grid-cols-3"
            role="group"
            aria-label="Choose your pieces"
          >
            {pieces.map((piece) => (
              <Tile
                key={piece.handle}
                piece={piece}
                chosen={handles.includes(piece.handle)}
                position={handles.indexOf(piece.handle) + 1}
                onToggle={() => toggle(piece.handle)}
              />
            ))}
          </div>

          {/* the tally */}
          <div className="mt-4 border-t border-[#1A1614]/10 pt-4">
            <div className="flex items-end justify-between gap-3">
              <p className="text-[10px] tracking-[0.24em] text-[#1A1614]/50" style={jost}>
                {quote.count} {quote.count === 1 ? "PIECE" : "PIECES"} CHOSEN
              </p>
              <p className="text-right">
                {quote.qualifies && (
                  <span
                    key="was"
                    className="nf-fall mr-2 text-[12px] text-[#1A1614]/40 line-through tabular-nums"
                    style={jost}
                  >
                    {formatINR(quote.subtotal)}
                  </span>
                )}
                <span
                  key={quote.qualifies ? "off" : "full"}
                  className={`nf-fall text-[24px] leading-none tabular-nums ${
                    quote.qualifies ? "text-[#B0843A]" : "text-[#1A1614]"
                  }`}
                  style={jost}
                >
                  {formatINR(quote.total)}
                </span>
              </p>
            </div>

            <p
              aria-live="polite"
              className="mt-2 text-[13.5px] italic leading-[1.5] text-[#1A1614]/70"
              style={editorial}
            >
              {quote.count === 0
                ? "Pick your first piece."
                : !quote.qualifies
                  ? `${spell(quote.needed).replace(/^./, (c) => c.toUpperCase())} more ${
                      quote.needed === 1 ? "piece" : "pieces"
                    } and twenty per cent comes off.`
                  : quote.count === OFFER_MIN_PIECES
                    ? `All three are 20% off — ${formatINR(quote.discount)} saved.`
                    : `All ${spell(quote.count)} are 20% off, not just the first three — ${formatINR(
                        quote.discount,
                      )} saved.`}
            </p>

            {code ? (
              <>
                <button type="button" onClick={() => void addAll()} disabled={!quote.count || adding} className={`mt-4 ${cta}`} style={jost}>
                  {adding
                    ? "ADDING…"
                    : quote.count === 0
                      ? "CHOOSE YOUR PIECES"
                      : `ADD ${spell(quote.count).toUpperCase()} TO MY BAG`}
                </button>
                <p className="mt-2 text-[11.5px] leading-[1.5] text-[#1A1614]/55" style={jost}>
                  {quote.qualifies ? (
                    <>
                      Code <span className="tracking-[0.16em] text-[#8A6A2F]">{code}</span> is applied to
                      your bag at checkout.
                    </>
                  ) : (
                    <>
                      Code <span className="tracking-[0.16em] text-[#8A6A2F]">{code}</span> needs three
                      pieces before it will apply.
                    </>
                  )}
                </p>
              </>
            ) : (
              <>
                <a
                  href={whatsappUrl(chosen.map((p) => p.name))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-4 block text-center ${cta}`}
                  style={jost}
                >
                  ASK US ON WHATSAPP
                </a>
                <p className="mt-2 text-[11.5px] leading-[1.5] text-[#1A1614]/55" style={jost}>
                  This one is arranged by hand — there is no code at checkout yet. Send us your three and
                  we&rsquo;ll set it up for you.
                </p>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default ThreeForTwenty;
