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

export default async function handler(req: Request) {
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

    // Prepare Uyumsoft API request - Using Uyumsoft official endpoints
    const integrationBaseUrl = uyumsoftAccount.test_mode
      ? 'https://test.uyumsoft.com.tr/Services/Integration'
      : 'https://api.uyumsoft.com.tr/Services/Integration';

    const authPayload = {
      kullaniciadi: uyumsoftAccount.username,
      sifre: uyumsoftAccount.password_encrypted // This should be decrypted in production
    };

    // Authenticate with Uyumsoft - Updated endpoint
    console.log('Authenticating with Uyumsoft...');
    const authResponse = await fetch(`${integrationBaseUrl}/Login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(authPayload),
    });

    if (!authResponse.ok) {
      const authErrorText = await authResponse.text();
      console.error('Uyumsoft auth failed:', authErrorText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Uyumsoft kimlik doğrulaması başarısız' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authData = await authResponse.json();
    const sessionId = authData.SessionId || authData.sessionId;

    if (!sessionId) {
      console.error('No session ID received from authentication');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Kimlik doğrulaması başarısız - Session ID alınamadı' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch incoming e-invoices using correct Uyumsoft method
    console.log('Fetching incoming e-invoices...');
    const eInvoicePayload = {
      SessionId: sessionId,
      baslangicTarihi: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days if no date
      bitisTarihi: dateTo || new Date().toISOString().split('T')[0]
    };

    const eInvoiceResponse = await fetch(`${integrationBaseUrl}/GetIncomingInvoiceList`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(eInvoicePayload),
    });

    // Fetch incoming e-archive invoices
    console.log('Fetching incoming e-archive invoices...');
    const eArchiveResponse = await fetch(`${integrationBaseUrl}/GetIncomingArchiveInvoiceList`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(eInvoicePayload),
    });

    const eInvoices = eInvoiceResponse.ok ? await eInvoiceResponse.json() : { InvoiceList: [] };
    const eArchiveInvoices = eArchiveResponse.ok ? await eArchiveResponse.json() : { InvoiceList: [] };

    console.log(`Found ${eInvoices.InvoiceList?.length || 0} e-invoices and ${eArchiveInvoices.InvoiceList?.length || 0} e-archive invoices`);

    // Process and store incoming invoices - Updated field mapping for Uyumsoft response
    const allIncomingInvoices = [
      ...(eInvoices.InvoiceList || []).map((invoice: any) => ({
        company_id: companyId,
        uyumsoft_invoice_id: invoice.InvoiceId || invoice.UUID,
        invoice_number: invoice.InvoiceNumber || invoice.InvoiceSerialNumber,
        invoice_type: 'e-invoice',
        sender_tax_number: invoice.SenderVkn || invoice.SenderTaxNumber,
        sender_title: invoice.SenderTitle || invoice.SenderName,
        sender_address: invoice.SenderAddress,
        invoice_date: invoice.InvoiceDate || invoice.IssueDate,
        total_amount: parseFloat(invoice.TotalAmount || invoice.LineExtensionAmount || 0),
        tax_amount: parseFloat(invoice.TaxAmount || invoice.TaxInclusiveAmount || 0),
        grand_total: parseFloat(invoice.GrandTotal || invoice.PayableAmount || 0),
        currency_code: invoice.Currency || invoice.DocumentCurrencyCode || 'TRY',
        xml_content: invoice.InvoiceContent || invoice.XmlContent,
        received_at: new Date().toISOString(),
      })),
      ...(eArchiveInvoices.InvoiceList || []).map((invoice: any) => ({
        company_id: companyId,
        uyumsoft_invoice_id: invoice.InvoiceId || invoice.UUID,
        invoice_number: invoice.InvoiceNumber || invoice.InvoiceSerialNumber,
        invoice_type: 'e-archive',
        sender_tax_number: invoice.SenderVkn || invoice.SenderTaxNumber,
        sender_title: invoice.SenderTitle || invoice.SenderName,
        sender_address: invoice.SenderAddress,
        invoice_date: invoice.InvoiceDate || invoice.IssueDate,
        total_amount: parseFloat(invoice.TotalAmount || invoice.LineExtensionAmount || 0),
        tax_amount: parseFloat(invoice.TaxAmount || invoice.TaxInclusiveAmount || 0),
        grand_total: parseFloat(invoice.GrandTotal || invoice.PayableAmount || 0),
        currency_code: invoice.Currency || invoice.DocumentCurrencyCode || 'TRY',
        xml_content: invoice.InvoiceContent || invoice.XmlContent,
        received_at: new Date().toISOString(),
      }))
    ];

    console.log(`Processing ${allIncomingInvoices.length} total incoming invoices`);

    // Store new invoices (upsert to avoid duplicates)
    let savedCount = 0;
    for (const invoice of allIncomingInvoices) {
      const { error: upsertError } = await supabase
        .from('incoming_invoices')
        .upsert(invoice, {
          onConflict: 'company_id,uyumsoft_invoice_id',
          ignoreDuplicates: true
        });

      if (upsertError) {
        console.error('Error saving invoice:', upsertError);
      } else {
        savedCount++;
      }
    }

    console.log(`Successfully saved ${savedCount} invoices`);

    return new Response(JSON.stringify({
      success: true,
      message: `${savedCount} fatura başarıyla alındı`,
      totalFetched: allIncomingInvoices.length,
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
}