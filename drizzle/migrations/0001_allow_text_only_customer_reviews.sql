DROP POLICY IF EXISTS "Anyone can submit a review for moderation" ON public.customer_reviews;
CREATE POLICY "Anyone can submit a review for moderation"
ON public.customer_reviews
FOR INSERT
TO anon, authenticated
WITH CHECK (
  approved = false
  AND char_length(name) BETWEEN 1 AND 60
  AND char_length(text) BETWEEN 1 AND 2000
  AND COALESCE(array_length(images, 1), 0) <= 4
);