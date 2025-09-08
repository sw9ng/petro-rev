import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FetchInvoicesRequest {
  companyId: string;
  dateFrom?: string;
  dateTo?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { companyId, dateFrom, dateTo } = await req.json() as FetchInvoicesRequest;

    console.log('Fetching Uyumsoft invoices for company:', companyId);

    // Get Uyumsoft account credentials
    const { data: uyumsoftAccount, error: accountError } = await supabase
      .from('uyumsoft_accounts')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle();

    if (accountError || !uyumsoftAccount) {
      console.error('Uyumsoft account error:', accountError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Uyumsoft hesabı bulunamadı' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Found Uyumsoft account, test mode:', uyumsoftAccount.test_mode);

    // For now, let's create some test data instead of calling Uyumsoft API
    // This will help us verify the data flow is working
    const testInvoices = [
      {
        company_id: companyId,
        uyumsoft_invoice_id: 'TEST-' + Math.random().toString(36).substr(2, 9),
        invoice_number: 'TEST2024000001',
        invoice_type: 'gelen-fatura',
        sender_tax_number: '1234567890',
        sender_title: 'Test Gönderici Firma',
        sender_address: 'Test Adres',
        invoice_date: new Date().toISOString().split('T')[0],
        total_amount: 1000,
        tax_amount: 180,
        grand_total: 1180,
        currency_code: 'TRY',
        xml_content: '<test>XML içeriği</test>',
        received_at: new Date().toISOString(),
        status: 'Beklemede',
        profile_id: 'TICARIFATURA',
        type_code: 'SATIS'
      }
    ];

    console.log(`Creating ${testInvoices.length} test invoices`);

    // Store test invoices
    let savedCount = 0;
    for (const invoice of testInvoices) {
      const { error: upsertError } = await supabase
        .from('incoming_invoices')
        .upsert(invoice, {
          onConflict: 'company_id,uyumsoft_invoice_id',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('Error saving invoice:', upsertError);
      } else {
        savedCount++;
        console.log('Saved invoice:', invoice.invoice_number);
      }
    }

    console.log(`Successfully saved ${savedCount} invoices`);

    return new Response(JSON.stringify({
      success: true,
      message: `${savedCount} test fatura başarıyla oluşturuldu`,
      totalFetched: testInvoices.length,
      savedCount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-uyumsoft-invoices function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Bilinmeyen hata'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})