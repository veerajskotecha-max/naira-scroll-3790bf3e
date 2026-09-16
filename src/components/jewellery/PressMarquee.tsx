import timesOfIndiaLogo from "@/assets/press/times-of-india.svg";
import maharashtraTimesLogo from "@/assets/press/maharashtra-times.jpg";
import lokmatLogo from "@/assets/press/lokmat.png";
import timesNowLogo from "@/assets/press/times-now.svg";
import fashionistaLogo from "@/assets/press/fashionista.png";

const pressLogos = [
  { name: "The Times of India", src: timesOfIndiaLogo, className: "h-10 w-[138px] md:h-12 md:w-[166px]" },
  { name: "Maharashtra Times", src: maharashtraTimesLogo, className: "h-12 w-12 md:h-14 md:w-14" },
  { name: "Lokmat", src: lokmatLogo, className: "h-9 w-[134px] md:h-10 md:w-[149px]" },
  { name: "Times Now", src: timesNowLogo, className: "h-11 w-[88px] md:h-12 md:w-24" },
  { name: "Fashionista", src: fashionistaLogo, className: "h-9 w-[140px] md:h-10 md:w-[156px]" },
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
            {pressLogos.map((publication) => (
              <div key={`${copy}-${publication.name}`} className="flex items-center">
                <div className="flex h-16 w-[210px] items-center justify-center px-7 opacity-70 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 md:w-[250px] md:px-10">
                  <img
                    src={publication.src}
                    alt={`${publication.name} logo`}
                    className={`object-contain ${publication.className}`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
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