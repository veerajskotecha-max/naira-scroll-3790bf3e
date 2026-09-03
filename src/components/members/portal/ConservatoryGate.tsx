import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { joinInnerCircle } from "@/lib/innerCircle";
import PetalCanvas from "./PetalCanvas";
import {
  BLOOM_MS,
  COOLDOWN_MS,
  cooldownRemaining,
  noticeFor,
  parseEmail,
  parseName,
} from "./gateLogic";

/* ───────────────────────────────────────────────────────────────
   THE CONSERVATORY GATE
   Sign in · email me a link · join. Plus the panel a member lands on
   when they follow a recovery link, where they choose a password.

   No plaintext password is ever sent anywhere but Supabase Auth, and
   none is logged, stored or rendered. There is no path here — and
   there must never be one — that mails a member their password:
   Supabase keeps bcrypt hashes, so it does not exist to be sent. A
   member who cannot get in is sent a one-time link instead.

   The gate never says whether an address is registered. Every
   link/reset attempt answers with the same sentence.
   ─────────────────────────────────────────────────────────────── */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

type Mode = "signin" | "link" | "join" | "setpass";

const TABS: { id: Mode; label: string }[] = [
  { id: "signin", label: "Sign in" },
  { id: "link", label: "Email me a link" },
  { id: "join", label: "Join" },
];

const CTA: Record<Mode, string> = {
  signin: "Open the door",
  link: "Send my link",
  join: "Request an invitation",
  setpass: "Save my password",
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B0843A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF3EC]";
const field =
  "w-full border-b border-[#1A1614]/15 bg-transparent px-1 py-3 text-[13px] text-[#1A1614] outline-none placeholder:text-[#1A1614]/35 focus:border-[#B0843A] focus-visible:border-[#B0843A]";

