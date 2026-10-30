import { lazy, Suspense, useLayoutEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useCartSync } from "./hooks/useCartSync";
import Header from "./components/Header";
import WishlistDrawer from "./components/WishlistDrawer";
import ScrollToTop from "./components/ScrollToTop";
import PixelEvents from "./components/PixelEvents";
import ShopperPerformance from "./components/ShopperPerformance";
// A route whose code fails to arrive is thrown while rendering; without this the
// whole tree unmounts and the shopper sits on a blank page. See the component.
import ChunkErrorBoundary from "./components/ChunkErrorBoundary";
import { clearFallbackMark } from "./lib/fallbackGuard";
// Global "wow" animation layer — always mounted, so imported eagerly to avoid
// a flash on first paint (film grain, page curtain, scroll bloom).
import FilmGrain from "./components/wow/FilmGrain";
import ScrollBloom from "./components/wow/ScrollBloom";
import PageCurtain from "./components/wow/PageCurtain";
import {
  Index,
  ProductDetail,
  CatchAll,
  MadeForYou,
  Jewellery,
  JewelDetailNext,
  Concepts,
  RingLab,
  RingExample,
  ContactUs,
  PrivacyPolicy,
  TermsOfService,
  ExchangeReturnPolicy,
  FAQs,
  CartCheckoutRedirect,
  JewelleryCategory,
  Journal,
  JournalArticle,
  Gifting,
  GoldenHourEdit,
  TrackOrder,
  InnerCircle,
  Auth,
  Account,
  OAuthConsent,
  AdminReels,
} from "./pageCode";


const queryClient = new QueryClient();

/**
 * Redirect that keeps the query string. Ad clicks land on legacy Shopify-shaped
 * URLs carrying ?fbclid= and utm_*; a plain <Navigate to="/path"> drops them,
 * so the pixel never sees the click id on the page that reports the visit.
 */
const KeepQuery = ({ to }: { to: string }) => {
  const { search } = useLocation();
  return <Navigate to={{ pathname: to, search }} replace />;
};

/* Each piece, collection and product opens as a fresh page. Going from one to
   the next through a link reuses the route's component, so it kept the last
   page's state: the next piece opened on image 3 when the shopper had been on
   image 3, with the last piece's panels open and its rails scrolled. */
const PieceRoute = () => {
  const { handle } = useParams();
  return <JewelDetailNext key={handle} />;
};
const CollectionRoute = () => {
  const { slug } = useParams();
  return <JewelleryCategory key={slug} />;
};
const ProductRoute = () => {
  const { id } = useParams();
  return <ProductDetail key={id} />;
};

/* The bag (the Naira box hovering under the pieces), on every page. Its code
   arrives after the page's own, so it never slows a landing. */
const CartDrawerNext = lazy(() => import("./components/CartDrawerNext"));
const PerformanceDashboard = lazy(() => import("./pages/admin/Performance"));
const Bag = () => (
  <Suspense fallback={null}>
    <CartDrawerNext />
  </Suspense>
);

