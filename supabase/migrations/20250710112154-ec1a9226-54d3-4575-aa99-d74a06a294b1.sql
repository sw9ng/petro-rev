
-- Add email and password fields to personnel table for pump attendant login
ALTER TABLE public.personnel 
ADD COLUMN attendant_email text,
ADD COLUMN attendant_password_hash text;

-- Create unique constraint on attendant_email where it's not null
CREATE UNIQUE INDEX personnel_attendant_email_unique 
ON public.personnel (attendant_email) 
WHERE attendant_email IS NOT NULL;

-- Add RLS policy for pump attendants to access their own data
CREATE POLICY "Pump attendants can view their own shifts" 
ON public.shifts 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.personnel 
    WHERE personnel.id = shifts.personnel_id 
    AND personnel.attendant_email = auth.jwt() ->> 'email'
  )
);

-- Create a function to authenticate pump attendants
CREATE OR REPLACE FUNCTION public.authenticate_pump_attendant(
  email text,
  password text
) RETURNS json
LANGUAGE plpgsql
SECURITY definer
AS $$
DECLARE
  attendant_record record;
BEGIN
  -- Find attendant by email
  SELECT p.id, p.name, p.station_id, p.attendant_password_hash
  INTO attendant_record
  FROM public.personnel p
  WHERE p.attendant_email = email
  AND p.status = 'active'
  AND p.role = 'pompacı';

  -- Check if attendant exists and password matches
  IF attendant_record.id IS NOT NULL AND 
     crypt(password, attendant_record.attendant_password_hash) = attendant_record.attendant_password_hash THEN
    
    RETURN json_build_object(
      'success', true,
      'attendant', json_build_object(
        'id', attendant_record.id,
        'name', attendant_record.name,
        'station_id', attendant_record.station_id,
        'email', email
      )
    );
  ELSE
    RETURN json_build_object('success', false, 'error', 'Invalid credentials');
  END IF;
END;
$$;

-- Create a function to hash passwords for pump attendants
CREATE OR REPLACE FUNCTION public.hash_attendant_password(password text)
RETURNS text
LANGUAGE sql
AS $$
  SELECT crypt(password, gen_salt('bf'));
$$;
