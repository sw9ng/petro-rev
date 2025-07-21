
-- Çekler tablosuna eksik kolonları ekle
ALTER TABLE public.checks 
ADD COLUMN IF NOT EXISTS issue_date DATE,
ADD COLUMN IF NOT EXISTS given_company TEXT;
