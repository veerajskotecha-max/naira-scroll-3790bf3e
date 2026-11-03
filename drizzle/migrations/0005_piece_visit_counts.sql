CREATE OR REPLACE FUNCTION public.piece_visit_counts()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
SELECT coalesce(jsonb_object_agg(h, n), '{}'::jsonb) FROM (
  SELECT split_part(path, '/', 3) AS h, count(*) AS n
  FROM public.shopper_performance_events
  WHERE kind = 'timing' AND path LIKE '/jewellery/%' AND created_at >= now() - interval '30 days'
  GROUP BY 1 HAVING split_part(path, '/', 3) <> '' ORDER BY 2 DESC LIMIT 300
) t;
$$;
REVOKE ALL ON FUNCTION public.piece_visit_counts() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.piece_visit_counts() TO service_role;