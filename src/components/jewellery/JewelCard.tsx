import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { JewelPiece } from "@/data/jewellery";

/* Shopify CDN images ship at their upload size; asking the CDN for a
   grid-sized render keeps packshots crisp on retina without the weight. */
const cdn = (url: string, w: number) => {
  if (!url.includes("cdn.shopify.com")) return url;
  const [base, q] = url.split("?");
  const params = new URLSearchParams(q);
  params.set("width", String(w));
  return `${base}?${params.toString()}`;
};

import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Heart } from "lucide-react";
import JewelPriceTag, { discountPercent } from "@/components/jewellery/JewelPriceTag";
import { isAdjustableRing } from "@/data/ringFit";

import JewelQuickView from "@/components/jewellery/JewelQuickView";


/* NOTE, deliberate: --font-cormorant is defined nowhere, so this whole
   declaration is invalid at computed-value time and these headings inherit
   the app sans. That inherited look is the approved pixel output; do NOT
   swap this to var(--nf-font-display) without a reviewed visual pass.
   See docs/design-tokens.md, "The display-font landmine". */
const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;

const jost = { fontFamily: "var(--nf-font-label)" } as const;

/* A demi-gold jewellery product card: photoreal packshot with a 3D
   cursor-tilt + glass sheen, a tag, price, a WhatsApp
   enquiry, and a click-to-open quick-view (PDP-lite) modal. */
