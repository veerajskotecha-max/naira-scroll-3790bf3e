CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  birthday DATE,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Members create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Members update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.inner_circle_signups (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  source TEXT NOT NULL DEFAULT 'inner-circle',
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX inner_circle_signups_email_key ON public.inner_circle_signups (lower(email));
GRANT INSERT ON public.inner_circle_signups TO anon, authenticated;
GRANT ALL ON public.inner_circle_signups TO service_role;
ALTER TABLE public.inner_circle_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join the list" ON public.inner_circle_signups FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.member_orders (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  item_count INTEGER NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  checkout_url TEXT,
  status TEXT NOT NULL DEFAULT 'checkout_started',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.member_orders TO authenticated;
GRANT ALL ON public.member_orders TO service_role;
ALTER TABLE public.member_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read own orders" ON public.member_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Members create own orders" ON public.member_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();