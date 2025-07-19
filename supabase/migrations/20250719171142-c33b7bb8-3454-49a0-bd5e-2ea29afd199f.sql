
-- Önce mevcut trigger'ları temizle
DROP TRIGGER IF EXISTS trigger_update_fuel_stock_after_purchase ON public.fuel_purchases;
DROP TRIGGER IF EXISTS trigger_reduce_fuel_stock_after_purchase_delete ON public.fuel_purchases;
DROP TRIGGER IF EXISTS trigger_update_fuel_stock_after_sale ON public.fuel_sales;
DROP TRIGGER IF EXISTS trigger_restore_fuel_stock_after_sale_delete ON public.fuel_sales;

-- Fonksiyonları yeniden oluştur
CREATE OR REPLACE FUNCTION update_fuel_stock_after_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Debug log
  RAISE NOTICE 'Trigger called for purchase: station_id=%, fuel_type=%, liters=%', NEW.station_id, NEW.fuel_type, NEW.liters;
  
  -- Stok kaydı yoksa alınan miktar ile oluştur
  INSERT INTO public.fuel_stock (station_id, fuel_type, current_stock)
  VALUES (NEW.station_id, NEW.fuel_type, NEW.liters)
  ON CONFLICT (station_id, fuel_type) 
  DO UPDATE SET 
    current_stock = fuel_stock.current_stock + NEW.liters,
    updated_at = now();
  
  RAISE NOTICE 'Stock updated for station=%, fuel=%, added=%', NEW.station_id, NEW.fuel_type, NEW.liters;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reduce_fuel_stock_after_purchase_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.fuel_stock 
  SET current_stock = GREATEST(current_stock - OLD.liters, 0),
      updated_at = now()
  WHERE station_id = OLD.station_id AND fuel_type = OLD.fuel_type;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_fuel_stock_after_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Stok kaydı yoksa 0 ile oluştur
  INSERT INTO public.fuel_stock (station_id, fuel_type, current_stock)
  VALUES (NEW.station_id, NEW.fuel_type, 0)
  ON CONFLICT (station_id, fuel_type) DO NOTHING;
  
  -- Stoku azalt
  UPDATE public.fuel_stock 
  SET current_stock = GREATEST(current_stock - NEW.liters, 0),
      updated_at = now()
  WHERE station_id = NEW.station_id AND fuel_type = NEW.fuel_type;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_fuel_stock_after_sale_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Stok kaydı yoksa silinen miktar ile oluştur
  INSERT INTO public.fuel_stock (station_id, fuel_type, current_stock)
  VALUES (OLD.station_id, OLD.fuel_type, OLD.liters)
  ON CONFLICT (station_id, fuel_type) 
  DO UPDATE SET 
    current_stock = fuel_stock.current_stock + OLD.liters,
    updated_at = now();
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ları yeniden oluştur
CREATE TRIGGER trigger_update_fuel_stock_after_purchase
  AFTER INSERT ON public.fuel_purchases
  FOR EACH ROW EXECUTE FUNCTION update_fuel_stock_after_purchase();

CREATE TRIGGER trigger_reduce_fuel_stock_after_purchase_delete
  AFTER DELETE ON public.fuel_purchases
  FOR EACH ROW EXECUTE FUNCTION reduce_fuel_stock_after_purchase_delete();

CREATE TRIGGER trigger_update_fuel_stock_after_sale
  AFTER INSERT ON public.fuel_sales
  FOR EACH ROW EXECUTE FUNCTION update_fuel_stock_after_sale();

CREATE TRIGGER trigger_restore_fuel_stock_after_sale_delete
  AFTER DELETE ON public.fuel_sales
  FOR EACH ROW EXECUTE FUNCTION restore_fuel_stock_after_sale_delete();

-- Stok tablosunu temizle ve yeniden başlat
DELETE FROM public.fuel_stock;

-- Sadece mevcut alımları temel alarak stok oluştur
INSERT INTO public.fuel_stock (station_id, fuel_type, current_stock, created_at, updated_at)
SELECT 
  station_id,
  fuel_type,
  SUM(liters) as current_stock,
  now() as created_at,
  now() as updated_at
FROM public.fuel_purchases
GROUP BY station_id, fuel_type;

-- Satışları çıkar
UPDATE public.fuel_stock 
SET current_stock = GREATEST(current_stock - COALESCE(sales.total_sold, 0), 0),
    updated_at = now()
FROM (
  SELECT 
    station_id,
    fuel_type,
    SUM(liters) as total_sold
  FROM public.fuel_sales
  GROUP BY station_id, fuel_type
) sales
WHERE fuel_stock.station_id = sales.station_id 
  AND fuel_stock.fuel_type = sales.fuel_type;
