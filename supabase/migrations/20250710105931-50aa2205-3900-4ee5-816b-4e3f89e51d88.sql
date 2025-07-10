-- Add RLS policies for customers and customer_transactions tables

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies for customers table
CREATE POLICY "Users can view their station customers" 
ON public.customers 
FOR SELECT 
USING (auth.uid() = station_id);

CREATE POLICY "Users can create their station customers" 
ON public.customers 
FOR INSERT 
WITH CHECK (auth.uid() = station_id);

CREATE POLICY "Users can update their station customers" 
ON public.customers 
FOR UPDATE 
USING (auth.uid() = station_id);

CREATE POLICY "Users can delete their station customers" 
ON public.customers 
FOR DELETE 
USING (auth.uid() = station_id);

-- Enable RLS on customer_transactions table
ALTER TABLE public.customer_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for customer_transactions table
CREATE POLICY "Users can view their station transactions" 
ON public.customer_transactions 
FOR SELECT 
USING (auth.uid() = station_id);

CREATE POLICY "Users can create their station transactions" 
ON public.customer_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = station_id);

CREATE POLICY "Users can update their station transactions" 
ON public.customer_transactions 
FOR UPDATE 
USING (auth.uid() = station_id);

CREATE POLICY "Users can delete their station transactions" 
ON public.customer_transactions 
FOR DELETE 
USING (auth.uid() = station_id);