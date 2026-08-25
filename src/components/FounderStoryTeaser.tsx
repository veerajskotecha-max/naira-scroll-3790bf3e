import { Link } from "react-router-dom";
import founderImg from "@/assets/about-founder.webp";

/* Founder story teaser.
   Portrait is deliberately small and framed like an editorial inset —
   a face shot at full column width overwhelmed the copy on every
   breakpoint. Text column is capped at a comfortable measure so line
   length stays readable on wide desktops. */

const FounderStoryTeaser = () => (
  <section
    className="w-full py-14 md:py-20 lg:py-24"
    style={{ backgroundColor: "hsl(30 25% 96%)" }}
    aria-labelledby="founder-heading"
  >
    <div className="max-w-[1100px] mx-auto px-5 md:px-8 lg:px-10">
      <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-14 lg:gap-20">

        {/* Portrait — small, framed inset */}
        <figure className="flex-shrink-0 m-0 flex flex-col items-center md:items-start">
          <div
            className="relative"
            style={{ padding: "8px", border: "1px solid hsl(30 18% 84%)", borderRadius: "2px" }}
          >
            <div
              className="relative overflow-hidden w-[150px] sm:w-[170px] md:w-[190px] lg:w-[215px]"
              style={{ borderRadius: "1px", aspectRatio: "4/5" }}
            >
              <img
                src={founderImg}
                alt="Sonal, founder of Naira Flore, in her Nashik studio"
                className="w-full h-full object-cover"
                width={430}
                height={538}
                loading="lazy"
              />
            </div>
          </div>

          <figcaption className="mt-4 text-center md:text-left">
            <p
              className="font-cormorant text-[15px] md:text-[16px] leading-none"
              style={{ color: "hsl(0 0% 18%)" }}
            >
              Sonal Kotecha
            </p>
            <p
              className="font-cormorant text-[10px] uppercase tracking-[0.2em] mt-2"
              style={{ color: "hsl(186 35% 32%)" }}
            >
              Founder, Nashik
            </p>
          </figcaption>
        </figure>

        {/* Text */}
        <div className="flex-1 max-w-[600px] text-center md:text-left">
          <p
            className="font-cormorant text-[11px] uppercase tracking-[0.22em] mb-3 md:mb-4"
            style={{ color: "hsl(186 35% 32%)" }}
          >
            Our Story
          </p>

          <h2
            id="founder-heading"
            className="font-cormorant text-[26px] md:text-[32px] lg:text-[38px] font-medium leading-[1.2] mb-4 md:mb-5"
            style={{ color: "hsl(0 0% 14%)" }}
          >
            Born from a love of
            <em className="italic font-normal"> craft and colour</em>
          </h2>

          <span
            className="block w-10 h-px mx-auto md:mx-0 mb-5"
            style={{ backgroundColor: "hsl(30 18% 78%)" }}
            aria-hidden="true"
          />

          <p
            className="font-cormorant text-[15px] md:text-[16.5px] leading-[1.8] mb-4"
            style={{ color: "hsl(0 0% 38%)" }}
          >
            Naira Flore started in a small studio in Nashik, where every stitch was placed by hand
            and every silhouette was imagined fresh. Beautiful clothing shouldn't compromise: it can
            be rooted in tradition and alive to the moment.
          </p>

          <p
            className="font-cormorant text-[15px] md:text-[16.5px] leading-[1.8] mb-7 md:mb-8"
            style={{ color: "hsl(0 0% 38%)" }}
          >
            Today, every piece carries that original promise: handmade, personal, and made to be
            worn for a lifetime.
          </p>

          <Link
            to="/about"
            className="inline-flex items-center gap-2 font-cormorant text-[12px] md:text-[13px] uppercase tracking-[0.16em] font-medium pb-1 transition-opacity hover:opacity-70"
            style={{
              color: "hsl(0 0% 18%)",
              borderBottom: "1px solid hsl(0 0% 18%)",
            }}
          >
            Read the full story
            <span className="text-[16px]">›</span>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default FounderStoryTeaser;
