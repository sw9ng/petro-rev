
-- Şirketler tablosu oluştur
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Şirket cari hesapları tablosu
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

-- Gelir faturaları tablosu
CREATE TABLE public.income_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.company_accounts(id),
  invoice_number TEXT,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
  payment_date DATE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gider faturaları tablosu
CREATE TABLE public.expense_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.company_accounts(id),
  invoice_number TEXT,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
  payment_date DATE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS politikalarını etkinleştir
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_invoices ENABLE ROW LEVEL SECURITY;

-- Şirketler için RLS politikaları
CREATE POLICY "Users can view their own companies" 
  ON public.companies 
  FOR SELECT 
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own companies" 
  ON public.companies 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own companies" 
  ON public.companies 
  FOR UPDATE 
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own companies" 
  ON public.companies 
  FOR DELETE 
  USING (auth.uid() = owner_id);

-- Şirket cari hesapları için RLS politikaları
CREATE POLICY "Users can manage accounts of their companies" 
  ON public.company_accounts 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = company_accounts.company_id 
    AND companies.owner_id = auth.uid()
  ));

-- Gelir faturaları için RLS politikaları
CREATE POLICY "Users can manage invoices of their companies" 
  ON public.income_invoices 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = income_invoices.company_id 
    AND companies.owner_id = auth.uid()
  ));

-- Gider faturaları için RLS politikaları
CREATE POLICY "Users can manage expense invoices of their companies" 
  ON public.expense_invoices 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = expense_invoices.company_id 
    AND companies.owner_id = auth.uid()
  ));

-- Şirket limiti kontrol fonksiyonu
CREATE OR REPLACE FUNCTION check_company_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.companies WHERE owner_id = NEW.owner_id) >= 2 THEN
    RAISE EXCEPTION 'Maksimum 2 şirket oluşturabilirsiniz';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Şirket limiti için trigger
CREATE TRIGGER company_limit_trigger
  BEFORE INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION check_company_limit();
