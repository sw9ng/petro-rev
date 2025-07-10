-- Create a function to get shifts for pump attendants using their ID
CREATE OR REPLACE FUNCTION public.get_attendant_shifts(
  attendant_id_param uuid,
  station_id_param uuid,
  date_start_param timestamp with time zone DEFAULT NULL,
  date_end_param timestamp with time zone DEFAULT NULL,
  shift_filter_param text DEFAULT 'all'
) RETURNS TABLE (
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
  shift_number text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    s.shift_number
  FROM public.shifts s
  WHERE s.personnel_id = attendant_id_param
    AND s.station_id = station_id_param
    AND (date_start_param IS NULL OR s.start_time >= date_start_param)
    AND (date_end_param IS NULL OR s.start_time <= date_end_param)
    AND (shift_filter_param = 'all' OR s.shift_number = shift_filter_param)
  ORDER BY s.start_time DESC;
END;
$$;