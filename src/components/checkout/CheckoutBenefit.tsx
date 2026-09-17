import { ShieldCheck, Zap } from "lucide-react";
import { isFastrrBrandingEnabled } from "@/lib/fastrr";

type CheckoutBenefitProps = {
  compact?: boolean;
  className?: string;
};

/**
 * Keeps the purchase promise aligned with the checkout that can actually open.
 * Co-branding follows the activated checkout provider while preserving the
 * neutral Shopify fallback message when the provider is switched off.
 */
const CheckoutBenefit = ({ compact = false, className = "" }: CheckoutBenefitProps) => {
  const label = isFastrrBrandingEnabled()
    ? "Fastrr one-click checkout · COD & prepaid"
    : "Fast, secure checkout · COD & prepaid";

  return (
    <div
      className={`inline-flex items-center justify-center gap-1.5 text-nf-ink/60 ${compact ? "text-[9px]" : "text-[11px]"} ${className}`}
      aria-label={label}
    >
      <Zap size={compact ? 10 : 12} strokeWidth={1.6} className="shrink-0 text-nf-gold-deep" aria-hidden="true" />
      <span className={compact ? "tracking-nf-4" : "tracking-nf-4"}>{label}</span>
      <ShieldCheck size={compact ? 10 : 12} strokeWidth={1.6} className="shrink-0 text-nf-gold-deep" aria-hidden="true" />
    </div>
  );
};

export default CheckoutBenefit;