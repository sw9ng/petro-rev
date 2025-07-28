-- Add customer type and home customer specific fields to company_accounts table
ALTER TABLE company_accounts 
ADD COLUMN customer_type text DEFAULT 'müşteri' CHECK (customer_type IN ('çalışan', 'şirket', 'müşteri', 'ev müşterisi')),
ADD COLUMN debt_amount numeric DEFAULT 0,
ADD COLUMN payable_amount numeric DEFAULT 0,
ADD COLUMN receivable_amount numeric DEFAULT 0;