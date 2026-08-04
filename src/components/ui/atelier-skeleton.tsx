import { cn } from "@/lib/utils";

/**
 * Ivory-toned shimmer skeleton for atelier surfaces.
 * Base #F4EBE2 with a soft #FBF3EC sheen; sharp corners per brand.
 * Shimmer keyframes live in src/index.css (.atelier-shimmer).
 */
function AtelierSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("atelier-shimmer", className)} {...props} />;
}

export { AtelierSkeleton };
