import { matchPath } from "react-router-dom";

/*
  Which page's code a URL needs, so main.tsx can load it before React's first
  render (see lazyRoute). Mirrors the <Routes> in App.tsx; a URL missing here
  still works, it just renders the way every page used to — Suspense fallback
  first, page a moment later. Checked in order; matching is exact.
*/
export const ROUTE_CODE = [
  ["/", "Index"],
  ["/index", "Index"],
  ["/shop/indo-western", "ShopAll"],
  ["/product/:id", "ProductDetail"],
  ["/products/:id", "ProductDetail"],
  ["/customize", "MadeForYou"],
  ["/jewellery", "Jewellery"],
  ["/jewellery/collections/:slug", "JewelleryCategory"],
  ["/jewellery/:handle", "JewelDetailNext"],
  ["/jewelry/:handle", "JewelDetailNext"],
  ["/preview/jewellery/:handle", "JewelDetailNext"],
  ["/collections/:slug", "JewelleryCategory"],
  ["/journal", "Journal"],
  ["/journal/:slug", "JournalArticle"],
  ["/blogs/:blog/:slug", "JournalArticle"],
  ["/gifting", "Gifting"],
  ["/the-golden-hour", "GoldenHourEdit"],
  ["/track-order", "TrackOrder"],
  ["/innercircle", "InnerCircle"],
  ["/inner-circle", "InnerCircle"],
  ["/auth", "Auth"],
  ["/account", "Account"],
  ["/about", "AboutUs"],
  ["/contact", "ContactUs"],
  ["/privacy", "PrivacyPolicy"],
  ["/terms", "TermsOfService"],
  ["/exchange-return-policy", "ExchangeReturnPolicy"],
  ["/faqs", "FAQs"],
] as const;

export type RouteKey = (typeof ROUTE_CODE)[number][1];

export const routeKeyFor = (pathname: string): RouteKey | null =>
  ROUTE_CODE.find(([pattern]) => matchPath(pattern, pathname))?.[1] ?? null;
