
-- Profiles tablosuna Petronet email ve şifre kolonları ekleme
ALTER TABLE public.profiles 
ADD COLUMN petronet_email TEXT,
ADD COLUMN petronet_password TEXT;

-- Petronet otomatik senkronizasyon ayarları için kolon ekleme
ALTER TABLE public.profiles 
ADD COLUMN petronet_auto_sync BOOLEAN DEFAULT false,
ADD COLUMN last_sync_time TIMESTAMP WITH TIME ZONE;

-- Dosya metadata'sı için tablo oluşturma
CREATE TABLE public.petronet_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  file_path TEXT NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, file_hash)
);

-- RLS politikaları
ALTER TABLE public.petronet_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own Petronet files" ON public.petronet_files
  FOR ALL USING (auth.uid() = user_id);
