import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, AlertTriangle, ArrowUpRight, RefreshCw } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { isSlowPage } from "@/lib/shopperPerformance";

type Page = { path: string; device: string; navigation: string; samples: number; ready_p75: number | null; load_p75: number | null; lcp_p75: number | null };
type Issue = { path: string; landing_path: string; campaign: string; source: string; kind: string; occurrences: number; last_seen: string };
type Report = { samples: number; pages: Page[]; issues: Issue[]; latest: string | null };
const seconds = (ms: number | null) => ms === null ? "—" : `${(ms / 1000).toFixed(2)} s`;
const names: Record<string, string> = { missing_product: "Missing product", unknown_page: "Unknown page", product_load_error: "Product lookup failed", route_timeout: "Page not ready after 15 s" };

export default function PerformanceDashboard() {
  const { session, loading } = useAuth();
  const [days, setDays] = useState(7);
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [denied, setDenied] = useState(false);
  const refresh = useCallback(async () => {
    if (!session) return;
    setBusy(true); setError(""); setReport(null); setDenied(false);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopper-performance?days=${days}`, {
        headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      if (response.status === 403) { setDenied(true); return; }
      if (!response.ok) throw new Error("The report could not load. Please try again.");
      setReport(await response.json());
    } catch { setError("The report could not load. Please try again."); }
    finally { setBusy(false); }
  }, [session, days]);
  useEffect(() => { void refresh(); }, [refresh]);
  const slow = report?.pages.filter(p => /^\/(?:jewellery|products|product)\/[^/]+$/.test(p.path) && isSlowPage(p)) ?? [];
  return (
    <main className="nf-palette min-h-screen bg-nf-ivory text-nf-ink pt-[113px] md:pt-[126px] lg:pt-[136px] pb-20 px-4 md:px-8">
      <Helmet><title>Performance | Naira Flore</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <div className="mx-auto max-w-[1200px]">
        <div className="border-b border-border pb-6 flex flex-wrap justify-between items-end gap-4">
          <div><p className="text-sm text-muted-foreground mb-2">Naira Flore · Private</p><h1 className="font-cormorant text-4xl">Shopper performance</h1></div>
          {session && !denied && <div className="flex items-center gap-2"><label className="sr-only" htmlFor="report-range">Time range</label><select id="report-range" value={days} onChange={e => setDays(Number(e.target.value))} className="h-10 border border-input bg-background px-3 text-sm"><option value={1}>Last 24 hours</option><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option></select><Button variant="outline" size="icon" aria-label="Refresh report" title="Refresh report" onClick={refresh} disabled={busy}><RefreshCw className={busy ? "animate-spin" : ""} /></Button></div>}
        </div>
        {loading ? <p className="py-12" role="status">Loading…</p> : !session ? <div className="py-12"><p className="mb-4">Sign in with your administrator account.</p><Button asChild><Link to="/auth">Sign in</Link></Button></div> : denied ? <p className="py-12">This page is only available to administrators.</p> : <>
          {error && <p role="alert" className="py-6 text-destructive">{error}</p>}
          {busy && <p role="status" className="py-6 text-muted-foreground">Loading measurements…</p>}
          {report && <>
            <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border py-8 gap-8">
              {[{ title: "Measured page visits", value: report.samples, icon: Activity }, { title: "Slow product page groups", value: slow.length, icon: AlertTriangle }, { title: "Link & loading issues", value: report.issues.reduce((n, i) => n + Number(i.occurrences), 0), icon: ArrowUpRight }].map(({ title, value, icon: Icon }) => <div key={title}><div className="text-sm text-muted-foreground flex gap-2 items-center"><Icon size={16} />{title}</div><p className="font-cormorant text-4xl mt-3">{value}</p></div>)}
            </div>
            {report.samples === 0 && <p className="py-8 text-muted-foreground">No shopper timings yet. Measurements start after the website update is published.</p>}
            <section className="py-8"><h2 className="font-cormorant text-2xl mb-2">Slow product pages</h2><p className="text-sm text-muted-foreground mb-5">75th-percentile page readiness above 3 s or largest content paint above 4 s. Small samples are provisional.</p><PageTable pages={slow} empty="No slow product pages recorded." /></section>
            <section className="py-8 border-t border-border"><h2 className="font-cormorant text-2xl mb-5">Campaign links & loading failures</h2>{!report.issues.length ? <p className="text-sm text-muted-foreground">No issues recorded.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-border text-muted-foreground"><tr>{["Page / landing", "Issue", "Campaign", "Reports", "Last seen"].map(t => <th key={t} className="py-3 pr-5 font-normal">{t}</th>)}</tr></thead><tbody>{report.issues.map((i, n) => <tr key={n} className="border-b border-border"><td className="py-4 pr-5 max-w-xs break-words">{i.path}<p className="text-xs text-muted-foreground mt-1">From {i.landing_path}</p></td><td className="pr-5">{names[i.kind]}</td><td className="pr-5">{i.campaign || "Unlabelled"}<p className="text-xs text-muted-foreground">{i.source}</p></td><td className="pr-5">{i.occurrences}</td><td className="whitespace-nowrap">{new Date(i.last_seen).toLocaleString("en-IN")}</td></tr>)}</tbody></table></div>}</section>
            <section className="py-8 border-t border-border"><h2 className="font-cormorant text-2xl mb-5">All measured pages</h2><PageTable pages={report.pages} empty="No page measurements yet." /></section>
            <p className="text-xs text-muted-foreground border-t border-border pt-5">Anonymous browser reports · Last 30 days retained · No customer details or checkout links collected. {report.latest && `Latest report: ${new Date(report.latest).toLocaleString("en-IN")}`}</p>
          </>}
        </>}
      </div>
    </main>
  );
}
function PageTable({ pages, empty }: { pages: Page[]; empty: string }) {
  if (!pages.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-muted-foreground border-b border-border"><tr>{["Page", "Device / visit", "Samples", "Ready p75", "Load p75", "LCP p75"].map(t => <th key={t} className="py-3 pr-5 font-normal whitespace-nowrap">{t}</th>)}</tr></thead><tbody>{pages.map(p => <tr key={`${p.path}-${p.device}-${p.navigation}`} className="border-b border-border"><td className="py-4 pr-5 max-w-xs break-words"><Link to={p.path} className="underline underline-offset-4">{p.path}</Link></td><td className="pr-5">{p.device} · {p.navigation}</td><td className="pr-5">{p.samples}{p.samples < 5 && <span className="block text-xs text-muted-foreground">Low sample</span>}</td><td className="pr-5 whitespace-nowrap">{seconds(p.ready_p75)}</td><td className="pr-5 whitespace-nowrap">{seconds(p.load_p75)}</td><td className="whitespace-nowrap">{seconds(p.lcp_p75)}</td></tr>)}</tbody></table></div>;
}