import { useId, useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatMoney } from "./offers";
import { ORDER_STAGES, orderProgress, type StageIndex } from "./orderStages";

/**
 * OrderVine — the member's orders, each drawn as a vine growing along the four
 * steps of its journey (placed · being made · on its way · yours).
 *
 * Reads member_orders. That table's RLS returns only the signed-in member's own
 * rows; the .eq("user_id") below is belt-and-braces on top of it, not the thing
 * keeping other members' orders out.
 */

const velista = { fontFamily: "var(--nf-font-display), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "var(--nf-font-editorial), 'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "var(--nf-font-label), 'Jost', 'Inter', sans-serif" } as const;

const INK = "#1A1614";
const GOLD = "#B0843A";
const SAGE = "#99B4AF";

type OrderRow = {
  id: string;
  created_at: string;
  items: unknown;
  item_count: number;
  total: number;
  currency: string;
  checkout_url: string | null;
  status: string;
};

type OrderItem = { name?: string; quantity?: number; size?: string | null; price?: string };

const readItems = (raw: unknown): OrderItem[] =>
  Array.isArray(raw) ? raw.filter((i): i is OrderItem => !!i && typeof i === "object") : [];

const itemLine = (item: OrderItem, index: number) =>
  `${item.name?.trim() || `Piece ${index + 1}`}${item.size ? ` · ${item.size}` : ""}${
    Number(item.quantity) > 1 ? ` × ${item.quantity}` : ""
  }`;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

/* ── the vine ─────────────────────────────────────────────────────────────
   One gentle stem across four buds. The reached length is a second copy of the
   same path, revealed by a clip rect that is scaled on the x axis — transform
   only, so the growth never touches layout or paint. */

const BUDS = [40, 120, 200, 280];
/** How far along the stem each step reaches, as a fraction of the viewBox. */
const REACH: Record<StageIndex, number> = { 0: 0.2, 1: 0.45, 2: 0.7, 3: 1 };
const STEM =
  "M6 34C20 32 28 30 40 30C64 30 84 18 120 18C156 18 176 30 200 30C232 30 250 16 280 16C296 16 304 12 314 10";
const BUD_Y = [30, 18, 30, 16];

const Vine = ({ stage }: { stage: StageIndex }) => {
  const clipId = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 320 44" className="mt-3 block h-11 w-full" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <rect
            className="nf-vine-grow"
            x="0"
            y="0"
            width="320"
            height="44"
            style={{ transform: `scaleX(${REACH[stage]})`, transformBox: "view-box", transformOrigin: "0 0" }}
          />
        </clipPath>
      </defs>

      {/* the stem still to come */}
      <path d={STEM} fill="none" stroke={INK} strokeOpacity="0.14" strokeWidth="1.1" strokeLinecap="round" />
      {/* the stem already grown */}
      <g clipPath={`url(#${clipId})`}>
        <path d={STEM} fill="none" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {BUDS.map((x, i) => {
        const y = BUD_Y[i];
        if (i > stage) return <circle key={x} cx={x} cy={y} r="3" fill="none" stroke={INK} strokeOpacity="0.18" />;
        return (
          <g
            key={x}
            className="nf-bud"
            style={{ transformBox: "view-box", transformOrigin: `${x}px ${y}px`, animationDelay: `${i * 70}ms` }}
          >
            <circle cx={x} cy={y} r="7.5" fill={GOLD} fillOpacity="0.14" />
            {i === stage && (
              <>
                <ellipse cx={x - 6} cy={y + 4} rx="5" ry="2.2" fill={SAGE} fillOpacity="0.5" transform={`rotate(-24 ${x - 6} ${y + 4})`} />
                <ellipse cx={x + 6} cy={y + 4} rx="5" ry="2.2" fill={SAGE} fillOpacity="0.5" transform={`rotate(24 ${x + 6} ${y + 4})`} />
              </>
            )}
            <circle cx={x} cy={y} r="3.4" fill={GOLD} />
          </g>
        );
      })}
    </svg>
  );
};

const StageLabels = ({ stage }: { stage: StageIndex }) => (
  <ol className="mt-1 grid grid-cols-4 text-center">
    {ORDER_STAGES.map((s, i) => (
      <li
        key={s.key}
        className="px-0.5 text-[9px] leading-[1.3] tracking-[0.06em]"
        /* The four stage names say where a piece is, so all four have to be
               readable. 40 measured 1.7:1 -- "Yours" was a ghost. Raised to
               99/73, which keeps done > still-to-come > current-in-gold. */
        style={{ ...jost, color: i === stage ? GOLD : i < stage ? `${INK}99` : `${INK}73` }}
        aria-current={i === stage ? "step" : undefined}
      >
        {s.label}
      </li>
    ))}
  </ol>
);

