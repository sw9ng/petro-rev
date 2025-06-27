
-- Add bank_transfer_description column to the shifts table
ALTER TABLE public.shifts 
ADD COLUMN bank_transfer_description TEXT DEFAULT '';
