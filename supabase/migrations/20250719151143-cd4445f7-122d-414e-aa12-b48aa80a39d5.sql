
-- Yakıt alımları tablosu (zaten var ama kontrol edelim)
CREATE TABLE IF NOT EXISTS public.fuel_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID NOT NULL,
  fuel_type TEXT NOT NULL,
  liters NUMERIC NOT NULL,
  purchase_price_per_liter NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  supplier TEXT,
  invoice_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Yakıt stok tablosu (zaten var ama kontrol edelim)
CREATE TABLE IF NOT EXISTS public.fuel_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID NOT NULL,
  fuel_type TEXT NOT NULL,
  current_stock NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(station_id, fuel_type)
);

-- RLS politikaları
ALTER TABLE public.fuel_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_stock ENABLE ROW LEVEL SECURITY;

-- Fuel purchases policies
DROP POLICY IF EXISTS "Users can manage their station fuel purchases" ON public.fuel_purchases;
CREATE POLICY "Users can manage their station fuel purchases" ON public.fuel_purchases
  FOR ALL USING (station_id = auth.uid());

-- Fuel stock policies  
DROP POLICY IF EXISTS "Users can manage their station fuel stock" ON public.fuel_stock;
CREATE POLICY "Users can manage their station fuel stock" ON public.fuel_stock
  FOR ALL USING (station_id = auth.uid());

-- Yakıt satışı sonrası stok azaltma trigger
CREATE OR REPLACE FUNCTION update_fuel_stock_after_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Stok kaydı yoksa oluştur
  INSERT INTO public.fuel_stock (station_id, fuel_type, current_stock)
  VALUES (NEW.station_id, NEW.fuel_type, 0)
  ON CONFLICT (station_id, fuel_type) DO NOTHING;
  
  -- Stoku azalt
  UPDATE public.fuel_stock 
  SET current_stock = current_stock - NEW.liters,
      updated_at = now()
  WHERE station_id = NEW.station_id AND fuel_type = NEW.fuel_type;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Yakıt alımı sonrası stok artırma trigger
CREATE OR REPLACE FUNCTION update_fuel_stock_after_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Stok kaydı yoksa oluştur
  INSERT INTO public.fuel_stock (station_id, fuel_type, current_stock)
  VALUES (NEW.station_id, NEW.fuel_type, NEW.liters)
  ON CONFLICT (station_id, fuel_type) 
  DO UPDATE SET 
    current_stock = fuel_stock.current_stock + NEW.liters,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Yakıt satışı silme sonrası stok geri yükleme trigger
CREATE OR REPLACE FUNCTION restore_fuel_stock_after_sale_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Stok kaydı yoksa oluştur
  INSERT INTO public.fuel_stock (station_id, fuel_type, current_stock)
  VALUES (OLD.station_id, OLD.fuel_type, OLD.liters)
  ON CONFLICT (station_id, fuel_type) 
  DO UPDATE SET 
    current_stock = fuel_stock.current_stock + OLD.liters,
    updated_at = now();
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Yakıt alımı silme sonrası stok azaltma trigger
CREATE OR REPLACE FUNCTION reduce_fuel_stock_after_purchase_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.fuel_stock 
  SET current_stock = current_stock - OLD.liters,
      updated_at = now()
  WHERE station_id = OLD.station_id AND fuel_type = OLD.fuel_type;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ları oluştur
DROP TRIGGER IF EXISTS trigger_update_fuel_stock_after_sale ON public.fuel_sales;
CREATE TRIGGER trigger_update_fuel_stock_after_sale
  AFTER INSERT ON public.fuel_sales
  FOR EACH ROW EXECUTE FUNCTION update_fuel_stock_after_sale();

DROP TRIGGER IF EXISTS trigger_update_fuel_stock_after_purchase ON public.fuel_purchases;
CREATE TRIGGER trigger_update_fuel_stock_after_purchase
  AFTER INSERT ON public.fuel_purchases
  FOR EACH ROW EXECUTE FUNCTION update_fuel_stock_after_purchase();

DROP TRIGGER IF EXISTS trigger_restore_fuel_stock_after_sale_delete ON public.fuel_sales;
CREATE TRIGGER trigger_restore_fuel_stock_after_sale_delete
  AFTER DELETE ON public.fuel_sales
  FOR EACH ROW EXECUTE FUNCTION restore_fuel_stock_after_sale_delete();

DROP TRIGGER IF EXISTS trigger_reduce_fuel_stock_after_purchase_delete ON public.fuel_purchases;
CREATE TRIGGER trigger_reduce_fuel_stock_after_purchase_delete
  AFTER DELETE ON public.fuel_purchases
  FOR EACH ROW EXECUTE FUNCTION reduce_fuel_stock_after_purchase_delete();
