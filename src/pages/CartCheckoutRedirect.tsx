import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { CHECKOUT_DOMAIN } from "@/lib/shopify";
import floralPattern from "@/assets/floral-pattern-bg.webp";
import nairaLogo from "@/assets/naira-logo.webp";

const petals = [
  { left: "7%", delay: "-1.2s", duration: "7.4s", size: 18, tone: "var(--nf-tint-blush)" },
  { left: "18%", delay: "-5.1s", duration: "9.2s", size: 12, tone: "var(--nf-tint-sage)" },
  { left: "31%", delay: "-3.4s", duration: "8.1s", size: 15, tone: "var(--nf-surface-raised)" },
  { left: "45%", delay: "-6.8s", duration: "10.4s", size: 20, tone: "var(--nf-tint-blush)" },
  { left: "59%", delay: "-2.6s", duration: "7.8s", size: 13, tone: "var(--nf-tint-sage)" },
  { left: "72%", delay: "-7.2s", duration: "9.7s", size: 17, tone: "var(--nf-tint-blush)" },
  { left: "84%", delay: "-4.3s", duration: "8.7s", size: 11, tone: "var(--nf-tint-sage)" },
  { left: "94%", delay: "-0.8s", duration: "10.8s", size: 16, tone: "var(--nf-surface-raised)" },
];

/**
 * Safety net for Shopify checkout links that land on our own domain.
 *
 * Shopify's primary domain is nairaflore.com, which is served by this app — so
 * Shopify sometimes bounces a checkout (/cart/c/<token> or /checkouts/cn/<token>)
 * to nairaflore.com, where it would hit our 404. We catch those paths and send
 * the shopper back to the branded checkout domain, keeping every
 * query param (key, discount, channel) intact.
 */
const CartCheckoutRedirect = () => {
  const { token } = useParams<{ token: string }>();
  const { search, pathname } = useLocation();

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
    window.location.replace(target);
  }, [token, search, pathname]);

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[var(--nf-surface)] text-[var(--nf-text)]">
      <style>{`
        @keyframes checkout-petal-fall {
          0% { transform: translate3d(0, -12vh, 0) rotate(0deg); opacity: 0; }
          12% { opacity: .72; }
          55% { transform: translate3d(22px, 48vh, 0) rotate(190deg); }
          100% { transform: translate3d(-18px, 112vh, 0) rotate(390deg); opacity: 0; }
        }
        @keyframes checkout-breathe {
          0%, 100% { transform: scaleX(.35); opacity: .35; }
          50% { transform: scaleX(1); opacity: 1; }
        }
        @keyframes checkout-enter {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .checkout-petal { display: none; }
          .checkout-progress, .checkout-content { animation: none !important; }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center opacity-[0.11] mix-blend-multiply"
        style={{ backgroundImage: `url(${floralPattern})` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(120% 65% at 50% 0%, color-mix(in srgb, var(--nf-tint-blush) 40%, transparent) 0%, transparent 62%), radial-gradient(85% 70% at 100% 100%, color-mix(in srgb, var(--nf-tint-sage) 34%, transparent) 0%, transparent 58%)",
        }}
      />

      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        {petals.map((petal, index) => (
          <svg
            key={index}
            className="checkout-petal absolute -top-8"
            viewBox="0 0 32 40"
            style={{
              left: petal.left,
              width: petal.size,
              animation: `checkout-petal-fall ${petal.duration} linear ${petal.delay} infinite`,
              willChange: "transform, opacity",
            }}
          >
            <path
              d="M16 2C25 5 30 16 27 27c-2 8-8 12-12 11C9 37 5 30 6 21 7 12 11 5 16 2Z"
              fill={petal.tone}
              fillOpacity=".72"
              stroke="var(--nf-accent-quiet)"
              strokeOpacity=".2"
              strokeWidth=".45"
            />
            <path d="M16 5c-1 10-1 20 0 30" stroke="var(--nf-accent-quiet)" strokeOpacity=".25" strokeWidth=".5" />
          </svg>
        ))}
      </div>

      <div className="checkout-content relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center [animation:checkout-enter_.7s_cubic-bezier(.22,1,.36,1)_both]">
        <img
          src={nairaLogo}
          alt="Naira Flore"
          className="w-[190px] sm:w-[230px] h-auto mb-8"
          loading="eager"
        />
        <div className="w-14 h-px bg-[var(--nf-accent-strong)]/60 mb-7" />
        <p className="font-cormorant text-[25px] sm:text-[29px] leading-tight">
          Taking you to secure checkout
        </p>
        <p className="mt-3 font-sans text-[10px] uppercase tracking-[0.24em] text-[color:rgb(var(--nf-ink-rgb)/0.55)]">
          Your selection is reserved
        </p>
        <div className="mt-8 h-px w-24 overflow-hidden bg-[color:rgb(var(--nf-ink-rgb)/0.12)]">
          <span className="checkout-progress block h-full w-full origin-center bg-[var(--nf-accent-strong)] [animation:checkout-breathe_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </main>
  );
};

export default CartCheckoutRedirect;
