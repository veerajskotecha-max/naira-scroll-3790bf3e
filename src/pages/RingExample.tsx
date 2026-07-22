import { useParams, Link } from "react-router-dom";
import RingLivingFire from "@/components/jewellery/ringlab/RingLivingFire";
import RingMirrorPlinth from "@/components/jewellery/ringlab/RingMirrorPlinth";
import RingCinematic from "@/components/jewellery/ringlab/RingCinematic";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";

/* Standalone preview of ONE ring-effect variation, on its own route,
   so each can be reviewed in isolation — separate from the live ring
   section (which stays the two-photo turn/flip). */

const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const MAP: Record<string, { n: string; label: string; note: string; el: JSX.Element }> = {
  fire: { n: "1", label: "LIVING FIRE", note: "rotating light-caustics + cursor sparkle on the stone", el: <RingLivingFire /> },
  mirror: { n: "2", label: "MIRROR PLINTH", note: "reflection + sweeping studio light, boutique display", el: <RingMirrorPlinth /> },
  cinematic: { n: "3", label: "CINEMATIC MACRO", note: "silk push + lens-flare + oversized kinetic type", el: <RingCinematic /> },
};
const ORDER = ["fire", "mirror", "cinematic"];

const RingExample = () => {
  const { variant = "fire" } = useParams();
  const v = MAP[variant] ?? MAP.fire;

  return (
    <>
      <PageSEO title={`Ring Effect ${v.n} — ${v.label}`} description={v.note} canonical={`https://nairaflore.com/ring/${variant}`} />
      <div className="pt-[94px] md:pt-[100px] lg:pt-[116px]">
        {/* label + switcher */}
        <div className="flex flex-wrap items-center justify-center gap-3 bg-[#1A1614] px-6 py-4 text-center">
          <span className="bg-[#E8C57E] px-3 py-1 text-[11px] font-medium tracking-[0.3em] text-[#1A1614]" style={jost}>VARIATION {v.n}</span>
          <span className="text-[13px] tracking-[0.2em] text-[#FBF3EC]" style={jost}>{v.label}</span>
          <span className="hidden text-[11px] tracking-[0.15em] text-[#FBF3EC]/60 sm:inline" style={jost}>— {v.note}</span>
          <span className="ml-2 flex gap-2">
            {ORDER.map((k) => (
              <Link key={k} to={`/ring/${k}`}
                className={`border px-3 py-1 text-[10px] tracking-[0.2em] transition-colors ${k === variant ? "border-[#E8C57E] text-[#E8C57E]" : "border-[#FBF3EC]/30 text-[#FBF3EC]/70 hover:border-[#FBF3EC]"}`}
                style={jost}>{MAP[k].n}</Link>
            ))}
          </span>
        </div>

        {v.el}
        <Footer />
      </div>
    </>
  );
};

export default RingExample;
