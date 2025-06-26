
-- Add bank_transfers column to shifts table if it doesn't exist
ALTER TABLE public.shifts 
ADD COLUMN IF NOT EXISTS bank_transfers DECIMAL(10,2) DEFAULT 0;

-- Create fuel_sales table
CREATE TABLE public.fuel_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID NOT NULL,
  personnel_id UUID NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('MOTORİN', 'LPG', 'BENZİN', 'MOTORİN(DİĞER)')),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_per_liter DECIMAL(10,3) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  liters DECIMAL(10,3) NOT NULL DEFAULT 0,
  sale_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  shift_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security for fuel_sales
ALTER TABLE public.fuel_sales ENABLE ROW LEVEL SECURITY;

-- Create policies for fuel_sales
CREATE POLICY "Users can view their station's fuel sales" 
  ON public.fuel_sales 
  FOR SELECT 
  USING (station_id = auth.uid());

CREATE POLICY "Users can create fuel sales for their station" 
  ON public.fuel_sales 
  FOR INSERT 
  WITH CHECK (station_id = auth.uid());

CREATE POLICY "Users can update their station's fuel sales" 
  ON public.fuel_sales 
  FOR UPDATE 
  USING (station_id = auth.uid());

CREATE POLICY "Users can delete their station's fuel sales" 
  ON public.fuel_sales 
  FOR DELETE 
  USING (station_id = auth.uid());
