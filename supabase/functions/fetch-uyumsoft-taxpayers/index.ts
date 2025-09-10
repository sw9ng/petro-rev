import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Uyumsoft API endpoints
const UYUMSOFT_API_TEST = 'https://efatura-test.uyumsoft.com.tr/Services/Integration'
const UYUMSOFT_API_LIVE = 'https://edonusumapi.uyum.com.tr/Services/Integration'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { companyId } = await req.json()
    console.log('Fetching Uyumsoft taxpayers for company:', companyId)

    // Get Uyumsoft credentials for the company
    const { data: uyumsoftAccount, error: credError } = await supabaseClient
      .from('uyumsoft_accounts')
      .select('username, password_encrypted, test_mode')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single()

    if (credError || !uyumsoftAccount) {
      throw new Error('Uyumsoft hesap bilgileri bulunamadı')
    }

    console.log('Found Uyumsoft account, test mode:', uyumsoftAccount.test_mode)

    // Prepare Uyumsoft API request
    const apiBaseUrl = uyumsoftAccount.test_mode ? UYUMSOFT_API_TEST : UYUMSOFT_API_LIVE
    
    // Create request payload for taxpayer list
    const taxpayerPayload = {
      username: uyumsoftAccount.username,
      password: uyumsoftAccount.password_encrypted,
      action: 'getTaxpayers'
    }

    const uyumsoftEndpoint = `${apiBaseUrl}/taxpayers/list`

    console.log('Sending request to Uyumsoft:', uyumsoftEndpoint)

    // Create SOAP envelope for getting taxpayers
    const soapBody = `
      <tem:GetCustomers>
        <tem:userName>${uyumsoftAccount.username}</tem:userName>
        <tem:password>${uyumsoftAccount.password_encrypted}</tem:password>
      </tem:GetCustomers>
    `;

    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>${uyumsoftAccount.username}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${uyumsoftAccount.password_encrypted}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soap:Header>
  <soap:Body>
    ${soapBody}
  </soap:Body>
</soap:Envelope>`;

    try {
      const uyumsoftResponse = await fetch(apiBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/IIntegration/GetCustomers',
          'Accept': 'text/xml'
        },
        body: soapEnvelope
      });

      if (!uyumsoftResponse.ok) {
        console.error('Uyumsoft API error:', uyumsoftResponse.status)
        throw new Error(`Uyumsoft API hatası: ${uyumsoftResponse.status}`)
      }

      const responseText = await uyumsoftResponse.text()
      console.log('Uyumsoft response received:', responseText.substring(0, 500) + '...')

      // Parse SOAP response
      let taxpayers = []
      
      // Check for SOAP fault
      if (responseText.includes('<soap:Fault>') || responseText.includes('soap:Fault')) {
        const faultMatch = responseText.match(/<faultstring[^>]*>(.*?)<\/faultstring>/i)
        const faultString = faultMatch ? faultMatch[1] : 'SOAP Fault occurred'
        throw new Error(`Uyumsoft SOAP hatası: ${faultString}`)
      }

      // Extract customer data from response
      if (responseText.includes('GetCustomersResponse')) {
        // Parse XML response to extract taxpayer information
        // For now, we'll use a simple regex approach
        const customerMatches = responseText.match(/<Customer[^>]*>[\s\S]*?<\/Customer>/gi) || []
        
        taxpayers = customerMatches.map(customerXml => {
          const taxNumberMatch = customerXml.match(/<TaxNumber[^>]*>(.*?)<\/TaxNumber>/i)
          const titleMatch = customerXml.match(/<Title[^>]*>(.*?)<\/Title>/i)
          const addressMatch = customerXml.match(/<Address[^>]*>(.*?)<\/Address>/i)
          const emailMatch = customerXml.match(/<Email[^>]*>(.*?)<\/Email>/i)
          const phoneMatch = customerXml.match(/<Phone[^>]*>(.*?)<\/Phone>/i)
          const eInvoiceMatch = customerXml.match(/<EInvoiceEnabled[^>]*>(.*?)<\/EInvoiceEnabled>/i)
          
          return {
            tax_number: taxNumberMatch ? taxNumberMatch[1] : '',
            company_title: titleMatch ? titleMatch[1] : '',
            address: addressMatch ? addressMatch[1] : '',
            email: emailMatch ? emailMatch[1] : '',
            phone: phoneMatch ? phoneMatch[1] : '',
            is_einvoice_enabled: eInvoiceMatch ? eInvoiceMatch[1].toLowerCase() === 'true' : false,
            profile_id: eInvoiceMatch && eInvoiceMatch[1].toLowerCase() === 'true' ? 'TICARIFATURA' : 'TEMEL'
          }
        }).filter(taxpayer => taxpayer.tax_number) // Filter out empty results

        console.log('Parsed taxpayers from Uyumsoft:', taxpayers.length)
      }

      // If no taxpayers found or API call failed, return empty array instead of mock data
      if (taxpayers.length === 0) {
        console.log('No taxpayers found in Uyumsoft response')
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: taxpayers,
          message: 'E-Fatura mükellefleri başarıyla alındı'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )

    } catch (apiError) {
      console.error('Uyumsoft API call failed:', apiError)
      
      // Return empty array if API call fails
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: [],
          message: `Uyumsoft API bağlantı hatası: ${apiError.message}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

  } catch (error) {
    console.error('Error fetching taxpayers from Uyumsoft:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Beklenmeyen hata oluştu'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})