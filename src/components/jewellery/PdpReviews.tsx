import { useState } from "react";
import { MessageSquare, PenLine, Star } from "lucide-react";
import WriteReviewModal from "@/components/WriteReviewModal";
import { getSupabase } from "@/integrations/supabase/lazy";
import { toast } from "@/hooks/use-toast";
import type { ApprovedReviews } from "@/hooks/useApprovedReviews";

/*
  A slim reviews block for the product page: the real reviews of this piece
  (useApprovedReviews), three at most, then a way to write one. With none yet
  it says so in one line and asks the people who bought it; it never fills
  the gap with other pieces' reviews or authored ones.

  A review written here goes to Supabase for approval, as the old wall's did,
  and appears once approved.
*/

const Stars = ({ value, size = 12 }: { value: number; size?: number }) => (
  <span className="inline-flex gap-[2px]" aria-hidden="true">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={size} strokeWidth={1.4} className="text-nf-gold-deep" fill={i <= Math.round(value) ? "currentColor" : "none"} />
    ))}
  </span>
);

type Props = {
  productName: string;
  data: ApprovedReviews;
  whatsappHref: string;
};

const PdpReviews = ({ productName, data, whatsappHref }: Props) => {
  const [open, setOpen] = useState(false);
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
  const shown = data.reviews.slice(0, 3);
  return (
    <section id="customer-reviews" className="mx-auto max-w-[1400px] scroll-mt-[120px] px-4 pb-8 md:px-6 md:pt-8" aria-labelledby="pdp-reviews">
      <div className="mx-auto max-w-[720px] border-y border-nf-gold/20 py-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="pdp-reviews" className="font-cormorant text-[19px] leading-none text-nf-ink">
            Reviews
          </h2>
          {data.count > 0 && data.rating !== null && (
            <p className="flex items-center gap-1.5 text-[12px] text-nf-ink/80">
              <Stars value={data.rating} />
              <span className="font-medium text-nf-ink">{data.rating.toFixed(1)}</span>
              <span>
                · {data.count} {data.count === 1 ? "review" : "reviews"}
              </span>
            </p>
          )}
        </div>

        {shown.length > 0 ? (
          <ul className="mt-4 grid gap-4">
            {shown.map((r, i) => (
              <li key={i} className="grid gap-1.5">
                <div className="flex items-center justify-between gap-3 text-[12px]">
                  <span className="font-medium text-nf-ink">{r.name}</span>
                  <span className="text-nf-ink/60">{r.date}</span>
                </div>
                <Stars value={r.rating} size={11} />
                <p className="line-clamp-4 text-[13px] leading-[1.6] text-nf-ink/85">{r.text}</p>
                {r.images.length > 0 && (
                  <div className="mt-1 flex gap-2">
                    {r.images.slice(0, 3).map((src) => (
                      <img key={src} src={src} alt={`Photo from ${r.name}'s review`} loading="lazy" decoding="async" className="h-16 w-16 border border-nf-gold/20 object-cover" />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[13px] leading-[1.6] text-nf-ink/75">
            No reviews for this piece yet. Bought it? Tell others what you think.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-2 text-[12px] text-nf-ink underline decoration-nf-gold underline-offset-4"
          >
            <PenLine size={14} strokeWidth={1.6} className="text-nf-gold-deep" aria-hidden="true" /> Write a review
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 text-[12px] text-nf-ink underline decoration-nf-gold underline-offset-4"
          >
            <MessageSquare size={14} strokeWidth={1.6} className="text-nf-gold-deep" aria-hidden="true" /> Ask us on WhatsApp
          </a>
        </div>
      </div>
      <WriteReviewModal open={open} onOpenChange={setOpen} onSubmit={submit} />
    </section>
  );
};

export default PdpReviews;
