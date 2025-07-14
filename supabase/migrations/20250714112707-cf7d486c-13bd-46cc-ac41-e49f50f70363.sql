
-- Create companies table for managing business entities
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create company accounts table for customers/suppliers
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

-- Create income invoices table (sales invoices)
CREATE TABLE public.income_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.company_accounts(id),
  invoice_number TEXT,
  e_invoice_number TEXT,
  e_invoice_uuid UUID,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  send_date TIMESTAMP WITH TIME ZONE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  tax_number TEXT,
  company_title TEXT,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  payment_date DATE,
  e_invoice_status TEXT DEFAULT 'draft',
  gib_status TEXT DEFAULT 'pending',
  uyumsoft_id TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expense invoices table (purchase invoices)
CREATE TABLE public.expense_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.company_accounts(id),
  invoice_number TEXT,
  e_invoice_number TEXT,
  e_invoice_uuid UUID,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  send_date TIMESTAMP WITH TIME ZONE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  tax_number TEXT,
  company_title TEXT,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  payment_date DATE,
  e_invoice_status TEXT DEFAULT 'draft',
  gib_status TEXT DEFAULT 'pending',
  uyumsoft_id TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users can view their own companies" ON public.companies
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own companies" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own companies" ON public.companies
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own companies" ON public.companies
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for company accounts
CREATE POLICY "Users can manage accounts for their companies" ON public.company_accounts
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = company_accounts.company_id 
    AND companies.owner_id = auth.uid()
  ));

-- RLS Policies for income invoices
CREATE POLICY "Users can view invoices of their companies" ON public.income_invoices
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = income_invoices.company_id 
    AND companies.owner_id = auth.uid()
  ));

CREATE POLICY "Users can create invoices for their companies" ON public.income_invoices
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = income_invoices.company_id 
    AND companies.owner_id = auth.uid()
  ));

CREATE POLICY "Users can update invoices of their companies" ON public.income_invoices
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = income_invoices.company_id 
    AND companies.owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete invoices of their companies" ON public.income_invoices
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = income_invoices.company_id 
    AND companies.owner_id = auth.uid()
  ));

-- RLS Policies for expense invoices
CREATE POLICY "Users can view expense invoices of their companies" ON public.expense_invoices
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = expense_invoices.company_id 
    AND companies.owner_id = auth.uid()
  ));

CREATE POLICY "Users can create expense invoices for their companies" ON public.expense_invoices
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = expense_invoices.company_id 
    AND companies.owner_id = auth.uid()
  ));

CREATE POLICY "Users can update expense invoices of their companies" ON public.expense_invoices
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = expense_invoices.company_id 
    AND companies.owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete expense invoices of their companies" ON public.expense_invoices
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = expense_invoices.company_id 
    AND companies.owner_id = auth.uid()
  ));

-- Add a trigger to check company limit (max 2 companies per user)
CREATE OR REPLACE FUNCTION public.check_company_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.companies WHERE owner_id = NEW.owner_id) >= 2 THEN
    RAISE EXCEPTION 'Maksimum 2 şirket oluşturabilirsiniz';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_company_limit_trigger
  BEFORE INSERT ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.check_company_limit();
