import { Link } from "react-router-dom";
import founderImg from "@/assets/about-founder.webp";

const FounderStoryTeaser = () => (
  <section
    className="w-full py-16 md:py-20 lg:py-24"
    style={{ backgroundColor: "hsl(30 25% 96%)" }}
    aria-labelledby="founder-heading"
  >
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10">
      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 lg:gap-20">

        {/* Image */}
        <div className="w-full md:w-[340px] lg:w-[400px] flex-shrink-0">
          <div className="relative overflow-hidden" style={{ borderRadius: "2px", aspectRatio: "3/4" }}>
            <img
              src={founderImg}
              alt="Founder of Naira Flore — crafting Indo-Western fashion in Nashik"
              className="w-full h-full object-cover"
              width={400}
              height={533}
              loading="lazy"
            />
            {/* Subtle overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(74,47,34,0.12), transparent 50%)" }}
            />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 text-center md:text-left">
          <p
            className="font-cormorant text-[11px] uppercase tracking-[0.22em] mb-4"
            style={{ color: "hsl(186 35% 32%)" }}
          >
            Our Story
          </p>

          <h2
            id="founder-heading"
            className="font-cormorant text-[28px] md:text-[36px] lg:text-[44px] font-medium leading-[1.18] mb-5"
            style={{ color: "hsl(0 0% 14%)" }}
          >
            Born from a love of<br className="hidden md:block" />
            <em className="italic font-normal"> craft and colour</em>
          </h2>

          <p
            className="font-cormorant text-[16px] md:text-[17px] leading-[1.75] mb-4"
            style={{ color: "hsl(0 0% 38%)" }}
          >
            Naira Flore started in a small studio in Nashik, where every stitch was placed by hand 
            and every silhouette was imagined fresh. We believe that truly beautiful clothing shouldn't 
            compromise — it should be both rooted in tradition and alive to the moment.
          </p>

          <p
            className="font-cormorant text-[16px] md:text-[17px] leading-[1.75] mb-8"
            style={{ color: "hsl(0 0% 38%)" }}
          >
            Today, every piece we create carries that original promise: handmade, personal, 
            and made to be worn for a lifetime.
          </p>

          <Link
            to="/about"
            className="inline-flex items-center gap-2 font-cormorant text-[13px] uppercase tracking-[0.16em] font-medium pb-1 transition-opacity hover:opacity-70"
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
