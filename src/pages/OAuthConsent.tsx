import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
};

const oauth = () => (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error: detailsError } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (detailsError) {
        setError(detailsError.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    const { data, error: decisionError } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (decisionError) {
      setBusy(false);
      setError(decisionError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  };

  const clientName = details?.client?.name ?? "this application";

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#FBF3EC] px-6 py-16 text-[#1A1614]">
      <section className="w-full max-w-md text-center">
        <p className="text-[10px] tracking-[0.45em] text-[#B0843A]" style={jost}>
          NAIRA FLORE
        </p>

        {error ? (
          <>
            <h1 className="mt-4 text-[clamp(1.6rem,5vw,2.4rem)] leading-[1.1]" style={velista}>
              Something went wrong
            </h1>
            <p className="mt-4 text-[13px] leading-[1.7] text-[#1A1614]/65" style={jost}>
              {error}
            </p>
          </>
        ) : !details ? (
          <p className="mt-8 inline-flex items-center gap-2 text-[12px] text-[#1A1614]/60" style={jost}>
            <Loader2 size={14} className="animate-spin" /> Loading authorization request…
          </p>
        ) : (
          <>
            <h1 className="mt-4 text-[clamp(1.8rem,6vw,2.8rem)] leading-[1.08]" style={velista}>
              Connect {clientName}
            </h1>
            <p className="mt-4 text-[13px] leading-[1.7] text-[#1A1614]/65" style={jost}>
              {clientName} is asking to use your Naira Flore account. It will be able to browse the
              catalogue and read your profile and orders as you.
            </p>
            <div className="mt-9 space-y-3">
              <button
                disabled={busy}
                onClick={() => decide(true)}
                className="w-full bg-[#1A1614] px-6 py-4 text-[11px] uppercase tracking-[0.32em] text-[#FFF8F5] disabled:opacity-70"
                style={jost}
              >
                Approve
              </button>
              <button
                disabled={busy}
                onClick={() => decide(false)}
                className="w-full border border-[#1A1614]/20 px-6 py-4 text-[11px] uppercase tracking-[0.28em] text-[#1A1614] transition-colors hover:bg-[#1A1614]/[0.04] disabled:opacity-70"
                style={jost}
              >
                Deny
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default OAuthConsent;
