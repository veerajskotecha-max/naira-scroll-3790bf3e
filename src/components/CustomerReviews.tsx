import { useState, useMemo, useEffect } from "react";
import { Star, ChevronDown, PenLine } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import WriteReviewModal from "@/components/WriteReviewModal";
import { getSupabase } from "@/integrations/supabase/lazy";
import { toast } from "@/hooks/use-toast";

import { getProductReviews } from "@/data/productReviews";
import {
  apparelOneLiners,
  customerPhotos,
  jewelleryOneLiners,
  jewelleryPhotos,
  jewelleryReviews,
  orderedRealReviews,
  reviewsData,
  type Review,
} from "@/data/reviewWall";
import { reviewThumb } from "@/data/reviewThumbs";


/* 1★ and 2★ used to be unreachable. Baymard found 53% of test subjects
   actively look for negative reviews, and that without them users either
   suspect the reviews are fake or misjudge a product from a good first page. */
const filters = ["All Reviews", "With Photos", "5★", "4★", "3★", "2★", "1★"];


const Stars = ({ count, size = 12 }: { count: number; size?: number }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < count ? "text-yellow-500 fill-yellow-500" : "text-border"}
      />
    ))}
  </div>
);

interface CustomerReviewsProps {
  /** Drives the product's own numbered one-line reviews. */
  productName?: string;
  variant?: "apparel" | "jewellery";
}


