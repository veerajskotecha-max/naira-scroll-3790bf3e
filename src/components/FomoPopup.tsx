import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { reviewerNames } from "@/data/productReviews";

/**
 * Social-proof ("someone just bought this") notifications on product pages.
 * First appears 15s after landing, then alternates 30s / 45s gaps, each time
 * with a different buyer, piece and elapsed time.
 */

const CITIES = [
  "Mumbai",
  "Pune",
  "Nashik",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Ahmedabad",
  "Jaipur",
  "Kolkata",
  "Chennai",
  "Indore",
  "Surat",
];

const FIRST_DELAY = 15000;
const GAPS = [30000, 45000];
const VISIBLE_FOR = 6500;

interface Shown {
  name: string;
  city: string;
  minutes: number;
  title: string;
  image: string;
  to: string;
}

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const FomoPopup = () => {
  const { jewellery } = useLiveJewellery();
  const [item, setItem] = useState<Shown | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timers = useRef<number[]>([]);

  const pool = useMemo(
    () => jewellery.filter((p) => p.image && p.handle).slice(0, 60),
    [jewellery],
  );

  useEffect(() => {
    if (dismissed || pool.length === 0) return;

    let round = 0;
    const clearAll = () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };

    const show = () => {
      const piece = pick(pool);
      setItem({
        name: pick(reviewerNames),
        city: pick(CITIES),
        minutes: 1 + Math.floor(Math.random() * 24),
        title: piece.name,
        image: piece.image,
        to: `/jewellery/${piece.handle}`,
      });
      setVisible(true);
      timers.current.push(window.setTimeout(() => setVisible(false), VISIBLE_FOR));
      timers.current.push(
        window.setTimeout(() => {
          round += 1;
          show();
        }, VISIBLE_FOR + GAPS[round % GAPS.length]),
      );
    };

    timers.current.push(window.setTimeout(show, FIRST_DELAY));
    return clearAll;
  }, [pool, dismissed]);

  if (!item || dismissed) return null;

  return (
    <div
      className="fixed bottom-[86px] left-3 z-[90] md:bottom-6 md:left-6"
      style={{
        pointerEvents: visible ? "auto" : "none",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 420ms ease, transform 420ms ease",
      }}
      aria-live="polite"
    >
      <div
        className="flex max-w-[300px] items-center gap-3 bg-white/95 p-2 pr-8 backdrop-blur"
        style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.14)", border: "1px solid hsl(0 0% 92%)" }}
      >
        <Link to={item.to} className="shrink-0">
          <img
            src={item.image}
            alt={item.title}
            className="h-12 w-12 object-cover"
            loading="lazy"
            decoding="async"
          />
        </Link>
        <div className="min-w-0">
          <p className="truncate text-[11px] tracking-[0.02em]" style={{ color: "hsl(0 0% 38%)" }}>
            {item.name} from {item.city}
          </p>
          <Link
            to={item.to}
            className="block truncate font-cormorant text-[15px] leading-snug"
            style={{ color: "hsl(0 0% 12%)" }}
          >
            just bought the {item.title}
          </Link>
          <p className="text-[10px] uppercase tracking-[0.16em]" style={{ color: "hsl(0 0% 55%)" }}>
            {item.minutes === 1 ? "1 min ago" : `${item.minutes} mins ago`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss notification"
          className="absolute right-1.5 top-1.5 p-1"
          style={{ color: "hsl(0 0% 55%)" }}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
};

export default FomoPopup;
