import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { JewelPiece } from "@/data/jewellery";
import { useAuth } from "@/contexts/AuthContext";
import MemberTier from "./MemberTier";
import { lifetimeSpend } from "./tiers";

const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

/*
  The four panels are built by other hands and land at different times.
  import.meta.glob is resolved at build time against the files that actually
  exist, so a panel nobody has written yet is a missing key here rather than an
  unresolved import that fails `vite build`. Both plausible homes are globbed —
  this folder and the members folder above it — so wherever a panel lands it is
  picked up without another edit.
*/
const PANEL_MODULES = {
  ...import.meta.glob("./{ConservatoryGate,OrderVine,ThreeForTwenty,PieceViewer}.tsx"),
  ...import.meta.glob("../{ConservatoryGate,OrderVine,ThreeForTwenty,PieceViewer}.tsx"),
} as Record<string, () => Promise<unknown>>;

export type PanelName = "ConservatoryGate" | "OrderVine" | "ThreeForTwenty" | "PieceViewer";

type AnyPanel = ComponentType<Record<string, unknown>>;
const loaded = new Map<PanelName, AnyPanel | null>();

const resolvePanel = (name: PanelName): AnyPanel | null => {
  if (!loaded.has(name)) {
    const load = PANEL_MODULES[`./${name}.tsx`] ?? PANEL_MODULES[`../${name}.tsx`];
    loaded.set(name, load ? lazy(load as () => Promise<{ default: AnyPanel }>) : null);
  }
  return loaded.get(name) ?? null;
};

/** A cutting of the conservatory vine, used to dress the waiting states. */
const Sprig = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" aria-hidden focusable="false">
    <path d="M12 110C32 86 52 66 98 22" stroke="#C99A4C" strokeOpacity=".45" strokeWidth="1.1" />
    {[0, 1, 2, 3, 4].map((i) => (
      <ellipse
        key={i}
        cx={26 + i * 16}
        cy={94 - i * 16}
        rx="10.5"
        ry="5"
        transform={`rotate(${-45 + (i % 2 ? 26 : -26)} ${26 + i * 16} ${94 - i * 16})`}
        stroke="#C99A4C"
        strokeOpacity=".4"
        strokeWidth="1"
      />
    ))}
    <circle cx="98" cy="22" r="4" fill="#C99A4C" fillOpacity=".3" />
  </svg>
);

const Frame = ({ label, children }: { label: string; children: ReactNode }) => (
  <section className="relative overflow-hidden border border-[#1A1614]/10 bg-[#FFFBF7] p-6">
    <Sprig className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 opacity-70" />
    <p className="relative text-[9px] tracking-[0.4em] text-[#B0843A]" style={jost}>
      {label}
    </p>
    <div className="relative mt-4">{children}</div>
  </section>
);

/** Loading: three stems of nothing, breathing gently. Still under reduced motion. */
const PanelSkeleton = ({ label }: { label: string }) => (
  <Frame label={label}>
    <div className="animate-pulse space-y-3 motion-reduce:animate-none" aria-hidden>
      <div className="h-3 w-2/3 bg-[#1A1614]/10" />
      <div className="h-3 w-5/6 bg-[#1A1614]/[0.07]" />
      <div className="h-3 w-1/3 bg-[#1A1614]/[0.07]" />
    </div>
    <span className="sr-only">Loading</span>
  </Frame>
);

/** Missing or broken: a quiet note, never a hole and never a stack trace. */
const Tending = ({ label, note }: { label: string; note: string }) => (
  <Frame label={label}>
    <p className="text-[1.02rem] italic leading-[1.55] text-[#1A1614]/60" style={editorial}>
      {note}
    </p>
  </Frame>
);

class PanelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Inner Circle panel failed", error);
  }

  render() {
    return this.state.failed ? <>{this.props.fallback}</> : <>{this.props.children}</>;
  }
}

/**
 * One panel, isolated: absent, still loading, or thrown — none of it can take
 * the rest of the page with it. Rendered bare once it arrives, so the panel
 * owns its own frame.
 */
export const LazyPanel = ({
  name,
  label,
  note,
  fallback,
  props,
}: {
  name: PanelName;
  label: string;
  /** Shown in place of the panel when it is missing or throws. */
  note?: string;
  /** Overrides the note entirely — for a panel with a real standing alternative. */
  fallback?: ReactNode;
  props?: Record<string, unknown>;
}) => {
  const Panel = resolvePanel(name);
  const missing = fallback ?? <Tending label={label} note={note ?? "This corner is being tended. Back shortly."} />;
  if (!Panel) return <>{missing}</>;
  return (
    <PanelBoundary fallback={missing}>
      <Suspense fallback={<PanelSkeleton label={label} />}>
        <Panel {...props} />
      </Suspense>
    </PanelBoundary>
  );
};

