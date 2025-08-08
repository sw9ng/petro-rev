-- Drop any existing trigger first
DROP TRIGGER IF EXISTS trigger_check_company_limit ON public.companies;

-- Create the company limit check function with the correct limit of 3
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

-- Create the trigger
CREATE TRIGGER trigger_check_company_limit
  BEFORE INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.check_company_limit();