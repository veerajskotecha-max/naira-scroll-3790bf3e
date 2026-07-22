import { useEffect, useRef, useState } from "react";

/* ───────────────────────────────────────────────────────────────
   ATELIER CURSOR
   A bespoke pointer: a soft ink dot that tracks instantly, trailed by
   a sage ring that eases behind it and a faint petal that lags further.
   Over links/buttons it blooms into a larger blush ring (magnetic feel).
   Desktop + fine-pointer only — never shown on touch devices.
   ─────────────────────────────────────────────────────────────── */

const AtelierCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const petalRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    document.documentElement.classList.add("has-atelier-cursor");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    const petal = { x: target.x, y: target.y };
    let rot = 0;
    let raf = 0;
    let hovering = false;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;

      const el = e.target as HTMLElement | null;
      const interactive = !!el?.closest('a, button, [role="button"], input, textarea, select, label, .jewel-card, [data-cursor="bloom"]');
      if (interactive !== hovering) {
        hovering = interactive;
        ringRef.current?.classList.toggle("is-bloom", hovering);
      }
    };

    const tick = () => {
      ring.x += (target.x - ring.x) * 0.18;
      ring.y += (target.y - ring.y) * 0.18;
      petal.x += (target.x - petal.x) * 0.09;
      petal.y += (target.y - petal.y) * 0.09;
      rot += 0.6;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      if (petalRef.current) petalRef.current.style.transform = `translate3d(${petal.x}px, ${petal.y}px, 0) translate(-50%, -50%) rotate(${rot}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onDown = () => ringRef.current?.classList.add("is-press");
    const onUp = () => ringRef.current?.classList.remove("is-press");

    // ── click-to-bloom: a small burst of petals scatters from the click ──
    const colors = ["#FFBDA8", "#99B4AF", "#E8C57E", "#FFD8C6"];
    const onClick = (e: MouseEvent) => {
      const burst = burstRef.current;
      if (!burst) return;
      const n = 7;
      for (let i = 0; i < n; i++) {
        const petal = document.createElement("span");
        const c = colors[i % colors.length];
        petal.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:14px;height:8px;border-radius:60% 60% 60% 60%/80% 80% 60% 60%;background:${c};opacity:.9;pointer-events:none;will-change:transform,opacity;`;
        burst.appendChild(petal);
        const ang = (i / n) * Math.PI * 2 + (i % 2 ? 0.4 : -0.3);
        const dist = 40 + (i % 3) * 26;
        const dx = Math.cos(ang) * dist;
        const dy = Math.sin(ang) * dist - 18; // bias upward
        petal.animate(
          [
            { transform: "translate(-50%,-50%) rotate(0deg) scale(0.4)", opacity: 0.95 },
            { transform: `translate(${dx}px,${dy + 70}px) rotate(${260 + i * 30}deg) scale(1)`, opacity: 0 },
          ],
          { duration: 900 + i * 60, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }
        ).onfinish = () => petal.remove();
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("click", onClick);
      document.documentElement.classList.remove("has-atelier-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block">
      <div ref={burstRef} className="fixed inset-0" />
      <div ref={petalRef} className="fixed left-0 top-0 will-change-transform">
        <svg width="26" height="14" viewBox="0 0 100 34" className="opacity-40">
          <path d="M2 17 C20 0 80 0 98 17 C80 34 20 34 2 17 Z" fill="#FFBDA8" />
        </svg>
      </div>
      <div
        ref={ringRef}
        className="atelier-ring fixed left-0 top-0 h-8 w-8 rounded-full border border-[#99B4AF] will-change-transform"
        style={{ transition: "width .35s cubic-bezier(.16,1,.3,1), height .35s cubic-bezier(.16,1,.3,1), border-color .35s, background-color .35s" }}
      />
      <div ref={dotRef} className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-[#1A1614] will-change-transform" />
      <style>{`
        .has-atelier-cursor, .has-atelier-cursor * { cursor: none !important; }
        .atelier-ring.is-bloom { width: 3.4rem; height: 3.4rem; border-color: #FFBDA8; background: rgba(255,189,168,0.10); }
        .atelier-ring.is-press { width: 1.4rem; height: 1.4rem; }
      `}</style>
    </div>
  );
};

export default AtelierCursor;
