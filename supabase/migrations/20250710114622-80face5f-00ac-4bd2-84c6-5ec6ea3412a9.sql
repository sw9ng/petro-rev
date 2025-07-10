-- Drop the existing function first
DROP FUNCTION IF EXISTS public.authenticate_pump_attendant(text, text);

-- Recreate with better parameter names to avoid ambiguity
CREATE OR REPLACE FUNCTION public.authenticate_pump_attendant(attendant_email_param text, password_param text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  attendant_record record;
BEGIN
  -- Find attendant by email
  SELECT p.id, p.name, p.station_id, p.attendant_password_hash
  INTO attendant_record
  FROM public.personnel p
  WHERE p.attendant_email = attendant_email_param
  AND p.status = 'active'
  AND p.role = 'pompacı';

  -- Check if attendant exists and password matches
  IF attendant_record.id IS NOT NULL AND 
     crypt(password_param, attendant_record.attendant_password_hash) = attendant_record.attendant_password_hash THEN
    
    RETURN json_build_object(
      'success', true,
      'attendant', json_build_object(
        'id', attendant_record.id,
        'name', attendant_record.name,
        'station_id', attendant_record.station_id,
        'email', attendant_email_param
      )
    );
  ELSE
    RETURN json_build_object('success', false, 'error', 'Invalid credentials');
  END IF;
END;
$$;