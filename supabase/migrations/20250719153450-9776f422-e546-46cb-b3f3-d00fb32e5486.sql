
-- Önce mevcut trigger'ları kontrol edelim ve yeniden oluşturalım
-- Yakıt satışı sonrası stok azaltma trigger'ını güncelle
DROP TRIGGER IF EXISTS trigger_update_fuel_stock_after_sale ON public.fuel_sales;

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

-- Yakıt alımı sonrası stok artırma trigger'ını güncelle
DROP TRIGGER IF EXISTS trigger_update_fuel_stock_after_purchase ON public.fuel_purchases;

CREATE OR REPLACE FUNCTION update_fuel_stock_after_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Stok kaydı yoksa alınan miktar ile oluştur
  INSERT INTO public.fuel_stock (station_id, fuel_type, current_stock)
  VALUES (NEW.station_id, NEW.fuel_type, NEW.liters)
  ON CONFLICT (station_id, fuel_type) 
  DO UPDATE SET 
    current_stock = fuel_stock.current_stock + NEW.liters,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Yakıt satışı silme sonrası stok geri yükleme trigger'ını güncelle
DROP TRIGGER IF EXISTS trigger_restore_fuel_stock_after_sale_delete ON public.fuel_sales;

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

-- Yakıt alımı silme sonrası stok azaltma trigger'ını güncelle
DROP TRIGGER IF EXISTS trigger_reduce_fuel_stock_after_purchase_delete ON public.fuel_purchases;

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

-- Trigger'ları yeniden oluştur
CREATE TRIGGER trigger_update_fuel_stock_after_sale
  AFTER INSERT ON public.fuel_sales
  FOR EACH ROW EXECUTE FUNCTION update_fuel_stock_after_sale();

CREATE TRIGGER trigger_update_fuel_stock_after_purchase
  AFTER INSERT ON public.fuel_purchases
  FOR EACH ROW EXECUTE FUNCTION update_fuel_stock_after_purchase();

CREATE TRIGGER trigger_restore_fuel_stock_after_sale_delete
  AFTER DELETE ON public.fuel_sales
  FOR EACH ROW EXECUTE FUNCTION restore_fuel_stock_after_sale_delete();

CREATE TRIGGER trigger_reduce_fuel_stock_after_purchase_delete
  AFTER DELETE ON public.fuel_purchases
  FOR EACH ROW EXECUTE FUNCTION reduce_fuel_stock_after_purchase_delete();

-- Stokları sıfırla ve yeniden hesapla (mevcut verilere göre)
TRUNCATE TABLE public.fuel_stock;

-- Önce alımlardan stok oluştur
INSERT INTO public.fuel_stock (station_id, fuel_type, current_stock, created_at, updated_at)
SELECT 
  station_id,
  fuel_type,
  COALESCE(SUM(liters), 0) as current_stock,
  now() as created_at,
  now() as updated_at
FROM public.fuel_purchases
GROUP BY station_id, fuel_type
ON CONFLICT (station_id, fuel_type) DO UPDATE SET
  current_stock = EXCLUDED.current_stock,
  updated_at = now();

-- Sonra satışları çıkar
UPDATE public.fuel_stock 
SET current_stock = current_stock - COALESCE(sales.total_sold, 0),
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

-- Negatif stokları 0'a ayarla
UPDATE public.fuel_stock 
SET current_stock = GREATEST(current_stock, 0),
    updated_at = now()
WHERE current_stock < 0;
