import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Heart } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import Footer from "@/components/Footer";
import PincodeChecker from "@/components/product/PincodeChecker";
import { cardCover } from "@/lib/cardCover";
import { galleryAlt } from "@/lib/galleryAlt";
import { onRadioGroupKeyDown, rovingTabIndex } from "@/lib/radioGroup";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import RingSizeGuideModal from "@/components/jewellery/RingSizeGuideModal";
import RingSizeGuide from "@/components/jewellery/RingSizeGuide";
import PressMarquee from "@/components/jewellery/PressMarquee";
import PdpOfferLadder from "@/components/jewellery/PdpOfferLadder";
import { discountPercent } from "@/components/jewellery/JewelPriceTag";
import { CleanDots, CleanDropdown, CleanDropdowns, CleanFact, CleanFacts, CleanPrice, CleanStyles, cleanButton, percent } from "@/components/clean";
import { useQuery } from "@tanstack/react-query";
import { fromShopify, useLiveJewellery } from "@/hooks/useLiveJewellery";
import { fetchShopifyProductByHandle } from "@/lib/shopify";
import { isJewelleryProduct } from "@/lib/isJewelleryProduct";
import { JEWELLERY_HANDLES } from "@/data/jewelleryHandles";
import { reelForPiece, useReels } from "@/hooks/useReels";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { isAdjustableRing, adjustableFitNote, adjustableSizes } from "@/data/ringFit";
import { jewelleryEnquiryUrl, preorderWhatsAppUrl, WHATSAPP_NUMBER, PREORDER_NOTE, SOLD_OUT_LEAD, SIZE_PREORDER_LEAD, VARIANT_SOLD_OUT_LEAD, preorderLead, type JewelPiece } from "@/data/jewellery";
import { absoluteUrl } from "@/lib/absoluteUrl";
import { shopifyImage, shopifyOgImage, shopifySrcSet, OG_IMAGE_SIZE } from "@/lib/shopifyImage";
import { linkPlaced } from "@/lib/viewContent";
import { useViewContent } from "@/hooks/useViewContent";
import { deliveryRangeFromNow } from "@/lib/serviceability";
import { isPreviewPath, previewProductPath } from "@/lib/preview";
import { completeTheLook, isSetRow, moreLikeThis } from "@/lib/pairings";
import { buyableValues, cartLineFor, choiceNeeded, choices, choose, findVariant, oneTapVariant, sizeOption, variantLabel } from "@/lib/variants";
import { colourFromParam, colourOfVariant, colourOption, openingChoice, variantChoice, variantPhoto } from "@/lib/colourCards";
import { useBackToClose } from "@/hooks/useBackToClose";
import { coatingOf, hasZirconeStone, presentJewellery, stoneOf } from "@/lib/jewelleryPresentation";
import { reportShopperPerformance } from "@/lib/shopperPerformance";
import { QUANTITY_OFFERS } from "@/lib/promo";
import { clipText, fitTitle } from "@/lib/clipText";
import { GST_LABEL } from "@/lib/gst";
import { SHOP_RATING, clientsLabel } from "@/lib/trust";

/*
  The product page, at /jewellery/<handle> (and at /preview/jewellery/<handle>,
  kept out of search). It replaced JewelDetail.tsx, kept for now so the switch
  can be undone in one line in App.tsx.

  Same data, prices, offers, cart, checkout and tracking as before. The look is
  the clean system the bag is drawn from too (src/components/clean, the
  owner, 20 Nov 2026: "cleaner and elegant and simpler ... drop downs and
  remove clutter without making things different"): one face (Jost), six
  colours with gold as the only hue, one hairline, no boxes, shadows or
  rounded corners. Type and colour here come only from the `nc-` classes and
  `--nc-` tokens; Tailwind is for layout.

    photo, nothing laid over it, a 2px line showing which one → category and
    the shop's rating → name and the wishlist heart → price, MRP, saving and
    the tax note → one quiet table: QUALITY (anti-tarnish, skin-friendly, its
    plating) and OFFER (Buy 2 / 3 / 4 priced for this piece) → metal, stone or
    size → Buy Now and Add to cart → delivery in one line → four dropdowns
    (Description open; Details and size, Care and plating, Delivery and
    returns closed) → complete the look → reviews → press → reels → more of
    the category.

  Not carried over, because the code showed them to be made up: the "pieces
  sold in the last 48 hours" count (a number from the handle's letters), the
  "someone bought" card (random names and cities) and the "4.9 · 50 reviews"
  figure (one bundled list dealt to every piece). The head now carries the
  shop's own rating and client count (lib/trust).

  The html.nf-next class still swaps the stock blue-grey palette the shared
  dialogs and toasts draw from for the brand one.

  Outside /preview/ it indexes, links to the product pages and carries the
  structured data and the embedded piece the pre-built page is drawn from.
*/

const CustomerReviews = lazy(() => import("@/components/CustomerReviews"));
const ReelShopNext = lazy(() => import("@/components/reels/ReelShopNext"));
const GalleryReel = lazy(() => import("@/components/reels/GalleryReel"));

/* Square: 15 of the 16 hero photos are 1:1, and it keeps the name and price
   above the fold on a 390px phone (see JewelDetail.tsx). */
const MOBILE_FRAME = "1/1";
/* A transparent 1×1 GIF: what a screen gets from a <picture> whose source is not for it. */
const BLANK_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const PRICE_VALID_UNTIL = new Date(Date.now() + 365 * 864e5).toISOString().slice(0, 10);

/* The QUALITY row under the price. Every piece is sealed anti-tarnish over a
   hypoallergenic, nickel-free base (the anti-tarnish collection and the Care
   answers say the same); the plating is the piece's own. */
const platingBadge = (finish: string) => finish;

/* "Length: 15-19cm adjustable links" → { label: "Length", value: "15–19 cm adjustable links" }. */
const tidy = (value: string) =>
  value
    .trim()
    .replace(/(\d)\s*-\s*(\d)/g, "$1–$2")
    .replace(/(\d)(cm|mm)\b/g, "$1 $2");

/* Shopify listings end "… Material: Surgical stainless steel Care Waterproof
   and tarnish free, …", and the catalogue folds that care paragraph into the
   last spec. It is split back out here, so the spec reads "Surgical stainless
   steel" and Care gets the piece's own care text. */
const CARE_BREAK = /\s+Care\s+(?=[A-Z])/;
const specsOf = (piece: JewelPiece) => {
  let care: string | null = null;
  const specs = (piece.details ?? []).map((line) => {
    const [spec, careText] = line.split(CARE_BREAK);
    if (careText) care = careText.trim();
    const at = spec.indexOf(":");
    return at > 0 ? { label: spec.slice(0, at).trim(), value: tidy(spec.slice(at + 1)) } : { label: "", value: tidy(spec) };
  });
  return { specs, care };
};

const ringSizes: { value: string; status: "available" | "preorder" }[] = [
  { value: "5", status: "preorder" },
  { value: "6", status: "available" },
  { value: "7", status: "preorder" },
];
/* An open-back ring adjusts to fit every size it offers, so each reads as available. */
const ringSizesFor = (piece: JewelPiece) =>
  isAdjustableRing(piece) ? adjustableSizes(piece.handle).map((value) => ({ value, status: "available" as const })) : ringSizes;

