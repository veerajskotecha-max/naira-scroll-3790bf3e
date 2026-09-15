ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ad_matching_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ad_matching_consent_at timestamptz;