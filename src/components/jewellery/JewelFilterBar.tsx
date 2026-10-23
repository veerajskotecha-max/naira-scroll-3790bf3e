import { useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { JewelPiece } from "@/data/jewellery";
import { matchesOccasion } from "@/lib/jewelleryCollections";

const jost = { fontFamily: "var(--nf-font-label)" } as const;

export type SortKey = "featured" | "best" | "price-asc" | "price-desc" | "newest";

export const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "featured", label: "Featured" },
  { key: "best", label: "Best selling" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "newest", label: "Newest first" },
];

export interface JewelFilters {
  sort: SortKey;
  maxPrice: number | null;
  /** Lower bound, set by the one-tap price bands on the shop page. */
  minPrice?: number | null;
  inStockOnly: boolean;
  tag: string | null;
}

export const emptyFilters: JewelFilters = { sort: "featured", maxPrice: null, minPrice: null, inStockOnly: false, tag: null };

export const PRICE_BANDS = [
  { key: "under-999", label: "UNDER ₹999", min: null, max: 998.99 },
  { key: "999-1499", label: "₹999–1,499", min: 999, max: 1499.99 },
  { key: "1500-plus", label: "₹1,500+", min: 1500, max: null },
] as const;
export type PriceBand = (typeof PRICE_BANDS)[number];

export const parsePriceBound = (value: string | null): number | null => {
  if (!value?.trim()) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
};

/** Style/occasion chips built from whatever Shopify tags the catalogue carries. */
export const collectTags = (pieces: JewelPiece[]) => {
  const counts = new Map<string, number>();
  pieces.forEach((p) =>
    (p.tags ?? []).forEach((raw) => {
      const t = raw.trim();
      if (!t) return;
      counts.set(t, (counts.get(t) ?? 0) + 1);
    })
  );
  return [...counts.entries()]
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
};

/** Applies the sort + filter set to a list of pieces. Pure, so it is safe to memoise. */
export const applyJewelFilters = (
  pieces: JewelPiece[],
  f: JewelFilters,
  opts?: { keepSoldOutInPlace?: boolean },
) => {
  let out = pieces.slice();
  if (f.inStockOnly) out = out.filter((p) => p.availableForSale);
  const { maxPrice, minPrice, tag } = f;
  if (maxPrice != null) out = out.filter((p) => p.price <= maxPrice);
  if (minPrice != null) out = out.filter((p) => p.price >= minPrice);
  if (tag) out = out.filter((p) => matchesOccasion(p, tag));

  switch (f.sort) {
    case "price-asc":
      out.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      out.sort((a, b) => b.price - a.price);
      break;
    case "best":
      // Shopify has no storefront sales rank here, so the house bestseller and
      // new tags stand in — flagged pieces float, the rest keep house order.
      out.sort((a, b) => rank(b) - rank(a));
      break;
    case "newest":
      out.sort((a, b) => (b.tag === "NEW" ? 1 : 0) - (a.tag === "NEW" ? 1 : 0));
      break;
  }

  // A sold-out piece must never lead the grid, whatever the sort — the first
  // card on /jewellery was a zero-inventory necklace. Array#sort is stable, so
  // this only sinks them; the chosen order survives inside each group.
  // Curated pages (the ads-only edit) opt out: the owner pins a sold-out lead
  // piece deliberately and its badge says why it can't be bought.
  if (opts?.keepSoldOutInPlace) return out;
  return out.sort((a, b) => Number(a.availableForSale === false) - Number(b.availableForSale === false));
};

const rank = (p: JewelPiece) => (p.tag === "BESTSELLER" ? 2 : p.tag === "NEW" ? 1 : 0);

