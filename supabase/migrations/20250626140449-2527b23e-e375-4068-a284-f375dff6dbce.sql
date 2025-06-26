
-- Create shift_bank_details table to store bank breakdown for card sales
CREATE TABLE public.shift_bank_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster queries by shift_id
CREATE INDEX idx_shift_bank_details_shift_id ON public.shift_bank_details(shift_id);
