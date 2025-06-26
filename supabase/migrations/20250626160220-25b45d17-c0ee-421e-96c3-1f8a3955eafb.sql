
-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view shift bank details for their station shifts" ON public.shift_bank_details;
DROP POLICY IF EXISTS "Users can create shift bank details for their station shifts" ON public.shift_bank_details;
DROP POLICY IF EXISTS "Users can update shift bank details for their station shifts" ON public.shift_bank_details;
DROP POLICY IF EXISTS "Users can delete shift bank details for their station shifts" ON public.shift_bank_details;

-- Create new policies that work with the current auth setup
-- Allow users to view shift bank details for shifts in their station
CREATE POLICY "Users can view shift bank details for their station shifts" 
  ON public.shift_bank_details 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.shifts s 
      WHERE s.id = shift_bank_details.shift_id 
      AND s.station_id = auth.uid()
    )
  );

-- Allow users to create shift bank details for shifts in their station
CREATE POLICY "Users can create shift bank details for their station shifts" 
  ON public.shift_bank_details 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shifts s 
      WHERE s.id = shift_bank_details.shift_id 
      AND s.station_id = auth.uid()
    )
  );

-- Allow users to update shift bank details for shifts in their station
CREATE POLICY "Users can update shift bank details for their station shifts" 
  ON public.shift_bank_details 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.shifts s 
      WHERE s.id = shift_bank_details.shift_id 
      AND s.station_id = auth.uid()
    )
  );

-- Allow users to delete shift bank details for shifts in their station
CREATE POLICY "Users can delete shift bank details for their station shifts" 
  ON public.shift_bank_details 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.shifts s 
      WHERE s.id = shift_bank_details.shift_id 
      AND s.station_id = auth.uid()
    )
  );
