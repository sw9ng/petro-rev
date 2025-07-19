
-- Yakıt stoku tablosu (mevcut stok durumu)
CREATE TABLE public.fuel_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('MOTORİN', 'LPG', 'BENZİN', 'MOTORİN(DİĞER)')),
  current_stock NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(station_id, fuel_type)
);

-- Yakıt alımları tablosu (stok girişleri)
CREATE TABLE public.fuel_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('MOTORİN', 'LPG', 'BENZİN', 'MOTORİN(DİĞER)')),
  liters NUMERIC NOT NULL,
  purchase_price_per_liter NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  supplier TEXT,
  invoice_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS politikaları - Fuel Stock
ALTER TABLE public.fuel_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their station fuel stock" 
  ON public.fuel_stock 
  FOR SELECT 
  USING (station_id = auth.uid());

CREATE POLICY "Users can create their station fuel stock" 
  ON public.fuel_stock 
  FOR INSERT 
  WITH CHECK (station_id = auth.uid());

CREATE POLICY "Users can update their station fuel stock" 
  ON public.fuel_stock 
  FOR UPDATE 
  USING (station_id = auth.uid());

CREATE POLICY "Users can delete their station fuel stock" 
  ON public.fuel_stock 
  FOR DELETE 
  USING (station_id = auth.uid());

-- RLS politikaları - Fuel Purchases
ALTER TABLE public.fuel_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their station fuel purchases" 
  ON public.fuel_purchases 
  FOR SELECT 
  USING (station_id = auth.uid());

CREATE POLICY "Users can create their station fuel purchases" 
  ON public.fuel_purchases 
  FOR INSERT 
  WITH CHECK (station_id = auth.uid());

CREATE POLICY "Users can update their station fuel purchases" 
  ON public.fuel_purchases 
  FOR UPDATE 
  USING (station_id = auth.uid());

CREATE POLICY "Users can delete their station fuel purchases" 
  ON public.fuel_purchases 
  FOR DELETE 
  USING (station_id = auth.uid());

-- Stok güncelleme fonksiyonu (satış sonrası stok azaltma)
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

-- Stok güncelleme fonksiyonu (alım sonrası stok artırma)
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

-- Triggerlar
CREATE TRIGGER fuel_sale_stock_update
  AFTER INSERT ON public.fuel_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_fuel_stock_after_sale();

CREATE TRIGGER fuel_purchase_stock_update
  AFTER INSERT ON public.fuel_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_fuel_stock_after_purchase();

-- Satış silme sonrası stok geri ekleme
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

CREATE TRIGGER fuel_sale_stock_restore
  AFTER DELETE ON public.fuel_sales
  FOR EACH ROW
  EXECUTE FUNCTION restore_fuel_stock_after_sale_delete();

-- Alım silme sonrası stok azaltma
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

CREATE TRIGGER fuel_purchase_stock_reduce
  AFTER DELETE ON public.fuel_purchases
  FOR EACH ROW
  EXECUTE FUNCTION reduce_fuel_stock_after_purchase_delete();
