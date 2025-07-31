-- First, let's check if we need to update the profiles table for premium functionality
-- Add premium limits and upgrade the profiles table if needed

-- Update profiles table to support freemium model
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Update the is_user_premium function to check expiration
CREATE OR REPLACE FUNCTION public.is_user_premium(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT COALESCE(
    (SELECT is_premium 
     FROM public.profiles 
     WHERE id = user_id 
     AND (premium_expires_at IS NULL OR premium_expires_at > NOW())), 
    false
  );
$function$;