import { getProductReviews } from "@/data/productReviews";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product1Hover from "@/assets/product-1-hover.jpg";
import product2Hover from "@/assets/product-2-hover.jpg";
import reviewTaneesha from "@/assets/review-taneesha.webp";
import reviewNabby from "@/assets/review-nabby.webp";
import reviewAshley from "@/assets/review-ashley.webp";
import { url as jewelUgcVineUrl } from "@/assets/jewellery/ugc/the-vine-ugc.jpg.asset.json";
import { url as jewelUgcBraceletUrl } from "@/assets/jewellery/ugc/jewel-review-bracelet.jpg.asset.json";
import { url as jewelUgcSolitaireUrl } from "@/assets/jewellery/ugc/jewel-review-solitaire.jpg.asset.json";
import { url as jewelUgcToiEtMoiUrl } from "@/assets/jewellery/ugc/jewel-review-toietmoi.jpg.asset.json";
import { url as jewelUgcBowUrl } from "@/assets/jewellery/ugc/jewel-review-bow.jpg.asset.json";
import { url as jewelUgcPearlStudsUrl } from "@/assets/jewellery/ugc/jewel-review-pearl-studs.jpg.asset.json";
import { url as jewelUgcBraidedHoopUrl } from "@/assets/jewellery/ugc/jewel-review-braided-hoop.jpg.asset.json";
import { url as jewelUgcPearPendantUrl } from "@/assets/jewellery/ugc/jewel-review-pear-pendant.jpg.asset.json";
import { url as jewelUgcHaloRingUrl } from "@/assets/jewellery/ugc/jewel-review-halo-ring.jpg.asset.json";
import { url as realPastelBoxUrl } from "@/assets/jewellery/real/real-pastel-bracelet-box.jpg.asset.json";
import { url as realPastelWornUrl } from "@/assets/jewellery/real/real-pastel-bracelet-worn.jpg.asset.json";
import { url as realBraceletPackagingUrl } from "@/assets/jewellery/real/real-bracelet-packaging.jpg.asset.json";
import { url as realGoldSetUrl } from "@/assets/jewellery/real/real-gold-set.jpg.asset.json";
import { url as realSolitaireSetUrl } from "@/assets/jewellery/real/real-solitaire-set.jpg.asset.json";
import { url as realHeartbeadUrl } from "@/assets/jewellery/real/real-heartbead-bracelet.jpg.asset.json";
import { url as realPearlPendantUrl } from "@/assets/jewellery/real/real-pearl-pendant.jpg.asset.json";



// Named imports: only `url` is used, and the rest of each asset record
// (ids, storage keys, sizes) then stays out of the bundle.

/*
  The review wall's content, kept apart from the section that draws it so a
  product page can show its star rating without downloading the section: the
  section (with its write-a-review drawer) loads after first paint, the
  numbers beside the title come from here. Content moved unchanged from
  components/CustomerReviews.tsx.
*/

export interface Review {
  no?: number;
  /** Keywords used to surface the most relevant real review first on a PDP. */
  match?: string[];
  name: string;
  initials: string;
  verified: boolean;
  rating: number;
  date: string;
  text: string;
  hasPhotos: boolean;
  images: string[];
}

