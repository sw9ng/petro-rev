
-- Çek yönetimi için tablolar oluştur
CREATE TABLE public.checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  check_type TEXT NOT NULL CHECK (check_type IN ('payable', 'receivable')),
  amount NUMERIC NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  description TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  bank_name TEXT,
  check_number TEXT,
  drawer_name TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS politikaları
ALTER TABLE public.checks ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi şirketlerinin çeklerini görebilir
CREATE POLICY "Users can view checks for their companies" 
  ON public.checks 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = checks.company_id 
    AND companies.owner_id = auth.uid()
  ));

-- Kullanıcılar kendi şirketleri için çek oluşturabilir
CREATE POLICY "Users can create checks for their companies" 
  ON public.checks 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = checks.company_id 
    AND companies.owner_id = auth.uid()
  ));

-- Kullanıcılar kendi şirketlerinin çeklerini güncelleyebilir
CREATE POLICY "Users can update checks for their companies" 
  ON public.checks 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = checks.company_id 
    AND companies.owner_id = auth.uid()
  ));

-- Kullanıcılar kendi şirketlerinin çeklerini silebilir
CREATE POLICY "Users can delete checks for their companies" 
  ON public.checks 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = checks.company_id 
    AND companies.owner_id = auth.uid()
  ));
