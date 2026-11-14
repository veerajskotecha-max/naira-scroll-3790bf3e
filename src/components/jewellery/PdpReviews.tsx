import { useState } from "react";
import { ChevronDown, PenLine, Star } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import WriteReviewModal from "@/components/WriteReviewModal";
import { getSupabase } from "@/integrations/supabase/lazy";
import { toast } from "@/hooks/use-toast";
import { reviewThumb } from "@/data/reviewThumbs";
import type { PageReviews } from "@/hooks/useApprovedReviews";

/*
  The product page's reviews, in the look of the old review wall: a featured
  quote, the customers' own photos (tap to open), more reviews on demand, and
  a way to write one. What fills it is only what customers wrote: reviews
  approved for this piece first, then the team's genuine customer reviews
  with their photographs (data/realReviews.ts), the one about this kind of
  piece leading. Those are about pieces across the range, and the line under
  the heading says so.

  A review written here goes to Supabase for approval and appears once
  approved. Thumbnails are square: the brand's radius is 0 (CLAUDE.md).
*/

const Stars = ({ value, size = 12 }: { value: number; size?: number }) => (
  <span className="inline-flex gap-[2px]" aria-hidden="true">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={size} strokeWidth={1.4} className="text-nf-gold-deep" fill={i <= Math.round(value) ? "currentColor" : "none"} />
    ))}
  </span>
);

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

type Props = {
  productName: string;
  data: PageReviews;
  whatsappHref: string;
};

