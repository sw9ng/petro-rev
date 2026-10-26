CREATE TABLE analytics.cron_token (id int PRIMARY KEY DEFAULT 1, token text NOT NULL DEFAULT encode(gen_random_bytes(24),'hex'));
GRANT ALL ON analytics.cron_token TO service_role;
ALTER TABLE analytics.cron_token ENABLE ROW LEVEL SECURITY;
INSERT INTO analytics.cron_token(id) VALUES (1) ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION public.ai_check_cron(p_token text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = analytics AS $$ SELECT EXISTS(SELECT 1 FROM analytics.cron_token WHERE token = p_token) $$;
REVOKE ALL ON FUNCTION public.ai_check_cron(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ai_check_cron(text) TO service_role;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
SELECT cron.schedule('ai-daily-report-0800-istanbul', '0 5 * * *', $c$
  SELECT net.http_post(
    url := 'https://duebejkrrvuodwbforkd.supabase.co/functions/v1/ai-daily-report',
    headers := jsonb_build_object('Content-Type','application/json','apikey','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZWJlamtycnZ1b2R3YmZvcmtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Nzk0NjAsImV4cCI6MjA2NjM1NTQ2MH0.-RgHNXqOFtfvWEubU2TGVoAoAl3CRm_emxnNhgOjl0A','x-cron-secret',(SELECT token FROM analytics.cron_token WHERE id=1)),
    body := '{"mode":"cron"}'::jsonb,
    timeout_milliseconds := 300000);
$c$);