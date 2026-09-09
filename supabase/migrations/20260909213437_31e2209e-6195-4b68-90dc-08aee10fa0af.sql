CREATE TABLE public.abandoned_cart_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id text,
  checkout_token text,
  checkout_url text,
  email text,
  phone text,
  full_name text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  item_count integer NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR'::text,
  status text NOT NULL DEFAULT 'checkout_started'::text,
  source text NOT NULL DEFAULT 'website'::text,
  utm_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  recovery_sent_at timestamp with time zone,
  recovered_at timestamp with time zone,
  completed_at timestamp with time zone,
  opted_out_at timestamp with time zone,
  session_fingerprint text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.abandoned_cart_sessions TO authenticated;
GRANT ALL ON public.abandoned_cart_sessions TO service_role;

ALTER TABLE public.abandoned_cart_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage abandoned cart sessions"
  ON public.abandoned_cart_sessions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can read their own abandoned cart sessions"
  ON public.abandoned_cart_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create an abandoned cart session"
  ON public.abandoned_cart_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

ALTER TABLE public.member_orders
  ADD COLUMN IF NOT EXISTS cart_id text,
  ADD COLUMN IF NOT EXISTS checkout_token text,
  ADD COLUMN IF NOT EXISTS checkout_url text,
  ADD COLUMN IF NOT EXISTS recovery_sent_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS recovered_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS opted_out_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'website'::text,
  ADD COLUMN IF NOT EXISTS utm_params jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS session_fingerprint text;

CREATE INDEX IF NOT EXISTS idx_abandoned_cart_sessions_cart_id ON public.abandoned_cart_sessions(cart_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_cart_sessions_status_created ON public.abandoned_cart_sessions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_abandoned_cart_sessions_email ON public.abandoned_cart_sessions(email);
CREATE INDEX IF NOT EXISTS idx_member_orders_cart_id ON public.member_orders(cart_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $function$;

CREATE TRIGGER abandoned_cart_sessions_set_updated_at
  BEFORE UPDATE ON public.abandoned_cart_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER member_orders_set_updated_at
  BEFORE UPDATE ON public.member_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();