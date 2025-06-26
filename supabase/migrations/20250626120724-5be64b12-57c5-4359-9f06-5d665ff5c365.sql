
-- Add veresiye column to shifts table
ALTER TABLE public.shifts 
ADD COLUMN veresiye DECIMAL(10,2) DEFAULT 0;
