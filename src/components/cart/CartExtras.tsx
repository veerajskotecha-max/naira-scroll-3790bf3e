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
      <div
        className="flex items-center justify-between px-3 py-2.5"
        style={{ border: "1px dashed hsl(186 35% 40%)", backgroundColor: "hsl(186 30% 97%)" }}
      >
        <span className="flex items-center gap-2 text-[12px]" style={{ color: "hsl(186 35% 24%)" }}>
          <Check size={13} strokeWidth={2} />
          <strong className="font-semibold tracking-[0.08em]">{applied}</strong> applied
        </span>
        <button
          onClick={() => {
            clearPromoCode();
            setApplied(null);
          }}
          aria-label="Remove promo code"
          className="w-8 h-8 flex items-center justify-center"
          style={{ color: "hsl(0 0% 45%)" }}
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
        className="flex items-center gap-2 min-h-[36px] text-[12px] underline underline-offset-4"
        style={{ color: "hsl(0 0% 45%)" }}
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
          className="flex-1 h-[42px] px-3 text-[13px] uppercase tracking-[0.08em] outline-none"
          style={{ border: "1px solid hsl(0 0% 82%)", color: "hsl(0 0% 18%)" }}
        />
        <button
          type="submit"
          className="px-4 h-[42px] text-[11px] font-medium uppercase tracking-[0.12em]"
          style={{ backgroundColor: "hsl(0 0% 12%)", color: "hsl(0 0% 100%)" }}
        >
          Apply
        </button>
      </div>
      {error && <p className="mt-1.5 text-[11px]" style={{ color: "hsl(0 65% 45%)" }}>{error}</p>}
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
    <div className="px-5 py-4 border-t" style={{ borderColor: "hsl(0 0% 92%)", backgroundColor: "hsl(33 30% 98%)" }}>
      <p className="text-[10px] uppercase tracking-[0.24em] font-medium mb-3" style={{ color: "hsl(186 35% 28%)" }}>
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
                <p className="font-cormorant text-[14px] font-semibold truncate" style={{ color: "hsl(0 0% 18%)" }}>{product.title}</p>
                <p className="text-[12px]" style={{ color: "hsl(186 35% 28%)" }}>{formatShopifyPrice(money)}</p>
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
                className="press-scale shrink-0 inline-flex items-center gap-1 px-3 h-[36px] text-[10px] font-medium uppercase tracking-[0.12em] border disabled:opacity-50"
                style={{ borderColor: "hsl(0 0% 30%)", color: "hsl(0 0% 20%)" }}
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
