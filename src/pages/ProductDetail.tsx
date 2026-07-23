import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";
import CustomerReviews from "@/components/CustomerReviews";
import MaterialsCraft from "@/components/MaterialsCraft";
import YouMayAlsoLike from "@/components/YouMayAlsoLike";
import StickyAddToCart from "@/components/StickyAddToCart";
import UrgencyNotification from "@/components/UrgencyNotification";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetails from "@/components/product/ProductDetails";
import { fetchShopifyProductByHandle, formatShopifyPrice } from "@/lib/shopify";

const ProductDetail = () => {
  const [selectedSize] = useState("M");
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/shop");
  };

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["shopify-product", id],
    queryFn: () => fetchShopifyProductByHandle(id ?? ""),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const title = product?.title ?? "Product";
  const description = product?.description || "Shop real handcrafted couture by Naira Flore.";
  const price = product?.priceRange.minVariantPrice.amount ?? "0";
  const priceLabel = product ? formatShopifyPrice(product.priceRange.minVariantPrice) : "—";
  const image = product?.images.edges[0]?.node.url ?? "/placeholder.svg";
  const stickyVariant = product?.variants.edges.find((edge) => edge.node.availableForSale)?.node ?? product?.variants.edges[0]?.node;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description,
    brand: { "@type": "Brand", name: "Naira Flore" },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Naira Flore" },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-[100px] flex items-center justify-center" style={{ backgroundColor: "hsl(0 0% 100%)" }}>
        <Helmet>
          <title>Loading Product | Naira Flore</title>
        </Helmet>
        <p className="font-cormorant text-[22px]" style={{ color: "hsl(0 0% 30%)" }}>Loading product…</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen pt-[100px] flex items-center justify-center px-6" style={{ backgroundColor: "hsl(0 0% 100%)" }}>
        <Helmet>
          <title>Product Not Found | Naira Flore</title>
          <meta name="description" content="This Shopify product could not be found." />
        </Helmet>
        <div className="text-center max-w-[520px]">
          <h1 className="font-cormorant text-[34px] md:text-[42px] font-semibold" style={{ color: "hsl(0 0% 15%)" }}>Product not found</h1>
          <p className="font-cormorant text-[16px] mt-3" style={{ color: "hsl(0 0% 45%)" }}>This product is not available from Shopify right now.</p>
          <Link to="/shop" className="inline-flex mt-6 px-8 py-3 text-[12px] uppercase tracking-[0.12em]" style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}>Back to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(0 0% 100%)" }}>
      <Helmet>
        <title>{title} | Naira Flore</title>
        <meta name="description" content={`Shop ${title} by Naira Flore — ${description.slice(0, 110)}`} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      {/* Breadcrumb - desktop only */}
      <div className="max-w-[1400px] mx-auto px-6 pt-[100px] md:pt-[112px] lg:pt-[120px] pb-3 hidden md:flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-[11px] tracking-[0.04em]" style={{ color: "hsl(0 0% 55%)" }}>
          <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/shop" className="transition-colors hover:text-foreground">Shop</Link>
          <span>/</span>
          <span style={{ color: "hsl(0 0% 30%)" }}>{title}</span>
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
        <ProductGallery product={product} />
      </div>

      {/* Main Product Section */}
      <div className="max-w-[1400px] mx-auto md:px-6 pb-16 md:pb-24">
        <div className="flex flex-col lg:grid lg:items-start lg:gap-0" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Desktop gallery */}
          <div className="hidden md:block">
            <ProductGallery product={product} />
          </div>


          {/* Details */}
          <div className="mt-5 md:mt-0 lg:py-2">
            <ProductDetails product={product} />
          </div>
        </div>
      </div>

      <CustomerReviews productName={product.title} />
      <MaterialsCraft />
      <YouMayAlsoLike currentHandle={product.handle} />
      
      <Footer />
      <StickyAddToCart
        image={image}
        title={title}
        price={priceLabel}
        selectedSize={selectedSize}
        productHandle={product?.handle}
        variantId={stickyVariant?.id}
        numericPrice={stickyVariant ? Number(stickyVariant.price.amount) : Number(price)}
        currencyCode={stickyVariant?.price.currencyCode}
      />
      <UrgencyNotification />
    </div>
  );
};

export default ProductDetail;
