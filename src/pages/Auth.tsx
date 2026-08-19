import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import PageSEO from "@/components/PageSEO";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { joinInnerCircle } from "@/lib/innerCircle";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const credentials = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(72),
  name: z.string().trim().max(80).optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) navigate("/account", { replace: true });
  }, [loading, session, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const parsed = credentials.safeParse({ email, password, name });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/account`,
          data: { full_name: parsed.data.name || null },
        },
      });
      if (signUpError) {
        setBusy(false);
        setError(signUpError.message);
        return;
      }
      await joinInnerCircle({
        email: parsed.data.email,
        name: parsed.data.name,
        source: "member-signup",
        userId: data.user?.id ?? null,
      });
      if (data.user && parsed.data.name) {
        await supabase.from("profiles").upsert({ id: data.user.id, full_name: parsed.data.name });
      }
      setBusy(false);
      if (!data.session) {
        setNotice("Almost there — check your email to confirm your account.");
        return;
      }
      navigate("/account", { replace: true });
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate("/account", { replace: true });
  };

  const google = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in could not start. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate("/account", { replace: true });
  };

  const field =
    "w-full border-b border-[#1A1614]/15 bg-transparent px-1 py-3 text-[13px] text-[#1A1614] outline-none placeholder:text-[#1A1614]/40 focus:border-[#B0843A]";

  return (
    <>
      <PageSEO
        title="Members Sign In | Naira Flore"
        description="Sign in to your Naira Flore account for order history, saved pieces and Inner Circle access to pre-launch jewellery."
        canonical="https://nairaflore.com/auth"
      />
      <main className="min-h-[100svh] bg-[#FBF3EC] pt-[110px] text-[#1A1614] md:pt-[130px]">
        <section className="mx-auto flex max-w-md flex-col items-center px-6 py-14 text-center md:py-20">
          <p className="text-[10px] tracking-[0.45em] text-[#B0843A]" style={jost}>
            NAIRA FLORE MEMBERS
          </p>
          <h1 className="mt-4 text-[clamp(2rem,7vw,3.2rem)] leading-[1.05]" style={velista}>
            {mode === "signin" ? "Welcome " : "Become a "}
            <span className="italic text-[#B0843A]" style={editorial}>
              {mode === "signin" ? "back." : "member."}
            </span>
          </h1>
          <p className="mt-4 max-w-sm text-[1rem] italic leading-[1.6] text-[#1A1614]/65" style={editorial}>
            Your orders, your saved pieces, and first sight of every collection before it opens.
          </p>

          <form onSubmit={submit} className="mt-9 w-full space-y-4 text-left">
            {mode === "signup" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={80}
                className={field}
                style={jost}
              />
            )}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
              placeholder="Email address"
              maxLength={255}
              className={field}
              style={jost}
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="Password"
              maxLength={72}
              className={field}
              style={jost}
            />
            {error && (
              <p className="text-[11px] text-[#A44A34]" style={jost}>
                {error}
              </p>
            )}
            {notice && (
              <p className="text-[11px] text-[#4B7A63]" style={jost}>
                {notice}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="group relative block w-full overflow-hidden bg-[#1A1614] px-6 py-4 text-center disabled:opacity-70"
            >
              <span className="absolute inset-0 translate-y-full bg-[#99B4AF] transition-transform duration-500 ease-out group-hover:translate-y-0" />
              <span
                className="relative inline-flex items-center justify-center gap-2 text-[11px] font-light uppercase tracking-[0.32em] text-[#FFF8F5]"
                style={jost}
              >
                {busy && <Loader2 size={13} className="animate-spin" />}
                {mode === "signin" ? "Sign in" : "Create my account"}
              </span>
            </button>
          </form>

          <div className="my-6 flex w-full items-center gap-3">
            <span className="h-px flex-1 bg-[#1A1614]/10" />
            <span className="text-[10px] tracking-[0.3em] text-[#1A1614]/40" style={jost}>
              OR
            </span>
            <span className="h-px flex-1 bg-[#1A1614]/10" />
          </div>

          <button
            onClick={google}
            className="w-full border border-[#1A1614]/20 px-6 py-4 text-[11px] uppercase tracking-[0.28em] text-[#1A1614] transition-colors hover:bg-[#1A1614]/[0.04]"
            style={jost}
          >
            Continue with Google
          </button>

          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setNotice(null);
            }}
            className="mt-8 border-b border-[#B0843A] pb-1 text-[10px] tracking-[0.3em] text-[#8A6A2F]"
            style={jost}
          >
            {mode === "signin" ? "REGISTER NOW" : "I ALREADY HAVE AN ACCOUNT"}
          </button>

          <Link to="/innercircle" className="mt-6 text-[10px] tracking-[0.3em] text-[#1A1614]/45" style={jost}>
            ABOUT THE INNER CIRCLE
          </Link>
        </section>
        <Footer />
      </main>
    </>
  );
};

export default Auth;
