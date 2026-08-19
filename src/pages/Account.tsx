import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarHeart,
  Gem,
  Heart,
  Loader2,
  LogOut,
  Package,
  Ruler,
  Sparkles,
  Truck,
} from "lucide-react";
import PageSEO from "@/components/PageSEO";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import JoinInnerCircleForm from "@/components/members/JoinInnerCircleForm";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const WHATSAPP_STYLIST =
  "https://wa.me/919561557935?text=" +
  encodeURIComponent("Hi Naira Flore — I'd like to book a private styling appointment.");

type MemberOrder = {
  id: string;
  created_at: string;
  item_count: number;
  total: number;
  status: string;
  items: { name?: string; quantity?: number; image?: string }[] | null;
};

/* A soft botanical corner used across the portal panels. */
const Sprig = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" aria-hidden>
    <path d="M14 108C34 84 54 64 96 24" stroke="#C99A4C" strokeOpacity=".5" strokeWidth="1.2" />
    {[0, 1, 2, 3, 4].map((i) => (
      <ellipse
        key={i}
        cx={26 + i * 16}
        cy={96 - i * 16}
        rx="11"
        ry="5.5"
        transform={`rotate(${-45 + (i % 2 ? 26 : -26)} ${26 + i * 16} ${96 - i * 16})`}
        stroke="#C99A4C"
        strokeOpacity=".45"
        strokeWidth="1"
      />
    ))}
    <circle cx="96" cy="24" r="4.5" fill="#C99A4C" fillOpacity=".35" />
  </svg>
);

const Panel = ({
  title,
  eyebrow,
  icon,
  children,
  soon = false,
}: {
  title: string;
  eyebrow?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  soon?: boolean;
}) => (
  <section className="relative overflow-hidden border border-[#1A1614]/10 bg-[#FFFBF7] p-6 md:p-7">
    <Sprig className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 opacity-70" />
    <div className="relative flex items-center gap-3">
      <span className="text-[#B0843A]">{icon}</span>
      <div>
        {eyebrow && (
          <p className="text-[9px] tracking-[0.4em] text-[#B0843A]" style={jost}>
            {eyebrow}
          </p>
        )}
        <h2 className="text-[22px] leading-tight" style={velista}>
          {title}
        </h2>
      </div>
      {soon && (
        <span
          className="ml-auto border border-[#C99A4C]/50 px-2 py-1 text-[8px] tracking-[0.28em] text-[#8A6A2F]"
          style={jost}
        >
          COMING SOON
        </span>
      )}
    </div>
    <div className="relative mt-5">{children}</div>
  </section>
);

