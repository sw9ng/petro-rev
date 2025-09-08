-- Fix the function search path security warnings by setting search_path
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
$$ LANGUAGE plpgsql SET search_path = public;