const ConservatoryGate = ({
  onUnlocked,
  redirectTo,
}: {
  /** Called once the petals have bloomed. Awaited, so the parent can hold
      the gate in place while it brings the portal in. */
  onUnlocked?: () => void | Promise<void>;
  /** Where the emailed link lands. Defaults to the current page. */
  redirectTo?: string;
}) => {
  const { session, loading } = useAuth();
  const ids = useId();
  const [mode, setMode] = useState<Mode>("signin");
  const [phase, setPhase] = useState<"gate" | "blooming" | "open">("gate");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const settled = useRef(false);
  const switched = useRef(false);
  const firstField = useRef<HTMLInputElement>(null);

  const left = cooldownRemaining(until, now);
  const landingUrl = () =>
    redirectTo ?? `${window.location.origin}${window.location.pathname}`;

  /* ── cooldown tick ── */
  useEffect(() => {
    if (until <= Date.now()) return;
    const id = window.setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= until) window.clearInterval(id);
    }, 500);
    return () => window.clearInterval(id);
  }, [until]);

  const startCooldown = () => {
    setNow(Date.now());
    setUntil(Date.now() + COOLDOWN_MS);
  };

  /* ── the door opens ── */
  const finish = useCallback(
    async (withBloom: boolean) => {
      setPhase("blooming");
      if (withBloom && !prefersReduced()) await wait(BLOOM_MS);
      setPhase("open");
      await onUnlocked?.();
    },
    [onUnlocked],
  );

  /* A session arriving is the only unlock signal: it covers password sign-in,
     a magic link landing here, and a recovery link once the password is set. */
  useEffect(() => {
    if (loading || phase !== "gate" || mode === "setpass") return;
    if (!settled.current) {
      settled.current = true;
      if (session) void finish(false); // already a member, already signed in
      return;
    }
    if (session) void finish(true);
  }, [loading, session, phase, mode, finish]);

  /* A recovery link signs the member in and lands them here; hold the gate
     open on the "choose a password" panel rather than sailing past it. */
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "PASSWORD_RECOVERY") return;
      setMode("setpass");
      setError(null);
      setNotice("Choose a password and the door stays open next time.");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  /* Card turned — put the caret where the member is now looking. */
  useEffect(() => {
    if (!switched.current) return;
    firstField.current?.focus();
  }, [mode]);

  const turn = (next: Mode) => {
    switched.current = true;
    setMode(next);
    setError(null);
    setNotice(null);
    setPassword("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setNotice(null);

    if (mode === "setpass") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      setBusy(true);
      const { error: saveError } = await supabase.auth.updateUser({ password });
      setPassword(""); // out of memory the moment Supabase has it
      setBusy(false);
      if (saveError) {
        setError("That could not be saved. Please try again.");
        return;
      }
      void finish(true);
      return;
    }

    const parsed = parseEmail(email);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }

    if (mode === "signin") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      setBusy(true);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: parsed.value,
        password,
      });
      setBusy(false);
      /* Never the raw message — "invalid credentials" vs "user not found"
         would tell a stranger who holds an account here. */
      if (signInError) setError(noticeFor("signin", signInError));
      return; // success unlocks through the session effect above
    }

    if (left > 0) return;

    if (mode === "link") {
      setBusy(true);
      /* shouldCreateUser: false — this door is for members who already have
         an account; joining is its own panel. The result is discarded on
         purpose so the reply cannot vary with it. */
      await supabase.auth.signInWithOtp({
        email: parsed.value,
        options: { emailRedirectTo: landingUrl(), shouldCreateUser: false },
      });
      setBusy(false);
      setNotice(noticeFor("magiclink"));
      startCooldown();
      return;
    }

    // join
    const named = parseName(name);
    if (!named.ok) {
      setError(named.message);
      return;
    }
    setBusy(true);
    const joined = await joinInnerCircle({
      email: parsed.value,
      name: named.value,
      source: "inner-circle-gate",
    });
    if (!joined.ok) {
      setBusy(false);
      setError(joined.message);
      return;
    }
    await supabase.auth.signInWithOtp({
      email: parsed.value,
      options: {
        emailRedirectTo: landingUrl(),
        shouldCreateUser: true,
        data: { full_name: named.value || null },
      },
    });
    setBusy(false);
    setNotice(noticeFor("join"));
    startCooldown();
  };

  const sendReset = async () => {
    setError(null);
    setNotice(null);
    const parsed = parseEmail(email);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }
    if (left > 0 || busy) return;
    setBusy(true);
    await supabase.auth.resetPasswordForEmail(parsed.value, { redirectTo: landingUrl() });
    setBusy(false);
    setNotice(noticeFor("reset"));
    startCooldown();
  };

  const sends = mode === "link" || mode === "join"; // the two panels that post email
  const waiting = sends && left > 0;
  const label = busy ? "One moment…" : waiting ? `Again in ${left}s` : CTA[mode];

  return (
    <div
      data-phase={phase}
      className="relative isolate mx-auto w-full max-w-md overflow-hidden px-6 py-14 text-center md:py-16"
    >
      <style>{`
        @keyframes gate-turn {
          from { opacity: 0; transform: perspective(1200px) rotateY(-14deg) translateZ(-40px); }
          to   { opacity: 1; transform: perspective(1200px) rotateY(0deg) translateZ(0); }
        }
        .gate-card { animation: gate-turn .55s cubic-bezier(.16,1,.3,1) both; transform-origin: left center; }
        [data-phase="blooming"] .gate-card,
        [data-phase="open"] .gate-card { opacity: 0; transform: scale(1.04); transition: opacity .5s ease, transform .7s ease; }
        @media (prefers-reduced-motion: reduce) {
          .gate-card { animation: none; }
          [data-phase="blooming"] .gate-card,
          [data-phase="open"] .gate-card { transition: none; }
        }
      `}</style>

      <PetalCanvas blooming={phase !== "gate"} className="absolute inset-0 -z-10 h-full w-full" />

      {/* the door itself */}
      <div className="pointer-events-none absolute inset-x-2 inset-y-0 -z-10 rounded-t-[999px] border border-[#B0843A]/20" />

      <div key={mode} className="gate-card">
        <p className="text-[10px] tracking-[0.45em] text-[#B0843A]" style={jost}>
          THE INNER CIRCLE
        </p>
        <h2 className="mt-4 text-[clamp(1.9rem,6vw,2.8rem)] leading-[1.05] text-[#1A1614]" style={velista}>
          Step{" "}
          <span className="italic text-[#B0843A]" style={editorial}>
            inside.
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-xs text-[1rem] italic leading-[1.6] text-[#1A1614]/65" style={editorial}>
          {mode === "join"
            ? "Leave your name at the door and we will send you the key."
            : mode === "setpass"
              ? "A password of your own, so the door knows you next time."
              : "Your orders, your saved pieces, and first sight of every collection."}
        </p>

        {mode !== "setpass" && (
          <div className="mt-8 flex items-center justify-center gap-1" role="group" aria-label="How would you like to enter?">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => turn(t.id)}
                aria-pressed={mode === t.id}
                className={`border-b px-3 pb-2 text-[10px] tracking-[0.24em] transition-colors ${focusRing} ${
                  mode === t.id
                    ? "border-[#B0843A] text-[#8A6A2F]"
                    : "border-transparent text-[#1A1614]/45 hover:text-[#1A1614]/75"
                }`}
                style={jost}
              >
                {t.label.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} aria-busy={busy} className="mt-7 space-y-5 text-left">
          {mode === "join" && (
            <div>
              <label htmlFor={`${ids}-name`} className="text-[10px] tracking-[0.3em] text-[#1A1614]/45" style={jost}>
                YOUR NAME
              </label>
              <input
                id={`${ids}-name`}
                ref={mode === "join" ? firstField : undefined}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                maxLength={80}
                className={field}
                style={jost}
              />
            </div>
          )}

          {mode !== "setpass" && (
            <div>
              <label htmlFor={`${ids}-email`} className="text-[10px] tracking-[0.3em] text-[#1A1614]/45" style={jost}>
                EMAIL ADDRESS
              </label>
              <input
                id={`${ids}-email`}
                ref={mode === "join" ? undefined : firstField}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                autoComplete="email"
                maxLength={255}
                className={field}
                style={jost}
              />
            </div>
          )}

          {(mode === "signin" || mode === "setpass") && (
            <div>
              <label htmlFor={`${ids}-pw`} className="text-[10px] tracking-[0.3em] text-[#1A1614]/45" style={jost}>
                {mode === "setpass" ? "NEW PASSWORD" : "PASSWORD"}
              </label>
              <input
                id={`${ids}-pw`}
                ref={mode === "setpass" ? firstField : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                autoComplete={mode === "setpass" ? "new-password" : "current-password"}
                minLength={6}
                maxLength={72}
                className={field}
                style={jost}
              />
            </div>
          )}

          {/* Announced the moment they change, without moving focus. Always
              present so a screen reader is already watching them. */}
          <div className="min-h-[1.1rem] leading-[1.1rem]">
            <p role="alert" className="text-[11px] text-[#A44A34]" style={jost}>
              {error}
            </p>
            <p role="status" aria-live="polite" className="text-[11px] text-[#4B7A63]" style={jost}>
              {notice}
            </p>
          </div>

          <button
            type="submit"
            disabled={busy || waiting}
            className={`group relative block w-full overflow-hidden bg-[#1A1614] px-6 py-4 text-center disabled:opacity-60 ${focusRing}`}
          >
            <span className="absolute inset-0 translate-y-full bg-[#99B4AF] transition-transform duration-500 ease-out group-hover:translate-y-0 motion-reduce:transition-none" />
            <span
              className="relative inline-flex items-center justify-center gap-2 text-[11px] font-light uppercase tracking-[0.32em] text-[#FFF8F5]"
              style={jost}
            >
              {busy && <Loader2 size={13} className="animate-spin" aria-hidden />}
              {label}
            </span>
          </button>
        </form>

        {mode === "signin" && (
          <button
            type="button"
            onClick={sendReset}
            disabled={busy || left > 0}
            className={`mt-6 border-b border-[#B0843A]/50 pb-1 text-[10px] tracking-[0.28em] text-[#8A6A2F] disabled:opacity-50 ${focusRing}`}
            style={jost}
          >
            {left > 0 ? `AGAIN IN ${left}S` : "FORGOTTEN YOUR PASSWORD?"}
          </button>
        )}

        {mode === "setpass" && (
          <button
            type="button"
            onClick={() => void finish(true)}
            className={`mt-6 border-b border-[#B0843A]/50 pb-1 text-[10px] tracking-[0.28em] text-[#8A6A2F] ${focusRing}`}
            style={jost}
          >
            SKIP FOR NOW
          </button>
        )}
      </div>
    </div>
  );
};

export default ConservatoryGate;
