CREATE TABLE public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  product_name text,
  variant text not null default 'jewellery',
  name text not null,
  rating int not null check (rating between 1 and 5),
  text text not null,
  images text[] not null default '{}',
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

GRANT SELECT, INSERT ON public.customer_reviews TO anon;
GRANT SELECT, INSERT ON public.customer_reviews TO authenticated;
GRANT ALL ON public.customer_reviews TO service_role;

ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved reviews"
ON public.customer_reviews FOR SELECT
TO anon, authenticated
USING (approved = true);

CREATE POLICY "Anyone can submit a review for moderation"
ON public.customer_reviews FOR INSERT
TO anon, authenticated
WITH CHECK (
  approved = false
  AND char_length(name) between 1 and 60
  AND char_length(text) between 1 and 2000
  AND array_length(images, 1) is distinct from 0
  AND coalesce(array_length(images, 1), 0) <= 4
);

CREATE INDEX customer_reviews_product_idx ON public.customer_reviews (product_name, created_at DESC);