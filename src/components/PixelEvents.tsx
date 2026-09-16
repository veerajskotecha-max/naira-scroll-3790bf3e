import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { setAdMatchIdentity, trackPageView, trackPixel } from "@/lib/pixel";
import { tagClaritySession } from "@/lib/clarity";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Global Meta Pixel wiring:
 * - PageView on every client-side route change (the base pixel only fires once).
 * - Contact on any WhatsApp / phone / email click, anywhere in the app.
 * - CustomizeProduct when that contact happens from the customisation journey.
 * - FindLocation when the shopper opens the studio map link.
 */
const PixelEvents = () => {
  const { pathname, search } = useLocation();
  const { user, profile } = useAuth();

  /* Advanced matching: only for a signed-in member who accepted it. Email and
     phone are hashed in the browser before either goes anywhere, and dropping
     the consent (or signing out) re-initialises the pixel without them. */
  const consented = Boolean(profile?.ad_matching_consent);
  useEffect(() => {
    void setAdMatchIdentity(
      consented ? { email: user?.email, phone: profile?.phone } : null
    );
  }, [consented, user?.email, profile?.phone]);

  /* Clarity session tags. Clarity and Meta never exchange data; these stamp the
     recording with the same ids the Meta events carry, so a session can be
     found from a campaign or click id. Inert until the Clarity snippet loads. */
  useEffect(() => {
    tagClaritySession({ signedIn: Boolean(user) });
  }, [user]);

  // The very first PageView is fired by the inline snippet in index.html.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    trackPageView();
  }, [pathname, search]);


  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href") ?? "";
      if (!href) return;

      if (href.includes("google.com/maps") || href.startsWith("geo:")) {
        trackPixel("FindLocation");
        return;
      }

      const isContact =
        href.includes("wa.me") ||
        href.includes("api.whatsapp.com") ||
        href.startsWith("tel:") ||
        href.startsWith("mailto:");
      if (!isContact) return;

      trackPixel("Contact", { source: window.location.pathname });
      if (/customi[sz]e|made-for-you/.test(window.location.pathname)) {
        trackPixel("CustomizeProduct");
      }
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
};

export default PixelEvents;
