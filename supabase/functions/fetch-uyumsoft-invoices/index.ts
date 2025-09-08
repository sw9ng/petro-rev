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

    // Prepare Uyumsoft API request
    const uyumsoftBaseUrl = uyumsoftAccount.test_mode 
      ? 'https://test.uyumsoft.com.tr/api' 
      : 'https://api.uyumsoft.com.tr/api';

    const authPayload = {
      username: uyumsoftAccount.username,
      password: uyumsoftAccount.password_encrypted // This should be decrypted in production
    };

    // Authenticate with Uyumsoft
    console.log('Authenticating with Uyumsoft...');
    const authResponse = await fetch(`${uyumsoftBaseUrl}/auth/login`, {
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
    const accessToken = authData.access_token;

    // Fetch incoming e-invoices
    console.log('Fetching incoming e-invoices...');
    const eInvoiceParams = new URLSearchParams({
      page: '1',
      limit: '100',
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    });

    const eInvoiceResponse = await fetch(`${uyumsoftBaseUrl}/einvoice/incoming?${eInvoiceParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Fetch incoming e-archive invoices
    console.log('Fetching incoming e-archive invoices...');
    const eArchiveResponse = await fetch(`${uyumsoftBaseUrl}/earchive/incoming?${eInvoiceParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const eInvoices = eInvoiceResponse.ok ? await eInvoiceResponse.json() : { data: [] };
    const eArchiveInvoices = eArchiveResponse.ok ? await eArchiveResponse.json() : { data: [] };

    console.log(`Found ${eInvoices.data?.length || 0} e-invoices and ${eArchiveInvoices.data?.length || 0} e-archive invoices`);

    // Process and store incoming invoices
    const allIncomingInvoices = [
      ...(eInvoices.data || []).map((invoice: any) => ({
        company_id: companyId,
        uyumsoft_invoice_id: invoice.id || invoice.uuid,
        invoice_number: invoice.invoice_number || invoice.invoiceNumber,
        invoice_type: 'e-invoice',
        sender_tax_number: invoice.sender_tax_number || invoice.senderTaxNumber,
        sender_title: invoice.sender_title || invoice.senderTitle,
        sender_address: invoice.sender_address || invoice.senderAddress,
        invoice_date: invoice.invoice_date || invoice.invoiceDate,
        total_amount: parseFloat(invoice.total_amount || invoice.totalAmount || 0),
        tax_amount: parseFloat(invoice.tax_amount || invoice.taxAmount || 0),
        grand_total: parseFloat(invoice.grand_total || invoice.grandTotal || 0),
        currency_code: invoice.currency_code || invoice.currencyCode || 'TRY',
        xml_content: invoice.xml_content || invoice.xmlContent,
        received_at: new Date().toISOString(),
      })),
      ...(eArchiveInvoices.data || []).map((invoice: any) => ({
        company_id: companyId,
        uyumsoft_invoice_id: invoice.id || invoice.uuid,
        invoice_number: invoice.invoice_number || invoice.invoiceNumber,
        invoice_type: 'e-archive',
        sender_tax_number: invoice.sender_tax_number || invoice.senderTaxNumber,
        sender_title: invoice.sender_title || invoice.senderTitle,
        sender_address: invoice.sender_address || invoice.senderAddress,
        invoice_date: invoice.invoice_date || invoice.invoiceDate,
        total_amount: parseFloat(invoice.total_amount || invoice.totalAmount || 0),
        tax_amount: parseFloat(invoice.tax_amount || invoice.taxAmount || 0),
        grand_total: parseFloat(invoice.grand_total || invoice.grandTotal || 0),
        currency_code: invoice.currency_code || invoice.currencyCode || 'TRY',
        xml_content: invoice.xml_content || invoice.xmlContent,
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