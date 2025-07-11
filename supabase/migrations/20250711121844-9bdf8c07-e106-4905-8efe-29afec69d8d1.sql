
-- Add e-invoice fields to income_invoices table
ALTER TABLE public.income_invoices ADD COLUMN IF NOT EXISTS e_invoice_uuid uuid;
ALTER TABLE public.income_invoices ADD COLUMN IF NOT EXISTS e_invoice_status text DEFAULT 'draft' CHECK (e_invoice_status IN ('draft', 'sent', 'accepted', 'rejected'));
ALTER TABLE public.income_invoices ADD COLUMN IF NOT EXISTS gib_status text DEFAULT 'pending' CHECK (gib_status IN ('pending', 'success', 'failed'));
ALTER TABLE public.income_invoices ADD COLUMN IF NOT EXISTS uyumsoft_id text;
ALTER TABLE public.income_invoices ADD COLUMN IF NOT EXISTS e_invoice_number text;
ALTER TABLE public.income_invoices ADD COLUMN IF NOT EXISTS send_date timestamp with time zone;
ALTER TABLE public.income_invoices ADD COLUMN IF NOT EXISTS tax_number text;
ALTER TABLE public.income_invoices ADD COLUMN IF NOT EXISTS company_title text;

-- Add e-invoice fields to expense_invoices table
ALTER TABLE public.expense_invoices ADD COLUMN IF NOT EXISTS e_invoice_uuid uuid;
ALTER TABLE public.expense_invoices ADD COLUMN IF NOT EXISTS e_invoice_status text DEFAULT 'draft' CHECK (e_invoice_status IN ('draft', 'sent', 'accepted', 'rejected'));
ALTER TABLE public.expense_invoices ADD COLUMN IF NOT EXISTS gib_status text DEFAULT 'pending' CHECK (gib_status IN ('pending', 'success', 'failed'));
ALTER TABLE public.expense_invoices ADD COLUMN IF NOT EXISTS uyumsoft_id text;
ALTER TABLE public.expense_invoices ADD COLUMN IF NOT EXISTS e_invoice_number text;
ALTER TABLE public.expense_invoices ADD COLUMN IF NOT EXISTS send_date timestamp with time zone;
ALTER TABLE public.expense_invoices ADD COLUMN IF NOT EXISTS tax_number text;
ALTER TABLE public.expense_invoices ADD COLUMN IF NOT EXISTS company_title text;
