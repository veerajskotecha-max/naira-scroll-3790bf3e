import React from "react";
import FloatingRing from "./FloatingRing";
import ComingSoonPanel from "@/components/shop/ComingSoonPanel";

type Gem = "emerald" | "blush" | "pearl";

const GEMS: { id: Gem; label: string; swatch: string }[] = [
  { id: "emerald", label: "Emerald", swatch: "#7E9C95" },
  { id: "blush", label: "Blush Tourmaline", swatch: "#D08469" },
  { id: "pearl", label: "Pearl", swatch: "#EADBC8" },
];

export default function JewelleryProductPage() {
  const [gem, setGem] = React.useState<Gem>("pearl");

  return (
    <section
      className="w-full"
      style={{ backgroundColor: "hsl(0 0% 100%)" }}
    >
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-10 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Floating ring stage — rotates on scroll */}
          <div className="flex justify-center">
            <FloatingRing gem={gem} stage="cream" size={560} maxTurn={26} />
          </div>


          {/* Details */}
          <div>
            <span
              className="text-[10px] md:text-[11px] uppercase tracking-[0.32em] font-medium"
              style={{ color: "hsl(186 35% 28%)" }}
            >
              The Atelier · Preview
            </span>
            <h1
              className="mt-3 font-cormorant text-[36px] md:text-[48px] lg:text-[58px] font-semibold leading-[1.05] tracking-[-0.01em]"
              style={{ color: "hsl(0 0% 12%)" }}
            >
              The Marigold Solitaire
            </h1>
            <div
              className="mt-4"
              style={{ width: "56px", height: "1px", backgroundColor: "hsl(150 12% 71%)" }}
            />
            <p
              className="mt-5 text-[14px] md:text-[15px] leading-[1.75] max-w-[480px]"
              style={{ color: "hsl(0 0% 40%)" }}
            >
              A hand-set solitaire on a softly hammered 18k band. Photographed here
              in slow rotation — every facet catches its own hour of light.
            </p>

            {/* Stone selector */}
            <div className="mt-8">
              <p
                className="text-[10px] uppercase tracking-[0.22em] font-medium mb-3"
                style={{ color: "hsl(0 0% 45%)" }}
              >
                Choose your stone
              </p>
              <div className="flex gap-3">
                {GEMS.map((g) => {
                  const isActive = g.id === gem;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setGem(g.id)}
                      className="flex items-center gap-2 px-4 py-2.5 border transition-colors duration-200"
                      style={{
                        borderColor: isActive ? "hsl(0 0% 12%)" : "hsl(0 0% 82%)",
                        backgroundColor: isActive ? "hsl(0 0% 12%)" : "transparent",
                        color: isActive ? "hsl(0 0% 100%)" : "hsl(0 0% 30%)",
                      }}
                      aria-pressed={isActive}
                    >
                      <span
                        aria-hidden
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: g.swatch,
                          border: "1px solid rgba(0,0,0,.15)",
                        }}
                      />
                      <span className="text-[11px] uppercase tracking-[0.16em]">
                        {g.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Details table */}
            <dl
              className="mt-10 border-t"
              style={{ borderColor: "hsl(0 0% 90%)" }}
            >
              {[
                ["Metal", "18k Recycled Gold"],
                ["Stone", GEMS.find((g) => g.id === gem)?.label ?? "—"],
                ["Setting", "Four-prong solitaire"],
                ["Made in", "Nashik, India"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between py-3 border-b"
                  style={{ borderColor: "hsl(0 0% 92%)" }}
                >
                  <dt
                    className="text-[11px] uppercase tracking-[0.18em]"
                    style={{ color: "hsl(0 0% 45%)" }}
                  >
                    {k}
                  </dt>
                  <dd
                    className="font-cormorant text-[16px]"
                    style={{ color: "hsl(0 0% 20%)" }}
                  >
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Coming soon panel — closing strip */}
        <div className="mt-14 md:mt-20">
          <ComingSoonPanel
            eyebrow="Not Yet Available"
            title="Coming Soon"
            description="This piece is part of our first jewellery drop. Join the waitlist on WhatsApp to preview the collection before it launches."
          />
        </div>
      </div>
    </section>
  );
}
