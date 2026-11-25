import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import WriteReviewModal from "@/components/WriteReviewModal";
import { cleanButton } from "@/components/clean";
import { orderedRealReviews, type Review } from "@/data/reviewWall";
import { reviewThumb } from "@/data/reviewThumbs";
import { toast } from "@/hooks/use-toast";
import { getSupabase } from "@/integrations/supabase/lazy";
import { SHOP_RATING, clientsLabel } from "@/lib/trust";

/*
  The product page's reviews (CustomerReviews with look="clean").

  Which reviews: only the ones the code can vouch for. The photographed
  customer reviews (reviewWall `realReviews`, the one whose piece matches this
  page first) and the reviews customers submitted for this product and the
  shop approved (Supabase `customer_reviews`). The bundled notes that used to
  be dealt to every product by a hash of its name, and the two bundled lists
  shown on every jewellery page, are not listed here; nor is an average worked
  out from them. The head carries the shop's own figures (lib/trust), the same
  the top of the page and the bag show.

  How: one review per row between hairlines, the name, its own stars as
  glyphs, the words upright in mixed case, the customer's photographs as 72px
  squares. Three rows, the rest behind "View all". No avatars, boxes, filter
  chips or featured quote.
*/
const SHOWN = 3;
/* A laptop sets the list in two columns, where three left the second row
   half empty: it shows a fourth. Which screen it is is decided in CSS, never
   in code, so the pre-built page and the first render agree. */
const SHOWN_WIDE = 4;

