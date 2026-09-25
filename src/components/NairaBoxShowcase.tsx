import NairaBox3D from "@/components/NairaBox3D";

/*
  The box on its own packshot band just above the footer, large and on a light
  ground as the bag is on bluorng.com, with one line of copy under it.

  The copy uses the listings' own words. Every piece is described as "18K gold
  tone plated" or "rhodium plated"; "18K gold" alone would claim gold content
  the pieces do not have. Materials are left out on purpose: most pieces are
  surgical stainless steel, but some are copper alloy with sterling posts.
*/
const NairaBoxShowcase = () => (
  <section aria-label="The Naira box" className="bg-[var(--nf-surface-raised)] px-4 pb-12 pt-6 md:pb-16 md:pt-10">
    <NairaBox3D className="max-w-[520px]" />
    <div className="mx-auto -mt-2 flex max-w-[440px] flex-col items-center gap-3 text-center">
      <p className="font-nf-label text-[10.5px] font-medium uppercase tracking-nf-24 text-[var(--nf-accent-quiet)]">
        18K gold tone &amp; rhodium plated
      </p>
      {/* Velista sets in capitals only, so the display line stays short and
          the rest follows in the editorial italic. */}
      <h2 className="font-nf-display text-[30px] leading-[1.05] text-[var(--nf-text)] md:text-[38px]">
        Luxury chic jewellery
      </h2>
      <p className="-mt-1 font-nf-editorial text-[19px] italic leading-snug text-[color:rgb(var(--nf-ink-rgb)/0.7)] md:text-[21px]">
        Crafted for the moments you keep.
      </p>
    </div>
  </section>
);

export default NairaBoxShowcase;
