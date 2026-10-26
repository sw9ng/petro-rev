CREATE SCHEMA IF NOT EXISTS analytics;
REVOKE ALL ON SCHEMA analytics FROM anon, authenticated, public;
GRANT USAGE ON SCHEMA analytics TO service_role;

CREATE TABLE analytics.job_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id uuid NOT NULL,
  business_date date NOT NULL,
  status text NOT NULL DEFAULT 'running',
  attempts int NOT NULL DEFAULT 0,
  error text,
  lease_until timestamptz,
  trigger text NOT NULL DEFAULT 'cron',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (station_id, business_date)
);
CREATE TABLE analytics.ai_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id uuid NOT NULL,
  business_date date NOT NULL,
  revision int NOT NULL DEFAULT 1,
  source_hash text NOT NULL,
  metrics jsonb NOT NULL,
  payload jsonb,
  data_quality_status text NOT NULL,
  model text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (station_id, business_date, revision)
);
CREATE TABLE analytics.regen_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON ALL TABLES IN SCHEMA analytics TO service_role;
ALTER TABLE analytics.job_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.regen_log ENABLE ROW LEVEL SECURITY;

-- Deterministic KPI computation (read-only on business tables)
CREATE OR REPLACE FUNCTION analytics.compute_daily_metrics(p_station uuid, p_date date)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, analytics AS $$
WITH tz AS (SELECT 'Europe/Istanbul'::text z),
sales AS (
  SELECT fuel_type, SUM(liters) l, SUM(total_amount) a, COUNT(*) n
  FROM fuel_sales, tz WHERE station_id = p_station AND (sale_time AT TIME ZONE tz.z)::date = p_date
  GROUP BY fuel_type),
daily AS (
  SELECT d::date dy, COALESCE(SUM(fs.liters),0) l
  FROM generate_series(p_date - 89, p_date, interval '1 day') d
  LEFT JOIN fuel_sales fs ON fs.station_id = p_station AND (fs.sale_time AT TIME ZONE 'Europe/Istanbul')::date = d::date
  GROUP BY d),
sh AS (
  SELECT * FROM shifts WHERE station_id = p_station AND
   (CASE WHEN shift_number='V1' AND end_time IS NOT NULL THEN (end_time AT TIME ZONE 'Europe/Istanbul')::date
         ELSE (start_time AT TIME ZONE 'Europe/Istanbul')::date END) = p_date),
cost AS (
  SELECT fuel_type, SUM(total_amount)/NULLIF(SUM(liters),0) avg_cost FROM fuel_purchases
  WHERE station_id = p_station AND purchase_date <= (p_date + 1)::timestamptz AND purchase_date > (p_date - 90)::timestamptz
  GROUP BY fuel_type),
bal AS (
  SELECT c.id, SUM(CASE WHEN t.transaction_type='debt' THEN t.amount ELSE -t.amount END) b,
    MAX(t.transaction_date) FILTER (WHERE t.transaction_type='payment') last_pay,
    MAX(t.transaction_date) last_any,
    SUM(t.amount) FILTER (WHERE t.transaction_type='debt' AND t.transaction_date > p_date - 30) d30,
    SUM(t.amount) FILTER (WHERE t.transaction_type='debt' AND t.transaction_date <= p_date - 30 AND t.transaction_date > p_date - 60) d_prev30
  FROM customers c JOIN customer_transactions t ON t.customer_id = c.id
  WHERE c.station_id = p_station AND t.transaction_date < (p_date + 1)::timestamptz
  GROUP BY c.id)
