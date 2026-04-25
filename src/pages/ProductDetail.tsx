import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";
import CustomerReviews from "@/components/CustomerReviews";
import MaterialsCraft from "@/components/MaterialsCraft";
import YouMayAlsoLike from "@/components/YouMayAlsoLike";
import StickyAddToCart from "@/components/StickyAddToCart";
import UrgencyNotification from "@/components/UrgencyNotification";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetails from "@/components/product/ProductDetails";
import product1 from "@/assets/product-1.jpg";

const ProductDetail = () => {
  const [selectedSize] = useState("M");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Midnight Silk Drape Saree",
    description: "A contemporary pre-draped silk saree with hand-embroidered pallu. Premium indo-western fusion wear by Naira Flore.",
    brand: { "@type": "Brand", name: "Naira Flore" },
    offers: {
      "@type": "Offer",
      price: "18500",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Naira Flore" },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "24",
    },
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(0 0% 100%)" }}>
      <Helmet>
        <title>Midnight Silk Drape Saree | Naira Flore</title>
        <meta name="description" content="Shop the Midnight Silk Drape Saree by Naira Flore — a pre-draped contemporary saree with hand-embroidered pallu. Premium Indo-Western fusion wear. Free shipping above ₹2,999." />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      {/* Breadcrumb - desktop only */}
      <div className="max-w-[1400px] mx-auto px-6 pt-[100px] md:pt-[112px] lg:pt-[120px] pb-3 hidden md:block">
        <nav className="flex items-center gap-2 text-[11px] tracking-[0.04em]" style={{ color: "hsl(0 0% 55%)" }}>
          <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/shop" className="transition-colors hover:text-foreground">Shop</Link>
          <span>/</span>
          <span style={{ color: "hsl(0 0% 30%)" }}>Midnight Silk Drape Saree</span>
        </nav>
      </div>

      {/* Mobile gallery */}
      <div className="md:hidden pt-[94px]">
        <ProductGallery />
      </div>

      {/* Main Product Section */}
      <div className="max-w-[1400px] mx-auto md:px-6 pb-16 md:pb-24">
        <div className="flex flex-col lg:grid lg:items-start lg:gap-0" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Desktop gallery */}
          <div className="hidden md:block">
            <ProductGallery />
          </div>

          {/* Details */}
          <div className="mt-5 md:mt-0 lg:py-2">
            <ProductDetails />
          </div>
        </div>
      </div>

      <CustomerReviews />
      <MaterialsCraft />
      <YouMayAlsoLike />
      
      <Footer />
      <StickyAddToCart
        image={product1}
        title="Midnight Silk Drape Saree"
        price="₹18,500"
        selectedSize={selectedSize}
      />
      <UrgencyNotification />
    </div>
  );
};

export default ProductDetail;
