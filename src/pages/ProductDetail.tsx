import { useState } from "react";
import { Link, useParams, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { absoluteUrl } from "@/lib/absoluteUrl";
import { Helmet } from "react-helmet-async";
import Footer from "@/components/Footer";
import CustomerReviews from "@/components/CustomerReviews";
import JudgeMeReviews, { judgeMeEnabled } from "@/components/JudgeMeReviews";
import MaterialsCraft from "@/components/MaterialsCraft";
import YouMayAlsoLike from "@/components/YouMayAlsoLike";
import CollectionCarousel from "@/components/CollectionCarousel";
import StickyAddToCart from "@/components/StickyAddToCart";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetails from "@/components/product/ProductDetails";
import { AtelierSkeleton } from "@/components/ui/atelier-skeleton";
import { fetchShopifyProductByHandle, formatShopifyPrice } from "@/lib/shopify";
import { isJewelleryProduct } from "@/lib/isJewelleryProduct";
import ComingSoon from "./ComingSoon";

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

  /* Ads and the Shopify catalogue link to /product/<handle>. Jewellery must
     never render inside the apparel template, so send it to its own page. */
  const isJewellery = isJewelleryProduct(product);
  const hasRealSizeOption = Boolean(
    product?.options?.some((option) => option.name.toLowerCase() === "size" && option.values.length > 0)
  );

  const title = product?.title ?? "Product";
  const description = product?.description || "Shop real handcrafted couture by Naira Flore.";
  const price = product?.priceRange.minVariantPrice.amount ?? "0";
  const priceLabel = product ? formatShopifyPrice(product.priceRange.minVariantPrice) : "·";
  const image = product?.images.edges[0]?.node.url ?? "/placeholder.svg";
  const stickyVariant = product?.variants.edges.find((edge) => edge.node.availableForSale)?.node ?? product?.variants.edges[0]?.node;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description,
    brand: { "@type": "Brand", name: "Naira Flore" },
    // Google treats image as required for Product rich results. Without it none
    // of the Shopify-backed pages were eligible, whatever else was correct.
    image: product?.images.edges.map((edge) => edge.node.url) ?? [],
    url: `https://nairaflore.com/product/${id}`,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "INR",
      // Read the real selling state rather than asserting InStock. Hardcoding it
      // kept telling Google a sold-out SKU was buyable.
      availability: product?.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Naira Flore" },
    },
  };

  if (product && isJewellery) {
    return <Navigate to={`/jewellery/${product.handle}`} replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "hsl(0 0% 100%)" }}>
        <Helmet>
          <title>Loading Product | Naira Flore</title>
        </Helmet>
        <span className="sr-only" role="status">Loading product</span>

        {/* Breadcrumb placeholder (desktop) */}
        <div className="max-w-[1400px] mx-auto px-6 pt-[100px] md:pt-[112px] lg:pt-[120px] pb-3 hidden md:block" aria-hidden="true">
          <AtelierSkeleton className="h-3 w-56" />
        </div>

        {/* Mobile gallery placeholder */}
        <div className="md:hidden pt-[94px]" aria-hidden="true">
          <AtelierSkeleton className="w-full" style={{ aspectRatio: "3/4" }} />
          <div className="flex justify-center gap-2 mt-3 mb-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <AtelierSkeleton key={i} className="w-1.5 h-1.5" style={{ borderRadius: "50%" }} />
            ))}
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto md:px-6 pb-16 md:pb-24" aria-hidden="true">
          <div className="flex flex-col lg:grid lg:items-start lg:gap-0" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {/* Desktop gallery placeholder */}
            <div className="hidden md:grid grid-cols-2 gap-[4px]">
              {Array.from({ length: 4 }).map((_, i) => (
                <AtelierSkeleton key={i} className="w-full" style={{ aspectRatio: "3/4" }} />
              ))}
            </div>

            {/* Details placeholder */}
            <div className="mt-6 md:mt-8 lg:mt-0 lg:py-2 px-4 lg:px-8 xl:px-10">
              <AtelierSkeleton className="h-8 w-4/5" />
              <AtelierSkeleton className="mt-4 h-6 w-1/3" />
              <AtelierSkeleton className="mt-3 h-3 w-3/5" />
              <div className="grid grid-cols-3 gap-2 mt-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <AtelierSkeleton key={i} className="h-14" />
                ))}
              </div>
              <AtelierSkeleton className="mt-6 h-11 w-full" />
              <AtelierSkeleton className="mt-4 h-11 w-40" />
              <div className="flex gap-3 mt-6">
                <AtelierSkeleton className="h-[48px] flex-1" />
                <AtelierSkeleton className="h-[48px] flex-1" />
              </div>
              <AtelierSkeleton className="mt-3 h-[44px] w-full" />
              <div className="mt-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <AtelierSkeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <ComingSoon
        eyebrow="This piece has moved"
        heading="Coming soon"
        body="This piece isn't available right now. The rest of the collection is live and shipping in 3–5 working days."
        primaryTo="/shop"
        primaryLabel="Back to shop"
      />
    );
  }


  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(0 0% 100%)" }}>
      <Helmet>
        <title>{`${title} | Naira Flore`}</title>
        <meta name="description" content={`Shop ${title} by Naira Flore, ${description.slice(0, 110)}`} />
        <link rel="canonical" href={`https://nairaflore.com/product/${id}`} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${title} | Naira Flore`} />
        <meta property="og:description" content={`Shop ${title} by Naira Flore, ${description.slice(0, 110)}`} />
        <meta property="og:url" content={`https://nairaflore.com/product/${id}`} />
        <meta property="og:site_name" content="Naira Flore" />
        <meta property="og:image" content={absoluteUrl(image)} />
        <meta property="og:image:alt" content={title} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} | Naira Flore`} />
        <meta name="twitter:description" content={`Shop ${title} by Naira Flore, ${description.slice(0, 110)}`} />
        <meta name="twitter:image" content={absoluteUrl(image)} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://nairaflore.com/" },
              { "@type": "ListItem", position: 2, name: "Shop", item: "https://nairaflore.com/shop" },
              { "@type": "ListItem", position: 3, name: title, item: `https://nairaflore.com/product/${id}` },
            ],
          })}
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
          className="absolute top-[106px] left-4 z-20 w-11 h-11 flex items-center justify-center shadow-md"
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

      {/* Real order-verified reviews once Judge.me is connected; curated
          testimonials until then */}
      {judgeMeEnabled ? (
        <JudgeMeReviews productId={product.id} productTitle={product.title} />
      ) : (
        <CustomerReviews productName={product.title} variant={isJewellery ? "jewellery" : "apparel"} />
      )}
      <MaterialsCraft />
      <YouMayAlsoLike currentHandle={product.handle} />
      <CollectionCarousel />
      
      <Footer />
      <StickyAddToCart
        image={image}
        title={title}
        price={priceLabel}
        selectedSize={hasRealSizeOption ? selectedSize : ""}
        productHandle={product?.handle}
        variantId={stickyVariant?.id}
        numericPrice={stickyVariant ? Number(stickyVariant.price.amount) : Number(price)}
        currencyCode={stickyVariant?.price.currencyCode}
        inStock={stickyVariant?.availableForSale ?? true}
      />
    </div>
  );
};

export default ProductDetail;