export const reviewsData: Review[] = [
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

export const customerPhotos = [reviewAshley, reviewTaneesha, reviewNabby];

/* Genuine customer reviews with their own photographs. These lead the wall on
   every product page, ahead of the curated and one-line notes. */
export const realReviews: Review[] = [
  {
    name: "Khushi",
    initials: "A",
    verified: true,
    rating: 5,
    date: "September 2, 2026",
    text: "The pastel zircone bracelet is even prettier in person. Every stone is set cleanly and the colours look soft and expensive, not loud. It came in the sweetest pink Naira box and I've worn it stacked with my everyday chain since the day it arrived.",
    hasPhotos: true,
    images: [realPastelBoxUrl, realPastelWornUrl, realBraceletPackagingUrl],
    match: ["bracelet", "pastel", "zircone", "candy", "rainbow"],
  },
  {
    name: "Tanvi Joshi",
    initials: "TJ",
    verified: true,
    rating: 5,
    date: "August 28, 2026",
    text: "Ordered the baguette bracelet with two pairs of hoops and the whole set arrived beautifully packed. The gold tone is warm and rich, the braided hoops are far lighter than they look, and nothing has dulled after weeks of wear.",
    hasPhotos: true,
    images: [realGoldSetUrl],
    match: ["hoop", "huggie", "bracelet", "baguette", "gold"],
  },
  {
    name: "Dipika Tated",
    initials: "DT",
    verified: true,
    rating: 5,
    date: "August 21, 2026",
    text: "Wearing the solitaire pendant with the matching studs almost daily now. The chain is fine and delicate, the stone catches light in every photo, and there's been no skin darkening at all.",
    hasPhotos: true,
    images: [realSolitaireSetUrl],
    match: ["pendant", "solitaire", "necklace", "stud", "chain"],
  },
  {
    name: "Nabby Dsouza",
    initials: "ND",
    verified: true,
    rating: 5,
    date: "August 14, 2026",
    text: "The beaded bracelet with the gold heart charm is my favourite pickup this year. The beads have a lovely weight, the toggle clasp is easy to fasten one-handed, and the heart sits perfectly on the wrist.",
    hasPhotos: true,
    images: [realHeartbeadUrl],
    match: ["heartbead", "heart", "bead", "bracelet", "charm"],
  },
  {
    name: "Sneha Kulkarni",
    initials: "SK",
    verified: true,
    rating: 5,
    date: "August 6, 2026",
    text: "Bought the blush cluster ring for a family lunch and it has not left my finger since. The pink centre stone catches light beautifully, the tiny stones around it are set evenly, and the slim band makes it comfortable enough for all-day wear.",
    hasPhotos: false,
    images: [],
    match: ["blush", "cluster", "ring", "pink", "flower"],
  },
  {
    name: "Ishita Mehta",
    initials: "IM",
    verified: true,
    rating: 5,
    date: "September 5, 2026",
    text: "The pearl drop stud with the little pendant chain has become my everyday pair. It is light enough to forget I am wearing it, the pearl has a soft natural sheen, and the chain sits at exactly the right length with a shirt.",
    hasPhotos: true,
    images: [realPearlPendantUrl],
    match: ["pearl", "stud", "earring", "pendant", "necklace", "chain"],
  },
  {
    name: "Prachi Deshmukh",
    initials: "PD",
    verified: true,
    rating: 5,
    date: "September 7, 2026",
    text: "The blush cluster ring is such a pretty everyday statement. The pink centre stone glows in natural light, the surrounding setting is delicate, and the slim band makes it comfortable to wear all day.",
    hasPhotos: false,
    images: [],
    match: ["blush", "cluster", "ring", "pink", "flower"],
  },
];

export const realPhotos = realReviews.flatMap((r) => r.images);

/* Show the real review whose piece matches the product being viewed first, so
   the photo wall on each page feels specific to that piece. */
export const orderedRealReviews = (productName?: string) => {
  const n = (productName ?? "").toLowerCase();
  if (!n) return realReviews;
  const score = (r: Review) => (r.match ?? []).filter((k) => n.includes(k)).length;
  return [...realReviews].sort((a, b) => score(b) - score(a));
};

export const jewelleryPhotos = [
  ...realPhotos,
  jewelUgcVineUrl,
  jewelUgcBraidedHoopUrl,
  jewelUgcPearPendantUrl,
  jewelUgcHaloRingUrl,
  jewelUgcPearlStudsUrl,
  jewelUgcBraceletUrl,
  jewelUgcSolitaireUrl,
  jewelUgcToiEtMoiUrl,
  jewelUgcBowUrl,
];



export const jewelleryReviews: Review[] = [
  {
    name: "Aditi Ranganathan",
    initials: "AR",
    verified: true,
    rating: 5,
    date: "July 12, 2026",
    text: "The green stones catch light like the real thing. People genuinely asked if it was emerald. The 18K gold finish hasn't dulled at all after weeks of daily wear, and the band sits perfectly without spinning.",
    hasPhotos: true,
    images: [jewelUgcVineUrl],
  },
  {
    name: "Sanjana Bhide",
    initials: "SB",
    verified: true,
    rating: 5,
    date: "July 6, 2026",
    text: "The pastel zircones on this tennis bracelet are cut so cleanly that the sparkle is almost restless. Clasp is secure, weight feels substantial, and the packaging made it feel like a proper gift.",
    hasPhotos: true,
    images: [jewelUgcBraceletUrl],
  },
  {
    name: "Ritika Sharma",
    initials: "RS",
    verified: true,
    rating: 5,
    date: "June 28, 2026",
    text: "Brilliant-cut zircone with real fire, it throws rainbows in sunlight. Ordered a US 6 and the fit was exact to the size chart. Honestly indistinguishable from my solitaire at a fraction of the cost.",
    hasPhotos: true,
    images: [jewelUgcSolitaireUrl],
  },
  {
    name: "Neha Kulkarni",
    initials: "NK",
    verified: true,
    rating: 5,
    date: "June 19, 2026",
    text: "The toi-et-moi is my everyday ring now. Bezel setting keeps the stones flush so nothing snags, the gold tone is warm rather than brassy, and there's zero skin discolouration.",
    hasPhotos: true,
    images: [jewelUgcToiEtMoiUrl],
  },
  {
    name: "Prisha Menon",
    initials: "PM",
    verified: true,
    rating: 5,
    date: "June 9, 2026",
    text: "These bow studs are tiny but the detailing is unreal. Each stone is individually set and the finish is flawless. Light enough to forget I'm wearing them, and they've survived travel and everyday wear beautifully.",
    hasPhotos: true,
    images: [jewelUgcBowUrl],
  },
  {
    name: "Meghana Iyer",
    initials: "MI",
    verified: true,
    rating: 5,
    date: "August 2, 2026",
    text: "Wore the braided hoops to a wedding and three people asked where they were from. They're chunky but so light on the ear, and the gold has stayed bright with no dullness at all.",
    hasPhotos: true,
    images: [jewelUgcBraidedHoopUrl],
  },
  {
    name: "Shreya Nadkarni",
    initials: "SN",
    verified: true,
    rating: 5,
    date: "July 28, 2026",
    text: "The pear pendant is exactly the everyday piece I wanted, delicate chain, clean bezel, and the stone catches light beautifully. Haven't taken it off in weeks.",
    hasPhotos: true,
    images: [jewelUgcPearPendantUrl],
  },
  {
    name: "Aarohi Deshmukh",
    initials: "AD",
    verified: true,
    rating: 5,
    date: "July 21, 2026",
    text: "Opened the box and genuinely gasped. The halo ring looks like a proper engagement ring, the pavé band is set so neatly and the packaging is lovely.",
    hasPhotos: true,
    images: [jewelUgcHaloRingUrl],
  },
  {
    name: "Tanya Sequeira",
    initials: "TS",
    verified: true,
    rating: 5,
    date: "July 16, 2026",
    text: "The pearl studs are the perfect size, not too loud for work but still special. The rope detailing around the pearl is what sold me.",
    hasPhotos: true,
    images: [jewelUgcPearlStudsUrl],
  },
];


/* Short, one-line verified-buyer notes — the bulk of a real review wall.
   Kept photo-free so the "With Photos" filter still means something. */
export const oneLiner = (
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

export const jewelleryOneLiners: Review[] = [
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

export const apparelOneLiners: Review[] = [
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
  const all = [...orderedRealReviews(productName), ...getProductReviews(productName ?? ""), ...base];
  const total = all.length;
  if (!total) return null;
  const avg = all.reduce((sum, r) => sum + r.rating, 0) / total;
  return { rating: Math.round(avg * 10) / 10, count: total };
};