const CustomerReviews = ({ productName, variant = "apparel" }: CustomerReviewsProps = {}) => {
  const isJewellery = variant === "jewellery";
  const basePhotos = isJewellery ? jewelleryPhotos : customerPhotos;
  const [activeFilter, setActiveFilter] = useState("All Reviews");
  const [visibleCount, setVisibleCount] = useState(4);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [featuredExpanded, setFeaturedExpanded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  // Each product carries its own numbered one-liners, shown first.
  const ownReviews = useMemo<Review[]>(
    () =>
      getProductReviews(productName).map((r) => ({
        no: r.no,
        name: r.name,
        initials: r.initials,
        verified: r.verified,
        rating: r.rating,
        date: r.date,
        text: r.text,
        hasPhotos: false,
        images: [],
      })),
    [productName]
  );
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  useEffect(() => {
    let cancelled = false;
    const seed = [
      // Real photographed customer reviews always lead.
      ...orderedRealReviews(productName),
      ...ownReviews,
      ...(isJewellery
        ? [...jewelleryReviews, ...jewelleryOneLiners]
        : [...reviewsData, ...apparelOneLiners]),
    ];

    setLocalReviews(seed);

    // Approved shopper-submitted reviews (with their own photos) lead the list.
    // The client loads after first paint (integrations/supabase/lazy.ts); until
    // it answers, the bundled reviews above are what shows.
    let stop = () => {};
    const start = (supabase: Awaited<ReturnType<typeof getSupabase>>) => {
      const load = async () => {
        let query = supabase
          .from("customer_reviews")
          .select("name, rating, text, images, created_at")
          .eq("approved", true)
          .order("created_at", { ascending: false })
          .limit(60);
        if (productName) query = query.eq("product_name", productName);
        const { data } = await query;
        if (cancelled || !data?.length) return;
        const submitted: Review[] = data.map((r) => ({
          name: r.name,
          initials: r.name.slice(0, 2).toUpperCase(),
          verified: true,
          rating: r.rating,
          date: new Date(r.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          text: r.text,
          hasPhotos: (r.images ?? []).length > 0,
          images: r.images ?? [],
        }));
        setLocalReviews([...submitted, ...seed]);
      };

      load();

      // Live updates: realtime pushes when a review is added/approved, plus a
      // gentle poll and a refresh whenever the tab regains focus.
      const channel = supabase
        .channel("customer-reviews-live")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "customer_reviews" },
          () => load()
        )
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
        /* offline or blocked: the bundled reviews stay */
      });

    return () => {
      cancelled = true;
      stop();
    };
  }, [ownReviews, isJewellery, productName]);



  // Shopper-uploaded photos lead the strip, curated shots fill the rest.
  const photos = useMemo(
    () => [
      ...localReviews.filter((r) => r.hasPhotos).flatMap((r) => r.images),
      ...basePhotos,
    ].filter((p, i, arr) => arr.indexOf(p) === i),
    [localReviews, basePhotos]
  );

  // Aggregate is computed from the reviews actually shown, never invented.
  const overallRating = useMemo(() => {
    const total = localReviews.length;
    const avg = total ? localReviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    return Math.round(avg * 10) / 10;
  }, [localReviews]);

  const filteredReviews = useMemo(() => {
    switch (activeFilter) {
      case "With Photos":
        return localReviews.filter((r) => r.hasPhotos);
      case "5★":
        return localReviews.filter((r) => r.rating === 5);
      case "4★":
        return localReviews.filter((r) => r.rating === 4);
      case "3★":
        return localReviews.filter((r) => r.rating === 3);
      case "2★":
        return localReviews.filter((r) => r.rating === 2);
      case "1★":
        return localReviews.filter((r) => r.rating === 1);
      default:
        return localReviews;
    }
  }, [activeFilter, localReviews]);

  const handleNewReview = async (review: { name: string; rating: number; text: string; images: string[] }) => {
    const newReview: Review = {
      name: review.name,
      initials: review.name.slice(0, 2).toUpperCase(),
      verified: false,
      rating: review.rating,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      text: review.text,
      hasPhotos: review.images.length > 0,
      images: review.images,
    };
    setLocalReviews((prev) => [newReview, ...prev]);

    // Persisted for moderation — it becomes visible to everyone once approved.
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


  const handleFilterChange = (filter: string) => {
    setAnimating(true);
    setTimeout(() => {
      setActiveFilter(filter);
      setVisibleCount(4);
      setAnimating(false);
    }, 200);
  };

  const featuredReview = filteredReviews[0] ?? localReviews[0];

  return (
    <section id="customer-reviews" className="mx-auto max-w-[1200px] px-4 pb-14 md:pb-20" style={{ scrollMarginTop: "136px" }}>
      <div className="border-y border-border py-6 md:py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Kind words</p>
            <h2 className="mt-1 font-cormorant text-[27px] font-semibold text-foreground md:text-[32px]">Customer Reviews</h2>
          </div>
          <div className="mb-1 flex items-center gap-2" aria-label={`${overallRating} out of 5 stars`}>
            <span className="font-cormorant text-[18px] font-semibold text-foreground">{overallRating}</span>
            <Stars count={5} size={13} />
          </div>
        </div>

        {featuredReview && (
          <article className="mt-6 max-w-2xl">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-secondary text-[10px] font-medium text-secondary-foreground">{featuredReview.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[12px] font-medium text-foreground">{featuredReview.name}</p>
                <p className="text-[9px] uppercase tracking-[0.12em] text-primary">{featuredReview.verified ? "Verified Buyer" : "Customer Review"}</p>
              </div>
            </div>
            <p className={`mt-3 font-cormorant text-[15px] italic leading-6 text-muted-foreground ${featuredExpanded ? "" : "line-clamp-3 md:line-clamp-2"}`}>
              “{featuredReview.text}”
            </p>
            {featuredReview.text.length > 150 && (
              <button type="button" onClick={() => setFeaturedExpanded((value) => !value)} className="mt-2 min-h-11 text-[11px] font-medium underline underline-offset-4 text-foreground">
                {featuredExpanded ? "Show less" : "Read full review"}
              </button>
            )}
          </article>
        )}

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
          <div className="flex -space-x-2" aria-label="Customer photos">
            {photos.slice(0, 4).map((photo, i) => (
              <button key={photo} type="button" onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }} className="h-9 w-9 overflow-hidden rounded-full border-2 border-background" aria-label={`Open customer photo ${i + 1}`}>
                {/* loading before src — see the review photos below for why */}
                <img loading="lazy" decoding="async" src={reviewThumb(photo)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setReviewsExpanded((value) => !value)} className="flex min-h-11 items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground" aria-expanded={reviewsExpanded}>
            {reviewsExpanded ? "Show less" : "View more reviews"}
            <ChevronDown size={14} className={`transition-transform duration-300 ${reviewsExpanded ? "rotate-180" : ""}`} />
          </button>
        </div>

        <button type="button" onClick={() => setReviewModalOpen(true)} className="mt-4 flex h-11 w-full items-center justify-center gap-2 border border-foreground text-[11px] font-medium uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-foreground hover:text-background md:w-auto md:px-8">
          <PenLine size={14} /> Write a Review
        </button>
      </div>

      <WriteReviewModal
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        onSubmit={handleNewReview}
      />

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-lg p-2 bg-background">
          <img
            src={photos[lightboxIndex]}
            alt="Customer photo"
            className="w-full h-auto"
          />
        </DialogContent>
      </Dialog>

      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${reviewsExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} aria-hidden={!reviewsExpanded}>
        <div className="overflow-hidden">
      {/* Filters */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            tabIndex={reviewsExpanded ? 0 : -1}
            className={`shrink-0 border px-3 py-2 text-[11px] font-medium transition-colors ${activeFilter === f ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Review Cards */}
      <div
        className={`mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}
      >
        {filteredReviews.length === 0 ? (
          <p className="col-span-full text-center text-[14px] font-cormorant py-10" style={{ color: "hsl(var(--muted-foreground))" }}>
            No reviews match this filter.
          </p>
        ) : (
          filteredReviews.slice(0, visibleCount).map((review, i) => (
            <div
              key={`${activeFilter}-${i}`}
              className="border border-border bg-card p-4 animate-fade-in md:p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-[12px] font-medium bg-secondary text-secondary-foreground">
                    {review.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[14px] font-semibold font-cormorant text-foreground">
                    {review.name}
                  </p>
                  {review.verified && (
                    <span className="text-[10px] uppercase tracking-[0.08em] font-medium text-primary">
                      Verified Buyer
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <Stars count={review.rating} />
                <span className="text-[11px] text-muted-foreground">{review.date}</span>
              </div>
              <p className="line-clamp-4 text-[13px] leading-relaxed font-cormorant text-muted-foreground">
                "{review.text}"
              </p>
              {review.hasPhotos && review.images.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.images.map((img, idx) => (
                    /* Full-resolution review photographs, ~150 kB each, drawn
                       into a 48px box well below the fold. Nothing here is
                       worth fetching before someone scrolls to it.

                       loading must come BEFORE src. The app mounts with
                       createRoot, so React builds these <img>s itself and, in
                       React 18, sets attributes in the order written: with src
                       first, the fetch starts the moment src lands, before the
                       element is ever told it is lazy. Measured: every one was
                       fetched the instant React mounted, 1,600px below the
                       fold, until the order was swapped. */
                    <img key={idx} loading="lazy" decoding="async" src={reviewThumb(img)} alt="Review photo" className="w-12 h-12 object-cover" />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {visibleCount < filteredReviews.length && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setVisibleCount((v) => Math.min(v + 4, filteredReviews.length))}
            className="min-h-11 border border-foreground px-8 text-[11px] font-medium uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            View more
          </button>
        </div>
      )}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
