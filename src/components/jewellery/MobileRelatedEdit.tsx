import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JewelPiece } from "@/data/jewellery";
import { shopifyImage } from "@/lib/shopifyImage";

type MobileRelatedEditProps = {
  current: JewelPiece;
  jewellery: JewelPiece[];
};

const ProductCopy = ({ piece, align = "left" }: { piece: JewelPiece; align?: "left" | "right" }) => (
  <div className={`min-w-0 pt-2 ${align === "right" ? "text-right" : "text-left"}`}>
    <p className="truncate font-cormorant text-[14px] leading-none text-foreground">{piece.name}</p>
    <p className="mt-1 font-sans text-[9px] uppercase tracking-nf-10 text-muted-foreground">
      {piece.availableForSale === false ? "Pre-order" : piece.priceLabel}
    </p>
  </div>
);

const ProductImage = ({ piece, sizes }: { piece: JewelPiece; sizes: string }) => (
  <img
    src={shopifyImage(piece.image, 640)}
    alt={piece.name}
    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
    loading="lazy"
    decoding="async"
    sizes={sizes}
  />
);

const MobileRelatedEdit = ({ current, jewellery }: MobileRelatedEditProps) => {
  const recommendations = useMemo(() => {
    const candidates = jewellery.filter((piece) => piece.handle !== current.handle && piece.image);
    const sameCategory = candidates.filter((piece) => piece.category === current.category);
    const otherCategories = candidates.filter((piece) => piece.category !== current.category);
    return [...sameCategory, ...otherCategories].slice(0, 5);
  }, [current.category, current.handle, jewellery]);

  if (recommendations.length < 5) return null;

  const [anchor, high, overlap, wide, tucked] = recommendations;

  return (
    <section className="overflow-hidden border-b border-border bg-background px-4 py-12 md:hidden" aria-labelledby="mobile-related-title">
      <header className="mb-8 flex flex-col items-center text-center">
        <p className="font-sans text-[9px] font-medium uppercase tracking-nf-15 text-primary">Curated for you</p>
        <h2 id="mobile-related-title" className="mt-2 font-cormorant text-[32px] italic leading-none text-foreground">
          You May Also Like
        </h2>
      </header>

      <div className="mx-auto grid max-w-[390px] grid-cols-12 gap-3">
        <Link to={`/jewellery/${anchor.handle}`} className="group relative col-span-8 row-span-2 block pb-5">
          <div className="aspect-square overflow-hidden bg-muted">
            <ProductImage piece={anchor} sizes="67vw" />
          </div>
          <div className="absolute bottom-0 -left-1 max-w-[90%] border border-border bg-background px-2.5 py-2 shadow-sm">
            <ProductCopy piece={anchor} />
          </div>
        </Link>

        <Link to={`/jewellery/${high.handle}`} className="group col-span-4 mt-7 block">
          <div className="aspect-square overflow-hidden bg-muted">
            <ProductImage piece={high} sizes="33vw" />
          </div>
          <ProductCopy piece={high} />
        </Link>

        <Link to={`/jewellery/${overlap.handle}`} className="group relative z-10 col-span-5 -mt-7 block">
          <div className="aspect-square overflow-hidden border-4 border-background bg-muted shadow-md">
            <ProductImage piece={overlap} sizes="42vw" />
          </div>
          <ProductCopy piece={overlap} align="right" />
        </Link>

        <Link to={`/jewellery/${wide.handle}`} className="group relative z-10 col-span-7 mt-1 block">
          <div className="aspect-square overflow-hidden bg-muted">
            <ProductImage piece={wide} sizes="58vw" />
          </div>
          {wide.availableForSale === false && (
            <span className="absolute right-2 top-2 bg-foreground px-2 py-1 font-sans text-[8px] uppercase tracking-nf-10 text-background">
              Pre-order
            </span>
          )}
          <div className="relative bg-background pr-2">
            <ProductCopy piece={wide} />
          </div>
        </Link>

        <Link to={`/jewellery/${tucked.handle}`} className="group relative col-start-7 col-span-6 -mt-3 block">
          <div className="aspect-square overflow-hidden border-4 border-background bg-muted shadow-md">
            <ProductImage piece={tucked} sizes="50vw" />
          </div>
          <ProductCopy piece={tucked} />
        </Link>
      </div>

      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline" className="h-11 border-foreground px-8 font-sans text-[9px] uppercase tracking-nf-15">
          <Link to="/jewellery">
            Explore all <ArrowUpRight size={13} />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default MobileRelatedEdit;