
-- Update the status check constraint to ensure 'completed' is allowed
ALTER TABLE public.customer_transactions 
DROP CONSTRAINT customer_transactions_status_check;

ALTER TABLE public.customer_transactions 
ADD CONSTRAINT customer_transactions_status_check 
CHECK (status IN ('pending', 'collected', 'completed'));
