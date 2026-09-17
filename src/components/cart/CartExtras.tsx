import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tag, Check, X, Plus, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { fetchShopifyProducts, formatShopifyPrice } from "@/lib/shopify";
import { getPromoCode, setPromoCode, clearPromoCode, PROMO_EVENT, isAcceptedPromoCode, normalizePromoCode } from "@/lib/promo";

export const CartPromoField = () => {
  const [applied, setApplied] = useState<string | null>(() => getPromoCode());
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setApplied(getPromoCode());
    window.addEventListener(PROMO_EVENT, sync);
    return () => window.removeEventListener(PROMO_EVENT, sync);
  }, []);

  const apply = (event: React.FormEvent) => {
    event.preventDefault();
    const code = normalizePromoCode(value);
    if (!isAcceptedPromoCode(code)) {
      setError("That code isn't valid right now.");
      return;
    }
    setError("");
    setPromoCode(code);
    setApplied(code);
    setValue("");
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between border border-dashed border-[color:rgb(var(--nf-gold-rgb)/0.55)] bg-[var(--nf-surface-raised)] px-3 py-2.5">
        <span className="flex items-center gap-2 text-[12px] text-[var(--nf-accent-quiet)]">
          <Check size={13} strokeWidth={2} />
          <strong className="font-semibold tracking-[var(--nf-track-8)]">{applied}</strong> applied
        </span>
        <button
          onClick={() => {
            clearPromoCode();
            setApplied(null);
          }}
          aria-label="Remove promo code"
          className="flex h-8 w-8 items-center justify-center text-[color:rgb(var(--nf-ink-rgb)/0.5)]"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex min-h-[36px] items-center gap-2 text-[12px] text-[color:rgb(var(--nf-ink-rgb)/0.55)] underline underline-offset-4"
      >
        <Tag size={13} strokeWidth={1.5} /> Have a promo code?
      </button>
    );
  }

  return (
    <form onSubmit={apply}>
      <div className="flex">
        <label className="sr-only" htmlFor="cart-promo">Promo code</label>
        <input
          id="cart-promo"
          value={value}
          maxLength={24}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          placeholder="Promo code"
          className="h-[42px] flex-1 border border-[color:rgb(var(--nf-ink-rgb)/0.18)] px-3 text-[13px] uppercase tracking-[var(--nf-track-8)] text-[var(--nf-text)] outline-none focus:border-[var(--nf-focus-ring)]"
        />
        <button
          type="submit"
          className="h-[42px] bg-[var(--nf-text)] px-4 text-[11px] font-medium uppercase tracking-[var(--nf-track-10)] text-[var(--nf-text-inverse)]"
        >
          Apply
        </button>
      </div>
      {error && <p className="mt-1.5 text-[11px] text-destructive">{error}</p>}
    </form>
  );
};

export const CartUpsell = () => {
  const { items, addItem, isLoading } = useCart();
  const { data } = useQuery({
    queryKey: ["shopify-products", "cart-upsell"],
    queryFn: () => fetchShopifyProducts(12),
    staleTime: 1000 * 60 * 10,
  });

  const suggestions = useMemo(() => {
    const inCart = new Set(items.map((item) => item.id));
    return (data ?? []).filter((product) => !inCart.has(product.handle)).slice(0, 2);
  }, [data, items]);

  if (suggestions.length === 0) return null;

  return (
    <div className="border-t border-[color:rgb(var(--nf-ink-rgb)/0.08)] bg-[var(--nf-surface-raised)] px-5 py-4">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[var(--nf-track-24)] text-[var(--nf-accent-quiet)]">
        Complete the look
      </p>
      <div className="space-y-3">
        {suggestions.map((product) => {
          const variant = product.variants.edges.find((edge) => edge.node.availableForSale)?.node ?? product.variants.edges[0]?.node;
          const money = variant?.price ?? product.priceRange.minVariantPrice;
          return (
            <div key={product.id} className="flex items-center gap-3">
              <img
                src={product.images.edges[0]?.node.url ?? "/placeholder.svg"}
                alt={product.title}
                className="w-[52px] h-[64px] object-cover shrink-0"
                width={52}
                height={64}
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <p className="truncate font-cormorant text-[14px] font-semibold text-[var(--nf-text)]">{product.title}</p>
                <p className="text-[12px] text-[color:rgb(var(--nf-ink-rgb)/0.6)]">{formatShopifyPrice(money)}</p>
              </div>
              <button
                disabled={isLoading || !variant?.id}
                onClick={() =>
                  variant &&
                  addItem({
                    id: product.handle,
                    variantId: variant.id,
                    name: product.title,
                    price: Number(money.amount),
                    priceLabel: formatShopifyPrice(money),
                    currencyCode: money.currencyCode,
                    image: product.images.edges[0]?.node.url ?? "/placeholder.svg",
                    size: variant.selectedOptions.find((o) => o.name.toLowerCase() === "size")?.value,
                    variantTitle: variant.title,
                    selectedOptions: variant.selectedOptions,
                  })
                }
                className="press-scale inline-flex h-[36px] shrink-0 items-center gap-1 border border-[color:rgb(var(--nf-ink-rgb)/0.3)] px-3 text-[10px] font-medium uppercase tracking-[var(--nf-track-10)] text-[var(--nf-text)] disabled:opacity-50"
                aria-label={`Add ${product.title} to cart`}
              >
                {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