/* The one tint, behind every photograph and in the loading shapes. */
const linen = "bg-[var(--nc-linen)]";
const JewelDetailSkeleton = () => (
  <div className="nf-clean min-h-screen">
    <CleanStyles />
    <Helmet>
      <title>Loading piece | Naira Flore</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <span className="sr-only" role="status">Loading piece</span>
    <div className="mx-auto max-w-[1400px] pb-16 pt-[107px] md:px-6 md:pt-[126px]" aria-hidden="true">
      <div className="flex flex-col lg:grid lg:items-start lg:gap-0" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className={`w-full ${linen}`} style={{ aspectRatio: MOBILE_FRAME }} />
        <div className="mt-6 px-4 lg:mt-0 lg:px-10">
          <div className={`h-8 w-4/5 ${linen}`} />
          <div className={`mt-4 h-6 w-1/3 ${linen}`} />
          <div className={`mt-3 h-3 w-3/5 ${linen}`} />
          <div className={`mt-8 h-12 w-full ${linen}`} />
        </div>
      </div>
    </div>
  </div>
);

/* What the pre-built page knew about its piece (see JewelDetail.tsx). */
type EmbeddedPiece = { piece: JewelPiece; rating: { rating: number; count: number } | null };
const readEmbeddedPiece = (handle?: string): EmbeddedPiece | null => {
  if (typeof document === "undefined" || !handle) return null;
  try {
    const data = JSON.parse(document.getElementById("nf-piece")?.textContent || "null") as EmbeddedPiece | null;
    return data?.piece?.handle === handle ? data : null;
  } catch {
    return null;
  }
};

/* A small square of the metal or stone beside its name. These picture the
   pieces themselves (a ruby, an emerald), not the brand's palette. */
const SWATCHES: Array<[RegExp, string]> = [
  [/rose/i, "#d7a593"],
  [/gold/i, "#c9a55a"],
  [/silver|rhodium/i, "#c8ccd2"],
  [/crystal|clear/i, "#eef3f6"],
  [/ruby/i, "#9b1b30"],
  [/emerald/i, "#1f7a4d"],
  [/light amethyst/i, "#b9a0d6"],
  [/amethyst/i, "#7b4fa0"],
  [/sapphire/i, "#2d4f9e"],
  [/aquamarine/i, "#7fc8d6"],
  [/peridot/i, "#a3c14a"],
  [/topaz/i, "#e0a64a"],
  [/garnet/i, "#7a1f2b"],
  [/blue zircon/i, "#3ba7c9"],
];
const swatchOf = (value: string) => SWATCHES.find(([pattern]) => pattern.test(value))?.[1];

/* "Silver, size 7": a variant's choices as the WhatsApp reserve names them. */
const choiceText = (options: Record<string, string>) =>
  Object.entries(options)
    .map(([name, value]) => (/size/i.test(name) ? `size ${value}` : value))
    .join(", ");
const sentence = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/* A suggested piece: photo, name, price, and a one-tap Add that opens the bag
   with the ladder already counting it. A piece that needs a size or a month
   goes to its page instead, rather than into the bag in a choice nobody made.
   A piece sold in metals or stones is added in the one beside it (`prefer`, the
   anchor's own choice), else as pictured, and the card shows that one. */
const PairingCard = ({ piece, href, compact = false, prefer }: { piece: JewelPiece; href: string; compact?: boolean; prefer?: Record<string, string> }) => {
  const { addItem, setDrawerOpen, isLoading } = useCart();
  const [adding, setAdding] = useState(false);
  const need = choiceNeeded(piece);
  const variant = compact ? oneTapVariant(piece, prefer) : undefined;
  const image = variantPhoto(piece, variant) ?? cardCover(piece);
  /* The page opens on the colour the card shows, not the piece's first. */
  const colour = variant ? variant.options[colourOption(piece)?.name ?? ""] : undefined;
  const to = colour ? `${href}${href.includes("?") ? "&" : "?"}colour=${encodeURIComponent(colour.toLowerCase())}` : href;
  const add = async () => {
    setAdding(true);
    setDrawerOpen(true);
    try {
      await addItem({
        ...cartLineFor(piece, variant),
        // an adjustable ring sold one way goes in as US 6, the size its page opens on
        ...(piece.category === "Rings" && !variant ? { size: "US 6" } : {}),
      });
    } finally {
      setAdding(false);
    }
  };
  /* A card's button: the small outline button, let to wrap, since three cards
     share a 360px phone and "Choose month" is wider than a third of it. */
  const action = `${cleanButton({ size: "sm", block: true })} mt-2 !whitespace-normal !px-1 text-center`;
  return (
    <article className="flex h-full min-w-0 flex-col" data-variant={variant ? variantLabel(variant) : undefined}>
      <Link to={to} className={`block aspect-square overflow-hidden ${linen}`}>
        <img
          src={shopifyImage(image, 360)}
          srcSet={shopifySrcSet(image, [240, 360, 480]) || undefined}
          sizes={compact ? "30vw" : "(max-width: 768px) 44vw, 220px"}
          alt={piece.name}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          width={360}
          height={360}
        />
      </Link>
      {/* A 44px target over the same two-line box: 5px of padding each side,
          taken back from the margins, so nothing below moves. The clamp sits
          inside: a clamped box clips at its padding edge, so padding on it
          showed the top of a third line over the price. */}
      <Link to={to} className="nc-small nc-small--ink -mb-[5px] mt-[3px] block min-h-[44px] py-[5px]">
        <span className="line-clamp-2">{piece.name}</span>
      </Link>
      {/* Pushed to the card's foot, so prices and buttons line up across a
          row whether a name takes one line or two. */}
      <p className="nc-small mt-auto pt-0.5">
        {variant ? `₹${variant.price.toLocaleString("en-IN")}` : piece.priceLabel}
        {variant && !need && <span> · {variantLabel(variant)}</span>}
      </p>
      {compact &&
        (need ? (
          <Link to={to} aria-label={`Choose a ${need} for ${piece.name}`} className={action}>
            Choose {need}
          </Link>
        ) : (
          <button
            type="button"
            onClick={add}
            disabled={adding || isLoading}
            aria-label={`Add ${piece.name}${variant ? ` in ${variantLabel(variant)}` : ""} to bag`}
            className={action}
          >
            {adding ? "Adding…" : "Add"}
          </button>
        ))}
    </article>
  );
};

