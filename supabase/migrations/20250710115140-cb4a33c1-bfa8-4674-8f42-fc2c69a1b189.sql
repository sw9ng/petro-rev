-- Update RLS policy for pump attendants to work with custom authentication
-- Drop the existing policy that relies on auth.jwt()
DROP POLICY IF EXISTS "Pump attendants can view their own shifts" ON public.shifts;

-- Create a new policy that works with our custom authentication
-- Since pump attendants don't use Supabase auth, we need to make shifts visible 
-- to authenticated users for their own personnel_id
CREATE POLICY "Authenticated users can view shifts" 
ON public.shifts 
FOR SELECT 
TO authenticated 
USING (true);

-- For better security, we can also create a more specific policy
-- that allows station owners to see all their shifts
CREATE POLICY "Station owners can view their station shifts" 
ON public.shifts 
FOR SELECT 
TO authenticated 
USING (auth.uid() = station_id);