import type { JewelPiece } from "@/data/jewellery";

const jost = { fontFamily: "var(--nf-font-label)" } as const;

/** Percentage saved against the MRP, rounded the way retail displays it. */
export const discountPercent = (piece: Pick<JewelPiece, "price" | "compareAtPrice">) =>
  piece.compareAtPrice && piece.compareAtPrice > piece.price
    ? Math.round(((piece.compareAtPrice - piece.price) / piece.compareAtPrice) * 100)
    : 0;

/**
 * Price line used on grid cards and the product page: selling price in ink,
 * struck-through MRP beside it, and the saving as a quiet gold percentage.
 * Nothing is hardcoded — the MRP only appears when Shopify has a compare-at
 * price set on the variant.
 */
const JewelPriceTag = ({
  piece,
  size = "card",
  align = "center",
}: {
  piece: Pick<JewelPiece, "price" | "priceLabel" | "compareAtPrice" | "compareAtLabel">;
  size?: "card" | "pdp";
  align?: "center" | "left";
}) => {
  const off = discountPercent(piece);
  const big = size === "pdp";

  return (
    <div
      className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${
        align === "center" ? "justify-center" : "justify-start"
      }`}
      style={{ ...jost, fontVariantNumeric: "tabular-nums" }}
    >
      <span
        className={`font-medium leading-none text-nf-ink ${
          big ? "text-[22px] sm:text-[26px]" : "text-[15px] sm:text-[17px]"
        }`}
      >
        {piece.priceLabel}
      </span>
      {off > 0 && (
        <>
          <span
            className={`leading-none text-nf-ink/40 line-through ${big ? "text-[15px]" : "text-[12px] sm:text-[13px]"}`}
          >
            {piece.compareAtLabel}
          </span>
          <span
            className={`leading-none text-nf-gold-deep ${big ? "text-[12px] tracking-nf-18" : "text-[10px] tracking-nf-14 sm:text-[11px]"}`}
          >
            {off}% OFF
          </span>
        </>
      )}
    </div>
  );
};

export default JewelPriceTag;
