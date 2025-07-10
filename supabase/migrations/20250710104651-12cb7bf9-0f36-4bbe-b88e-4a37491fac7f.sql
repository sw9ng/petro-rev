
-- Remove TRANSFER(KÖY-TANKERİ) from fuel_type check constraint
ALTER TABLE fuel_sales DROP CONSTRAINT fuel_sales_fuel_type_check;

ALTER TABLE fuel_sales ADD CONSTRAINT fuel_sales_fuel_type_check 
CHECK (fuel_type = ANY (ARRAY['MOTORİN'::text, 'LPG'::text, 'BENZİN'::text, 'MOTORİN(DİĞER)'::text]));
