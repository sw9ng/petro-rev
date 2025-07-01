
-- Update the check constraint to allow 'debt' as a valid transaction type
ALTER TABLE public.customer_transactions 
DROP CONSTRAINT customer_transactions_transaction_type_check;

ALTER TABLE public.customer_transactions 
ADD CONSTRAINT customer_transactions_transaction_type_check 
CHECK (transaction_type IN ('veresiye', 'payment', 'debt'));
