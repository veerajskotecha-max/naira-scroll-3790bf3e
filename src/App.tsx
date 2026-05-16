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
import ShopAll from "./pages/ShopAll.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import MadeForYou from "./pages/MadeForYou.tsx";
import AboutUs from "./pages/AboutUs.tsx";
import ContactUs from "./pages/ContactUs.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import TermsOfService from "./pages/TermsOfService.tsx";
import ExchangeReturnPolicy from "./pages/ExchangeReturnPolicy.tsx";
import FAQs from "./pages/FAQs.tsx";
import CartCheckoutRedirect from "./pages/CartCheckoutRedirect.tsx";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const AppShell = () => {
  useCartSync();

  return (
    <>
      <ScrollToTop />
      <Header />
      <CartDrawer />
      <WishlistDrawer />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/index" element={<Index />} />
        <Route path="/shop" element={<ShopAll />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/customize" element={<MadeForYou />} />
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
