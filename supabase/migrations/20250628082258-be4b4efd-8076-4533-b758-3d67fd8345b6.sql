
-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  notes TEXT,
  station_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_transactions table for veresiye tracking
CREATE TABLE public.customer_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
  personnel_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('veresiye', 'payment', 'debt')),
  amount NUMERIC NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('nakit', 'kredi_karti', 'havale')),
  description TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'collected', 'completed')),
  station_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add customer_id to shifts table for veresiye tracking
ALTER TABLE public.shifts 
ADD COLUMN customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_customers_station_id ON public.customers(station_id);
CREATE INDEX idx_customer_transactions_customer_id ON public.customer_transactions(customer_id);
CREATE INDEX idx_customer_transactions_station_id ON public.customer_transactions(station_id);
CREATE INDEX idx_customer_transactions_date ON public.customer_transactions(transaction_date);
