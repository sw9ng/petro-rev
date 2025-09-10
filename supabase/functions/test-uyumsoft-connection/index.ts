import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    console.log('Testing Uyumsoft connection for company:', companyId)

    // Get Uyumsoft credentials
    const { data: uyumsoftAccount, error: credError } = await supabaseClient
      .from('uyumsoft_accounts')
      .select('username, password_encrypted, test_mode')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single()

    if (credError || !uyumsoftAccount) {
      throw new Error('Uyumsoft hesap bilgileri bulunamadı')
    }

    // Test basic connection to Uyumsoft WSDL
    const apiBaseUrl = uyumsoftAccount.test_mode 
      ? 'https://efatura-test.uyumsoft.com.tr/Services/Integration'
      : 'https://edonusumapi.uyum.com.tr/Services/Integration'

    console.log('Testing connection to:', apiBaseUrl)

    // Try to fetch WSDL
    const wsdlResponse = await fetch(`${apiBaseUrl}?wsdl`, {
      method: 'GET',
      headers: {
        'Accept': 'text/xml'
      }
    })

    const connectionTest = {
      wsdl_accessible: wsdlResponse.ok,
      wsdl_status: wsdlResponse.status,
      api_endpoint: apiBaseUrl,
      test_mode: uyumsoftAccount.test_mode,
      username: uyumsoftAccount.username
    }

    if (wsdlResponse.ok) {
      const wsdlContent = await wsdlResponse.text()
      connectionTest.wsdl_size = wsdlContent.length
      connectionTest.has_soap_service = wsdlContent.includes('soap:binding')
      connectionTest.has_getcustomers = wsdlContent.includes('GetCustomers')
      connectionTest.has_sendinvoice = wsdlContent.includes('SendInvoice')
    }

    console.log('Connection test results:', connectionTest)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: connectionTest,
        message: 'Uyumsoft bağlantı testi tamamlandı'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error testing Uyumsoft connection:', error)
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