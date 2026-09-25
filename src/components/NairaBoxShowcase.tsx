import NairaBox3D from "@/components/NairaBox3D";

/*
  The box on its own packshot band just above the footer, large and on a light
  ground as the bag is on bluorng.com, with the brand line under it.

  The plating words are the listings' own. Every piece is described as "18K gold
  tone plated" or "rhodium plated"; "18K gold" alone would claim gold content
  the pieces do not have. Materials are left out on purpose: most pieces are
  surgical stainless steel, but some are copper alloy with sterling posts.

  "Arrives in the Naira gift box" is what 53 of the 56 live listings already
  show in their photo galleries — the box is the packaging, not a prop. On a
  product page it answers the gifting question at the point it is asked.
*/
const NairaBoxShowcase = () => (
  <section data-quiet-zone aria-label="The Naira gift box" className="bg-[var(--nf-surface-raised)] px-4 pb-12 pt-4 md:pb-16 md:pt-8">
    {/* A keepsake, not a hero: sized well under the column so the line below
        it carries the band. */}
    <NairaBox3D className="w-[72%] max-w-[340px]" />
    <div className="mx-auto -mt-2 flex max-w-[460px] flex-col items-center text-center">
      <p className="flex items-center gap-2.5 font-nf-label text-[10px] font-medium uppercase tracking-nf-20 text-[var(--nf-accent-quiet)] md:text-[11px] md:tracking-nf-24">
        <span aria-hidden="true" className="h-px w-4 bg-[var(--nf-accent)] md:w-8" />
        18K gold tone · rhodium plated
        <span aria-hidden="true" className="h-px w-4 bg-[var(--nf-accent)] md:w-8" />
      </p>
      {/* Velista sets in capitals only, so the display line stays short and
          the thought finishes in the editorial italic. */}
      <h2 className="mt-4 whitespace-nowrap font-nf-display text-[26px] leading-none text-[var(--nf-text)] min-[400px]:text-[29px] md:text-[40px]">
        Luxury chic jewellery
      </h2>
      <p className="mt-2 font-nf-editorial text-[19px] italic leading-snug text-[color:rgb(var(--nf-ink-rgb)/0.7)] md:text-[22px]">
        Crafted for the moments you keep.
      </p>
      <p className="mt-6 font-nf-label text-[11px] uppercase tracking-nf-16 text-[color:rgb(var(--nf-ink-rgb)/0.55)]">
        Every piece arrives in the Naira gift box
      </p>
    </div>
  </section>
);

export default NairaBoxShowcase;
