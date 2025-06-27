
-- Add loyalty_card column to the shifts table
ALTER TABLE public.shifts 
ADD COLUMN loyalty_card NUMERIC DEFAULT 0;