const JewelDetailNext = () => {
  const { handle } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const inPreview = isPreviewPath(pathname);
  const hrefFor = useCallback((h: string) => (inPreview ? previewProductPath(h) : `/jewellery/${h}`), [inPreview]);
  const { jewellery, isLive, isLoading: catalogueLoading } = useLiveJewellery();
  const embedded = useMemo(() => readEmbeddedPiece(handle), [handle]);
  /* Known to this build: pre-built into the page, bundled, or in the snapshot. */
  const builtIn =
    Boolean(embedded) || JEWELLERY_HANDLES.has(handle ?? "") || jewellery.some((j) => j.handle === handle);
  /* A piece listed after the last Publish is in none of those, and its link
     used to wait for the whole catalogue (430 KB) to find it. Ask Shopify for
     that one piece (about 1 KB) at once instead. The key is ProductDetail's,
     so a catalogue ad's hop from /products/<handle> reuses the answer. */
  const lookup = useQuery({
    queryKey: ["shopify-product", handle],
    queryFn: () => fetchShopifyProductByHandle(handle ?? ""),
    enabled: Boolean(handle) && !isLive && !builtIn,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  const lookedUp = useMemo(
    () => (lookup.data && isJewelleryProduct(lookup.data) ? fromShopify(lookup.data, 0) : undefined),
    [lookup.data],
  );
  /* Shopify has answered: there is no such jewellery piece. */
  const lookupMissing = lookup.isSuccess && !lookedUp;
  const [snapshot, setSnapshot] = useState<JewelPiece[] | null>(null);
  /* The snapshot only helps a piece it holds. */
  const needSnapshot = !isLive && !embedded && JEWELLERY_HANDLES.has(handle ?? "") && !jewellery.some((j) => j.handle === handle);
  useEffect(() => {
    if (!needSnapshot || snapshot) return;
    let cancelled = false;
    import("@/data/jewellerySnapshot")
      .then((module) => !cancelled && setSnapshot(module.jewellerySnapshot))
      .catch(() => !cancelled && setSnapshot([]));
    return () => {
      cancelled = true;
    };
  }, [needSnapshot, snapshot]);
  const piece = useMemo(
    () =>
      presentJewellery(isLive
        ? jewellery.find((j) => j.handle === handle)
        : embedded?.piece ?? jewellery.find((j) => j.handle === handle) ?? snapshot?.find((j) => j.handle === handle) ?? lookedUp),
    [handle, jewellery, isLive, embedded, snapshot, lookedUp],
  );
  const snapshotPending = needSnapshot && snapshot === null;
  useEffect(() => {
    if (piece) return;
    if (lookupMissing) reportShopperPerformance("missing_product");
    else if (!catalogueLoading && !snapshotPending && !lookup.isLoading) {
      reportShopperPerformance(isLive ? "missing_product" : "product_load_error");
    }
  }, [piece, lookupMissing, catalogueLoading, snapshotPending, lookup.isLoading, isLive, handle]);
  const isMobile = useIsMobile();
  const { toggleItem, isWishlisted } = useWishlist();
  const { addItem, buyNow, setDrawerOpen, isLoading: cartLoading } = useCart();
  const [buying, setBuying] = useState(false);

  /* Naira's palette for everything on screen while this page is open,
     including the bag and dialogs, which render outside the page. */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("nf-next");
    return () => root.classList.remove("nf-next");
  }, []);

  /* Back inside Naira, never off the site. history.length counts every page
     the tab has shown, so a shopper who came from Google, WhatsApp or an ad
     in the same tab was sent back there, and one in a new tab to a blank one.
     React Router numbers its own entries from 0; above 0, or straight after
     another Naira page, the step back is ours. Otherwise go to the jewellery. */
  const goBack = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    let fromNaira = false;
    try {
      fromNaira = !!document.referrer && new URL(document.referrer).origin === window.location.origin;
    } catch {
      /* no usable referrer */
    }
    if (idx > 0 || (fromNaira && window.history.length > 1)) navigate(-1);
    else navigate("/jewellery");
  };

  const [selectedSize, setSelectedSize] = useState<string>("One Size");
  const sizedCategory = piece?.category === "Rings";
  useEffect(() => {
    setSelectedSize(sizedCategory ? "6" : "One Size");
  }, [sizedCategory, piece?.handle]);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  /* The metal, stone, size or month chosen, for a piece Shopify sells more than
     one way. It opens on the first variant that can be bought; once the shopper
     picks, that variant's own photo leads the gallery. A colour card in the
     shop grid links here on its colour (?colour=silver): the page opens on that
     colour, its photo first. A catalogue ad names a variant by Shopify's
     number instead (?variant=…): the page opens on what variantChoice
     (lib/colourCards) takes from it, its photo first. A colour picked here
     (?colour=) then wins over the ad's link. */
  const [searchParams, setSearchParams] = useSearchParams();
  const colourLink = searchParams.get("colour");
  const variantLink = colourLink ? null : searchParams.get("variant");
  const colourParam = colourLink ?? (piece ? colourOfVariant(piece, variantLink)?.toLowerCase() : undefined) ?? null;
  const opening = (p: JewelPiece) => variantChoice(p, variantLink) ?? openingChoice(p, colourParam);
  const [chosen, setChosen] = useState<Record<string, string>>(() => (piece ? opening(piece) : {}));
  const [picked, setPicked] = useState(() => Boolean(piece && (variantChoice(piece, variantLink) || colourFromParam(piece, colourParam))));
  const variantKey = piece?.variants?.map((v) => v.id).join(",") ?? "";
  useEffect(() => {
    const colour = piece ? colourFromParam(piece, colourParam) : undefined;
    const named = piece ? variantChoice(piece, variantLink) : undefined;
    /* A colour picked here writes the link; that must not undo a size the
       shopper has already chosen. */
    setChosen((current) =>
      !piece
        ? {}
        : !named && colour && current[colour.option] === colour.value && findVariant(piece, current)
          ? current
          : opening(piece),
    );
    setPicked(Boolean(named || colour));
    // A refetch of the same variants must not undo the shopper's choice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piece?.handle, variantKey, colourParam, variantLink]);
  const variant = piece ? findVariant(piece, chosen) : undefined;
  const pick = (option: string, value: string) => {
    if (!piece) return;
    setChosen((current) => choose(piece, current, option, value));
    setPicked(true);
    /* The colour stays in the link, so the page can be shared as seen. */
    if (colourOption(piece)?.name === option) {
      const next = new URLSearchParams(searchParams);
      next.set("colour", value.toLowerCase());
      setSearchParams(next, { replace: true });
    }
  };

  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);
  /* The phone's back closes the photo zoom and the size guide, as it does the
     bag, instead of leaving the piece behind them (see useBackToClose). */
  const zoom = useBackToClose("nfZoom", lightboxOpen, setLightboxOpen);
  const guide = useBackToClose("nfSizeGuide", sizeGuideOpen, setSizeGuideOpen);
  /* The rating scrolls to the reviews without a history step of its own, so
     back and ← still go where the shopper came from. */
  const toReviews = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("customer-reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stickyBarVisible, setStickyBarVisible] = useState(false);
  const stickyBarRef = useRef<HTMLDivElement>(null);

  /* A dated promise, recomputed by every real visitor; automated captures
     keep the range (see JewelDetail.tsx). */
  const [arrivesBy, setArrivesBy] = useState<string | null>(null);
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.webdriver) return;
    setArrivesBy(deliveryRangeFromNow());
  }, []);
  const [heartPopped, setHeartPopped] = useState(false);

  /* The reel a piece appears in becomes the gallery's last slide. Its list is
     a small request, asked for once the first screen has settled (the video
     itself only when the slide is reached); never in the pre-built page. */
  const [reelsWanted, setReelsWanted] = useState(false);
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.webdriver) return;
    const timer = window.setTimeout(() => setReelsWanted(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);
  const { data: reels } = useReels(reelsWanted);
  const galleryReel = useMemo(() => (piece ? reelForPiece(reels, piece.handle) : null), [reels, piece]);

  /* The product view, once per piece, naming the variant the page opens on,
     worked out from the link rather than read from `variant`, which a sibling
     effect may still be resetting on this render. A link the piece as first
     drawn cannot place (Star Point Band's Silver ad) waits for Shopify. */
  useViewContent(piece, colourParam, Boolean(piece && linkPlaced(piece, searchParams)), isLive || !catalogueLoading);

  /* The phone's buy bar shows whenever Add to cart is not fully on screen —
     so a buy button is visible from the moment the page opens — but never
     over the price. It watches the button itself: the gift line below it
     reaching past the screen's edge put the bar over a button in full view.
     Nor over the offer's rungs while they are on screen: the panel sits
     right above Add to cart, so on a 360x780 phone the bar covered the
     per-piece prices on the first screen. "The rungs" is the offer panel's
     list, and everything that marks a rung lives inside it, the reached
     rung's gold rule included: drawn on the panel's foot 8px below the list,
     that rule sat under the bar on a 390x844 phone while the list counted as
     clear. Rungs reaching past the screen's edge do not hold it back (an
     Instagram-sized screen keeps its bar). */
  useEffect(() => {
    const check = () => {
      const target = document.querySelector("#product-actions > button");
      if (!target) return;
      const r = target.getBoundingClientRect();
      const notFullyShown = r.bottom < 0 || r.bottom > window.innerHeight;
      const price = document.getElementById("product-price");
      const barHeight = stickyBarRef.current?.offsetHeight ?? 72;
      const priceClear = !price || price.getBoundingClientRect().bottom < window.innerHeight - barHeight;
      const rungs = document.querySelector("[data-offer-ladder] ul")?.getBoundingClientRect();
      const offerClear = !rungs || rungs.bottom > window.innerHeight || rungs.bottom < window.innerHeight - barHeight;
      const next = notFullyShown && priceClear && offerClear;
      /* Writing the same value back keeps React from rendering at all, so a
         reflow that changed nothing cannot ask for another layout pass. */
      setStickyBarVisible((cur) => (cur === next ? cur : next));
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    /* The observer fires inside the browser's own layout pass, and the check it
       triggered wrote state right there. When the size guide's chart changed the
       page height, the pass asked for a notification it could no longer deliver
       and Chromium threw "ResizeObserver loop completed with undelivered
       notifications" — the screen went blank. Deferring to the next frame takes
       the write out of the pass that caused it. */
    let frame = 0;
    const ro = new ResizeObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        check();
      });
    });
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [handle]);

  const leadImage = picked && piece ? variantPhoto(piece, variant) : undefined;
  const images = useMemo(() => {
    if (!piece) return [];
    const base = piece.gallery && piece.gallery.length > 0 ? piece.gallery : [piece.image];
    if (!leadImage) return base;
    const path = (url: string) => url.split("?")[0];
    return [leadImage, ...base.filter((url) => path(url) !== path(leadImage))];
  }, [piece, leadImage]);
  /* A new choice's photo leads the gallery: show it. */
  useEffect(() => {
    if (!leadImage) return;
    setSelectedImage(0);
    scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [leadImage]);
  const slideCount = images.length + (galleryReel ? 1 : 0);

  /* The counter follows the swipe, read once per frame. */
  useEffect(() => {
    if (!isMobile || !scrollRef.current) return;
    const el = scrollRef.current;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!el.offsetWidth) return;
        const next = Math.round(el.scrollLeft / el.offsetWidth);
        setSelectedImage((cur) => (cur === next ? cur : next));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isMobile, images.length]);

  const pairings = useMemo(() => (piece ? completeTheLook(piece, jewellery, 3) : []), [piece, jewellery]);
  const similar = useMemo(() => (piece ? moreLikeThis(piece, jewellery, 8) : []), [piece, jewellery]);

  /* Wait for the catalogue before calling a handle missing (see JewelDetail.tsx),
     unless Shopify has already said this one piece does not exist. */
  if (!piece) {
    if (!lookupMissing && (catalogueLoading || snapshotPending || lookup.isLoading)) return <JewelDetailSkeleton />;
    return <Navigate to="/jewellery" replace />;
  }

  const wishlisted = isWishlisted(piece.handle);
  const adjustable = isAdjustableRing(piece);
  /* Adjustability is fit, not inventory: an open-back ring Shopify has sold
     out is reserved like any other piece, not promised as shipping now. */
  const soldOut = piece.availableForSale === false;
  const isRing = piece.category === "Rings";
  const finish = coatingOf(piece);
  const stone = stoneOf(piece);
  const { specs, care: listedCare } = specsOf(piece);
  /* A size Shopify sells as variants (6, 7, 8) replaces the fixed list below. */
  const sizeName = sizeOption(piece);
  /* The piece as chosen: the variant's own price and MRP. */
  const shown = variant
    ? {
        ...piece,
        price: variant.price,
        priceLabel: `₹${variant.price.toLocaleString("en-IN")}`,
        compareAtPrice: variant.compareAtPrice,
        compareAtLabel: variant.compareAtPrice ? `₹${variant.compareAtPrice.toLocaleString("en-IN")}` : undefined,
      }
    : piece;
  const variantSoldOut = Boolean(variant && !variant.availableForSale);
  const saving = shown.compareAtPrice && shown.compareAtPrice > shown.price ? shown.compareAtPrice - shown.price : 0;
  const steel = /stainless steel/i.test(piece.materials);
  const waterproof = /waterproof/i.test(piece.materials) || /waterproof/i.test(listedCare ?? "");
  const enquiryHref = jewelleryEnquiryUrl(piece.name);
  /* A pre-order is a sold-out piece, or a ring size we do not stock (US 5 / 7). */
  const sizePreorder = isRing && !sizeName && !adjustable && ringSizes.find((r) => r.value === selectedSize)?.status === "preorder";
  /* ...or a variant Shopify has sold out of. */
  const isPreorder = soldOut || sizePreorder || variantSoldOut;
  /* ...and has the one lead time its state carries, wherever delivery is said. */
  const leadTime = preorderLead({ soldOut, variantSoldOut, sizePreorder, size: selectedSize });
  /* A ring Shopify does not sell in sizes is sized from the US list
     (`ringSizes`), and the size rides on the line as a note, a metal chosen or
     not (Droplet Open Ring is sold in gold and silver, not in sizes). */
  const noteSize = isRing && !sizeName ? `US ${selectedSize}` : undefined;
  /* "Silver, size 7" or "size US 6": what a WhatsApp message names. */
  const choiceLine = variant
    ? [choiceText(variant.options), noteSize && `size ${noteSize}`].filter(Boolean).join(", ")
    : noteSize && `size ${noteSize}`;
  const preorderHref = preorderWhatsAppUrl({
    name: piece.name,
    handle: piece.handle,
    priceLabel: shown.priceLabel,
    choice: choiceLine || undefined,
  });
  const sizedEnquiryHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Naira Flore, I'd love to order the "${piece.name}"${choiceLine ? ` in ${choiceLine}` : ""} Could you share availability and next steps?`,
  )}`;

  /* The variant chosen goes in the bag as itself, its size included; a ring
     sized from the list carries the size as a note on the line. */
  const cartItem = () =>
    variant
      ? { ...cartLineFor(piece, variant), ...(noteSize ? { size: noteSize } : {}) }
      : {
          id: piece.handle,
          variantId: piece.variantId,
          name: piece.name,
          price: piece.price,
          priceLabel: piece.priceLabel,
          currencyCode: "INR",
          image: cardCover(piece),
          size: noteSize,
        };

  /* The bag opens at the tap with the piece on its way in, and says so there
     if Shopify cannot add it. It used to open only once Shopify answered,
     one to three seconds on 4G. */
  const handleAddToCart = async () => {
    if (isPreorder) return handlePreOrder();
    setDrawerOpen(true);
    await addItem(cartItem());
  };

  const handleBuyNow = async () => {
    if (isPreorder) return handlePreOrder();
    if (buying || cartLoading) return;
    setBuying(true);
    try {
      await buyNow(cartItem());
    } finally {
      setBuying(false);
    }
  };

  /* Reservations never enter the payment flow. */
  const handlePreOrder = () => {
    window.open(preorderHref, "_blank", "noopener,noreferrer");
  };

  const handleWishlist = () => {
    if (!wishlisted) setHeartPopped(true);
    toggleItem({ id: piece.handle, name: piece.name, price: piece.priceLabel, image: cardCover(piece), kind: "jewellery", variantId: variant?.id ?? piece.variantId, amount: shown.price });
  };

  /* Tarnish and skin, answered from the piece's own materials, in Care.
     "PVD 18K gold coated" keeps its capitals mid-sentence; "Rhodium coated" does not. */
  const finishInSentence = /^[A-Z]{2}/.test(finish) ? finish : finish.charAt(0).toLowerCase() + finish.slice(1);
  const care = [
    {
      q: "Will it tarnish?",
      a: `It is ${finishInSentence}${steel && !/steel/i.test(finish) ? " on surgical stainless steel" : ""}${
        waterproof ? ", waterproof and made not to tarnish" : ", made to resist tarnish"
      }, and the finish is covered by our 3-year plating assurance — cared for well, it keeps its colour for a lifetime.`,
    },
    {
      q: "Sensitive skin?",
      a: `Every Naira piece is made to be skin-safe for everyday wear${steel ? ", on a surgical stainless steel base" : ""}. If it does not suit you, return it within 7 days.`,
    },
  ];

  const canonical = `https://nairaflore.com/jewellery/${piece.handle}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: piece.name,
    description: piece.blurb,
    brand: { "@type": "Brand", name: "Naira Flore" },
    category: piece.category,
    image: [piece.image],
    material: piece.materials,
    url: canonical,
    // An empty "sku" is invalid structured data; a piece without one leaves it out.
    ...(piece.sku ? { sku: piece.sku } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: piece.price,
      priceValidUntil: PRICE_VALID_UNTIL,
      availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Naira Flore" },
      url: canonical,
    },
  };
  const title = fitTitle(`${piece.name} · Demi-Gold Jewellery`);
  const ogImageUrl = absoluteUrl(shopifyOgImage(piece.image));

  /* One wishlist button, beside the name. It used to sit on the photo, on
     the laptop grid and in the phone's buy bar. */
  const heart = (
    <Heart
      size={20}
      strokeWidth={1.25}
      fill={wishlisted ? "currentColor" : "none"}
      className={heartPopped ? "heart-pop" : undefined}
      onAnimationEnd={() => setHeartPopped(false)}
      aria-hidden="true"
    />
  );

  /* The first photo shares one srcset between the two galleries, so it is
     downloaded once whichever the screen shows (see JewelDetail.tsx). */
  const HERO_WIDTHS = [480, 600, 720, 800, 900, 1000, 1200, 1400];
  const HERO_SIZES = "(max-width: 1024px) 100vw, 50vw";
  const prerendering = typeof navigator !== "undefined" && navigator.webdriver;
  /* A photo's button names it the way its alt does (lib/galleryAlt): a phone
     screen reader reads the button, not the photo inside it. */
  const openLabel = (img: string, i: number) => {
    const alt = galleryAlt(piece, img, i);
    const label = `Open ${piece.name} image ${i + 1} full screen`;
    return alt === `${piece.name} view ${i + 1}` ? label : `${label}: ${alt}`;
  };

  /* The phone's photos: edge to edge, swiped, nothing laid over them. The 2px
     line under them says which one is showing (the reel, when the piece is in
     one, is its last segment). */
  const MobileGallery = (
    <div>
      <div
        ref={scrollRef}
        className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}
      >
        {images.map((img, i) => (
          <button
            type="button"
            key={i}
            onClick={() => openLightbox(i)}
            className={`block w-full shrink-0 cursor-zoom-in snap-center p-0 ${linen}`}
            style={{ aspectRatio: MOBILE_FRAME, scrollSnapStop: "always" }}
            aria-label={openLabel(img, i)}
          >
            {(i === 0 || !prerendering) && (
              <img
                src={shopifyImage(img, 900)}
                srcSet={shopifySrcSet(img, i === 0 ? HERO_WIDTHS : [480, 720, 900, 1200]) || undefined}
                sizes={i === 0 ? HERO_SIZES : "100vw"}
                alt={galleryAlt(piece, img, i)}
                className="h-full w-full object-cover"
                width={900}
                height={1200}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                decoding={i === 0 ? "sync" : "async"}
              />
            )}
          </button>
        ))}
        {galleryReel && (
          <div
            className="relative w-full shrink-0 snap-center bg-[var(--nc-ink)]"
            style={{ aspectRatio: MOBILE_FRAME, scrollSnapStop: "always" }}
            aria-label={`${piece.name} in a Naira reel`}
          >
            <Suspense fallback={<div className="h-full w-full bg-[var(--nc-ink)]" />}>
              <GalleryReel reel={galleryReel} active={selectedImage === images.length} />
            </Suspense>
          </div>
        )}
      </div>
      {slideCount > 1 && (
        <div className="nc-segs" aria-hidden="true">
          {Array.from({ length: slideCount }, (_, i) => (
            <span key={i} data-on={i === selectedImage ? "" : undefined} />
          ))}
        </div>
      )}
    </div>
  );

  const DesktopGallery = (() => {
    const all = Array.from(new Set(images));
    const unique = all.slice(0, 4);
    const count = unique.length;
    /* The grid holds four; the rest (the size guide among them) were only in
       the full-screen view, with nothing saying they were there. */
    const more = all.length - count;
    const gridClass =
      count <= 1 ? "grid grid-cols-1 grid-rows-1" : count === 2 ? "grid grid-cols-1 grid-rows-2" : "grid grid-cols-2 grid-rows-2";
    return (
      <div className={`${gridClass} h-full min-h-full w-full gap-[4px]`}>
        {unique.map((img, i) => (
          <button
            type="button"
            key={img}
            onClick={() => openLightbox(i)}
            className={`relative block min-h-0 w-full cursor-zoom-in overflow-hidden p-0 ${linen} ${count === 3 && i === 0 ? "col-span-2" : ""}`}
            style={{ height: "100%" }}
            aria-label={openLabel(img, i)}
          >
            {i === 0 ? (
              <img
                src={shopifyImage(img, 900)}
                srcSet={shopifySrcSet(img, HERO_WIDTHS) || undefined}
                sizes={HERO_SIZES}
                alt={galleryAlt(piece, img, i)}
                className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                width={1000}
                height={1000}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
              />
            ) : (
              /* Photos two to four are on this grid only, which a phone never
                 shows, yet phones downloaded them, lazy or not: about 300 KB
                 on Prism Rivière (27 Oct 2026). Only a desktop-width screen
                 picks their source; a phone gets a one-pixel blank. */
              <picture className="contents">
                <source media="(min-width: 768px)" srcSet={shopifySrcSet(img, [600, 800, 1000, 1400]) || shopifyImage(img, 1000)} sizes={HERO_SIZES} />
                <img
                  src={BLANK_PIXEL}
                  alt={galleryAlt(piece, img, i)}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                  width={1000}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            )}
            {/* The one mark on a photograph: that there are more of them. */}
            {more > 0 && i === count - 1 && (
              <span className="nc-label absolute bottom-3 right-3 bg-[var(--nc-ivory)] px-2.5 py-1.5">
                +{more} {more === 1 ? "photo" : "photos"}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  })();

  /* A choice's label row: its name in the caps label, the value chosen beside
     it, and for a ring the way to the size chart. */
  const sizeGuideLink = (
    <button type="button" onClick={() => setSizeGuideOpen(true)} className="nc-small nc-link nc-link--ink nc-tap shrink-0">
      Size guide
    </button>
  );
  const stockNote = "nc-small mt-2";
  /* The delivery promise in one line under the buttons: free shipping, the
     date a visitor is quoted (the pre-built page and a reserved piece carry
     none), the gift box. Each fact stays whole if a narrow phone wraps it. */
  const promise = ["Free insured shipping", !isPreorder && arrivesBy ? `Arrives ${arrivesBy}` : null, "Gift-boxed"].filter(Boolean);

  return (
    <div>
      {/* Everything the clean system draws. The footer is a sibling, not a
          child: inside, it would inherit this root's face and line height. */}
      <div className="nf-clean min-h-screen">
      <CleanStyles />
      <Helmet>
        <title>{inPreview ? `Preview · ${title}` : title}</title>
        <meta name="description" content={`${piece.name}, ${clipText(piece.blurb, 130)}`} />
        <link rel="canonical" href={canonical} />
        {/* Under review at /preview/: kept out of search, pointing at the live page. */}
        <meta name="robots" content={inPreview ? "noindex, nofollow" : "index, follow, max-image-preview:large"} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={clipText(piece.blurb, 150)} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:secure_url" content={ogImageUrl} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content={String(OG_IMAGE_SIZE)} />
        <meta property="og:image:height" content={String(OG_IMAGE_SIZE)} />
        <meta property="og:image:alt" content={piece.name} />
        <meta property="og:url" content={canonical} />
        <meta property="og:site_name" content="Naira Flore" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={clipText(piece.blurb, 150)} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>
      <JsonLd data={structuredData} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://nairaflore.com/" },
            { "@type": "ListItem", position: 2, name: "Jewellery", item: "https://nairaflore.com/jewellery" },
            { "@type": "ListItem", position: 3, name: piece.name, item: canonical },
          ],
        }}
      />
      {/* The piece the pre-built page was made from, read by the first render
          (see JewelDetail.tsx). The shape is unchanged; the rating it used to
          carry was the bundled review list's, which the page no longer shows. */}
      <script
        type="application/json"
        id="nf-piece"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ piece, rating: null }).replace(/</g, "\\u003c") }}
      />

      {/* The page's one main landmark; the footer and the phone buy bar stay outside it. */}
      <main className="pb-12 lg:pb-16">
      {/* Breadcrumb (laptop). On a short screen (1280x720) the row gives back
          8px, so the buttons stay on the first screen in the tallest state: a
          ring in two metals and five sizes, with pieces already in the bag. */}
      <div className="mx-auto hidden max-w-[1400px] items-center justify-between gap-4 px-6 pb-3 pt-[126px] md:flex lg:pt-[136px]">
        <nav aria-label="Breadcrumb" className="nc-small flex items-center gap-2 pt-2 [@media(max-height:760px)]:pt-0">
          <Link to="/" className="nc-tap -mx-1.5 px-1.5">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/jewellery" className="nc-tap">Jewellery</Link>
          <span aria-hidden="true">/</span>
          <span className="nc-small nc-small--ink" aria-current="page">{piece.name}</span>
        </nav>
        <button type="button" onClick={goBack} className="nc-small nc-link nc-tap mt-2 gap-1.5 [@media(max-height:760px)]:mt-0" aria-label="Go back">
          <ArrowLeft size={14} strokeWidth={1.25} aria-hidden="true" /> Back
        </button>
      </div>

      {/* Phone gallery. Both galleries are in the page and CSS shows one (see JewelDetail.tsx). */}
      <div className="pt-[107px] md:hidden">{MobileGallery}</div>

      <div className="mx-auto max-w-[1400px] md:px-6">
        <div className="flex flex-col lg:grid lg:items-start lg:gap-0" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* On a laptop the photos stay in view while the details scroll past
              them, sized to the screen so the lower row is never cut off. */}
          <div className="hidden md:block lg:sticky lg:top-[140px] lg:h-[calc(100vh-156px)] lg:self-start">{DesktopGallery}</div>

          <div className="w-full px-4 pt-3.5 md:pt-6 lg:pl-10 lg:pr-0 lg:pt-0 xl:pl-12 min-[1440px]:pl-16">
          <div className="lg:max-w-[520px]">
            {/* Category, the way back to the collection; and the shop's own
                rating (lib/trust), the way down to the reviews. */}
            <div className="flex items-center justify-between gap-3">
              <Link to="/jewellery" data-pdp="eyebrow" className="nc-label nc-label--gold nc-tap">
                {piece.category}
              </Link>
              <a
                href="#customer-reviews"
                onClick={toReviews}
                className="nc-small nc-tap shrink-0 gap-1"
                aria-label={`Rated ${SHOP_RATING} out of 5. Trusted by ${clientsLabel} clients. Jump to reviews.`}
              >
                <span aria-hidden="true" className="nc-star">★</span>
                <span className="nc-small nc-small--ink">{SHOP_RATING}</span>
                <span aria-hidden="true">·</span>
                <span className="nc-link">{clientsLabel} clients</span>
              </a>
            </div>

            <div className="mt-0.5 flex items-start justify-between gap-3">
              <h1 data-pdp="title" className="nc-title min-w-0">
                {piece.name}
              </h1>
              <button
                type="button"
                onClick={handleWishlist}
                className="nc-iconbtn -my-1.5 -mr-3 shrink-0"
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={wishlisted}
              >
                {heart}
              </button>
            </div>

            {/* Price, the MRP it replaces and the saving, as the percentage shoppers compare. */}
            <CleanPrice
              id="product-price"
              className="mt-1.5"
              price={shown.priceLabel}
              compareAt={saving > 0 ? shown.compareAtLabel : null}
              percentOff={saving > 0 ? discountPercent(shown) : null}
              note={`incl. ${GST_LABEL}`}
            />

            {/* One quiet table where three badges, a sold count and an offer
                box used to be. Stone evidence comes from the listing, not the
                generic summary. */}
            <CleanFacts className="mt-4">
              <CleanFact label="Quality">
                <CleanDots items={["Anti-tarnish", "Skin-friendly", platingBadge(finish), hasZirconeStone(piece) && "Zircone Stone"]} />
              </CleanFact>
              {/* Buy 2 / 3 / 4, priced for this piece and following the bag. A
                  piece sold out altogether is reserved on WhatsApp and never
                  reaches the bag, so it is offered nothing it cannot get. */}
              {!soldOut && <PdpOfferLadder price={shown.price} preorder={sizePreorder || variantSoldOut} />}
            </CleanFacts>

            {/* The ways Shopify sells this piece: a metal, a stone, a size, a
                month. Each value shows whether it can be bought with the other
                choices as they stand; a sold-out one can still be reserved. */}
            {choices(piece).map((option) => {
              const buyable = buyableValues(piece, option.name, chosen);
              const isSize = option.name === sizeName;
              /* Ring sizes are US sizes, with a guide; any other size is as Shopify names it. */
              const ringSize = isSize && isRing;
              return (
                <div key={option.name} className="mt-4" data-option={option.name}>
                  <div className="flex min-h-[24px] items-center justify-between gap-3">
                    <p className="flex min-w-0 items-baseline gap-2">
                      <span className="nc-label">{ringSize ? `${option.name} · US` : option.name}</span>
                      {chosen[option.name] && <span className="nc-small nc-small--ink">{chosen[option.name]}</span>}
                    </p>
                    {ringSize && sizeGuideLink}
                  </div>
                  {option.values.length > 6 ? (
                    <select
                      value={chosen[option.name] ?? ""}
                      onChange={(event) => pick(option.name, event.target.value)}
                      aria-label={option.name}
                      className="nc-select mt-2"
                    >
                      {option.values.map((value) => (
                        <option key={value} value={value}>
                          {buyable[value] ? value : `${value} · pre-order`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div role="radiogroup" aria-label={option.name} onKeyDown={onRadioGroupKeyDown} className="nc-chips mt-2">
                      {option.values.map((value, i) => {
                        const active = chosen[option.name] === value;
                        const swatch = isSize ? undefined : swatchOf(value);
                        return (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            tabIndex={rovingTabIndex(option.values.indexOf(chosen[option.name] ?? ""), i)}
                            onClick={() => pick(option.name, value)}
                            className="nc-chip"
                          >
                            <span>
                              {swatch && <span aria-hidden="true" className="nc-swatch" style={{ background: swatch }} />}
                              {value}
                            </span>
                            {!buyable[value] && <span className="nc-chip__note">Pre-order</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {/* A ring Shopify does not sell in sizes: the US size, after any
                metal, as on the rings sold in sizes. */}
            {isRing && !sizeName && (
              <div className="mt-4">
                <div className="flex min-h-[24px] items-center justify-between gap-3">
                  <span className="nc-label">Ring size · US</span>
                  {sizeGuideLink}
                </div>
                <div role="radiogroup" aria-label="Ring size, US" onKeyDown={onRadioGroupKeyDown} className="nc-chips mt-2">
                  {ringSizesFor(piece).map((s, i, sizes) => {
                    const active = selectedSize === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        tabIndex={rovingTabIndex(sizes.findIndex((size) => size.value === selectedSize), i)}
                        onClick={() => setSelectedSize(s.value)}
                        className="nc-chip"
                      >
                        {s.value}
                        {s.status === "preorder" && <span className="nc-chip__note">Pre-order</span>}
                      </button>
                    );
                  })}
                </div>
                {/* A sold-out ring (or metal) is made to order in every size;
                    the line under Pre-order says when it ships. */}
                {!soldOut && !variantSoldOut && (
                  <p className={stockNote}>
                    {adjustable
                      ? `US ${selectedSize} ships now. ${adjustableFitNote(piece.handle)}`
                      : selectedSize === "6"
                        ? "US 6 is in stock and ships now."
                        : `US ${selectedSize} is a pre-order, ${SIZE_PREORDER_LEAD}.`}
                  </p>
                )}
              </div>
            )}
            {/* A sold-out piece says its lead time once, under the button. */}
            {variant && !soldOut && (sizeName || variantSoldOut) && (
              <p className={stockNote}>
                {variantSoldOut
                  ? `${sentence(choiceText(variant.options))} is sold out for now. ${VARIANT_SOLD_OUT_LEAD}`
                  : `${isRing ? "US" : "Size"} ${chosen[sizeName ?? ""]} is in stock and ships now.`}
              </p>
            )}
            <RingSizeGuideModal isOpen={sizeGuideOpen} onClose={guide.requestClose} highlightSize={sizeName ? chosen[sizeName] ?? selectedSize : selectedSize} adjustable={adjustable} fitSizes={adjustableSizes(piece.handle)} />

            {/* Quantity stays in the bag; both actions use the same chosen
                variant. The buttons are this box's own children: the phone's
                buy bar watches the first of them. */}
            <div id="product-actions" className="nc-btnrow mt-5">
              {!isPreorder && (
                <button type="button" onClick={handleBuyNow} disabled={cartLoading || buying} className={cleanButton()}>
                  {buying ? "Opening checkout…" : "Buy Now"}
                </button>
              )}
              <button
                type="button"
                onClick={isPreorder ? handlePreOrder : handleAddToCart}
                disabled={cartLoading || buying}
                className={`${cleanButton({ fill: "ink" })} ${isPreorder ? "col-span-2" : ""}`}
              >
                {isPreorder ? "Reserve now" : "Add to cart"}
              </button>
              {/* eslint-disable-next-line no-constant-binary-expression -- switched off in Lovable on 30 Sep (it was soldOut &&); kept so it can be switched back */}
              {false && (
                <a href={sizedEnquiryHref} target="_blank" rel="noopener noreferrer" className={`${cleanButton({ size: "sm", block: true })} col-span-2`}>
                  Reserve on WhatsApp
                </a>
              )}
              <p className="nc-small col-span-2 mt-1 text-center [text-wrap:balance]">
                {soldOut
                  ? `${SOLD_OUT_LEAD}, gift-boxed`
                  : promise.map((fact, i) => (
                      <span key={fact} className="whitespace-nowrap">
                        {fact}
                        {i < promise.length - 1 && <span aria-hidden="true">{" ·"}</span>}{" "}
                      </span>
                    ))}
              </p>
              {/* Lovable's "Naira bundle" panel (PdpOffers, 11829ae) said the same offer
                  a second time under Buy Now; the page shows it once, in the
                  OFFER row under the price, which also follows the bag. */}
            </div>

            {/* Four dropdowns (the owner: "see how to put drop downs and
                remove clutter"). The paragraph that sells the piece is open;
                specifications, care and delivery wait until asked for. Every
                panel stays in the page, so all of it is in the HTML. */}
            <CleanDropdowns className="mt-6">
              <CleanDropdown title="Description" id="pdp-panel-description" defaultOpen>
                <p>{piece.blurb}</p>
                {piece.stylingTip && <p>{piece.stylingTip}</p>}
              </CleanDropdown>

              <CleanDropdown title="Details and size" id="pdp-panel-details">
                {specs.length > 0 && (
                  <CleanFacts bare>
                    {specs.map((s, i) => (
                      <CleanFact key={i} label={s.label || "Detail"}>
                        {s.value}
                      </CleanFact>
                    ))}
                    {stone && !specs.some((s) => /stone/i.test(s.label)) && <CleanFact label="Stone">{stone}</CleanFact>}
                  </CleanFacts>
                )}
                {/* The spec list names plating and metal; the summary line is for pieces without one. */}
                {specs.length === 0 && <p>{piece.materials}</p>}
                {isRing && <RingSizeGuide highlightSize={sizeName ? chosen[sizeName] ?? selectedSize : selectedSize} adjustable={adjustable} fitSizes={adjustableSizes(piece.handle)} />}
                {/* The size guide photo again, right where the sizes are read. */}
                {piece.sizeGuide && (
                  <img
                    src={shopifyImage(piece.sizeGuide, 720)}
                    srcSet={shopifySrcSet(piece.sizeGuide, [480, 720, 960]) || undefined}
                    sizes="(min-width: 1024px) 420px, 100vw"
                    alt={`${piece.name} size guide`}
                    loading="lazy"
                    decoding="async"
                    className={`block w-full max-w-[420px] ${linen}`}
                  />
                )}
              </CleanDropdown>

              <CleanDropdown title="Care and plating" id="pdp-panel-care">
                <p>{piece.care ?? listedCare ?? "Store in the pouch, avoid perfume and chlorinated water, and wipe gently after wear."}</p>
                {/* The two questions every jewellery buyer asks, answered for this piece. */}
                {care.map((c) => (
                  <p key={c.q}>
                    <strong>{c.q}</strong> {c.a}
                  </p>
                ))}
              </CleanDropdown>

              <CleanDropdown title="Delivery and returns" id="pdp-panel-delivery">
                <p>
                  {leadTime ? `${leadTime} ` : arrivesBy ? `Order today and it arrives by ${arrivesBy}. ` : `${PREORDER_NOTE} `}
                  Free insured shipping across India, dispatched from our Mumbai atelier.
                </p>
                <p>
                  Cash on delivery available. 7-day returns —{" "}
                  <Link to="/exchange-return-policy" className="nc-link nc-link--ink">
                    read the policy
                  </Link>
                  .
                </p>
                <PincodeChecker preorder={isPreorder} look="clean" />
                <p>
                  <a href={isRing ? sizedEnquiryHref : enquiryHref} target="_blank" rel="noopener noreferrer" className="nc-link nc-link--ink nc-tap">
                    Questions? Chat with us on WhatsApp
                  </a>
                </p>
              </CleanDropdown>
            </CleanDropdowns>

            {/* Another piece, one tap from the bag. The label is the ladder's
                first rung, read from promo.ts, so it always quotes the first
                rung the bag really has. */}
            {pairings.length > 0 && (
              <section className="mt-12 lg:mt-16" aria-labelledby="complete-the-look">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 id="complete-the-look" className="nc-heading">
                    {isSetRow(piece, pairings) ? "Complete the set" : "Complete the look"}
                  </h2>
                  <p className="nc-label nc-label--gold shrink-0">
                    {QUANTITY_OFFERS[0].minQuantity} pieces · {percent(QUANTITY_OFFERS[0].rate)} off
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {pairings.map((p) => (
                    <PairingCard key={p.handle} piece={p} href={hrefFor(p.handle)} compact prefer={variant?.options} />
                  ))}
                </div>
              </section>
            )}
          </div>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="min-h-[240px]" aria-hidden="true" />}>
        <CustomerReviews productName={piece.name} variant="jewellery" look="clean" />
      </Suspense>

      <PressMarquee />

      <Suspense fallback={<div className="min-h-[420px] md:hidden" aria-hidden="true" />}>
        <ReelShopNext hrefFor={hrefFor} />
      </Suspense>

      {similar.length > 0 && (
        <section className="mx-auto max-w-[1400px] pt-12 md:px-6 lg:pt-16" aria-labelledby="more-like-this">
          <h2 id="more-like-this" className="nc-heading px-4 md:px-0">
            More {piece.category.toLowerCase()}
          </h2>
          {/* Keyed by its pieces: when the live catalogue reorders them, a
              snapping rail follows the card it was resting on, and the row
              opened scrolled to its far end (966px on Woven Gold Hoops). A
              new list is a new rail, at its start. */}
          <div
            key={similar.map((p) => p.handle).join(" ")}
            className="scrollbar-hide mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:grid md:grid-cols-4 md:gap-y-8 md:overflow-visible md:px-0"
            style={{ overscrollBehaviorX: "contain", scrollPaddingInline: "16px" }}
          >
            {similar.map((p) => (
              <div key={p.handle} className="w-[42vw] max-w-[220px] shrink-0 snap-start md:w-auto md:max-w-none">
                <PairingCard piece={p} href={hrefFor(p.handle)} />
              </div>
            ))}
          </div>
        </section>
      )}
      </main>
      </div>

      <Footer compact slim />

      {/* Phone buy bar: shown whenever Add to cart is not fully on screen.
          The same two buttons, pinned; solid, with one hairline. */}
      <div
        ref={stickyBarRef}
        className="nf-clean fixed inset-x-0 bottom-0 z-40 transition-[transform,visibility] duration-300 ease-out md:hidden"
        style={{
          transform: stickyBarVisible ? "translateY(0)" : "translateY(110%)",
          visibility: stickyBarVisible ? "visible" : "hidden",
          pointerEvents: stickyBarVisible ? "auto" : "none",
        }}
        aria-hidden={!stickyBarVisible}
      >
        <div className="nc-bar">
          {!isPreorder && (
            <button type="button" onClick={handleBuyNow} disabled={cartLoading || buying} className={cleanButton({ size: "bar" })}>
              {buying ? "Opening…" : "Buy Now"}
            </button>
          )}
          <button
            type="button"
            onClick={isPreorder ? handlePreOrder : handleAddToCart}
            disabled={cartLoading || buying}
            className={cleanButton({ fill: "ink", size: "bar" })}
          >
            {isPreorder ? "Reserve now" : "Add to cart"}
          </button>
        </div>
      </div>

      <ImageLightbox
        images={images}
        alts={images.map((img, i) => galleryAlt(piece, img, i))}
        name={piece.name}
        open={lightboxOpen}
        initialIndex={lightboxIndex}
        onOpenChange={(open) => (open ? setLightboxOpen(true) : zoom.requestClose())}
      />
    </div>
  );
};

export default JewelDetailNext;
