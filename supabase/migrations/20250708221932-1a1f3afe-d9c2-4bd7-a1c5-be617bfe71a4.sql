-- Update fuel_type check constraint to include TRANSFER(KÖY-TANKERİ)
ALTER TABLE fuel_sales DROP CONSTRAINT fuel_sales_fuel_type_check;

ALTER TABLE fuel_sales ADD CONSTRAINT fuel_sales_fuel_type_check 
CHECK (fuel_type = ANY (ARRAY['MOTORİN'::text, 'LPG'::text, 'BENZİN'::text, 'MOTORİN(DİĞER)'::text, 'TRANSFER(KÖY-TANKERİ)'::text]));