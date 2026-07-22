interface Props {
  total: number;
  currencySymbol?: string;
}

const format = (n: number, symbol = "₹") =>
  `${symbol}${Math.round(n).toLocaleString("en-IN")}`;

const PriceBreakup = ({ total, currencySymbol = "₹" }: Props) => {
  // Prices are tax-inclusive. Compute base and GST for transparency.
  // Apparel GST: 5% below ₹1000, else 12%.
  const gstRate = total < 1000 ? 0.05 : 0.12;
  const base = total / (1 + gstRate);
  const gst = total - base;
  const shipping = total >= 2999 ? 0 : 150;
  const finalTotal = total + shipping;

  const Row = ({ label, value, muted = false, bold = false }: { label: string; value: string; muted?: boolean; bold?: boolean }) => (
    <div
      className={`flex items-center justify-between py-3 ${bold ? "" : "border-b"}`}
      style={{ borderColor: "hsl(0 0% 90%)" }}
    >
      <span
        className={`text-[13px] ${bold ? "font-cormorant text-[15px] font-semibold" : ""}`}
        style={{ color: muted ? "hsl(0 0% 50%)" : bold ? "hsl(0 0% 15%)" : "hsl(0 0% 30%)" }}
      >
        {label}
      </span>
      <span
        className={`text-[13px] ${bold ? "font-cormorant text-[16px] font-bold" : "font-medium"}`}
        style={{ color: bold ? "hsl(186 35% 28%)" : "hsl(0 0% 20%)" }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className="w-full py-2">
      <p className="text-[11px] leading-relaxed mb-3" style={{ color: "hsl(0 0% 50%)" }}>
        Product price already includes GST. This breakup is shown for full transparency.
      </p>
      <Row label="Base Price" value={format(base, currencySymbol)} />
      <Row label={`GST (${(gstRate * 100).toFixed(0)}%)`} value={format(gst, currencySymbol)} />
      <Row
        label="Shipping"
        value={shipping === 0 ? "Free" : format(shipping, currencySymbol)}
        muted={shipping === 0}
      />
      <Row label="Total" value={format(finalTotal, currencySymbol)} bold />
      {shipping === 0 && (
        <p className="text-[11px] mt-2" style={{ color: "hsl(142 50% 38%)" }}>
          ✓ Free shipping applied (order above ₹2,999)
        </p>
      )}
    </div>
  );
};

export default PriceBreakup;
