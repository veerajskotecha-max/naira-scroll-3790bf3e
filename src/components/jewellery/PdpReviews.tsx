import { useState } from "react";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import WriteReviewModal from "@/components/WriteReviewModal";
import { getSupabase } from "@/integrations/supabase/lazy";
import { toast } from "@/hooks/use-toast";
import { reviewCard } from "@/data/reviewCards";
import type { PageReview, PageReviews } from "@/hooks/useApprovedReviews";

/*
  The product page's reviews, photo first: a swipeable row of cards, each led
  by the customer's own photograph, then who, when, the stars and the quote;
  a card opens to the whole review and every photo in it. The photos are the
  page's strongest honest proof, and as 48px thumbnails two screens down,
  behind three folds, almost nobody saw them (critique of 14 Nov 2026).

  What fills it is only what customers wrote: reviews approved for this piece
  first, then the team's genuine customer reviews with their photographs
  (data/realReviews.ts), the one about this kind of piece leading, the two
  without photos last. Those are about pieces across the range, and the line
  under the heading says so.

  A review written here goes to Supabase for approval and appears once
  approved. Corners are square: the brand's radius is 0 (CLAUDE.md).
*/

/* The stars carry their value in words for a screen reader: drawn alone they
   left every review without its score. */
const Stars = ({ value, size = 12 }: { value: number; size?: number }) => (
  <span className="inline-flex gap-[2px]">
    <span className="sr-only">Rated {value} out of 5</span>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={size} strokeWidth={1.4} className="text-nf-gold-deep" fill={i <= Math.round(value) ? "currentColor" : "none"} aria-hidden="true" />
    ))}
  </span>
);

type Props = {
  productName: string;
  data: PageReviews;
  whatsappHref: string;
};

const PdpReviews = ({ productName, data, whatsappHref }: Props) => {
  const [writing, setWriting] = useState(false);
  const [openReview, setOpenReview] = useState<PageReview | null>(null);
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

  /* In the hook's order: this piece's approved reviews, then the ones about
     its kind of piece, photographs first within each. */
  const cards = data.reviews;

  return (
    <section id="customer-reviews" className="mt-8 scroll-mt-[120px] border-t border-nf-gold/20 pt-6" aria-labelledby="pdp-reviews">
      <h2 id="pdp-reviews" className="font-cormorant text-[20px] font-semibold leading-none text-nf-ink">
        Customer reviews
      </h2>
      {data.count > 0 && data.rating !== null && (
        <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-nf-ink/80">
          <span className="font-medium text-nf-ink">
            {data.rating.toFixed(1)}
            <span className="sr-only"> out of 5</span>
          </span>
          <span aria-hidden="true" className="inline-flex gap-[2px]">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={13} strokeWidth={1.4} className="text-nf-gold-deep" fill={i <= Math.round(data.rating ?? 0) ? "currentColor" : "none"} />
            ))}
          </span>
          <span>
            · {data.count} {data.count === 1 ? "review" : "reviews"}
          </span>
        </p>
      )}
      {data.count > 0 && (
        <p className="mt-1 text-[12px] text-nf-ink/65">
          {data.ownCount > 0
            ? `${data.ownCount} on this piece; the rest from Naira customers across our pieces, in their own photos.`
            : "From Naira customers across our pieces, in their own photos."}
        </p>
      )}

      {cards.length > 0 ? (
        /* Bleeds to the screen's edges on a phone; the first card lines up
           with the text above it (scroll-pl-4). */
        <ul
          className="scrollbar-hide -mx-4 mt-4 flex snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:scroll-pl-0 lg:px-0"
          style={{ overscrollBehaviorX: "contain" }}
          aria-label="Customer reviews"
        >
          {cards.map((r, i) => {
            const photo = r.images[0];
            return (
              /* relative: the stars' sr-only text is absolutely placed, and
                 with no positioned box inside the rail it hung off the page
                 for every card past the screen, widening the document to
                 1,589px; a phone browser then zoomed the whole page out and
                 it would not scroll past 525px. */
              <li key={`${r.name}-${i}`} className="relative w-[72%] max-w-[248px] shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => setOpenReview(r)}
                  className="group flex h-full w-full flex-col border border-nf-gold/25 bg-nf-ivory text-left"
                  aria-label={`Read ${r.name}'s review${r.images.length ? ` and see ${r.images.length === 1 ? "the photo" : `${r.images.length} photos`}` : ""}`}
                >
                  {photo && (
                    <span className="relative block aspect-[4/5] w-full overflow-hidden bg-nf-ivory-deep">
                      {/* loading before src: React sets attributes in the
                          order written, and a src first starts the fetch
                          before the image is told it is lazy. */}
                      <img loading="lazy" decoding="async" src={reviewCard(photo)} alt="" width={560} height={700} className="h-full w-full object-cover" />
                      {r.images.length > 1 && (
                        <span className="absolute right-2 top-2 bg-nf-ivory/90 px-1.5 py-0.5 font-nf-label text-[11px] tabular-nums text-nf-ink">
                          1 / {r.images.length}
                        </span>
                      )}
                    </span>
                  )}
                  <span className="flex flex-1 flex-col gap-1.5 p-3">
                    <span className="flex items-center justify-between gap-2">
                      <Stars value={r.rating} size={11} />
                      <span className="text-[11.5px] text-nf-ink/60">{r.date}</span>
                    </span>
                    <span className="text-[13px] font-medium text-nf-ink">{r.name}</span>
                    <span className={`text-[13.5px] leading-[1.55] text-nf-ink/85 ${photo ? "line-clamp-4" : "line-clamp-[9]"}`}>“{r.text}”</span>
                    <span className="mt-auto pt-1 text-[12px] text-nf-ink underline decoration-nf-gold underline-offset-4">Read review</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-[13px] leading-[1.6] text-nf-ink/75">No reviews for this piece yet. Bought it? Tell others what you think.</p>
      )}

      <p className="mt-3 flex flex-wrap gap-x-5">
        <button
          type="button"
          onClick={() => setWriting(true)}
          className="inline-flex min-h-[44px] items-center text-[12.5px] text-nf-ink underline decoration-nf-gold underline-offset-4"
        >
          Write a review
        </button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center text-[12.5px] text-nf-ink underline decoration-nf-gold underline-offset-4"
        >
          Ask us on WhatsApp
        </a>
      </p>

      <WriteReviewModal open={writing} onOpenChange={setWriting} onSubmit={submit} />
      {/* The whole review: every photo, then the full text. Radix names the
          dialog from its Title and logs an error without one. */}
      <Dialog open={openReview !== null} onOpenChange={(v) => !v && setOpenReview(null)}>
        <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto bg-nf-ivory p-4" aria-describedby={undefined}>
          {openReview && (
            <>
              <DialogTitle className="text-[14px] font-medium text-nf-ink">{openReview.name}</DialogTitle>
              <p className="-mt-2 flex items-center gap-2 text-[12px] text-nf-ink/60">
                <Stars value={openReview.rating} size={12} />
                {openReview.date}
              </p>
              <p className="text-[14.5px] leading-[1.65] text-nf-ink/85">“{openReview.text}”</p>
              {openReview.images.map((src, i) => (
                <img key={src} src={src} alt={`Photo ${i + 1} from ${openReview.name}'s review`} loading="lazy" className="h-auto w-full" />
              ))}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PdpReviews;
