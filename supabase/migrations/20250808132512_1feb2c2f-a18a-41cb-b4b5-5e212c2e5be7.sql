-- Remove the company limit trigger for cash section
DROP TRIGGER IF EXISTS trigger_check_company_limit ON companies;