SELECT jsonb_build_object(
 'business_date', p_date,
 'total_litres', COALESCE((SELECT SUM(l) FROM sales),0),
 'total_revenue', COALESCE((SELECT SUM(a) FROM sales),0),
 'sale_records', COALESCE((SELECT SUM(n) FROM sales),0),
 'goal_litres', 10000,
 'fuel_breakdown', COALESCE((SELECT jsonb_agg(jsonb_build_object('fuel_type',s.fuel_type,'litres',round(s.l,2),'revenue',round(s.a,2),
     'avg_cost_per_litre', round(c.avg_cost,4),
     'gross_contribution', CASE WHEN c.avg_cost IS NULL THEN NULL ELSE round(s.a - s.l*c.avg_cost,2) END))
   FROM sales s LEFT JOIN cost c USING (fuel_type)),'[]'),
 'trend', jsonb_build_object(
   'avg_7', round((SELECT AVG(l) FROM daily WHERE dy > p_date-7),2),
   'avg_30', round((SELECT AVG(l) FROM daily WHERE dy > p_date-30),2),
   'avg_90', round((SELECT AVG(l) FROM daily),2),
   'days_with_sales_30', (SELECT COUNT(*) FROM daily WHERE dy > p_date-30 AND l>0),
   'series_30', (SELECT jsonb_agg(jsonb_build_object('d',dy,'l',round(l,0)) ORDER BY dy) FROM daily WHERE dy > p_date-30)),
 'shifts', jsonb_build_object(
   'count', (SELECT COUNT(*) FROM sh),
   'has_v1', EXISTS(SELECT 1 FROM sh WHERE shift_number='V1'),
   'has_v2', EXISTS(SELECT 1 FROM sh WHERE shift_number='V2'),
   'automation_sales', COALESCE((SELECT SUM(actual_amount) FROM sh),0),
   'cash', COALESCE((SELECT SUM(cash_sales) FROM sh),0),
   'card', COALESCE((SELECT SUM(card_sales) FROM sh),0),
   'bank_transfers', COALESCE((SELECT SUM(bank_transfers) FROM sh),0),
   'loyalty', COALESCE((SELECT SUM(loyalty_card) FROM sh),0),
   'veresiye', COALESCE((SELECT SUM(veresiye) FROM sh),0),
   'over_short', COALESCE((SELECT SUM(over_short) FROM sh),0),
   'open_shifts', (SELECT COUNT(*) FROM sh WHERE end_time IS NULL),
   'big_over_short', (SELECT COUNT(*) FROM sh WHERE abs(COALESCE(over_short,0)) > 500)),
 'receivables', jsonb_build_object(
   'total_open', COALESCE((SELECT round(SUM(b),2) FROM bal WHERE b>0),0),
   'customers_with_debt', (SELECT COUNT(*) FROM bal WHERE b>0),
   'aging', jsonb_build_object(
     'b0_30', COALESCE((SELECT round(SUM(b),2) FROM bal WHERE b>0 AND COALESCE(last_pay,'1900-01-01') > p_date-30),0),
     'b31_60', COALESCE((SELECT round(SUM(b),2) FROM bal WHERE b>0 AND COALESCE(last_pay,'1900-01-01') <= p_date-30 AND COALESCE(last_pay,'1900-01-01') > p_date-60),0),
     'b61_90', COALESCE((SELECT round(SUM(b),2) FROM bal WHERE b>0 AND COALESCE(last_pay,'1900-01-01') <= p_date-60 AND COALESCE(last_pay,'1900-01-01') > p_date-90),0),
     'b90_plus', COALESCE((SELECT round(SUM(b),2) FROM bal WHERE b>0 AND COALESCE(last_pay,'1900-01-01') <= p_date-90),0)),
   'collections_today', COALESCE((SELECT SUM(amount) FROM customer_transactions WHERE station_id=p_station AND transaction_type='payment' AND (transaction_date AT TIME ZONE 'Europe/Istanbul')::date=p_date),0),
   'credit_given_today', COALESCE((SELECT SUM(amount) FROM customer_transactions WHERE station_id=p_station AND transaction_type='debt' AND (transaction_date AT TIME ZONE 'Europe/Istanbul')::date=p_date),0)),
 'customers', jsonb_build_object(
   'lost_count', (SELECT COUNT(*) FROM bal WHERE last_any <= p_date-30 AND last_any > p_date-180),
   'declining_count', (SELECT COUNT(*) FROM bal WHERE d_prev30 > 0 AND COALESCE(d30,0) < d_prev30*0.5),
   'declining_lost_amount_30', COALESCE((SELECT round(SUM(d_prev30 - COALESCE(d30,0)),2) FROM bal WHERE d_prev30 > 0 AND COALESCE(d30,0) < d_prev30*0.5),0)),
 'data_quality_status', CASE
   WHEN NOT EXISTS(SELECT 1 FROM sales) AND NOT EXISTS(SELECT 1 FROM sh) THEN 'yetersiz_veri'
   WHEN NOT EXISTS(SELECT 1 FROM sales) OR NOT EXISTS(SELECT 1 FROM sh) THEN 'eksik_veri'
   WHEN EXISTS(SELECT 1 FROM sh WHERE end_time IS NULL) THEN 'mutabakat_bekliyor'
   ELSE 'tam' END
);
$$;
REVOKE ALL ON FUNCTION analytics.compute_daily_metrics(uuid,date) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION analytics.compute_daily_metrics(uuid,date) TO service_role;

