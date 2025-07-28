-- Add customer type and home customer specific fields to customers table
ALTER TABLE customers 
ADD COLUMN customer_type text DEFAULT 'müşteri' CHECK (customer_type IN ('çalışan', 'şirket', 'müşteri', 'ev müşterisi')),
ADD COLUMN debt_amount numeric DEFAULT 0,
ADD COLUMN payable_amount numeric DEFAULT 0,
ADD COLUMN receivable_amount numeric DEFAULT 0;