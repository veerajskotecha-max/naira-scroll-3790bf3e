import timesOfIndiaLogo from "@/assets/press/times-of-india.svg";
import maharashtraTimesLogo from "@/assets/press/maharashtra-times.jpg";
import lokmatLogo from "@/assets/press/lokmat.png";
import timesNowLogo from "@/assets/press/times-now.svg";
import fashionistaLogo from "@/assets/press/fashionista.png";

const pressLogos = [
  { name: "The Times of India", src: timesOfIndiaLogo, className: "h-10 w-[138px] md:h-12 md:w-[166px]" },
  /* An app icon, not a wordmark: its pale ground is taken out in pdp.css. */
  { name: "Maharashtra Times", src: maharashtraTimesLogo, className: "pdp-press__mark--tile h-14 w-14 md:h-16 md:w-16" },
  { name: "Lokmat", src: lokmatLogo, className: "h-9 w-[134px] md:h-10 md:w-[149px]" },
  { name: "Times Now", src: timesNowLogo, className: "h-11 w-[88px] md:h-12 md:w-24" },
  { name: "Fashionista", src: fashionistaLogo, className: "h-9 w-[140px] md:h-10 md:w-[156px]" },
];

/*
  "As featured in": a credit line on the product page, not a section to read.
  A centred caps label over the five publications' marks in grey; no colour on
  hover, no dots between them, no rules above or below. A phone shows them as
  a slow moving row (still under reduced motion); a laptop has the room to
  show all five at once, so there they stand still. The page's own rule
  (index.css) multiplies the marks onto the ivory ground.
*/
const PressMarquee = () => (
  <section className="overflow-hidden pt-12 lg:pt-16" aria-labelledby="press-heading">
    <h2 id="press-heading" className="nc-label text-center">
      As featured in
    </h2>
    <div className="mt-4 overflow-hidden" role="region" aria-label="Press features">
      <div className="flex w-max animate-[marquee_26s_linear_infinite] items-center motion-reduce:animate-none md:mx-auto md:w-full md:max-w-[1100px] md:animate-none md:px-6">
        {[0, 1].map((copy) => (
          <div key={copy} className={`flex shrink-0 items-center ${copy === 1 ? "md:hidden" : "md:w-full md:justify-between"}`} aria-hidden={copy === 1}>
            {pressLogos.map((publication) => (
              <div key={`${copy}-${publication.name}`} className="flex h-16 w-[210px] items-center justify-center px-7 md:w-auto md:px-0">
                {/* Grey and softened on the mark itself, not on its box: a
                    faded box is its own layer, and the white ground of a JPG
                    or PNG mark then showed as a pale square instead of
                    multiplying away into the ivory. */}
                <img src={publication.src} alt={`${publication.name} logo`} className={`object-contain opacity-70 grayscale ${publication.className}`} loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PressMarquee;
