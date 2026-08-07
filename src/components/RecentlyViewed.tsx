import { Link } from "react-router-dom";
import { useRecentlyViewed, type ViewedItem } from "@/hooks/useRecentlyViewed";
import { shopifyImage } from "@/lib/shopifyImage";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const jost = { fontFamily: "var(--nf-font-label)" } as const;

/**
 * Horizontal rail of the shopper's last-viewed pieces. Renders nothing until
 * there is real browsing history, so a first visit stays clean.
 */
const RecentlyViewed = ({ current }: { current?: ViewedItem }) => {
  const items = useRecentlyViewed(current);
  if (items.length < 2) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 pt-4 sm:px-6" aria-label="Recently viewed">
      <h2 className="text-[22px] leading-tight md:text-[26px]" style={velista}>
        Recently viewed
      </h2>
      <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.slice(0, 8).map((i) => (
          <Link key={i.handle} to={i.to} className="w-[140px] shrink-0 snap-start sm:w-[170px]">
            <div className="aspect-[4/5] overflow-hidden bg-nf-ivory-deep">
              {i.image && (
                <img
                  src={shopifyImage(i.image, 340)}
                  alt={i.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              )}
            </div>
            <p className="mt-2 truncate text-[12.5px] text-nf-ink/80">{i.name}</p>
            <p className="text-[11.5px] text-nf-ink/55" style={{ ...jost, fontVariantNumeric: "tabular-nums" }}>
              {i.price}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
