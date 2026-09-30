import { useEffect, useRef } from "react";
import NairaBoxCSS from "./NairaBoxCSS";
import { drawerTransforms, poseTransform, REST_POSE } from "./pose";
import printSm from "@/assets/naira-box-print-sm.webp";

/*
  The Naira gift box, in the bag, under the pieces it will carry. It hovers
  and turns slowly, the ring shut inside, as the 3D box does on the rest of
  the site (src/components/NairaBox3D.tsx). A tap opens it: it comes round,
  the drawer slides out and the solitaire rises from its velvet cushion and
  catches the light; then the ring sinks, the drawer closes and it turns on.
  `onRing` says when the ring is up, so the bag can say what it means.

  Only transform and opacity move, so the compositor does the work and a busy
  page never stutters it. The idle float and turn pause whenever the box is
  off screen; a shopper who asked for reduced motion sees it still.
*/

const TURN_MS = 16000; // one slow revolution
const PEEK = { tilt: -40, turn: 18 }; // looking down into the open drawer
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"; // --nf-ease-reveal
const DRAWER_PARTS = ["front", "tray", "left", "right"] as const;

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
const pose = (tilt: number, turn: number) => poseTransform({ tilt, turn });

const prefersReducedMotion = () =>
  typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

type Props = {
  /** Lid width in px. */
  size: number;
  /** The ring cut-out that rises when the drawer opens. */
  ring?: string;
  /** Told true once the ring is up, false as it goes back down. */
  onRing?: (up: boolean) => void;
};