-- Service-only helpers exposed via public for edge functions (service_role only)
CREATE OR REPLACE FUNCTION public.ai_compute_metrics(p_station uuid, p_date date)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, analytics AS $$ SELECT analytics.compute_daily_metrics(p_station, p_date) $$;
REVOKE ALL ON FUNCTION public.ai_compute_metrics(uuid,date) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ai_compute_metrics(uuid,date) TO service_role;

CREATE OR REPLACE FUNCTION public.ai_acquire_job(p_station uuid, p_date date, p_trigger text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = analytics AS $$
DECLARE ok boolean;
BEGIN
  INSERT INTO analytics.job_runs(station_id,business_date,status,attempts,lease_until,trigger)
  VALUES (p_station,p_date,'running',1,now()+interval '10 minutes',p_trigger)
  ON CONFLICT (station_id,business_date) DO UPDATE
    SET status='running', attempts=job_runs.attempts+1, lease_until=now()+interval '10 minutes', trigger=p_trigger, error=NULL, updated_at=now()
    WHERE (job_runs.lease_until IS NULL OR job_runs.lease_until < now() OR job_runs.status <> 'running')
  RETURNING true INTO ok;
  RETURN COALESCE(ok,false);
END $$;
CREATE OR REPLACE FUNCTION public.ai_finish_job(p_station uuid, p_date date, p_status text, p_error text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = analytics AS $$
  UPDATE analytics.job_runs SET status=p_status, error=left(p_error,1000), lease_until=NULL, updated_at=now()
  WHERE station_id=p_station AND business_date=p_date $$;
CREATE OR REPLACE FUNCTION public.ai_save_report(p_station uuid, p_date date, p_hash text, p_metrics jsonb, p_payload jsonb, p_quality text, p_model text)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = analytics AS $$
DECLARE r int;
BEGIN
  SELECT COALESCE(MAX(revision),0)+1 INTO r FROM analytics.ai_reports WHERE station_id=p_station AND business_date=p_date;
  INSERT INTO analytics.ai_reports(station_id,business_date,revision,source_hash,metrics,payload,data_quality_status,model)
  VALUES (p_station,p_date,r,p_hash,p_metrics,p_payload,p_quality,p_model);
  RETURN r;
END $$;
CREATE OR REPLACE FUNCTION public.ai_latest_hash(p_station uuid, p_date date)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = analytics AS $$
  SELECT source_hash FROM analytics.ai_reports WHERE station_id=p_station AND business_date=p_date ORDER BY revision DESC LIMIT 1 $$;
CREATE OR REPLACE FUNCTION public.ai_regen_allowed(p_station uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = analytics AS $$
BEGIN
  IF (SELECT COUNT(*) FROM analytics.regen_log WHERE station_id=p_station AND created_at > now()-interval '1 day') >= 3 THEN RETURN false; END IF;
  INSERT INTO analytics.regen_log(station_id) VALUES (p_station); RETURN true;
END $$;
DO $$ DECLARE f text; BEGIN
  FOREACH f IN ARRAY ARRAY['ai_acquire_job(uuid,date,text)','ai_finish_job(uuid,date,text,text)','ai_save_report(uuid,date,text,jsonb,jsonb,text,text)','ai_latest_hash(uuid,date)','ai_regen_allowed(uuid)'] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM public, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', f);
  END LOOP; END $$;

-- Owner-facing read RPCs (scoped to auth.uid())
CREATE OR REPLACE FUNCTION public.get_ai_reports(p_from date, p_to date)
RETURNS TABLE(business_date date, revision int, data_quality_status text, metrics jsonb, payload jsonb, model text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = analytics AS $$
  SELECT DISTINCT ON (r.business_date) r.business_date, r.revision, r.data_quality_status, r.metrics, r.payload, r.model, r.created_at
  FROM analytics.ai_reports r
  WHERE auth.uid() IS NOT NULL AND r.station_id = auth.uid() AND r.business_date BETWEEN p_from AND p_to
  ORDER BY r.business_date DESC, r.revision DESC $$;
CREATE OR REPLACE FUNCTION public.get_ai_job_status()
RETURNS TABLE(business_date date, status text, attempts int, error text, updated_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = analytics AS $$
  SELECT business_date, status, attempts, error, updated_at FROM analytics.job_runs
  WHERE auth.uid() IS NOT NULL AND station_id = auth.uid() ORDER BY business_date DESC LIMIT 30 $$;
REVOKE ALL ON FUNCTION public.get_ai_reports(date,date) FROM public, anon;
REVOKE ALL ON FUNCTION public.get_ai_job_status() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_ai_reports(date,date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ai_job_status() TO authenticated;