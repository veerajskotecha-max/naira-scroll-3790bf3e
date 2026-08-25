REVOKE SELECT ON public.inner_circle_signups FROM anon;
GRANT SELECT ON public.inner_circle_signups TO authenticated;
GRANT ALL ON public.inner_circle_signups TO service_role;

DROP POLICY IF EXISTS "Members read own signups" ON public.inner_circle_signups;
CREATE POLICY "Members read own signups"
ON public.inner_circle_signups
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);