const BagGiftBox = ({ size, ring, onRing }: Props) => {
  const stage = useRef<HTMLDivElement>(null);
  const lift = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const gleam = useRef<HTMLDivElement>(null);
  const riser = useRef<HTMLDivElement>(null);
  const glint = useRef<HTMLDivElement>(null);
  const front = useRef<HTMLDivElement>(null);
  const tray = useRef<HTMLDivElement>(null);
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const open = useRef<() => void>(() => {});
  const told = useRef(onRing);
  told.current = onRing;
  const still = prefersReducedMotion();

  useEffect(() => {
    if (still) return;
    const drawer = { front, tray, left, right };
    let alive = true;
    const run = (el: HTMLElement | null, keyframes: Keyframe[], options: KeyframeAnimationOptions) =>
      el && alive ? el.animate(keyframes, { fill: "forwards", ...options }) : null;
    const done = (animation: Animation | null) => animation?.finished.then(() => undefined) ?? Promise.resolve();

    /* Idle: a slow float with the shadow breathing under it, and a turn. */
    const float = { duration: 1700, direction: "alternate" as const, iterations: Infinity, easing: "ease-in-out" };
    const idle = [
      run(lift.current, [{ transform: "translateY(0px) rotate(0deg)" }, { transform: `translateY(${-size * 0.06}px) rotate(-1deg)` }], float),
      run(shadow.current, [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(0.84)", opacity: 0.62 }], float),
    ];
    let spin: Animation | null = null;
    let spinFrom = REST_POSE.turn;
    const turnNow = () => (spin ? spinFrom - 360 * ((Number(spin.currentTime ?? 0) % TURN_MS) / TURN_MS) : spinFrom);
    const startSpin = (from: number) => {
      spinFrom = from;
      spin = run(box.current, [{ transform: pose(REST_POSE.tilt, from) }, { transform: pose(REST_POSE.tilt, from - 360) }], {
        duration: TURN_MS,
        iterations: Infinity,
        easing: "linear",
      });
    };
    startSpin(REST_POSE.turn);

    /* The opening: round to face the shopper, drawer out, the ring up with a
       glint on the stone, a pause to look, ring down, drawer home, turning. */
    let opening = false;
    open.current = async () => {
      if (opening || !alive) return;
      opening = true;
      try {
        const now = turnNow();
        spin?.cancel();
        spin = null;
        const to = now + ((((PEEK.turn - now) % 360) + 540) % 360) - 180; // the shorter way round
        await done(run(box.current, [{ transform: pose(REST_POSE.tilt, now) }, { transform: pose(PEEK.tilt, to) }], {
          duration: Math.min(900, Math.max(450, Math.abs(to - now) * 5)),
          easing: EASE,
        }));
        const shut = drawerTransforms(size, 0);
        const out = drawerTransforms(size, 1);
        DRAWER_PARTS.forEach((part) =>
          run(drawer[part].current, [{ transform: shut[part] }, { transform: out[part] }], { duration: 520, easing: EASE }),
        );
        await wait(380);
        await done(run(riser.current, [{ transform: "translateY(100%)" }, { transform: "translateY(0%)" }], { duration: 760, easing: EASE }));
        if (!alive) return;
        told.current?.(true);
        const sparkle = () =>
          run(glint.current, [
            { opacity: 0, transform: "scale(0.2) rotate(0deg)" },
            { opacity: 1, transform: "scale(1) rotate(45deg)", offset: 0.4 },
            { opacity: 0, transform: "scale(0.3) rotate(90deg)" },
          ], { duration: 720, easing: "ease-out" });
        sparkle();
        await wait(1300);
        sparkle();
        await wait(1500);
        if (!alive) return;
        told.current?.(false);
        await done(run(riser.current, [{ transform: "translateY(0%)" }, { transform: "translateY(100%)" }], { duration: 420, easing: "cubic-bezier(0.55, 0, 1, 0.45)" }));
        DRAWER_PARTS.forEach((part) =>
          run(drawer[part].current, [{ transform: out[part] }, { transform: shut[part] }], { duration: 560, easing: "cubic-bezier(0.65, 0, 0.35, 1)" }),
        );
        await wait(580);
        run(gleam.current, [{ transform: "translateX(-160%) skewX(-18deg)" }, { transform: "translateX(330%) skewX(-18deg)" }], {
          duration: 900,
          easing: "cubic-bezier(0.45, 0, 0.2, 1)",
        });
        await done(run(box.current, [{ transform: pose(PEEK.tilt, to) }, { transform: pose(REST_POSE.tilt, to - 12) }], {
          duration: 900,
          easing: "cubic-bezier(0.45, 0, 0.55, 1)",
        }));
        if (alive) startSpin(to - 12);
      } catch {
        /* the bag closed mid-way */
      } finally {
        opening = false;
      }
    };

    /* Rests off screen (a long bag may have it below the fold). */
    const watcher = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        [...idle, spin].forEach((animation) => {
          if (!animation) return;
          if (visible && animation.playState === "paused") animation.play();
          if (!visible && animation.playState === "running" && !opening) animation.pause();
        });
      },
      { threshold: 0 },
    );
    if (stage.current) watcher.observe(stage.current);

    return () => {
      alive = false;
      watcher.disconnect();
      open.current = () => {};
      [box, lift, shadow, gleam, riser, glint, front, tray, left, right].forEach((part) =>
        part.current?.getAnimations().forEach((animation) => animation.cancel()),
      );
    };
  }, [size, still]);

  return (
    /* Room for the drawer out and the box looking down into it. A div (the
       box is drawn in divs, which a <button> may not hold) that acts as one. */
    <div
      ref={stage}
      role={still ? undefined : "button"}
      tabIndex={still ? undefined : 0}
      aria-label={still ? undefined : "Open the gift box"}
      onClick={() => open.current()}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        open.current();
      }}
      className={`relative flex shrink-0 justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nf-gold-deep ${still ? "" : "cursor-pointer"}`}
      style={{ width: size * 1.75, height: size * 1.5, paddingTop: size * 0.16 }}
    >
      <NairaBoxCSS
        size={size}
        withDrawer
        print={printSm}
        ring={ring}
        ringFacing={PEEK}
        parts={{ lift, shadow, box, gleam, ring: riser, glint, front, tray, left, right }}
      />
    </div>
  );
};

export default BagGiftBox;
