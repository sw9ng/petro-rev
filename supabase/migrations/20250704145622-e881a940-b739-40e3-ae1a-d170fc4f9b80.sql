
-- Admin paneli için özel politika ekle
-- Önce mevcut politikaları kontrol edelim ve admin yetkisi ekleyelim

-- Admin kullanıcıları için profiles tablosunda tüm kayıtları görme yetkisi
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT 
  USING (
    -- Eğer kullanıcı admin ise (bu durumda sizin user_id'niz)
    auth.uid() = '3970497f-f994-4cdc-9e56-a319a84ac04b'::uuid
    OR 
    -- Veya kullanıcı kendi profilini görüyorsa
    auth.uid() = id
  );

-- Admin kullanıcıları için profiles tablosunda tüm kayıtları güncelleme yetkisi  
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE 
  USING (
    auth.uid() = '3970497f-f994-4cdc-9e56-a319a84ac04b'::uuid
    OR 
    auth.uid() = id
  );

-- Mevcut politikaları kaldır (çünkü yeni politikalar bunları kapsıyor)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
