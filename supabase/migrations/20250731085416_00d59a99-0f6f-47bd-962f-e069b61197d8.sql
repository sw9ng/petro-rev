-- Tüm müşteri hesap tutarsızlıklarını düzelt
-- Customers tablosundaki debt_amount, receivable_amount, payable_amount alanlarını
-- customer_transactions tablosundaki gerçek verilerle senkronize et

UPDATE customers 
SET 
  debt_amount = COALESCE(
    (SELECT SUM(CASE WHEN ct.transaction_type = 'debt' THEN ct.amount ELSE 0 END) - 
            SUM(CASE WHEN ct.transaction_type = 'payment' THEN ct.amount ELSE 0 END)
     FROM customer_transactions ct 
     WHERE ct.customer_id = customers.id
     GROUP BY ct.customer_id), 0
  ),
  receivable_amount = 0, -- Bu alan artık kullanılmıyor, sıfırla
  payable_amount = 0,    -- Bu alan artık kullanılmıyor, sıfırla
  updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM customer_transactions ct 
  WHERE ct.customer_id = customers.id
) OR debt_amount != 0 OR receivable_amount != 0 OR payable_amount != 0;

-- Negatif bakiyeleri (fazla ödeme yapılan müşteriler) düzelt
-- Negatif bakiye varsa bu müşterinin sisteme fazla ödeme yaptığı anlamına gelir
UPDATE customers 
SET debt_amount = GREATEST(debt_amount, 0)
WHERE debt_amount < 0;