import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { trackPixel } from "@/lib/pixel";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { useQuery } from "@tanstack/react-query";
import { fetchShopifyProducts } from "@/lib/shopify";
import { parseQuery, searchPieces, shopPageFor } from "@/lib/search";
import { cardCover } from "@/lib/cardCover";

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

/* Each of these returns pieces; "Gifting" never matched anything. */
const POPULAR = ["Rings", "Zircone", "Necklace", "Pearl", "Under 1500"];
const MAX_RESULTS = 10;

/**
 * Instant search over the live catalogue — jewellery pieces and apparel
 * products are indexed client-side by title, category and Shopify tags, so a
 * query resolves without a round trip.
 */
/* onFollow, when given, takes over a result tap (closing first, then going) —
   for a search that holds a history entry while open; see useBackToClose. */
const SearchOverlay = ({
  open,
  onClose,
  onFollow,
}: {
  open: boolean;
  onClose: () => void;
  onFollow?: (e: MouseEvent<HTMLAnchorElement>) => void;
}) => {
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
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

  const clothes: Hit[] = useMemo(() => {
    const jewelHandles = new Set(jewellery.map((p) => p.handle));
    return (apparel ?? [])
      .filter((n) => !jewelHandles.has(n.handle))
      .map((n) => ({
        key: `p-${n.handle}`,
        title: n.title,
        caption: n.productType || "Indo-Western",
        price: `₹${Math.round(Number(n.priceRange.minVariantPrice.amount)).toLocaleString("en-IN")}`,
        image: n.images.edges[0]?.node.url ?? "",
        to: `/product/${n.handle}`,
      }));
  }, [jewellery, apparel]);

  /* Jewellery is ranked by lib/search; apparel keeps its plain text match and
     only fills the list after the pieces. */
  const { results, total, seeAll } = useMemo(() => {
    const term = q.trim();
    if (term.length < 2) return { results: [] as Hit[], total: 0, seeAll: null as null | { to: string; label: string } };
    const pieces = searchPieces(jewellery, term);
    const jewels: Hit[] = pieces.map((p) => ({
      key: `j-${p.handle}`,
      title: p.name,
      caption: `${p.category} · ${(p.tags ?? []).slice(0, 2).join(", ")}`,
      price: p.priceLabel,
      image: cardCover(p),
      to: `/jewellery/${p.handle}`,
    }));
    const lower = term.toLowerCase();
    const matches = [...jewels, ...clothes.filter((h) => `${h.title} ${h.caption}`.toLowerCase().includes(lower))];
    const to = shopPageFor(term);
    const { category } = parseQuery(term);
    return {
      results: matches.slice(0, MAX_RESULTS),
      total: matches.length,
      seeAll: to ? { to, label: `See all ${category ? category.toLowerCase() : "pieces"}${pieces.length ? ` (${pieces.length})` : ""}` } : null,
    };
  }, [q, jewellery, clothes]);

  /* The keyboard's Go / Enter: the filtered shop page when the search is a
     category or a price, otherwise the best match. It clicks the same link a
     tap would, so closing and history work the same way. */
  const go = (e: FormEvent) => {
    e.preventDefault();
    listRef.current?.querySelector<HTMLAnchorElement>("a[data-search-go]")?.click();
  };

  const remember = (term: string) => {
    const clean = term.trim();
    if (clean.length < 2) return;
    trackPixel("Search", { search_string: clean, content_type: "product" });
    const next = [clean, ...recent.filter((r) => r.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Search">
      <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close search" tabIndex={-1} />
      <div className="relative mx-auto w-full max-w-3xl animate-fade-in bg-[#F4F1ED] p-5 shadow-xl sm:p-7">
        <form role="search" onSubmit={go} className="flex items-center gap-3 border-b border-nf-ink/15 pb-3">
          <Search size={18} strokeWidth={1.5} className="opacity-50" />
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search rings, necklaces, outfits…"
            className="w-full bg-transparent text-base text-nf-ink placeholder:text-nf-ink/35 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            aria-label="Search products"
          />
          <button type="button" onClick={onClose} aria-label="Close search" className="-my-2 -mr-3 flex h-11 w-11 shrink-0 items-center justify-center opacity-60 hover:opacity-100">
            <X size={18} strokeWidth={1.5} />
          </button>
        </form>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {results.length > 0 ? (
            <ul className="mt-4 space-y-1">
              {results.map((h, i) => (
                <li key={h.key}>
                  <Link
                    to={h.to}
                    data-search-go={!seeAll && i === 0 ? "" : undefined}
                    onClick={(e) => {
                      remember(q);
                      if (onFollow) onFollow(e);
                      else onClose();
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
              {seeAll && (
                <li>
                  <Link
                    to={seeAll.to}
                    data-search-go=""
                    onClick={(e) => {
                      remember(q);
                      if (onFollow) onFollow(e);
                      else onClose();
                    }}
                    className="flex min-h-[44px] items-center justify-between p-2 text-[12px] tracking-nf-14 text-nf-ink underline decoration-nf-gold underline-offset-4"
                    style={jost}
                  >
                    {seeAll.label.toUpperCase()} <span aria-hidden="true">→</span>
                  </Link>
                </li>
              )}
              {!seeAll && total > results.length && (
                <li className="p-2 text-[12px] text-nf-ink/55">
                  Showing {results.length} of {total}. Add a word to narrow it down.
                </li>
              )}
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
                        className="min-h-[44px] border border-nf-ink/20 px-3 text-[10px] tracking-nf-14 text-nf-ink/65 hover:border-nf-ink"
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
                      className="min-h-[44px] border border-nf-ink/20 px-3 text-[10px] tracking-nf-14 text-nf-ink/65 hover:border-nf-ink"
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
