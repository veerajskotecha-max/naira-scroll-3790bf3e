import { ShieldCheck } from "lucide-react";

type CheckoutBenefitProps = {
  compact?: boolean;
  className?: string;
};

const CheckoutBenefit = ({ compact = false, className = "" }: CheckoutBenefitProps) => {
  const label = "Secure checkout · COD & prepaid";

  return (
    <div
      className={`inline-flex items-center justify-center gap-1.5 text-nf-ink/60 ${compact ? "text-[9px]" : "text-[11px]"} ${className}`}
      aria-label={label}
    >
      <span className={compact ? "tracking-nf-4" : "tracking-nf-4"}>{label}</span>
      <ShieldCheck size={compact ? 10 : 12} strokeWidth={1.6} className="shrink-0 text-nf-gold-deep" aria-hidden="true" />
    </div>
  );
};

export default CheckoutBenefit;