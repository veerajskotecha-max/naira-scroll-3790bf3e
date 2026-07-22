import RingLivingFire from "@/components/jewellery/ringlab/RingLivingFire";
import RingMirrorPlinth from "@/components/jewellery/ringlab/RingMirrorPlinth";
import RingCinematic from "@/components/jewellery/ringlab/RingCinematic";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";

/* Internal review: three ways to improve the ring hero effect. */

const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const Bar = ({ n, label, note }: { n: string; label: string; note: string }) => (
  <div className="flex flex-wrap items-center justify-center gap-3 bg-[#1A1614] px-6 py-5 text-center">
    <span className="bg-[#E8C57E] px-3 py-1 text-[11px] font-medium tracking-[0.3em] text-[#1A1614]" style={jost}>VARIATION {n}</span>
    <span className="text-[13px] tracking-[0.2em] text-[#FBF3EC]" style={jost}>{label}</span>
    <span className="text-[11px] tracking-[0.15em] text-[#FBF3EC]/60" style={jost}>— {note}</span>
  </div>
);

const RingLab = () => (
  <>
    <PageSEO title="Ring Effect — Variations" description="Three ways to improve the ring hero." canonical="https://nairaflore.com/ring-lab" />
    <div className="pt-[94px] md:pt-[100px] lg:pt-[116px]">
      <Bar n="1" label="LIVING FIRE" note="rotating light-caustics + cursor sparkle on the stone" />
      <RingLivingFire />
      <Bar n="2" label="MIRROR PLINTH" note="reflection + sweeping studio light, boutique display" />
      <RingMirrorPlinth />
      <Bar n="3" label="CINEMATIC MACRO" note="silk push + lens-flare + oversized kinetic type" />
      <RingCinematic />
      <Footer />
    </div>
  </>
);

export default RingLab;
