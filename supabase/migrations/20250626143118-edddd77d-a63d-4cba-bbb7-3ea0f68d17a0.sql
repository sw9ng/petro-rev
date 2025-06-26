
-- Enable Row Level Security on shift_bank_details table
ALTER TABLE public.shift_bank_details ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view shift bank details for shifts they have access to
-- This assumes users can only see bank details for shifts in their station
CREATE POLICY "Users can view shift bank details for their station shifts" 
  ON public.shift_bank_details 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.shifts s 
      WHERE s.id = shift_bank_details.shift_id 
      AND s.station_id = (
        SELECT station_id FROM public.personnel 
        WHERE id = auth.uid()
      )
    )
  );

-- Create policy to allow users to insert shift bank details for shifts they create
CREATE POLICY "Users can create shift bank details for their station shifts" 
  ON public.shift_bank_details 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shifts s 
      WHERE s.id = shift_bank_details.shift_id 
      AND s.station_id = (
        SELECT station_id FROM public.personnel 
        WHERE id = auth.uid()
      )
    )
  );

-- Create policy to allow users to update shift bank details for their station shifts
CREATE POLICY "Users can update shift bank details for their station shifts" 
  ON public.shift_bank_details 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.shifts s 
      WHERE s.id = shift_bank_details.shift_id 
      AND s.station_id = (
        SELECT station_id FROM public.personnel 
        WHERE id = auth.uid()
      )
    )
  );

-- Create policy to allow users to delete shift bank details for their station shifts
CREATE POLICY "Users can delete shift bank details for their station shifts" 
  ON public.shift_bank_details 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.shifts s 
      WHERE s.id = shift_bank_details.shift_id 
      AND s.station_id = (
        SELECT station_id FROM public.personnel 
        WHERE id = auth.uid()
      )
    )
  );
