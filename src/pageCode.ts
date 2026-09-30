import { lazyRoute, type LazyRoute } from "./lib/lazyRoute";
import { routeKeyFor, type RouteKey } from "./lib/routeCode";

/*
  Every route is code-split, the homepage included: main.tsx loads the landing
  route's code before React's first render (see lib/lazyRoute.ts), so a split
  costs that page nothing — and the homepage's hero, lookbook and GSAP no
  longer ride along in the first download of every other page.
*/
export const Index = lazyRoute(() => import("./pages/Index.tsx"));
export const ShopAll = lazyRoute(() => import("./pages/ShopAll.tsx"));
export const ProductDetail = lazyRoute(() => import("./pages/ProductDetail.tsx"));
// Unknown / retired URLs land on a brand "Coming soon" page instead of a raw 404.
export const CatchAll = lazyRoute(() => import("./pages/CatchAll.tsx"));
export const MadeForYou = lazyRoute(() => import("./pages/MadeForYou.tsx"));
export const Jewellery = lazyRoute(() => import("./pages/Jewellery.tsx"));
// The product page (/jewellery/:handle; also at /preview/jewellery/:handle).
export const JewelDetailNext = lazyRoute(() => import("./pages/JewelDetailNext.tsx"));
export const Concepts = lazyRoute(() => import("./pages/Concepts.tsx"));
export const RingLab = lazyRoute(() => import("./pages/RingLab.tsx"));
export const RingExample = lazyRoute(() => import("./pages/RingExample.tsx"));
export const AboutUs = lazyRoute(() => import("./pages/AboutUs.tsx"));
export const ContactUs = lazyRoute(() => import("./pages/ContactUs.tsx"));
export const PrivacyPolicy = lazyRoute(() => import("./pages/PrivacyPolicy.tsx"));
export const TermsOfService = lazyRoute(() => import("./pages/TermsOfService.tsx"));
export const ExchangeReturnPolicy = lazyRoute(() => import("./pages/ExchangeReturnPolicy.tsx"));
export const FAQs = lazyRoute(() => import("./pages/FAQs.tsx"));
export const CartCheckoutRedirect = lazyRoute(() => import("./pages/CartCheckoutRedirect.tsx"));
export const JewelleryCategory = lazyRoute(() => import("./pages/JewelleryCategory.tsx"));
export const Journal = lazyRoute(() => import("./pages/Journal.tsx"));
export const JournalArticle = lazyRoute(() => import("./pages/JournalArticle.tsx"));
export const Gifting = lazyRoute(() => import("./pages/Gifting.tsx"));
export const GoldenHourEdit = lazyRoute(() => import("./pages/GoldenHourEdit.tsx"));
export const TrackOrder = lazyRoute(() => import("./pages/TrackOrder.tsx"));
export const InnerCircle = lazyRoute(() => import("./pages/InnerCircle.tsx"));
export const Auth = lazyRoute(() => import("./pages/Auth.tsx"));
export const Account = lazyRoute(() => import("./pages/Account.tsx"));
export const OAuthConsent = lazyRoute(() => import("./pages/OAuthConsent.tsx"));
export const AdminReels = lazyRoute(() => import("./pages/admin/Reels.tsx"));


const PAGES: Record<RouteKey, LazyRoute> = {
  Index, ShopAll, ProductDetail, MadeForYou, Jewellery, JewelleryCategory, JewelDetailNext,
  Journal, JournalArticle, Gifting, GoldenHourEdit, TrackOrder, InnerCircle, Auth, Account,
  AboutUs, ContactUs, PrivacyPolicy, TermsOfService, ExchangeReturnPolicy, FAQs,
};

/** Loads the code of the page at `pathname`; resolves at once for a URL with no page of its own. */
export const preloadRouteFor = (pathname: string): Promise<void> => {
  const key = routeKeyFor(pathname);
  return key ? PAGES[key].preload() : Promise.resolve();
};
