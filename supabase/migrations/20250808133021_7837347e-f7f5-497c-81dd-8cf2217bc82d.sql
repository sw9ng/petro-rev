-- Fix foreign key constraints to allow cascading deletes for company accounts

-- Drop existing foreign key constraints
ALTER TABLE income_invoices 
DROP CONSTRAINT IF EXISTS income_invoices_account_id_fkey;

ALTER TABLE expense_invoices 
DROP CONSTRAINT IF EXISTS expense_invoices_account_id_fkey;

-- Add new foreign key constraints with CASCADE DELETE
ALTER TABLE income_invoices 
ADD CONSTRAINT income_invoices_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES company_accounts(id) ON DELETE CASCADE;

ALTER TABLE expense_invoices 
ADD CONSTRAINT expense_invoices_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES company_accounts(id) ON DELETE CASCADE;