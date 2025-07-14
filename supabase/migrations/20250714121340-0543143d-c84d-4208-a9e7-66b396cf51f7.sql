
-- VKN verileri için tablo
CREATE TABLE public.tax_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tax_number TEXT NOT NULL UNIQUE,
  company_title TEXT NOT NULL,
  address TEXT,
  city TEXT,
  district TEXT,
  tax_office TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- E-fatura kayıtları için tablo
CREATE TABLE public.e_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_uuid UUID NOT NULL,
  invoice_number TEXT NOT NULL,
  invoice_type TEXT NOT NULL CHECK (invoice_type IN ('satis', 'iade', 'istisna')),  
  invoice_date DATE NOT NULL,
  ettn TEXT NOT NULL,
  recipient_tax_number TEXT,
  recipient_title TEXT,
  recipient_address TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'TRY',
  exchange_rate NUMERIC DEFAULT 1,
  gib_status TEXT NOT NULL DEFAULT 'draft' CHECK (gib_status IN ('draft', 'sent', 'accepted', 'rejected', 'cancelled')),
  gib_response TEXT,
  xml_content TEXT,
  pdf_path TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- E-arşiv faturalar için tablo  
CREATE TABLE public.e_archive_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  archive_id TEXT NOT NULL UNIQUE,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_tax_number TEXT,
  customer_tc_number TEXT,
  customer_address TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'TRY',
  gib_status TEXT NOT NULL DEFAULT 'draft' CHECK (gib_status IN ('draft', 'sent', 'accepted', 'rejected')),
  gib_response TEXT,
  xml_content TEXT,
  pdf_path TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Uyumsoft hesap bilgileri için tablo
CREATE TABLE public.uyumsoft_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  password_encrypted TEXT NOT NULL,
  company_code TEXT NOT NULL,
  api_key_encrypted TEXT,
  test_mode BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- Muhasebe hesap planı için tablo
CREATE TABLE public.chart_of_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_code TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_account_id UUID REFERENCES public.chart_of_accounts(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, account_code)
);

-- Muhasebe kayıtları için tablo
CREATE TABLE public.accounting_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  entry_number TEXT NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_type TEXT CHECK (reference_type IN ('invoice', 'payment', 'adjustment', 'opening')),
  reference_id UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, entry_number)
);

-- Muhasebe kayıt detayları için tablo
CREATE TABLE public.accounting_entry_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES public.accounting_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  debit_amount NUMERIC NOT NULL DEFAULT 0,
  credit_amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS politikaları
ALTER TABLE public.tax_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.e_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.e_archive_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uyumsoft_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_entry_lines ENABLE ROW LEVEL SECURITY;

-- Tax registry - herkes okuyabilir (VKN sorgulama için)
CREATE POLICY "Everyone can read tax registry" ON public.tax_registry FOR SELECT USING (true);

-- E-invoices policies
CREATE POLICY "Users can manage e-invoices for their companies" ON public.e_invoices FOR ALL 
USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = e_invoices.company_id AND companies.owner_id = auth.uid()));

-- E-archive invoices policies  
CREATE POLICY "Users can manage e-archive invoices for their companies" ON public.e_archive_invoices FOR ALL
USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = e_archive_invoices.company_id AND companies.owner_id = auth.uid()));

-- Uyumsoft accounts policies
CREATE POLICY "Users can manage uyumsoft accounts for their companies" ON public.uyumsoft_accounts FOR ALL
USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = uyumsoft_accounts.company_id AND companies.owner_id = auth.uid()));

-- Chart of accounts policies
CREATE POLICY "Users can manage chart of accounts for their companies" ON public.chart_of_accounts FOR ALL
USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = chart_of_accounts.company_id AND companies.owner_id = auth.uid()));

-- Accounting entries policies
CREATE POLICY "Users can manage accounting entries for their companies" ON public.accounting_entries FOR ALL
USING (EXISTS (SELECT 1 FROM companies WHERE companies.id = accounting_entries.company_id AND companies.owner_id = auth.uid()));

-- Accounting entry lines policies
CREATE POLICY "Users can manage accounting entry lines for their companies" ON public.accounting_entry_lines FOR ALL
USING (EXISTS (
  SELECT 1 FROM accounting_entries ae
  JOIN companies c ON c.id = ae.company_id
  WHERE ae.id = accounting_entry_lines.entry_id AND c.owner_id = auth.uid()
));

-- İndeksler
CREATE INDEX idx_tax_registry_tax_number ON public.tax_registry(tax_number);
CREATE INDEX idx_e_invoices_company_id ON public.e_invoices(company_id);
CREATE INDEX idx_e_invoices_invoice_date ON public.e_invoices(invoice_date);
CREATE INDEX idx_e_archive_invoices_company_id ON public.e_archive_invoices(company_id);
CREATE INDEX idx_e_archive_invoices_invoice_date ON public.e_archive_invoices(invoice_date);
CREATE INDEX idx_chart_of_accounts_company_id ON public.chart_of_accounts(company_id);
CREATE INDEX idx_accounting_entries_company_id ON public.accounting_entries(company_id);
CREATE INDEX idx_accounting_entries_entry_date ON public.accounting_entries(entry_date);
