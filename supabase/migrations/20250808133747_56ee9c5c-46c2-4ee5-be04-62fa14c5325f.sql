-- Remove company limit for premium users
DROP TRIGGER IF EXISTS trigger_check_company_limit ON public.companies;

-- Create updated company limit check function that allows unlimited companies for premium users
CREATE OR REPLACE FUNCTION public.check_company_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Check if user is premium
  IF public.is_user_premium(NEW.owner_id) THEN
    -- Premium users have no limit
    RETURN NEW;
  END IF;
  
  -- Non-premium users are limited to 3 companies
  IF (SELECT COUNT(*) FROM public.companies WHERE owner_id = NEW.owner_id) >= 3 THEN
    RAISE EXCEPTION 'Maksimum 3 şirket oluşturabilirsiniz. Premium hesabınızla sınırsız şirket oluşturabilirsiniz.';
  END IF;
  RETURN NEW;
END;
$function$;

-- Create the trigger
CREATE TRIGGER trigger_check_company_limit
  BEFORE INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.check_company_limit();