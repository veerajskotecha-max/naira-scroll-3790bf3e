import ConceptA from "@/components/jewellery/concepts/ConceptA";
import ConceptB from "@/components/jewellery/concepts/ConceptB";
import ConceptC from "@/components/jewellery/concepts/ConceptC";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";

/* Internal review page: the three jewellery-section concepts stacked
   with labels, so the client can compare and approve one. */

const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const Divider = ({ label, note }: { label: string; note: string }) => (
  <div className="flex items-center justify-center gap-4 bg-[#1A1614] px-6 py-5 text-center">
    <span className="bg-[#E8C57E] px-3 py-1 text-[11px] font-medium tracking-[0.3em] text-[#1A1614]" style={jost}>{label}</span>
    <span className="text-[11px] tracking-[0.2em] text-[#FBF3EC]/70" style={jost}>{note}</span>
  </div>
);

const Concepts = () => (
  <>
    <PageSEO title="Jewellery Section Concepts — Naira Flore" description="Internal design review: three concepts." canonical="https://nairaflore.com/concepts" />
    <div className="pt-[94px] md:pt-[100px] lg:pt-[116px]">
      <Divider label="CONCEPT A" note="THE IVORY ATELIER · BRAND-LIGHT · DRAG TO SPIN" />
      <ConceptA />
      <Divider label="CONCEPT B" note="THE EMERALD JEWEL BOX · NIGHT VITRINE · DRAG TO SPIN" />
      <ConceptB />
      <Divider label="CONCEPT C" note="GOLDEN HOUR · TERRACOTTA ARCHES · DRAG TO SPIN" />
      <ConceptC />
      <Footer />
    </div>
  </>
);

export default Concepts;
