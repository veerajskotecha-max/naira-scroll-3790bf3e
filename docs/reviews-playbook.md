# Reviews Playbook, Naira Flore

The goal: build real, photo-backed reviews the way Salty did (42,000+ reviews
collected through post-purchase WhatsApp into Judge.me). Every order is a
review opportunity; the WhatsApp thread already exists because orders and
support run through it.

## One-time setup (about 10 minutes)

1. Shopify admin > Apps > search "Judge.me Product Reviews" > install (free plan
   is enough to start).
2. Judge.me admin > Settings > Advanced > enable **platform-independent
   widgets**. Copy the store-specific script URL it shows.
3. In Lovable (or wherever env vars are set for the site build), add
   `VITE_JUDGEME_SCRIPT_URL=<that script URL>` and redeploy.
   The product pages then switch automatically from the curated testimonials
   block to the live Judge.me widget (`src/components/JudgeMeReviews.tsx`).
4. In Judge.me admin, turn ON automatic review request emails as a backstop
   (default 14 days after fulfilment works for made-to-order timelines).

## The WhatsApp flow (every order)

Send this 3 to 5 days after the customer confirms delivery, from the business
line (+91 95615 57935):

> Hi {name}! This is Naira Flore. We hope the {product} has settled in
> beautifully. If you have a spare minute, would you share a quick review?
> A photo of it on you makes our day (and helps other customers see the real
> thing). Here is the link: {review link}
>
> As a thank you, we will send you a 10% code for your next piece once your
> review is live.

Where {review link} comes from: Judge.me admin > Requests > Manual request,
enter the customer email + order, and it generates a per-order review link.
Reviews submitted through it are marked **Verified** because they are tied to
a real order.

If the customer replies with just a photo and a line of praise in WhatsApp,
ask: "May we publish this as a review with your first name?" and on a yes,
submit it through Judge.me's manual review entry with their email. Never
publish without the yes, and never write reviews for customers.

## Cadence and hygiene

- Ask once, nudge once (a single follow-up a week later), then stop.
- Aim: 30%+ of delivered orders leave a review in the first 90 days.
- Photo reviews are worth chasing hardest; they carry the whole widget.
- Negative reviews stay up. Reply publicly within 24 hours with the fix.
  One well-handled complaint builds more trust than ten 5-star ratings.
- The curated testimonials in `CustomerReviews.tsx` were the launch stopgap.
  Once Judge.me has 15 to 20 real reviews, the flag flips them off on product
  pages; keep them for the About page or campaign use.
