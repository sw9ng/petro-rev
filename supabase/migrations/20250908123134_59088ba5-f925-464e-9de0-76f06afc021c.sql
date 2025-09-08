-- Create incoming_invoices table for storing invoices received from Uyumsoft
CREATE TABLE public.incoming_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  uyumsoft_invoice_id TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  invoice_type TEXT NOT NULL, -- 'e-invoice' or 'e-archive'
  sender_tax_number TEXT,
  sender_title TEXT,
  sender_address TEXT,
  invoice_date DATE NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'TRY',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  xml_content TEXT,
  pdf_path TEXT,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.incoming_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for incoming invoices
CREATE POLICY "Users can manage incoming invoices for their companies" 
ON public.incoming_invoices 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM companies 
  WHERE companies.id = incoming_invoices.company_id 
  AND companies.owner_id = auth.uid()
));

-- Create index for better performance
CREATE INDEX idx_incoming_invoices_company_id ON public.incoming_invoices(company_id);
CREATE INDEX idx_incoming_invoices_status ON public.incoming_invoices(status);
CREATE INDEX idx_incoming_invoices_invoice_date ON public.incoming_invoices(invoice_date);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_incoming_invoices_updated_at
BEFORE UPDATE ON public.incoming_invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();