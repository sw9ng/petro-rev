
-- Create the company_accounts table
CREATE TABLE public.company_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security to company_accounts
ALTER TABLE public.company_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy for company_accounts
CREATE POLICY "Users can manage accounts for their companies" 
  ON public.company_accounts 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = company_accounts.company_id 
    AND companies.owner_id = auth.uid()
  ));

-- Add missing payment_status and payment_date columns to income_invoices
ALTER TABLE public.income_invoices 
ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
ADD COLUMN payment_date DATE,
ADD COLUMN account_id UUID REFERENCES public.company_accounts(id);

-- Add missing payment_status and payment_date columns to expense_invoices  
ALTER TABLE public.expense_invoices 
ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
ADD COLUMN payment_date DATE,
ADD COLUMN account_id UUID REFERENCES public.company_accounts(id);