/*
  The members' offer. Checked against the live store before it was hard-coded:
  FRIENDSANDFAMILY is ACTIVE, 20%, and scoped to Shop All / Necklaces /
  Earrings / Bracelets / Rings — every collection the basket-builder picks
  from — so the 20% the panel quotes is the 20% Shopify charges. The panel
  itself withholds the code until three pieces are in the set; Shopify sets no
  minimum of its own. Replace this the day a dedicated "any three" code exists.
  Both prop names are passed because the panel reads `code` today.
*/
const THREE_FOR_TWENTY_CODE = "FRIENDSANDFAMILY";

type OrderRow = { total: number | null; status: string | null; items: Json };

/** The signed-in portal: the member's standing, their orders, their offer, their pieces. */
const PortalShell = () => {
  const { user, profile, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [catalogue, setCatalogue] = useState<JewelPiece[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    void supabase
      .from("member_orders")
      .select("total, status, items, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      // A wreath that pulses for ever on a dead network is worse than a
      // welcome. Ten seconds, then the member is treated as new.
      .abortSignal(AbortSignal.timeout(10_000))
      .then(({ data, error }) => {
        // A read that fails reads as "nothing yet" — a welcomed new member is a
        // far better wrong answer than a broken panel.
        if (alive) setOrders(error ? [] : ((data as OrderRow[]) ?? []));
      });
    return () => {
      alive = false;
    };
  }, [user]);

  /* PieceViewer has to be handed a piece. The catalogue is ~115KB, so it is
     fetched here, inside the signed-in portal, rather than imported into a
     page that logged-out visitors also load. */
  useEffect(() => {
    let alive = true;
    void import("@/data/jewellery").then((m) => {
      if (alive) setCatalogue(m.jewellery);
    });
    return () => {
      alive = false;
    };
  }, []);

  const spend = orders ? lifetimeSpend(orders) : null;

  /* The last piece they chose, if we still carry it — otherwise the piece the
     house opens with. Never nothing: the panel cannot render without one. */
  const piece = useMemo(() => {
    if (!catalogue?.length) return null;
    const lastName = (orders ?? [])
      .flatMap((o) => (Array.isArray(o.items) ? (o.items as { name?: string }[]) : []))
      .map((i) => i?.name?.trim().toLowerCase())
      .find(Boolean);
    return catalogue.find((j) => j.name.toLowerCase() === lastName) ?? catalogue[0];
  }, [catalogue, orders]);

  const firstName = useMemo(() => {
    const source = profile?.full_name || user?.user_metadata?.full_name || user?.email || "";
    return String(source).split(/[ @]/)[0];
  }, [profile, user]);

  return (
    <div className="mx-auto w-full max-w-2xl animate-in fade-in px-6 pb-20 duration-300 motion-reduce:animate-none">
      <p className="text-center text-[1.05rem] italic leading-[1.6] text-[#1A1614]/70" style={editorial}>
        {firstName ? `Welcome back, ${firstName}.` : "Welcome back."} The glasshouse is yours.
      </p>

      <div className="mt-10 space-y-5">
        <MemberTier spend={spend} />

        <LazyPanel
          name="OrderVine"
          label="YOUR ORDERS"
          note="Your orders are still finding their way onto the vine. They are safe. Write to us any time and we will read them out."
        />

        <LazyPanel
          name="ThreeForTwenty"
          label="MEMBERS' OFFER"
          props={{ code: THREE_FOR_TWENTY_CODE, discountCode: THREE_FOR_TWENTY_CODE }}
          note="Any three pieces, twenty percent off. The basket-builder is being planted. Send us your three on WhatsApp and we will set it up by hand."
        />

        {piece ? (
          <LazyPanel
            name="PieceViewer"
            label="IN THE HAND"
            props={{ piece }}
            note="A closer look at each piece is coming to this corner."
          />
        ) : (
          <PanelSkeleton label="IN THE HAND" />
        )}
      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        <Link
          to="/account"
          className="inline-flex min-h-11 items-end border-b border-[#B0843A] pb-1 text-[10px] tracking-[0.3em] text-[#8A6A2F]"
          style={jost}
        >
          YOUR ACCOUNT →
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="inline-flex min-h-11 items-center text-[10px] tracking-[0.3em] text-[#1A1614]/40"
          style={jost}
        >
          SIGN OUT
        </button>
      </div>
    </div>
  );
};

export default PortalShell;
