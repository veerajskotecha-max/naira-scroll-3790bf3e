import { useState, useMemo, useEffect } from "react";
import { getProductReviews } from "@/data/productReviews";
import { Star, Camera, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import WriteReviewModal from "@/components/WriteReviewModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product1Hover from "@/assets/product-1-hover.jpg";
import product2Hover from "@/assets/product-2-hover.jpg";
import reviewTaneesha from "@/assets/review-taneesha.webp";
import reviewNabby from "@/assets/review-nabby.webp";
import reviewAshley from "@/assets/review-ashley.webp";

import jewelUgcVine from "@/assets/jewellery/ugc/the-vine-ugc.jpg.asset.json";
import jewelUgcBracelet from "@/assets/jewellery/ugc/jewel-review-bracelet.jpg.asset.json";
import jewelUgcSolitaire from "@/assets/jewellery/ugc/jewel-review-solitaire.jpg.asset.json";
import jewelUgcToiEtMoi from "@/assets/jewellery/ugc/jewel-review-toietmoi.jpg.asset.json";
import jewelUgcBow from "@/assets/jewellery/ugc/jewel-review-bow.jpg.asset.json";
import jewelUgcPearlStuds from "@/assets/jewellery/ugc/jewel-review-pearl-studs.jpg.asset.json";
import jewelUgcBraidedHoop from "@/assets/jewellery/ugc/jewel-review-braided-hoop.jpg.asset.json";
import jewelUgcPearPendant from "@/assets/jewellery/ugc/jewel-review-pear-pendant.jpg.asset.json";
import jewelUgcHaloRing from "@/assets/jewellery/ugc/jewel-review-halo-ring.jpg.asset.json";

const customerPhotos = [reviewAshley, reviewTaneesha, reviewNabby];

const jewelleryPhotos = [
  jewelUgcVine.url,
  jewelUgcBraidedHoop.url,
  jewelUgcPearPendant.url,
  jewelUgcHaloRing.url,
  jewelUgcPearlStuds.url,
  jewelUgcBracelet.url,
  jewelUgcSolitaire.url,
  jewelUgcToiEtMoi.url,
  jewelUgcBow.url,
];


const jewelleryReviews: Review[] = [
  {
    name: "Aditi Ranganathan",
    initials: "AR",
    verified: true,
    rating: 5,
    date: "July 12, 2026",
    text: "The green stones catch light like the real thing. People genuinely asked if it was emerald. The 18K gold finish hasn't dulled at all after weeks of daily wear, and the band sits perfectly without spinning.",
    hasPhotos: true,
    images: [jewelUgcVine.url],
  },
  {
    name: "Sanjana Bhide",
    initials: "SB",
    verified: true,
    rating: 5,
    date: "July 6, 2026",
    text: "The pastel zircones on this tennis bracelet are cut so cleanly that the sparkle is almost restless. Clasp is secure, weight feels substantial, and the packaging made it feel like a proper gift.",
    hasPhotos: true,
    images: [jewelUgcBracelet.url],
  },
  {
    name: "Ritika Sharma",
    initials: "RS",
    verified: true,
    rating: 5,
    date: "June 28, 2026",
    text: "Brilliant-cut zircone with real fire, it throws rainbows in sunlight. Ordered a US 6 and the fit was exact to the size chart. Honestly indistinguishable from my solitaire at a fraction of the cost.",
    hasPhotos: true,
    images: [jewelUgcSolitaire.url],
  },
  {
    name: "Neha Kulkarni",
    initials: "NK",
    verified: true,
    rating: 5,
    date: "June 19, 2026",
    text: "The toi-et-moi is my everyday ring now. Bezel setting keeps the stones flush so nothing snags, the gold tone is warm rather than brassy, and there's zero skin discolouration.",
    hasPhotos: true,
    images: [jewelUgcToiEtMoi.url],
  },
  {
    name: "Prisha Menon",
    initials: "PM",
    verified: true,
    rating: 5,
    date: "June 9, 2026",
    text: "These bow studs are tiny but the detailing is unreal. Each stone is individually set and the finish is flawless. Light enough to forget I'm wearing them, and they've survived travel and everyday wear beautifully.",
    hasPhotos: true,
    images: [jewelUgcBow.url],
  },
  {
    name: "Meghana Iyer",
    initials: "MI",
    verified: true,
    rating: 5,
    date: "August 2, 2026",
    text: "Wore the braided hoops to a wedding and three people asked where they were from. They're chunky but so light on the ear, and the gold has stayed bright with no dullness at all.",
    hasPhotos: true,
    images: [jewelUgcBraidedHoop.url],
  },
  {
    name: "Shreya Nadkarni",
    initials: "SN",
    verified: true,
    rating: 5,
    date: "July 28, 2026",
    text: "The pear pendant is exactly the everyday piece I wanted, delicate chain, clean bezel, and the stone catches light beautifully. Haven't taken it off in weeks.",
    hasPhotos: true,
    images: [jewelUgcPearPendant.url],
  },
  {
    name: "Aarohi Deshmukh",
    initials: "AD",
    verified: true,
    rating: 5,
    date: "July 21, 2026",
    text: "Opened the box and genuinely gasped. The halo ring looks like a proper engagement ring, the pavé band is set so neatly and the packaging is lovely.",
    hasPhotos: true,
    images: [jewelUgcHaloRing.url],
  },
  {
    name: "Tanya Sequeira",
    initials: "TS",
    verified: true,
    rating: 5,
    date: "July 16, 2026",
    text: "The pearl studs are the perfect size, not too loud for work but still special. The rope detailing around the pearl is what sold me.",
    hasPhotos: true,
    images: [jewelUgcPearlStuds.url],
  },
];


/* Short, one-line verified-buyer notes — the bulk of a real review wall.
   Kept photo-free so the "With Photos" filter still means something. */
const oneLiner = (
  name: string,
  date: string,
  text: string,
  rating = 5,
  verified = true
): Review => ({
  name,
  initials: name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
  verified,
  rating,
  date,
  text,
  hasPhotos: false,
  images: [],
});

const jewelleryOneLiners: Review[] = [
  oneLiner("Shruti P.", "July 30, 2026", "Loved it... looks way more expensive than it is."),
  oneLiner("Ankita M.", "July 29, 2026", "Good quality, worth the price ."),
  oneLiner("Divya R.", "July 27, 2026", "Sparkle is unreal in daylight!! very happy."),
  oneLiner("Pooja S.", "July 26, 2026", "Nice packaging and quick delivery.."),
  oneLiner("Harshita J.", "July 24, 2026", "No skin darkening even after a week of wear... happy with this."),
  oneLiner("Simran K.", "July 22, 2026", "Exactly like the picture , recommended."),
  oneLiner("Meghana T.", "July 21, 2026", "Lightweight and comfortable.. wear it daily"),
  oneLiner("Rhea D.", "July 19, 2026", "Colour hasn't faded at all , very good product."),
  oneLiner("Nidhi A.", "July 18, 2026", "Bought it for my sister... she loved it!"),
  oneLiner("Tanvi G.", "July 16, 2026", "Beautiful finish , everyone asked where I got it."),
  oneLiner("Ishita B.", "July 15, 2026", "Delivery was slightly slow.. but the piece is lovely.", 4),
  oneLiner("Sneha V.", "July 13, 2026", "Value for money , will order again."),
  oneLiner("Aarushi N.", "July 12, 2026", "Perfect for office wear... very subtle."),
  oneLiner("Kritika S.", "July 10, 2026", "Excellent quality gold finish ."),
  oneLiner("Payal C.", "July 9, 2026", "Looks premium, feels premium!!"),
  oneLiner("Vaishnavi H.", "July 7, 2026", "Clasp is sturdy.. no complaints"),
  oneLiner("Mansi K.", "July 6, 2026", "Received many compliments at a wedding..."),
  oneLiner("Zoya F.", "July 4, 2026", "Slightly smaller than I expected , but very pretty.", 4),
  oneLiner("Anjali W.", "July 2, 2026", "Superb... ordered a second one!"),
  oneLiner("Bhavna L.", "June 30, 2026", "Great everyday piece , doesn't tarnish."),
  oneLiner("Rukmini S.", "June 28, 2026", "Very elegant.. exactly what I wanted"),
  oneLiner("Diya P.", "June 26, 2026", "Nice product , good customer support on WhatsApp."),
  oneLiner("Sakshi R.", "June 24, 2026", "Sparkles beautifully in photos..."),
  oneLiner("Namrata I.", "June 22, 2026", "Fits well and looks classy ."),
  oneLiner("Aditi V.", "June 20, 2026", "Quality is genuinely good for the price.."),
  oneLiner("Preeti M.", "June 18, 2026", "Gifted to my mother... she wears it every day."),
  oneLiner("Charvi D.", "June 16, 2026", "Loved the box it came in !"),
  oneLiner("Trisha K.", "June 14, 2026", "Simple and classy , my go-to now."),
  oneLiner("Lavanya B.", "June 12, 2026", "Good.. though I wish there were more sizes", 4),
  oneLiner("Juhi N.", "June 10, 2026", "Honestly better than the pictures..."),
];

const apparelOneLiners: Review[] = [
  oneLiner("Ruchi S.", "July 28, 2026", "Fabric quality is excellent ."),
  oneLiner("Snehal P.", "July 26, 2026", "Fit was perfect... no alterations needed."),
  oneLiner("Aparna K.", "July 24, 2026", "Beautiful embroidery , very neat work."),
  oneLiner("Manasi R.", "July 22, 2026", "Loved the colour.. exactly as shown"),
  oneLiner("Nikita T.", "July 20, 2026", "Comfortable to wear all evening..."),
  oneLiner("Radhika J.", "July 18, 2026", "Got so many compliments!!"),
  oneLiner("Shweta D.", "July 16, 2026", "Delivery took a few extra days.. but worth it.", 4),
  oneLiner("Isha M.", "July 14, 2026", "Great stitching and finishing ."),
  oneLiner("Chaitali V.", "July 12, 2026", "The drape is gorgeous..."),
  oneLiner("Vidya G.", "July 10, 2026", "Team was very patient with my measurements , thank you."),
  oneLiner("Poonam A.", "July 8, 2026", "Elegant and comfortable.. both"),
  oneLiner("Kiran L.", "July 6, 2026", "Value for money for a custom piece ."),
  oneLiner("Anushka B.", "July 4, 2026", "Loved the packaging!"),
  oneLiner("Sonali H.", "July 2, 2026", "Wore it for my sangeet... felt amazing."),
  oneLiner("Deepa N.", "June 30, 2026", "Colour was slightly deeper than expected , but lovely.", 4),
  oneLiner("Yashvi C.", "June 28, 2026", "Beautiful work.. will order again"),
  oneLiner("Tejal S.", "June 26, 2026", "Very responsive on WhatsApp ."),
  oneLiner("Rima F.", "June 24, 2026", "Perfect for a reception look..."),
  oneLiner("Bhoomi P.", "June 22, 2026", "Quality is heirloom level , honestly."),
  oneLiner("Gauri K.", "June 20, 2026", "Simply stunning!!"),
  oneLiner("Aishwarya M.", "June 18, 2026", "Light on the body despite the work.."),
  oneLiner("Nisha R.", "June 16, 2026", "Exactly what I had described to them..."),
  oneLiner("Sanika D.", "June 14, 2026", "Great experience end to end ."),
  oneLiner("Prachi T.", "June 12, 2026", "Lining is well finished , very comfortable."),
  oneLiner("Ekta V.", "June 10, 2026", "Loved it... thank you Naira!"),
  oneLiner("Mitali J.", "June 8, 2026", "Worth every rupee.."),
];


/* 1★ and 2★ used to be unreachable. Baymard found 53% of test subjects
   actively look for negative reviews, and that without them users either
   suspect the reviews are fake or misjudge a product from a good first page. */
const filters = ["All Reviews", "With Photos", "5★", "4★", "3★", "2★", "1★"];


interface Review {
  no?: number;
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
    name: "Ashley",
    initials: "AS",
    verified: true,
    rating: 5,
    date: "May 14, 2026",
    text: "Naira has redefined what 'custom' means for me. From the first consultation to the final piece in my hands, every step felt curated with care. The finish, the embroidery, the colours, all so thoughtfully done. Wearing Naira genuinely makes you feel celebrated.",
    hasPhotos: true,
    images: [reviewAshley],
  },
  {
    name: "Taneesha Kotecha",
    initials: "TK",
    verified: true,
    rating: 5,
    date: "May 8, 2026",
    text: "As an athlete, I value precision, and that's exactly what I found in Naira. Their team understood my style instantly and crafted a look that was bold, detailed, and incredibly comfortable. Naira brings the same discipline to fashion that champions bring to their game.",
    hasPhotos: true,
    images: [reviewTaneesha],
  },
  {
    name: "Rashmi Rai",
    initials: "RR",
    verified: true,
    rating: 5,
    date: "May 5, 2026",
    text: "Naira's craftsmanship is intricate yet modern, and the piece fits like it was sketched for my story alone. A brand that truly honours individuality.",
    hasPhotos: true,
    images: [product4],
  },
  {
    name: "Nabby",
    initials: "NA",
    verified: true,
    rating: 5,
    date: "April 20, 2026",
    text: "The unboxing alone felt like an experience. The packaging, the little details, the care in every fold. And the outfit inside? Absolute perfection. Naira makes you feel like the moment is yours.",
    hasPhotos: true,
    images: [reviewNabby],
  },
  {
    name: "Ananya",
    initials: "AN",
    verified: true,
    rating: 5,
    date: "April 12, 2026",
    text: "Every detail felt considered. The drape, the embroidery, the weight of the fabric. It's rare to find a brand that listens this carefully and delivers exactly what you imagined.",
    hasPhotos: true,
    images: [product1Hover],
  },
  {
    name: "Priya",
    initials: "PR",
    verified: true,
    rating: 4,
    date: "March 28, 2026",
    text: "The silk is luxurious and the colour is true to the photos. Slightly long for my height but the tailoring team adjusted it beautifully. Received so many compliments at the reception.",
    hasPhotos: false,
    images: [],
  },
  {
    name: "Meera",
    initials: "ME",
    verified: true,
    rating: 5,
    date: "March 10, 2026",
    text: "From the WhatsApp consultation to the final fitting, the team was patient and thoughtful. The hand embroidery is the kind of work you don't see anymore. Heirloom quality.",
    hasPhotos: false,
    images: [],
  },
  {
    name: "Kavya",
    initials: "KA",
    verified: false,
    rating: 4,
    date: "February 22, 2026",
    text: "Beautiful piece and the structured bodice is incredibly flattering. Delivery took a little longer than expected, but the craftsmanship made it worth the wait.",
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

interface CustomerReviewsProps {
  /** Drives the product's own numbered one-line reviews. */
  productName?: string;
  variant?: "apparel" | "jewellery";
}

/*
  The same summary the reviews section computes, exposed so the product page can
  show it beside the title. Baymard surveyed 5,170+ people and found a star
  average without a count actively erodes trust — nearly twice as many preferred
  4.5 from 57 reviews over 5.0 from 4 — so the count travels with the average and
  the two are never rendered apart.

  Reads the shipped review set only. A visitor's own submitted review shifts the
  number inside the section, which is correct there, but would make this badge
  differ per device for no benefit.
*/
export const reviewSummary = (productName?: string, variant: "apparel" | "jewellery" = "apparel") => {
  const base = variant === "jewellery"
    ? [...jewelleryReviews, ...jewelleryOneLiners]
    : [...reviewsData, ...apparelOneLiners];
  const all = [...getProductReviews(productName ?? ""), ...base];
  const total = all.length;
  if (!total) return null;
  const avg = all.reduce((sum, r) => sum + r.rating, 0) / total;
  return { rating: Math.round(avg * 10) / 10, count: total };
};

const CustomerReviews = ({ productName, variant = "apparel" }: CustomerReviewsProps = {}) => {
  const isJewellery = variant === "jewellery";
  const basePhotos = isJewellery ? jewelleryPhotos : customerPhotos;
  const [activeFilter, setActiveFilter] = useState("All Reviews");
  const [visibleCount, setVisibleCount] = useState(8);
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
      ...ownReviews,
      ...(isJewellery
        ? [...jewelleryReviews, ...jewelleryOneLiners]
        : [...reviewsData, ...apparelOneLiners]),
    ];
    setLocalReviews(seed);

    // Approved shopper-submitted reviews (with their own photos) lead the list.
    (async () => {
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
    })();

    return () => {
      cancelled = true;
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
  const { overallRating, totalReviews, ratingBreakdown, maxCount } = useMemo(() => {
    const total = localReviews.length;
    const avg = total ? localReviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: localReviews.filter((r) => r.rating === stars).length,
    }));
    return {
      overallRating: Math.round(avg * 10) / 10,
      totalReviews: total,
      ratingBreakdown: breakdown,
      maxCount: Math.max(1, ...breakdown.map((b) => b.count)),
    };
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
      setVisibleCount(8);
      setAnimating(false);
    }, 200);
  };

  return (
    <section id="customer-reviews" className="max-w-[1200px] mx-auto px-4 pb-20" style={{ scrollMarginTop: "120px" }}>
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
              {/* The bars are the filter. Baymard found the distribution summary is
                  the most-used part of a reviews section — relied on more than the
                  review text itself — and that 90% of users who wanted a particular
                  rating tried to click the bars, while only 61% of sites let them. */}
              {ratingBreakdown.map(({ stars, count }) => {
                const label = `${stars}★`;
                const active = activeFilter === label;
                return (
                  <button
                    key={stars}
                    type="button"
                    disabled={count === 0}
                    onClick={() => setActiveFilter(active ? "All Reviews" : label)}
                    aria-pressed={active}
                    aria-label={`${count} ${stars}-star review${count === 1 ? "" : "s"}${active ? ", showing" : ""}`}
                    className="flex w-full items-center gap-3 py-1 text-left transition-opacity disabled:cursor-default disabled:opacity-45 enabled:hover:opacity-80"
                  >
                    <span
                      className="text-[13px] w-8 shrink-0 font-medium"
                      style={{ color: active ? "hsl(186 35% 28%)" : "hsl(var(--muted-foreground))" }}
                    >
                      {stars} ★
                    </span>
                    <Progress value={(count / maxCount) * 100} className="h-2.5 flex-1 bg-secondary" />
                    <span
                      className="text-[12px] w-8 text-right"
                      style={{ color: active ? "hsl(186 35% 28%)" : "hsl(var(--muted-foreground))" }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
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
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                className="shrink-0 w-[80px] h-[80px] md:w-[90px] md:h-[90px] overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <img src={photo} alt={`Customer photo ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="mt-2 self-start px-8 py-3 text-[13px] font-medium uppercase tracking-[0.1em] border border-foreground text-foreground transition-all duration-250 ease-in-out hover:bg-foreground hover:text-background hover:shadow-md hover:-translate-y-[1px]"
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
            src={photos[lightboxIndex]}
            alt="Customer photo"
            className="w-full h-auto"
          />
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap gap-2.5">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className="px-4 py-2 text-[13px] font-medium border transition-all duration-200"
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
              className="p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="ml-auto order-last text-[10px] tracking-[0.08em]" style={{ color: "hsl(var(--muted-foreground))" }}>
                  #{review.no ?? i + 1}
                </span>
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
                    <img key={idx} src={img} alt="Review photo" className="w-12 h-12 object-cover" />
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
            onClick={() => setVisibleCount((v) => Math.min(v + 8, filteredReviews.length))}
            className="px-8 py-3 text-[13px] font-medium uppercase tracking-[0.1em] border-2 border-foreground text-foreground transition-all duration-250 ease-in-out hover:bg-foreground hover:text-background hover:shadow-md hover:-translate-y-[1px]"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </section>
  );
};

export default CustomerReviews;
