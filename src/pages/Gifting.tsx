import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import PageSEO, { breadcrumbLd } from "@/components/PageSEO";
import JewelCard from "@/components/jewellery/JewelCard";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { SITE_URL } from "@/data/siteMeta";
import { WHATSAPP_NUMBER } from "@/data/jewellery";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "var(--nf-font-editorial)" } as const;
const jost = { fontFamily: "var(--nf-font-label)" } as const;

const priceEdits = [
  { label: "Under ₹1,000", to: "/jewellery?under=1000" },
  { label: "Under ₹1,500", to: "/jewellery?under=1500" },
  { label: "Under ₹2,500", to: "/jewellery?under=2500" },
];

const forWhom = [
  { title: "For Her", copy: "Demi-fine everyday pieces she will actually reach for.", to: "/jewellery?category=Necklaces" },
  { title: "For the Bride", copy: "Zircone sets that read fine at wedding-light distance.", to: "/jewellery?category=Earrings" },
  { title: "For a First Gift", copy: "Quiet rings and bracelets that suit any wrist or finger.", to: "/jewellery?category=Bracelets" },
];

/** Gifting hub — a merchandised entry point rather than a new catalogue. */
const Gifting = () => {
  const { jewellery } = useLiveJewellery();
  const picks = jewellery.slice(0, 6);

  return (
    <>
      <PageSEO
        title="Jewellery Gifts for Her, Demi-Fine Gifting | Naira Flore"
        description="Gift demi-fine jewellery from Naira Flore: anti-tarnish 18K gold-finish rings, earrings, necklaces and bracelets, boxed and ready to give. Gifts under ₹1,500 and up."
        canonical={`${SITE_URL}/gifting`}
        jsonLd={[
          breadcrumbLd([
            { name: "Home", url: `${SITE_URL}/` },
            { name: "Gifting", url: `${SITE_URL}/gifting` },
          ]),
        ]}
      />
      <div className="bg-nf-ivory pt-[94px] text-nf-ink md:pt-[100px] lg:pt-[116px]">
        <header className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 md:pt-14">
          <p className="text-[10px] tracking-nf-40 text-nf-gold-shadow" style={jost}>
            THE GIFT EDIT
          </p>
          <h1 className="mt-3 text-[32px] leading-[1.05] md:text-[52px]" style={velista}>
            Gifting
          </h1>
          <p className="mt-4 max-w-xl text-[14px] leading-[1.85] text-nf-ink/65 md:text-[16px]" style={editorial}>
            Every piece arrives boxed and anti-tarnish sealed, ready to hand over. Choose by budget, by occasion, or ask
            the atelier and we will help you pick.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {priceEdits.map((p) => (
              <Link
                key={p.label}
                to={p.to}
                className="press-scale inline-flex min-h-[44px] items-center border border-nf-ink/25 px-5 text-[10px] tracking-nf-22 text-nf-ink/75 transition-colors hover:border-nf-ink hover:text-nf-ink"
                style={jost}
              >
                {p.label.toUpperCase()}
              </Link>
            ))}
          </div>
        </header>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-12 sm:grid-cols-3 sm:px-6">
          {forWhom.map((c) => (
            <Link key={c.title} to={c.to} className="group border border-nf-ink/12 p-6 transition-colors hover:border-nf-ink/40">
              <h2 className="text-[22px] leading-tight md:text-[26px]" style={velista}>
                {c.title}
              </h2>
              <p className="mt-2 text-[13.5px] leading-[1.8] text-nf-ink/60" style={editorial}>
                {c.copy}
              </p>
              <span className="mt-4 inline-block text-[10px] tracking-nf-22 text-nf-gold-deep" style={jost}>
                EXPLORE →
              </span>
            </Link>
          ))}
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="text-[24px] leading-tight md:text-[30px]" style={velista}>
            Easy pieces to gift
          </h2>
          <div className="mt-7 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            {picks.map((piece, i) => (
              <JewelCard key={piece.handle} piece={piece} index={i} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="border border-nf-ink/12 p-7 text-center sm:p-10">
            <h2 className="text-[24px] leading-tight md:text-[30px]" style={velista}>
              Not sure what to choose?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-[1.85] text-nf-ink/60" style={editorial}>
              Tell us who it is for and your budget. We will send back three options with photographs.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                "Hi Naira Flore, I'm choosing a gift. Could you help me pick?"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="press-scale mt-6 inline-flex min-h-[48px] items-center border border-nf-ink px-7 text-[10.5px] tracking-nf-28 text-nf-ink transition-colors hover:bg-nf-ink hover:text-nf-ivory"
              style={jost}
            >
              ASK THE ATELIER
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Gifting;
