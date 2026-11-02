-- Abandoned carts: no client writes them; only signed-in members may record their own.
DROP POLICY IF EXISTS "Anyone can create an abandoned cart session" ON public.abandoned_cart_sessions;
CREATE POLICY "Members create own abandoned cart sessions" ON public.abandoned_cart_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Inner Circle: open sign-up stays, but a row can only claim the caller and must be well-formed.
DROP POLICY IF EXISTS "Anyone can join the list" ON public.inner_circle_signups;
CREATE POLICY "Anyone can join the list" ON public.inner_circle_signups
  FOR INSERT TO anon, authenticated WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid())
    AND char_length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (name IS NULL OR char_length(name) <= 80)
    AND (phone IS NULL OR char_length(phone) <= 20)
    AND char_length(source) <= 40
  );

-- Reel media: readable only when it belongs to a published reel; admins read everything.
DROP POLICY IF EXISTS "Public can read reel media" ON storage.objects;
CREATE POLICY "Public can read published reel media" ON storage.objects
  FOR SELECT TO anon, authenticated USING (
    bucket_id = 'reels' AND EXISTS (
      SELECT 1 FROM public.reels r
      WHERE r.published = true AND (r.video_path = storage.objects.name OR r.poster_path = storage.objects.name)
    )
  );
CREATE POLICY "Admins read reel media" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'reels' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Review photos: uploads must be a single random-named image at the bucket root.
DROP POLICY IF EXISTS "Anyone can upload review photos" ON storage.objects;
CREATE POLICY "Anyone can upload review photos" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (
    bucket_id = 'review-photos'
    AND name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|heic|heif|gif)$'
  );

-- Review photos: listing/reading is only possible in the minutes after upload (to sign the link);
-- issued signed links keep working. Admins can read all for moderation.
DROP POLICY IF EXISTS "Anyone can view review photos" ON storage.objects;
CREATE POLICY "Uploader can sign fresh review photo" ON storage.objects
  FOR SELECT TO anon, authenticated USING (
    bucket_id = 'review-photos' AND created_at > now() - interval '10 minutes'
  );
CREATE POLICY "Admins read review photos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'review-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));