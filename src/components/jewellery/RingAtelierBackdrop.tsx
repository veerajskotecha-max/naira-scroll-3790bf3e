import { useEffect, useRef, useState } from "react";
import floralBg from "@/assets/floral-pattern-bg.webp";

/* ───────────────────────────────────────────────────────────────
   RING ATELIER BACKDROP
   The hero's pressed-flower paper wash carried behind the turning
   ring, with slow 3D-parallax petals and glass orbs that drift on
   scroll/pointer, plus an elegant flower bloom wherever the client
   taps. Scoped to this section only. Reduced motion: static wash.
   ─────────────────────────────────────────────────────────────── */

type Bloom = { id: number; x: number; y: number };

const PETALS = [
  { l: "6%", t: "12%", w: 130, rot: -18, z: -220, color: "#FFBDA8", op: 0.5, dur: "26s", delay: "0s" },
  { l: "26%", t: "68%", w: 96, rot: 14, z: -140, color: "#AEBDB6", op: 0.45, dur: "31s", delay: "-6s" },
  { l: "52%", t: "8%", w: 74, rot: -34, z: -300, color: "#E5B9A4", op: 0.4, dur: "35s", delay: "-12s" },
  { l: "72%", t: "58%", w: 120, rot: 22, z: -180, color: "#FFBDA8", op: 0.42, dur: "29s", delay: "-3s" },
  { l: "88%", t: "22%", w: 86, rot: -8, z: -260, color: "#AEBDB6", op: 0.4, dur: "33s", delay: "-9s" },
];

const ORBS = [
  { l: "16%", t: "34%", s: 190, z: -340, dur: "24s", delay: "0s" },
  { l: "80%", t: "72%", s: 150, z: -260, dur: "28s", delay: "-8s" },
  { l: "62%", t: "18%", s: 110, z: -400, dur: "32s", delay: "-4s" },
];

