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

    // Prepare Uyumsoft API request - Using correct SOAP API endpoint  
    const integrationBaseUrl = uyumsoftAccount.test_mode 
      ? 'https://efatura-test.uyumsoft.com.tr/Services/Integration'
      : 'https://edonusumapi.uyum.com.tr/Services/Integration';

    console.log('Using Uyumsoft endpoint:', integrationBaseUrl);

    // Prepare date range
    const fromDate = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = dateTo || new Date().toISOString().split('T')[0];

    // Prepare SOAP envelope for GetInboxInvoiceList with WS-Security
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <Security xmlns="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <UsernameToken>
        <Username>${uyumsoftAccount.username}</Username>
        <Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${uyumsoftAccount.password_encrypted}</Password>
      </UsernameToken>
    </Security>
  </soap:Header>
  <soap:Body>
    <GetInboxInvoiceList xmlns="http://tempuri.org/">
      <invoiceSearchKey>
        <VKN_TCKN></VKN_TCKN>
        <UUID></UUID>
        <FROM_DATE>${fromDate}</FROM_DATE>
        <TO_DATE>${toDate}</TO_DATE>
        <FROM_DATE_SPECIFIED>true</FROM_DATE_SPECIFIED>
        <TO_DATE_SPECIFIED>true</TO_DATE_SPECIFIED>
        <READ_INCLUDED>true</READ_INCLUDED>
        <DIRECTION>IN</DIRECTION>
        <INVOICE_TYPE_CODE>SATIS</INVOICE_TYPE_CODE>
      </invoiceSearchKey>
    </GetInboxInvoiceList>
  </soap:Body>
</soap:Envelope>`;

    console.log('Fetching incoming invoices from Uyumsoft...');
    
    // Add timeout to the request to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      // Fetch invoices using SOAP
      const invoiceResponse = await fetch(integrationBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/IIntegration/GetInboxInvoiceList'
        },
        body: soapEnvelope,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      console.log('Invoice response status:', invoiceResponse.status);
      const responseText = await invoiceResponse.text();
      console.log('Invoice response:', responseText.substring(0, 500));

      if (!invoiceResponse.ok) {
        console.error('Failed to fetch invoices:', invoiceResponse.status, responseText);
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Fatura listesi alınamadı: ${invoiceResponse.status}` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

    // Parse SOAP response to extract invoice list
    const invoiceList = [];
    
    // Simple XML parsing for SOAP response - look for INVOICE elements
    const invoiceMatches = responseText.match(/<INVOICE.*?<\/INVOICE>/gs);
    
    if (invoiceMatches) {
      for (const invoiceXml of invoiceMatches) {
        try {
          // Extract basic invoice data from XML
          const uuid = invoiceXml.match(/<UUID>(.*?)<\/UUID>/)?.[1] || '';
          const invoiceId = invoiceXml.match(/<ID>(.*?)<\/ID>/)?.[1] || '';
          const profileId = invoiceXml.match(/<PROFILE_ID>(.*?)<\/PROFILE_ID>/)?.[1] || '';
          const typeCode = invoiceXml.match(/<TYPE_CODE>(.*?)<\/TYPE_CODE>/)?.[1] || '';
          const direction = invoiceXml.match(/<DIRECTION>(.*?)<\/DIRECTION>/)?.[1] || '';
          const status = invoiceXml.match(/<STATUS>(.*?)<\/STATUS>/)?.[1] || '';
          const statusDescription = invoiceXml.match(/<STATUS_DESCRIPTION>(.*?)<\/STATUS_DESCRIPTION>/)?.[1] || '';
          const issueDate = invoiceXml.match(/<ISSUE_DATE>(.*?)<\/ISSUE_DATE>/)?.[1] || '';
          const senderIdentifier = invoiceXml.match(/<SENDER_IDENTIFIER>(.*?)<\/SENDER_IDENTIFIER>/)?.[1] || '';
          const senderAlias = invoiceXml.match(/<SENDER_ALIAS>(.*?)<\/SENDER_ALIAS>/)?.[1] || '';
          const senderTitle = invoiceXml.match(/<SENDER_TITLE>(.*?)<\/SENDER_TITLE>/)?.[1] || '';
          const receiverIdentifier = invoiceXml.match(/<RECEIVER_IDENTIFIER>(.*?)<\/RECEIVER_IDENTIFIER>/)?.[1] || '';
          
          if (uuid) {
            invoiceList.push({
              company_id: companyId,
              uyumsoft_invoice_id: uuid,
              invoice_number: invoiceId,
              invoice_type: direction === 'IN' ? 'gelen-fatura' : 'giden-fatura',
              sender_tax_number: senderIdentifier,
              sender_title: senderTitle || senderAlias,
              sender_address: '',
              invoice_date: issueDate,
              total_amount: 0, // Will be updated when we get detailed invoice
              tax_amount: 0,
              grand_total: 0,
              currency_code: 'TRY',
              xml_content: invoiceXml,
              received_at: new Date().toISOString(),
              status: statusDescription || status,
              profile_id: profileId,
              type_code: typeCode
            });
          }
        } catch (parseError) {
          console.error('Error parsing invoice XML:', parseError);
        }
      }
    }

    console.log(`Found ${invoiceList.length} invoices`);

    // Store new invoices (upsert to avoid duplicates)
    let savedCount = 0;
    for (const invoice of invoiceList) {
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
      totalFetched: invoiceList.length,
      savedCount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('Request timeout after 30 seconds');
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Uyumsoft API isteği zaman aşımına uğradı' 
        }), {
          status: 408,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw fetchError;
    }

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
})