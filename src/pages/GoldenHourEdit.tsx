import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import JewelCard from "@/components/jewellery/JewelCard";
import RingAtelierBackdrop from "@/components/jewellery/RingAtelierBackdrop";
import JewelFilterBar, {
  applyJewelFilters,
  SORT_OPTIONS,
  type JewelFilters,
} from "@/components/jewellery/JewelFilterBar";
import type { JewelCategory } from "@/data/jewellery";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { resolveEdit } from "@/data/adsEdit";
import { SITE_URL } from "@/data/seoContent";
import { useSearchParams } from "react-router-dom";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "var(--nf-font-editorial)" } as const;
const jost = { fontFamily: "var(--nf-font-label)" } as const;

const filters: Array<"All" | JewelCategory> = ["All", "Rings", "Bracelets", "Earrings", "Necklaces"];

/* The Golden Hour — a private edit used only in paid campaigns.
   Laid out exactly like the main jewellery shop-all page (hero, sticky
   category pills, sort/filter bar, product grid) but scoped to the
   curated ten pieces. Deliberately absent from menus, footer and
   sitemap, and marked noindex: the only way in is the ad link. */
const GoldenHourEdit = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramCategory = searchParams.get("category");
  const initialCategory = (filters.find((f) => f.toLowerCase() === (paramCategory ?? "").toLowerCase()) ?? "All") as
    | "All"
    | JewelCategory;
  const [active, setActive] = useState<"All" | JewelCategory>(initialCategory);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const didScrollToGrid = useRef(false);

  useEffect(() => {
    const match = filters.find((f) => f.toLowerCase() === (paramCategory ?? "").toLowerCase());
    if (match && match !== active) setActive(match);
    if (match && match !== "All" && !didScrollToGrid.current) {
      didScrollToGrid.current = true;
      window.setTimeout(() => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 260);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramCategory]);

  const selectCategory = (next: "All" | JewelCategory) => {
    setActive(next);
    const params = new URLSearchParams(searchParams);
    if (next === "All") params.delete("category");
    else params.set("category", next);
    setSearchParams(params, { replace: true });
  };

  const { jewellery } = useLiveJewellery();
  const curated = useMemo(() => resolveEdit(jewellery), [jewellery]);

  // Private toggle, only on this page: the curated edit, or the whole catalogue.
  const showAll = searchParams.get("view") === "all";
  const edit = showAll ? jewellery : curated;

  const setView = (next: "edit" | "all") => {
    const params = new URLSearchParams(searchParams);
    next === "all" ? params.set("view", "all") : params.delete("view");
    setSearchParams(params, { replace: true });
  };

  const activeFilters: JewelFilters = useMemo(() => {
    const sortParam = searchParams.get("sort");
    const max = searchParams.get("under");
    return {
      sort: (SORT_OPTIONS.find((o) => o.key === sortParam)?.key ?? "featured") as JewelFilters["sort"],
      maxPrice: max ? Number(max) : null,
      inStockOnly: searchParams.get("stock") === "in",
      tag: searchParams.get("tag"),
    };
  }, [searchParams]);

  const setFilters = (next: JewelFilters) => {
    const params = new URLSearchParams(searchParams);
    next.sort === "featured" ? params.delete("sort") : params.set("sort", next.sort);
    next.maxPrice == null ? params.delete("under") : params.set("under", String(next.maxPrice));
    next.inStockOnly ? params.set("stock", "in") : params.delete("stock");
    next.tag ? params.set("tag", next.tag) : params.delete("tag");
    setSearchParams(params, { replace: true });
  };

  const filterCounts = useMemo(
    () =>
      filters.reduce((acc, f) => {
        acc[f] = f === "All" ? edit.length : edit.filter((p) => p.category === f).length;
        return acc;
      }, {} as Record<"All" | JewelCategory, number>),
    [edit]
  );
  const inCategory = useMemo(
    () => (active === "All" ? edit : edit.filter((p) => p.category === active)),
    [active, edit]
  );
  const pieces = useMemo(() => applyJewelFilters(inCategory, activeFilters), [inCategory, activeFilters]);
  const url = `${SITE_URL}/the-golden-hour`;

  return (
    <>
      <PageSEO
        title="The Golden Hour | A Private Edit"
        description="Ten pieces from the Naira Flore atelier, chosen for the golden hour. 18K gold tone, waterproof and anti-tarnish, shipped insured in 3–5 working days."
        canonical={url}
        image={pieces[0]?.image}
        noindex
      />
      <div className="relative bg-nf-ivory pt-[94px] text-nf-ink md:pt-[100px] lg:pt-[116px]">
        {/* hero block — pressed-flower wash, matching the jewellery shop-all */}
        <div className="relative overflow-hidden bg-[#FBF3EC]">
          <div className="pointer-events-none absolute inset-0 z-0">
            <RingAtelierBackdrop variant="section" />
          </div>

          <header className="relative z-10 mx-auto max-w-6xl px-4 pb-6 pt-6 sm:px-6 md:pt-10">
            <p className="text-[10px] tracking-nf-40 text-nf-gold-shadow" style={jost}>A PRIVATE EDIT</p>
            <h1 className="mt-3 text-[30px] leading-[1.05] md:text-[48px]" style={velista}>
              The Golden Hour
            </h1>
            <p className="mt-3 max-w-xl text-[14px] leading-[1.8] text-nf-ink/60 md:text-[16px]" style={editorial}>
              Ten pieces we keep aside for the last warm light of the day.
            </p>
          </header>
        </div>

        {/* private edit / full catalogue switch */}
        <div className="mx-auto mt-6 flex max-w-6xl justify-center px-4 sm:px-6">
          <div className="inline-flex border border-nf-ink/25">
            {([
              { key: "edit", label: "THE GOLDEN HOUR", n: curated.length },
              { key: "all", label: "ALL PIECES", n: jewellery.length },
            ] as const).map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => setView(o.key)}
                aria-pressed={showAll ? o.key === "all" : o.key === "edit"}
                className={`press-scale inline-flex min-h-[42px] items-baseline gap-1.5 px-4 text-[10px] tracking-nf-18 transition-colors sm:px-6 sm:text-[10.5px] ${
                  (showAll ? o.key === "all" : o.key === "edit")
                    ? "bg-nf-ink text-nf-ivory"
                    : "text-nf-ink/60 hover:text-nf-ink"
                }`}
                style={jost}
              >
                <span className="self-center">{o.label}</span>
                <span aria-hidden className="self-center text-[9px] opacity-60">
                  {o.n}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* filter */}
        <div ref={gridRef} className="sticky top-[94px] z-20 bg-nf-ivory py-4 md:top-[100px] md:py-5 lg:top-[116px]">
          <div className="mx-auto flex max-w-6xl flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hide px-4 sm:justify-center sm:overflow-visible sm:px-6">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => selectCategory(f)}
                aria-pressed={active === f}
                aria-label={`${f}, ${filterCounts[f]} ${filterCounts[f] === 1 ? "piece" : "pieces"}`}
                className={`press-scale shrink-0 inline-flex items-baseline gap-1.5 border px-4 min-h-[44px] text-[10px] tracking-nf-18 transition-colors duration-200 sm:px-5 sm:text-[11px] sm:tracking-nf-30 ${
                  active === f ? "border-nf-ink bg-nf-ink text-nf-ivory" : "border-nf-ink/25 text-nf-ink/70 hover:border-nf-ink/60"
                }`}
                style={jost}
              >
                <span className="self-center">{f.toUpperCase()}</span>
                <span
                  aria-hidden
                  className={`self-center text-[9px] tracking-nf-8 sm:text-[9.5px] ${active === f ? "text-nf-ivory/60" : "text-nf-ink/40"}`}
                >
                  {filterCounts[f]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* sort + filters */}
        <JewelFilterBar
          pieces={inCategory}
          value={activeFilters}
          onChange={setFilters}
          resultCount={pieces.length}
        />

        {/* grid */}
        {pieces.length === 0 ? (
          <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-16 text-center">
            <h2 className="text-[26px] leading-[1.15] md:text-[32px]" style={velista}>
              Nothing in this edit yet
            </h2>
            <p className="mt-3 max-w-sm text-[14px] leading-[1.8] text-nf-ink/60" style={editorial}>
              New pieces join the edit regularly. The full collection is a step away.
            </p>
            <button
              onClick={() => {
                setActive("All");
                setSearchParams(new URLSearchParams(), { replace: true });
              }}
              className="press-scale mt-7 border border-nf-ink px-7 min-h-[48px] text-[10.5px] tracking-nf-28 text-nf-ink transition-colors duration-200 hover:bg-nf-ink hover:text-nf-ivory"
              style={jost}
            >
              VIEW ALL PIECES
            </button>
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 pb-16 pt-10 sm:gap-6 sm:px-6 lg:grid-cols-3 lg:gap-8">
            {pieces.map((piece, i) => (
              <JewelCard key={piece.handle} piece={piece} index={i} />
            ))}
          </div>
        )}

        <Footer />
      </div>
    </>
  );
};

export default GoldenHourEdit;
