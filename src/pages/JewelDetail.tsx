import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Heart, Share2, Minus, Plus, Phone, Mail, MessageCircle, Truck, Scissors, ShieldCheck, ReceiptText, MessageSquare, ArrowLeft } from "lucide-react";

import { toast } from "sonner";
import Footer from "@/components/Footer";
import CustomerReviews from "@/components/CustomerReviews";
import MaterialsCraft from "@/components/MaterialsCraft";
import UrgencyNotification from "@/components/UrgencyNotification";
import PincodeChecker from "@/components/product/PincodeChecker";
import DetailsTabs from "@/components/product/DetailsTabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWishlist } from "@/contexts/WishlistContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { jewellery, jewelleryEnquiryUrl, WHATSAPP_NUMBER } from "@/data/jewellery";

const ringSizes: { value: string; label: string }[] = [
  { value: "5", label: "US 5 · 4.9 cm" },
  { value: "6", label: "US 6 · 5.2 cm" },
  { value: "7", label: "US 7 · 5.4 cm" },
  { value: "8", label: "US 8 · 5.7 cm" },
];

const JewelDetail = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const piece = useMemo(() => jewellery.find((j) => j.handle === handle) ?? null, [handle]);
  const isMobile = useIsMobile();
  const { toggleItem, isWishlisted } = useWishlist();
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/jewellery");
  };

  const [selectedSize, setSelectedSize] = useState<string>(piece?.category === "Rings" ? "7" : "One Size");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const images = useMemo(() => {
    if (!piece) return [];
    return piece.gallery && piece.gallery.length > 0 ? piece.gallery : [piece.image];
  }, [piece]);

  const scrollToImage = useCallback((index: number) => {
    if (!scrollRef.current) return;
    isScrolling.current = true;
    scrollRef.current.scrollTo({ left: index * scrollRef.current.offsetWidth, behavior: "smooth" });
    setSelectedImage(index);
    setTimeout(() => { isScrolling.current = false; }, 400);
  }, []);

  useEffect(() => {
    if (!isMobile || !scrollRef.current) return;
    const el = scrollRef.current;
    let t: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (isScrolling.current) return;
        setSelectedImage(Math.round(el.scrollLeft / el.offsetWidth));
      }, 60);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(t); };
  }, [isMobile]);

  if (!piece) return <Navigate to="/jewellery" replace />;

  const wishlisted = isWishlisted(piece.handle);
  const related = jewellery.filter((j) => j.handle !== piece.handle).slice(0, 4);
  const enquiryHref = jewelleryEnquiryUrl(piece.name);
  const sizedEnquiryHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Naira Flore — I'd love to pre-order the "${piece.name}"${piece.category === "Rings" ? ` in size ${selectedSize}` : ""} (qty ${quantity}). Could you share availability and next steps?`
  )}`;

  const handleWishlist = () => toggleItem({ id: piece.handle, name: piece.name, price: piece.priceLabel, image: piece.image });
  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: piece.name, text: `Check out ${piece.name} on Naira Flore`, url });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); toast("Link copied"); }
    } catch { /* silent */ }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: piece.name,
    description: piece.blurb,
    brand: { "@type": "Brand", name: "Naira Flore" },
    category: piece.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: piece.price,
      availability: "https://schema.org/PreOrder",
      seller: { "@type": "Organization", name: "Naira Flore" },
    },
  };

  const WishlistBtn = (
    <button
      className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center transition-all duration-200"
      style={{ backgroundColor: "hsla(0,0%,100%,0.85)" }}
      onClick={handleWishlist}
      aria-label="Add to wishlist"
    >
      <Heart size={17} style={{ color: wishlisted ? "hsl(0 70% 55%)" : "hsl(0 0% 40%)", fill: wishlisted ? "hsl(0 70% 55%)" : "none" }} />
    </button>
  );
  const ShareBtn = (
    <button
      className="absolute bottom-16 right-4 z-10 w-10 h-10 flex items-center justify-center transition-all duration-200 shadow-sm"
      style={{ backgroundColor: "hsla(0,0%,100%,0.92)", borderRadius: "50%" }}
      onClick={handleShare}
      aria-label="Share piece"
    >
      <Share2 size={15} strokeWidth={1.6} style={{ color: "hsl(0 0% 30%)" }} />
    </button>
  );

  const Gallery = isMobile ? (
    <div className="relative">
      <div ref={scrollRef} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        {images.map((img, i) => (
          <div key={i} className="w-full shrink-0 snap-center" style={{ aspectRatio: "1/1", backgroundColor: "#F4EBE2" }}>
            <img src={img} alt={`${piece.name} view ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      {WishlistBtn}
      {ShareBtn}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-3 mb-1">
          {images.map((_, i) => (
            <button key={i} onClick={() => scrollToImage(i)} aria-label={`View ${i + 1}`} className="w-1.5 h-1.5 transition-all duration-200"
              style={{ borderRadius: "50%", backgroundColor: selectedImage === i ? "hsl(0 0% 20%)" : "hsl(0 0% 75%)", transform: selectedImage === i ? "scale(1.4)" : "scale(1)" }} />
          ))}
        </div>
      )}
    </div>
  ) : (
    <div className="relative w-full h-full min-h-full">
      <div className="grid grid-cols-2 grid-rows-2 gap-[4px] h-full min-h-full">
        {[0, 1, 0, 1].map((idx, i) => (
          <div key={i} className="overflow-hidden relative min-h-0" style={{ backgroundColor: "#F4EBE2", height: "100%" }}>
            <img src={images[idx] ?? images[0]} alt={`${piece.name} view ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]" />
          </div>
        ))}
      </div>
      {WishlistBtn}
      {ShareBtn}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      <Helmet>
        <title>{piece.name} · Demi-Gold Jewellery | Naira Flore</title>
        <meta name="description" content={`${piece.name} — ${piece.blurb.slice(0, 130)}`} />
        <link rel="canonical" href={`https://nairaflore.com/jewellery/${piece.handle}`} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      {/* Breadcrumb (desktop) */}
      <div className="max-w-[1400px] mx-auto px-6 pt-[100px] md:pt-[112px] lg:pt-[120px] pb-3 hidden md:flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-[11px] tracking-[0.04em]" style={{ color: "hsl(0 0% 55%)" }}>
          <Link to="/" className="hover:text-foreground">Home</Link><span>/</span>
          <Link to="/jewellery" className="hover:text-foreground">Jewellery</Link><span>/</span>
          <span style={{ color: "hsl(0 0% 30%)" }}>{piece.name}</span>
        </nav>
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] hover:text-foreground transition-colors"
          style={{ color: "hsl(0 0% 45%)" }}
          aria-label="Go back"
        >
          <ArrowLeft size={13} strokeWidth={1.6} /> Back
        </button>
      </div>

      {/* Mobile gallery */}
      <div className="md:hidden pt-[94px] relative">
        <button
          onClick={goBack}
          className="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center shadow-sm"
          style={{ backgroundColor: "hsla(0,0%,100%,0.92)", borderRadius: "50%" }}
          aria-label="Go back"
        >
          <ArrowLeft size={16} strokeWidth={1.6} style={{ color: "hsl(0 0% 20%)" }} />
        </button>
        {Gallery}
      </div>


      <div className="max-w-[1400px] mx-auto md:px-6 pb-24 md:pb-24">
        <div className="flex flex-col lg:grid lg:items-start lg:gap-0" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="hidden md:block">{Gallery}</div>

          {/* Details */}
          <div className="mt-5 md:mt-0 lg:py-2 flex flex-col w-full items-stretch px-4 lg:px-8 xl:px-10">
            {/* Category */}
            <p className="text-[10px] tracking-[0.34em]" style={{ color: "#B0843A", fontFamily: "'Jost', 'Inter', sans-serif" }}>
              {piece.category.toUpperCase()} · DEMI-GOLD
            </p>

            {/* Title */}
            <h1 className="font-cormorant text-[26px] md:text-[32px] lg:text-[36px] font-semibold leading-[1.15] tracking-[-0.01em] mt-2" style={{ color: "hsl(0 0% 12%)" }}>
              {piece.name}
            </h1>

            {/* Price */}
            <div className="mt-2 md:mt-3">
              <span className="font-cormorant text-[22px] md:text-[24px] font-bold" style={{ color: "hsl(0 0% 15%)" }}>
                {piece.priceLabel}
              </span>
              <span className="ml-2 text-[11px] tracking-[0.04em]" style={{ color: "hsl(0 0% 55%)" }}>
                Made to order · price shared on enquiry
              </span>
            </div>

            {/* Delivery badge */}
            <div className="flex items-center gap-2 mt-2">
              <Truck size={12} strokeWidth={1.5} style={{ color: "hsl(142 50% 38%)" }} />
              <span className="text-[12px]" style={{ color: "hsl(0 0% 45%)" }}>
                Plated &amp; finished in <strong className="font-medium">2–3 weeks</strong> · free sizing
              </span>
            </div>

            <p className="text-[12px] mt-2 leading-relaxed" style={{ color: "hsl(0 0% 50%)" }}>
              *Pre-order pricing available on WhatsApp. Each piece is hand-finished in the Naira atelier.
            </p>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 mt-4 py-3 border-y" style={{ borderColor: "hsl(0 0% 90%)" }}>
              {[
                { icon: Scissors, label: "Hand-finished" },
                { icon: ShieldCheck, label: "18k Demi-Gold" },
                { icon: ReceiptText, label: "Secure Payments" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                  <Icon size={16} strokeWidth={1.4} style={{ color: "hsl(186 35% 28%)" }} />
                  <span className="text-[10px] uppercase tracking-[0.1em] leading-tight" style={{ color: "hsl(0 0% 30%)" }}>{label}</span>
                </div>
              ))}
            </div>

            <PincodeChecker />

            <div className="my-4" style={{ borderTop: "1px solid hsl(0 0% 88%)" }} />

            {/* Size / One-size */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] uppercase tracking-[0.14em] font-medium" style={{ color: "hsl(0 0% 25%)" }}>
                  {piece.category === "Rings" ? "Ring Size (US)" : "Size"}
                </span>
                <a href={enquiryHref} target="_blank" rel="noopener noreferrer" className="text-[11px] underline tracking-[0.02em] min-h-[44px] px-2 -mr-2" style={{ color: "hsl(186 35% 28%)" }}>
                  Sizing help
                </a>
              </div>
              {piece.category === "Rings" ? (
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full h-11 text-[13px] font-medium tracking-[0.02em] rounded-none border" style={{ borderColor: "hsl(0 0% 80%)", color: "hsl(0 0% 20%)" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {ringSizes.map((s) => <SelectItem key={s.value} value={s.value} className="text-[13px] rounded-none">{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <div className="w-full h-11 flex items-center px-3 border text-[13px]" style={{ borderColor: "hsl(0 0% 80%)", color: "hsl(0 0% 20%)" }}>
                  One Size · adjustable on request
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="mt-4">
              <span className="text-[11px] uppercase tracking-[0.14em] font-medium block mb-2.5" style={{ color: "hsl(0 0% 25%)" }}>Quantity</span>
              <div className="inline-flex items-center border" style={{ borderColor: "hsl(0 0% 80%)" }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted">
                  <Minus size={13} style={{ color: "hsl(0 0% 30%)" }} />
                </button>
                <span className="w-12 text-center text-[13px] font-medium" style={{ color: "hsl(0 0% 20%)" }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-muted">
                  <Plus size={13} style={{ color: "hsl(0 0% 30%)" }} />
                </button>
              </div>
            </div>

            {/* CTA Row */}
            <div id="product-actions" className="flex gap-3 mt-5">
              <button
                onClick={handleWishlist}
                className="flex-1 h-[48px] text-[11px] font-medium uppercase tracking-[0.14em] border transition-colors duration-200 inline-flex items-center justify-center gap-2"
                style={{ borderColor: "hsl(0 0% 20%)", color: "hsl(0 0% 20%)", backgroundColor: "transparent" }}
              >
                <Heart size={14} style={{ fill: wishlisted ? "hsl(0 70% 55%)" : "none", color: wishlisted ? "hsl(0 70% 55%)" : "hsl(0 0% 20%)" }} />
                {wishlisted ? "Saved" : "Add to Wishlist"}
              </button>
              <a
                href={sizedEnquiryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-[48px] inline-flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200"
                style={{ backgroundColor: "hsl(0 0% 12%)", color: "hsl(0 0% 100%)" }}
              >
                <MessageSquare size={14} /> Enquire on WhatsApp
              </a>
            </div>

            <a
              href={enquiryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-[44px] mt-3 inline-flex items-center justify-center text-[11px] font-medium uppercase tracking-[0.12em] border transition-colors duration-200"
              style={{ borderColor: "hsl(0 0% 78%)", color: "hsl(0 0% 40%)" }}
            >
              Request custom design
            </a>

            {/* Policy links */}
            <div className="flex items-center justify-center gap-4 mt-3">
              <Link to="/exchange-return-policy" className="font-cormorant text-[12px] tracking-[0.02em] underline underline-offset-4" style={{ color: "hsl(0 0% 45%)" }}>Exchange &amp; Return Policy</Link>
              <span className="text-[10px]" style={{ color: "hsl(0 0% 75%)" }}>|</span>
              <Link to="/faqs" className="font-cormorant text-[12px] tracking-[0.02em] underline underline-offset-4" style={{ color: "hsl(0 0% 45%)" }}>FAQs</Link>
            </div>

            <div className="my-4" style={{ borderTop: "1px solid hsl(0 0% 90%)" }} />

            {/* Details tabs */}
            <DetailsTabs
              tabs={[
                {
                  id: "details",
                  label: "Details",
                  content: (
                    <div className="space-y-3">
                      <p className="text-[13px] leading-[1.7]" style={{ color: "hsl(0 0% 40%)" }}>{piece.blurb}</p>
                      <p className="text-[12px] italic leading-[1.7]" style={{ color: "hsl(0 0% 50%)", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                        {piece.materials}
                      </p>
                    </div>
                  ),
                },
                {
                  id: "care",
                  label: "Care",
                  content: (
                    <ul className="text-[13px] leading-[1.8] list-disc pl-4" style={{ color: "hsl(0 0% 40%)" }}>
                      <li>Store in the pouch provided, away from moisture.</li>
                      <li>Avoid contact with perfume, lotion, and chlorinated water.</li>
                      <li>Wipe gently with the polishing cloth; re-plating available.</li>
                    </ul>
                  ),
                },
              ]}
            />

            <div className="my-5" style={{ borderTop: "1px solid hsl(0 0% 90%)" }} />

            {/* Accordions */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="info" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
                <AccordionTrigger className="py-4 text-[12px] uppercase tracking-[0.12em] font-medium hover:no-underline" style={{ color: "hsl(0 0% 20%)" }}>Materials</AccordionTrigger>
                <AccordionContent><p className="text-[13px] leading-[1.7] pb-2" style={{ color: "hsl(0 0% 45%)" }}>{piece.materials}</p></AccordionContent>
              </AccordionItem>
              <AccordionItem value="delivery" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
                <AccordionTrigger className="py-4 text-[12px] uppercase tracking-[0.12em] font-medium hover:no-underline" style={{ color: "hsl(0 0% 20%)" }}>Delivery Timelines</AccordionTrigger>
                <AccordionContent>
                  <div className="text-[13px] leading-[1.7] pb-2 space-y-1.5" style={{ color: "hsl(0 0% 45%)" }}>
                    <p>• Made to order — plated &amp; finished in 2–3 weeks.</p>
                    <p>• Shipped free across India, insured in transit.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="disclaimer" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
                <AccordionTrigger className="py-4 text-[12px] uppercase tracking-[0.12em] font-medium hover:no-underline" style={{ color: "hsl(0 0% 20%)" }}>Disclaimer</AccordionTrigger>
                <AccordionContent>
                  <div className="text-[13px] leading-[1.7] pb-2 space-y-1.5" style={{ color: "hsl(0 0% 45%)" }}>
                    <p>• Handcrafted pieces carry gentle variation — part of their character.</p>
                    <p>• Stone tone may vary slightly from screen colours.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="additional" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
                <AccordionTrigger className="py-4 text-[12px] uppercase tracking-[0.12em] font-medium hover:no-underline" style={{ color: "hsl(0 0% 20%)" }}>Additional Information</AccordionTrigger>
                <AccordionContent>
                  <div className="text-[13px] leading-[1.7] pb-2 space-y-1.5" style={{ color: "hsl(0 0% 45%)" }}>
                    <p>• WhatsApp / WhatsApp Call: <span className="font-semibold" style={{ color: "hsl(0 0% 20%)" }}>+91 9561557935</span></p>
                    <p>• Manufactured and marketed by Naira Flore</p>
                    <p>• Address: Flat 7, Veeraj Blossom, Karanyogi Nagar, Nashik – 422002</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="my-4" style={{ borderTop: "1px solid hsl(0 0% 90%)" }} />

            {/* Help */}
            <div className="w-full">
              <span className="text-[11px] uppercase tracking-[0.14em] font-medium block mb-3" style={{ color: "hsl(0 0% 30%)" }}>Need Help?</span>
              <div className="flex flex-col md:flex-row w-full">
                {[
                  { icon: Phone, label: "Call Us", href: `tel:+${WHATSAPP_NUMBER}` },
                  { icon: Mail, label: "Email Us", href: "mailto:hello@nairaflore.com" },
                  { icon: MessageCircle, label: "WhatsApp", href: enquiryHref },
                ].map(({ icon: Icon, label, href }, idx) => (
                  <a
                    key={label}
                    href={href}
                    target={label === "WhatsApp" ? "_blank" : undefined}
                    rel={label === "WhatsApp" ? "noopener noreferrer" : undefined}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-[12px] tracking-[0.02em] transition-colors duration-200"
                    style={{
                      color: "hsl(0 0% 35%)",
                      borderTop: "1px solid hsl(0 0% 90%)",
                      borderBottom: "1px solid hsl(0 0% 90%)",
                      borderLeft: idx === 0 ? "1px solid hsl(0 0% 90%)" : "none",
                      borderRight: "1px solid hsl(0 0% 90%)",
                    }}
                  >
                    <Icon size={15} strokeWidth={1.5} />{label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CustomerReviews productName={piece.name} />
      <MaterialsCraft />

      {/* Related jewellery */}
      <section className="py-16 md:py-20" style={{ backgroundColor: "#FBF3EC" }}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <h2 className="font-cormorant text-[26px] md:text-[34px] text-center" style={{ color: "#1A1614" }}>You may also love</h2>
          <p className="text-center mt-2 text-[12px] tracking-[0.3em]" style={{ color: "#B0843A", fontFamily: "'Jost', 'Inter', sans-serif" }}>FROM THE DEMI-GOLD ATELIER</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8">
            {related.map((r) => (
              <Link key={r.handle} to={`/jewellery/${r.handle}`} className="group">
                <div className="aspect-square overflow-hidden" style={{ backgroundColor: "#F4EBE2" }}>
                  <img src={r.image} alt={r.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-3 text-[10px] tracking-[0.3em]" style={{ color: "#B0843A", fontFamily: "'Jost', 'Inter', sans-serif" }}>{r.category.toUpperCase()}</p>
                <h3 className="mt-1 font-cormorant text-[18px] md:text-[20px]" style={{ color: "#1A1614" }}>{r.name}</h3>
                <p className="mt-1 text-[12px]" style={{ color: "hsl(0 0% 50%)" }}>{r.priceLabel}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Sticky mobile enquire bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-white/95 backdrop-blur px-3 py-2 flex items-center gap-2" style={{ borderColor: "hsl(0 0% 90%)" }}>
        <button
          onClick={handleWishlist}
          aria-label="Wishlist"
          className="h-[46px] w-[46px] flex items-center justify-center border"
          style={{ borderColor: "hsl(0 0% 20%)" }}
        >
          <Heart size={16} style={{ fill: wishlisted ? "hsl(0 70% 55%)" : "none", color: wishlisted ? "hsl(0 70% 55%)" : "hsl(0 0% 20%)" }} />
        </button>
        <a
          href={sizedEnquiryHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 h-[46px] inline-flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em]"
          style={{ backgroundColor: "hsl(0 0% 12%)", color: "#fff" }}
        >
          <MessageSquare size={14} /> Enquire on WhatsApp
        </a>
      </div>

      <UrgencyNotification />
    </div>
  );
};

export default JewelDetail;
