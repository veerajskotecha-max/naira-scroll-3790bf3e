const pressNames = [
  { name: "THE TIMES OF INDIA", className: "font-serif text-[17px] font-semibold md:text-[21px]" },
  { name: "महाराष्ट्र टाइम्स", className: "font-sans text-[17px] font-semibold md:text-[20px]" },
  { name: "लोकमत", className: "font-sans text-[22px] font-bold md:text-[26px]" },
  { name: "TIMES NOW", className: "font-sans text-[17px] font-bold md:text-[20px]" },
  { name: "FASHIONISTA", className: "font-serif text-[18px] italic md:text-[22px]" },
];

const PressMarquee = () => (
  <section className="overflow-hidden border-y border-border bg-background py-7 md:py-9" aria-labelledby="press-heading">
    <h2 id="press-heading" className="mb-6 text-center font-sans text-[10px] font-medium uppercase tracking-nf-15 text-muted-foreground">
      As featured in
    </h2>
    <div className="group relative overflow-hidden" role="region" aria-label="Press features">
      <div className="flex w-max animate-[marquee_26s_linear_infinite] items-center group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {pressNames.map((publication) => (
              <div key={`${copy}-${publication.name}`} className="flex items-center">
                <span className={`whitespace-nowrap px-7 text-foreground/65 transition-colors duration-300 group-hover:text-foreground md:px-12 ${publication.className}`}>
                  {publication.name}
                </span>
                <span className="h-1 w-1 bg-primary/55" aria-hidden="true" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PressMarquee;