const AppShell = () => {
  useCartSync();
  /* The app's first render replaced whatever the host sent: if that was the
     homepage standing in for a page it had no file for, it was hidden, and
     the page is on screen now (lib/fallbackGuard.ts). */
  useLayoutEffect(clearFallbackMark, []);

  return (
    <>
      <ScrollToTop />
      <PixelEvents />
      <ShopperPerformance />
      <PageCurtain />
      <FilmGrain />
      <ScrollBloom />
      
      <Header />
      <Bag />
      <WishlistDrawer />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/index" element={<Index />} />
          {/* The old general shop landing was an apparel Festive Edit. Keep the
              URL safe for saved links, but make every general shop visit open
              the main jewellery collection instead. */}
          <Route path="/shop" element={<KeepQuery to="/jewellery" />} />
          <Route path="/shop/jewellery" element={<KeepQuery to="/jewellery" />} />
          <Route path="/shop/indo-western" element={<KeepQuery to="/customize" />} />
          <Route path="/product/:id" element={<ProductRoute />} />
          {/* Meta and Google product feeds emit Shopify's canonical
              /products/<handle> URLs. ProductDetail resolves its :id param by
              handle, so alias the feed path onto it — without this every
              catalogue ad click falls through to the "*" Coming Soon route. */}
          <Route path="/products/:id" element={<ProductRoute />} />
          {/* The bare prefixes rendered Coming Soon. */}
          <Route path="/products" element={<KeepQuery to="/jewellery" />} />
          <Route path="/product" element={<KeepQuery to="/jewellery" />} />
          <Route path="/customize" element={<MadeForYou />} />
          <Route path="/jewellery" element={<Jewellery />} />
          <Route path="/jewellery/collections/:slug" element={<CollectionRoute />} />
          <Route path="/jewellery/:handle" element={<PieceRoute />} />
          <Route path="/preview/jewellery/:handle" element={<PieceRoute />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:slug" element={<JournalArticle />} />
          <Route path="/gifting" element={<Gifting />} />
          {/* Private, ads-only edit: unlinked in navigation and noindex. */}
          <Route path="/the-golden-hour" element={<GoldenHourEdit />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/innercircle" element={<InnerCircle />} />
          <Route path="/inner-circle" element={<InnerCircle />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin/reels" element={<AdminReels />} />
          <Route path="/admin/performance" element={<PerformanceDashboard />} />
          <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />

          <Route path="/concepts" element={<Concepts />} />

          <Route path="/ring-lab" element={<RingLab />} />
          <Route path="/ring/:variant" element={<RingExample />} />
          {/* The About page is gone (owner, 25 Oct 2026): the site is about the
              jewellery and the custom outfits. Old links land on the homepage. */}
          <Route path="/about" element={<KeepQuery to="/" />} />
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
          <Route path="/collections" element={<KeepQuery to="/jewellery" />} />
          <Route path="/collections/all" element={<KeepQuery to="/jewellery" />} />
          {/* Shopify's outfit collections (vendor Naira Flore): they opened the
              jewellery grid. */}
          <Route path="/collections/dusk" element={<KeepQuery to="/customize" />} />
          <Route path="/collections/frontpage" element={<KeepQuery to="/customize" />} />
          <Route path="/collections/:slug" element={<CollectionRoute />} />
          {/* A Shopify theme opens a piece from a collection at this address, so
              old shares carry it; it showed Coming Soon even for pieces in stock. */}
          <Route path="/collections/:slug/products/:id" element={<ProductRoute />} />
          <Route path="/blogs" element={<KeepQuery to="/journal" />} />
          <Route path="/blogs/:blog" element={<KeepQuery to="/journal" />} />
          <Route path="/blogs/:blog/:slug" element={<JournalArticle />} />
          <Route path="/jewelry" element={<KeepQuery to="/jewellery" />} />
          <Route path="/jewelry/:handle" element={<PieceRoute />} />
          {/* Every page the Shopify store publishes (Admin, 30 Oct 2026), then a
              theme's usual handles. Only contact and faqs used to land. */}
          <Route path="/pages/contact" element={<KeepQuery to="/contact" />} />
          <Route path="/pages/about-naira" element={<KeepQuery to="/" />} />
          <Route path="/pages/made-for-you" element={<KeepQuery to="/customize" />} />
          <Route path="/pages/custom" element={<KeepQuery to="/customize" />} />
          <Route path="/pages/privacy-policy" element={<KeepQuery to="/privacy" />} />
          <Route path="/pages/terms" element={<KeepQuery to="/terms" />} />
          <Route path="/pages/faqs" element={<KeepQuery to="/faqs" />} />
          <Route path="/pages/exchange-return-policy" element={<KeepQuery to="/exchange-return-policy" />} />
          <Route path="/pages/concepts" element={<KeepQuery to="/concepts" />} />
          <Route path="/pages/gifting" element={<KeepQuery to="/gifting" />} />
          <Route path="/pages/shop" element={<KeepQuery to="/jewellery" />} />
          <Route path="/pages/about" element={<KeepQuery to="/" />} />
          <Route path="/pages/about-us" element={<KeepQuery to="/" />} />
          <Route path="/pages/contact-us" element={<KeepQuery to="/contact" />} />
          <Route path="/pages/faq" element={<KeepQuery to="/faqs" />} />
          <Route path="/pages/size-guide" element={<KeepQuery to="/journal/ring-size-guide-india" />} />
          <Route path="/pages/track-order" element={<KeepQuery to="/track-order" />} />
          <Route path="/apps/track" element={<KeepQuery to="/track-order" />} />
          <Route path="/policies/privacy-policy" element={<KeepQuery to="/privacy" />} />
          <Route path="/policies/terms-of-service" element={<KeepQuery to="/terms" />} />
          <Route path="/policies/refund-policy" element={<KeepQuery to="/exchange-return-policy" />} />
          <Route path="/policies/shipping-policy" element={<KeepQuery to="/faqs" />} />
          <Route path="/policies/contact-information" element={<KeepQuery to="/contact" />} />
          <Route path="/policies/legal-notice" element={<KeepQuery to="/terms" />} />
          {/* Shopify's own cart, search and customer-account addresses: its
              checkout links back to /cart, and classic account emails to
              /account/login. There is no address that opens the bag, so the
              cart lands on the collection. */}
          <Route path="/cart" element={<KeepQuery to="/jewellery" />} />
          <Route path="/cart/add" element={<KeepQuery to="/jewellery" />} />
          <Route path="/checkout" element={<KeepQuery to="/jewellery" />} />
          <Route path="/search" element={<KeepQuery to="/jewellery" />} />
          <Route path="/account/*" element={<KeepQuery to="/auth" />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<CatchAll />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      {/* No TooltipProvider: nothing uses a tooltip, and the provider alone
          put Radix Tooltip and Floating UI — about 25 KB gzipped — into the
          first download of every page. Add it back with the first tooltip. */}
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ChunkErrorBoundary>
                <AppShell />
              </ChunkErrorBoundary>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
