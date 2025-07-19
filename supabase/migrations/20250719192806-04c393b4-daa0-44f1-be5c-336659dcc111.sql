-- Stok tablosunu tamamen temizle ve sıfırdan başlat
DELETE FROM public.fuel_stock;

-- Tüm triggeri geçici olarak devre dışı bırak ve manuel hesaplama yap
-- Sadece bugünden itibaren olan alımları stok olarak ekle
INSERT INTO public.fuel_stock (station_id, fuel_type, current_stock, created_at, updated_at)
SELECT 
  station_id,
  fuel_type,
  SUM(liters) as current_stock,
  now() as created_at,
  now() as updated_at
FROM public.fuel_purchases
WHERE purchase_date >= CURRENT_DATE
GROUP BY station_id, fuel_type
HAVING SUM(liters) > 0;

-- Sadece bugünden itibaren olan satışları düş
UPDATE public.fuel_stock 
SET current_stock = GREATEST(current_stock - COALESCE(sales.total_sold, 0), 0),
    updated_at = now()
FROM (
  SELECT 
    station_id,
    fuel_type,
    SUM(liters) as total_sold
  FROM public.fuel_sales
  WHERE sale_time >= CURRENT_DATE
  GROUP BY station_id, fuel_type
) sales
WHERE fuel_stock.station_id = sales.station_id 
  AND fuel_stock.fuel_type = sales.fuel_type;