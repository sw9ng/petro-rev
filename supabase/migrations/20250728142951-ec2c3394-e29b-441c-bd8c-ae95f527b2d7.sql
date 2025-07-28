-- Add home collection amount field to income invoices
ALTER TABLE public.income_invoices 
ADD COLUMN home_collection_amount numeric DEFAULT 0;