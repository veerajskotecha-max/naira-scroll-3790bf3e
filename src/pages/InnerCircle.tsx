import { Link } from "react-router-dom";
import PageSEO from "@/components/PageSEO";
import Footer from "@/components/Footer";
import JoinInnerCircleForm from "@/components/members/JoinInnerCircleForm";


/* The Inner Circle — a quiet holding page for the members' list.
   Live at /innercircle (and /inner-circle) so the link can be shared now. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const WHATSAPP =
  "https://wa.me/919561557935?text=" +
  encodeURIComponent("Hi Naira Flore — I'd like to join the Inner Circle.");

const InnerCircle = () => (
  <>
    <PageSEO
      title="The Inner Circle | Naira Flore"
      description="Naira Flore's Inner Circle — early access to new jewellery, private previews and members-only pricing. Opening soon."
      canonical="https://nairaflore.com/innercircle"
    />
    <main className="min-h-[100svh] bg-[#FBF3EC] pt-[110px] text-[#1A1614] md:pt-[130px]">
      <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-16 text-center md:py-24">
        <p className="text-[10px] tracking-[0.45em] text-[#B0843A]" style={jost}>
          BY INVITATION
        </p>

        <h1 className="mt-5 text-[clamp(2.4rem,9vw,4.4rem)] leading-[1.05]" style={velista}>
          The Inner <span className="italic text-[#B0843A]" style={editorial}>Circle.</span>
        </h1>

        <span className="mt-8 block h-px w-16 bg-[#C99A4C]/60" aria-hidden />

        <p className="mt-8 max-w-md text-[1.05rem] italic leading-[1.6] text-[#1A1614]/70" style={editorial}>
          A small room for the people who wear us first — private previews, early
          access to every new piece, and prices kept for members alone.
        </p>

        <p className="mt-10 text-[11px] tracking-[0.42em] text-[#1A1614]/45" style={jost}>
          OPENING SOON
        </p>

        <div className="mt-10 flex w-full max-w-[360px] flex-col items-center gap-4">
          <JoinInnerCircleForm source="inner-circle" cta="Join the Inner Circle" />
          <Link
            to="/auth"
            className="border-b border-[#B0843A] pb-1 text-[10px] tracking-[0.3em] text-[#8A6A2F]"
            style={jost}
          >
            REGISTER NOW / SIGN IN →
          </Link>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[0.3em] text-[#1A1614]/45"
            style={jost}
          >
            OR REQUEST AN INVITATION ON WHATSAPP
          </a>
        </div>

      </section>
      <Footer />
    </main>
  </>
);

export default InnerCircle;
