import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { reviewerNames } from "@/data/productReviews";

/**
 * Social-proof ("someone just bought this") notifications on product pages.
 * One notification at a time: it fades in, stays visible, fades out, then a
 * quiet gap passes before the next one appears with a fresh buyer + product.
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
  "Lucknow",
  "Chandigarh",
  "Gurugram",
  "Noida",
  "Kochi",
  "Coimbatore",
  "Bhopal",
  "Nagpur",
  "Vadodara",
  "Thane",
  "Goa",
  "Dehradun",
];

const FIRST_NAMES = [
  "Aanya", "Aditi", "Ahana", "Aishwarya", "Ananya", "Anjali", "Avni", "Bhavya",
  "Charvi", "Dhwani", "Diya", "Esha", "Gauri", "Hiral", "Ira", "Ishita",
  "Jhanvi", "Kavya", "Khushi", "Lavanya", "Mahika", "Manasi", "Meera", "Mitali",
  "Naina", "Namrata", "Neha", "Nidhi", "Pooja", "Prisha", "Radhika", "Riya",
  "Rutuja", "Saanvi", "Sakshi", "Sanya", "Shreya", "Simran", "Sneha", "Tanvi",
  "Tara", "Trisha", "Vaishnavi", "Vanya", "Yashvi", "Zoya",
];

const LAST_NAMES = [
  "Agarwal", "Bhatia", "Chawla", "Desai", "Gandhi", "Iyer", "Jain", "Joshi",
  "Kapoor", "Kotecha", "Malhotra", "Mehta", "Nair", "Patel", "Rao", "Reddy",
  "Sharma", "Shah", "Singh", "Verma",
];

const FIRST_DELAY = 5000;
const GAP = 60000;
const VISIBLE_FOR = 2300;
const SNOOZE = 60000;

interface Shown {
  name: string;
  city: string;
  minutes: number;
  title: string;
  image: string;
  to: string;
}

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

interface FomoPopupProps {
  suppressed?: boolean;
}

const FomoPopup = ({ suppressed = false }: FomoPopupProps) => {
  const { jewellery } = useLiveJewellery();
  const [item, setItem] = useState<Shown | null>(null);
  const [visible, setVisible] = useState(false);

  const poolRef = useRef<typeof jewellery>([]);
  const namesRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const snoozeUntil = useRef<number | null>(null);
  const timers = useRef<number[]>([]);
  const started = useRef(false);

  // Build the product pool and name list exactly once, even if jewellery
  // re-renders frequently while data is loading.
  if (poolRef.current.length === 0 && jewellery.length > 0) {
    const available = jewellery.filter((p) => p.image && p.handle);
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    poolRef.current = shuffled.slice(0, Math.min(available.length, 10 + Math.floor(Math.random() * 11)));
  }

  if (namesRef.current.length === 0) {
    const generated: string[] = [];
    for (const first of FIRST_NAMES) {
      for (let i = 0; i < 7; i += 1) {
        generated.push(`${first} ${LAST_NAMES[(FIRST_NAMES.indexOf(first) + i * 3) % LAST_NAMES.length]}`);
      }
    }
    namesRef.current = Array.from(new Set([...reviewerNames, ...generated]));
  }

  useEffect(() => {
    if (started.current) return;
    if (poolRef.current.length === 0) return;
    started.current = true;

    const clearAll = () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };

    const schedule = (delay: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, delay));
    };

    const showNext = () => {
      const now = Date.now();
      if (snoozeUntil.current && now < snoozeUntil.current) {
        schedule(snoozeUntil.current - now + 100, showNext);
        return;
      }

      const piece = poolRef.current[indexRef.current % poolRef.current.length];
      indexRef.current += 1;

      setItem({
        name: pick(namesRef.current),
        city: pick(CITIES),
        minutes: 1 + Math.floor(Math.random() * 24),
        title: piece.name,
        image: piece.image,
        to: `/jewellery/${piece.handle}`,
      });
      setVisible(true);

      schedule(VISIBLE_FOR, () => {
        setVisible(false);
        schedule(GAP, showNext);
      });
    };

    schedule(FIRST_DELAY, showNext);

    return clearAll;
  }, []);

  /* Product dialogs and the cart are higher-intent moments. Never compete
     with them; if one opens while the notice is showing, remove it at once. */
  useEffect(() => {
    if (suppressed) setVisible(false);
  }, [suppressed]);

  if (!item || !visible || suppressed) return null;

  return (
    <div
      className="fixed bottom-[calc(var(--pdp-sticky-bar-h)+env(safe-area-inset-bottom,0px)+10px)] left-3 z-[39] w-[min(292px,calc(100vw-24px))] md:bottom-6 md:left-6 md:z-[90]"
      style={{
        pointerEvents: "auto",
      }}
      aria-live="polite"
    >
      <div
        className="relative flex w-full items-center gap-2.5 border border-border bg-background/95 p-1.5 pr-8 shadow-md backdrop-blur-md"
      >
        <Link to={item.to} className="shrink-0">
          <img
            src={item.image}
            alt={item.title}
            className="h-11 w-11 object-cover"
            loading="lazy"
            decoding="async"
          />
        </Link>
        <div className="min-w-0">
          <p className="truncate text-[10px] text-muted-foreground">
            {item.name} from {item.city}
          </p>
          <Link
            to={item.to}
            className="block truncate font-cormorant text-[14px] leading-snug text-foreground"
          >
            just bought the {item.title}
          </Link>
          <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            {item.minutes === 1 ? "1 min ago" : `${item.minutes} mins ago`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            snoozeUntil.current = Date.now() + SNOOZE;
          }}
          aria-label="Dismiss notification"
          className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center text-muted-foreground"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
};

export default FomoPopup;
