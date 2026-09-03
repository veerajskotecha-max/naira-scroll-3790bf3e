import { useEffect, useRef } from "react";
import { BLOOM_MS } from "./gateLogic";

/* ───────────────────────────────────────────────────────────────
   PETAL CANVAS
   Drifting petals behind the gate. One canvas, one rAF loop, a hard
   cap on the particle count. Idle when the tab is hidden or the
   element is off-screen; a single still frame under reduced motion.
   `blooming` makes the petals rush to the centre and open.
   ─────────────────────────────────────────────────────────────── */

const MAX_PETALS = 44;

/* Brand blush, cream, sage and a whisper of gold — kept faint so text
   stays readable over them. */
const TONES = [
  "rgba(214, 173, 152, 0.55)",
  "rgba(255, 248, 245, 0.75)",
  "rgba(153, 180, 175, 0.45)",
  "rgba(176, 132, 58, 0.30)",
];

type Petal = {
  x: number;
  y: number;
  r: number;
  vy: number;
  sway: number;
  swayF: number;
  phase: number;
  rot: number;
  spin: number;
  tone: number;
  fromX: number;
  fromY: number;
  angle: number;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const easeIn = (t: number) => t * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const PetalCanvas = ({ blooming, className }: { blooming: boolean; className?: string }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const bloomAt = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let petals: Petal[] = [];
    let raf = 0;
    let last = 0;
    let inView = true;
    let caught = false; // bloom start positions captured

    const seed = () => {
      const count = Math.min(MAX_PETALS, Math.max(12, Math.round(w / 24)));
      petals = Array.from({ length: count }, (_, i) => ({
        x: rand(0, w),
        y: rand(-h * 0.2, h),
        r: rand(4, 11),
        vy: rand(9, 26),
        sway: rand(8, 26),
        swayF: rand(0.15, 0.5),
        phase: rand(0, Math.PI * 2),
        rot: rand(0, Math.PI * 2),
        spin: rand(-0.5, 0.5),
        tone: i % TONES.length,
        fromX: 0,
        fromY: 0,
        angle: (i / count) * Math.PI * 2 + rand(-0.2, 0.2),
      }));
    };

    const paint = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const bloom = bloomAt.current ? Math.min(1, (t - bloomAt.current) / BLOOM_MS) : 0;
      if (bloom > 0 && !caught) {
        caught = true;
        for (const p of petals) {
          p.fromX = p.x;
          p.fromY = p.y;
        }
      }
      const cx = w / 2;
      const cy = h / 2;
      const reach = Math.max(w, h) * 0.75;

      for (const p of petals) {
        let x = p.x;
        let y = p.y;
        let r = p.r;
        let alpha = 1;

        if (bloom > 0) {
          if (bloom < 0.45) {
            // rush inward
            const k = easeIn(bloom / 0.45);
            x = p.fromX + (cx - p.fromX) * k;
            y = p.fromY + (cy - p.fromY) * k;
            r = p.r * (1 - 0.35 * k);
          } else {
            // and open
            const k = easeOut((bloom - 0.45) / 0.55);
            x = cx + Math.cos(p.angle) * reach * k;
            y = cy + Math.sin(p.angle) * reach * k;
            r = p.r * (0.65 + 2 * k);
            alpha = 1 - k;
          }
        }

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = TONES[p.tone];
        ctx.beginPath();
        ctx.moveTo(-r, 0);
        ctx.quadraticCurveTo(0, -r * 0.85, r, 0);
        ctx.quadraticCurveTo(0, r * 0.85, -r, 0);
        ctx.fill();
        ctx.restore();
      }
    };

    const step = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (bloomAt.current && t - bloomAt.current >= BLOOM_MS) {
        ctx.clearRect(0, 0, w, h); // bloomed and gone — nothing left to animate
        setRunning(false);
        return;
      }
      if (!bloomAt.current) {
        for (const p of petals) {
          p.y += p.vy * dt;
          p.phase += p.swayF * dt * Math.PI * 2;
          p.x += Math.sin(p.phase) * p.sway * dt;
          p.rot += p.spin * dt;
          if (p.y - p.r > h) {
            p.y = -p.r * 2;
            p.x = rand(0, w);
          }
          if (p.x < -p.r * 2) p.x = w + p.r;
          if (p.x > w + p.r * 2) p.x = -p.r;
        }
      }
      paint(t);
      raf = requestAnimationFrame(step);
    };

    const setRunning = (on: boolean) => {
      if (on && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      } else if (!on && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    /* Idle whenever nobody can see it. */
    const sync = () => setRunning(!reduced && inView && !document.hidden);

    const size = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!petals.length) seed();
      if (reduced || !raf) paint(performance.now()); // keep a still frame current
    };

    size();
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      setRunning(false);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    if (!blooming || bloomAt.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    bloomAt.current = performance.now();
  }, [blooming]);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
};

export default PetalCanvas;
