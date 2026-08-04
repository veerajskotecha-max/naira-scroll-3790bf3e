import * as React from "react";
import { AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

/**
 * Journal-style accordion trigger for product details:
 * a 24px gold hairline before a Velista heading, gold chevron,
 * hairline deepening on hover and while open.
 */
const AtelierAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionTrigger>,
  React.ComponentPropsWithoutRef<typeof AccordionTrigger>
>(({ className, children, ...props }, ref) => (
  <AccordionTrigger
    ref={ref}
    className={cn(
      "group py-4 font-cormorant text-[17px] font-medium leading-snug text-[#1A1614] hover:no-underline md:text-[18px] [&>svg]:text-[#9A7634]",
      className
    )}
    {...props}
  >
    <span className="flex items-center gap-3 text-left">
      <span
        aria-hidden="true"
        className="h-px w-6 shrink-0 bg-[#C99A4C]/70 transition-colors duration-300 group-hover:bg-[#C99A4C] group-data-[state=open]:bg-[#9A7634]"
      />
      {children}
    </span>
  </AccordionTrigger>
));
AtelierAccordionTrigger.displayName = "AtelierAccordionTrigger";

export { AtelierAccordionTrigger };
