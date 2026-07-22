import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/* ───────────────────────────────────────────────────────────────
   PAGE CURTAIN
   An editorial route transition: on every navigation a sage curtain
   sweeps down to cover, a blush flota blooms at centre, then it lifts
   away to reveal the new page. Pointer-events-none throughout, so it
   never blocks interaction. Skips the very first load (the preloader
   already owns that moment) and honours reduced-motion.
   ─────────────────────────────────────────────────────────────── */

const PageCurtain = () => {
  const { pathname } = useLocation();
  const [key, setKey] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setKey((k) => k + 1);
  }, [pathname]);

  if (key === 0) return null;

  return (
    <div key={key} aria-hidden className="page-curtain pointer-events-none fixed inset-0 z-[9500]">
      <div className="curtain-panel absolute inset-0 bg-[#99B4AF]" />
      <div className="curtain-mark absolute inset-0 flex items-center justify-center">
        <svg width="58" height="58" viewBox="0 0 40 40">
          {[0, 72, 144, 216, 288].map((a) => {
            const rad = (a * Math.PI) / 180;
            const px = 20 + Math.cos(rad) * 9;
            const py = 20 + Math.sin(rad) * 9;
            return <ellipse key={a} cx={px} cy={py} rx="6" ry="3.4" fill="#FFF8F5" transform={`rotate(${a} ${px} ${py})`} />;
          })}
          <circle cx="20" cy="20" r="4.4" fill="#FFBDA8" />
        </svg>
      </div>
      <style>{`
        @keyframes curtain-sweep {
          0%   { transform: scaleY(0); transform-origin: top; }
          42%  { transform: scaleY(1); transform-origin: top; }
          43%  { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
        @keyframes curtain-mark {
          0%,18%  { opacity: 0; transform: scale(0.6) rotate(-30deg); }
          42%     { opacity: 1; transform: scale(1) rotate(0deg); }
          60%     { opacity: 1; transform: scale(1) rotate(0deg); }
          78%,100%{ opacity: 0; transform: scale(0.9) rotate(20deg); }
        }
        .page-curtain .curtain-panel { animation: curtain-sweep 1.05s cubic-bezier(.76,0,.24,1) forwards; will-change: transform; }
        .page-curtain .curtain-mark  { animation: curtain-mark 1.05s ease forwards; }
      `}</style>
    </div>
  );
};

export default PageCurtain;
