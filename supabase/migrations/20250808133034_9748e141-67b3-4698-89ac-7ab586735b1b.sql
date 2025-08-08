
-- Fix foreign key constraints to allow cascade delete for company accounts
-- First, drop existing constraints
ALTER TABLE income_invoices DROP CONSTRAINT IF EXISTS income_invoices_account_id_fkey;
ALTER TABLE expense_invoices DROP CONSTRAINT IF EXISTS expense_invoices_account_id_fkey;

-- Add new constraints with CASCADE delete
ALTER TABLE income_invoices 
ADD CONSTRAINT income_invoices_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES company_accounts(id) ON DELETE CASCADE;

ALTER TABLE expense_invoices 
ADD CONSTRAINT expense_invoices_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES company_accounts(id) ON DELETE CASCADE;
