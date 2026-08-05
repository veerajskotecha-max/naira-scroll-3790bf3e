import { useMemo } from "react";
import { CircularGallery, type GalleryItem } from "@/components/ui/circular-gallery";
import { jewellery } from "@/data/jewellery";

/**
 * A slow-turning ring of pieces from the collection, shown at the foot of
 * every product page. Items are picked at random per render seed so the
 * carousel feels different from page to page.
 */
const CollectionCarousel = ({
  excludeHandle,
  title = "From the collection",
  subtitle = "Scroll to turn the carousel",
}: {
  excludeHandle?: string;
  title?: string;
  subtitle?: string;
}) => {
  const items = useMemo<GalleryItem[]>(() => {
    const pool = jewellery.filter((p) => p.handle !== excludeHandle);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    return shuffled.map((p) => ({
      common: p.name,
      binomial: p.category,
      href: `/jewellery/${p.handle}`,
      photo: { url: p.image, text: `${p.name}, ${p.category.toLowerCase()} by Naira Flore` },
    }));
  }, [excludeHandle]);

  if (items.length === 0) return null;

  return (
    <section className="py-14 md:py-20" style={{ backgroundColor: "#FBF7F2" }} aria-label={title}>
      <div className="text-center px-4">
        <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "#B0843A" }}>
          The Gilded Hour
        </p>
        <h2 className="mt-2 font-cormorant text-[26px] md:text-[34px]" style={{ color: "#1A1614" }}>
          {title}
        </h2>
        <p className="mt-1.5 text-[11px] tracking-[0.14em]" style={{ color: "hsl(0 0% 48%)" }}>
          {subtitle}
        </p>
      </div>
      <CircularGallery items={items} className="mt-6 md:mt-8" radius={480} />
    </section>
  );
};

export default CollectionCarousel;