const Account = () => {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const { totalItems: savedCount, setDrawerOpen: openWishlist } = useWishlist();
  const [orders, setOrders] = useState<MemberOrder[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: "", phone: "", birthday: "", city: "" });

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    setForm({
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      birthday: profile?.birthday ?? "",
      city: profile?.city ?? "",
    });
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("member_orders")
      .select("id, created_at, item_count, total, status, items")
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as MemberOrder[]) ?? []));
  }, [user]);

  const firstName = useMemo(() => {
    const source = profile?.full_name || user?.user_metadata?.full_name || user?.email || "";
    return String(source).split(/[ @]/)[0];
  }, [profile, user]);

  const referral = useMemo(
    () => (user ? `NF-${user.id.replace(/[^a-z0-9]/gi, "").slice(0, 5).toUpperCase()}` : ""),
    [user],
  );

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSavedNote(null);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: form.full_name.trim().slice(0, 80) || null,
      phone: form.phone.trim().slice(0, 20) || null,
      birthday: form.birthday || null,
      city: form.city.trim().slice(0, 60) || null,
    });
    setSaving(false);
    setSavedNote(error ? "Could not save, please try again." : "Saved.");
    if (!error) await refreshProfile();
  };

  const field =
    "w-full border-b border-[#1A1614]/15 bg-transparent px-1 py-2.5 text-[13px] text-[#1A1614] outline-none placeholder:text-[#1A1614]/40 focus:border-[#B0843A]";

  if (loading || !user) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#FBF3EC]">
        <Loader2 className="animate-spin text-[#B0843A]" />
      </main>
    );
  }

  return (
    <>
      <PageSEO
        title="My Naira Flore Account"
        description="Your Naira Flore members portal — order history, saved pieces, Inner Circle pre-launch access and private styling."
        canonical="https://nairaflore.com/account"
        noindex
      />
      <main className="min-h-[100svh] bg-[#FBF3EC] pt-[100px] text-[#1A1614] md:pt-[120px]">
        {/* Greeting */}
        <section className="relative overflow-hidden border-b border-[#1A1614]/10 bg-[#F6EADF]">
          <Sprig className="pointer-events-none absolute -left-6 bottom-[-20px] h-40 w-40 rotate-12 opacity-60" />
          <Sprig className="pointer-events-none absolute right-[-10px] top-[-24px] h-40 w-40 -scale-x-100 opacity-50" />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-12 text-center md:py-16">
            <p className="text-[10px] tracking-[0.45em] text-[#B0843A]" style={jost}>
              THE MEMBERS ROOM
            </p>
            <h1 className="mt-4 text-[clamp(2.1rem,7vw,3.4rem)] leading-[1.05]" style={velista}>
              Hello,{" "}
              <span className="italic text-[#B0843A]" style={editorial}>
                {firstName || "friend"}.
              </span>
            </h1>
            <p className="mt-3 max-w-md text-[1rem] italic text-[#1A1614]/65" style={editorial}>
              Everything of yours, kept in one quiet place.
            </p>
            <button
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="mt-6 inline-flex items-center gap-2 border-b border-[#1A1614]/30 pb-1 text-[10px] tracking-[0.3em] text-[#1A1614]/60"
              style={jost}
            >
              <LogOut size={12} /> SIGN OUT
            </button>
          </div>
        </section>

        <div className="mx-auto grid max-w-5xl gap-5 px-4 py-10 md:grid-cols-2 md:px-6 md:py-14">
          {/* My orders */}
          <Panel title="My orders" eyebrow="YOUR HISTORY" icon={<Package size={18} strokeWidth={1.4} />}>
            {orders === null ? (
              <Loader2 className="animate-spin text-[#B0843A]" size={16} />
            ) : orders.length === 0 ? (
              <div>
                <p className="text-[0.98rem] italic text-[#1A1614]/60" style={editorial}>
                  No orders here yet. The first one will appear the moment you check out.
                </p>
                <Link
                  to="/jewellery"
                  className="mt-4 inline-block border-b border-[#B0843A] pb-1 text-[10px] tracking-[0.3em] text-[#8A6A2F]"
                  style={jost}
                >
                  BROWSE THE JEWELLERY
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {orders.map((o) => (
                  <li key={o.id} className="border border-[#1A1614]/10 bg-[#FBF3EC] p-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[13px]" style={jost}>
                        {new Date(o.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[13px] font-medium" style={jost}>
                        ₹{Number(o.total).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <p className="mt-1 text-[11px] text-[#1A1614]/55" style={jost}>
                      {o.item_count} {o.item_count === 1 ? "piece" : "pieces"} ·{" "}
                      {(o.items ?? [])
                        .map((i) => i?.name)
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(", ") || "Order"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/track-order"
              className="mt-5 inline-flex items-center gap-2 text-[10px] tracking-[0.3em] text-[#1A1614]/55"
              style={jost}
            >
              <Truck size={12} /> TRACK AN ORDER
            </Link>
          </Panel>

          {/* Pre-launch portal */}
          <Panel
            title="The pre-launch room"
            eyebrow="MEMBERS ONLY"
            icon={<Sparkles size={18} strokeWidth={1.4} />}
            soon
          >
            <p className="text-[0.98rem] italic leading-[1.65] text-[#1A1614]/65" style={editorial}>
              The next collection is being finished by hand. Members see it, and can reserve from it,
              a full week before anyone else.
            </p>
            <div className="mt-5">
              <JoinInnerCircleForm
                source="account-prelaunch"
                withName={false}
                cta="Reserve my early access"
              />
            </div>
          </Panel>

          {/* Jewel box */}
          <Panel title="My jewel box" eyebrow="SAVED PIECES" icon={<Heart size={18} strokeWidth={1.4} />}>
            <p className="text-[0.98rem] italic text-[#1A1614]/65" style={editorial}>
              {savedCount > 0
                ? `${savedCount} ${savedCount === 1 ? "piece is" : "pieces are"} waiting in your box.`
                : "Nothing saved yet — tap the heart on any piece to keep it here."}
            </p>
            <button
              onClick={() => openWishlist(true)}
              className="mt-4 border-b border-[#B0843A] pb-1 text-[10px] tracking-[0.3em] text-[#8A6A2F]"
              style={jost}
            >
              OPEN MY JEWEL BOX
            </button>
          </Panel>

          {/* Private styling */}
          <Panel title="Private styling" eyebrow="ONE TO ONE" icon={<Gem size={18} strokeWidth={1.4} />}>
            <p className="text-[0.98rem] italic leading-[1.65] text-[#1A1614]/65" style={editorial}>
              Tell us the occasion and we'll put a small edit together for you — stacking, sizing and
              what pairs with what.
            </p>
            <a
              href={WHATSAPP_STYLIST}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block border-b border-[#B0843A] pb-1 text-[10px] tracking-[0.3em] text-[#8A6A2F]"
              style={jost}
            >
              BOOK AN APPOINTMENT
            </a>
          </Panel>

          {/* Details */}
          <Panel title="My details" eyebrow="YOUR DETAILS" icon={<Ruler size={18} strokeWidth={1.4} />}>
            <form onSubmit={saveProfile} className="space-y-3">
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Full name"
                maxLength={80}
                className={field}
                style={jost}
              />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone"
                maxLength={20}
                className={field}
                style={jost}
              />
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
                maxLength={60}
                className={field}
                style={jost}
              />
              <label className="block text-[10px] tracking-[0.28em] text-[#1A1614]/45" style={jost}>
                BIRTHDAY (FOR YOUR GIFT)
              </label>
              <input
                type="date"
                value={form.birthday}
                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                className={field}
                style={jost}
              />
              <div className="flex items-center gap-4 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-[#1A1614] px-5 py-3 text-[10px] uppercase tracking-[0.3em] text-[#FFF8F5] disabled:opacity-70"
                  style={jost}
                >
                  {saving && <Loader2 size={12} className="animate-spin" />} Save
                </button>
                {savedNote && (
                  <span className="text-[11px] text-[#8A6A2F]" style={jost}>
                    {savedNote}
                  </span>
                )}
              </div>
            </form>
          </Panel>

          {/* Referral + birthday */}
          <Panel
            title="Share the bloom"
            eyebrow="MEMBER REWARDS"
            icon={<CalendarHeart size={18} strokeWidth={1.4} />}
            soon
          >
            <p className="text-[0.98rem] italic leading-[1.65] text-[#1A1614]/65" style={editorial}>
              Your personal code. Share it with a friend — when rewards open, both of you receive a
              members-only gift, and a little something arrives on your birthday.
            </p>
            <p
              className="mt-4 inline-block border border-dashed border-[#C99A4C]/60 px-4 py-2 text-[13px] tracking-[0.3em] text-[#8A6A2F]"
              style={jost}
            >
              {referral}
            </p>
          </Panel>
        </div>
        <Footer />
      </main>
    </>
  );
};

export default Account;
