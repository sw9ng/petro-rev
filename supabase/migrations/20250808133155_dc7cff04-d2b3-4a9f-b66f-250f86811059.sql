-- Update company limit from 2 to 3
CREATE OR REPLACE FUNCTION public.check_company_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF (SELECT COUNT(*) FROM public.companies WHERE owner_id = NEW.owner_id) >= 3 THEN
    RAISE EXCEPTION 'Maksimum 3 şirket oluşturabilirsiniz';
  END IF;
  RETURN NEW;
END;
$function$;

-- Add the trigger back to companies table
CREATE TRIGGER trigger_check_company_limit
  BEFORE INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.check_company_limit();