-- First drop the existing function
DROP FUNCTION IF EXISTS public.get_attendant_shifts(uuid, uuid, timestamp with time zone, timestamp with time zone, text);

-- Then recreate it with the new return type including bank_transfer_description
CREATE OR REPLACE FUNCTION public.get_attendant_shifts(
  attendant_id_param uuid, 
  station_id_param uuid, 
  date_start_param timestamp with time zone DEFAULT NULL, 
  date_end_param timestamp with time zone DEFAULT NULL, 
  shift_filter_param text DEFAULT 'all'
)
RETURNS TABLE(
  id uuid, 
  start_time timestamp with time zone, 
  end_time timestamp with time zone, 
  cash_sales numeric, 
  card_sales numeric, 
  actual_amount numeric, 
  over_short numeric, 
  status text, 
  veresiye numeric, 
  bank_transfers numeric, 
  loyalty_card numeric, 
  shift_number text,
  bank_transfer_description text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.start_time,
    s.end_time,
    s.cash_sales,
    s.card_sales,
    s.actual_amount,
    s.over_short,
    s.status,
    s.veresiye,
    s.bank_transfers,
    s.loyalty_card,
    s.shift_number,
    s.bank_transfer_description
  FROM public.shifts s
  WHERE s.personnel_id = attendant_id_param
    AND s.station_id = station_id_param
    AND (date_start_param IS NULL OR s.start_time >= date_start_param)
    AND (date_end_param IS NULL OR s.start_time <= date_end_param)
    AND (shift_filter_param = 'all' OR s.shift_number = shift_filter_param)
  ORDER BY s.start_time DESC;
END;
$function$;