const OrderCard = ({ order }: { order: OrderRow }) => {
  const progress = orderProgress(order.status);
  const items = readItems(order.items);
  const shown = items.slice(0, 4);
  const rest = items.slice(4);
  const count = order.item_count || items.length;

  return (
    <li className="border border-[#1A1614]/10 bg-[#FFFBF7] p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[10px] tracking-[0.22em] text-[#1A1614]/50" style={jost}>
          {formatDate(order.created_at)}
        </p>
        <p className="text-[15px] font-medium tabular-nums text-[#1A1614]" style={jost}>
          {formatMoney(Number(order.total), order.currency)}
        </p>
      </div>

      <p className="mt-3 text-[17px] leading-tight text-[#1A1614]" style={velista}>
        {progress.closed ? "Stopped" : progress.label}
      </p>
      <p className="mt-1 text-[13.5px] italic leading-[1.5] text-[#1A1614]/65" style={editorial}>
        {progress.note}
      </p>

      {!progress.closed && (
        <>
          <Vine stage={progress.stage} />
          <StageLabels stage={progress.stage} />
        </>
      )}

      {!progress.known && (
        <p className="mt-2 text-[9px] tracking-[0.2em] text-[#1A1614]/35" style={jost}>
          STATUS: {String(order.status).toUpperCase().slice(0, 40)}
        </p>
      )}

      {order.checkout_url && progress.unfinished && (
        <a
          href={order.checkout_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-11 items-end border-b border-[#B0843A] pb-1 text-[10px] tracking-[0.28em] text-[#8A6A2F]"
          style={jost}
        >
          FINISH THIS CHECKOUT →
        </a>
      )}

      <p className="mt-4 text-[10px] tracking-[0.22em] text-[#1A1614]/40" style={jost}>
        {count} {count === 1 ? "PIECE" : "PIECES"}
      </p>
      {shown.length > 0 && (
        <ul className="mt-1.5 space-y-1">
          {shown.map((item, i) => (
            <li key={i} className="text-[13px] leading-[1.45] text-[#1A1614]/75" style={editorial}>
              {itemLine(item, i)}
            </li>
          ))}
        </ul>
      )}
      {rest.length > 0 && (
        <details className="mt-1">
          <summary
            className="cursor-pointer list-none py-1 text-[10px] tracking-[0.24em] text-[#8A6A2F]"
            style={jost}
          >
            <span className="nf-more">+ {rest.length} MORE</span>
            <span className="nf-less">SHOW FEWER</span>
          </summary>
          <ul className="mt-1.5 space-y-1">
            {rest.map((item, i) => (
              <li key={i} className="text-[13px] leading-[1.45] text-[#1A1614]/75" style={editorial}>
                {itemLine(item, i + shown.length)}
              </li>
            ))}
          </ul>
        </details>
      )}
    </li>
  );
};

const Shell = ({ children }: { children: ReactNode }) => (
  <section className="nf-orders relative">
    <style>{`
      @keyframes nf-vine-grow { from { transform: scaleX(0); } }
      @keyframes nf-bud-open { from { transform: scale(.5); opacity: 0; } }
      .nf-vine-grow { animation: nf-vine-grow 280ms ease-out both; }
      .nf-bud { animation: nf-bud-open 240ms ease-out both; }
      .nf-orders summary::-webkit-details-marker { display: none; }
      .nf-orders .nf-less { display: none; }
      .nf-orders details[open] .nf-more { display: none; }
      .nf-orders details[open] .nf-less { display: inline; }
      @media (prefers-reduced-motion: reduce) {
        .nf-vine-grow, .nf-bud { animation: none; }
      }
    `}</style>
    <header>
      <p className="text-[9px] tracking-[0.4em] text-[#B0843A]" style={jost}>
        ORDER TRACKING
      </p>
      <h2 className="mt-2 text-[22px] leading-tight text-[#1A1614]" style={velista}>
        Where your pieces are
      </h2>
    </header>
    <div className="mt-5">{children}</div>
  </section>
);

const Quiet = ({ children }: { children: ReactNode }) => (
  <p className="text-[15px] italic leading-[1.6] text-[#1A1614]/65" style={editorial}>
    {children}
  </p>
);

const OrderVine = () => {
  const { user, loading } = useAuth();
  const userId = user?.id ?? null;

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ["member-orders", userId],
    enabled: !!userId,
    staleTime: 1000 * 30,
    queryFn: async (): Promise<OrderRow[]> => {
      const { data: rows, error } = await supabase
        .from("member_orders")
        .select("id, created_at, items, item_count, total, currency, checkout_url, status")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (rows ?? []) as OrderRow[];
    },
  });

  const orders = useMemo(() => data ?? [], [data]);

  if (loading || (userId && isPending)) {
    return (
      <Shell>
        <Loader2 className="animate-spin text-[#B0843A] motion-reduce:animate-none" size={16} aria-label="Loading your orders" />
      </Shell>
    );
  }

  if (!userId) {
    return (
      <Shell>
        <Quiet>Sign in and your orders will be waiting here.</Quiet>
      </Shell>
    );
  }

  if (isError) {
    return (
      <Shell>
        <Quiet>
          We couldn't reach your orders just now. Nothing is lost — it's only this page that can't see
          them.
        </Quiet>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="mt-4 border-b border-[#B0843A] pb-1 text-[10px] tracking-[0.28em] text-[#8A6A2F] disabled:opacity-50"
          style={jost}
        >
          {isFetching ? "TRYING AGAIN…" : "TRY AGAIN"}
        </button>
        <p className="mt-4 text-[13px] italic text-[#1A1614]/50" style={editorial}>
          Still nothing? Write to us and we'll look it up by hand.
        </p>
      </Shell>
    );
  }

  if (orders.length === 0) {
    return (
      <Shell>
        <Quiet>
          Nothing on its way yet. The first piece you order will grow its own vine here, from placed to
          yours.
        </Quiet>
        <Link
          to="/jewellery"
          className="mt-4 inline-block border-b border-[#B0843A] pb-1 text-[10px] tracking-[0.28em] text-[#8A6A2F]"
          style={jost}
        >
          BROWSE THE JEWELLERY
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <ul className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </ul>
    </Shell>
  );
};

export default OrderVine;