const PdpReviews = ({ productName, data, whatsappHref }: Props) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [featuredFull, setFeaturedFull] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const submit = async (review: { name: string; rating: number; text: string; images: string[] }) => {
    const supabase = await getSupabase();
    const { error } = await supabase.from("customer_reviews").insert({
      product_name: productName,
      variant: "jewellery",
      name: review.name,
      rating: review.rating,
      text: review.text,
      images: review.images,
    });
    toast(
      error
        ? { title: "We couldn't save your review", description: "Please try again, or share it with us on WhatsApp.", variant: "destructive" }
        : { title: "Thank you", description: "Your review appears here once we have checked it." },
    );
  };

  const [featured, ...rest] = data.reviews;
  const photos = data.reviews.flatMap((r) => r.images).filter((p, i, all) => all.indexOf(p) === i);

  return (
    <section id="customer-reviews" className="mx-auto max-w-[1400px] scroll-mt-[120px] px-4 pb-8 md:px-6 md:pt-8" aria-labelledby="pdp-reviews">
      <div className="mx-auto max-w-[720px] border-y border-nf-gold/20 py-6">
        <p className="font-nf-label text-[11px] uppercase tracking-nf-8 text-nf-gold-text">Kind words</p>
        <h2 id="pdp-reviews" className="mt-1 font-cormorant text-[27px] font-semibold leading-none text-nf-ink">
          Customer reviews
        </h2>
        {/* Under the heading, not beside it: beside, the heading wrapped to
            two lines at 360px. */}
        {data.count > 0 && data.rating !== null && (
          <p className="mt-3 flex items-center gap-2 text-[12.5px] text-nf-ink/80" aria-label={`${data.rating.toFixed(1)} out of 5, from ${data.count} reviews`}>
            <span className="font-cormorant text-[20px] font-semibold leading-none text-nf-ink">{data.rating.toFixed(1)}</span>
            <Stars value={data.rating} size={14} />
            <span>
              {data.count} {data.count === 1 ? "review" : "reviews"}
            </span>
          </p>
        )}
        {data.count > 0 && (
          <p className="mt-2 text-[12px] text-nf-ink/70">
            {data.ownCount > 0
              ? `${data.ownCount} on this piece; the rest from Naira customers across our pieces, with their own photos.`
              : "From Naira customers across our pieces, with their own photos."}
          </p>
        )}

        {featured ? (
          <article className="mt-5">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center bg-nf-ivory-deep text-[10px] font-medium text-nf-ink">
                {initialsOf(featured.name)}
              </span>
              <div>
                <p className="text-[12.5px] font-medium text-nf-ink">{featured.name}</p>
                <p className="flex items-center gap-2 text-[11px] text-nf-ink/60">
                  <Stars value={featured.rating} size={11} />
                  {featured.date}
                </p>
              </div>
            </div>
            {/* The body face: the site's serif sets in capitals, which made a
                quote of three lines unreadable. */}
            <p className={`mt-3 text-[14.5px] leading-[1.65] text-nf-ink/85 ${featuredFull ? "" : "line-clamp-3"}`}>“{featured.text}”</p>
            {featured.text.length > 140 && (
              <button type="button" onClick={() => setFeaturedFull((v) => !v)} className="mt-1 min-h-[44px] text-[12px] text-nf-ink underline decoration-nf-gold underline-offset-4">
                {featuredFull ? "Show less" : "Read full review"}
              </button>
            )}
          </article>
        ) : (
          <p className="mt-4 text-[13px] leading-[1.6] text-nf-ink/75">No reviews for this piece yet. Bought it? Tell others what you think.</p>
        )}

        {photos.length > 0 && (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-nf-gold/20 pt-4">
            <ul className="flex gap-1.5" aria-label="Customer photos">
              {photos.slice(0, 5).map((src, i) => (
                <li key={src}>
                  <button
                    type="button"
                    onClick={() => setPhoto(src)}
                    className="block h-12 w-12 overflow-hidden border border-nf-gold/25 bg-nf-ivory-deep"
                    aria-label={`Open customer photo ${i + 1} of ${photos.length}`}
                  >
                    {/* loading before src: React sets attributes in the order
                        written, and a src first starts the fetch before the
                        image is told it is lazy (see CustomerReviews). */}
                    <img loading="lazy" decoding="async" src={reviewThumb(src)} alt="" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
            {rest.length > 0 && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-controls="pdp-more-reviews"
                className="flex min-h-[44px] shrink-0 items-center gap-1.5 font-nf-label text-[11px] uppercase tracking-nf-8 text-nf-ink/70 hover:text-nf-ink"
              >
                {expanded ? "Show less" : `${rest.length} more`}
                <ChevronDown size={14} className={`transition-transform duration-300 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {expanded && rest.length > 0 && (
          <ul id="pdp-more-reviews" className="mt-4 grid gap-3 sm:grid-cols-2">
            {rest.map((r, i) => (
              <li key={`${r.name}-${i}`} className="grid content-start gap-2 border border-nf-gold/20 p-4">
                <div className="flex items-center justify-between gap-3 text-[12px]">
                  <span className="font-medium text-nf-ink">{r.name}</span>
                  <span className="text-nf-ink/60">{r.date}</span>
                </div>
                <Stars value={r.rating} size={11} />
                <p className="text-[13.5px] leading-[1.6] text-nf-ink/85">“{r.text}”</p>
                {r.images.length > 0 && (
                  <div className="mt-1 flex gap-1.5">
                    {r.images.slice(0, 3).map((src) => (
                      <button key={src} type="button" onClick={() => setPhoto(src)} className="block h-12 w-12 overflow-hidden border border-nf-gold/25" aria-label={`Open ${r.name}'s photo`}>
                        <img loading="lazy" decoding="async" src={reviewThumb(src)} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 grid gap-2 sm:grid-cols-[auto_auto] sm:justify-start sm:gap-5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="press-scale inline-flex h-11 items-center justify-center gap-2 border border-nf-ink px-6 font-nf-label text-[11px] uppercase tracking-nf-16 text-nf-ink transition-colors hover:bg-nf-ink hover:text-nf-ivory"
          >
            <PenLine size={14} strokeWidth={1.6} aria-hidden="true" /> Write a review
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center text-[12px] text-nf-ink underline decoration-nf-gold underline-offset-4"
          >
            Ask us on WhatsApp
          </a>
        </div>
      </div>

      <WriteReviewModal open={open} onOpenChange={setOpen} onSubmit={submit} />
      {/* Radix names the dialog from its Title and logs an error without one. */}
      <Dialog open={photo !== null} onOpenChange={(v) => !v && setPhoto(null)}>
        <DialogContent className="max-w-lg bg-nf-ivory p-2" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Customer photo</DialogTitle>
          {photo && <img src={photo} alt="Customer photo" className="h-auto w-full" />}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PdpReviews;