const RingAtelierBackdrop = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [blooms, setBlooms] = useState<Bloom[]>([]);
  const seq = useRef(0);

  // pointer parallax on the 3D layer
  useEffect(() => {
    const root = rootRef.current;
    const layer = layerRef.current;
    if (!root || !layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const host = root.parentElement ?? root;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      layer.style.transform = `rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 8;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 6;
    };

    host.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      host.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // flower bloom on tap / click, anywhere on this screen
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const host = root.parentElement ?? root;

    const onDown = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const id = ++seq.current;
      setBlooms((prev) => [...prev.slice(-4), { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
      window.setTimeout(() => setBlooms((prev) => prev.filter((b) => b.id !== id)), 1500);
    };

    host.addEventListener("pointerdown", onDown, { passive: true });
    return () => host.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <style>{`
        @keyframes naira-ring-float {
          0%   { transform: translate3d(0,0,0) rotate(var(--r, 0deg)); }
          50%  { transform: translate3d(var(--dx, 14px), var(--dy, -18px), 0) rotate(calc(var(--r, 0deg) + 8deg)); }
          100% { transform: translate3d(0,0,0) rotate(var(--r, 0deg)); }
        }
        @keyframes naira-ring-orb {
          0%   { transform: translate3d(0,0,0) scale(1); opacity: .35; }
          50%  { transform: translate3d(-16px, 18px, 0) scale(1.08); opacity: .5; }
          100% { transform: translate3d(0,0,0) scale(1); opacity: .35; }
        }
        @keyframes naira-bloom-petal {
          0%   { transform: rotate(var(--a)) translateY(0) scale(.2); opacity: 0; }
          22%  { opacity: .9; }
          100% { transform: rotate(var(--a)) translateY(calc(-1 * var(--d))) scale(1); opacity: 0; }
        }
        @keyframes naira-bloom-ring {
          0%   { transform: scale(.2); opacity: .55; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes naira-bloom-core {
          0%   { transform: scale(0); opacity: .9; }
          60%  { transform: scale(1); opacity: .6; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .naira-ring-motion { animation: none !important; }
        }
      `}</style>

      {/* pressed-flower paper wash */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{ backgroundImage: `url(${floralBg})`, backgroundSize: "150% auto" }}
      />
      {/* warm sun-faded gradient */}
      <div className="absolute inset-0 [background:radial-gradient(120%_62%_at_50%_0%,#FFF1E6_0%,transparent_62%),radial-gradient(80%_60%_at_100%_100%,#FFD9C7_0%,transparent_58%),radial-gradient(70%_55%_at_0%_85%,#DCE6E1_0%,transparent_60%)] opacity-90" />

      {/* 3D drifting layer */}
      <div
        className="absolute inset-0"
        style={{ perspective: "900px", perspectiveOrigin: "50% 45%" }}
      >
        <div
          ref={layerRef}
          className="absolute inset-0 transition-transform duration-500 ease-out"
          style={{ transformStyle: "preserve-3d" }}
        >
          {ORBS.map((o, i) => (
            <div
              key={`orb-${i}`}
              className="naira-ring-motion absolute rounded-full"
              style={{
                left: o.l,
                top: o.t,
                width: o.s,
                height: o.s,
                transform: `translateZ(${o.z}px)`,
                background:
                  "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9) 0%, rgba(255,214,196,0.35) 42%, rgba(174,189,182,0.16) 70%, transparent 74%)",
                animation: `naira-ring-orb ${o.dur} ease-in-out ${o.delay} infinite`,
                willChange: "transform, opacity",
              }}
            />
          ))}

          {PETALS.map((p, i) => (
            <svg
              key={`petal-${i}`}
              viewBox="0 0 100 34"
              className="naira-ring-motion absolute"
              style={
                {
                  left: p.l,
                  top: p.t,
                  width: p.w,
                  height: p.w * 0.34,
                  opacity: p.op,
                  "--r": `${p.rot}deg`,
                  "--dx": `${(i % 2 ? -1 : 1) * (10 + i * 4)}px`,
                  "--dy": `${-14 - i * 3}px`,
                  animation: `naira-ring-float ${p.dur} ease-in-out ${p.delay} infinite`,
                  willChange: "transform",
                } as React.CSSProperties
              }
            >
              <path d="M2,17 C18,2 70,2 98,17 C70,32 18,32 2,17 Z" fill={p.color} />
            </svg>
          ))}
        </div>
      </div>

      {/* touch blooms */}
      {blooms.map((b) => (
        <div key={b.id} className="absolute" style={{ left: b.x, top: b.y }}>
          <span
            className="absolute block rounded-full border"
            style={{
              width: 90,
              height: 90,
              marginLeft: -45,
              marginTop: -45,
              borderColor: "rgba(201,154,76,0.45)",
              animation: "naira-bloom-ring 1.2s cubic-bezier(.16,1,.3,1) forwards",
            }}
          />
          <span
            className="absolute block rounded-full"
            style={{
              width: 16,
              height: 16,
              marginLeft: -8,
              marginTop: -8,
              background: "radial-gradient(circle, #FFF6E2 0%, #E5B9A4 60%, transparent 72%)",
              animation: "naira-bloom-core 1.1s ease-out forwards",
            }}
          />
          {Array.from({ length: 8 }).map((_, i) => (
            <svg
              key={i}
              viewBox="0 0 40 80"
              style={
                {
                  position: "absolute",
                  width: 18,
                  height: 36,
                  marginLeft: -9,
                  marginTop: -18,
                  transformOrigin: "50% 50%",
                  "--a": `${i * 45}deg`,
                  "--d": `${44 + (i % 3) * 10}px`,
                  animation: `naira-bloom-petal 1.35s cubic-bezier(.16,1,.3,1) ${i * 0.03}s forwards`,
                } as React.CSSProperties
              }
            >
              <path
                d="M20,2 C33,20 34,50 20,78 C6,50 7,20 20,2 Z"
                fill={i % 3 === 0 ? "#AEBDB6" : i % 3 === 1 ? "#E5B9A4" : "#F3D9C6"}
                opacity="0.85"
              />
            </svg>
          ))}
        </div>
      ))}
    </div>
  );
};

export default RingAtelierBackdrop;