const PdpReviews = ({ productName, variant = "jewellery" }: { productName?: string; variant?: "apparel" | "jewellery" }) => {
  const real = useMemo(() => orderedRealReviews(productName), [productName]);
  /* Approved, submitted for this product; newest first. */
  const [submitted, setSubmitted] = useState<Review[]>([]);
  /* Written on this visit: shown at once, to its writer only, until approved. */
  const [mine, setMine] = useState<Review[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [writing, setWriting] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    setSubmitted([]);
    if (!productName) return;
    let cancelled = false;
    let stop = () => {};
    /* The client loads after first paint (integrations/supabase/lazy.ts);
       until it answers, the photographed reviews are what shows. */
    const start = (supabase: Awaited<ReturnType<typeof getSupabase>>) => {
      const load = async () => {
        const { data } = await supabase
          .from("customer_reviews")
          .select("name, rating, text, images, created_at")
          .eq("approved", true)
          .eq("product_name", productName)
          .order("created_at", { ascending: false })
          .limit(60);
        if (cancelled || !data) return;
        setSubmitted(
          data.map((r) => ({
            name: r.name,
            initials: r.name.slice(0, 2).toUpperCase(),
            verified: true,
            rating: r.rating,
            date: new Date(r.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            text: r.text,
            hasPhotos: (r.images ?? []).length > 0,
            images: r.images ?? [],
          })),
        );
      };
      load();
      /* Live, as the outfit page's list is: a push when a review is added or
         approved, a gentle poll, and a refresh when the tab is looked at again. */
      const channel = supabase
        .channel("customer-reviews-live")
        .on("postgres_changes", { event: "*", schema: "public", table: "customer_reviews" }, () => load())
        .subscribe();
      const interval = window.setInterval(load, 60_000);
      const onVisible = () => {
        if (document.visibilityState === "visible") load();
      };
      document.addEventListener("visibilitychange", onVisible);
      stop = () => {
        window.clearInterval(interval);
        document.removeEventListener("visibilitychange", onVisible);
        supabase.removeChannel(channel);
      };
    };
    getSupabase()
      .then((supabase) => {
        if (!cancelled) start(supabase);
      })
      .catch(() => {
        /* offline or blocked: the photographed reviews stay */
      });
    return () => {
      cancelled = true;
      stop();
    };
  }, [productName]);

  const reviews = useMemo(() => [...mine, ...submitted, ...real], [mine, submitted, real]);
  const shown = expanded ? reviews : reviews.slice(0, SHOWN_WIDE);

  const handleNewReview = async (review: { name: string; rating: number; text: string; images: string[] }) => {
    setMine((prev) => [
      {
        name: review.name,
        initials: review.name.slice(0, 2).toUpperCase(),
        verified: false,
        rating: review.rating,
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        text: review.text,
        hasPhotos: review.images.length > 0,
        images: review.images,
      },
      ...prev,
    ]);
    // Persisted for moderation: it becomes visible to everyone once approved.
    const supabase = await getSupabase();
    const { error } = await supabase.from("customer_reviews").insert({
      product_name: productName ?? null,
      variant,
      name: review.name,
      rating: review.rating,
      text: review.text,
      images: review.images,
    });
    if (error) {
      toast({
        title: "We couldn't save your review",
        description: "Please try again, or share it with us on WhatsApp.",
        variant: "destructive",
      });
    }
  };

  return (
    <section
      id="customer-reviews"
      data-reviews="clean"
      className="mx-auto max-w-[1400px] px-4 pt-12 md:px-6 lg:pt-16"
      style={{ scrollMarginTop: "136px" }}
      aria-labelledby="customer-reviews-heading"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 id="customer-reviews-heading" className="nc-heading">
          Reviews
        </h2>
        <p className="nc-small">
          <span aria-hidden="true" className="nc-star">★</span> <span className="nc-small nc-small--ink">{SHOP_RATING}/5</span> · Trusted by {clientsLabel} clients
        </p>
      </div>

      <ul className="mt-4 border-b border-[color:var(--nc-rule)] lg:grid lg:grid-cols-2 lg:gap-x-12">
        {shown.map((review, i) => (
          <li
            key={`${review.name}-${i}`}
            data-review
            className={`border-t border-[color:var(--nc-rule)] py-4 ${!expanded && i >= SHOWN ? "hidden lg:block" : ""}`}
          >
            <p className="nc-text nc-text--strong" data-review-name>
              {review.name}
            </p>
            <p className="nc-small">
              <span role="img" aria-label={`${review.rating} out of 5`} className="nc-star">
                {"★".repeat(Math.max(0, Math.min(5, Math.round(review.rating))))}
              </span>
              {review.verified && " · Verified buyer"}
            </p>
            <p className="nc-text nc-text--muted mt-2">{review.text}</p>
            {review.images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {review.images.map((image, n) => (
                  /* loading before src: React 18 sets attributes in the order
                     written, and with src first the fetch began before the
                     element was told it is lazy (see CustomerReviews.tsx). */
                  <button
                    key={image}
                    type="button"
                    onClick={() => setPhoto(image)}
                    className="h-[72px] w-[72px] shrink-0 overflow-hidden bg-[var(--nc-linen)] p-0"
                    aria-label={`Open ${review.name}'s photo${review.images.length > 1 ? ` ${n + 1}` : ""}`}
                  >
                    <img loading="lazy" decoding="async" src={reviewThumb(image)} alt="" className="h-full w-full object-cover" width={72} height={72} />
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 grid grid-cols-2 gap-2 md:max-w-[520px]">
        {reviews.length > SHOWN && (
          /* With exactly four, a laptop already shows them all. */
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            className={`${cleanButton({ size: "sm" })} ${reviews.length <= SHOWN_WIDE ? "lg:hidden" : ""}`}
          >
            {expanded ? "Show fewer" : "View all"}
          </button>
        )}
        <button type="button" onClick={() => setWriting(true)} className={cleanButton({ size: "sm" })}>
          Write a review
        </button>
      </div>

      <WriteReviewModal open={writing} onOpenChange={setWriting} onSubmit={handleNewReview} />

      {/* Radix names the dialog from its Title and logs an error on every
          open without one; the photo needs no description. */}
      <Dialog open={photo !== null} onOpenChange={(open) => !open && setPhoto(null)}>
        <DialogContent className="max-w-lg bg-background p-2" aria-describedby={undefined}>
          <DialogTitle className="sr-only">Customer photo</DialogTitle>
          {photo && <img src={photo} alt="Customer photo" className="h-auto w-full" />}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PdpReviews;
