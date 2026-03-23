import { useState, useMemo } from "react";
import { Star, Camera, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import WriteReviewModal from "@/components/WriteReviewModal";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product1Hover from "@/assets/product-1-hover.jpg";
import product2Hover from "@/assets/product-2-hover.jpg";

const customerPhotos = [product1, product2, product3, product4, product1Hover, product2Hover];

const ratingBreakdown = [
  { stars: 5, count: 184 },
  { stars: 4, count: 32 },
  { stars: 3, count: 15 },
  { stars: 2, count: 4 },
  { stars: 1, count: 3 },
];
const totalReviews = 238;
const overallRating = 4.8;

const filters = ["All Reviews", "With Photos", "5★", "4★", "3★"];

interface Review {
  name: string;
  initials: string;
  verified: boolean;
  rating: number;
  date: string;
  text: string;
  hasPhotos: boolean;
  images: string[];
}

const reviewsData: Review[] = [
  {
    name: "Ananya",
    initials: "AN",
    verified: true,
    rating: 5,
    date: "March 2, 2026",
    text: "Absolutely loved the saree. The embroidery detail is stunning and the fabric feels premium. It draped beautifully for my brother's wedding.",
    hasPhotos: true,
    images: [product1, product2],
  },
  {
    name: "Priya",
    initials: "PR",
    verified: true,
    rating: 5,
    date: "February 18, 2026",
    text: "The quality exceeded my expectations. The silk is luxurious and the color is exactly as shown. Received so many compliments!",
    hasPhotos: true,
    images: [product3],
  },
  {
    name: "Meera",
    initials: "ME",
    verified: true,
    rating: 4,
    date: "February 10, 2026",
    text: "Beautiful saree with excellent craftsmanship. The pre-draped design makes it so easy to wear. Slightly long for my height but overall gorgeous.",
    hasPhotos: false,
    images: [],
  },
  {
    name: "Kavya",
    initials: "KA",
    verified: true,
    rating: 5,
    date: "January 28, 2026",
    text: "This is my third purchase from this brand and they never disappoint. The midnight blue is absolutely mesmerizing in person.",
    hasPhotos: true,
    images: [product4],
  },
  {
    name: "Roshni",
    initials: "RO",
    verified: false,
    rating: 5,
    date: "January 15, 2026",
    text: "Perfect for festive occasions. The structured bodice gives a very flattering silhouette. Worth every penny!",
    hasPhotos: false,
    images: [],
  },
  {
    name: "Deepa",
    initials: "DE",
    verified: true,
    rating: 4,
    date: "January 5, 2026",
    text: "Stunning piece! The hand embroidery is intricate and beautiful. Packaging was also very premium. Great gifting option.",
    hasPhotos: true,
    images: [product1Hover],
  },
  {
    name: "Swati",
    initials: "SW",
    verified: true,
    rating: 5,
    date: "December 22, 2025",
    text: "I wore this for my engagement ceremony and felt like a queen. The drape is effortless and the silk quality is top-notch.",
    hasPhotos: false,
    images: [],
  },
  {
    name: "Nisha",
    initials: "NI",
    verified: true,
    rating: 3,
    date: "December 10, 2025",
    text: "The saree is nice but took longer than expected to arrive. The fabric quality is good though, and the color is rich.",
    hasPhotos: false,
    images: [],
  },
];
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

const CustomerReviews = () => {
  const [activeFilter, setActiveFilter] = useState("All Reviews");
  const [visibleCount, setVisibleCount] = useState(4);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>(reviewsData);

  const maxCount = ratingBreakdown[0].count;

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
      default:
        return localReviews;
    }
  }, [activeFilter, localReviews]);

  const handleNewReview = (review: { name: string; rating: number; text: string }) => {
    const newReview: Review = {
      name: review.name,
      initials: review.name.slice(0, 2).toUpperCase(),
      verified: false,
      rating: review.rating,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      text: review.text,
      hasPhotos: false,
      images: [],
    };
    setLocalReviews((prev) => [newReview, ...prev]);
  };

  const handleFilterChange = (filter: string) => {
    setAnimating(true);
    setTimeout(() => {
      setActiveFilter(filter);
      setVisibleCount(4);
      setAnimating(false);
    }, 200);
  };

  return (
    <section className="max-w-[1200px] mx-auto px-4 pb-20">
      <h2
        className="font-cormorant text-[28px] md:text-[32px] font-semibold"
        style={{ color: "hsl(var(--foreground))" }}
      >
        Customer Reviews
      </h2>

      {/* Two-Column Header */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Rating Summary + Breakdown */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
            {/* Overall */}
            <div className="flex flex-col items-start gap-2">
              <Stars count={5} size={18} />
              <p className="font-cormorant text-[36px] font-bold" style={{ color: "hsl(var(--foreground))" }}>
                {overallRating}
              </p>
              <p className="text-[13px] font-cormorant" style={{ color: "hsl(var(--muted-foreground))" }}>
                Based on {totalReviews} reviews
              </p>
            </div>

            {/* Breakdown */}
            <div className="flex-1 max-w-[320px] flex flex-col gap-2.5">
              {ratingBreakdown.map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-[13px] w-8 shrink-0 font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {stars} ★
                  </span>
                  <Progress
                    value={(count / maxCount) * 100}
                    className="h-2.5 flex-1 bg-secondary"
                  />
                  <span className="text-[12px] w-8 text-right" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Photos + Write Review */}
        <div className="flex flex-col gap-5">
          <h3
            className="font-cormorant text-[18px] font-semibold flex items-center gap-2"
            style={{ color: "hsl(var(--foreground))" }}
          >
            <Camera size={16} /> Customer Photos
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {customerPhotos.map((photo, i) => (
              <button
                key={i}
                onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                className="shrink-0 w-[80px] h-[80px] md:w-[90px] md:h-[90px] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <img src={photo} alt={`Customer photo ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="mt-2 self-start px-8 py-3 rounded-full text-[13px] font-medium uppercase tracking-[0.1em] border border-foreground text-foreground transition-all duration-[250ms] ease-in-out hover:bg-foreground hover:text-background hover:shadow-md hover:-translate-y-[1px]"
          >
            Write a Review
          </button>
        </div>
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
            src={customerPhotos[lightboxIndex]}
            alt="Customer photo"
            className="w-full h-auto rounded-md"
          />
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap gap-2.5">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className="px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-200"
            style={{
              backgroundColor: activeFilter === f ? "hsl(186 35% 28%)" : "transparent",
              color: activeFilter === f ? "hsl(0 0% 100%)" : "hsl(var(--muted-foreground))",
              borderColor: activeFilter === f ? "hsl(186 35% 28%)" : "hsl(var(--border))",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Review Cards */}
      <div
        className={`mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}
      >
        {filteredReviews.length === 0 ? (
          <p className="col-span-full text-center text-[14px] font-cormorant py-10" style={{ color: "hsl(var(--muted-foreground))" }}>
            No reviews match this filter.
          </p>
        ) : (
          filteredReviews.slice(0, visibleCount).map((review, i) => (
            <div
              key={`${activeFilter}-${i}`}
              className="rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-[12px] font-medium bg-secondary text-secondary-foreground">
                    {review.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[14px] font-semibold font-cormorant" style={{ color: "hsl(var(--foreground))" }}>
                    {review.name}
                  </p>
                  {review.verified && (
                    <span className="text-[10px] uppercase tracking-[0.08em] font-medium" style={{ color: "hsl(186 35% 28%)" }}>
                      Verified Buyer
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <Stars count={review.rating} />
                <span className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>{review.date}</span>
              </div>
              <p className="text-[13px] leading-relaxed font-cormorant" style={{ color: "hsl(var(--muted-foreground))" }}>
                "{review.text}"
              </p>
              {review.hasPhotos && review.images.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.images.map((img, idx) => (
                    <img key={idx} src={img} alt="Review photo" className="w-12 h-12 rounded-md object-cover" />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {visibleCount < filteredReviews.length && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setVisibleCount((v) => Math.min(v + 4, filteredReviews.length))}
            className="px-8 py-3 rounded-full text-[13px] font-medium uppercase tracking-[0.1em] border-2 border-foreground text-foreground transition-all duration-[250ms] ease-in-out hover:bg-foreground hover:text-background hover:shadow-md hover:-translate-y-[1px]"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </section>
  );
};

export default CustomerReviews;
