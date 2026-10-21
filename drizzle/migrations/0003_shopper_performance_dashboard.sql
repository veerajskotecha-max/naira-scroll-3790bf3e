CREATE TABLE public.shopper_performance_events (
 id uuid PRIMARY KEY,
 created_at timestamptz NOT NULL DEFAULT now(),
 path text NOT NULL CHECK (char_length(path) <= 300),
 landing_path text NOT NULL CHECK (char_length(landing_path) <= 300),
 device text NOT NULL CHECK (device IN ('mobile','desktop')),
 campaign text NOT NULL DEFAULT '' CHECK (char_length(campaign) <= 100),
 source text NOT NULL DEFAULT '' CHECK (char_length(source) <= 60),
 kind text NOT NULL CHECK (kind IN ('timing','missing_product','unknown_page','product_load_error','route_timeout')),
 navigation text NOT NULL CHECK (navigation IN ('document','client')),
 ready_ms integer CHECK (ready_ms BETWEEN 0 AND 120000),
 load_ms integer CHECK (load_ms BETWEEN 0 AND 120000),
 lcp_ms integer CHECK (lcp_ms BETWEEN 0 AND 120000)
);
GRANT ALL ON public.shopper_performance_events TO service_role;
ALTER TABLE public.shopper_performance_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read shopper performance" ON public.shopper_performance_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
GRANT SELECT ON public.shopper_performance_events TO authenticated;
CREATE INDEX shopper_performance_events_created_idx ON public.shopper_performance_events (created_at DESC);
CREATE OR REPLACE FUNCTION public.shopper_performance_report(days integer DEFAULT 7)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
WITH recent AS (
 SELECT * FROM public.shopper_performance_events WHERE created_at >= now() - make_interval(days => greatest(1, least(days, 30)))
), pages AS (
 SELECT path, device, navigation, count(*) AS samples,
 round((percentile_cont(0.75) WITHIN GROUP (ORDER BY ready_ms))::numeric) AS ready_p75,
 round((percentile_cont(0.75) WITHIN GROUP (ORDER BY load_ms))::numeric) AS load_p75,
 round((percentile_cont(0.75) WITHIN GROUP (ORDER BY lcp_ms))::numeric) AS lcp_p75
 FROM recent WHERE kind = 'timing' GROUP BY path, device, navigation
), issues AS (
 SELECT path, landing_path, campaign, source, kind, count(*) AS occurrences, max(created_at) AS last_seen
 FROM recent WHERE kind <> 'timing' GROUP BY path, landing_path, campaign, source, kind
)
SELECT jsonb_build_object(
 'samples', (SELECT count(*) FROM recent WHERE kind = 'timing'),
 'issues', coalesce((SELECT jsonb_agg(x) FROM (SELECT * FROM issues ORDER BY last_seen DESC LIMIT 100) x), '[]'::jsonb),
 'pages', coalesce((SELECT jsonb_agg(x) FROM (SELECT * FROM pages ORDER BY ready_p75 DESC NULLS LAST LIMIT 200) x), '[]'::jsonb),
 'latest', (SELECT max(created_at) FROM recent)
);
$$;
REVOKE ALL ON FUNCTION public.shopper_performance_report(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.shopper_performance_report(integer) TO service_role;