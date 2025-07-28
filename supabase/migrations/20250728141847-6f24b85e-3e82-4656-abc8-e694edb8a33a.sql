-- Remove unnecessary columns from company_accounts table and keep only receivable_amount
ALTER TABLE company_accounts 
DROP COLUMN IF EXISTS debt_amount,
DROP COLUMN IF EXISTS payable_amount;