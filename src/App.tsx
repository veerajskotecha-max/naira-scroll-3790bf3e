import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useCartSync } from "./hooks/useCartSync";
import Header from "./components/Header";
import CartDrawer from "./components/CartDrawer";
import WishlistDrawer from "./components/WishlistDrawer";
import Index from "./pages/Index.tsx";
import ScrollToTop from "./components/ScrollToTop";
import PixelEvents from "./components/PixelEvents";
// Global "wow" animation layer — always mounted, so imported eagerly to avoid
// a flash on first paint (cursor, film grain, page curtain, scroll bloom).
import FeatherCursor from "./components/wow/FeatherCursor";
import FilmGrain from "./components/wow/FilmGrain";
import ScrollBloom from "./components/wow/ScrollBloom";
import PageCurtain from "./components/wow/PageCurtain";
import WelcomeOfferPopup from "./components/WelcomeOfferPopup";

// Non-home routes are code-split so the homepage bundle stays small.
const ShopAll = lazy(() => import("./pages/ShopAll.tsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.tsx"));
// Unknown / retired URLs land on a brand "Coming soon" page instead of a raw 404.
const ComingSoon = lazy(() => import("./pages/ComingSoon.tsx"));
const MadeForYou = lazy(() => import("./pages/MadeForYou.tsx"));
const Jewellery = lazy(() => import("./pages/Jewellery.tsx"));
const JewelDetail = lazy(() => import("./pages/JewelDetail.tsx"));
const Concepts = lazy(() => import("./pages/Concepts.tsx"));
const RingLab = lazy(() => import("./pages/RingLab.tsx"));
const RingExample = lazy(() => import("./pages/RingExample.tsx"));
const AboutUs = lazy(() => import("./pages/AboutUs.tsx"));
const ContactUs = lazy(() => import("./pages/ContactUs.tsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.tsx"));
const ExchangeReturnPolicy = lazy(() => import("./pages/ExchangeReturnPolicy.tsx"));
const FAQs = lazy(() => import("./pages/FAQs.tsx"));
const CartCheckoutRedirect = lazy(() => import("./pages/CartCheckoutRedirect.tsx"));
const JewelleryCategory = lazy(() => import("./pages/JewelleryCategory.tsx"));
const Journal = lazy(() => import("./pages/Journal.tsx"));
const JournalArticle = lazy(() => import("./pages/JournalArticle.tsx"));
const Gifting = lazy(() => import("./pages/Gifting.tsx"));
const TrackOrder = lazy(() => import("./pages/TrackOrder.tsx"));
const InnerCircle = lazy(() => import("./pages/InnerCircle.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const Account = lazy(() => import("./pages/Account.tsx"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent.tsx"));


const queryClient = new QueryClient();

const AppShell = () => {
  useCartSync();

  return (
    <>
      <ScrollToTop />
      <PixelEvents />
      <PageCurtain />
      <FilmGrain />
      <ScrollBloom />
      <FeatherCursor />
      <Header />
      <CartDrawer />
      <WishlistDrawer />
      <WelcomeOfferPopup />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/index" element={<Index />} />
          <Route path="/shop" element={<ShopAll />} />
          <Route path="/shop/jewellery" element={<ShopAll />} />
          <Route path="/shop/indo-western" element={<ShopAll />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          {/* Meta and Google product feeds emit Shopify's canonical
              /products/<handle> URLs. ProductDetail resolves its :id param by
              handle, so alias the feed path onto it — without this every
              catalogue ad click falls through to the "*" Coming Soon route. */}
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/customize" element={<MadeForYou />} />
          <Route path="/jewellery" element={<Jewellery />} />
          <Route path="/jewellery/collections/:slug" element={<JewelleryCategory />} />
          <Route path="/jewellery/:handle" element={<JewelDetail />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:slug" element={<JournalArticle />} />
          <Route path="/gifting" element={<Gifting />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/innercircle" element={<InnerCircle />} />
          <Route path="/inner-circle" element={<InnerCircle />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/account" element={<Account />} />
          <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />

          <Route path="/concepts" element={<Concepts />} />

          <Route path="/ring-lab" element={<RingLab />} />
          <Route path="/ring/:variant" element={<RingExample />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/exchange-return-policy" element={<ExchangeReturnPolicy />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/cart/c/:token" element={<CartCheckoutRedirect />} />
          <Route path="/cart/c/:token/*" element={<CartCheckoutRedirect />} />
          <Route path="/checkouts/cn/:token" element={<CartCheckoutRedirect />} />
          <Route path="/checkouts/cn/:token/*" element={<CartCheckoutRedirect />} />
          {/* Legacy / Shopify-shaped URLs (ads, old links, storefront exports)
              map onto the real pages instead of dead-ending. */}
          <Route path="/collections" element={<Navigate to="/jewellery" replace />} />
          <Route path="/collections/all" element={<Navigate to="/shop" replace />} />
          <Route path="/collections/:slug" element={<JewelleryCategory />} />
          <Route path="/blogs" element={<Navigate to="/journal" replace />} />
          <Route path="/blogs/:blog" element={<Navigate to="/journal" replace />} />
          <Route path="/blogs/:blog/:slug" element={<JournalArticle />} />
          <Route path="/jewelry" element={<Navigate to="/jewellery" replace />} />
          <Route path="/jewelry/:handle" element={<JewelDetail />} />
          <Route path="/pages/about" element={<Navigate to="/about" replace />} />
          <Route path="/pages/contact" element={<Navigate to="/contact" replace />} />
          <Route path="/pages/faqs" element={<Navigate to="/faqs" replace />} />
          <Route path="/policies/privacy-policy" element={<Navigate to="/privacy" replace />} />
          <Route path="/policies/terms-of-service" element={<Navigate to="/terms" replace />} />
          <Route path="/policies/refund-policy" element={<Navigate to="/exchange-return-policy" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<ComingSoon />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppShell />
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
