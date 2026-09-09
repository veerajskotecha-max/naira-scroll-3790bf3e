import { useEffect, useMemo, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { CHECKOUT_DOMAIN } from "@/lib/shopify";
import HeroPetals from "@/components/HeroPetals";

const BRAND = ["#E5B9A4", "#AEBDB6", "#F0D9CF", "#2F5D63", "#E9C8B4"];

/** Simple petal silhouette used only for the centre bloom ring. */
const Petal = ({ color, variant }: { color: string; variant: number }) => {
  const paths = [
    "M50 2 C78 14 92 46 84 78 C76 108 24 108 16 78 C8 46 22 14 50 2 Z",
    "M50 0 C84 10 96 52 70 90 C52 112 30 98 26 66 C22 32 28 8 50 0 Z",
    "M50 4 C70 0 94 22 90 54 C86 88 60 104 38 92 C14 78 12 44 30 22 C38 12 44 7 50 4 Z",
    "M50 2 C62 18 66 44 58 74 C52 96 40 100 30 84 C16 62 22 24 50 2 Z",
  ];
  return (
    <svg viewBox="0 0 100 110" className="w-full h-full">
      <path d={paths[variant % paths.length]} fill={color} />
      <path
        d="M50 8 C50 34 50 60 48 92"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * Safety net for Shopify checkout links that land on our own domain.
 * Catches /cart/c/<token> and /checkouts/cn/<token> and forwards the shopper
 * to the branded checkout domain, keeping every query param intact — while
 * showing a branded floral transition.
 */
const CartCheckoutRedirect = () => {
  const { token } = useParams<{ token: string }>();
  const { search, pathname } = useLocation();
  const progressRef = useRef(0);
  const vh = useMemo(() => window.innerHeight, []);

  useEffect(() => {
    const fallbackToken = pathname.split("/").filter(Boolean).pop();
    const checkoutToken = token || fallbackToken;
    if (!checkoutToken) {
      window.location.replace("/");
      return;
    }
    const params = new URLSearchParams(search);
    params.set("channel", "online_store");
    const target = `https://${CHECKOUT_DOMAIN}/checkouts/cn/${checkoutToken}?${params.toString()}`;
    const t = window.setTimeout(() => window.location.replace(target), 900);
    return () => window.clearTimeout(t);
  }, [token, search, pathname]);

  // Drive the homepage petal layer with a simulated scroll progress so the
  // petals fall continuously while the redirect overlay is visible.
  useEffect(() => {
    let raf = 0;
    let start = performance.now();
    const duration = 6000; // one full fall cycle
    const tick = (now: number) => {
      progressRef.current = Math.min(1, (now - start) / duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "#F4F1ED" }}
    >
      <style>{`
        @keyframes naira-bloom {
          0% { transform: scale(0.4) rotate(-8deg); opacity: 0; }
          60% { transform: scale(1.06) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes naira-word {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes naira-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes naira-ring-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Primary homepage hero floral overlay — falls as the shopper scrolls on the home page */}
      <HeroPetals progressRef={progressRef} vh={vh} />

      {/* Center bloom */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div
          className="relative flex items-center justify-center"
          style={{ width: 120, height: 120, animation: "naira-bloom 0.8s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          {/* spinning petal ring */}
          <div
            className="absolute inset-0"
            style={{ animation: "naira-ring-spin 9s linear infinite" }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2"
                style={{
                  width: 26,
                  height: 30,
                  transform: `translate(-50%,-50%) rotate(${i * 45}deg) translateY(-46px)`,
                  opacity: 0.9,
                }}
              >
                <Petal color={BRAND[i % BRAND.length]} variant={i % 4} />
              </div>
            ))}
          </div>
          <span
            className="font-cormorant relative z-10"
            style={{ fontSize: 44, color: "#2F5D63", lineHeight: 1 }}
          >
            N
          </span>
        </div>

        <h1
          className="font-cormorant mt-6"
          style={{
            fontSize: 30,
            letterSpacing: "0.06em",
            color: "hsl(0 0% 18%)",
            animation: "naira-word 0.6s ease 0.25s both",
          }}
        >
          Almost there
        </h1>
        <p
          className="mt-2 text-[13px] tracking-[0.22em] uppercase"
          style={{
            animation: "naira-word 0.6s ease 0.45s both",
          }}
        >
          <span
            style={{
              animation: "naira-shimmer 2.4s linear infinite",
              background: "linear-gradient(90deg,#2F5D63 20%,#C58F73 50%,#2F5D63 80%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Taking you to secure checkout
          </span>
        </p>

        {/* progress dots */}
        <div className="mt-6 flex gap-2" style={{ animation: "naira-word 0.6s ease 0.65s both" }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="rounded-full"
              style={{
                width: 7,
                height: 7,
                backgroundColor: "#2F5D63",
                opacity: 0.25,
                animation: `naira-bloom 1.2s ease ${0.15 * i}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CartCheckoutRedirect;
