import { useState } from "react";
import { Minus, Plus, Phone, Mail, MessageCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import product1 from "@/assets/product-1.jpg";

const sizes = ["XS", "S", "M", "L", "XL"];

const ProductDetails = () => {
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const { addItem, setDrawerOpen } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: "midnight-silk-drape-saree",
      name: "Midnight Silk Drape Saree",
      price: 18500,
      priceLabel: "₹18,500",
      image: product1,
      size: selectedSize,
    }, quantity);
    toast("Added to cart", {
      description: `${quantity}× Midnight Silk Drape Saree (${selectedSize})`,
      action: { label: "View Cart", onClick: () => setDrawerOpen(true) },
    });
  };

  const handleBuyNow = () => {
    addItem({
      id: "midnight-silk-drape-saree",
      name: "Midnight Silk Drape Saree",
      price: 18500,
      priceLabel: "₹18,500",
      image: product1,
      size: selectedSize,
    }, quantity);
    setDrawerOpen(true);
  };

  return (
    <div className="lg:w-[42%] flex flex-col px-4 lg:px-0 lg:pl-10 xl:pl-14">
      {/* Title */}
      <h1
        className="font-cormorant text-[26px] md:text-[32px] lg:text-[36px] font-semibold leading-[1.15] tracking-[-0.01em]"
        style={{ color: "hsl(0 0% 12%)" }}
      >
        Midnight Silk Drape Saree
      </h1>

      {/* Price + Tax */}
      <div className="mt-4 md:mt-5">
        <span
          className="font-cormorant text-[22px] md:text-[24px] font-bold"
          style={{ color: "hsl(0 0% 15%)" }}
        >
          ₹18,500
        </span>
        <span
          className="ml-2 text-[11px] tracking-[0.04em]"
          style={{ color: "hsl(0 0% 55%)" }}
        >
          Taxes included
        </span>
      </div>

      {/* Info line */}
      <p
        className="text-[12px] mt-3 leading-relaxed"
        style={{ color: "hsl(0 0% 50%)" }}
      >
        *Prices are inclusive of GST. Handcrafted to order — allow 15–20 business days for delivery.
      </p>

      {/* Divider */}
      <div className="my-5 md:my-6" style={{ borderTop: "1px solid hsl(0 0% 88%)" }} />

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
            className="text-[11px] underline tracking-[0.02em]"
            style={{ color: "hsl(0 0% 40%)" }}
          >
            Size Chart
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
            {sizes.map((size) => (
              <SelectItem key={size} value={size} className="text-[13px] rounded-none">
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quantity */}
      <div className="mt-5">
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
      <div id="product-actions" className="flex gap-3 mt-6">
        <button
          onClick={handleAddToCart}
          className="flex-1 h-[48px] text-[11px] font-medium uppercase tracking-[0.14em] border transition-colors duration-200"
          style={{
            borderColor: "hsl(0 0% 20%)",
            color: "hsl(0 0% 20%)",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "hsl(0 0% 20%)";
            e.currentTarget.style.color = "hsl(0 0% 100%)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "hsl(0 0% 20%)";
          }}
        >
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 h-[48px] text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-200"
          style={{
            backgroundColor: "hsl(0 0% 12%)",
            color: "hsl(0 0% 100%)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(0 0% 20%)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(0 0% 12%)")}
        >
          Buy It Now
        </button>
      </div>

      {/* Secondary CTA */}
      <button
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
        Inquire About Customization
      </button>

      {/* Divider */}
      <div className="my-6 md:my-7" style={{ borderTop: "1px solid hsl(0 0% 90%)" }} />

      {/* Accordions */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="info" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
          <AccordionTrigger
            className="py-4 text-[12px] uppercase tracking-[0.12em] font-medium hover:no-underline"
            style={{ color: "hsl(0 0% 20%)" }}
          >
            Product Information
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-[13px] leading-[1.7] pb-2" style={{ color: "hsl(0 0% 45%)" }}>
              The Midnight Silk Drape Saree is a contemporary masterpiece that reimagines the traditional saree for the modern woman.
              Featuring pre-draped pleats and a structured bodice, this piece offers effortless elegance without the complexity of traditional draping.
              Crafted from premium midnight blue silk with delicate hand-embroidered details along the pallu.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="delivery" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
          <AccordionTrigger
            className="py-4 text-[12px] uppercase tracking-[0.12em] font-medium hover:no-underline"
            style={{ color: "hsl(0 0% 20%)" }}
          >
            Delivery Timelines
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-[13px] leading-[1.7] pb-2" style={{ color: "hsl(0 0% 45%)" }}>
              Standard delivery within 15–20 business days. Express delivery available for select pincodes at ₹500.
              International shipping available — please contact us for timelines.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="disclaimer" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
          <AccordionTrigger
            className="py-4 text-[12px] uppercase tracking-[0.12em] font-medium hover:no-underline"
            style={{ color: "hsl(0 0% 20%)" }}
          >
            Disclaimer
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-[13px] leading-[1.7] pb-2" style={{ color: "hsl(0 0% 45%)" }}>
              As each piece is handcrafted, slight variations in colour, embroidery, and texture are natural and add to the uniqueness of the garment.
              Product images are representative; actual colours may vary slightly due to screen settings.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="additional" className="border-b" style={{ borderColor: "hsl(0 0% 90%)" }}>
          <AccordionTrigger
            className="py-4 text-[12px] uppercase tracking-[0.12em] font-medium hover:no-underline"
            style={{ color: "hsl(0 0% 20%)" }}
          >
            Additional Information
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-[13px] leading-[1.7] pb-2 space-y-1" style={{ color: "hsl(0 0% 45%)" }}>
              <p>Fabric: 100% Pure Silk</p>
              <p>Care: Dry clean only</p>
              <p>Storage: Cool, dry place away from direct sunlight</p>
              <p>Ironing: Use a muslin cloth while pressing</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Divider */}
      <div className="my-5" style={{ borderTop: "1px solid hsl(0 0% 90%)" }} />

      {/* Help Section */}
      <div>
        <span
          className="text-[11px] uppercase tracking-[0.14em] font-medium block mb-4"
          style={{ color: "hsl(0 0% 30%)" }}
        >
          Need Help?
        </span>
        <div className="flex gap-6">
          {[
            { icon: Phone, label: "Call Us" },
            { icon: Mail, label: "Email Us" },
            { icon: MessageCircle, label: "WhatsApp" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-2 text-[12px] tracking-[0.02em] transition-colors hover:opacity-70"
              style={{ color: "hsl(0 0% 35%)" }}
            >
              <Icon size={15} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
