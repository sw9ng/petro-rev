
-- Profiles tablosuna premium durumu alanları ekle
ALTER TABLE public.profiles 
ADD COLUMN is_premium BOOLEAN DEFAULT false,
ADD COLUMN premium_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Mevcut tüm kullanıcıları premium yap (geçiş döneminde)
UPDATE public.profiles 
SET is_premium = true, 
    premium_expires_at = '2025-12-31 23:59:59+00:00';

-- Premium durumu kontrol fonksiyonu
CREATE OR REPLACE FUNCTION public.is_user_premium(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_premium 
     FROM public.profiles 
     WHERE id = user_id 
     AND (premium_expires_at IS NULL OR premium_expires_at > NOW())), 
    false
  );
$$;
