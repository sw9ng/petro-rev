# AGENTS
- AI reports live in the private `analytics` schema; browser reads only via auth.uid()-scoped RPCs (get_ai_reports, get_ai_job_status), and the ai-daily-report edge function writes via service-role RPCs — keeps raw business tables read-only for AI.
