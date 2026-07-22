import { useEffect, useRef, useState } from "react";

/* ───────────────────────────────────────────────────────────────
   FEATHER CURSOR
   The pointer becomes a soft sage-and-gold feather that floats behind
   a precise ink dot (the real hotspot). The feather eases behind the
   cursor, tilts in the direction of travel and gently sways when still,
   like a feather drifting on air. Over links/buttons it lifts and
   glows; a click sheds a couple of little feathers. Desktop + fine
   pointer only, honours reduced-motion.
   ─────────────────────────────────────────────────────────────── */

const FeatherCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const featherRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    document.documentElement.classList.add("has-feather-cursor");

    const target = { x: innerWidth / 2, y: innerHeight / 2 };
    const pos = { x: target.x, y: target.y };
    let vx = 0, vy = 0, rot = -22, sway = 0, raf = 0, hovering = false;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX; target.y = e.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      const el = e.target as HTMLElement | null;
      const interactive = !!el?.closest('a, button, [role="button"], input, textarea, select, label, [data-cursor="bloom"]');
      if (interactive !== hovering) { hovering = interactive; featherRef.current?.classList.toggle("is-lift", hovering); }
    };

    const tick = () => {
      const px = pos.x, py = pos.y;
      pos.x += (target.x - pos.x) * 0.14;
      pos.y += (target.y - pos.y) * 0.14;
      vx = pos.x - px; vy = pos.y - py;
      const speed = Math.min(1, Math.hypot(vx, vy) / 22);
      sway += 0.045;
      // rest tilt −22°, tilt toward travel direction as it moves, idle sway
      const travel = Math.atan2(vy, vx) * (180 / Math.PI);
      const targetRot = -22 + (speed > 0.02 ? (travel + 90) * speed * 0.28 : 0) + Math.sin(sway) * (3.5 - speed * 3);
      rot += (targetRot - rot) * 0.12;
      if (featherRef.current) {
        featherRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${rot.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const featherSVG = `<svg width="16" height="22" viewBox="0 0 16 22"><path d="M8 21 L8.4 7" stroke="#C99A4C" stroke-width="1" fill="none"/><path d="M8.2 6 C2 9 1 15 4.5 20 C6 17 7.4 12 8.2 6Z" fill="#99B4AF"/><path d="M8.2 6 C14 9 15 15 11.5 20 C10 17 8.9 12 8.2 6Z" fill="#B4C7C2"/></svg>`;
    const onClick = (e: MouseEvent) => {
      const burst = burstRef.current; if (!burst) return;
      for (let i = 0; i < 3; i++) {
        const f = document.createElement("span");
        f.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;pointer-events:none;will-change:transform,opacity;`;
        f.innerHTML = featherSVG;
        burst.appendChild(f);
        const ang = (i - 1) * 0.7 - Math.PI / 2;
        const dx = Math.cos(ang) * (26 + i * 12), dy = Math.sin(ang) * 18;
        f.animate(
          [{ transform: "translate(-50%,-50%) rotate(0) scale(.5)", opacity: .9 },
           { transform: `translate(${dx}px, ${dy + 60}px) rotate(${180 + i * 60}deg) scale(1)`, opacity: 0 }],
          { duration: 1100 + i * 80, easing: "cubic-bezier(.25,.7,.35,1)", fill: "forwards" }
        ).onfinish = () => f.remove();
      }
    };

    const onDown = () => featherRef.current?.classList.add("is-press");
    const onUp = () => featherRef.current?.classList.remove("is-press");

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
      document.documentElement.classList.remove("has-feather-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block">
      <div ref={burstRef} className="fixed inset-0" />
      <div ref={featherRef} className="feather fixed left-0 top-0 -ml-2 -mt-5 will-change-transform" style={{ transition: "filter .3s ease" }}>
        <svg width="26" height="36" viewBox="0 0 26 36" className="drop-shadow-[0_2px_4px_rgba(122,90,40,0.25)]">
          {/* shaft */}
          <path d="M13 35 L13.6 10" stroke="#C99A4C" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          {/* two vanes */}
          <path d="M13.4 8 C4 12 2 23 7 32 C10 28 12.2 19 13.4 8 Z" fill="#99B4AF" opacity="0.92" />
          <path d="M13.4 8 C22 12 24 23 19 32 C16 28 14.6 19 13.4 8 Z" fill="#B4C7C2" opacity="0.92" />
          {/* barbs */}
          <g stroke="#7E9A94" strokeWidth="0.6" opacity="0.5">
            <path d="M13 14 L8 16" /><path d="M13 18 L7.5 21" /><path d="M13 22 L8 26" />
            <path d="M13.6 14 L18.5 16" /><path d="M13.6 18 L19 21" /><path d="M13.6 22 L18 26" />
          </g>
          {/* quill tip */}
          <circle cx="13" cy="35" r="1.4" fill="#C99A4C" />
        </svg>
      </div>
      <div ref={dotRef} className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-[#1A1614] will-change-transform" />
      <style>{`
        .has-feather-cursor, .has-feather-cursor * { cursor: none !important; }
        .feather { transform-origin: 13px 35px; }
        .feather.is-lift { filter: drop-shadow(0 0 8px rgba(201,154,76,.6)) brightness(1.06); }
        .feather.is-press svg { transform: scale(.9); transition: transform .12s ease; }
      `}</style>
    </div>
  );
};

export default FeatherCursor;
