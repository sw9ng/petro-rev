-- Create table for fuel profit calculations
CREATE TABLE public.fuel_profit_calculations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id uuid NOT NULL,
  date_range_start date NOT NULL,
  date_range_end date NOT NULL,
  fuel_data jsonb NOT NULL,
  purchase_prices jsonb NOT NULL,
  total_profit numeric NOT NULL DEFAULT 0,
  total_revenue numeric NOT NULL DEFAULT 0,
  profit_margin numeric NOT NULL DEFAULT 0,
  calculation_details jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for commission rates
CREATE TABLE public.commission_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id uuid NOT NULL,
  bank_name text NOT NULL,
  commission_rate numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(station_id, bank_name)
);

-- Create table for current purchase prices
CREATE TABLE public.fuel_purchase_prices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id uuid NOT NULL,
  fuel_type text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(station_id, fuel_type)
);

-- Enable RLS
ALTER TABLE public.fuel_profit_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_purchase_prices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for fuel_profit_calculations
CREATE POLICY "Users can manage their station fuel profit calculations" 
ON public.fuel_profit_calculations 
FOR ALL 
USING (station_id = auth.uid());

-- Create RLS policies for commission_rates
CREATE POLICY "Users can manage their station commission rates" 
ON public.commission_rates 
FOR ALL 
USING (station_id = auth.uid());

-- Create RLS policies for fuel_purchase_prices
CREATE POLICY "Users can manage their station fuel purchase prices" 
ON public.fuel_purchase_prices 
FOR ALL 
USING (station_id = auth.uid());