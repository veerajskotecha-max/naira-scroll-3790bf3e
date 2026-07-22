import { useState } from "react";
import ComingSoonPanel from "@/components/shop/ComingSoonPanel";
import { FEATURES } from "@/config/features";

/**
 * Jewellery section on /shop.
 *
 * Renders 5 tabs (All + 4 categories). While FEATURES.jewelleryLive is
 * false, every tab shows a Coming Soon panel. Flip the flag to activate
 * the real product grid.
 */

type TabId = "all" | "earrings" | "rings" | "necklaces" | "sets";

const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "earrings", label: "Earrings" },
  { id: "rings", label: "Rings" },
  { id: "necklaces", label: "Necklaces & Pendants" },
  { id: "sets", label: "Sets" },
];

const JewellerySection = () => {
  const [active, setActive] = useState<TabId>("all");

  return (
    <section
      id="jewellery"
      className="w-full"
      style={{ scrollMarginTop: "120px", backgroundColor: "hsl(0 0% 100%)" }}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-10 py-12 md:py-16 lg:py-20">
        {/* Section header */}
        <div className="text-center mb-8 md:mb-10">
          <span
            className="text-[10px] md:text-[11px] uppercase tracking-[0.32em] font-medium"
            style={{ color: "hsl(186 35% 28%)" }}
          >
            The Atelier
          </span>
          <h2
            className="mt-3 font-cormorant text-[34px] md:text-[46px] lg:text-[56px] font-semibold leading-[1.05] tracking-[-0.01em]"
            style={{ color: "hsl(0 0% 12%)" }}
          >
            Jewellery
          </h2>
          <div
            className="mx-auto mt-4"
            style={{ width: "56px", height: "1px", backgroundColor: "hsl(150 12% 71%)" }}
          />
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 md:mb-10">
          <div
            className="flex flex-wrap justify-center gap-0 border"
            style={{ borderColor: "hsl(0 0% 88%)" }}
            role="tablist"
            aria-label="Jewellery categories"
          >
            {TABS.map((tab) => {
              const isActive = tab.id === active;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(tab.id)}
                  className="px-4 md:px-6 py-3 text-[10px] md:text-[11px] uppercase tracking-[0.18em] font-medium transition-colors duration-200"
                  style={{
                    backgroundColor: isActive ? "hsl(0 0% 12%)" : "transparent",
                    color: isActive ? "hsl(0 0% 100%)" : "hsl(0 0% 35%)",
                    borderLeft: "1px solid hsl(0 0% 88%)",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        {!FEATURES.jewelleryLive ? (
          <ComingSoonPanel
            title="Coming Soon"
            description={
              active === "all"
                ? "Our jewellery atelier is being hand-finished. Leave your name on the waitlist and be the first to preview each piece."
                : `Our ${TABS.find((t) => t.id === active)?.label.toLowerCase()} collection is being hand-finished. Be the first to preview it.`
            }
          />
        ) : (
          // Placeholder for the live grid — real implementation activates
          // when FEATURES.jewelleryLive is true. Kept minimal on purpose.
          <div
            className="w-full flex items-center justify-center py-20"
            style={{ minHeight: "420px", border: "1px solid hsl(0 0% 90%)" }}
          >
            <p className="font-cormorant text-[18px]" style={{ color: "hsl(0 0% 45%)" }}>
              Jewellery grid renders here once catalogue is tagged.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default JewellerySection;
