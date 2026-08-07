import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { useQuery } from "@tanstack/react-query";
import { fetchShopifyProducts } from "@/lib/shopify";

const jost = { fontFamily: "var(--nf-font-label)" } as const;

const RECENT_KEY = "naira-recent-searches";

const cdn = (url: string, w: number) => {
  if (!url?.includes("cdn.shopify.com")) return url;
  const [base, q] = url.split("?");
  const params = new URLSearchParams(q);
  params.set("width", String(w));
  return `${base}?${params.toString()}`;
};

interface Hit {
  key: string;
  title: string;
  caption: string;
  price: string;
  image: string;
  to: string;
}

const POPULAR = ["Rings", "Zircone", "Necklace", "Gifting", "Under 1500"];

/**
 * Instant search over the live catalogue — jewellery pieces and apparel
 * products are indexed client-side by title, category and Shopify tags, so a
 * query resolves without a round trip.
 */
const SearchOverlay = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { jewellery } = useLiveJewellery();
  const { data: apparel } = useQuery({
    queryKey: ["shopify-products", "search-index"],
    queryFn: () => fetchShopifyProducts(100),
    staleTime: 1000 * 60 * 5,
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    setQ("");
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"));
    } catch {
      setRecent([]);
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const index: Hit[] = useMemo(() => {
    const jewels: Hit[] = jewellery.map((p) => ({
      key: `j-${p.handle}`,
      title: p.name,
      caption: `${p.category} · ${(p.tags ?? []).slice(0, 2).join(", ")}`,
      price: p.priceLabel,
      image: p.image,
      to: `/jewellery/${p.handle}`,
    }));
    const jewelHandles = new Set(jewellery.map((p) => p.handle));
    const clothes: Hit[] = (apparel ?? [])
      .filter((n) => !jewelHandles.has(n.handle))
      .map((n) => ({
        key: `p-${n.handle}`,
        title: n.title,
        caption: n.productType || "Indo-Western",
        price: `₹${Math.round(Number(n.priceRange.minVariantPrice.amount)).toLocaleString("en-IN")}`,
        image: n.images.edges[0]?.node.url ?? "",
        to: `/product/${n.handle}`,
      }));
    return [...jewels, ...clothes];
  }, [jewellery, apparel]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    return index
      .filter((h) => `${h.title} ${h.caption}`.toLowerCase().includes(term))
      .slice(0, 8);
  }, [q, index]);

  const remember = (term: string) => {
    const clean = term.trim();
    if (clean.length < 2) return;
    const next = [clean, ...recent.filter((r) => r.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Search">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close search" tabIndex={-1} />
      <div className="relative mx-auto w-full max-w-3xl animate-fade-in bg-[#F4F1ED] p-5 shadow-xl sm:p-7">
        <div className="flex items-center gap-3 border-b border-nf-ink/15 pb-3">
          <Search size={18} strokeWidth={1.5} className="opacity-50" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search rings, necklaces, outfits…"
            className="w-full bg-transparent text-[15px] text-nf-ink placeholder:text-nf-ink/35 focus:outline-none"
            aria-label="Search products"
          />
          <button onClick={onClose} aria-label="Close search" className="p-1 opacity-60 hover:opacity-100">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {results.length > 0 ? (
            <ul className="mt-4 space-y-1">
              {results.map((h) => (
                <li key={h.key}>
                  <Link
                    to={h.to}
                    onClick={() => {
                      remember(q);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-2 transition-colors hover:bg-black/5"
                  >
                    <span className="h-14 w-14 shrink-0 overflow-hidden bg-nf-ivory-deep">
                      {h.image && <img src={cdn(h.image, 120)} alt="" loading="lazy" className="h-full w-full object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] text-nf-ink">{h.title}</span>
                      <span className="block truncate text-[10px] tracking-nf-14 text-nf-ink/45" style={jost}>
                        {h.caption}
                      </span>
                    </span>
                    <span className="text-[13px] text-nf-ink/80" style={{ ...jost, fontVariantNumeric: "tabular-nums" }}>
                      {h.price}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : q.trim().length >= 2 ? (
            <p className="mt-6 text-[13px] text-nf-ink/55">
              Nothing matches “{q.trim()}”. Try a category such as rings or necklaces.
            </p>
          ) : (
            <div className="mt-6 space-y-6">
              {recent.length > 0 && (
                <div>
                  <p className="text-[9px] tracking-[0.28em] text-nf-ink/40" style={jost}>
                    RECENT
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        onClick={() => setQ(r)}
                        className="min-h-[34px] border border-nf-ink/20 px-3 text-[10px] tracking-nf-14 text-nf-ink/65 hover:border-nf-ink"
                        style={jost}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-[9px] tracking-[0.28em] text-nf-ink/40" style={jost}>
                  POPULAR
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {POPULAR.map((p) => (
                    <button
                      key={p}
                      onClick={() => setQ(p)}
                      className="min-h-[34px] border border-nf-ink/20 px-3 text-[10px] tracking-nf-14 text-nf-ink/65 hover:border-nf-ink"
                      style={jost}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
