import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Check, Minus, Plus, Phone, Mail, MessageCircle, Truck, Wallet, Scissors, ReceiptText, ShieldCheck, RotateCcw, BadgeCheck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { AtelierAccordionTrigger } from "@/components/ui/atelier-accordion";
import SizeGuideModal from "@/components/SizeGuideModal";
import PincodeChecker from "@/components/product/PincodeChecker";
import PriceBreakup from "@/components/product/PriceBreakup";
import DetailsTabs from "@/components/product/DetailsTabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { availabilityByOption, formatShopifyPrice, type ShopifyProductNode, type ShopifyProductVariant } from "@/lib/shopify";

const fallbackSizes = ["XS", "S", "M", "L", "XL"];

const ProductDetails = ({ product }: { product?: ShopifyProductNode | null }) => {
  const sizeOptions = useMemo(() => product?.options.find((option) => option.name.toLowerCase() === "size")?.values ?? fallbackSizes, [product]);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0] ?? "M");

  useEffect(() => {
    if (sizeOptions.length > 0 && !sizeOptions.includes(selectedSize)) {
      setSelectedSize(sizeOptions[0]);
    }
  }, [selectedSize, sizeOptions]);
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<number>();
  const { addItem, buyNow, setDrawerOpen } = useCart();

  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  const selectedVariant: ShopifyProductVariant | undefined = useMemo(() => {
    const variants = product?.variants.edges.map((edge) => edge.node) ?? [];
    return variants.find((variant) =>
      variant.selectedOptions.some((option) => option.name.toLowerCase() === "size" && option.value === selectedSize)
    ) ?? variants.find((variant) => variant.availableForSale) ?? variants[0];
  }, [product, selectedSize]);

  const sizeAvailability = useMemo(() => availabilityByOption(product, "size"), [product]);
  // Treat "unknown" as buyable: products with no size option (most jewellery)
  // have no entry here and must not be blocked.
  const selectedInStock = sizeAvailability[selectedSize] ?? selectedVariant?.availableForSale ?? true;

  const title = product?.title ?? "Shopify product";
  const description = product?.description || "Product details are being loaded from Shopify.";
  const image = product?.images.edges[0]?.node.url ?? "/placeholder.svg";
  const priceMoney = selectedVariant?.price ?? product?.priceRange.minVariantPrice;
  const priceLabel = priceMoney ? formatShopifyPrice(priceMoney) : "·";
  const numericPrice = priceMoney ? Number(priceMoney.amount) : 0;

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) {
      toast.error("This product is currently unavailable.");
      return;
    }
    if (!selectedInStock) {
      toast.error(`${title} is sold out in size ${selectedSize}.`);
      return;
    }

    await addItem({
      id: product?.handle ?? selectedVariant.id,
      variantId: selectedVariant.id,
      name: title,
      price: numericPrice,
      priceLabel,
      currencyCode: priceMoney?.currencyCode ?? "INR",
      image,
      size: selectedSize,
      variantTitle: selectedVariant.title,
      selectedOptions: selectedVariant.selectedOptions,
    }, quantity);
    setAdded(true);
    window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 1500);
    toast("Added to cart", {
      description: `${quantity}× ${title}${selectedSize ? ` (${selectedSize})` : ""}`,
      action: { label: "View Cart", onClick: () => setDrawerOpen(true) },
    });
  };

  /* Straight to Shopify checkout with this piece added. */
  const handleBuyNow = async () => {
    if (!selectedVariant?.id) {
      toast.error("This product is currently unavailable.");
      return;
    }
    await buyNow({
      id: product?.handle ?? selectedVariant.id,
      variantId: selectedVariant.id,
      name: title,
      price: numericPrice,
      priceLabel,
      currencyCode: priceMoney?.currencyCode ?? "INR",
      image,
      size: selectedSize,
      variantTitle: selectedVariant.title,
      selectedOptions: selectedVariant.selectedOptions,
    }, quantity);
  };

  return (
    <div className="flex flex-col w-full items-stretch px-4 lg:px-8 xl:px-10">
      {/* Title */}
      <h1
        className="font-cormorant text-[26px] md:text-[32px] lg:text-[36px] font-semibold leading-[1.15] tracking-[-0.01em]"
        style={{ color: "hsl(0 0% 12%)" }}
      >
        {title}
      </h1>

      {/*
        Above-fold social proof. Deliberately a jump link and not a star
        rating: the reviews it points at are brand-level and identical on
        every product, so any score here would read as a per-product rating
        the data cannot support. Once Judge.me is connected
        (VITE_JUDGEME_SCRIPT_URL) its widget renders genuine per-product
        ratings at the same anchor and a star summary can live here honestly.
      */}
      <a
        href="#customer-reviews"
        className="flex items-center gap-2 mt-2 text-[12px] underline underline-offset-4 min-h-[44px]"
        style={{ color: "hsl(186 35% 28%)" }}
      >
        <Camera size={13} strokeWidth={1.5} />
        See customer photos &amp; reviews
      </a>


      {/* Price + Tax */}
      <div className="mt-2 md:mt-3">
        <span
          className="font-cormorant text-[22px] md:text-[24px] font-bold"
          style={{ color: "hsl(0 0% 15%)" }}
        >
          {priceLabel}
        </span>
        <span
          className="ml-2 text-[11px] tracking-[0.04em]"
          style={{ color: "hsl(0 0% 55%)" }}
        >
          Taxes included
        </span>
      </div>

      {/* Delivery badge */}
      <div className="flex items-center gap-2 mt-2">
        <Truck size={12} strokeWidth={1.5} style={{ color: "hsl(142 50% 38%)" }} />
        <span className="text-[12px]" style={{ color: "hsl(0 0% 45%)" }}>
          Ships in <strong className="font-medium">3–7 working days</strong> · Free above ₹2,999
        </span>
      </div>

      {/* Payment options, stated with the price rather than buried in the cart.
          COD is the decisive signal for a lot of Indian shoppers, so it leads.
          It is a Shopify manual payment method, enabled 19 Aug 2026; prepaid
          runs through Razorpay. If COD is ever switched off in Shopify, this
          line and the two below have to come down with it — a payment promise
          the checkout cannot honour is worse than saying nothing. */}
      <div className="flex items-center gap-2 mt-1.5">
        <Wallet size={12} strokeWidth={1.5} style={{ color: "hsl(142 50% 38%)" }} />
        <span className="text-[12px]" style={{ color: "hsl(0 0% 45%)" }}>
          <strong className="font-medium">Cash on Delivery</strong> available · UPI, cards &amp; net banking
        </span>
      </div>

      {/* Info line */}
      <p
        className="text-[12px] mt-2 leading-relaxed"
        style={{ color: "hsl(0 0% 50%)" }}
      >
        *Prices are inclusive of GST. Ready-to-ship pieces deliver within 3–7 working days; made-to-measure pieces take 4–8 weeks.
      </p>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2 mt-4 py-3 border-y" style={{ borderColor: "hsl(0 0% 90%)" }}>
        {[
          { icon: Scissors, label: "Handcrafted" },
          { icon: ShieldCheck, label: "Quality Assured" },
          { icon: ReceiptText, label: "Secure Payments" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 text-center">
            <Icon size={16} strokeWidth={1.4} style={{ color: "hsl(186 35% 28%)" }} />
            <span className="text-[10px] uppercase tracking-[0.1em] leading-tight" style={{ color: "hsl(0 0% 30%)" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Pincode / delivery checker */}
      <PincodeChecker />

      {/* Divider */}
      <div className="my-4" style={{ borderTop: "1px solid hsl(0 0% 88%)" }} />

      {/* Size Selector */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span
            className="text-[11px] uppercase tracking-[0.14em] font-medium"
            style={{ color: "hsl(0 0% 25%)" }}
          >
            Size
          </span>
          <button
            className="text-[11px] underline tracking-[0.02em] min-h-[44px] px-2 -mr-2"
            style={{ color: "hsl(186 35% 28%)" }}
            onClick={() => setSizeGuideOpen(true)}
          >
            Size Guide
          </button>
        </div>
        <Select value={selectedSize} onValueChange={setSelectedSize}>
          <SelectTrigger
            className="w-full h-11 text-[13px] font-medium tracking-[0.02em] rounded-none border"
            style={{ borderColor: "hsl(0 0% 80%)", color: "hsl(0 0% 20%)" }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            {sizeOptions.map((size) => {
              const inStock = sizeAvailability[size] ?? true;
              return (
                <SelectItem
                  key={size}
                  value={size}
                  disabled={!inStock}
                  className="text-[13px] rounded-none"
                >
                  {size}
                  {!inStock && (
                    <span className="ml-2 text-[11px]" style={{ color: "hsl(0 0% 55%)" }}>
                      — Sold out
                    </span>
                  )}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Quantity */}
      <div className="mt-4">
        <span
          className="text-[11px] uppercase tracking-[0.14em] font-medium block mb-2.5"
          style={{ color: "hsl(0 0% 25%)" }}
        >
          Quantity
        </span>
        <div
          className="inline-flex items-center border"
          style={{ borderColor: "hsl(0 0% 80%)" }}
        >
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-muted"
          >
            <Minus size={13} style={{ color: "hsl(0 0% 30%)" }} />
          </button>
          <span
            className="w-12 text-center text-[13px] font-medium"
            style={{ color: "hsl(0 0% 20%)" }}
          >
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center transition-colors hover:bg-muted"
          >
            <Plus size={13} style={{ color: "hsl(0 0% 30%)" }} />
          </button>
        </div>
      </div>

      {/* CTA Row */}
      <div id="product-actions" className="flex gap-3 mt-5">
        <button
          onClick={handleAddToCart}
          disabled={!selectedInStock}
          className="press-scale flex-1 h-[48px] text-[11px] font-medium uppercase tracking-[0.14em] border transition-colors duration-200 disabled:cursor-not-allowed"
          style={{
            borderColor: selectedInStock ? "hsl(0 0% 20%)" : "hsl(0 0% 82%)",
            color: selectedInStock ? "hsl(0 0% 20%)" : "hsl(0 0% 55%)",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            if (!selectedInStock) return;
            e.currentTarget.style.backgroundColor = "hsl(0 0% 20%)";
            e.currentTarget.style.color = "hsl(0 0% 100%)";
          }}
          onMouseLeave={(e) => {
            if (!selectedInStock) return;
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "hsl(0 0% 20%)";
          }}
        >
          {!selectedInStock ? (
            "Sold Out"
          ) : added ? (
            <span className="check-pop inline-flex items-center justify-center gap-2">
              <Check size={14} /> Added
            </span>
          ) : (
            "Add to Cart"
          )}
        </button>
        <button
          onClick={
            selectedInStock
              ? handleBuyNow
              : () =>
                  window.open(
                    `https://wa.me/919561557935?text=${encodeURIComponent(
                      `Hi Naira Flore, please let me know when "${title}"${selectedSize ? ` (size ${selectedSize})` : ""} is back in stock.`
                    )}`,
                    "_blank",
                    "noopener,noreferrer"
                  )
          }
          className="press-scale flex-1 h-[48px] text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200"
          style={{
            backgroundColor: selectedInStock ? "hsl(0 0% 12%)" : "hsl(186 35% 28%)",
            color: "hsl(0 0% 100%)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = selectedInStock ? "hsl(0 0% 20%)" : "hsl(186 35% 22%)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedInStock ? "hsl(0 0% 12%)" : "hsl(186 35% 28%)")}
        >
          {/* A sold-out size is otherwise a dead end at peak intent — capture the lead instead. */}
          {selectedInStock ? "Buy It Now" : "Notify Me on WhatsApp"}
        </button>
      </div>

      {/* Warranty & returns reassurance, next to the CTA */}
      <div
        className="grid grid-cols-3 gap-px mt-3"
        style={{ border: "1px solid hsl(0 0% 90%)", backgroundColor: "hsl(0 0% 90%)" }}
      >
        {[
          { icon: RotateCcw, title: "48-hr returns", copy: "On ready-to-ship pieces" },
          { icon: BadgeCheck, title: "2-year assurance", copy: "Stitching & embellishment" },
          { icon: ShieldCheck, title: "Secure payment", copy: "UPI, cards & wallets" },
        ].map(({ icon: Icon, title: label, copy }) => (
          <div key={label} className="flex flex-col items-center gap-1 text-center px-2 py-2.5" style={{ backgroundColor: "hsl(0 0% 100%)" }}>
            <Icon size={14} strokeWidth={1.4} style={{ color: "hsl(186 35% 28%)" }} />
            <span className="text-[10.5px] font-medium leading-tight" style={{ color: "hsl(0 0% 22%)" }}>{label}</span>
            <span className="text-[9.5px] leading-tight" style={{ color: "hsl(0 0% 52%)" }}>{copy}</span>
          </div>
        ))}
      </div>

      {/* Secondary CTA */}
      <button
        onClick={() =>
          window.open(
            `https://wa.me/919561557935?text=${encodeURIComponent("Hi Naira Flore, I'd like to customise a piece from your collection. Could you tell me more?")}`,
            "_blank",
            "noopener,noreferrer"
          )
        }
        className="w-full h-[44px] mt-3 text-[11px] font-medium uppercase tracking-[0.12em] border transition-colors duration-200"
        style={{
          borderColor: "hsl(0 0% 78%)",
          color: "hsl(0 0% 40%)",
          backgroundColor: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "hsl(0 0% 40%)";
          e.currentTarget.style.color = "hsl(0 0% 20%)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "hsl(0 0% 78%)";
          e.currentTarget.style.color = "hsl(0 0% 40%)";
        }}
      >
        Enquire About Customisation
      </button>

      {/* Policy & FAQ links */}
      <div className="flex items-center justify-center gap-4 mt-3">
        <Link
          to="/exchange-return-policy"
          className="font-cormorant text-[12px] tracking-[0.02em] underline underline-offset-4 transition-colors duration-200"
          style={{ color: "hsl(0 0% 45%)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 0% 20%)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(0 0% 45%)")}
        >
          Exchange &amp; Return Policy
        </Link>
        <span className="text-[10px]" style={{ color: "hsl(0 0% 75%)" }}>|</span>
        <Link
          to="/faqs"
          className="font-cormorant text-[12px] tracking-[0.02em] underline underline-offset-4 transition-colors duration-200"
          style={{ color: "hsl(0 0% 45%)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 0% 20%)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(0 0% 45%)")}
        >
          FAQs
        </Link>
      </div>

      {/* Divider */}
      <div className="my-4" style={{ borderTop: "1px solid hsl(0 0% 90%)" }} />

      {/* Details / Price Breakup tabs */}
      <DetailsTabs
        tabs={[
          {
            id: "details",
            label: "Details",
            content: (
              <p className="text-[13px] leading-[1.7]" style={{ color: "hsl(0 0% 40%)" }}>
                {description}
              </p>
            ),
          },
          {
            id: "price",
            label: "Price Breakup",
            content: <PriceBreakup total={numericPrice} currencySymbol={priceMoney?.currencyCode === "INR" ? "₹" : ""} />,
          },
        ]}
      />

      {/* Divider */}
      <div className="my-5" style={{ borderTop: "1px solid hsl(0 0% 90%)" }} />

      {/* Accordions */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="info" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
          <AtelierAccordionTrigger>Product Information</AtelierAccordionTrigger>
          <AccordionContent>
            <p className="text-[13px] leading-[1.7] pb-2" style={{ color: "hsl(0 0% 45%)" }}>
              {description}
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="delivery" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
          <AtelierAccordionTrigger>Delivery Timelines</AtelierAccordionTrigger>
          <AccordionContent>
            <div className="text-[13px] leading-[1.7] pb-2 space-y-1.5" style={{ color: "hsl(0 0% 45%)" }}>
              <p>• All orders from the website are delivered within 3–7 working days.</p>
              <p>• Made-to-measure pieces are delivered in 45–60 days.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="disclaimer" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
          <AtelierAccordionTrigger>Disclaimer</AtelierAccordionTrigger>
          <AccordionContent>
            <div className="text-[13px] leading-[1.7] pb-2 space-y-1.5" style={{ color: "hsl(0 0% 45%)" }}>
              <p>• Dry clean only.</p>
              <p>• Product colour may slightly vary due to photographic lighting sources or your screen settings.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="additional" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
          <AtelierAccordionTrigger>Additional Information</AtelierAccordionTrigger>
          <AccordionContent>
            <div className="text-[13px] leading-[1.7] pb-2 space-y-1.5" style={{ color: "hsl(0 0% 45%)" }}>
              <p>• For queries or assistance, please WhatsApp / WhatsApp Call on: <span className="font-semibold" style={{ color: "hsl(0 0% 20%)" }}>+91 9561557935</span></p>
              <p>• Manufactured and marketed by Naira Flore</p>
              <p>• Address: Flat 7, Veeraj Blossom, Karanyogi Nagar, Nashik – 422002</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Divider */}
      <div className="my-4" style={{ borderTop: "1px solid hsl(0 0% 90%)" }} />

      {/* Help Section */}
      <div className="w-full">
        <span
          className="text-[11px] uppercase tracking-[0.14em] font-medium block mb-3"
          style={{ color: "hsl(0 0% 30%)" }}
        >
          Need Help?
        </span>
        <div className="flex flex-col md:flex-row w-full">
          {[
            { icon: Phone, label: "Call Us", href: "tel:+919561557935" },
            { icon: Mail, label: "Email Us", href: "mailto:shopatnaira@gmail.com" },
            { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/919561557935" },
          ].map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-[12px] tracking-[0.02em] transition-colors duration-200 border border-[hsl(0_0%_90%)] md:border-l-0 md:first:border-l"
              style={{ color: "hsl(0 0% 35%)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(0 0% 96%)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Icon size={15} strokeWidth={1.5} />
              {label}
            </a>
          ))}
        </div>
      </div>

      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
};

export default ProductDetails;
