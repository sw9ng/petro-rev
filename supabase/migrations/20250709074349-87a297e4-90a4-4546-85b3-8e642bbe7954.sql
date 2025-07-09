
-- Update payment_method check constraint to allow more flexible payment methods
ALTER TABLE customer_transactions DROP CONSTRAINT IF EXISTS customer_transactions_payment_method_check;

ALTER TABLE customer_transactions ADD CONSTRAINT customer_transactions_payment_method_check 
CHECK (payment_method IS NULL OR payment_method IN ('nakit', 'kredi_karti', 'havale', 'Nakit', 'Kredi Kartı', 'Havale', 'EFT', 'POS') OR length(payment_method) > 0);
