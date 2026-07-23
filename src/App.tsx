import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { useCartSync } from "./hooks/useCartSync";
import Header from "./components/Header";
import CartDrawer from "./components/CartDrawer";
import WishlistDrawer from "./components/WishlistDrawer";
import Index from "./pages/Index.tsx";
import ScrollToTop from "./components/ScrollToTop";
// Global "wow" animation layer — always mounted, so imported eagerly to avoid
// a flash on first paint (cursor, film grain, page curtain, scroll bloom).
import FeatherCursor from "./components/wow/FeatherCursor";
import FilmGrain from "./components/wow/FilmGrain";
import ScrollBloom from "./components/wow/ScrollBloom";
import PageCurtain from "./components/wow/PageCurtain";

// Non-home routes are code-split so the homepage bundle stays small.
const ShopAll = lazy(() => import("./pages/ShopAll.tsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
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

const queryClient = new QueryClient();

const AppShell = () => {
  useCartSync();

  return (
    <>
      <ScrollToTop />
      <PageCurtain />
      <FilmGrain />
      <ScrollBloom />
      <FeatherCursor />
      <Header />
      <CartDrawer />
      <WishlistDrawer />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/index" element={<Index />} />
          <Route path="/shop" element={<ShopAll />} />
          <Route path="/shop/jewellery" element={<ShopAll />} />
          <Route path="/shop/indo-western" element={<ShopAll />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/customize" element={<MadeForYou />} />
          <Route path="/jewellery" element={<Jewellery />} />
          <Route path="/jewellery/:handle" element={<JewelDetail />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppShell />
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