const JewelFilterBar = ({
  pieces,
  value,
  onChange,
}: {
  pieces: JewelPiece[];
  value: JewelFilters;
  onChange: (next: JewelFilters) => void;
}) => {
  const [open, setOpen] = useState(false);
  const tags = useMemo(() => collectTags(pieces), [pieces]);
  const prices = pieces.map((p) => p.price);
  const ceiling = prices.length ? Math.max(...prices) : 0;
  const floor = prices.length ? Math.min(...prices) : 0;
  const activeCount =
    (value.maxPrice != null || value.minPrice != null ? 1 : 0) + (value.inStockOnly ? 1 : 0) + (value.tag ? 1 : 0);

  const set = (patch: Partial<JewelFilters>) => onChange({ ...value, ...patch });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex items-center justify-between gap-3 border-t border-nf-ink/10 pt-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`press-scale inline-flex min-h-[44px] items-center gap-2 border px-3.5 text-[10px] tracking-nf-18 transition-colors sm:px-4 sm:text-[10.5px] ${
            activeCount ? "border-nf-ink bg-nf-ink text-nf-ivory" : "border-nf-ink/25 text-nf-ink/70 hover:border-nf-ink/60"
          }`}
          style={jost}
        >
          <SlidersHorizontal size={13} strokeWidth={1.6} />
          FILTER{activeCount ? ` (${activeCount})` : ""}
        </button>

        {/* The sort menu shows its choice in the bar's small type, while the
            real <select> sits on top of it, invisible, at 16px. A phone-sized
            select (10px) made iPhones zoom the whole shop in on every tap. */}
        <label
          className="relative inline-flex min-h-[44px] items-center gap-2 border border-nf-ink/25 px-3 text-[10px] tracking-nf-14 text-nf-ink/80 focus-within:border-nf-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[color:var(--nf-focus-ring)] sm:text-[10.5px]"
          style={jost}
        >
          <span className="sr-only">Sort pieces</span>
          <span aria-hidden="true" className="pointer-events-none whitespace-nowrap">
            {SORT_OPTIONS.find((o) => o.key === value.sort)?.label ?? SORT_OPTIONS[0].label}
          </span>
          <ChevronDown aria-hidden="true" size={12} strokeWidth={1.6} className="pointer-events-none shrink-0" />
          <select
            value={value.sort}
            onChange={(e) => set({ sort: e.target.value as SortKey })}
            className="absolute -inset-px cursor-pointer appearance-none bg-transparent text-base opacity-0"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {open && (
        <div className="mt-3 border border-nf-ink/12 bg-nf-ivory p-4 sm:p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {ceiling > floor && (
              <div>
                <p className="text-[9.5px] tracking-nf-24 text-nf-ink/50" style={jost}>
                  PRICE, UP TO
                </p>
                <input
                  type="range"
                  min={floor}
                  max={ceiling}
                  step={1}
                  value={Math.max(floor, Math.min(value.maxPrice ?? ceiling, ceiling))}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    set({ minPrice: null, maxPrice: v >= ceiling ? null : v });
                  }}
                  className="mt-3 w-full accent-[var(--nf-accent)]"
                  aria-label="Maximum price"
                />
                <p className="mt-1 text-[12px] text-nf-ink/70" style={{ ...jost, fontVariantNumeric: "tabular-nums" }}>
                  ₹{(value.maxPrice ?? ceiling).toLocaleString("en-IN")}
                </p>
              </div>
            )}

            <div>
              <p className="text-[9.5px] tracking-nf-24 text-nf-ink/50" style={jost}>
                AVAILABILITY
              </p>
              <label className="mt-3 inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-[12px] text-nf-ink/75">
                <input
                  type="checkbox"
                  checked={value.inStockOnly}
                  onChange={(e) => set({ inStockOnly: e.target.checked })}
                  className="h-4 w-4 accent-[var(--nf-accent)]"
                />
                <span style={jost}>In stock only</span>
              </label>
            </div>

            {tags.length > 0 && (
              <div className="sm:col-span-2">
                <p className="text-[9.5px] tracking-nf-24 text-nf-ink/50" style={jost}>
                  STYLE &amp; OCCASION
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map(([t, n]) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set({ tag: value.tag === t ? null : t })}
                      aria-pressed={value.tag === t}
                      className={`min-h-[44px] border px-3.5 text-[9.5px] tracking-nf-16 transition-colors ${
                        value.tag === t
                          ? "border-nf-ink bg-nf-ink text-nf-ivory"
                          : "border-nf-ink/20 text-nf-ink/65 hover:border-nf-ink/60"
                      }`}
                      style={jost}
                    >
                      {t.toUpperCase()} <span className="opacity-50">{n}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => onChange({ ...emptyFilters, sort: value.sort })}
              className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 text-[10px] tracking-nf-18 text-nf-ink/55 underline underline-offset-4 hover:text-nf-ink"
              style={jost}
            >
              <X size={12} strokeWidth={1.6} /> CLEAR FILTERS
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default JewelFilterBar;
