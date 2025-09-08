-- Create tankers table
CREATE TABLE public.tankers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID NOT NULL,
  name TEXT NOT NULL,
  capacity NUMERIC NOT NULL DEFAULT 0,
  current_fuel_level NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tanker_transactions table
CREATE TABLE public.tanker_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tanker_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('incoming', 'outgoing')),
  amount NUMERIC NOT NULL DEFAULT 0,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tankers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tanker_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for tankers
CREATE POLICY "Users can manage their station tankers" 
ON public.tankers 
FOR ALL 
USING (station_id = auth.uid());

-- Create policies for tanker_transactions
CREATE POLICY "Users can manage transactions for their tankers" 
ON public.tanker_transactions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.tankers 
  WHERE tankers.id = tanker_transactions.tanker_id 
  AND tankers.station_id = auth.uid()
));

-- Create function to update tanker fuel level after transaction
CREATE OR REPLACE FUNCTION public.update_tanker_fuel_level()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update fuel level based on transaction type
    IF NEW.transaction_type = 'incoming' THEN
      UPDATE public.tankers 
      SET current_fuel_level = current_fuel_level + NEW.amount,
          updated_at = now()
      WHERE id = NEW.tanker_id;
    ELSIF NEW.transaction_type = 'outgoing' THEN
      UPDATE public.tankers 
      SET current_fuel_level = GREATEST(current_fuel_level - NEW.amount, 0),
          updated_at = now()
      WHERE id = NEW.tanker_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Reverse the transaction
    IF OLD.transaction_type = 'incoming' THEN
      UPDATE public.tankers 
      SET current_fuel_level = GREATEST(current_fuel_level - OLD.amount, 0),
          updated_at = now()
      WHERE id = OLD.tanker_id;
    ELSIF OLD.transaction_type = 'outgoing' THEN
      UPDATE public.tankers 
      SET current_fuel_level = current_fuel_level + OLD.amount,
          updated_at = now()
      WHERE id = OLD.tanker_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic fuel level updates
CREATE TRIGGER trigger_update_tanker_fuel_level
  AFTER INSERT OR DELETE ON public.tanker_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tanker_fuel_level();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_tankers_updated_at
  BEFORE UPDATE ON public.tankers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tanker_transactions_updated_at
  BEFORE UPDATE ON public.tanker_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();