const JewelCard = ({ piece, index = 0 }: { piece: JewelPiece; index?: number }) => {
  const tiltRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const { addItem, buyNow, setDrawerOpen, isLoading: cartLoading } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const saved = isWishlisted(piece.handle);
  const off = discountPercent(piece);
  /* One settled frame per piece — no hover swap, no timed flip. A grid of
     still, consistently framed studio packshots reads calmer and more
     luxurious than tiles that flicker between angles. Worn shots are kept
     only when a piece has no clean packshot (necklaces/bracelets shot on
     model), so scale is still communicated. */
  const gallery = piece.gallery ?? [];
  const named = (g: string) => /worn|model|onmodel|_2_/i.test(g);
  const anyNamed = gallery.some(named) || named(piece.image);
  const isWorn = (g: string) => (anyNamed ? named(g) : g === gallery[0]);
  const packshot = gallery.find((g) => !isWorn(g)) ?? null;

  const frontImg = (isWorn(piece.image) && packshot ? packshot : piece.image) ?? piece.image;

  const zircone = piece.handle.startsWith("zircone");
  /* Live Shopify stock state. Adjustable open-back rings flex to fit, so they
     never read as sold out. Collection cards show a calm, final SOLD OUT state;
     any pre-order option belongs on the product page only. */
  const adjustable = isAdjustableRing(piece.handle);
  const soldOut = piece.availableForSale === false && !adjustable;


  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({ id: piece.handle, name: piece.name, price: piece.priceLabel, image: piece.image });
  };

  const cartItem = () => ({
    id: piece.handle,
    variantId: piece.variantId,
    name: piece.name,
    price: piece.price,
    priceLabel: piece.priceLabel,
    currencyCode: "INR" as const,
    image: piece.image,
  });

  /* Straight to Shopify's secure checkout with this piece in the cart. */
  const handleBuyNow = async () => {
    setBuying(true);
    try {
      await buyNow(cartItem());
    } finally {
      setBuying(false);
    }
  };

  /* Shopify-backed cart add: real variant, real cart. */
  const handleAdd = async () => {
    setAdding(true);
    try {
      const added = await addItem({
        id: piece.handle,
        variantId: piece.variantId,
        name: piece.name,
        price: piece.price,
        priceLabel: piece.priceLabel,
        currencyCode: "INR",
        image: piece.image,
      });
      /* Opening the drawer on a failed add showed the shopper an empty cart. */
      if (added) setDrawerOpen(true);
    } finally {
      setAdding(false);
    }
  };


  useEffect(() => {
    const el = tiltRef.current;
    const sheen = sheenRef.current;
    if (!el || !sheen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) scale(1.03)`;
      sheen.style.opacity = "1";
      sheen.style.background = `radial-gradient(380px circle at ${(px + 0.5) * 100}% ${(py + 0.5) * 100}%, rgba(255,255,255,0.5), rgba(255,255,255,0) 55%)`;
    };
    const reset = () => {
      el.style.transform = "perspective(900px) rotateY(0) rotateX(0) scale(1)";
      sheen.style.opacity = "0";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", reset);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", reset); };
  }, []);

  /* The timed "greet turn" and the hover image swap were removed: a still
     grid reads as considered, a flickering one as unstable. */



  return (
    <article className="jewel-shop-card group flex h-full flex-col" style={{ ["--i" as string]: index }}>
      <Link
        to={`/jewellery/${piece.handle}`}
        aria-label={`View ${piece.name}`}
        className="block w-full text-left transition-transform duration-200 active:scale-[0.97]"
      >
        <div
          ref={tiltRef}
          className="relative aspect-square w-full overflow-hidden bg-nf-ivory-deep shadow-nf-card transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: "perspective(900px)" }}
        >
          <img
            src={cdn(frontImg, 500)}
            /* A tile is ~190 CSS px on a phone. Offering 300/400/500 as well as
               the retina sizes keeps the grid from pulling 800–1100px renders
               for a thumbnail — the single biggest weight saving on mobile. */
            srcSet={`${cdn(frontImg, 300)} 300w, ${cdn(frontImg, 400)} 400w, ${cdn(frontImg, 500)} 500w, ${cdn(frontImg, 700)} 700w, ${cdn(frontImg, 900)} 900w`}
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 32vw, 300px"
            alt={piece.name}
            /* Only the first screen of tiles loads eagerly. */
            loading={index < 4 ? "eager" : "lazy"}
            fetchPriority={index < 2 ? "high" : "auto"}
            decoding="async"
            width={800}
            height={800}
            /* Every tile uses the exact same square frame and centre crop so a
               scrolling grid never staggers or shows differently sized pieces. */
            className="jc-front absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]"
          />



          {zircone && (
            <span aria-hidden className="pointer-events-none absolute inset-0">
              <svg className="absolute left-[20%] top-[22%] opacity-40" width="15" height="15" viewBox="0 0 20 20"><path d="M10 0 Q11 8.5 20 10 Q11 11.5 10 20 Q9 11.5 0 10 Q9 8.5 10 0 Z" fill="var(--nf-accent)" /></svg>
              <svg className="absolute right-[24%] top-[40%] opacity-30" width="10" height="10" viewBox="0 0 20 20"><path d="M10 0 Q11 8.5 20 10 Q11 11.5 10 20 Q9 11.5 0 10 Q9 8.5 10 0 Z" fill="var(--nf-accent)" /></svg>
              <svg className="absolute bottom-[26%] left-[34%] opacity-35" width="12" height="12" viewBox="0 0 20 20"><path d="M10 0 Q11 8.5 20 10 Q11 11.5 10 20 Q9 11.5 0 10 Q9 8.5 10 0 Z" fill="var(--nf-accent)" /></svg>
            </span>
          )}
          <div ref={sheenRef} aria-hidden className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300" />
          {piece.tag && (
            <span
              className={`absolute left-3 top-3 border bg-nf-ivory/95 px-2.5 py-1 text-[8.5px] tracking-nf-24 sm:left-4 sm:top-4 sm:px-3 sm:text-[9px] sm:tracking-nf-30 ${
                piece.tag === "NEW" || piece.tag === "BESTSELLER"
                  ? "border-nf-gold text-nf-gold-shadow"
                  : "border-nf-ink/15 text-nf-ink/60"
              }`}
              style={jost}
            >
              {piece.tag}
            </span>
          )}
          {soldOut && (
            <span
              className="absolute right-3 top-3 bg-nf-ink px-2.5 py-1 text-[8.5px] tracking-nf-20 text-nf-ivory sm:right-4 sm:top-4 sm:px-3 sm:text-[9px]"
              style={jost}
            >
              SOLD OUT
            </span>
          )}
          {off > 0 && !soldOut && (
            <span
              className="absolute right-3 top-3 bg-nf-gold-deep px-2.5 py-1 text-[8.5px] tracking-nf-20 text-nf-ivory sm:right-4 sm:top-4 sm:px-3 sm:text-[9px]"
              style={jost}
            >
              {off}% OFF
            </span>
          )}

          {/* Wishlist heart — saving a piece must never navigate away. */}
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={saved ? `Remove ${piece.name} from wishlist` : `Add ${piece.name} to wishlist`}
            aria-pressed={saved}
            className={`press-scale absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center border bg-nf-ivory/92 transition-colors duration-200 sm:bottom-4 sm:right-4 ${
              saved ? "border-nf-gold text-nf-gold-deep" : "border-nf-ink/15 text-nf-ink/55 hover:border-nf-ink/50 hover:text-nf-ink"
            }`}
          >
            <Heart size={15} strokeWidth={1.5} fill={saved ? "currentColor" : "none"} />
          </button>
          <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-2 bg-nf-ivory/90 px-5 py-2 text-[10px] tracking-nf-30 text-nf-ink opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100" style={jost}>
            VIEW DETAILS
          </span>
          <span className="pointer-events-none absolute inset-0 border border-nf-gold/0 transition-colors duration-500 group-hover:border-nf-gold/60" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col items-center px-1 pt-4 text-center sm:pt-5">
        <p className="text-[9px] tracking-nf-32 text-nf-gold-deep sm:text-[10px] sm:tracking-nf-34" style={jost}>
          {piece.category.toUpperCase()}
        </p>
        {/* Two-line clamp keeps every card in a row the same height, so the
            price and CTAs line up across the grid instead of staggering. */}
        <h3
          className="mt-1.5 line-clamp-2 h-[2.4em] overflow-hidden text-[18px] leading-[1.2] text-nf-ink sm:mt-2 sm:text-[24px] md:text-[26px]"
          style={velista}
        >
          <Link to={`/jewellery/${piece.handle}`} className="hover:underline underline-offset-4">{piece.name}</Link>
        </h3>
        {/* Price: the single most-scanned element on a grid card, so it reads
            at title weight in ink, with the MRP struck through beside it. */}
        {/* Fixed-height price row: with or without a struck-through MRP every
            tile keeps the same height, so rows never stagger while scrolling. */}
        <div className="mt-2 flex min-h-[30px] w-full items-center justify-center sm:mt-2.5 sm:min-h-[34px]">
          <JewelPriceTag piece={piece} />
        </div>
        {/* Pre-order / delivery wording lives on the product page only. */}

        <div className="mt-auto flex w-full flex-col items-center gap-2 pt-3">

          <button
            onClick={handleAdd}
            disabled={soldOut || adding || cartLoading}
            className="press-scale inline-flex min-h-[44px] w-full items-center justify-center border border-nf-ink bg-nf-ink px-5 text-[9.5px] tracking-nf-25 text-nf-ivory transition-opacity hover:opacity-90 disabled:opacity-60 sm:text-[10.5px] sm:tracking-nf-30"
            style={jost}
          >
            {soldOut ? "SOLD OUT" : adding ? "ADDING…" : "ADD TO CART"}
          </button>
          {!soldOut && (
            <button
              onClick={handleBuyNow}
              disabled={buying || adding || cartLoading}
              className="press-scale group/btn relative inline-flex min-h-[40px] w-full items-center justify-center gap-2 overflow-hidden border border-nf-ink/35 px-5 text-[9.5px] tracking-nf-25 text-nf-ink hover:text-nf-ivory disabled:opacity-60 sm:px-6 sm:text-[10.5px] sm:tracking-nf-30"
              style={jost}
            >
              <span className="absolute inset-0 origin-left scale-x-0 bg-nf-ink transition-transform duration-300 ease-out group-hover/btn:scale-x-100" />
              <span className="relative">{buying ? "OPENING…" : "SHOP NOW"}</span>
              <span className="relative transition-transform duration-300 ease-out group-hover/btn:translate-x-1">→</span>
            </button>
          )}
        </div>

      </div>


      <JewelQuickView piece={piece} open={open} onOpenChange={setOpen} />
    </article>
  );
};

export default JewelCard;
